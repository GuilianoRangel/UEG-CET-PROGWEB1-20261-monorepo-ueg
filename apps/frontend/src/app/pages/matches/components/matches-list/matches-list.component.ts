import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import { MatchDto } from '@repo/utils';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../../shared/components/ui/card.component';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge.component';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
      <!-- Page Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-foreground">
            Gerenciamento de Jogos
          </h1>
          <p class="text-muted-foreground mt-1">Crie, edite e encerre jogos da Copa do Mundo para recebimento de palpites.</p>
        </div>
        <div>
          <a routerLink="/admin/matches/new" ui-button variant="default" class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Novo Jogo</span>
          </a>
        </div>
      </div>

      <!-- Feedback Alerts -->
      <div *ngIf="successMsg()" class="mb-6 bg-success/10 border border-success/20 text-success px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="font-medium text-sm">{{ successMsg() }}</span>
        </div>
        <button (click)="successMsg.set('')" class="text-success hover:text-success/80 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div *ngIf="errorMsg()" class="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span class="font-medium text-sm">{{ errorMsg() }}</span>
        </div>
        <button (click)="errorMsg.set('')" class="text-destructive hover:text-destructive/80 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Main Matches Grid/Table -->
      <ui-card>
        <div class="overflow-x-auto">
          <!-- Desktop Table View -->
          <table class="min-w-full divide-y divide-border hidden md:table">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Partida</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data e Hora</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estádio / Juiz</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Placares Disponíveis</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border bg-transparent">
              <tr *ngFor="let match of matchesList(); trackBy: trackById" class="hover:bg-muted/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-foreground text-sm">{{ match.teamA }}</span>
                    <span class="text-xs text-muted-foreground px-1 bg-muted rounded">VS</span>
                    <span class="font-bold text-foreground text-sm">{{ match.teamB }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-foreground">{{ match.matchDate | date:'dd/MM/yyyy HH:mm' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-foreground">{{ match.stadium }}</div>
                  <div class="text-xs text-muted-foreground">Árb: {{ match.referee }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let opt of match.options" class="px-2 py-0.5 text-xs bg-primary/5 text-primary border border-primary/10 rounded-md font-medium">
                      {{ opt.teamAScore }} x {{ opt.teamBScore }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <ui-badge [variant]="isClosed(match) ? 'secondary' : 'success'">
                    {{ isClosed(match) ? 'Encerrado' : 'Aberto' }}
                  </ui-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      *ngIf="!isClosed(match)"
                      ui-button
                      variant="secondary"
                      size="sm"
                      (click)="closeMatch(match.id)"
                      [disabled]="actionLoading() === match.id">
                      {{ actionLoading() === match.id ? 'Encerrando...' : 'Encerrar' }}
                    </button>
                    <a 
                      [routerLink]="['/admin/matches', match.id, 'edit']"
                      ui-button
                      variant="outline"
                      size="sm">
                      Editar
                    </a>
                    <button 
                      ui-button
                      variant="destructive"
                      size="sm"
                      (click)="confirmDelete(match)"
                      [disabled]="actionLoading() === match.id">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile Cards View -->
          <div class="md:hidden divide-y divide-border">
            <div *ngFor="let match of matchesList(); trackBy: trackById" class="p-5 space-y-4 hover:bg-muted/50 transition-colors">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">{{ match.matchDate | date:'dd/MM/yyyy HH:mm' }}</span>
                <ui-badge [variant]="isClosed(match) ? 'secondary' : 'success'">
                  {{ isClosed(match) ? 'Encerrado' : 'Aberto' }}
                </ui-badge>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-bold text-foreground text-sm">{{ match.teamA }}</span>
                <span class="text-xs text-muted-foreground px-1 bg-muted rounded">VS</span>
                <span class="font-bold text-foreground text-sm">{{ match.teamB }}</span>
              </div>
              <div class="text-xs text-muted-foreground">
                <div>Estádio: {{ match.stadium }}</div>
                <div>Árbitro: {{ match.referee }}</div>
              </div>
              <div class="flex flex-wrap gap-1">
                <span *ngFor="let opt of match.options" class="px-2 py-0.5 text-xs bg-primary/5 text-primary border border-primary/10 rounded-md font-medium">
                  {{ opt.teamAScore }} x {{ opt.teamBScore }}
                </span>
              </div>
              <div class="flex items-center gap-2 pt-2 border-t border-border">
                <button 
                  *ngIf="!isClosed(match)"
                  ui-button
                  variant="secondary"
                  size="sm"
                  class="flex-1"
                  (click)="closeMatch(match.id)"
                  [disabled]="actionLoading() === match.id">
                  Encerrar
                </button>
                <a 
                  [routerLink]="['/admin/matches', match.id, 'edit']"
                  ui-button
                  variant="outline"
                  size="sm"
                  class="flex-1 text-center">
                  Editar
                </a>
                <button 
                  ui-button
                  variant="destructive"
                  size="sm"
                  class="flex-1"
                  (click)="confirmDelete(match)"
                  [disabled]="actionLoading() === match.id">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty & Loading States -->
        <div *ngIf="isLoading() && matchesList().length === 0" class="py-20 flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-muted-foreground text-sm font-medium">Buscando lista de jogos...</span>
        </div>

        <div *ngIf="!isLoading() && matchesList().length === 0" class="py-20 flex flex-col items-center justify-center text-center p-6">
          <svg class="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <h3 class="text-lg font-bold text-foreground mb-1">Nenhum jogo cadastrado</h3>
          <p class="text-muted-foreground text-sm max-w-sm">Cadastre um novo jogo e opções de placar para os usuários realizarem palpites.</p>
        </div>
      </ui-card>
    </div>

    <!-- Custom Dialog / Modal for Deletion Confirmation -->
    <div *ngIf="showDeleteModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div class="p-6">
          <div class="flex items-center gap-3 text-destructive mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h3 class="text-lg font-bold text-foreground">Confirmar Exclusão</h3>
          </div>
          <p class="text-muted-foreground text-sm mb-4">
            Tem certeza de que deseja excluir o jogo <strong class="text-foreground">{{ matchToDelete()?.teamA }} x {{ matchToDelete()?.teamB }}</strong>?
          </p>
          <p class="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2.5">
            <strong>Aviso:</strong> Esta ação é irreversível e removerá permanentemente todos os palpites associados a este jogo!
          </p>
        </div>
        <div class="bg-muted/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
          <button ui-button variant="outline" (click)="cancelDelete()">
            Cancelar
          </button>
          <button ui-button variant="destructive" (click)="executeDelete()">
            Sim, Excluir Jogo
          </button>
        </div>
      </div>
    </div>
  `
})
export class MatchesListComponent implements OnInit {
  private matchesService = inject(MatchesService);

  matchesList = signal<MatchDto[]>([]);
  isLoading = signal(false);
  actionLoading = signal<string | null>(null);
  errorMsg = signal('');
  successMsg = signal('');

  // Modal State Signals
  showDeleteModal = signal(false);
  matchToDelete = signal<MatchDto | null>(null);

  ngOnInit() {
    this.loadMatches();
  }

  loadMatches() {
    this.isLoading.set(true);
    this.errorMsg.set('');

    this.matchesService.getMatches().subscribe({
      next: (matches) => {
        this.matchesList.set(matches);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set('Erro ao carregar a lista de jogos do servidor.');
        this.isLoading.set(false);
      }
    });
  }

  isClosed(match: MatchDto): boolean {
    return match.isClosed || new Date(match.matchDate) < new Date();
  }

  closeMatch(id: string) {
    this.actionLoading.set(id);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.matchesService.closeMatch(id).subscribe({
      next: () => {
        this.successMsg.set('Jogo encerrado com sucesso para novos palpites!');
        this.actionLoading.set(null);
        this.loadMatches();
      },
      error: (err) => {
        this.errorMsg.set('Erro ao tentar encerrar o jogo.');
        this.actionLoading.set(null);
      }
    });
  }

  // Deletion logic with custom UI Modal
  confirmDelete(match: MatchDto) {
    this.matchToDelete.set(match);
    this.showDeleteModal.set(true);
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.matchToDelete.set(null);
  }

  executeDelete() {
    const match = this.matchToDelete();
    if (!match) return;

    this.showDeleteModal.set(false);
    this.actionLoading.set(match.id);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.matchesService.deleteMatch(match.id).subscribe({
      next: () => {
        this.successMsg.set(`O jogo ${match.teamA} x ${match.teamB} foi excluído com sucesso!`);
        this.actionLoading.set(null);
        this.matchToDelete.set(null);
        this.loadMatches();
      },
      error: (err) => {
        this.errorMsg.set('Erro ao tentar excluir o jogo do servidor.');
        this.actionLoading.set(null);
        this.matchToDelete.set(null);
      }
    });
  }

  trackById(index: number, item: MatchDto): string {
    return item.id;
  }
}
