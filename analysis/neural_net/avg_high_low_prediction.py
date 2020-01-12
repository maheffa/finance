from typing import List

from neural_net.base import NNBase


def get_highs_and_lows_index(values):
    if len(values) == 0:
        raise Exception('Cannot find highs and lows of empty values')
    up = [values[i + 1] > values[i] for i in range(len(values) - 1)]
    i_highs = [0] + [i + 1 for i in range(len(up) - 1) if up[i] and not up[i + 1]]
    i_lows = [0] + [i + 1 for i in range(len(up) - 1) if not up[i] and up[i + 1]]
    last_i = len(values) - 1
    if up[-1]:
        i_highs.append(last_i)
    else:
        i_lows.append(last_i)
    return i_highs, i_lows


def get_avg_high_low(values):
    i_highs, i_lows = get_highs_and_lows_index(values)
    high = sum([values[i] for i in i_highs]) / len(i_highs)
    low = sum([values[i] for i in i_lows]) / len(i_lows)
    return [high, low]


class AverageLowHighPrediction(NNBase):
    def data_to_predict(self, future_stock_prices: List[float]):
        return get_avg_high_low(future_stock_prices)
