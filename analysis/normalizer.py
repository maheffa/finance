from typing import Tuple, Any, Iterable, List

from intrinio_sdk import StockPriceSummary

StockData = Tuple[float, float, float, float, float]
StockRelative = Tuple[int, float, float]


class Normalizer:
    prediction_tuple_index = 0  # 2nd value of the tuple (close) is to be predicted

    @staticmethod
    def extract_data_tuple(stock: StockPriceSummary) -> StockData:
        return stock.close, stock.open, stock.low, stock.high, stock.volume

    # def __init__(self, initial_stock: StockData, batch_days: int,
    #              stock_price_scaler: MinMaxScaler = None,
    #              stock_volume_scaler: MinMaxScaler = None):
    #     self.initial_stock = initial_stock
    #     self.batch_days = batch_days
    #     self.stock_price_scaler = stock_price_scaler
    #     self.stock_volume_scaler = stock_volume_scaler
    #     self.scaler = None
    #
    # def _get_relative_data(self, stock_inf: StockData) -> StockRelative:
    #     return (stock_inf[0] - self.initial_stock[0]).days, \
    #            stock_inf[1] / self.initial_stock[1], \
    #            stock_inf[2] / self.initial_stock[2]
    #
    # def scale_and_fit(self, relative_seq: List[StockData]):
    #
    #     np_relative_seq = np.array(relative_seq)
    #     self.scaler = preprocessing.MinMaxScaler().fit(np_relative_seq)
    #     return self.scaler.transform(np_relative_seq)
