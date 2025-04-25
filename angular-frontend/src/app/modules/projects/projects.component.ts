import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projects: any[] = [];
  isLoading = true;
  error = '';

  // Variables del formulario
  showForm = false;
  projectForm: FormGroup;
  isEditing = false;
  editingProjectId: number | null = null;

  isAdmin: boolean = false;
  currentUserEmail: string | null = null; // email del usuario logueado

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    // Inicializamos el formulario reactivo con validaciones
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserEmail = this.authService.getCurrentUserEmail(); // Obtenemos email
    this.loadProjects();
  }

  // Cargar proyectos desde el backend
  loadProjects(): void {
    this.http.get<any[]>('http://localhost:8000/api/projects').subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Hubo un error al cargar tus proyectos';
        this.isLoading = false;
      }
    });
  }

  // Mostrar formulario para crear nuevo proyecto
  openForm(): void {
    this.showForm = true;
    this.projectForm.reset();
    this.isEditing = false;
    this.editingProjectId = null;
  }

  // Cancelar creación o edición
  cancelEdit(): void {
    this.showForm = false;
    this.projectForm.reset();
    this.isEditing = false;
    this.editingProjectId = null;
  }

  // Enviar formulario (crear o editar)
  submitProject(): void {
    if (this.projectForm.invalid) return;

    const data = this.projectForm.value;

    if (this.isEditing && this.editingProjectId) {
      // Editar proyecto
      this.http.put(`http://localhost:8000/api/projects/${this.editingProjectId}`, data).subscribe(() => {
        this.loadProjects();
        this.cancelEdit();
      });
    } else {
      // Crear nuevo proyecto
      this.http.post('http://localhost:8000/api/projects', data).subscribe(() => {
        this.loadProjects();
        this.cancelEdit();
      });
    }
  }

  // Cargar proyecto en el formulario para editar
  editProject(project: any): void {
    this.openForm();
    this.isEditing = true;
    this.editingProjectId = project.id;
    this.projectForm.patchValue({
      title: project.title,
      description: project.description
    });
  }

  // Eliminar proyecto
  deleteProject(id: number): void {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.http.delete(`http://localhost:8000/api/projects/${id}`).subscribe(() => {
        this.loadProjects();
      });
    }
  }

  // Cerrar sesión
  logout(): void {
    this.authService.logout();
  }

  // Ir a task de cada proyecto
  goToTasks(projectId: number): void {
    this.router.navigate(['/tasks', projectId]);
  }

}
