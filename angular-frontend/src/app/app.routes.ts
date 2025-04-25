import { Routes } from '@angular/router';
import { TasksComponent } from './modules/tasks/tasks.component';
import { LandingComponent } from './modules/landing/landing.component';
import { ProjectsComponent } from './modules/projects/projects.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
    { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
    { path: 'tasks/:id', component: TasksComponent, canActivate: [AuthGuard] }
];
