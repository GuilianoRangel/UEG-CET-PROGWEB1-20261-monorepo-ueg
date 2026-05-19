import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-50 w-full bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo / Title -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center gap-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 hover:opacity-95 transition-opacity">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span>UEG Secure Portal</span>
            </a>
          </div>

          <!-- Navigation / Actions -->
          <nav class="flex items-center gap-6">
            @if (authService.isAuth()) {
              <!-- Navigation Links -->
              <div class="hidden sm:flex items-center gap-4 mr-4 border-r border-gray-800 pr-6">
                @if (authService.isAdmin()) {
                  <a 
                    routerLink="/admin" 
                    routerLinkActive="text-blue-400 border-blue-400" 
                    [routerLinkActiveOptions]="{exact: true}"
                    class="text-sm font-medium text-gray-300 hover:text-white transition-colors py-1 border-b-2 border-transparent">
                    Painel Admin
                  </a>
                }
              </div>

              <!-- User Information & Logout -->
              <div class="flex items-center gap-4">
                <div class="flex flex-col items-end hidden md:flex">
                  <span class="text-sm font-medium text-white">{{ authService.currentUser()?.nome }}</span>
                  <span 
                    class="text-xs px-2 py-0.5 rounded-full font-semibold border"
                    [ngClass]="{
                      'bg-blue-500/10 text-blue-400 border-blue-500/20': authService.isAdmin(),
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': !authService.isAdmin()
                    }">
                    {{ authService.currentUser()?.role | uppercase }}
                  </span>
                </div>
                
                <button 
                  (click)="logout()" 
                  class="flex items-center gap-1.5 px-4 py-2 bg-gray-900 border border-gray-850 hover:bg-gray-800 text-sm font-medium text-red-400 hover:text-red-300 rounded-xl transition-all shadow-md">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            } @else {
              <div class="flex items-center gap-4">
                <a 
                  routerLink="/login" 
                  class="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Entrar
                </a>
                <a 
                  routerLink="/register" 
                  class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium shadow-md shadow-emerald-500/20 transition-all">
                  Cadastrar
                </a>
              </div>
            }
          </nav>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
