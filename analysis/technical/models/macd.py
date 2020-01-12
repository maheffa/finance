from data.model import StockInfo
from technical.models.base import Base


class MovingAverageConvergenceDivergence(Base):
    def __init__(self, signal=8, short=10, long=20, account=None, start_portfolio=10000):
        super().__init__(account=account, start_portfolio=start_portfolio)
        self.signal = signal
        self.short = short
        self.long = long

    def get_name(self):
        return 'MACD {}/{}/{}'.format(self.signal, self.short, self.long)

    def execute(self, stock: StockInfo):
        super().execute(stock)
        ema_short = self.ema('short', stock.close, self.short)
        ema_long = self.ema('long', stock.close, self.long)
        macd = ema_short - ema_long

        if macd < 0:
            self.account.sell_all_and_short(stock)
        else:
            self.account.buy_max(stock)

        ema_macd = self.ema('macd', ema_short - ema_long, self.signal)
        self.add_plot(stock.date, {'signal': ema_macd,
                                   'macd': macd})
