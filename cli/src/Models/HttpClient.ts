import superagent from 'superagent';

export class HttpClient {
  private readonly BE_URL = 'http://127.0.0.1:8080/api';
  private readonly agent = superagent.agent().accept('json');

  public post<Request, Response>(endpoint: string, body: Request): Promise<Response> {
    return new Promise((resolve, reject) => this.agent.post(this.getUrl(endpoint), (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.body as Response);
      }
    }));
  }

  public async sendFile<Response>(endpoint: string, fileName: string, fileContent: File): Promise<Response> {
    return new Promise((resolve, reject) => this
      .agent
      .post(this.getUrl(endpoint))
      .attach(fileName, fileContent)
      .end((err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.body as Response);
        }
      })
    );
  }

  private getUrl(endpoint: string) {
    return `${this.BE_URL}${endpoint}`;
  }
}
