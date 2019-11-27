import os
import time

from keras.callbacks import EarlyStopping, ModelCheckpoint, CSVLogger
from keras.models import load_model
from sklearn.metrics import mean_squared_error
from matplotlib import pyplot as plt

from data import get_ready_data, trim
from nn import build_model
from normalizer import Normalizer

OUTPUT_PATH = '/Users/adamamahefa/Workspace/finance/analysis/ml_data/output/'
best_model_path = os.path.join(OUTPUT_PATH, 'best_model.h5')
csv_log_path = os.path.join(OUTPUT_PATH, 'training_log_' + time.ctime().replace(' ', '_') + '.log')


def train(model, x_t, y_t, x_val, y_val, epochs=300, batch_size=30):
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=30, min_delta=0.0001)
    mcp = ModelCheckpoint(best_model_path, monitor='val_loss', verbose=1, save_best_only=True, save_weights_only=False)
    csv_logger = CSVLogger(csv_log_path, append=True)
    validation_data = (trim(x_val, batch_size), trim(y_val, batch_size))

    return model.fit(x_t, y_t, epochs=epochs, verbose=2, batch_size=batch_size, shuffle=False,
                     validation_data=validation_data, callbacks=[es, mcp, csv_logger])


def plot_training(scaler, x_test_t, y_test_t, model, history, batch_size):
    y_pred = model.predict(x_test_t, batch_size=batch_size)
    y_pred = y_pred.flatten()
    error = mean_squared_error(y_test_t, y_pred)
    print("Error is", error, y_pred.shape, y_test_t.shape)
    print(y_pred[0:15])
    print(y_test_t[0:15])

    y_pred_org = (y_pred * scaler.data_range_[Normalizer.prediction_tuple_index]) \
                 + scaler.data_min_[Normalizer.prediction_tuple_index]
    y_test_t_org = (y_test_t * scaler.data_range_[Normalizer.prediction_tuple_index]) \
                   + scaler.data_min_[Normalizer.prediction_tuple_index]
    print(y_pred_org[0:15])
    print(y_test_t_org[0:15])

    plt.figure()
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Model loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Test'], loc='upper left')
    plt.savefig(os.path.join(OUTPUT_PATH, 'train_vis_BS_' + str() + "_" + time.ctime() + '.png'))


def plot_best_model_prediction(scaler, x_test_t, y_test_t, batch_size):
    saved_model = load_model(best_model_path)
    y_pred = saved_model.predict(x_test_t, batch_size=batch_size)
    y_pred = y_pred.flatten()
    error = mean_squared_error(y_test_t, y_pred)
    print("Error is", error, y_pred.shape, y_test_t.shape)
    print(y_pred[0:15])
    print(y_test_t[0:15])
    y_pred_org = (y_pred * scaler.data_range_[Normalizer.prediction_tuple_index]) \
                 + scaler.data_min_[Normalizer.prediction_tuple_index]
    y_test_t_org = (y_test_t * scaler.data_range_[Normalizer.prediction_tuple_index]) \
                   + scaler.data_min_[Normalizer.prediction_tuple_index]
    print(y_pred_org[0:15])
    print(y_test_t_org[0:15])

    plt.figure()
    plt.plot(y_pred_org)
    plt.plot(y_test_t_org)
    plt.title('Prediction vs Real Stock Price')
    plt.ylabel('Price')
    plt.xlabel('Days')
    plt.legend(['Prediction', 'Real'], loc='upper left')
    plt.savefig(os.path.join(OUTPUT_PATH, 'pred_vs_real_BS' + str(batch_size) + "_" + time.ctime() + '.png'))


def main(params=None):
    if params is None:
        params = {
            "batch_size": 30,
            "epochs": 300,
            "learning_rate": 0.0001,
            "time_steps": 70
        }

    scaler, (x_t, y_t, (x_val, x_test_t), (y_val, y_test_t)) = get_ready_data(batch_size=params['batch_size'],
                                                                              time_steps=params['time_steps'])
    model = build_model(x_t, params['batch_size'], params['time_steps'], params['learning_rate'])
    history = train(model, x_t, y_t, x_val, y_val, epochs=params['epochs'], batch_size=params['batch_size'])

    plot_training(scaler, x_test_t, y_test_t, model, history, params['batch_size'])
    plot_best_model_prediction(scaler, x_test_t, y_test_t, params['batch_size'])
