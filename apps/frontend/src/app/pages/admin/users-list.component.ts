import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/auth/auth.service';
import { parseAuthError } from '../../core/utils/error-handler.util';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
      <!-- Page Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Painel de Administração
          </h1>
          <p class="text-gray-400 mt-1">Gerencie os usuários cadastrados, aprove cadastros e redefina senhas.</p>
        </div>
      </div>

      <!-- Feedback Alerts -->
      <div *ngIf="successMsg()" class="mb-6 bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3.5 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-md">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="font-medium text-sm">{{ successMsg() }}</span>
        </div>
        <button (click)="successMsg.set('')" class="text-blue-400 hover:text-blue-300 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div *ngIf="errorMsg()" class="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3.5 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-md">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span class="font-medium text-sm">{{ errorMsg() }}</span>
        </div>
        <button (click)="errorMsg.set('')" class="text-red-400 hover:text-red-300 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Controls & Search -->
      <div class="mb-6 flex flex-col sm:flex-row items-center gap-4 bg-gray-900/50 p-4 border border-gray-800 rounded-2xl backdrop-blur-md">
        <div class="relative w-full sm:max-w-xs">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input 
            type="text" 
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por nome ou e-mail..." 
            class="w-full pl-10 pr-4 py-2 bg-gray-850 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
          />
        </div>

        <button 
          (click)="loadUsers()"
          [disabled]="isLoading()"
          class="flex items-center gap-2 px-4 py-2 bg-gray-850 hover:bg-gray-800 border border-gray-750 text-sm font-medium text-gray-300 hover:text-white rounded-xl transition-all shadow-md ml-auto disabled:opacity-50">
          <svg class="w-4 h-4" [ngClass]="{'animate-spin': isLoading()}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2"></path>
          </svg>
          <span>Atualizar</span>
        </button>
      </div>

      <!-- Main Users Table Grid -->
      <div class="bg-gray-900/40 border border-gray-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div class="overflow-x-auto">
          <!-- Desktop Table View -->
          <table class="min-w-full divide-y divide-gray-800 hidden md:table">
            <thead class="bg-gray-950/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuário</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Função</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800 bg-transparent">
              <tr *ngFor="let user of filteredUsers()" class="hover:bg-gray-900/35 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                      {{ user.nome.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-white">{{ user.nome }}</div>
                      <div class="text-xs text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="text-xs px-2.5 py-1 rounded-full font-semibold border inline-block"
                    [ngClass]="{
                      'bg-blue-500/10 text-blue-400 border-blue-500/20': user.role === 'admin',
                      'bg-gray-500/10 text-gray-400 border-gray-500/20': user.role !== 'admin'
                    }">
                    {{ user.role | uppercase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 w-fit"
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': user.ativo,
                      'bg-amber-500/10 text-amber-400 border-amber-500/20': !user.ativo
                    }">
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="{'bg-emerald-400': user.ativo, 'bg-amber-400': !user.ativo}"></span>
                    <span>{{ user.ativo ? 'Ativo' : 'Inativo / Pendente' }}</span>
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-3">
                    <!-- Activate Action -->
                    <button 
                      *ngIf="!user.ativo"
                      (click)="activateUser(user.id)"
                      [disabled]="actionLoading() === user.id"
                      class="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50">
                      {{ actionLoading() === user.id ? 'Ativando...' : 'Aprovar / Ativar' }}
                    </button>

                    <!-- Reset Password Action -->
                    <button 
                      (click)="resetPassword(user.id)"
                      [disabled]="actionLoading() === user.id"
                      class="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50">
                      {{ actionLoading() === user.id ? 'Processando...' : 'Redefinir Senha' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile Cards View -->
          <div class="md:hidden divide-y divide-gray-800">
            <div *ngFor="let user of filteredUsers()" class="p-5 space-y-4 hover:bg-gray-900/20 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  {{ user.nome.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="text-sm font-semibold text-white">{{ user.nome }}</div>
                  <div class="text-xs text-gray-500">{{ user.email }}</div>
                </div>
              </div>
              <div class="flex gap-2">
                <span 
                  class="text-xs px-2 py-0.5 rounded-full font-semibold border inline-block"
                  [ngClass]="{
                    'bg-blue-500/10 text-blue-400 border-blue-500/20': user.role === 'admin',
                    'bg-gray-500/10 text-gray-400 border-gray-500/20': user.role !== 'admin'
                  }">
                  {{ user.role | uppercase }}
                </span>
                <span 
                  class="text-xs px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 w-fit"
                  [ngClass]="{
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': user.ativo,
                    'bg-amber-500/10 text-amber-400 border-amber-500/20': !user.ativo
                  }">
                  <span class="w-1 h-1 rounded-full" [ngClass]="{'bg-emerald-400': user.ativo, 'bg-amber-400': !user.ativo}"></span>
                  <span>{{ user.ativo ? 'Ativo' : 'Pendente' }}</span>
                </span>
              </div>
              <div class="flex items-center gap-2 pt-2 border-t border-gray-850">
                <!-- Activate Action -->
                <button 
                  *ngIf="!user.ativo"
                  (click)="activateUser(user.id)"
                  [disabled]="actionLoading() === user.id"
                  class="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold transition-all disabled:opacity-50">
                  {{ actionLoading() === user.id ? 'Ativando...' : 'Ativar' }}
                </button>

                <!-- Reset Password Action -->
                <button 
                  (click)="resetPassword(user.id)"
                  [disabled]="actionLoading() === user.id"
                  class="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  [ngClass]="{'w-full': user.ativo}">
                  {{ actionLoading() === user.id ? 'Processando...' : 'Redefinir' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty & Loading States -->
        <div *ngIf="isLoading() && filteredUsers().length === 0" class="py-20 flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-gray-400 text-sm font-medium">Buscando lista de usuários no servidor...</span>
        </div>

        <div *ngIf="!isLoading() && filteredUsers().length === 0" class="py-20 flex flex-col items-center justify-center text-center p-6">
          <svg class="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <h3 class="text-lg font-bold text-white mb-1">Nenhum usuário encontrado</h3>
          <p class="text-gray-400 text-sm max-w-sm">Tente redefinir a busca ou verifique se há usuários cadastrados.</p>
        </div>
      </div>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private authService = inject(AuthService);

  usersList = signal<User[]>([]);
  isLoading = signal(false);
  actionLoading = signal<string | null>(null);
  searchQuery = signal('');
  errorMsg = signal('');
  successMsg = signal('');

  // Computed state for filtered users
  filteredUsers = computed(() => {
    const list = this.usersList();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return list;
    return list.filter(u => 
      u.nome.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.errorMsg.set('');
    
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.usersList.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(parseAuthError(err));
        this.isLoading.set(false);
      }
    });
  }

  activateUser(id: string) {
    this.actionLoading.set(id);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.authService.activateUser(id).subscribe({
      next: () => {
        this.successMsg.set('Usuário ativado com sucesso e agora tem acesso ao portal!');
        this.actionLoading.set(null);
        this.loadUsers(); // refresh the list
      },
      error: (err) => {
        this.errorMsg.set(parseAuthError(err));
        this.actionLoading.set(null);
      }
    });
  }

  resetPassword(id: string) {
    this.actionLoading.set(id);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.authService.resetUserPassword(id).subscribe({
      next: (res) => {
        this.successMsg.set(res.message || 'E-mail de recuperação de senha enviado com sucesso!');
        this.actionLoading.set(null);
      },
      error: (err) => {
        this.errorMsg.set(parseAuthError(err));
        this.actionLoading.set(null);
      }
    });
  }
}
