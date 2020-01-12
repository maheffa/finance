import logging
import copy
import math
from enum import Enum
from typing import List

from data.db import DB
from data.model import StockInfo


class Action(Enum):
    BUY = 'buy'
    SELL = 'sell'
    SHORT = 'short'


class History:
    def __init__(self, action: Action, stock: StockInfo):
        self.action = action
        self.stock = stock.identifier
        self.price = stock.close
        self.date = stock.date


class Account:
    db = DB()

    commission = {
        'per_trade': 0.0,
        'per_stock': 0.000,
    }

    def __init__(self, start_portfolio):
        self.stocks = {}
        self.cash = start_portfolio
        self.history: List[History] = []

    def buy(self, stock: StockInfo, n):
        if n < 0:
            raise Exception('You cannot buy negative stocks. For shorting, you need to sell borrowed stocks.')

        cost = Account.commission['per_trade'] + n * Account.commission['per_stock'] + stock.close * n
        if cost > self.cash:
            raise Exception(
                'Not enough cash. Buying {} {} would cost {}. Portfolio is {}.'.format(n, stock.identifier, cost, self.cash))

        logging.debug('Buying {} {} for {}'.format(n, stock.identifier, stock.close))
        self.stocks[stock.identifier] = self.stocks.get(stock.identifier, 0) + n
        self.cash -= cost

        self.history.append(History(Action.BUY, stock))
        logging.debug(self)

    def sell(self, stock: StockInfo, n):
        owned = self.stocks.get(stock.identifier, 0)
        if n < 0:
            raise Exception('You cannot sell negative stocks. Just buy them.')
        if owned < 0:
            raise Exception('Unable to sell: already in shorting position.')
        to_sell = n if n <= owned else owned
        to_short = 0 if n <= owned else n - owned
        assert to_sell + to_short == n

        logging.debug('Selling {} {} for {}'.format(to_sell, stock.identifier, stock.close))
        self.cash += to_sell * stock.close - Account.commission['per_trade'] - to_sell * Account.commission['per_stock']
        self.stocks[stock.identifier] = owned - to_sell

        self.history.append(History(Action.SELL, stock))
        logging.debug(self)

        if to_short > 0:
            self.short(stock, to_short)

    def short(self, stock: StockInfo, n):
        if n < 0:
            raise Exception('You cannot short negative stocks')
        if n == 0:
            # Nothing to do
            return

        owned = self.stocks.get(stock.identifier, 0)
        if owned > 0:
            raise Exception('You cannot short {}, you still owns {} of it. Sell them first.'.format(stock.identifier, owned))

        # Only allow to short as much as your cash can cover
        # Leaving enough margin to buy back even if stocks go up to 200%
        max_to_short = math.floor((self.cash - Account.commission['per_trade']) / (stock.close + Account.commission['per_stock']))
        n = max(n, max_to_short)
        logging.debug('Shorting {} {}'.format(n, stock.identifier))
        self.cash += n * stock.close - Account.commission['per_trade'] - n * Account.commission['per_stock']
        self.stocks[stock.identifier] = -n

        self.history.append(History(Action.SHORT, stock))
        logging.debug(self)

    def buy_max(self, stock: StockInfo):
        n = (self.cash - Account.commission['per_trade']) / (stock.close + Account.commission['per_stock'])
        n = math.floor(n)
        if n > 0:
            self.buy(stock, n)

    def sell_all(self, stock: StockInfo):
        owned = self.stocks.get(stock.identifier, 0)
        if owned > 0:
            self.sell(stock, owned)

    def sell_all_and_short(self, stock: StockInfo):
        owned = self.stocks.get(stock.identifier, 0)
        if owned > 0:
            self.sell(stock, owned * 2)

    def __repr__(self):
        return 'cash: {}, stocks: {}'.format(self.cash, ['{}={}'.format(stock, amount) for stock, amount in self.stocks.items()])

    def snapshot(self, date):
        return AccountSnapshot(self, date)


class AccountSnapshot:
    def __init__(self, account: Account, date):
        self.date = date
        self.stocks = copy.deepcopy(account.stocks)
        self.cash = copy.deepcopy(account.cash)

    def size(self):
        total = self.cash
        for stock, amount in self.stocks.items():
            stock_info = Account.db.get_stock(stock, self.date)
            if stock is None:
                raise Exception('Stock {} not found for date {}'.format(stock, self.date))
            total += amount * stock_info.close
        return total

