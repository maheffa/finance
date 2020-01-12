import math

from data.model import StockInfo
from technical.models.base import Base
from technical.models.buyandhold import BuyAndHold
from technical.models.macd import MovingAverageConvergenceDivergence


class StopLoss(Base):
    def __init__(self, min_growth=0.05, period=20):
        super().__init__()
        signal, short, long = math.floor(period * 2.0 / 5), math.floor(period * 0.5), period
        self.base_model = BuyAndHold(account=self.account)
        self.reference_size = self.account.cash
        self.min_growth = min_growth
        self.period = period
        self.n_elapsed = 0
        self.stock_reference = None
        self.waiting_recovery = False

    def get_name(self):
        return 'StopLoss {}% over {}'.format(self.min_growth * 100, self.period)

    def get_expected_size(self):
        return (1 + self.n_elapsed * self.min_growth / self.period) * self.reference_size

    def execute(self, stock: StockInfo):
        super().execute(stock)
        stock_ema = self.ema('stock', stock.close, self.period)

        if self.n_executed < self.period:
            self.account.buy_max(stock)

        actual_size = self.account.snapshot(stock.date).size()

        if not self.waiting_recovery:
            expected_size = self.get_expected_size()

            if actual_size > expected_size:
                self.base_model.execute(stock)
                self.n_elapsed += 1
            else:
                self.account.sell_all(stock)
                self.stock_reference = stock_ema
                self.waiting_recovery = True
                self.reference_size = self.account.snapshot(stock.date).size()

            self.add_plot(stock.date, {'expected_size': expected_size,
                                       'actual_size': actual_size})
        else:
            if self.stock_reference < stock_ema:
                self.waiting_recovery = False
                self.n_elapsed = 0
                self.reference_size = self.account.snapshot(stock.date).size()
                self.account.buy_max(stock)

            self.add_plot(stock.date, {'expected_size': self.reference_size,
                                       'actual_size': actual_size})
        # if actual_size > expected_size:
        #     self.base_model.execute(stock)
        # else:
        #     self.account.buy_max(stock)  # Hold until it reaches back to expectation
