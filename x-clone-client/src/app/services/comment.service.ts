import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getCommentsByTweetId(tweetId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${tweetId}`, { headers: this.getHeaders() });
  }

  createComment(tweetId: string, commentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${tweetId}`, commentData, { headers: this.getHeaders() });
  }
}
