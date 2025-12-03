// web/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { TasksPageComponent } from './features/tasks/tasks-page.component';
import { OrgUsersPageComponent } from './features/org-users/org-users-page.component';
import { authGuard } from './core/auth.guard';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      { path: 'tasks', component: TasksPageComponent },
      { path: 'org-users', component: OrgUsersPageComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
