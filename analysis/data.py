from intrinio import Intrinio
from normalizer import Normalizer
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import numpy as np


def build_time_series(mat, time_steps):
    dim_0 = mat.shape[0] - time_steps
    dim_1 = mat.shape[1]
    x = np.zeros((dim_0, time_steps, dim_1))
    y = np.zeros((dim_0,))

    for i in range(dim_0):
        x[i] = mat[i:time_steps + i]
        y[i] = mat[time_steps + i, Normalizer.prediction_tuple_index]

    return x, y


def trim(mat, batch_size):
    no_of_rows_drop = mat.shape[0] % batch_size

    if no_of_rows_drop > 0:
        return mat[:-no_of_rows_drop]

    return mat


def fetch_and_scale():
    intrinio = Intrinio()
    raw = intrinio.get_stock_prices('AAPL', '2014-01-01', '2019-01-01', 'daily')
    x_raw = [Normalizer.extract_data_tuple(s) for s in raw]
    x_train, x_test = train_test_split(np.array(x_raw), train_size=0.6, test_size=0.4, shuffle=False)
    scaler = MinMaxScaler().fit(x_raw)

    return scaler, scaler.transform(x_train), scaler.transform(x_test)


def build(x_train, x_test, batch_size, time_steps):
    x_t, y_t = build_time_series(x_train, time_steps)
    x_t = trim(x_t, batch_size)
    y_t = trim(y_t, batch_size)
    x_temp, y_temp = build_time_series(x_test, time_steps)
    x_val, x_test_t = np.split(trim(x_temp, batch_size), 2)
    y_val, y_test_t = np.split(trim(y_temp, batch_size), 2)

    return x_t, y_t, (x_val, x_test_t), (y_val, y_test_t)


def get_ready_data(batch_size=30, time_steps=70):
    scl, x_train, x_test = fetch_and_scale()
    return scl, build(x_train, x_test, batch_size, time_steps)
