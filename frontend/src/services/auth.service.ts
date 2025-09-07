import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {


  private baseUrl = 'http://localhost:3000/api/auth'; // Spring Boot base URL

  constructor(private http: HttpClient) {}


  // From Sign up
  signup(data: any):Observable<any> {
    console.log("api called",data)
    return this.http.post(`${this.baseUrl}/signup`, data);
  }

// from login
  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }


  // from auth guard
isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false; 

  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000);

    return expiry > now;
  } catch (e) {
    return false;
  }
}

sendPasswordResetEmail(email: any):Observable<any> {
   return this.http.post(`${this.baseUrl}/forgot-password`, { email: email });
  }



  Resetpassword(payload:any):Observable<any>
{
  return this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, payload);
}




}



