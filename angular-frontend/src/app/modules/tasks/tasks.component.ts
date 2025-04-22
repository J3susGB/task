import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';

import { TaskService } from '../../shared/services/task-service.service';
import { Task } from '../../shared/interfaces/task';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule, // Activa los formularios reactivos
    FormsModule // FormsModule para [(ngModel)]
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

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.loadTasks();

    this.searchControl.valueChanges.subscribe((value: string | null) => {
      const safeSearch = value ?? '';
      this.filteredTasks = this.tasks.filter(task =>
        task.title.toLowerCase().includes(safeSearch.toLowerCase())
      );
    });
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
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

    const newTask: Task = { id: 0, title, completed: false };

    this.taskService.addTask(newTask).subscribe(() => {
      this.loadTasks();
      this.toastService.showToast('✅ Task added successfully', 'success');
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
    console.log('Formulario enviado');
    console.log(this.taskForm.value);

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
    this.taskService.completeAllTasks().subscribe({
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
  
}
