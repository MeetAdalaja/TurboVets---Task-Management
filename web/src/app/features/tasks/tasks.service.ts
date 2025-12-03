// web/src/app/features/tasks/tasks.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, TaskStatus } from '../../core/models';
import { Observable } from 'rxjs';

const API_BASE_URL = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${API_BASE_URL}/tasks`);
  }

  createTask(input: {
    title: string;
    description?: string;
    dueDate?: string;
    assignedToUserId?: string;
  }): Observable<Task> {
    return this.http.post<Task>(`${API_BASE_URL}/tasks`, input);
  }

  updateTask(
    id: string,
    changes: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      dueDate?: string;
      assignedToUserId?: string | null;
    }
  ): Observable<Task> {
    return this.http.patch<Task>(`${API_BASE_URL}/tasks/${id}`, changes);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/tasks/${id}`);
  }
}
