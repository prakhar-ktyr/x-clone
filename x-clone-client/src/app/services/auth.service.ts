import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/signup`, user);
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, user).pipe(
      tap((response: any) => {
        if (response.token) {
          this.tokenStorage.saveToken(response.token);
          this.tokenStorage.saveUser(response.user);
        }
      })
    );
  }

  logout(): void {
    this.tokenStorage.signOut();
  }

  getUser(): any {
    return this.tokenStorage.getUser();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }
}
