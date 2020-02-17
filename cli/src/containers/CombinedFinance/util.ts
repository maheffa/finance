import { Transaction } from '../../api/ynab';

interface ITransGroup {
  year: number;
  month: number;
  transactions: Transaction[];
}

export enum TransactionGrouping {
  BY_MEMO = 'BY_MEMO',
  BY_PAYEE = 'BY_PAYEE',
  BY_USER = 'BY_USER',
}
export interface IStackedGroup {
  [key: string]: number;
}
export type GroupKey = {
  [key in TransactionGrouping]: (trans: Transaction) => string;
};
export type GroupName = {
  [key in TransactionGrouping]: string;
};
export const groupKey: GroupKey = {
  [TransactionGrouping.BY_PAYEE]: (trans: Transaction) => trans.payee.name,
  [TransactionGrouping.BY_USER]: (trans: Transaction) => trans.user.name,
  [TransactionGrouping.BY_MEMO]: (trans: Transaction) => trans.memo,
};
export const groupName: GroupName = {
  [TransactionGrouping.BY_PAYEE]: 'payee',
  [TransactionGrouping.BY_USER]: 'user',
  [TransactionGrouping.BY_MEMO]: 'category',
};

export const stackGroup = (group: ITransGroup, grouping: TransactionGrouping): IStackedGroup => {
  const res: IStackedGroup = {};
  for (const trans of group.transactions) {
    const key = groupKey[grouping](trans);
    if (key in res) {
      res[key] -= trans.amount;
    } else {
      res[key] = -trans.amount;
    }
  }

  return res;
};

export const groupTransactions = (transactions: Transaction[]): ITransGroup[] => {
  const sortedTransactions = transactions
    .filter(trans => trans.memo.trim().toLowerCase() !== 'payback')
    .map(trans => {
      if (trans.memo.trim() === '') {
        trans.memo = 'Uncategorized';
      }
      return trans;
    })
    .sort((a, b) => {
      const date1 = new Date(a.date[0], a.date[1] - 1, a.date[2]);
      const date2 = new Date(b.date[0], b.date[1] - 1, b.date[2]);
      return date1 < date2 ? -1 : 1;
    });
  const groupedByMonth: ITransGroup[] = [];

  let group: ITransGroup = {
    year: sortedTransactions[0].date[0],
    month: sortedTransactions[0].date[1],
    transactions: [],
  };
  groupedByMonth.push(group);

  for (const trans of sortedTransactions) {
    if (group.year !== trans.date[0] || group.month !== trans.date[1]) {
      group = {
        year: trans.date[0],
        month: trans.date[1],
        transactions: [],
      };
      groupedByMonth.push(group);
    }

    group.transactions.push(trans);
  }

  return groupedByMonth;
};
