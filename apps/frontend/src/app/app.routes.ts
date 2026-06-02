import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { UsersListComponent } from './pages/admin/users-list.component';
import { authGuard, adminGuard } from './core/auth/auth.guard';
import { MatchesListComponent } from './matches/matches-list.component';
import { MatchesFormComponent } from './matches/matches-form.component';
import { GuessBoardComponent } from './guesses/guess-board.component';
import { inject } from '@angular/core';
import { AuthService } from './core/auth/auth.service';

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
  {
    path: 'admin/matches',
    component: MatchesListComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/matches/new',
    component: MatchesFormComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/matches/:id/edit',
    component: MatchesFormComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'guesses',
    component: GuessBoardComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: () => {
      const authService = inject(AuthService);
      return authService.isAdmin() ? '/admin' : '/guesses';
    },
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: () => {
      const authService = inject(AuthService);
      return authService.isAdmin() ? '/admin' : '/guesses';
    }
  }
];
