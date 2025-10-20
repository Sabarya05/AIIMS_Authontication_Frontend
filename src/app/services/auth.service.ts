import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Admin {
  id: number;
  username: string;
  email: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentAdminSubject: BehaviorSubject<Admin | null>;
  public currentAdmin: Observable<Admin | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedAdmin = localStorage.getItem('currentAdmin');
    this.currentAdminSubject = new BehaviorSubject<Admin | null>(
      storedAdmin ? JSON.parse(storedAdmin) : null
    );
    this.currentAdmin = this.currentAdminSubject.asObservable();
  }

  public get currentAdminValue(): Admin | null {
    return this.currentAdminSubject.value;
  }

  login(email: string, password: string): Observable<Admin> {
    const requestBody = {
      email, 
      password
    };
    
    console.log('Sending login request:', requestBody);
    
    return this.http.post<Admin>(`${this.apiUrl}/auth/login`, requestBody)
      .pipe(tap(admin => {
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        this.currentAdminSubject.next(admin);
        this.router.navigate(['/dashboard']);
      }));
  }

  register(username: string, email: string, password: string): Observable<Admin> {
    const requestBody = {
      username, 
      email, 
      password
    };
    
    return this.http.post<Admin>(`${this.apiUrl}/auth/register`, requestBody);
  }

  logout(): void {
    localStorage.removeItem('currentAdmin');
    this.currentAdminSubject.next(null);
    this.router.navigate(['/login']);
  }
}