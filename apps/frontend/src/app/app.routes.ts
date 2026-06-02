import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { UsersListComponent } from './pages/admin/users-list.component';
import { MatchesListComponent } from './pages/matches/components/matches-list/matches-list.component';
import { MatchesFormComponent } from './pages/matches/components/matches-form/matches-form.component';
import { GuessBoardComponent } from './pages/guesses/components/guess-board/guess-board.component';
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
  { path: '', redirectTo: '/guesses', pathMatch: 'full' },
  { path: '**', redirectTo: '/guesses' }
];
