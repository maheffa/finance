from typing import Callable

from hyperopt import Trials, fmin, tpe, space_eval

from technical.models.base import Base
from technical.simulator import Simulator


class MaxFinder:
    def __init__(self, model_creator: Callable[..., Base], search_space):
        self.model_creator = model_creator
        self.search_space = search_space

    def find_arg_max(self, stock_name, start_date, end_date, max_evals=10):
        def evaluate(params):
            model = self.model_creator(params)
            simulator = Simulator()
            simulator.run(model, stock_name, start_date, end_date)
            rank = simulator.rank()

            # We need to maximize, thus invert ranking
            pseudo_error = -rank + 10  # adding 10 to keep error positive

            return pseudo_error

        trials = Trials()
        best_index = fmin(evaluate,
                          space=self.search_space,
                          algo=tpe.suggest,
                          max_evals=max_evals,
                          trials=trials)
        return space_eval(self.search_space, best_index)

