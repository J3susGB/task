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

  showForm = false;
  projectForm: FormGroup;
  isEditing = false;
  editingProjectId: number | null = null;

  isAdmin: boolean = false;
  currentUserEmail: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserEmail = this.authService.getCurrentUserEmail();
    this.loadProjects();
  }

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

  openForm(): void {
    this.showForm = true;
    this.projectForm.reset();
    this.isEditing = false;
    this.editingProjectId = null;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.projectForm.reset();
    this.isEditing = false;
    this.editingProjectId = null;
  }

  submitProject(): void {
    if (this.projectForm.invalid) return;

    const data = this.projectForm.value;

    if (this.isEditing && this.editingProjectId) {
      this.http.put(`http://localhost:8000/api/projects/${this.editingProjectId}`, data).subscribe(() => {
        this.loadProjects();
        this.cancelEdit();
      });
    } else {
      this.http.post('http://localhost:8000/api/projects', data).subscribe(() => {
        this.loadProjects();
        this.cancelEdit();
      });
    }
  }

  editProject(project: any): void {
    this.openForm();
    this.isEditing = true;
    this.editingProjectId = project.id;
    this.projectForm.patchValue({
      title: project.title,
      description: project.description
    });
  }

  deleteProject(id: number): void {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      this.http.delete(`http://localhost:8000/api/projects/${id}`).subscribe(() => {
        this.loadProjects();
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  goToTasks(projectId: number): void {
    this.router.navigate(['/tasks', projectId]);
  }

  canAccessProject(project: any): boolean {
    return project.user === this.currentUserEmail;
  }
    
  showNoAccess(): void {
    alert('You do not have access to this project.');
  }
  
}
