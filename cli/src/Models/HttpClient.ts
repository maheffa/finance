import superagent from 'superagent';

const host = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : window.location.origin;

export class HttpClient {
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
    return `${host}/api${endpoint}`;
  }
}
