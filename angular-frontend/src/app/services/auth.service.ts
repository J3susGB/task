import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root' // Este servicio estará disponible en toda la app
})
export class AuthService {

  private readonly API_URL = 'http://localhost:8000/api/login_check'; // URL del login de Symfony

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Login del usuario. Recibe email y password.
   * Llama al backend y guarda el token si todo va bien.
   */
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(this.API_URL, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token); // guardamos el JWT
      })
    );
  }

  /**
   * Devuelve el token actual del usuario (si existe).
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Elimina el token del almacenamiento local.
   * También redirige al usuario al login.
   */
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  /**
   * Comprueba si el usuario está autenticado (es decir, si hay token).
   */
  isAuthenticated(): boolean {
    return !!this.getToken(); // Devuelve true si hay token, false si no
  }
}
