import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuessesService } from '../../services/guesses.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../../shared/components/ui/card.component';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';
import { BadgeComponent } from '../../../../shared/components/ui/badge.component';

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
    BadgeComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold tracking-tight text-foreground">
          Meu Palpite - Copa do Mundo
        </h1>
        <p class="text-muted-foreground mt-1">Deixe seus palpites para os jogos da Copa e veja a opinião da comunidade!</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-border mb-8 gap-4">
        <button 
          (click)="setTab('open')"
          [ngClass]="activeTab() === 'open' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'"
          class="pb-3 text-sm px-1 border-b-2 transition-all duration-200">
          Jogos Abertos
        </button>
        <button 
          (click)="setTab('closed')"
          [ngClass]="activeTab() === 'closed' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'"
          class="pb-3 text-sm px-1 border-b-2 transition-all duration-200">
          Meus Jogos Encerrados
        </button>
      </div>

      <!-- Feedback Alerts / Toasts -->
      <div *ngIf="successMsg()" class="mb-6 bg-success/10 border border-success/20 text-success px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="font-medium text-sm">{{ successMsg() }}</span>
        </div>
        <button (click)="successMsg.set('')" class="text-success hover:text-success/80 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div *ngIf="errorMsg()" class="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span class="font-medium text-sm">{{ errorMsg() }}</span>
        </div>
        <button (click)="errorMsg.set('')" class="text-destructive hover:text-destructive/80 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Tab Content: Open Matches -->
      <div *ngIf="activeTab() === 'open'">
        <div *ngIf="isLoading()" class="py-20 flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-muted-foreground text-sm font-medium">Buscando jogos abertos...</span>
        </div>

        <div *ngIf="!isLoading() && openMatches().length === 0" class="py-20 flex flex-col items-center justify-center text-center p-6 bg-card border border-border rounded-xl">
          <svg class="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3 class="text-lg font-bold text-foreground mb-1">Nenhum jogo aberto no momento</h3>
          <p class="text-muted-foreground text-sm max-w-sm">Todos os jogos já foram encerrados ou não há novos eventos agendados.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6" *ngIf="!isLoading() && openMatches().length > 0">
          <div *ngFor="let match of openMatches()" class="relative">
            <ui-card [ngClass]="{'border-primary bg-primary/5': match.userGuessId}">
              <ui-card-content class="pt-6 space-y-6">
                <!-- Header of the match -->
                <div class="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
                  <span>{{ match.matchDate | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span>{{ match.stadium }}</span>
                </div>

                <!-- Teams Display -->
                <div class="flex items-center justify-between px-4">
                  <div class="flex flex-col items-center gap-2 w-1/3">
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {{ match.teamA.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-bold text-foreground text-sm text-center truncate w-full">{{ match.teamA }}</span>
                  </div>
                  
                  <div class="flex flex-col items-center justify-center">
                    <span class="px-2.5 py-1 text-xs font-semibold bg-muted text-muted-foreground border border-border rounded-full">VS</span>
                  </div>

                  <div class="flex flex-col items-center gap-2 w-1/3">
                    <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg">
                      {{ match.teamB.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-bold text-foreground text-sm text-center truncate w-full">{{ match.teamB }}</span>
                  </div>
                </div>

                <!-- Prediction Options list -->
                <div class="space-y-2">
                  <span class="text-xs font-bold text-muted-foreground block uppercase tracking-wider mb-2">Escolha seu Palpite:</span>
                  <div class="grid grid-cols-1 gap-2">
                    <button 
                      *ngFor="let opt of match.options"
                      (click)="confirmGuess(match, opt)"
                      [disabled]="match.userGuessId || isSubmitting()"
                      [ngClass]="{
                        'border-primary bg-primary/10 ring-2 ring-primary': match.userPredictionOptionId === opt.id,
                        'border-border hover:border-muted-foreground hover:bg-muted/30': !match.userGuessId
                      }"
                      class="guess-option-btn flex items-center justify-between p-3 border rounded-xl transition-all duration-200 text-left w-full">
                      
                      <div class="flex items-center gap-3">
                        <span class="text-sm font-semibold text-foreground">{{ match.teamA }} {{ opt.teamAScore }} x {{ opt.teamBScore }} {{ match.teamB }}</span>
                        <!-- Your Choice Badge -->
                        <span *ngIf="match.userPredictionOptionId === opt.id" class="flex items-center text-xs font-bold text-primary gap-0.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                          <span>Sua Escolha</span>
                        </span>
                      </div>

                      <ui-badge variant="secondary" class="guess-count-badge">
                        {{ opt.guessCount }} {{ opt.guessCount === 1 ? 'voto' : 'votos' }}
                      </ui-badge>
                    </button>
                  </div>
                </div>

                <!-- Already guessed status indicator -->
                <div *ngIf="match.userGuessId" class="text-center pt-2 text-xs font-semibold text-primary/80">
                  Palpite enviado! Aguardando o encerramento do jogo.
                </div>
              </ui-card-content>
            </ui-card>
          </div>
        </div>
      </div>

      <!-- Tab Content: Closed Matches -->
      <div *ngIf="activeTab() === 'closed'">
        <div *ngIf="isLoading()" class="py-20 flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-muted-foreground text-sm font-medium">Buscando histórico...</span>
        </div>

        <div *ngIf="!isLoading() && myClosedMatches().length === 0" class="py-20 flex flex-col items-center justify-center text-center p-6 bg-card border border-border rounded-xl">
          <svg class="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3 class="text-lg font-bold text-foreground mb-1">Sem palpites em jogos encerrados</h3>
          <p class="text-muted-foreground text-sm max-w-sm">Quando os jogos nos quais você palpitou forem encerrados, eles aparecerão aqui com os resultados finais.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6" *ngIf="!isLoading() && myClosedMatches().length > 0">
          <div *ngFor="let guess of myClosedMatches()">
            <ui-card class="border-border">
              <ui-card-content class="pt-6 space-y-6">
                <!-- Header of the match -->
                <div class="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
                  <span>{{ guess.match.matchDate | date:'dd/MM/yyyy HH:mm' }}</span>
                  <ui-badge variant="secondary">Encerrado</ui-badge>
                </div>

                <!-- Teams Display -->
                <div class="flex items-center justify-between px-4">
                  <div class="flex flex-col items-center gap-2 w-1/3">
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {{ guess.match.teamA.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-bold text-foreground text-sm text-center truncate w-full">{{ guess.match.teamA }}</span>
                  </div>
                  
                  <div class="flex flex-col items-center justify-center">
                    <span class="px-2.5 py-1 text-xs font-semibold bg-muted text-muted-foreground border border-border rounded-full">VS</span>
                  </div>

                  <div class="flex flex-col items-center gap-2 w-1/3">
                    <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg">
                      {{ guess.match.teamB.charAt(0).toUpperCase() }}
                    </div>
                    <span class="font-bold text-foreground text-sm text-center truncate w-full">{{ guess.match.teamB }}</span>
                  </div>
                </div>

                <!-- Options with Counts & Selection highlight -->
                <div class="space-y-2">
                  <span class="text-xs font-bold text-muted-foreground block uppercase tracking-wider mb-2">Opções de Placar e Distribuição de Votos:</span>
                  <div class="grid grid-cols-1 gap-2">
                    <div 
                      *ngFor="let opt of guess.match.options"
                      [ngClass]="{
                        'border-primary bg-primary/5 ring-1 ring-primary': guess.predictionOptionId === opt.id,
                        'border-border': guess.predictionOptionId !== opt.id
                      }"
                      class="flex items-center justify-between p-3 border rounded-xl text-left w-full">
                      
                      <div class="flex items-center gap-3">
                        <span class="text-sm font-semibold text-foreground">{{ guess.match.teamA }} {{ opt.teamAScore }} x {{ opt.teamBScore }} {{ guess.match.teamB }}</span>
                        <!-- Your Choice Badge -->
                        <span *ngIf="guess.predictionOptionId === opt.id" class="flex items-center text-xs font-bold text-primary gap-0.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                          <span>Seu Palpite</span>
                        </span>
                      </div>

                      <ui-badge variant="secondary">
                        {{ opt.guessCount }} {{ opt.guessCount === 1 ? 'voto' : 'votos' }}
                      </ui-badge>
                    </div>
                  </div>
                </div>
              </ui-card-content>
            </ui-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Dialog / Modal for Guess Confirmation -->
    <div *ngIf="showConfirmModal()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div class="p-6">
          <div class="flex items-center gap-3 text-primary mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h3 class="text-lg font-bold text-foreground">Confirmar Palpite</h3>
          </div>
          <p class="text-muted-foreground text-sm mb-4">
            Você deseja confirmar seu palpite de <strong class="text-foreground">{{ selectedOptionString() }}</strong> para esta partida?
          </p>
          <p class="text-xs text-muted-foreground bg-muted border border-border rounded-lg p-2.5">
            <strong>Nota:</strong> Você só pode enviar um palpite por jogo. Após a confirmação, não será possível alterar sua escolha!
          </p>
        </div>
        <div class="bg-muted/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
          <button ui-button variant="outline" (click)="cancelGuess()" [disabled]="isSubmitting()">
            Cancelar
          </button>
          <button ui-button variant="default" (click)="executeGuess()" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Enviando...' : 'Confirmar Palpite' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class GuessBoardComponent implements OnInit {
  private guessesService = inject(GuessesService);

  activeTab = signal<'open' | 'closed'>('open');
  openMatches = signal<any[]>([]);
  myClosedMatches = signal<any[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  // Modal State Signals
  showConfirmModal = signal(false);
  selectedMatch = signal<any | null>(null);
  selectedOption = signal<any | null>(null);
  selectedOptionString = signal<string>('');

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.errorMsg.set('');

    if (this.activeTab() === 'open') {
      this.guessesService.getOpenMatches().subscribe({
        next: (matches) => {
          this.openMatches.set(matches);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMsg.set('Erro ao carregar a lista de jogos abertos.');
          this.isLoading.set(false);
        }
      });
    } else {
      this.guessesService.getMyClosedMatches().subscribe({
        next: (guesses) => {
          this.myClosedMatches.set(guesses);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMsg.set('Erro ao carregar seu histórico de palpites.');
          this.isLoading.set(false);
        }
      });
    }
  }

  // Reactive tab switching
  setTab(tab: 'open' | 'closed') {
    this.activeTab.set(tab);
    this.loadData();
  }

  confirmGuess(match: any, option: any) {
    this.selectedMatch.set(match);
    this.selectedOption.set(option);
    this.selectedOptionString.set(`${match.teamA} ${option.teamAScore} x ${option.teamBScore} ${match.teamB}`);
    this.showConfirmModal.set(true);
  }

  cancelGuess() {
    this.showConfirmModal.set(false);
    this.selectedMatch.set(null);
    this.selectedOption.set(null);
  }

  executeGuess() {
    const match = this.selectedMatch();
    const option = this.selectedOption();
    if (!match || !option) return;

    this.isSubmitting.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
    this.showConfirmModal.set(false);

    this.guessesService.submitGuess(match.id, option.id).subscribe({
      next: () => {
        this.successMsg.set('Seu palpite foi registrado com sucesso!');
        this.isSubmitting.set(false);
        this.selectedMatch.set(null);
        this.selectedOption.set(null);
        this.loadData(); // Reload list to update count and block choices
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Não foi possível registrar seu palpite. Verifique se o jogo já foi encerrado.');
        this.isSubmitting.set(false);
        this.selectedMatch.set(null);
        this.selectedOption.set(null);
      }
    });
  }
}
