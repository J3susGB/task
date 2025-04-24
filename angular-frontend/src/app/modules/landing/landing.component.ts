import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Creamos el formulario reactivo con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email requerido y válido
      password: ['', [Validators.required, Validators.minLength(6)]] // Password de al menos 6 caracteres
    });
  }

  // Función que se llama al enviar el formulario
  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/projects']); // redirige si login ok
      },
      error: () => {
        this.loginError = 'Credenciales inválidas';
      }
    });
  }
}
