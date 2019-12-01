import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler

from constants import CLOSE_PRICE_COLUMN, DATA_TAG_PRICE_TO_EARNINGS, IDENTIFIER, START_DATE, END_DATE, TRAIN_TEST_SPLIT
from intrinio import Intrinio


def build_series(mat, time_steps, n_days_prediction):
    dim_0 = mat.shape[0] - time_steps
    dim_1 = mat.shape[1]
    x = np.zeros((dim_0, time_steps, dim_1))
    y = np.zeros((dim_0, n_days_prediction))

    for i in range(dim_0 - n_days_prediction):
        x[i] = mat[i:time_steps + i]
        y[i] = mat[time_steps + i:time_steps + i + n_days_prediction, CLOSE_PRICE_COLUMN]

    return x, y


def trim(mat, batch_size):
    no_of_rows_drop = mat.shape[0] % batch_size

    if no_of_rows_drop > 0:
        return mat[:-no_of_rows_drop]

    return mat


def fetch_and_scale():
    intrinio = Intrinio()
    x_raw = intrinio.fetch_and_merge(IDENTIFIER, START_DATE, END_DATE, [DATA_TAG_PRICE_TO_EARNINGS])
    x_train, x_test = train_test_split(np.array(x_raw), shuffle=False,
                                       train_size=TRAIN_TEST_SPLIT[0], test_size=TRAIN_TEST_SPLIT[1])
    scaler = MinMaxScaler().fit(x_raw)

    return scaler, scaler.transform(x_train), scaler.transform(x_test)


def build(x_train, x_test, batch_size, time_steps, n_days_prediction):
    x_t, y_t = build_series(x_train, time_steps, n_days_prediction)
    x_t = trim(x_t, batch_size)
    y_t = trim(y_t, batch_size)
    x_temp, y_temp = build_series(x_test, time_steps, n_days_prediction)
    x_val, x_test_t = np.split(trim(x_temp, batch_size), 2)
    y_val, y_test_t = np.split(trim(y_temp, batch_size), 2)

    return x_t, y_t, (x_val, x_test_t), (y_val, y_test_t)


def get_ready_data(batch_size=30, time_steps=70):
    scl, x_train, x_test = fetch_and_scale()
    return scl, build(x_train, x_test, batch_size, time_steps, 5)
