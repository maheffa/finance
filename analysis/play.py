from typing import Tuple
import math
from matplotlib import pyplot as plt


WEALTH_TAX_BRACKETS = [(30360, 0), (102000, 0.0058), (1000000, 0.0134), (math.inf, 0.0136)]
WEALTH_INTEREST_TAX = 0.3

#
#
# def calc_with_start_and_tax(inv: Investment, start, n, tax_interest=True):
#     gross = start * (1 + inv.interest) ** n + inv.monthly * ((1 + inv.interest) ** n - 1) / inv.
#     res = 0
#     for upper_limit, rate in WEALTH_TAX_BRACKETS:
#         if gross <= 0:
#             break
#         to_tax = min(gross, upper_limit)
#         gross -= to_tax
#         res += to_tax * (1 - rate)
#         if gross > upper_limit:
#             res += upper_limit * (1 - rate)
#             gross -= upper_limit
#     if res > MIN_WEALTH_TAXABLE:
#         res = MIN_WEALTH_TAXABLE + (res - MIN_WEALTH_TAXABLE) * (1 - WEALTH_TAX)
#     return res


class Investment:
    def __init__(self, monthly, months, interest):
        self.monthly = monthly
        self.months = months
        self.interest = interest

    def get_params(self, **kwargs):
        a = kwargs.get('monthly', self.monthly)
        n = kwargs.get('months', self.months)
        i = kwargs.get('interest', self.interest)
        return a, n, i

    def gross(self, start=0, **kwargs):
        a, n, i = self.get_params(**kwargs)
        return start * (1 + i) ** n + a * ((1 + i) ** n - 1) / i

    def net(self, start=0, **kwargs):
        gross_value = self.gross(start=start, **kwargs)
        gross_interest = self.gross_interest(start=start, **kwargs)
        interest_tax = gross_interest * WEALTH_INTEREST_TAX
        gross_value -= interest_tax

        result = 0
        for upper_limit, rate in WEALTH_TAX_BRACKETS:
            if gross_value <= 0:
                break
            to_tax = min(gross_value, upper_limit)
            gross_value -= to_tax
            result += to_tax * (1 - rate)

        return result

    def contributed(self, **kwargs):
        a, n, _ = self.get_params(**kwargs)
        return a * n

    def gross_interest(self, start=0, **kwargs):
        return self.gross(start=start, **kwargs) - self.contributed(**kwargs) - start

    def net_interest(self, start=0, **kwargs):
        return self.gross(start=start, **kwargs) - self.net(start=start, **kwargs)


def portfolio(monthly, n_months, interest, apply_wealth_tax=True, stop_at_month=None):
    if interest <= 0:
        raise Exception('Interest cannot be negative')
    if not apply_wealth_tax:
        return monthly * ((1 + interest) ** n_months - 1) / interest

    n_year_month = 12
    total_port = 0
    # while n_months > n_year_month:
    #     n_months -= n_year_month
    #     total_port = calc_with_start_and_tax(total_port, n_year_month)
    #
    # if n_months > 0:
    #     total_port = calc_with_start_and_tax(total_port, n_months)

    return total_port


def total_tax(monthly, n_months, interest):
    without_tax = portfolio(monthly, n_months, interest, apply_wealth_tax=False)
    with_tax = portfolio(monthly, n_months, interest)
    return without_tax - with_tax


def total_tax_rate(monthly, n_months, interest):
    return total_tax(monthly, n_months, interest) / portfolio_interest(monthly, n_months, interest, apply_wealth_tax=False)


def contributed(monthly, n_months):
    return monthly * n_months


def portfolio_interest(monthly, n_months, interest, apply_wealth_tax=True):
    return portfolio(monthly, n_months, interest, apply_wealth_tax=apply_wealth_tax) - contributed(monthly, n_months)


def portfolio_interest_rate(monthly, n_months, interest):
    return portfolio_interest(monthly, n_months, interest) / contributed(monthly, n_months)


# Monthly
abn_avg_interest = 0.006
abn_bad_interest = 0.00000000000001
abn_good_interest = 0.0115


def distance(monthly, max_n, dist_check=10000, interest=abn_avg_interest, apply_wealth_tax=True):
    cur_port = 0
    cur_n = 1
    res = []
    for n in range(1, max_n):
        port = portfolio_interest(monthly, n, interest, apply_wealth_tax=apply_wealth_tax)
        if port - cur_port > dist_check:
            print('[{}] Took {} from {:.2f} to {:.2f}'.format(str_time(n), str_time(n - cur_n), cur_port, port))
            cur_port = port
            cur_n = n
            res.append(n)
    return res


def str_time(n_months):
    if n_months < 12:
        return '{} months'.format(n_months)
    if n_months % 12 == 0:
        return '{} years'.format(n_months // 12)
    return '{} years, {} months'.format(n_months // 12, n_months % 12)


if __name__ == '__main__':
    # m_n = 12 * 10
    # m = 1000
    # d = 10000
    #
    # x = [i for i in range(1, m_n)]
    # plt.plot(x, [portfolio(m, n, abn_good_interest) for n in range(1, m_n)], label='Taxed')
    # plt.plot(x, [portfolio(m, n, abn_good_interest, apply_wealth_tax=False) for n in range(1, m_n)], linestyle='dashed', label='Gross')
    #
    # l = True
    # label = 'Accumulated {} of interest, Taxed'.format(d)
    # for dists in distance(m, m_n, dist_check=d, interest=abn_good_interest):
    #     plt.vlines(dists, 0, 100000, color='green', label=label if l else None)
    #     l = False
    #
    # l = True
    # label = 'Accumulated {} of interest, Gross'.format(d)
    # for dists in distance(m, m_n, dist_check=d, apply_wealth_tax=False, interest=abn_good_interest):
    #     plt.vlines(dists, 0, 100000, color='green', linestyles='dashed', label=label if l else None)
    #     l = False
    # # portfolio_interest_rate(1000, 12, 0.006)
    #
    # plt.legend()
    # plt.show()
    inv = Investment(500, 120, 0.01)
    a0 = [inv.gross(start=0, months=n_month) for n_month in range(1, inv.months)]
    b0 = [inv.net(start=0, months=n_month) for n_month in range(1, inv.months)]

    plt.plot(list(range(1, inv.months)), a0, label='Gross', linestyle='dashed')
    plt.plot(list(range(1, inv.months)), b0, label='Net')
    plt.legend()
    plt.show()
