import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { UsersListComponent } from './pages/admin/users-list.component';
import { authGuard, adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  {
    path: 'admin',
    component: UsersListComponent,
    canActivate: [authGuard, adminGuard]
  },
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: '**', redirectTo: '/admin' }
];
