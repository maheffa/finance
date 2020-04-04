import os
import time
import intrinio_sdk
from intrinio_sdk.rest import ApiException


def retry_on_fail_api_call(api_call, retry=3, sleep_time=1):
    n_call = 0
    while n_call < retry - 1:  # Only catch on the first retry - 1, If the last one fail, do not catch error
        try:
            result = api_call()
            return result
        except ApiException:
            print('[Intrinio] Api Call failed. Sleeping {} sec'.format(sleep_time))
            time.sleep(sleep_time)
            n_call += 1
    return api_call()


def get_all_data(fetch, extract_list, extract_data, start_page='', ignore_date=False, limit=None):
    """
    Fetch then aggregate and transform data
    :param fetch:  function to use to fetch the data. It should be able to receive next_page token
    :param extract_list: build actual data list from the fetched result
    :param extract_data: transform data from each element of the list
    :param start_page: initial value to be passed as 'next_page'
    :param ignore_date: recommended to be set to True if elements in extracted list does not contain a date
    :return:
    """
    result = []
    next_page = start_page

    while (next_page is not None) and (limit is None or len(result) < limit):
        fetched = retry_on_fail_api_call(lambda: fetch(next_page))
        if ignore_date:
            result += [extract_data(res) for res in extract_list(fetched)]
        else:
            result += [{'date': res.date, 'value': extract_data(res)} for res in extract_list(fetched)]
        next_page = fetched.next_page

    if not ignore_date:
        result.sort(key=lambda res: res['date'])

    print('Total item fetched: ' + str(len(result)))
    return result if limit is None else result[:limit]


# common_date is guaranteed to be found because:
# 1) it is a common, 2) date at current index is lower, 3) order is ascending by date
def _find_next_common_indexes(common_date, raw_stocks, raw_tag_data, stock_index, tag_data_index):
    while raw_stocks[stock_index]['date'] != common_date:
        stock_index += 1
    for i in range(len(tag_data_index)):
        while raw_tag_data[i][tag_data_index[i]]['date'] != common_date:
            tag_data_index[i] += 1

    return stock_index, tag_data_index


def fmt(date):
    return date.strftime('%Y-%m-%d')


class Intrinio:
    def __init__(self, key='OmY3OTBiYTU5ODc2ZmQ3MmNhYmZhZmVkNTVmMjIxZjc3'):  # sandbox key
        api_key = os.getenv('INTRINIO_KEY', key)
        print('[Intrinio] Using key: {}'.format(api_key))
        intrinio_sdk.ApiClient().configuration.api_key['api_key'] = api_key
        self.security_api = intrinio_sdk.SecurityApi()
        self.company_api = intrinio_sdk.CompanyApi()
        self.historical_data_api = intrinio_sdk.HistoricalDataApi()

    def get_stock_prices(self, identifier, start_date, end_date):
        print('[Intrinio] Fetching stock prices for ' + identifier + ', between ' + fmt(start_date) + ' and ' + fmt(end_date))
        return get_all_data(
            lambda next_page: self.security_api.get_security_stock_prices(identifier, start_date=fmt(start_date),
                                                                          end_date=fmt(end_date), frequency='daily',
                                                                          next_page=next_page),
            lambda stock: stock.stock_prices,
            lambda stock: [stock.close, stock.open, stock.low, stock.high, stock.volume]
        )

    def get_all_companies(self):
        print('[Intrinio] Fetching all companies')
        data = get_all_data(
            lambda next_page: self.company_api.get_all_companies(next_page=next_page),
            lambda response: response.companies,
            lambda c: (c.id, c.ticker, c.name),
            ignore_date=True
        )
        return [d for d in data if (d[0] is not None) and (d[1] is not None) and (d[2] is not None)]

    def get_extra_companies_info(self, company_ids):
        result = []
        n_companies = len(company_ids)

        print('[Intrinio] Got {} companies. Fetching extra info.'.format(n_companies))
        t = time.time()
        for company_id in company_ids:
            _s = self
            company = retry_on_fail_api_call(lambda: _s.company_api.get_company(company_id))
            result.append((company_id, company.sector, company.industry_category, company.industry_group,
                           company.stock_exchange))
            if (time.time() - t) > 10:
                print('[Intrinio] Fetched {} out of {}'.format(len(result), n_companies))
                t = time.time()

        return result

    def get_data_by_tag(self, identifier, tag, start_date, end_date, map_value=None):
        print('[Intrinio] Fetching ' + tag + ' for ' + identifier + ', between ' + fmt(start_date) + ' and ' + fmt(end_date))
        result = get_all_data(
            lambda next_page: self.historical_data_api.get_historical_data(identifier, tag, start_date=fmt(start_date),
                                                                           end_date=fmt(end_date), frequency='daily',
                                                                           next_page=next_page),
            lambda h_d: h_d.historical_data,
            lambda data: data.value,
        )

        if map_value is None:
            return result

        return [{'date': res['date'], 'value': map_value(res['value'])} for res in result]

    def get_company_news(self, identifier):
        print('Fetching news for ' + identifier)
        result = get_all_data(
            lambda next_page: self.company_api.get_company_news(identifier, next_page=next_page),
            lambda fetched: [{'value': new.title, 'date': new.publication_date.strftime('%Y-%m-%d')} for new in fetched.news],
            lambda data: data,
            ignore_date=True,
        )
        aggregated = {}
        for new in result:
            aggregated[new['date']] = aggregated.get(new['date'], '') + '\n' + new['value']

        return [{'value': new, 'date': date} for (date, new) in sorted(aggregated.items(), key=lambda agg: agg[0])]

    def fetch_and_merge(self, identifier, start_date, end_date, tags):
        raw_stocks = self.get_stock_prices(identifier, start_date, end_date)
        raw_tag_data = [self.get_data_by_tag(identifier, tag, start_date, end_date) for tag in tags]

        print('[Intrinio] Total:')
        print(str(len(raw_stocks)) + ' stocks')
        for i in range(len(tags)):
            print(str(len(raw_tag_data[i])) + ' ' + tags[i])

        date_sets = [set([st['date'] for st in raw_stocks])] + [set([hd['date'] for hd in d]) for d in raw_tag_data]
        common_dates = sorted(list(set.intersection(*date_sets)))
        merged = []

        print('[Intrinio] Common date with all data present: ' + str(len(common_dates)))
        print('[Intrinio] Merging ...')

        stock_index = 0
        tag_data_index = [0 for _ in tags]

        for date in common_dates:
            stock_index, tag_data_index = _find_next_common_indexes(date, raw_stocks, raw_tag_data,
                                                                    stock_index, tag_data_index)
            merged.append(raw_stocks[stock_index]['value'] + [raw_tag_data[i][tag_data_index[i]]['value'] for i in
                                                              range(len(tags))])

        print('[Intrinio] Merged')

        return merged
