from data.model import StockInfo
from technical.models.base import Base


class MovingAverageCrossover(Base):
    def __init__(self, short=10, long=90):
        super().__init__()
        self.short = short
        self.long = long
        self.holding = False

    def get_name(self):
        return 'Moving Average Crossover {}/{}'.format(self.short, self.long)

    def execute(self, stock: StockInfo):
        super().execute(stock)

        short_avg = self.avg(stock, min(self.n_executed, self.short))
        long_avg = self.avg(stock, min(self.n_executed, self.long))

        if short_avg >= long_avg:
            self.account.buy_max(stock)
        else:
            self.account.sell_all_and_short(stock)

        self.add_plot(stock.date, {'short_ma': short_avg,
                                   'long_ma': long_avg})
