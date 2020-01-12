import abc
import datetime
from typing import List, Tuple, Any

from data.model import StockInfo
from technical.account import Account


class Base(abc.ABC):

    def __init__(self, account: Account = None, start_portfolio=10000):
        self.account = account if account is not None else Account(start_portfolio)
        self.n_executed = 0
        self.last_executed = None
        self.ema_values = {}
        self.plots = []

    @abc.abstractmethod
    def get_name(self):
        pass

    def execute(self, stock: StockInfo):
        self.last_executed = stock.date
        self.n_executed += 1

    def account_snapshot(self, date):
        return self.account.snapshot(date)

    def add_plot(self, date, data):
        self.plots.append({'date': date,
                           'data': data})

    def get_plots(self) -> Tuple[List[datetime.date], List[List[Any]], List[str]]:
        if len(self.plots) == 0:
            return [], [], []

        legends: List[str] = list(self.plots[0]['data'].keys())
        x = [p['date'] for p in self.plots]
        ys = [[p['data'][legend] for p in self.plots] for legend in legends]

        return x, ys, legends

    def avg(self, stock: StockInfo, n_days, attribute='close'):
        stocks = Account.db.get_last_n_stocks(stock.identifier, self.last_executed, n_days)
        return sum([getattr(s, attribute) for s in stocks]) / len(stocks)

    def ema(self, ema_id, cur_value, n_days):
        val = self.ema_values.get(ema_id, 0)
        self.ema_values[ema_id] = (cur_value - val) * 2 / (n_days + 1) + val
        return self.ema_values[ema_id]
