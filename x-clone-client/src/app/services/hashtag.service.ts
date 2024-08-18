import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HashtagService {
  private apiUrl = `${environment.apiUrl}/tweets`;

  constructor(private http: HttpClient) {}

  getTrendingHashtags(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trending-hashtags`);
  }
}
