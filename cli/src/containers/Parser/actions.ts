import {List} from 'immutable';
import {ITransactionLog} from '../../Models/ApiClient';
import moment from 'moment';

export enum ExportType {
  COMBINED_FINANCE = 'Parser/COMBINED_FINANCE',
  YNAB = 'Parser/YNAB',
}

export const downloadCombinedFinanceCSV = (transactions: ITransactionLog[], selected: List<boolean>, owner: string) => {
  const csvContent = 'data:text/csv;charset=utf-8,' + selected
    .map((isSelected, index) => isSelected ? transactions[index] : undefined)
    .filter((transaction: ITransactionLog | undefined): transaction is ITransactionLog => transaction !== undefined)
    .map(transaction => ({
      date: moment()
        .year(transaction.date[0])
        .month(transaction.date[1] - 1)
        .date(transaction.date[2])
        .format('D MMM, YYYY'),
      description: transaction.payee || transaction.memo,
      amount: -transaction.outFlow,
    }))
    .map(it => `${it.date}\t\t${it.description}\t${owner}\t${it.amount}`)
    .join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  const displayDate = (t: ITransactionLog): string => moment()
    .year(t.date[0])
    .month(t.date[1] - 1)
    .date(t.date[2])
    .format('Do_MMM_YYYY');
  const fileName = `${displayDate(transactions[0])}_until_${displayDate(transactions[transactions.length - 1])}.csv`;
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);

  link.click();
};
