import os
import pickle
import time

from keras.callbacks import EarlyStopping, ModelCheckpoint, CSVLogger, Callback
from keras.models import load_model
from sklearn.metrics import mean_squared_error
from matplotlib import pyplot as plt
from hyperopt import Trials, STATUS_FAIL, tpe, fmin, hp, space_eval

from data import get_ready_data, trim, fetch_and_scale, build
from nn import build_model, train
from normalizer import Normalizer

OUTPUT_PATH = './output/'
best_model_path = os.path.join(OUTPUT_PATH, 'best_model.h5')
csv_log_path = os.path.join(OUTPUT_PATH, 'training_log_' + time.ctime().replace(' ', '_') + '.log')
csv_logger = CSVLogger(csv_log_path)


class LogMetrics(Callback):
    def __init__(self, search_params, param, comb_no):
        super().__init__()
        self.param = param
        self.self_params = search_params
        self.comb_no = comb_no

    def on_epoch_end(self, epoch, logs=None):
        logs = {} if logs is None else logs
        for i, key in enumerate(self.self_params.keys()):
            logs[key] = self.param[key]
        logs["combination_number"] = self.comb_no


# def train(model, x_t, y_t, x_val, y_val, epochs=300, batch_size=30):
#     es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=30, min_delta=0.0001)
#     mcp = ModelCheckpoint(best_model_path, monitor='val_loss', verbose=1, save_best_only=True,
#     save_weights_only=False)
#     validation_data = (trim(x_val, batch_size), trim(y_val, batch_size))
#
#     return model.fit(x_t, y_t, epochs=epochs, verbose=2, batch_size=batch_size, shuffle=False,
#                      validation_data=validation_data, callbacks=[es, mcp, csv_logger])


def plot_training(history):
    plt.figure()
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Model loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Test'], loc='upper left')
    plt.savefig(os.path.join(OUTPUT_PATH, 'train_vis_BS_' + str() + "_" + time.ctime() + '.png'))


def plot_best_model_prediction(scaler, model, x_test_t, y_test_t, batch_size):
    x_test_t = trim(x_test_t, batch_size)
    y_test_t = trim(y_test_t, batch_size)
    y_pred = model.predict(x_test_t, batch_size=batch_size)
    y_pred = y_pred.flatten()
    y_pred_org = (y_pred * scaler.data_range_[Normalizer.prediction_tuple_index]) \
                 + scaler.data_min_[Normalizer.prediction_tuple_index]
    y_test_t_org = (y_test_t * scaler.data_range_[Normalizer.prediction_tuple_index]) \
                   + scaler.data_min_[Normalizer.prediction_tuple_index]

    plt.figure()
    plt.plot(y_pred_org)
    plt.plot(y_test_t_org)
    plt.title('Prediction vs Real Stock Price')
    plt.ylabel('Price')
    plt.xlabel('Days')
    plt.legend(['Prediction', 'Real'], loc='upper left')
    plt.savefig(os.path.join(OUTPUT_PATH, 'pred_vs_real_BS' + str(batch_size) + "_" + time.ctime() + '.png'))


def search():
    scaler, x_train, x_test = fetch_and_scale()

    def main(params):
        print('****************')
        print('****************')
        print('Training with:')
        print(params)
        x_t, y_t, (x_val, _), (y_val, _) = build(x_train, x_test,
                                                 params['batch_size'], params['time_steps'])
        model = build_model(x_t, params)
        return train(model, x_t, y_t, x_val, y_val, params,
                     callbacks=[LogMetrics(search_space, params, -1), csv_logger])

    search_space = {
        'batch_size': hp.choice('bs', [30, 40, 50, 60, 70]),
        'time_steps': hp.choice('ts', [30, 60, 90]),
        'lstm1_nodes': hp.choice('lstm1_nodes', [70, 80, 100, 130]),
        'lstm1_dropouts': hp.uniform('lstm1_dropouts', 0, 1),
        'lstm_layers': hp.choice('lstm_layers', [
            {
                'layers': 'one',
            },
            {
                'layers': 'two',
                'lstm2_nodes': hp.choice('units_lstm2', [20, 30, 40, 50]),
                'lstm2_dropouts': hp.uniform('dos_lstm2', 0, 1)
            }
        ]),
        'dense_layers': hp.choice('dense_layers', [
            {
                'layers': 'one'
            },
            {
                'layers': 'two',
                'dense2_nodes': hp.choice('units_dense', [10, 20, 30, 40])
            }
        ]),
        "learning_rate": hp.loguniform('learning_rate', -15, -5),
        "epochs": hp.choice('epochs', [50, 100]),
        "optimizer": hp.choice('optmz', ["sgd", "rms"])
    }

    trials = Trials()
    best_index = fmin(main,
                      space=search_space,
                      algo=tpe.suggest,
                      max_evals=1000,
                      trials=trials)
    best = space_eval(search_space, best_index)

    pickle.dump(best, open(os.path.join(OUTPUT_PATH, "hyperopt_res"), "wb"))

    print('********** BEST **********')
    print(best)
    print('**************************')
    _, _, (_, x_test_t), (_, y_test_t) = build(x_train, x_test,
                                               best['batch_size'], best['time_steps'])
    best['epochs'] = 300
    trained_best = main(best)
    best_model = trained_best['model']
    best_history = trained_best['history']
    plot_training(best_history)
    plot_best_model_prediction(scaler, best_model, x_test_t, y_test_t, best['batch_size'])


if __name__ == '__main__':
    search()
