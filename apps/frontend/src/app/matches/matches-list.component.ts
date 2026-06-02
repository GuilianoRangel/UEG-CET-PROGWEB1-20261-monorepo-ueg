import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchesService } from './matches.service';
import { MatchDto } from '@repo/utils';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../shared/components/ui/card.component';
import { ButtonComponent } from '../shared/components/ui/button.component';
import { BadgeComponent } from '../shared/components/ui/badge.component';

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
    BadgeComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
      <!-- Page Header -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-foreground animate-fade-in">
            Gerenciamento de Jogos
          </h1>
          <p class="text-muted-foreground mt-1">Cadastre novos jogos da Copa do Mundo, edite informações e encerre palpites manualmente.</p>
        </div>
        <div>
          <a routerLink="/admin/matches/new" ui-button variant="default" class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Novo Jogo</span>
          </a>
        </div>
      </div>

      <!-- Alerts -->
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

      <!-- Matches Table Grid -->
      <ui-card>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-border hidden md:table">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jogo</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data / Hora (UTC)</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Local & Juiz</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opções de Placar</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border bg-transparent">
              <tr *ngFor="let match of matchesList()" class="hover:bg-muted/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-base text-foreground">{{ match.teamA }}</span>
                    <span class="text-muted-foreground text-xs font-medium px-2 py-0.5 bg-muted rounded-full">VS</span>
                    <span class="font-bold text-base text-foreground">{{ match.teamB }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {{ match.matchDate | date:'dd/MM/yyyy HH:mm':'UTC' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  <div>{{ match.stadium || 'Não informado' }}</div>
                  <div class="text-xs opacity-80">{{ match.referee || 'Sem juiz' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let opt of match.predictionOptions" class="px-2 py-0.5 bg-muted/60 border border-border rounded text-xs text-foreground font-semibold">
                      {{ opt.teamAScore }} x {{ opt.teamBScore }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <ui-badge [variant]="isClosed(match) ? 'destructive' : 'success'">
                    {{ isClosed(match) ? 'Encerrado' : 'Aberto' }}
                  </ui-badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      *ngIf="!isClosed(match)"
                      ui-button
                      variant="outline"
                      size="sm"
                      (click)="closeMatch(match.id)"
                    >
                      Encerrar
                    </button>
                    <a [routerLink]="['/admin/matches', match.id, 'edit']" ui-button variant="secondary" size="sm">
                      Editar
                    </a>
                    <button ui-button variant="destructive" size="sm" (click)="openConfirmModal(match)">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile view -->
          <div class="md:hidden divide-y divide-border">
            <div *ngFor="let match of matchesList()" class="p-5 space-y-4 hover:bg-muted/50 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="font-bold text-foreground">{{ match.teamA }}</span>
                  <span class="text-muted-foreground text-xs font-semibold px-2 py-0.5 bg-muted rounded-full">VS</span>
                  <span class="font-bold text-foreground">{{ match.teamB }}</span>
                </div>
                <ui-badge [variant]="isClosed(match) ? 'destructive' : 'success'">
                  {{ isClosed(match) ? 'Encerrado' : 'Aberto' }}
                </ui-badge>
              </div>
              <div class="text-xs text-muted-foreground space-y-1">
                <div>Data: {{ match.matchDate | date:'dd/MM/yyyy HH:mm':'UTC' }}</div>
                <div>Local: {{ match.stadium || 'Não informado' }}</div>
              </div>
              <div class="flex flex-wrap gap-1 pt-1">
                <span *ngFor="let opt of match.predictionOptions" class="px-2 py-0.5 bg-muted/60 border border-border rounded text-xs text-foreground font-semibold">
                  {{ opt.teamAScore }} x {{ opt.teamBScore }}
                </span>
              </div>
              <div class="flex items-center gap-2 pt-2 border-t border-border">
                <button 
                  *ngIf="!isClosed(match)"
                  ui-button
                  variant="outline"
                  size="sm"
                  class="flex-1"
                  (click)="closeMatch(match.id)"
                >
                  Encerrar
                </button>
                <a [routerLink]="['/admin/matches', match.id, 'edit']" ui-button variant="secondary" size="sm" class="flex-1 text-center">
                  Editar
                </a>
                <button ui-button variant="destructive" size="sm" class="flex-1" (click)="openConfirmModal(match)">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty / Loading States -->
        <div *ngIf="isLoading() && matchesList().length === 0" class="py-20 flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-muted-foreground text-sm font-medium">Buscando lista de jogos...</span>
        </div>

        <div *ngIf="!isLoading() && matchesList().length === 0" class="py-20 flex flex-col items-center justify-center text-center p-6">
          <svg class="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <h3 class="text-lg font-bold text-foreground mb-1">Nenhum jogo cadastrado</h3>
          <p class="text-muted-foreground text-sm max-w-sm">Cadastre um novo jogo clicando em "Novo Jogo" acima para começar.</p>
        </div>
      </ui-card>
    </div>

    <!-- Custom Modal de Confirmação -->
    <div *ngIf="showConfirmModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <ui-card class="w-full max-w-md p-6 border border-border shadow-2xl animate-scale-in bg-card text-card-foreground">
        <ui-card-header class="p-0 mb-2">
          <ui-card-title class="text-xl font-bold text-destructive">Confirmar Exclusão</ui-card-title>
        </ui-card-header>
        <ui-card-content class="p-0">
          <p class="text-sm text-muted-foreground mb-6 leading-relaxed">
            Tem certeza que deseja excluir o jogo entre <span class="font-semibold text-foreground">{{ selectedMatch()?.teamA }}</span> e <span class="font-semibold text-foreground">{{ selectedMatch()?.teamB }}</span>? Todos os palpites de usuários deste jogo também serão apagados definitivamente.
          </p>
          <div class="flex justify-end gap-3">
            <button ui-button variant="outline" (click)="closeModal()">Cancelar</button>
            <button ui-button variant="destructive" (click)="confirmDelete()">Excluir Jogo</button>
          </div>
        </ui-card-content>
      </ui-card>
    </div>
  `
})
export class MatchesListComponent implements OnInit {
  private matchesService = inject(MatchesService);

  matchesList = signal<MatchDto[]>([]);
  isLoading = signal(false);
  showConfirmModal = signal(false);
  selectedMatch = signal<MatchDto | null>(null);
  successMsg = signal('');
  errorMsg = signal('');

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
      error: () => {
        this.errorMsg.set('Erro ao carregar lista de jogos.');
        this.isLoading.set(false);
      }
    });
  }

  isClosed(match: MatchDto): boolean {
    return match.isClosed || new Date() > new Date(match.matchDate);
  }

  closeMatch(id: string) {
    this.errorMsg.set('');
    this.successMsg.set('');

    this.matchesService.closeMatch(id).subscribe({
      next: () => {
        this.successMsg.set('Jogo encerrado manualmente. Palpites fechados.');
        this.loadMatches();
      },
      error: () => {
        this.errorMsg.set('Erro ao encerrar jogo.');
      }
    });
  }

  openConfirmModal(match: MatchDto) {
    this.selectedMatch.set(match);
    this.showConfirmModal.set(true);
  }

  closeModal() {
    this.selectedMatch.set(null);
    this.showConfirmModal.set(false);
  }

  confirmDelete() {
    const match = this.selectedMatch();
    if (!match) return;

    this.errorMsg.set('');
    this.successMsg.set('');
    this.closeModal();

    this.matchesService.deleteMatch(match.id).subscribe({
      next: () => {
        this.successMsg.set('Jogo excluído com sucesso!');
        this.loadMatches();
      },
      error: () => {
        this.errorMsg.set('Erro ao excluir jogo.');
      }
    });
  }
}
