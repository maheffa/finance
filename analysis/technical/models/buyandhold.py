from data.model import StockInfo
from technical.models.base import Base


class BuyAndHold(Base):
    def get_name(self):
        return 'Buy And Hold'

    def __init__(self, account=None, start_portfolio=10000):
        super().__init__(account=account, start_portfolio=start_portfolio)
        self.own_stocks = False

    def execute(self, stock: StockInfo):
        super().execute(stock)
        if not self.own_stocks:
            self.account.buy_max(stock)

        self.own_stocks = True
