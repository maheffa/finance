import logging
import os
import datetime
from random import shuffle
from typing import List

from sqlalchemy.orm import Query

from data.meta import session
from data.model import TAG_COLUMNS, StockInfo, Company
from intrinio import Intrinio


def to_db_date(d):
    return d.strftime('%Y-%m-%d 00:00:00')


class DB:
    def __init__(self, intrinio_key=None):
        # use sandbox key if none provided and none found in env
        intrinio_key = os.getenv('intrinio_key', 'OmY3OTBiYTU5ODc2ZmQ3MmNhYmZhZmVkNTVmMjIxZjc3') if intrinio_key is None else intrinio_key
        self.session = session
        self.intrinio = Intrinio(key=intrinio_key)

    def _find_ids(self, identifier, dates):
        ids = [-1 for _ in dates]
        date_to_index = {to_db_date(date): index for (index, date) in enumerate(dates)}

        query: Query = self.session.query(StockInfo.id, StockInfo.date)\
            .filter(StockInfo.identifier == identifier)\
            .filter(StockInfo.date.in_(dates))

        for stock_info in query.all():
            if stock_info.date in date_to_index:
                ids[date_to_index[stock_info.date]] = stock_info.id

        logging.debug('Found {} existing rows with matching dates for {}'.format(len([_ for _ in ids if _ > -1]), identifier))
        return ids

    def _find_stock(self, identifier, dates):
        return [self.get_stock(identifier, date) for date in dates]

    def insert_or_update_stocks(self, identifier, stock_objects):
        stocks = self._find_stock(identifier, [stock_object['date'] for stock_object in stock_objects])
        for i in range(len(stocks)):
            stock_object = stock_objects[i]
            stock = stocks[i] if stocks[i] is not None else StockInfo(identifier, stock_object['date'])
            stock.close = stock_object['value'][0]
            stock.open = stock_object['value'][1]
            stock.high = stock_object['value'][2]
            stock.low = stock_object['value'][3]
            stock.volume = stock_object['value'][4]
            stocks[i] = stock
        self.session.bulk_save_objects(stocks)
        self.session.commit()

    def insert_or_update_tag(self, identifier, column, data):
        ids = self._find_ids(identifier, [d['date'] for d in data])
        self.session.bulk_update_mappings(
            StockInfo,
            [{'id': ids[i], [column]: d['value']} for (i, d) in enumerate(data) if ids[i] != -1]
        )
        self.session.bulk_insert_mappings(
            StockInfo,
            [{'identifier': identifier,
              'date': d['date'],
              [column]: d['value'],
              } for (i, d) in enumerate(data) if ids[i] == -1]
        )
        self.session.commit()

    def populate_stocks(self, identifier, start_date, end_date):
        logging.debug('Populating stocks from {} till {} for {}'.format(start_date, end_date, identifier))
        self.insert_or_update_stocks(identifier, self.intrinio.get_stock_prices(identifier, start_date, end_date))

    def populate_tag(self, identifier, tag, start_date, end_date, map_value=None):
        logging.debug('Populating tag {} from {} till {} for {}'.format(tag, start_date, end_date, identifier))
        self.insert_or_update_tag(identifier, tag, self.intrinio.get_data_by_tag(identifier, tag, start_date, end_date, map_value=map_value))

    def populate_companies(self):
        all_companies = self.intrinio.get_all_companies()
        query = session.query(Company.id).filter(Company.id.in_([c[0] for c in all_companies]))
        exists = set([s.id for s in query.all()])
        companies = [Company(c[0], c[1], c[2]) for c in all_companies if c[0] not in exists]
        self.session.bulk_save_objects(companies)
        self.session.commit()
        logging.info('[DB] Saved ' + str(len(companies)) + ' companies')

    def populate_missing_randomly(self, n_random=500):
        ids = [res.id for res in session.query(Company.id).filter(Company.sector.is_(None)).all()]
        shuffle(ids)
        companies_info = self.intrinio.get_extra_companies_info(ids[:n_random])
        self.session.bulk_update_mappings(
            Company,
            [{ 'id': i, 'sector': s, 'industry_category': i_c, 'industry_group': i_g, 'stock_exchange': s_e }
             for (i, s, i_c, i_g, s_e) in companies_info]
        )
        self.session.commit()
        logging.info('[DB] Populated  ' + str(len(companies_info)) + ' companies')

    def populate_db(self, stock_identifiers, start_date=datetime.date(2000, 1, 1), end_date=None):
        if end_date is None:
            end_date = datetime.date.today()

        for identifier in stock_identifiers:
            self.populate_stocks(identifier, start_date, end_date)
            for tag in TAG_COLUMNS:
                self.populate_tag(identifier, tag, start_date, end_date)

    def get_stock(self, identifier, date) -> StockInfo:
        return self.session \
            .query(StockInfo) \
            .filter_by(identifier=identifier, date=date) \
            .first()

    def get_stocks(self, identifier, start_date, end_date) -> List[StockInfo]:
        return self.session \
            .query(StockInfo) \
            .filter_by(identifier=identifier) \
            .filter(StockInfo.close.isnot(None)) \
            .filter(StockInfo.date.between(start_date, end_date)) \
            .order_by(StockInfo.date.asc()) \
            .all()

    def get_last_n_stocks(self, identifier, today_date, n) -> List[StockInfo]:
        return self.session \
            .query(StockInfo) \
            .filter_by(identifier=identifier) \
            .filter(StockInfo.close.isnot(None)) \
            .filter(StockInfo.date <= today_date) \
            .order_by(StockInfo.date.desc()) \
            .limit(n) \
            .all()

    def get_next_n_stocks(self, identifier, today_date, n) -> List[StockInfo]:
        return self.session \
            .query(StockInfo) \
            .filter_by(identifier=identifier) \
            .filter(StockInfo.close.isnot(None)) \
            .filter(StockInfo.date > today_date) \
            .order_by(StockInfo.date.asc()) \
            .limit(n) \
            .all()

