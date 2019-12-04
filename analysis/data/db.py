from datetime import datetime, timedelta
from random import shuffle

from sqlalchemy.orm import Query
from sqlalchemy.sql.expression import bindparam

from data.meta import session
from data.model import TAG_COLUMNS, StockInfo, Company


def to_db_date(d):
    return d.strftime('%Y-%m-%d 00:00:00')


class DB:
    def __init__(self):
        self.session = session

    def _find_ids(self, identifier, dates):
        ids = [-1 for _ in dates]
        date_to_index = {to_db_date(date): index for (index, date) in enumerate(dates)}

        query: Query = self.session.query(StockInfo.id, StockInfo.date)\
            .filter(StockInfo.identifier == identifier)\
            .filter(StockInfo.date.in_(dates))

        for stock_info in query.all():
            if stock_info.date in date_to_index:
                ids[date_to_index[stock_info.date]] = stock_info.id

        return ids

    def insert_or_update_stocks(self, identifier, stock_objects):
        ids = self._find_ids(identifier, [stock_object['date'] for stock_object in stock_objects])

        self.session.bulk_update_mappings(
            StockInfo,
            [{'id': ids[i],
              'close': stock_object['value'][0],
              'open': stock_object['value'][1],
              'high': stock_object['value'][2],
              'low': stock_object['value'][3],
              'volume': stock_object['value'][4],
              } for (i, stock_object) in enumerate(stock_objects) if ids[i] != -1]
        )
        self.session.bulk_save_objects(
            [StockInfo.create_with_info(identifier, stock_object['date'], stock_object['value'])
             for (i, stock_object) in enumerate(stock_objects) if ids[i] == -1]
        )
        self.session.commit()

    def insert_or_update_tag(self, identifier, tag, data):
        ids = self._find_ids(identifier, [d['date'] for d in data])
        self.session.bulk_update_mappings(
            StockInfo,
            [{'id': ids[i], [tag]: d['value']} for (i, d) in enumerate(data) if ids[i] != -1]
        )
        self.session.bulk_insert_mappings(
            StockInfo,
            [{'identifier': identifier,
              'date': d['date'],
              [tag]: d['value'],
              } for (i, d) in enumerate(data) if ids[i] == -1]
        )
        self.session.commit()

    def populate_stocks(self, intrinio, identifier, start_date, end_date):
        self.insert_or_update_stocks(identifier, intrinio.get_stock_prices(identifier, start_date, end_date))

    def populate_tag(self, intrinio, identifier, tag, start_date, end_date, map_value=None):
        self.insert_or_update_tag(identifier, tag, intrinio.get_data_by_tag(identifier, tag, start_date, end_date, map_value=map_value))

    def populate_companies(self, intrinio):
        all_companies = intrinio.get_all_companies()
        query = session.query(Company.id).filter(Company.id.in_([c[0] for c in all_companies]))
        exists = set([s.id for s in query.all()])
        companies = [Company(c[0], c[1], c[2]) for c in all_companies if c[0] not in exists]
        self.session.bulk_save_objects(companies)
        self.session.commit()

    def populate_missing_randomly(self, intrinio, n_random=500):
        ids = [res.id for res in session.query(Company.id).filter(Company.sector.is_(None)).all()]
        shuffle(ids)
        print('Fetching {} companies'.format(n_random))
        companies_info = intrinio.get_extra_companies_info(ids[:n_random])
        print('Writing')
        self.session.bulk_update_mappings(
            Company,
            [{ 'id': i, 'sector': s, 'industry_category': i_c, 'industry_group': i_g, 'stock_exchange': s_e }
             for (i, s, i_c, i_g, s_e) in companies_info]
        )
        self.session.commit()

    def populate_db(self, intrinio, stock_identifiers, start_date='1990-01-01', end_date=None):
        if end_date is None:
            end_date = (datetime.now() - timedelta(1)).strftime('%Y-%m-%d')

        for identifier in stock_identifiers:
            self.populate_stocks(intrinio, identifier, start_date, end_date)
            for tag in TAG_COLUMNS:
                self.populate_tag(intrinio, identifier, tag, start_date, end_date)
