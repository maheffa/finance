import numpy as np
from hyperopt import STATUS_OK
from keras import optimizers
from keras.layers import Dense, Flatten, LSTM
from keras.models import Sequential

from data import trim


def build_model(x_t, params):
    print("Trying params:", params)
    batch_size = params["batch_size"]
    time_steps = params["time_steps"]
    lstm_model = Sequential()
    lstm_model.add(LSTM(params["lstm1_nodes"], batch_input_shape=(batch_size, time_steps, x_t.shape[2]),
                        dropout=params["lstm1_dropouts"],
                        # recurrent_dropout=params["lstm1_dropouts"],
                        stateful=True, return_sequences=True,
                        kernel_initializer='random_uniform'))
    if params["lstm_layers"]["layers"] == "two":
        lstm_model.add(LSTM(params["lstm_layers"]["lstm2_nodes"], dropout=params["lstm_layers"]["lstm2_dropouts"]))
    else:
        lstm_model.add(Flatten())

    if params["dense_layers"]["layers"] == 'two':
        lstm_model.add(Dense(params["dense_layers"]["dense2_nodes"], activation='relu'))

    lstm_model.add(Dense(params['n_days_pred'], activation='sigmoid'))

    lr = params["learning_rate"]
    if params["optimizer"] == 'rms':
        optimizer = optimizers.RMSprop(lr=lr, decay=0.1)
    else:
        optimizer = optimizers.SGD(lr=lr, decay=1e-6, momentum=0.9, nesterov=True)

    lstm_model.compile(loss='mean_squared_error', optimizer=optimizer)

    return lstm_model


def train(model, x_train, y_train, x_val, y_val, params, callbacks=None):
    batch_size = params['batch_size']
    history = model.fit(x_train, y_train, epochs=params['epochs'], verbose=2, batch_size=batch_size,
                        validation_data=(trim(x_val, batch_size), trim(y_val, batch_size)), callbacks=callbacks)
    return {'loss': np.amin(history.history['val_loss']),
            'status': STATUS_OK,
            'history': history,
            'model': model,
            'params': params}
