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


# common_date is guaranteed to be found because:
# 1) it is a common, 2) date at current index is lower, 3) order is ascending by date
def find_next_common_indexes(common_date, raw_stocks, raw_tag_data, stock_index, tag_data_index):
    while raw_stocks[stock_index]['date'] != common_date:
        stock_index += 1
    for i in range(len(tag_data_index)):
        while raw_tag_data[i][tag_data_index[i]]['date'] != common_date:
            tag_data_index[i] += 1

    return stock_index, tag_data_index


def fetch_and_merge(intrinio, identifier, start_date, end_date, tags):
    raw_stocks = intrinio.get_stock_prices(identifier, start_date, end_date)
    raw_tag_data = [intrinio.get_data_by_tag(identifier, tag, start_date, end_date) for tag in tags]

    print('Total:')
    print(str(len(raw_stocks)) + ' stocks')
    for i in range(len(tags)):
        print(str(len(raw_tag_data[i])) + ' ' + tags[i])

    date_sets = [set([st['date'] for st in raw_stocks])] + [set([hd['date'] for hd in d]) for d in raw_tag_data]
    common_dates = sorted(list(set.intersection(*date_sets)))
    merged = []

    print('Common date with all data present: ' + str(len(common_dates)))
    print('Merging ...')

    stock_index = 0
    tag_data_index = [0 for _ in tags]

    for date in common_dates:
        stock_index, tag_data_index = find_next_common_indexes(date, raw_stocks, raw_tag_data,
                                                               stock_index, tag_data_index)
        merged.append(raw_stocks[stock_index]['value'] + [raw_tag_data[i][tag_data_index[i]]['value'] for i in range(len(tags))])

    print('Merged')

    return merged


def fetch_and_scale():
    intrinio = Intrinio(key='OjcxMjg1Y2RkN2MyZWIyMGE4ODU3ZGI1NWRhMzU0MTQ1')
    x_raw = fetch_and_merge(intrinio, IDENTIFIER, START_DATE, END_DATE, [DATA_TAG_PRICE_TO_EARNINGS])
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
