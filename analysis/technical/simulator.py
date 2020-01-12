import datetime
import logging
from typing import List, Tuple

import matplotlib.pyplot as plt

from data.db import DB
from technical.account import AccountSnapshot, History, Action, Account
from technical.models.buyandhold import BuyAndHold

memo_base_snapshots = {}


def get_base_snapshots(portfolio_size, stock: str, start_date: datetime.date, end_date: datetime.date) -> List[AccountSnapshot]:
    if (portfolio_size, stock, start_date, end_date) not in memo_base_snapshots:
        logging.info('Calculating BuyAndHold for ranking, key = {},{},{},{}'.format(portfolio_size, stock, start_date,
                                                                                    end_date))
        base_model = BuyAndHold(start_portfolio=portfolio_size)
        base_simulator = Simulator()
        history, _ = base_simulator.run(base_model, stock, start_date, end_date)
        memo_base_snapshots[(portfolio_size, stock, start_date, end_date)] = base_simulator.snapshots

    return memo_base_snapshots[(portfolio_size, stock, start_date, end_date)]


def get_snapshots_ema(snapshots: List[AccountSnapshot]) -> List[Tuple[datetime.date, float]]:
    n_days = 5
    emas: List[Tuple[datetime.date, float]] = [(snapshots[0].date, snapshots[0].size())]

    for i in range(len(snapshots) - 1):
        #  self.ema_values[ema_id] = (cur_value - val) * 2 / (n_days + 1) + val
        (_, prev) = emas[i]
        emas.append((snapshots[i + 1].date, (snapshots[i + 1].size() - prev) * 2 / (n_days + 1) + prev))

    return emas


class Simulator:
    def __init__(self):
        self.snapshots: List[AccountSnapshot] = []
        self.history: List[History] = []
        self.stock_name = None

    def run(self, model, stock_name, start_date, end_date):
        self.snapshots = []
        self.history = []
        self.stock_name = stock_name
        stocks = Account.db.get_stocks(stock_name, start_date, end_date)

        for stock in stocks:
            model.execute(stock)
            self.snapshots.append(model.account.snapshot(stock.date))

        self.history = model.account.history
        return model.account.history, model.get_plots()

    def rank(self):
        action_score = self.action_score()
        portfolio_score = self.portfolio_score()

        factor = 1 + abs(action_score)

        if action_score * portfolio_score > 0:
            return portfolio_score * factor
        else:
            return portfolio_score / factor

    def portfolio_score(self):
        """
        Using BuyAndHold to measure model performance
        """
        if len(self.snapshots) == 0:
            return 0

        start_date = self.snapshots[0].date
        end_date = self.snapshots[-1].date
        portfolio = self.snapshots[0].size()
        base_snapshots = get_base_snapshots(portfolio, self.stock_name, start_date, end_date)

        # Taking precaution in case dates don't match
        done = False
        i_model = 0
        i_base = 0
        total_diff = 0
        n_days = 0
        base_ema = get_snapshots_ema(base_snapshots)
        model_ema = get_snapshots_ema(self.snapshots)

        while not done:
            (base_date, base_portfolio) = base_ema[i_base]
            (model_date, model_portfolio) = model_ema[i_model]

            total_diff += model_portfolio - base_portfolio

            if base_date == model_date:
                if base_date == end_date:
                    done = True
                else:
                    i_base += 1
                    i_model += 1
            elif base_date < model_date:
                i_base += 1
            else:
                i_model += 1

            n_days += 1

        return (total_diff * 1.0 / portfolio) / n_days

    def action_score(self):
        if len(self.history) <= 1:
            return 0

        # Factor over price going UP
        consequent_action_multiplier_score = {
            Action.BUY: {
                Action.SELL: 1,  # Buy low, sell high
                Action.SHORT: 0,  # You can't short without selling. This is here just in case
                Action.BUY: 0,
            },
            Action.SELL: {
                Action.BUY: -1,  # Sell low, buy high is bad
                Action.SHORT: 0,  # Hard to tell
                Action.SELL: 0,
            },
            Action.SHORT: {
                Action.BUY: -1,  # Short low, buy high is bad
                Action.SELL: 0,
                Action.SHORT: 0,
            }
        }
        logging.debug(self.history)

        prev = self.history[0]
        total_score = 0

        for cur in self.history[1:]:
            movement = 1 if cur.price >= prev.price else 0
            total_score += movement * consequent_action_multiplier_score[prev.action][cur.action]

        return total_score * 1.0 / (len(self.history) - 1)

    def analysis(self):
        plt.plot([snap.size() for snap in self.snapshots])
        plt.ylabel('Portfolio size')
        plt.show()
