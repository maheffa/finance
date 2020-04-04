/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.15.527 on 2020-04-04 00:11:26.

export interface AuthRequest {
  password: string;
}

export interface TransactionControllerKt {
}

export interface Greeting {
  name: string;
}

export interface TransactionsCreateRequest {
  transactions: TransactionCreateRequest[];
}

export interface TransactionsUpdateRequest {
  transactions: TransactionUpdateRequest[];
}

export interface UserCreateRequest {
  name: string;
}

export interface User {
  id: number;
  created: [number, number, number, number, number, number];
  name: string;
}

export interface TransactionLog {
  date: [number, number, number];
  memo: string;
  payee: string;
  outFlow: number;
  inFlow: number;
}

export interface Transaction {
  id: number;
  created: [number, number, number, number, number, number];
  date: [number, number, number, number, number, number];
  memo: string;
  amount: number;
  user: User;
  payee: Payee;
}

export interface TransactionCreateRequest {
  date: [number, number, number];
  payee: string;
  memo: string;
  amount: number;
  userId: number;
}

export interface TransactionUpdateRequest {
  id: number;
  userId: number;
  date: [number, number, number];
  payee: string;
  memo: string;
  amount: number;
}

export interface Payee {
  id: number;
  name: string;
}

export interface HttpClient {

  request<R>(requestConfig: { method: string; url: string; queryParams?: any; data?: any; copyFn?: (data: R) => R; }): RestResponse<R>;
}

export class RestApplicationClient {

  constructor(protected httpClient: HttpClient) {
  }

  /**
   * HTTP POST /0/auth
   * Java method: com.manitrarivo.ynab.controllers.ApiController.auth
   */
  auth(request: AuthRequest): RestResponse<string> {
    return this.httpClient.request({ method: "POST", url: uriEncoding`0/auth`, data: request });
  }

  /**
   * HTTP GET /0/hello
   * Java method: com.manitrarivo.ynab.controllers.ApiController.hello
   */
  hello(): RestResponse<Greeting> {
    return this.httpClient.request({ method: "GET", url: uriEncoding`0/hello` });
  }

  /**
   * HTTP POST /api/parser/abn
   * Java method: com.manitrarivo.ynab.controllers.ParserController.parseAbnFile
   */
  parseAbnFile(queryParams?: { transactionsFile?: File; }): RestResponse<TransactionLog[]> {
    return this.httpClient.request({ method: "POST", url: uriEncoding`api/parser/abn`, queryParams: queryParams });
  }

  /**
   * HTTP POST /api/parser/ics
   * Java method: com.manitrarivo.ynab.controllers.ParserController.parseIcsFile
   */
  parseIcsFile(queryParams?: { transactionsFile?: File; }): RestResponse<TransactionLog[]> {
    return this.httpClient.request({ method: "POST", url: uriEncoding`api/parser/ics`, queryParams: queryParams });
  }

  /**
   * HTTP POST /api/parser/revolut
   * Java method: com.manitrarivo.ynab.controllers.ParserController.parseRevolutFile
   */
  parseRevolutFile(queryParams?: { transactionsFile?: File; }): RestResponse<TransactionLog[]> {
    return this.httpClient.request({ method: "POST", url: uriEncoding`api/parser/revolut`, queryParams: queryParams });
  }

  /**
   * HTTP GET /api/transaction/all
   * Java method: com.manitrarivo.ynab.controllers.TransactionController.allTransaction
   */
  allTransaction(queryParams?: { from?: string; to?: string; }): RestResponse<Transaction[]> {
    return this.httpClient.request({ method: "GET", url: uriEncoding`api/transaction/all`, queryParams: queryParams });
  }

  /**
   * HTTP POST /api/transaction/create
   * Java method: com.manitrarivo.ynab.controllers.TransactionController.createTransaction
   */
  createTransaction(request: TransactionsCreateRequest): RestResponse<Transaction[]> {
    return this.httpClient.request({ method: "POST", url: uriEncoding`api/transaction/create`, data: request });
  }

  /**
   * HTTP POST /api/transaction/update
   * Java method: com.manitrarivo.ynab.controllers.TransactionController.updateTransaction
   */
  updateTransaction(request: TransactionsUpdateRequest): RestResponse<Transaction[]> {
    return this.httpClient.request({ method: "POST", url: uriEncoding`api/transaction/update`, data: request });
  }

  /**
   * HTTP POST /api/user/create
   * Java method: com.manitrarivo.ynab.controllers.UserController.createUser
   */
  createUser(createRequest: UserCreateRequest): RestResponse<User> {
    return this.httpClient.request({ method: "POST", url: uriEncoding`api/user/create`, data: createRequest });
  }

  /**
   * HTTP GET /api/user/users
   * Java method: com.manitrarivo.ynab.controllers.UserController.getUsers
   */
  getUsers(): RestResponse<User[]> {
    return this.httpClient.request({ method: "GET", url: uriEncoding`api/user/users` });
  }
}

export type RestResponse<R> = Promise<R>;

function uriEncoding(template: TemplateStringsArray, ...substitutions: any[]): string {
  let result = "";
  for (let i = 0; i < substitutions.length; i++) {
    result += template[i];
    result += encodeURIComponent(substitutions[i]);
  }
  result += template[template.length - 1];
  return result;
}
