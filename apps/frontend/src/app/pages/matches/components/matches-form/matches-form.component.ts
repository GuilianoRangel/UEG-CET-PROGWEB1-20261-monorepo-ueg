import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../../shared/components/ui/card.component';
import { ButtonComponent } from '../../../../shared/components/ui/button.component';

export const TEAMS = [
  'Brasil', 'Alemanha', 'Argentina', 'França', 'Itália', 'Espanha', 'Inglaterra', 'Uruguai',
  'Holanda', 'Portugal', 'Bélgica', 'Croácia', 'Japão', 'Senegal', 'Estados Unidos', 'México',
  'Marrocos', 'Arábia Saudita', 'Canadá', 'Suíça'
].sort();

@Component({
  selector: 'app-matches-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    ButtonComponent,
  ],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
      <!-- Page Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-foreground">
            {{ isEditMode() ? 'Editar Jogo' : 'Cadastrar Novo Jogo' }}
          </h1>
          <p class="text-muted-foreground mt-1">
            {{ isEditMode() ? 'Edite os dados do jogo e as opções de palpites.' : 'Preencha os dados da partida e as opções de palpites de placar.' }}
          </p>
        </div>
      </div>

      <!-- Feedback Alerts -->
      <div *ngIf="errorMsg()" class="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span class="font-medium text-sm">{{ errorMsg() }}</span>
        </div>
        <button (click)="errorMsg.set('')" class="text-destructive hover:text-destructive/80 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Form Card -->
      <ui-card>
        <ui-card-content class="pt-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Teams inputs -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-1.5">
                <label for="teamA" class="text-sm font-semibold text-foreground">Time Mandante</label>
                <select 
                  id="teamA"
                  formControlName="teamA" 
                  class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors">
                  <option value="" disabled selected>Selecione um time...</option>
                  <option *ngFor="let team of teams" [value]="team" [disabled]="team === form.value.teamB">{{ team }}</option>
                </select>
                <div *ngIf="form.get('teamA')?.touched && form.get('teamA')?.invalid" class="text-sm text-destructive font-medium">
                  Time mandante é obrigatório.
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="teamB" class="text-sm font-semibold text-foreground">Time Visitante</label>
                <select 
                  id="teamB"
                  formControlName="teamB" 
                  class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors">
                  <option value="" disabled selected>Selecione um time...</option>
                  <option *ngFor="let team of teams" [value]="team" [disabled]="team === form.value.teamA">{{ team }}</option>
                </select>
                <div *ngIf="form.get('teamB')?.touched && form.get('teamB')?.invalid" class="text-sm text-destructive font-medium">
                  Time visitante é obrigatório.
                </div>
              </div>
            </div>

            <!-- Date, Stadium, Referee -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex flex-col gap-1.5">
                <label for="matchDate" class="text-sm font-semibold text-foreground">Data e Hora</label>
                <input 
                  id="matchDate"
                  type="datetime-local" 
                  formControlName="matchDate"
                  class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
                <div *ngIf="form.get('matchDate')?.touched && form.get('matchDate')?.invalid" class="text-sm text-destructive font-medium">
                  Data e hora do jogo é obrigatória.
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="stadium" class="text-sm font-semibold text-foreground">Estádio</label>
                <input 
                  id="stadium"
                  type="text" 
                  formControlName="stadium"
                  placeholder="Ex: Maracanã"
                  class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
                <div *ngIf="form.get('stadium')?.touched && form.get('stadium')?.invalid" class="text-sm text-destructive font-medium">
                  Estádio é obrigatório.
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="referee" class="text-sm font-semibold text-foreground">Árbitro</label>
                <input 
                  id="referee"
                  type="text" 
                  formControlName="referee"
                  placeholder="Ex: Wilton Sampaio"
                  class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
                <div *ngIf="form.get('referee')?.touched && form.get('referee')?.invalid" class="text-sm text-destructive font-medium">
                  Árbitro é obrigatório.
                </div>
              </div>
            </div>

            <!-- Prediction Options FormArray -->
            <div class="border-t border-border pt-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold text-foreground">Opções de Placar</h3>
                  <p class="text-xs text-muted-foreground">Cadastre de 1 a 4 placares para os usuários escolherem.</p>
                </div>
                <button 
                  type="button" 
                  ui-button 
                  variant="outline" 
                  size="sm"
                  id="add-option-btn"
                  (click)="addOption()"
                  [disabled]="options.length >= 4">
                  + Adicionar Placar
                </button>
              </div>

              <div formArrayName="options" class="space-y-3">
                <div *ngFor="let opt of options.controls; let i = index" [formGroupName]="i" class="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                  <div class="flex-1 flex items-center justify-center gap-3">
                    <span class="text-sm font-medium text-muted-foreground w-20 text-right truncate">{{ form.value.teamA || 'Mandante' }}</span>
                    <input 
                      type="number" 
                      min="0"
                      formControlName="teamAScore"
                      placeholder="0"
                      class="flex h-10 w-16 text-center rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    />
                    <span class="text-muted-foreground font-semibold text-sm">x</span>
                    <input 
                      type="number" 
                      min="0"
                      formControlName="teamBScore"
                      placeholder="0"
                      class="flex h-10 w-16 text-center rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    />
                    <span class="text-sm font-medium text-muted-foreground w-20 truncate">{{ form.value.teamB || 'Visitante' }}</span>
                  </div>

                  <button 
                    type="button"
                    ui-button 
                    variant="ghost" 
                    size="sm"
                    class="text-destructive hover:bg-destructive/10"
                    (click)="removeOption(i)"
                    [disabled]="options.length <= 1">
                    Remover
                  </button>
                </div>
              </div>

              <div *ngIf="options.touched && options.invalid" class="text-sm text-destructive mt-2 font-medium">
                Você deve cadastrar entre 1 e 4 opções de placar válidas.
              </div>
            </div>

            <!-- Submit buttons -->
            <div class="border-t border-border pt-6 flex items-center justify-end gap-3">
              <a routerLink="/admin/matches" ui-button variant="outline">
                Cancelar
              </a>
              <button 
                type="submit" 
                ui-button 
                variant="default"
                id="submit-form-btn"
                [disabled]="form.invalid || isSubmitting()">
                {{ isSubmitting() ? 'Salvando...' : 'Salvar Jogo' }}
              </button>
            </div>

          </form>
        </ui-card-content>
      </ui-card>
    </div>
  `
})
export class MatchesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private matchesService = inject(MatchesService);

  teams = TEAMS;
  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  matchId = signal<string | null>(null);
  errorMsg = signal('');

  ngOnInit() {
    this.initForm();
    
    // Check if Edit Mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.matchId.set(id);
      this.loadMatchData(id);
    } else {
      // By default, start with 2 options
      this.addOption();
      this.addOption();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      teamA: ['', Validators.required],
      teamB: ['', Validators.required],
      matchDate: ['', Validators.required],
      stadium: ['', Validators.required],
      referee: ['', Validators.required],
      options: this.fb.array([], [Validators.required, Validators.maxLength(4)])
    });
  }

  get options() {
    return this.form.get('options') as FormArray;
  }

  addOption(teamAScore: number = 0, teamBScore: number = 0) {
    if (this.options.length >= 4) return;
    this.options.push(
      this.fb.group({
        teamAScore: [teamAScore, [Validators.required, Validators.min(0)]],
        teamBScore: [teamBScore, [Validators.required, Validators.min(0)]]
      })
    );
  }

  removeOption(index: number) {
    if (this.options.length <= 1) return;
    this.options.removeAt(index);
  }

  loadMatchData(id: string) {
    this.matchesService.getMatch(id).subscribe({
      next: (match) => {
        // Format datetime-local value (YYYY-MM-DDThh:mm)
        const dateObj = new Date(match.matchDate);
        // Correct timezone offset to get local time string for input
        const timezoneOffset = dateObj.getTimezoneOffset() * 60000;
        const localISODate = new Date(dateObj.getTime() - timezoneOffset).toISOString().slice(0, 16);

        this.form.patchValue({
          teamA: match.teamA,
          teamB: match.teamB,
          matchDate: localISODate,
          stadium: match.stadium,
          referee: match.referee
        });

        // Clear and rebuild FormArray
        while (this.options.length !== 0) {
          this.options.removeAt(0);
        }

        if (match.options && match.options.length > 0) {
          match.options.forEach((opt) => {
            this.addOption(opt.teamAScore, opt.teamBScore);
          });
        } else {
          this.addOption();
        }
      },
      error: () => {
        this.errorMsg.set('Erro ao carregar os dados do jogo para edição.');
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMsg.set('');

    const payload = this.form.value;

    if (this.isEditMode()) {
      this.matchesService.updateMatch(this.matchId()!, payload).subscribe({
        next: () => {
          this.router.navigate(['/admin/matches']);
        },
        error: (err) => {
          this.errorMsg.set('Erro ao salvar as edições do jogo.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.matchesService.createMatch(payload).subscribe({
        next: () => {
          this.router.navigate(['/admin/matches']);
        },
        error: (err) => {
          this.errorMsg.set('Erro ao criar o novo jogo no servidor.');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
