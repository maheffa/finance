import { HttpClient } from './HttpClient';
import {TransactionType} from '../containers/Parser/actions';

export interface ITransactionLog {
  date: [number, number, number];
  memo: string;
  payee: string;
  outFlow: number;
  inFlow: number;
}

export class ApiClient extends HttpClient {
  public uploadAbnReport(file: File, transactionType: TransactionType) {
    let endpoint: string = '';
    switch (transactionType) {
      case TransactionType.ABN:
        endpoint = '/parser/abn';
        break;
      case TransactionType.REVOLUT:
        endpoint = '/parser/revolut';
        break;
      case TransactionType.ICS:
        endpoint = '/parser/ics';
        break;
    }
    return this.sendFile<ITransactionLog[]>(endpoint, 'transactions', file);
  }
}
