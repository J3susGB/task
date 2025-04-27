import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../interfaces/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8000/api/tasks';

  constructor(private http: HttpClient) {}

  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${projectId}`);
  }

  addTaskToProject(projectId: number, task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}`, task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  completeAllTasks(projectId: number): Observable<Task[]> {
    return this.http.put<Task[]>(`${this.apiUrl}/${projectId}/complete-all`, {});
  }

  getProjectOwner(projectId: number): Observable<{ email: string }> {
    return this.http.get<{ email: string }>(`http://localhost:8000/api/projects/${projectId}/owner`);
  }
  
}