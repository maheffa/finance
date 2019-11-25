
class Item:
    def __init__(self, date):
        self.date = date
        self.open, self.close, self.low, self.high, self.volume = 0, 0, 0, 0, 0

    def set_stock(self, stock_open: float, close: float, low: float, high: float, volume: float):
        self.open = stock_open
        self.close = close
        self.low = low
        self.high = high
        self.volume = volume

    def to_array(self, normalizer):
        pass

    @staticmethod
    def from_array(normalized, normalizer):
        pass


class ItemNormalizer(Item):
    def __init__(self, ):
        super().__init__(None)

    def set_first_item(self, item: Item):


