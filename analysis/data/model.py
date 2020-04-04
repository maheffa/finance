import datetime

from sqlalchemy import Column, ForeignKey, Integer, Float, String, Date, UniqueConstraint, DateTime
from sqlalchemy.ext.declarative import declarative_base


TABLE_FETCH_LOG = 'fetch_log'
TABLE_STOCK_INFO = 'stock_info'

STOCK_COLUMNS = ('close', 'open', 'high', 'low', 'volume')
TAG_PRICE_TO_EARNING = 'pricetoearnings'
TAG_COLUMNS = (TAG_PRICE_TO_EARNING,)

Base = declarative_base()


class StockInfo(Base):
    close_price_column = 0

    @staticmethod
    def create_with_info(identifier, date, info):
        stock = StockInfo(identifier, date)
        stock.set_stock_info(info)
        return stock

    @staticmethod
    def create_with_tag(identifier, date, tag, value):
        stock = StockInfo(identifier, date)
        if tag == 'pricetoearnings':
            stock.pricetoearnings = value
        return stock

    '''
    CREATE TABLE IF NOT EXISTS '{}' (
                id INTEGER PRIMARY KEY,
                identifier TEXT NOT NULL,
                date TEXT NOT NULL,
                {},
                UNIQUE(identifier, date)
            );
    '''
    __tablename__ = TABLE_STOCK_INFO

    id = Column(Integer, primary_key=True)
    identifier = Column(String(16), nullable=False)
    date = Column(Date, nullable=False)
    close = Column(Float)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    volume = Column(Float)
    pricetoearnings = Column(Float)
    news = Column(String)

    uniq = UniqueConstraint('identifier', 'date')

    def __init__(self, identifier, date):
        self.identifier = identifier
        self.date = date

    def set_stock_info(self, stock_info_tuple):
        self.close = stock_info_tuple[0]
        self.open = stock_info_tuple[1]
        self.high = stock_info_tuple[2]
        self.low = stock_info_tuple[3]
        self.volume = stock_info_tuple[4]

    def get_data(self):
        result = [self.close, self.open, self.high, self.low, self.volume, self.pricetoearnings]
        # result = [self.close, self.open, self.high, self.low, self.volume]
        assert result[StockInfo.close_price_column] == self.close
        return result

    def has_none(self):
        return None in self.get_data()

    def set_tag(self, tag, value):
        if tag not in TAG_COLUMNS:
            raise Exception('Attempting to set value for unknonw tag {}'.format(tag))
        if tag == TAG_PRICE_TO_EARNING:
            self.pricetoearnings = value

    def __repr__(self):
        return '{}: {}, pe={} [{}]'.format(self.identifier, self.close, self.pricetoearnings, self.date)


class Company(Base):
    __tablename__ = 'companies'

    id = Column(String(255), primary_key=True, nullable=False)
    identifier = Column(String(16), ForeignKey('stock_info.identifier'), nullable=False)
    name = Column(String(255), nullable=False)
    sector = Column(String(255))
    industry_category = Column(String(255))
    industry_group = Column(String(255))
    stock_exchange = Column(String(255))

    def __init__(self, id, identifier, name):
        self.id = id
        self.identifier = identifier
        self.name = name


class FetchLog(Base):
    __tablename__ = 'fetch_logs'

    id = Column(Integer, primary_key=True)
    identifier = Column(String(16), ForeignKey('stock_info.identifier'), nullable=False)
    column_name = Column(String(255), nullable=False)
    created = Column(DateTime, default=datetime.datetime.utcnow)

    def __init__(self, identifier, column_name):
        self.identifier = identifier
        self.column_name = column_name

