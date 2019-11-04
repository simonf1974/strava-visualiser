import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class StravaService {
  incrementCount: BehaviorSubject<any>;
  propagateMsg: BehaviorSubject<any>;
  token: string;

  constructor(private http: HttpClient) {
    this.incrementCount = new BehaviorSubject(null);
    this.propagateMsg = new BehaviorSubject(null);
  }

  //Strava API calls

  private getStravaToken(): Promise<string> {
    if (this.token !== undefined)
      return new Promise(resolve => {
        console.log("already got a token");
        resolve(this.token);
      });

    console.log("need to get a token");

    const url = "https://www.strava.com/oauth/token";
    const data = {
      client_id: "39755",
      client_secret: "ab08660dcf7919ca0dac4111a8e1963aa9183c0d",
      code: "072cc35b6b4327aca112a1f9fb1f05709a167288",
      grant_type: "authorization_code"
    };
    return this.http
      .post(url, data)
      .toPromise()
      .then((token: any) => {
        this.token = token.access_token;
        return this.token;
      });
  }

  async getStravaData(api: string, suffix: string): Promise<any> {
    const token: string = await this.getStravaToken();
    const baseUrl = "https://www.strava.com/api/v3/";
    const fullUrl = `${baseUrl}${api}?access_token=${token}${suffix}`;

    this.incrementCount.next("numStravaApiCallsMade");
    return this.http
      .get(fullUrl, { observe: "response" })
      .toPromise()
      .then((res: HttpResponse<any>) => {
        this.incrementCount.next("numStravaApiCallsDone");
        this.propagateMsg.next({
          key: "httpDetails",
          error: `HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}`
        });
        console.log(
          `Strava API succeeded: HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}`
        );
        if (res.status === 200) return res.body;
        else return null;
      })
      .catch((res: HttpErrorResponse) => {
        this.incrementCount.next("numStravaApiCallsDone");
        this.propagateMsg.next({
          key: "httpDetails",
          error: `HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}, Message: ${res.error.message}`
        });
        console.log(
          `Strava API error: HTTP Status: ${res.status}, HTTP Status Text ${res.statusText}, Message: ${res.error.message}`
        );
        return null;
      });
  }
}
