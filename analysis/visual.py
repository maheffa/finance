import os
import time

import numpy as np
from matplotlib import pyplot as plt

from data import trim
from data.model import StockInfo


def plot_training(history, output_dir):
    plt.figure()
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Model loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Test'], loc='upper left')
    plt.savefig(os.path.join(output_dir, 'train_vis_BS_' + str() + "_" + time.ctime() + '.png'))
    plt.show()


def plot_best_model_prediction(scaler, model, x_test_t, y_test_t, params, output_dir, custom_name=''):
    def y_org(y):
        y_scaled = (y * scaler.data_range_[StockInfo.close_price_column])
        return y_scaled + scaler.data_min_[StockInfo.close_price_column]

    batch_size = params['batch_size']
    n_days_pred = params['n_days_pred']

    x_test_t = trim(x_test_t, batch_size)
    y_test_t = trim(y_test_t, batch_size)
    y_pred_tmp = model.predict(x_test_t, batch_size=batch_size)

    for y_pred_i in y_pred_tmp:
        print(str(y_org(y_pred_i[0])) + ' ' + ','.join(['{:.4f}'.format(y_org(y_f) / y_org(y_pred_i[0])) for y_f in y_pred_i]))

    dim = y_test_t.shape[0]

    y_real_t = np.zeros((dim,))
    y_pred_0 = np.zeros((dim,))
    y_pred_adjusted = np.zeros((dim,))

    for i in range(dim):
        i_offset = i % n_days_pred
        i_base = i - i_offset
        y_real_i = y_test_t[i][0]
        y_real_base = y_test_t[i_base][0]
        y_pred_i = y_pred_tmp[i][0]
        y_hypo_i = y_pred_tmp[i_base][i_offset]
        y_pred_base = y_pred_tmp[i_base][0]

        y_real_t[i] = y_real_i
        y_pred_0[i] = y_pred_i
        y_pred_adjusted[i] = y_real_base * (y_hypo_i / y_pred_base)

    y_real_t_org = y_org(y_real_t)
    y_pred_0_org = y_org(y_pred_0)
    y_adjusted_org = y_org(y_pred_adjusted)

    plt.figure()
    plt.plot(y_pred_0_org)
    plt.plot(y_real_t_org)

    for i_pred in range((dim // n_days_pred) - 1):
        i_base = i_pred * n_days_pred
        plt.plot(
            [i_base + i for i in range(n_days_pred)],
            [y_adjusted_org[i_base + i] for i in range(n_days_pred)],
            '--', markersize=15
        )

    plt.title('Prediction vs Real Stock Price --- ' + custom_name)
    plt.ylabel('Price')
    plt.xlabel('Days')
    plt.legend(['Prediction', 'Real'], loc='upper left')
    plt.savefig(os.path.join(output_dir, 'p_vs_r' + str(batch_size) + "_" + time.ctime() + '_' + custom_name + '.png'),
                dpi=1200)
    plt.show()
