import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

// Importamos el servicio de autenticación
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root' 
})
export class AuthGuard implements CanActivate {

  // Inyectamos el AuthService y el Router para comprobar estado y redirigir si hace falta
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Esta función decide si se puede activar (entrar) en una ruta protegida
  canActivate(): boolean {
    // Si el usuario está autenticado (si tiene un token en localStorage)
    if (this.authService.isAuthenticated()) {
      return true; // Le dejamos entrar
    }

    // Si no está autenticado, lo redirigimos al login
    this.router.navigate(['/']);
    return false; // No puede acceder a la ruta protegida
  }
}
