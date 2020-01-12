import abc
import datetime
import logging
import random
from typing import List

import numpy as np
from hyperopt import STATUS_OK
from keras import Sequential, optimizers
from keras.callbacks import EarlyStopping
from keras.layers import LSTM, Flatten, Dense
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from tensorflow_core.python.keras.engine.training import Model

from data.db import DB
from data.model import StockInfo


def data_to_predict(future_stock_prices):
    return get_avg_high_low(future_stock_prices)


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


def trim(mat, batch_size):
    no_of_rows_drop = mat.shape[0] % batch_size

    if no_of_rows_drop > 0:
        return mat[:-no_of_rows_drop]

    return mat


class NNBase(abc.ABC):
    db = DB()
    train_test_split = (0.8, 0.2)

    def __init__(self, time_series=90, time_prediction=10, batch_size=30, lstm_nodes=100):
        self.trained = False
        self.scaler: MinMaxScaler = None
        self.time_series = time_series
        self.time_prediction = time_prediction
        self.batch_size = batch_size
        self.lstm_nodes = lstm_nodes
        self.learning_rate = 0.0001
        self.model: Model = None
        # self.epochs = 300
        self.epochs = 3
        self.training_result = {
            'params': {
                'time_series': time_series,
                'time_prediction': time_prediction,
                'batch_size': batch_size,
                'lstm_nodes': lstm_nodes
            },
            'loss': None,
            'status': None,
            'history': None,
            'model': None,
        }

    @abc.abstractmethod
    def data_to_predict(self, future_stock_prices: List[float]):
        # return get_avg_high_low(future_stock_prices)
        pass

    def get_prediction_size(self):
        arbitrary_stocks = [random.random() for _ in range(self.time_prediction)]
        return len(self.data_to_predict(arbitrary_stocks))

    def build_series(self, mat):
        # mat.shape = [<number of days>, <number of feature>]
        n_days, n_features = mat.shape[0] - self.time_series, mat.shape[1]
        x, y = np.zeros((n_days, self.time_series, n_features)), np.zeros((n_days, self.get_prediction_size()))

        for i in range(n_days - self.time_prediction):
            x[i] = mat[i:self.time_series + i]
            values = mat[self.time_series + i:self.time_series + i + self.time_prediction, StockInfo.close_price_column]
            y[i] = self.data_to_predict(values)

        # x.shape = [<number of days - self.long - self.short>, <self.long days>, <number of features>]
        # y.shape = [<number of days - self.long - self.short>, <2 - high and low>]
        return x, y

    def build(self, x_train, x_test):
        (x_t, y_t), (x_val, y_val) = self.build_series(x_train), self.build_series(x_test)
        return (trim(x_t, self.batch_size), trim(y_t, self.batch_size)), (trim(x_val, self.batch_size), trim(y_val, self.batch_size))

    def prepare_data(self, identifier, start_date: datetime.date, end_date: datetime.date):
        # Getting Data
        logging.info('Making sure all attributes exist')

        stocks = NNBase.db.get_stocks(identifier, start_date, end_date)
        if any([stock.has_none() for stock in stocks]):
            logging.warning('Some values are none. Please check intrinio can provide everything within the timerange')
            logging.warning('Will proceed with impartial data')
            stocks = [s for s in stocks if not s.has_none()]
            logging.warning('Filtering out incomplete stock info. Only {} stock info left.'.format(len(stocks)))

        # Scaling and splitting
        x_raw = [stock.get_data() for stock in stocks]
        x_train, x_test = train_test_split(np.array(x_raw),
                                           shuffle=False,
                                           train_size=NNBase.train_test_split[0],
                                           test_size=NNBase.train_test_split[1])
        self.scaler = MinMaxScaler().fit(x_raw)
        x_train = self.scaler.transform(x_train)
        x_test = self.scaler.transform(x_test)

        return self.build(x_train, x_test)

    def build_model(self):
        lstm_model = Sequential()
        lstm_model.add(LSTM(self.lstm_nodes,
                            batch_input_shape=(self.batch_size, self.time_series, len(StockInfo('', None).get_data())),
                            # dropout=params["lstm1_dropouts"],
                            # recurrent_dropout=params["lstm1_dropouts"],
                            stateful=True, return_sequences=True,
                            kernel_initializer='random_uniform'))
        # if params["lstm_layers"]["layers"] == "two":
        # lstm_model.add(LSTM(params["lstm_layers"]["lstm2_nodes"], dropout=params["lstm_layers"]["lstm2_dropouts"]))
        # else:
        lstm_model.add(Flatten())

        # if params["dense_layers"]["layers"] == 'two':
        #     lstm_model.add(Dense(params["dense_layers"]["dense2_nodes"], activation='relu'))

        lstm_model.add(Dense(self.get_prediction_size(), activation='sigmoid'))

        # if params["optimizer"] == 'rms':
        #     optimizer = optimizers.RMSprop(lr=lr, decay=0.1)
        # else:
        optimizer = optimizers.SGD(lr=self.learning_rate, decay=1e-6, momentum=0.9, nesterov=True)

        lstm_model.compile(loss='mean_squared_error', optimizer=optimizer)
        self.model = lstm_model

        return self.model

    def train(self, identifier, start_date: datetime.date, end_date: datetime.date):
        self.build_model()
        (x_t, y_t), (x_val, y_val) = self.prepare_data(identifier, start_date, end_date)
        es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=15, min_delta=0.0001)
        history = self.model.fit(x_t, y_t, epochs=self.epochs, verbose=2, batch_size=self.batch_size,
                                 validation_data=(x_val, y_val), callbacks=[es])
        self.training_result['loss'] = np.amin(history.history['val_loss'])
        self.training_result['status'] = STATUS_OK
        self.training_result['history'] = history
        self.training_result['model'] = self.model
        self.trained = True

    def original_price(self, y_scaled):
        price = (y_scaled * self.scaler.data_range_[StockInfo.close_price_column])
        return price + self.scaler.data_min_[StockInfo.close_price_column]

    def predict(self, identifier, date: datetime.date):
        stocks = NNBase.db.get_last_n_stocks(identifier, date, self.time_series)
        x = np.zeros((self.batch_size, self.time_series, len(stocks[0].get_data())))
        x[0] = self.scaler.transform([stock.get_data() for stock in stocks])
        y = self.model.predict(x, batch_size=self.batch_size)[0]
        return [self.original_price(value) for value in y]
