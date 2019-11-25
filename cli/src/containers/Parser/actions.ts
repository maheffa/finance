import { List } from 'immutable';
import moment from 'moment';
import { TransactionLog, TransactionCreateRequest } from '../../api/ynab';
import { ynabCli } from '../../api/YnabClient';
import { TransactionType } from './constants';

const getFilteredTransactions = (transactions: TransactionLog[], selected: List<boolean>): List<TransactionLog> =>
  selected
    .map((isSelected, index) => isSelected ? transactions[index] : undefined)
    .filter((transaction: TransactionLog | undefined): transaction is TransactionLog =>
      transaction !== undefined);

const downloadCSV = (
  transactions: TransactionLog[],
  selected: List<boolean>,
  csvHeader: string,
  csvRowBuilder: (transaction: TransactionLog) => string,
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

export const downloadCombinedFinanceCSV = (transactions: TransactionLog[], selected: List<boolean>, owner: string) => {
  const csvRowBuilder = (transaction: TransactionLog) => {
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

export const downloadYnabCSV = (transactions: TransactionLog[], selected: List<boolean>) => {
  const csvRowBuilder = (transaction: TransactionLog) => {
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

export const parseFile = (file: File | undefined, transactionType: TransactionType | undefined, actions: {
  setIsParsing: (value: boolean) => void,
  setFile: (value: File | undefined) => void,
  setParsed: (logs: TransactionLog[]) => void,
}) => {
  if (!file || !transactionType) {
    return;
  }

  const onSuccess = (logs: TransactionLog[]) => {
    actions.setIsParsing(false);
    actions.setFile(undefined);
    actions.setParsed(logs);
  };
  actions.setParsed([]);
  actions.setIsParsing(true);

  switch (transactionType) {
    case TransactionType.ABN:
      return ynabCli.parseAbnFile({ transactionsFile: file }).then(onSuccess);
    case TransactionType.REVOLUT:
      return ynabCli.parseRevolutFile({ transactionsFile: file }).then(onSuccess);
    case TransactionType.ICS:
      return ynabCli.parseIcsFile({ transactionsFile: file }).then(onSuccess);
  }
};

/*
TransactionCreateRequest {
  date: [number, number, number];
  payee: string;
  memo: string;
  amount: number;
  userId: number;
}
 */
export const importIntoCombined = (userId: number, selectedTransactions: List<boolean>, transactions: TransactionLog[]) => {
  return ynabCli.createTransaction({
    transactions: selectedTransactions
      .toArray()
      .map((selected, index) => ({ transaction: transactions[index], selected }))
      .filter(tr => tr.selected)
      .map(tr => tr.transaction)
      .map((transaction: TransactionLog): TransactionCreateRequest => ({
        userId,
        date: transaction.date,
        payee: transaction.payee,
        memo: transaction.memo,
        amount: transaction.inFlow - transaction.outFlow,
      })),
  });
};
