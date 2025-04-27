import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';

import { TaskService } from '../../shared/services/task-service.service';
import { Task } from '../../shared/interfaces/task';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  taskForm!: FormGroup;
  searchControl = new FormControl('');
  completedFilter: string = '';
  orderFilter: string = 'asc';
  projectId!: number;
  canEdit: boolean = false;

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('projectId');
  
    if (!paramId) {
      this.toastService.showToast('❌ Project ID not found in URL', 'error');
      this.router.navigate(['/projects']);
      return;
    }
  
    this.projectId = Number(paramId);
  
    if (isNaN(this.projectId) || this.projectId <= 0) {
      this.toastService.showToast('❌ Invalid project ID', 'error');
      this.router.navigate(['/projects']);
      return;
    }
  
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  
    this.loadTasks();
  }
  

  loadTasks(): void {
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = this.tasks;
        this.applyFilters();
      },
      error: (err) => console.error('Error fetching tasks:', err)
    });
  }

  addTask(title: string): void {
    if (!title.trim()) return;

    const newTask: Partial<Task> = { title, completed: false };

    this.taskService.addTaskToProject(this.projectId, newTask).subscribe({
      next: () => {
        this.loadTasks();
        this.toastService.showToast('✅ Task added successfully', 'success');
      },
      error: () => {
        this.toastService.showToast('❌ Error creating task', 'error');
      }
    });
  }

  toggleTask(task: Task): void {
    task.completed = !task.completed;
    this.taskService.updateTask(task).subscribe(() => this.loadTasks());
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe(() => {
      this.loadTasks();
      this.toastService.showToast('🗑️ Task deleted successfully', 'error');
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const title = this.taskForm.value.title;
      this.addTask(title);
      this.taskForm.reset();
    }
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks
      .filter(task => {
        if (this.completedFilter === 'true') return task.completed;
        if (this.completedFilter === 'false') return !task.completed;
        return true;
      })
      .sort((a, b) => {
        if (this.orderFilter === 'asc') return a.id - b.id;
        else return b.id - a.id;
      });
  }

  completeAllTasks(): void {
    this.taskService.completeAllTasks(this.projectId).subscribe({
      next: (updatedTasks) => {
        this.tasks = updatedTasks;
        this.filteredTasks = updatedTasks;
        this.toastService.showToast('✅ All tasks marked as completed!', 'success');
      },
      error: (err) => {
        console.error('Error completing all tasks:', err);
        this.toastService.showToast('❌ Error completing tasks', 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
