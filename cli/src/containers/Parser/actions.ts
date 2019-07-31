import {List} from 'immutable';
import {ITransactionLog} from '../../Models/ApiClient';
import moment from 'moment';

export enum ExportType {
  COMBINED_FINANCE = 'Parser/COMBINED_FINANCE',
  YNAB = 'Parser/YNAB',
}

export enum TransactionType {
  ABN = 'ABN',
  REVOLUT = 'REVOLUT',
  ICS = 'ICS',
}

const getFilteredTransactions = (transactions: ITransactionLog[], selected: List<boolean>): List<ITransactionLog> =>
  selected
    .map((isSelected, index) => isSelected ? transactions[index] : undefined)
    .filter((transaction: ITransactionLog | undefined): transaction is ITransactionLog =>
      transaction !== undefined);

const downloadCSV = (
  transactions: ITransactionLog[],
  selected: List<boolean>,
  csvHeader: string,
  csvRowBuilder: (transaction: ITransactionLog) => string,
  csvName: string
) => {
  const csvRows = getFilteredTransactions(transactions, selected).map(csvRowBuilder).join('\n');
  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvHeader}\n${csvRows}`);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', csvName);
  document.body.appendChild(link);

  link.click();
};

export const downloadCombinedFinanceCSV = (transactions: ITransactionLog[], selected: List<boolean>, owner: string) => {
  const csvRowBuilder = (transaction: ITransactionLog) => {
    const date = moment()
      .year(transaction.date[0])
      .month(transaction.date[1] - 1)
      .date(transaction.date[2])
      .format('D MMM, YYYY');
    const description = transaction.payee || transaction.memo;
    const amount = transaction.outFlow;
    return `${date}\t\t${description}\t${owner}\t${amount}`;
  };
  return downloadCSV(transactions, selected, '', csvRowBuilder, `Combined Finance ${moment().format('lll')}`);
};

export const downloadYnabCSV = (transactions: ITransactionLog[], selected: List<boolean>) => {
  const csvRowBuilder = (transaction: ITransactionLog) => {
    const date = moment()
      .year(transaction.date[0])
      .month(transaction.date[1] - 1)
      .date(transaction.date[2])
      .format('DD/MM/YYYY');
    const outFlow = Math.round(transaction.outFlow);
    const inFlow = Math.round(transaction.inFlow);
    return `${date},${transaction.payee},${transaction.memo},${outFlow},${inFlow}`;
  };
  return downloadCSV(
    transactions,
    selected,
    'Date,Payee,Memo,Outflow,Inflow',
    csvRowBuilder,
    `Ynab ${moment().format('lll')}`
  );
};
