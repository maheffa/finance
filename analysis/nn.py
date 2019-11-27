from keras import Sequential, optimizers
from keras.layers import LSTM, Dropout, Dense


def build_model(x_t, batch_size, time_steps, learning_rate):
    model = Sequential()
    model.add(LSTM(100, batch_input_shape=(batch_size, time_steps, x_t.shape[2]),
                   dropout=0.0, recurrent_dropout=0.0, stateful=True, kernel_initializer='random_uniform'))
    model.add(Dropout(0.5))
    model.add(Dense(20, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))
    optimizer = optimizers.RMSprop(learning_rate=learning_rate)
    model.compile(loss='mean_squared_error', optimizer=optimizer)

    return model
