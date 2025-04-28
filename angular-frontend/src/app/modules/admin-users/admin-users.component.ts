import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  userForm!: FormGroup;
  editingUserId: number | null = null;
  loading: boolean = false;
  animateTable = false; // <- Para controlar la animación

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // Inicializamos el formulario
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]], 
      roles: ['', Validators.required]
    });

    // Cargamos los usuarios al iniciar
    this.loadUsers();
  }

  // Cargar todos los usuarios
  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.loading = false;
        this.triggerAnimation(); // <-- lanzamos animación
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  // Al enviar el formulario (crear o actualizar)
  onSubmit(): void {
    if (this.userForm.invalid) return;

    const formData = { ...this.userForm.value };

    // Convertir roles: de string a array (si roles es string)
    if (typeof formData.roles === 'string') {
      formData.roles = formData.roles
        .split(',')
        .map((role: string) => role.trim())
        .filter((role: string) => role.length > 0); // Elimina vacíos
    }

    // Si estamos editando y la contraseña está vacía, no mandarla
    if (this.editingUserId) {
      if (!formData.password || formData.password.trim() === '') {
        delete formData.password;
      }
    } else {
      // Si estamos creando un usuario, el password es obligatorio y mínimo 6 caracteres
      if (!formData.password || formData.password.trim().length < 6) {
        // Forzamos error visual en el formulario
        this.userForm.get('password')?.setErrors({ minlength: true });
        return;
      }
    }

    if (this.editingUserId) {
      // Actualizar usuario existente
      this.userService.updateUser(this.editingUserId, formData).subscribe({
        next: () => {
          this.loadUsers();
          this.resetForm();
        },
        error: (err: any) => console.error('Error updating user:', err)
      });
    } else {
      // Crear nuevo usuario
      this.userService.createUser(formData).subscribe({
        next: () => {
          this.loadUsers();
          this.resetForm();
        },
        error: (err: any) => console.error('Error creating user:', err)
      });
    }
  }

  // Preparar el formulario para editar un usuario
  editUser(user: User): void {
    this.editingUserId = user.id;
    this.userForm.patchValue({
      email: user.email,
      roles: user.roles.join(','), // 🔥 convertimos el array en string separado por comas
      password: '' // No mostramos la contraseña existente
    });
  }  

  // Eliminar un usuario
  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err: any) => console.error('Error deleting user:', err)
      });
    }
  }

  // Reiniciar el formulario
  resetForm(): void {
    this.editingUserId = null;
    this.userForm.reset();
  }

  logout(): void {
    this.userService.logout();
  }

  // animación cuando cambia la tabla
  private triggerAnimation(): void {
    this.animateTable = false;
    setTimeout(() => this.animateTable = true, 50);
  }
}
