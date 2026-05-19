import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header.component';
import { AuthService } from './core/auth/auth.service';
import { LoginComponent } from './pages/login/login.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  authService = inject(AuthService);
}
