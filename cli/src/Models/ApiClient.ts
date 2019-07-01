import { HttpClient } from './HttpClient';

export interface ITransactionLog {
  date: [number, number, number];
  memo: string;
  payee: string;
  outFlow: number;
  inFlow: number;
}

export class ApiClient extends HttpClient {
  public uploadAbnReport(file: File) {
    return this.sendFile<ITransactionLog[]>('/upload/abn', 'transactions', file);
  }
}
