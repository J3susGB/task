import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly API_URL = 'http://localhost:8000/api/users'; 
  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Obtiene la lista de todos los usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}`);
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(userData: { email: string; password: string; roles?: string[] }): Observable<any> {
    return this.http.post(`${this.API_URL}`, userData);
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: number, updatedData: { email?: string; password?: string; roles?: string[] }): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, updatedData);
  }

  /**
   * Elimina un usuario
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
