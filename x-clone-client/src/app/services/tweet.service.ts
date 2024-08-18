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

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  createTweet(tweetData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, tweetData, { headers: this.getHeaders() });
  }

  getTweets(page: number = 1, limit: number = 15): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`, { headers: this.getHeaders() });
  }

  getTweetsByUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { headers: this.getHeaders() });
  }

  getTweetsByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() });
  }

  getRetweetsByUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/retweets`, { headers: this.getHeaders() });
  }

  followUser(userId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/follow/follow/${userId}`, {}, { headers: this.getHeaders() });
  }

  unfollowUser(userId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/follow/unfollow/${userId}`, {}, { headers: this.getHeaders() });
  }

  likeTweet(tweetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/like/${tweetId}`, {}, { headers: this.getHeaders() });
  }

  unlikeTweet(tweetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/unlike/${tweetId}`, {}, { headers: this.getHeaders() });
  }

  getTweetById(tweetId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tweetId}`, { headers: this.getHeaders() });
  }

  bookmarkTweet(tweetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookmark/${tweetId}`, {}, { headers: this.getHeaders() });
  }
  
  unbookmarkTweet(tweetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/unbookmark/${tweetId}`, {}, { headers: this.getHeaders() });
  }

  getBookmarkedTweets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bookmarks`, { headers: this.getHeaders() });
  }  

  retweetTweet(tweetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/retweet/${tweetId}`, {}, { headers: this.getHeaders() });
  }
  
  unretweetTweet(tweetId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/unretweet/${tweetId}`, {}, { headers: this.getHeaders() });
  }  

  getTweetsFromFollowing(): Observable<any> {
    return this.http.get(`${this.apiUrl}/following`, { headers: this.getHeaders() });
  }
}
