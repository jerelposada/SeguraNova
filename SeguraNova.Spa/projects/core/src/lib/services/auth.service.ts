import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  public signIn(email: string, password: string): Observable<{ success: boolean }>  {
    sessionStorage.setItem('authToken', 'fake-jwt-token');
    return of({ success: true }).pipe(delay(1000));
  }
}
