import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Creamos el formulario reactivo con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email requerido y válido
      password: ['', [Validators.required, Validators.minLength(6)]] // Password de al menos 6 caracteres
    });
  }

  // Función que se llama al enviar el formulario
  onSubmit() {
    if (this.loginForm.invalid) {
      console.log('Formulario inválido');
      return;
    } else {
      const { email, password } = this.loginForm.value;

      // Aquí más adelante haremos la llamada al backend
      console.log('Enviar login a backend', { email, password });
    }
  }
}
