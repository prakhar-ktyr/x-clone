import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // Fetch chat messages between the logged-in user and another user
  getChatHistory(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, { headers: this.getHeaders() });
  }

  // Send a new message
  sendMessage(receiver: string, content: string): Observable<any> {
    return this.http.post(this.apiUrl, { receiver, content }, { headers: this.getHeaders() });
  }
  
}
