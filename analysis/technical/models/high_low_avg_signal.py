from data.model import StockInfo
from neural_net.avg_high_low_prediction import AverageLowHighPrediction
from technical.models.base import Base


class HighLowAvgSignal(Base):
    def get_name(self):
        return 'NN Predicted low/high signal'

    def __init__(self, account=None, start_portfolio=10000, **kwargs):
        super().__init__(account=account, start_portfolio=start_portfolio)
        self.nn = AverageLowHighPrediction(**kwargs)

    def train(self, stock_identifier, start_date, end_date):
        self.nn.train(stock_identifier, start_date, end_date)

    def execute(self, stock: StockInfo):
        if not self.nn.trained:
            raise Exception('Train network before doing any prediction')

        [high, low] = self.nn.predict(stock.identifier, stock.date)

        if stock.close < low:
            self.account.buy_max(stock)
        elif stock.close > high:
            self.account.sell_all_and_short(stock)

        self.add_plot(stock.date, {'high': high, 'low': low})
