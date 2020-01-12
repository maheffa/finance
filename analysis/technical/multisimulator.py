import logging
from typing import List, Tuple

import matplotlib.pyplot as plt

from technical.account import Action, Account
from technical.models.base import Base
from technical.simulator import Simulator


class MultiSimulator:

    def __init__(self, models: List[Tuple[Base, bool]], model_performance_base=0):
        """
        :param models: array of tuple (<model: technical.models.base.Base>, <do subplot: Boolean>)
        :param model_performance_base:  index of the model from which to measure the effectiveness of others
          - default to 0, assuming BuyAndHold is at index 0
        """
        self.models = models
        self.model_performance_base = model_performance_base

    def run(self, identifier, start_date, end_date):
        results = []
        legends = []

        n_subplots = len([_ for _, do_subplot in self.models if do_subplot])
        plt.subplot(n_subplots + 1, 1, 1)
        for i_model, (model, do_subplot) in enumerate(self.models):
            logging.info('Running {}'.format(model.get_name()))
            simulator = Simulator()
            history, plots = simulator.run(model, identifier, start_date, end_date)
            model_rank = simulator.rank()
            legends.append('{} = {:.2f}'.format(model.get_name(), model_rank))
            if do_subplot:
                results.append((model.get_name(), history, plots))
            plt.plot([snap.date for snap in simulator.snapshots], [snap.size() for snap in simulator.snapshots])

        plt.legend(legends)
        plt.title('Portfolio Comparison')

        stocks = Account.db.get_stocks(identifier, start_date, end_date)
        for i_plot, (model_name, history, plots) in enumerate(results):
            # Plotting stock
            plt.subplot(n_subplots + 1, 2, i_plot * 2 + 3)

            plt.plot([s.date for s in stocks], [s.close for s in stocks], linestyle='--')
            buys = [h for h in history if h.action == Action.BUY]
            sells = [h for h in history if h.action == Action.SELL]
            plt.scatter([buy.date for buy in buys], [buy.price for buy in buys], s=64, marker='^', c='#0DC661')
            plt.scatter([sell.date for sell in sells], [sell.price for sell in sells], s=64, marker='v', c='#FA3636')

            plt.legend([identifier, 'BUY', 'SELL'])
            plt.title('Stock for {}'.format(identifier))

            # Plotting indicators
            plt.subplot(n_subplots + 1, 2, i_plot * 2 + 4)
            x, ys, legends = plots
            for y in ys:
                plt.plot(x, y)

            plt.legend(legends)
            plt.title('Indicators for {}'.format(model_name))

        plt.show()
