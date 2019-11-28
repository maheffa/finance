import sqlite3

DB_FILE = 'data.db'

TABLE_NAME = 'stock_info'

class DB:
    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE)
        self._ensure_db()

    def _ensure_db():
        cur = self.conn.cursor()
        tags = ['pricetoearnings']
        cur.executescript("""
            CREATE TABLE IF NOT EXISTS {} (
                id INTEGER PRIMARY KEY,
                identifier TEXT NOT NULL,
                date TEXT NOT NULL,
                close REAL,
                open REAL,
                high REAL,
                low REAL,
                volume REAL,
                {},
                UNIQUE(identifier, date)
            );
        """.format(TABLE_NAME, ', '.join([tag + ' REAL' for tag in tags]))

    def _find_ids(self, identifier, dates):
        ids = [-1 for _ in dates]
        date_to_index = { date.strftime('%Y-%d-%m 00:00:00'): index for (index, date) in enumerate(dates)}
        c = self.conn.cursor()
        for row in c.execute('SELECT id, date FROM {} WHERE identifier = {}'.format(TABLE_NAME, identifier)):
            if row[1] in date_to_index:
                ids[row[1]] = row[0]

        return ids

    def insert_or_update_stocks(identifier, stock_objects):
        stock_ids = self._find_ids(identifier, [stock_object['date'] for stock_object in stock_objects])
        columns = ()

        enumerated_stocks = enumerate(stock_objects)
        to_insert_list = [stock_object['value'] for (i, stock_object) in enumerated_stocks if stock_ids[i] == -1]
        to_update_list = [(*stock_object['value'], stock_ids[i]) for (i, stock_object) if stock_ids[i] != -1]

        print('Inserting {} elements'.format(len(to_insert_list)))
        self.conn.executemany('INSERT INTO {}(close,open,high,low,volume) VALUES (?, ?, ?, ?, ?)'.format(TABLE_NAME), to_insert_list)
        self.conn.commit()

        print('Updating {} elements'.format(len(to_update_list)))
        self.conn.executemany('UPDATE {} SET close=?,open=?,high=?,low=?,volume=? WHERE id=?'.format(TABLE_NAME), to_update_list)
        self.conn.commit()
