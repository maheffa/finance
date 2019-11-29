import os
import time
import intrinio_sdk
from intrinio_sdk.rest import ApiException


def get_all_data(fetch, extract_list, extract_data, start_page=''):
    result = []
    next_page = start_page
    while next_page is not None:
        try:
            fetched = fetch(next_page)
            result += [{'date': res.date, 'value': extract_data(res)} for res in extract_list(fetched)]
            next_page = fetched.next_page
        except ApiException:
            print('Api Call failed. Sleeping 1 sec')
            time.sleep(1)
    result.sort(key=lambda res: res['date'])

    print('Total item fetched: ' + str(len(result)))
    return result


class Intrinio:
    def __init__(self, key='OmY3OTBiYTU5ODc2ZmQ3MmNhYmZhZmVkNTVmMjIxZjc3'):  # sandbox key
        intrinio_sdk.ApiClient().configuration.api_key['api_key'] = os.getenv('INTRINIO_KEY', key)
        self.security_api = intrinio_sdk.SecurityApi()
        self.company_api = intrinio_sdk.CompanyApi()
        self.historical_data_api = intrinio_sdk.HistoricalDataApi()

    def get_stock_prices(self, identifier, start_date, end_date):
        print('Fetching stock prices for ' + identifier + ', between ' + start_date + ' and ' + end_date)
        return get_all_data(
            lambda next_page: self.security_api.get_security_stock_prices(identifier, start_date=start_date,
                                                                          end_date=end_date, frequency='daily',
                                                                          next_page=next_page),
            lambda stock: stock.stock_prices,
            lambda stock: [stock.close, stock.open, stock.low, stock.high, stock.volume]
        )

    def get_data_by_tag(self, identifier, tag, start_date, end_date, map_value=None):
        print('Fetching ' + tag + ' for ' + identifier + ', between ' + start_date + ' and ' + end_date)
        result = get_all_data(
            lambda next_page: self.historical_data_api.get_historical_data(identifier, tag, start_date=start_date, end_date=end_date, frequency='daily', next_page=next_page),
            lambda h_d: h_d.historical_data,
            lambda data: data.value,
        )

        if map_value is None:
            return result

        return [{'date': res['date'], 'value': map_value(res['value'])} for res in result]
