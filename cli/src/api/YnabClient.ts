import superagent from 'superagent';
import { HttpClient, RestResponse, RestApplicationClient } from './ynab';

class YnabClient implements HttpClient {
  private static getUrl(endpoint: string) {
    const host = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : window.location.origin;
    return `${host}/${endpoint}`;
  }

  private readonly agent = superagent.agent().accept('json');

  // tslint:disable-next-line
  public request<R>(requestConfig: { method: string; url: string; queryParams?: any; data?: any; copyFn?: (data: R) => R }): RestResponse<R> {
    if (requestConfig.queryParams && requestConfig.queryParams.transactionsFile) {
      // Special case for sending transactionsFile
      return new Promise((resolve, reject) => {
        this
          .agent
          .post(YnabClient.getUrl(requestConfig.url))
          .attach('transactionsFile', requestConfig.queryParams.transactionsFile)
          .end((err, response) => err ? reject(err) : resolve(response.body as R));
      });
    }

    if (requestConfig.method === 'POST') {
      return new Promise((resolve, reject) => this
        .agent
        .post(YnabClient.getUrl(requestConfig.url))
        .send(requestConfig.data)
        .then(response => resolve(response.body as R))
        .catch(reject));
    }

    return new Promise((resolve, reject) => this
      .agent
      .get(YnabClient.getUrl(requestConfig.url))
      .query(requestConfig.queryParams)
      .then(response => resolve(response.body as R))
      .catch(reject));
  }
}

export const ynabCli = new RestApplicationClient(new YnabClient());
