import datetime
import logging
import multiprocessing as mp

from hyperopt import hp

from technical.max_finder import MaxFinder
from technical.models.buyandhold import BuyAndHold
from technical.models.ma_crossover import MovingAverageCrossover
from technical.models.macd import MovingAverageConvergenceDivergence
from technical.multisimulator import MultiSimulator
from technical.simulator import Simulator


code_to_model_creator = {
    'ma': lambda params: MovingAverageCrossover(short=params['short'], long=params['long']),
    'macd': lambda params: MovingAverageConvergenceDivergence(signal=params['signal'], short=params['short'], long=params['long']),
}

identifier = 'MSFT'
fit_start_date = datetime.date(2012, 1, 1)
fit_end_date = datetime.date(2017, 6, 30)
eval_start_date = datetime.date(2017, 7, 1)
eval_end_date = datetime.date(2019, 6, 30)


def pool_run(pool_arg):
    model_creator_code, space = pool_arg
    return MaxFinder(code_to_model_creator[model_creator_code], space).find_arg_max(identifier, fit_start_date,
                                                                                    fit_end_date, max_evals=20)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    # models = [
    #     (BuyAndHold(), False),
    #     (MovingAverageCrossover(short=5, long=90), False),
    #     (MovingAverageCrossover(short=5, long=50), False),
    #     (MovingAverageConvergenceDivergence(), False),
    #     (StopLoss(), False),
    # ]
    # MultiSimulator(models).run()
    finders = [
        ('ma', {'short': hp.uniformint('short', 5, 10), 'long': hp.uniformint('long', 30, 90)}),
        ('macd', {'signal': hp.uniformint('signal', 4, 8), 'short': hp.uniformint('short', 9, 16), 'long': hp.uniformint('long', 17, 34)}),
    ]

    pool = mp.Pool(mp.cpu_count())

    results = pool.map(pool_run, finders)
    # results = [MaxFinder(model_creator, space).find_arg_max(identifier, fit_start_date, fit_end_date, max_evals=5) for model_creator, space in finders]

    for res in results:
        sim = Simulator()
        sim.run(MovingAverageCrossover(short=res['short'], long=res['long']), identifier, fit_start_date, fit_end_date)
        logging.info('Found max = {} with rank {}'.format(res, sim.rank()))

    models = [(BuyAndHold(), False)]
    models += [(code_to_model_creator[finders[i][0]](results[i]), True) for i in range(len(finders))]
    # (MovingAverageCrossover(short=res['short'], long=res['long']), True)
    # ]
    MultiSimulator(models).run(identifier, eval_start_date, eval_end_date)
