import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TweetService {
  private apiUrl = `${environment.apiUrl}/tweets`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  createTweet(tweetData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, tweetData, { headers: this.getHeaders() });
  }

  getTweets(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }
}
