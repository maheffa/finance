from datetime import datetime, timedelta
from random import shuffle
import sqlite3
from data.model import TABLE_FETCH_LOG, TABLE_STOCK_INFO, STOCK_COLUMNS, TAG_COLUMNS

DB_FILE = 'data.db'


def to_db_date(d):
    return d.strftime('%Y-%m-%d 00:00:00')


class DB:
    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self._ensure_db()

    def _ensure_db(self):
        cur = self.conn.cursor()
        columns = (*STOCK_COLUMNS, *TAG_COLUMNS)
        cur.executescript("""
            CREATE TABLE IF NOT EXISTS '{}' (
                id INTEGER PRIMARY KEY,
                identifier TEXT NOT NULL,
                date TEXT NOT NULL,
                {},
                UNIQUE(identifier, date)
            );
            
            CREATE TABLE IF NOT EXISTS 'companies' (
                id TEXT PRIMARY KEY,
                identifier TEXT NOT NULL,
                name TEXT NOT NULL,
                sector TEXT,
                industry_category TEXT,
                industry_group TEXT,
                stock_exchange TEXT,
                created DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
            );
            
            CREATE TABLE IF NOT EXISTS '{}' (
                id TEXT PRIMARY KEY,
                {},
            );
        """.format(TABLE_STOCK_INFO,
                   ', '.join([c + ' REAL' for c in columns]),
                   TABLE_FETCH_LOG,
                   ', '.join([c + ' TEXT' for c in columns])))

    def _find_ids(self, identifier, dates, conditions=None):
        ids = [-1 for _ in dates]
        date_to_index = {to_db_date(date): index for (index, date) in enumerate(dates)}

        where_close = ["identifier='{}'".format(identifier)]
        if conditions is not None:
            where_close += conditions

        c = self.conn.cursor()
        for row in c.execute("SELECT id, date FROM {} WHERE {}".format(TABLE_STOCK_INFO, ' AND '.join(where_close))):
            if row[1] in date_to_index:
                ids[date_to_index[row[1]]] = row[0]

        return ids

    def insert_or_update_stocks(self, identifier, stock_objects):
        ids = self._find_ids(identifier, [stock_object['date'] for stock_object in stock_objects])
        to_insert_list = [(to_db_date(stock_object['date']), identifier, *stock_object['value'])
                          for (i, stock_object) in enumerate(stock_objects) if ids[i] == -1]
        to_update_list = [(*stock_object['value'], ids[i])
                          for (i, stock_object) in enumerate(stock_objects) if ids[i] != -1]

        print('Inserting {} elements'.format(len(to_insert_list)))
        self.conn.executemany('INSERT INTO {}(date,identifier,close,open,high,low,volume) VALUES (?, ?, ?, ?, ?, ?, ?)'.format(
            TABLE_STOCK_INFO), to_insert_list)
        self.conn.commit()

        print('Updating {} elements'.format(len(to_update_list)))
        self.conn.executemany('UPDATE {} SET close=?,open=?,high=?,low=?,volume=? WHERE id=?'.format(TABLE_STOCK_INFO), to_update_list)
        self.conn.commit()

    def insert_or_update_tag(self, identifier, tag, data):
        ids = self._find_ids(identifier, [d['date'] for d in data])
        to_insert_list = [(to_db_date(d['date']), identifier, d['value']) for (i, d) in enumerate(data) if ids[i] == -1]
        to_update_list = [(d['value'], ids[i]) for (i, d) in enumerate(data) if ids[i] != -1]

        print('Inserting {} elements'.format(len(to_insert_list)))
        self.conn.executemany('INSERT INTO {}(date,identifier,{}) VALUES (?, ?, ?)'.format(TABLE_STOCK_INFO, tag), to_insert_list)
        self.conn.commit()

        print('Updating {} elements'.format(len(to_update_list)))
        self.conn.executemany('UPDATE {} SET {}=? WHERE id=?'.format(TABLE_STOCK_INFO, tag), to_update_list)
        self.conn.commit()

    def populate_stocks(self, intrinio, identifier, start_date, end_date):
        self.insert_or_update_stocks(identifier, intrinio.get_stock_prices(identifier, start_date, end_date))

    def populate_tag(self, intrinio, identifier, tag, start_date, end_date, map_value=None):
        self.insert_or_update_tag(identifier, tag, intrinio.get_data_by_tag(identifier, tag, start_date, end_date, map_value=map_value))

    def populate_companies(self, intrinio):
        self.conn.executemany("""
            REPLACE INTO companies (
                id,
                identifier,
                name
            ) VALUES (?, ?, ?)
        """, intrinio.get_all_companies())
        self.conn.commit()

    def populate_missing_randomly(self, intrinio, n_random=500):
        ids = [res[0] for res in list(self.conn.cursor().execute('SELECT id FROM companies WHERE sector IS NULL'))]
        shuffle(ids)
        print('Fetching {} companies'.format(n_random))
        companies_info = intrinio.get_extra_companies_info(ids[:n_random])
        print('Writing')
        self.conn.executemany("""
            UPDATE companies
            SET sector=?, industry_category=?, industry_group=?, stock_exchange=?
            WHERE id=?
        """, [(s, i_c, i_g, s_e, i) for (i, s, i_c, i_g, s_e) in companies_info])
        self.conn.commit()

    def populate_db(self, intrinio, stock_identifiers, start_date='1990-01-01', end_date=None):
        if end_date is None:
            end_date = (datetime.now() - timedelta(1)).strftime('%Y-%m-%d')

        for identifier in stock_identifiers:
            self.populate_stocks(intrinio, identifier, start_date, end_date)
            for tag in TAG_COLUMNS:
                self.populate_tag(intrinio, identifier, tag, start_date, end_date)
