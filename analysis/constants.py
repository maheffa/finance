CLOSE_PRICE_COLUMN = 0

IDENTIFIER = 'AAPL'
START_DATE = '2005-01-01'
END_DATE = '2019-06-01'
TRAIN_TEST_SPLIT = [0.7, 0.3]

DATA_TAG_PRICE_TO_EARNINGS = 'pricetoearnings'

DEFAULT_TRAINING_PARAMS = {
    'batch_size': 100,
    'dense_layers': {'dense2_nodes': 30,
                     'layers': 'two'},
    # 'epochs': 300,
    'epochs': 500,
    'learning_rate': 0.0001813940968047338,
    'lstm1_dropouts': 0.24577387372577253,
    'lstm1_nodes': 70,
    'lstm_layers': {'layers': 'one'},
    'n_days_pred': 10,
    'optimizer': 'rms',
    'rate_decay': 0.00012661495934223046,
    'time_steps': 90
}
