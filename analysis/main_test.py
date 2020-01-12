import datetime
import logging

from technical.models.buyandhold import BuyAndHold
from technical.models.high_low_avg_signal import HighLowAvgSignal
from technical.models.ma_crossover import MovingAverageCrossover
from technical.multisimulator import MultiSimulator
from technical.simulator import Simulator

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    identifier = 'MSFT'
    fit_start_date = datetime.date(2010, 1, 1)
    fit_end_date = datetime.date(2017, 6, 30)
    eval_start_date = datetime.date(2017, 7, 1)
    eval_end_date = datetime.date(2019, 6, 30)

    # simulator = Simulator()
    hl_avg_sign = HighLowAvgSignal()
    hl_avg_sign.train(identifier, fit_start_date, fit_end_date)

    models = [
        (BuyAndHold(), False),
        (hl_avg_sign, True),
        (MovingAverageCrossover(short=5, long=50), False),
    ]
    MultiSimulator(models).run(identifier, eval_start_date, eval_end_date)
