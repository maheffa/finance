import sqlite3

DB_FILE = 'data.db'

TABLE_NAME = 'stock_info'


def to_db_date(d):
    return d.strftime('%Y-%d-%m 00:00:00')

def quote(v):
    return '"' +  v + '"'


class DB:
    STOCK_COLUMNS = ('close', 'open', 'high', 'low', 'volume')
    TAG_COLUMNS = ('pricetoearnings',)

    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self._ensure_db()

    def _ensure_db(self):
        cur = self.conn.cursor()
        columns = (*DB.STOCK_COLUMNS, *DB.TAG_COLUMNS)
        cur.executescript("""
            CREATE TABLE IF NOT EXISTS '{}' (
                id INTEGER PRIMARY KEY,
                identifier TEXT NOT NULL,
                date TEXT NOT NULL,
                {},
                UNIQUE(identifier, date)
            );
        """.format(TABLE_NAME, ', '.join([c + ' REAL' for c in columns])))

    def _find_ids(self, identifier, dates):
        ids = [-1 for _ in dates]
        date_to_index = { to_db_date(date): index for (index, date) in enumerate(dates)}
        c = self.conn.cursor()
        for row in c.execute('SELECT id, date FROM {} WHERE identifier = "{}"'.format(TABLE_NAME, identifier)):
            if row[1] in date_to_index:
                ids[row[1]] = row[0]

        return ids

    def insert_or_update_stocks(self, identifier, stock_objects):
        ids = self._find_ids(identifier, [stock_object['date'] for stock_object in stock_objects])
        to_insert_list = [(quote(to_db_date(stock_object['date'])), quote(identifier), *stock_object['value'])
                          for (i, stock_object) in enumerate(stock_objects) if ids[i] == -1]
        to_update_list = [(*stock_object['value'], ids[i])
                          for (i, stock_object) in enumerate(stock_objects) if ids[i] != -1]

        print('Inserting {} elements'.format(len(to_insert_list)))
        self.conn.executemany('INSERT INTO {}(date,identifier,close,open,high,low,volume) VALUES (?, ?, ?, ?, ?, ?, ?)'.format(TABLE_NAME), to_insert_list)
        self.conn.commit()

        print('Updating {} elements'.format(len(to_update_list)))
        self.conn.executemany('UPDATE {} SET close=?,open=?,high=?,low=?,volume=? WHERE id=?'.format(TABLE_NAME), to_update_list)
        self.conn.commit()

    def insert_or_update_tag(self, identifier, tag, data):
        ids = self._find_ids(identifier, [d['date'] for d in data])
        to_insert_list = [(quote(to_db_date(d['date'])), quote(identifier), d['value']) for (i, d) in enumerate(data) if ids[i] == -1]
        to_update_list = [(d['value'], ids[i]) for (i, d) in enumerate(data) if ids[i] != -1]

        print('Inserting {} elements'.format(len(to_insert_list)))
        self.conn.executemany('INSERT INTO {}(date,identifier,{}) VALUES ("?", "?", ?)'.format(TABLE_NAME, tag), to_insert_list)
        self.conn.commit()

        print('Updating {} elements'.format(len(to_update_list)))
        self.conn.executemany('UPDATE {} SET {}=? WHERE id=?'.format(TABLE_NAME, tag), to_update_list)
        self.conn.commit()

    def populate_stocks(self, intrinio, identifier, start_date, end_date):
        self.insert_or_update_stocks(identifier, intrinio.get_stock_prices(identifier, start_date, end_date))

    def populate_tag(self, intrinio, identifier, tag, start_date, end_date, map_value=None):
        self.insert_or_update_tag(identifier, tag, intrinio.get_data_by_tag(identifier, tag, start_date, end_date, map_value=map_value))
