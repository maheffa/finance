import copy
import os
import pickle
import time

from keras.callbacks import CSVLogger, Callback, EarlyStopping
from hyperopt import hp, Trials, fmin, tpe, space_eval

from constants import DEFAULT_TRAINING_PARAMS
from data import fetch_and_scale, build
from nn import build_model, train
from visual import plot_training, plot_best_model_prediction

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


def search():
    scaler, x_train, x_test = fetch_and_scale()

    def main(params):
        print('****************')
        print('****************')
        print('Training with:')
        print(params)
        x_t, y_t, (x_val, _), (y_val, _) = build(x_train, x_test,
                                                 params['batch_size'], params['time_steps'], params['n_days_pred'])
        model = build_model(x_t, params)
        es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=30, min_delta=0.0001)
        return train(model, x_t, y_t, x_val, y_val, params,
                     callbacks=[es, LogMetrics(search_space, params, -1), csv_logger])

    search_space = {
        'n_days_pred': hp.uniformint('n_days_pred', 5, 30),
        'rate_decay': hp.loguniform('rate_decay', -10, -5),
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
        "epochs": hp.choice('epochs', [100]),
        "optimizer": hp.choice('optmz', ["sgd", "rms"])
    }

    trials = Trials()
    best_index = fmin(main,
                      space=search_space,
                      algo=tpe.suggest,
                      max_evals=1000,
                      trials=trials)
    best = space_eval(search_space, best_index)
    pickle.dump(best, open(os.path.join(OUTPUT_PATH, "hyperopt_best")))

    print('********** BEST **********')
    print(best)
    print('**************************')
    x, y, (x_val, x_test_t), (y_val, y_test_t) = build(x_train, x_test,
                                                       best['batch_size'], best['time_steps'], best['n_days_pred'])
    # best['epochs'] = 300
    trained_best = main(best)
    best_model = trained_best['model']
    best_history = trained_best['history']
    plot_training(best_history, OUTPUT_PATH)
    plot_best_model_prediction(scaler, best_model, x_test_t, y_test_t, best, OUTPUT_PATH, custom_name='Test')
    plot_best_model_prediction(scaler, best_model, x, y, best, OUTPUT_PATH, custom_name='Training')
    plot_best_model_prediction(scaler, best_model, x_val, y_val, best, OUTPUT_PATH, custom_name='Validation')


def run(override_params=None):
    params = copy.deepcopy(DEFAULT_TRAINING_PARAMS)
    if override_params is not None:
        for (key, value) in override_params:
            params[key] = value

    scaler, x_train, x_test = fetch_and_scale()
    print('Training with:')
    print(params)
    x_t, y_t, (x_val, x_test_t), (y_val, y_test_t) = build(x_train, x_test,
                                             params['batch_size'], params['time_steps'], params['n_days_pred'])
    model = build_model(x_t, params)
    es = EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=40, min_delta=0.0001)

    res_train = train(model, x_t, y_t, x_val, y_val, params, callbacks=[es, csv_logger])
    plot_training(res_train['history'], OUTPUT_PATH)
    plot_best_model_prediction(scaler, model, x_test_t, y_test_t, params, OUTPUT_PATH, custom_name='Test')
    # plot_best_model_prediction(scaler, model, x_t, y_t, params, OUTPUT_PATH, custom_name='Training')
    plot_best_model_prediction(scaler, model, x_val, y_val, params, OUTPUT_PATH, custom_name='Validation')


if __name__ == '__main__':
    run()
    # search()
