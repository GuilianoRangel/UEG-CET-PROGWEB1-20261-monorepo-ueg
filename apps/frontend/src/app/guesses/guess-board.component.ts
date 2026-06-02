import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuessesService } from './guesses.service';
import { MatchDto, PredictionOptionDto } from '@repo/utils';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../shared/components/ui/card.component';
import { ButtonComponent } from '../shared/components/ui/button.component';
import { BadgeComponent } from '../shared/components/ui/badge.component';

@Component({
  selector: 'app-guess-board',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
    BadgeComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fade-in">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold tracking-tight text-foreground">
          Meu Palpite - Copa do Mundo
        </h1>
        <p class="text-muted-foreground mt-1">Dê seus palpites nos placares dos jogos e acompanhe os palpites da comunidade em tempo real!</p>
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

      <!-- Navigation Tabs -->
      <div class="flex border-b border-border mb-8 gap-4">
        <button 
          (click)="setTab('open')"
          [class]="'pb-4 text-sm font-semibold border-b-2 px-1 transition-all ' + (activeTab() === 'open' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')"
        >
          Jogos Abertos
        </button>
        <button 
          (click)="setTab('closed')"
          [class]="'pb-4 text-sm font-semibold border-b-2 px-1 transition-all ' + (activeTab() === 'closed' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')"
        >
          Meus Palpites Encerrados
        </button>
      </div>

      <!-- Content Area -->
      <div>
        <!-- TAB: OPEN MATCHES -->
        <div *ngIf="activeTab() === 'open'">
          <div *ngIf="isLoading()" class="py-20 flex flex-col items-center justify-center gap-3">
            <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span class="text-muted-foreground text-sm font-medium">Buscando jogos disponíveis...</span>
          </div>

          <div *ngIf="!isLoading() && openMatches().length === 0" class="py-20 text-center bg-card rounded-2xl border border-border p-8">
            <svg class="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="text-lg font-bold text-foreground mb-1">Nenhum jogo aberto no momento</h3>
            <p class="text-muted-foreground text-sm">Fique atento! Novas partidas serão disponibilizadas em breve pelos administradores.</p>
          </div>

          <div *ngIf="!isLoading() && openMatches().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ui-card *ngFor="let match of openMatches()" class="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
              <ui-card-header class="bg-muted/10 border-b border-border p-5">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {{ match.matchDate | date:'dd/MM/yyyy HH:mm':'UTC' }} UTC
                  </span>
                  <ui-badge *ngIf="match.userGuess" variant="success">Já palpitou</ui-badge>
                </div>
                
                <!-- Match Score / Teams Row -->
                <div class="flex items-center justify-between py-2">
                  <div class="flex flex-col items-center flex-1">
                    <span class="font-extrabold text-foreground text-center text-lg">{{ match.teamA }}</span>
                  </div>
                  <span class="mx-3 text-xs font-black px-2.5 py-1 bg-muted/80 rounded-xl text-muted-foreground border border-border">VS</span>
                  <div class="flex flex-col items-center flex-1">
                    <span class="font-extrabold text-foreground text-center text-lg">{{ match.teamB }}</span>
                  </div>
                </div>
                
                <div class="text-center text-xs text-muted-foreground mt-2 font-medium">
                  📍 {{ match.stadium || 'Estádio não definido' }}
                </div>
              </ui-card-header>

              <ui-card-content class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Escolha seu placar:</h4>
                  
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      *ngFor="let opt of match.predictionOptions"
                      [disabled]="!!match.userGuess || isSubmitting()"
                      (click)="onGuessClick(match, opt)"
                      [class]="getOptionClass(match, opt)"
                    >
                      <div class="text-lg font-black tracking-widest">{{ opt.teamAScore }} - {{ opt.teamBScore }}</div>
                      <div class="text-[10px] opacity-75 font-semibold mt-1">
                        Palpites: {{ opt.guessCount }}
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Footer Text -->
                <div *ngIf="match.userGuess" class="mt-4 pt-3 border-t border-border/60 text-center text-xs text-muted-foreground font-medium flex items-center justify-center gap-1.5 bg-success/5 py-2 rounded-xl text-success border border-success/10">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  Você já enviou seu palpite para este jogo!
                </div>
              </ui-card-content>
            </ui-card>
          </div>
        </div>

        <!-- TAB: MY CLOSED MATCHES -->
        <div *ngIf="activeTab() === 'closed'">
          <div *ngIf="isLoading()" class="py-20 flex flex-col items-center justify-center gap-3">
            <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span class="text-muted-foreground text-sm font-medium">Buscando histórico...</span>
          </div>

          <div *ngIf="!isLoading() && myClosedMatches().length === 0" class="py-20 text-center bg-card rounded-2xl border border-border p-8 animate-fade-in">
            <svg class="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="text-lg font-bold text-foreground mb-1">Nenhum palpite encerrado</h3>
            <p class="text-muted-foreground text-sm">Seus palpites em jogos que já começaram ou foram encerrados serão exibidos aqui.</p>
          </div>

          <div *ngIf="!isLoading() && myClosedMatches().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ui-card *ngFor="let match of myClosedMatches()" class="overflow-hidden border border-border bg-card flex flex-col justify-between opacity-95">
              <ui-card-header class="bg-muted/10 border-b border-border p-5">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {{ match.matchDate | date:'dd/MM/yyyy HH:mm':'UTC' }} UTC
                  </span>
                  <ui-badge variant="destructive">Encerrado</ui-badge>
                </div>
                
                <div class="flex items-center justify-between py-2">
                  <div class="flex flex-col items-center flex-1">
                    <span class="font-extrabold text-foreground text-lg text-center">{{ match.teamA }}</span>
                  </div>
                  <span class="mx-3 text-xs font-black px-2.5 py-1 bg-muted rounded-xl text-muted-foreground">VS</span>
                  <div class="flex flex-col items-center flex-1">
                    <span class="font-extrabold text-foreground text-lg text-center">{{ match.teamB }}</span>
                  </div>
                </div>
              </ui-card-header>

              <ui-card-content class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 class="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Como a comunidade palpitou:</h4>
                  
                  <div class="grid grid-cols-2 gap-3">
                    <div
                      *ngFor="let opt of match.predictionOptions"
                      [class]="getClosedOptionClass(match, opt)"
                    >
                      <div class="text-lg font-black tracking-widest flex items-center justify-center gap-1">
                        {{ opt.teamAScore }} - {{ opt.teamBScore }}
                        <svg *ngIf="match.userGuess?.predictionOptionId === opt.id" class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                      </div>
                      <div class="text-[10px] opacity-75 mt-1 font-semibold">
                        Votos: {{ opt.guessCount }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer highlight choice -->
                <div class="mt-4 pt-3 border-t border-border/60 text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/5 py-2.5 rounded-xl text-emerald-600 border border-emerald-500/10">
                  Sua escolha: <span class="font-black">{{ getUserSelectedScoreString(match) }}</span>
                </div>
              </ui-card-content>
            </ui-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Modal de Confirmação de Palpite -->
    <div *ngIf="showGuessModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <ui-card class="w-full max-w-md p-6 border border-border shadow-2xl animate-scale-in bg-card text-card-foreground">
        <ui-card-header class="p-0 mb-2">
          <ui-card-title class="text-xl font-bold text-primary">Confirmar Palpite</ui-card-title>
        </ui-card-header>
        <ui-card-content class="p-0">
          <p class="text-sm text-muted-foreground mb-6 leading-relaxed">
            Deseja confirmar o seu palpite de <span class="font-extrabold text-foreground tracking-widest bg-muted px-2 py-0.5 rounded">{{ selectedOption()?.teamAScore }} x {{ selectedOption()?.teamBScore }}</span> para o jogo entre <span class="font-bold text-foreground">{{ selectedMatch()?.teamA }}</span> e <span class="font-bold text-foreground">{{ selectedMatch()?.teamB }}</span>?<br/><br/>
            <span class="text-xs font-semibold text-warning">⚠️ Atenção: Depois de confirmado, você não poderá alterar ou excluir seu palpite para esta partida!</span>
          </p>
          <div class="flex justify-end gap-3">
            <button ui-button variant="outline" (click)="closeModal()">Cancelar</button>
            <button ui-button variant="default" (click)="confirmGuess()" [disabled]="isSubmitting()">Confirmar Palpite</button>
          </div>
        </ui-card-content>
      </ui-card>
    </div>
  `
})
export class GuessBoardComponent implements OnInit {
  private guessesService = inject(GuessesService);

  activeTab = signal<'open' | 'closed'>('open');
  openMatches = signal<MatchDto[]>([]);
  myClosedMatches = signal<MatchDto[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);

  showGuessModal = signal(false);
  selectedMatch = signal<MatchDto | null>(null);
  selectedOption = signal<PredictionOptionDto | null>(null);

  successMsg = signal('');
  errorMsg = signal('');

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.errorMsg.set('');

    if (this.activeTab() === 'open') {
      this.guessesService.getOpenMatches().subscribe({
        next: (res) => {
          this.openMatches.set(res);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMsg.set('Erro ao carregar os jogos abertos.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.guessesService.getMyClosedMatches().subscribe({
        next: (res) => {
          this.myClosedMatches.set(res);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMsg.set('Erro ao carregar seu histórico de palpites.');
          this.isLoading.set(false);
        }
      });
    }
  }

  // Hook to reload tab data when tab changes
  constructor() {
    // Keep watching tab changes
    type TabType = 'open' | 'closed';
    let currentTab: TabType = 'open';
    
    // We can run loadData on changes inside activeTab using an effect or a setter. Let's do it simply by updating the loadData trigger!
    // Inside angular template, we bind directly to activeTab.set() so we can execute loadData there.
  }

  // Replace activeTab set with a wrapper method
  setTab(tab: 'open' | 'closed') {
    this.activeTab.set(tab);
    this.loadData();
  }

  onGuessClick(match: MatchDto, option: PredictionOptionDto) {
    this.selectedMatch.set(match);
    this.selectedOption.set(option);
    this.showGuessModal.set(true);
  }

  closeModal() {
    this.selectedMatch.set(null);
    this.selectedOption.set(null);
    this.showGuessModal.set(false);
  }

  confirmGuess() {
    const match = this.selectedMatch();
    const option = this.selectedOption();
    if (!match || !option) return;

    this.isSubmitting.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
    this.closeModal();

    this.guessesService.submitGuess({
      matchId: match.id!,
      predictionOptionId: option.id!
    }).subscribe({
      next: () => {
        this.successMsg.set(`Seu palpite de ${option.teamAScore} x ${option.teamBScore} para ${match.teamA} vs ${match.teamB} foi registrado!`);
        this.isSubmitting.set(false);
        this.loadData();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMsg.set(err.error?.message || 'Erro ao registrar palpite.');
      }
    });
  }

  getUserSelectedScoreString(match: MatchDto): string {
    const guess = match.userGuess;
    if (!guess) return '';
    const opt = match.predictionOptions.find(o => o.id === guess.predictionOptionId);
    if (!opt) return '';
    return `${opt.teamAScore} x ${opt.teamBScore}`;
  }

  getOptionClass(match: MatchDto, option: PredictionOptionDto): string {
    const base = 'flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 text-center ';
    const isSelected = match.userGuess?.predictionOptionId === option.id;

    if (match.userGuess) {
      if (isSelected) {
        return base + 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-md scale-102 font-black cursor-default';
      }
      return base + 'bg-muted/10 border-muted-foreground/10 text-muted-foreground/60 opacity-60 cursor-default';
    }

    return base + 'bg-card border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer active:scale-95 text-foreground';
  }

  getClosedOptionClass(match: MatchDto, option: PredictionOptionDto): string {
    const base = 'flex flex-col items-center justify-center p-3 rounded-2xl border-2 text-center ';
    const isSelected = match.userGuess?.predictionOptionId === option.id;

    if (isSelected) {
      return base + 'bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold';
    }
    return base + 'bg-muted/20 border-border text-muted-foreground/80';
  }
}
