import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatchesService } from './matches.service';
import { CreateMatchPayload } from '@repo/utils';
import { CardComponent } from '../shared/components/ui/card.component';
import { ButtonComponent } from '../shared/components/ui/button.component';
import { InputComponent } from '../shared/components/ui/input.component';

export const TEAMS = [
  'Brasil', 'Argentina', 'Alemanha', 'França', 'Espanha', 'Inglaterra', 'Itália', 'Portugal', 'Holanda', 
  'Bélgica', 'Uruguai', 'Croácia', 'Senegal', 'Japão', 'EUA', 'México', 'Marrocos', 'Arábia Saudita', 
  'Equador', 'Suíça', 'Camarões', 'Sérvia', 'Canadá', 'Gana', 'Coreia do Sul', 'Polônia', 'Austrália', 
  'Tunísia', 'Dinamarca', 'Costa Rica', 'Irã', 'Gales'
];

@Component({
  selector: 'app-matches-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardComponent,
    ButtonComponent,
    InputComponent
  ],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full animate-fade-in">
      <!-- Back Link -->
      <div class="mb-6">
        <a routerLink="/admin" class="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar para listagem
        </a>
      </div>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-extrabold tracking-tight text-foreground">
          {{ isEditMode() ? 'Editar Jogo' : 'Novo Jogo' }}
        </h1>
        <p class="text-muted-foreground mt-1">
          {{ isEditMode() ? 'Altere as informações do jogo e as opções de palpites.' : 'Preencha as informações para cadastrar uma nova partida e suas opções de placares.' }}
        </p>
      </div>

      <!-- Form Error Alerts -->
      <div *ngIf="errorMsg()" class="mb-6 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span class="font-medium text-sm">{{ errorMsg() }}</span>
        </div>
      </div>

      <ui-card class="p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- Teams Select Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-foreground">Seleção Mandante (Time A)</label>
              <select 
                formControlName="teamA"
                class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-foreground"
              >
                <option value="" disabled selected>Selecione um time</option>
                <option *ngFor="let team of teams" [value]="team" [disabled]="form.get('teamB')?.value === team">
                  {{ team }}
                </option>
              </select>
              <p *ngIf="form.get('teamA')?.touched && form.get('teamA')?.hasError('required')" class="text-sm text-destructive font-medium">Time A é obrigatório.</p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-foreground">Seleção Visitante (Time B)</label>
              <select 
                formControlName="teamB"
                class="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-foreground"
              >
                <option value="" disabled selected>Selecione um time</option>
                <option *ngFor="let team of teams" [value]="team" [disabled]="form.get('teamA')?.value === team">
                  {{ team }}
                </option>
              </select>
              <p *ngIf="form.get('teamB')?.touched && form.get('teamB')?.hasError('required')" class="text-sm text-destructive font-medium">Time B é obrigatório.</p>
            </div>
          </div>

          <!-- Date & stadium & referee Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ui-input 
              label="Data/Hora (UTC)"
              type="datetime-local"
              placeholder=""
              formControlName="matchDate"
              [error]="form.get('matchDate')?.touched && form.get('matchDate')?.hasError('required') ? 'Data é obrigatória.' : null"
            ></ui-input>

            <ui-input 
              label="Estádio"
              type="text"
              placeholder="ex: Maracanã"
              formControlName="stadium"
            ></ui-input>

            <ui-input 
              label="Árbitro / Juiz"
              type="text"
              placeholder="ex: Pierluigi Collina"
              formControlName="referee"
            ></ui-input>
          </div>

          <!-- Prediction Options Section -->
          <div class="border-t border-border pt-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-foreground">Opções de Palpites (Placares)</h3>
                <p class="text-xs text-muted-foreground">Cadastre no mínimo 1 e no máximo 4 opções de placar para esta partida.</p>
              </div>
              <button 
                type="button" 
                ui-button 
                variant="outline" 
                size="sm" 
                id="add-option-btn"
                [disabled]="options.length >= 4"
                (click)="addOption()"
                class="flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Adicionar Opção
              </button>
            </div>

            <!-- Options FormArray list -->
            <div formArrayName="options" class="space-y-3">
              <div *ngFor="let opt of options.controls; let idx = index" [formGroupName]="idx" class="flex items-center gap-4 bg-muted/30 border border-border p-3.5 rounded-xl animate-scale-in">
                <div class="text-sm font-semibold text-muted-foreground w-16">Opção {{ idx + 1 }}</div>
                
                <div class="flex-1 grid grid-cols-2 gap-4">
                  <ui-input 
                    type="number"
                    placeholder="Gols A"
                    formControlName="teamAScore"
                    label=""
                    [error]="opt.get('teamAScore')?.touched && opt.get('teamAScore')?.hasError('required') ? 'Requerido' : null"
                  ></ui-input>
                  
                  <ui-input 
                    type="number"
                    placeholder="Gols B"
                    formControlName="teamBScore"
                    label=""
                    [error]="opt.get('teamBScore')?.touched && opt.get('teamBScore')?.hasError('required') ? 'Requerido' : null"
                  ></ui-input>
                </div>

                <div>
                  <button 
                    type="button" 
                    ui-button 
                    variant="destructive" 
                    size="icon" 
                    (click)="removeOption(idx)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>

              <!-- Min Size Error -->
              <p *ngIf="options.touched && options.errors?.['required']" class="text-sm text-destructive font-medium">Você precisa cadastrar pelo menos uma opção de placar.</p>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <a routerLink="/admin" ui-button variant="outline">
              Cancelar
            </a>
            <button 
              type="submit" 
              ui-button 
              variant="default"
              [disabled]="form.invalid || isSubmitting()"
            >
              {{ isSubmitting() ? 'Salvando...' : 'Salvar Jogo' }}
            </button>
          </div>

        </form>
      </ui-card>
    </div>
  `
})
export class MatchesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private matchesService = inject(MatchesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  teams = TEAMS;
  form!: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  matchId = signal<string | null>(null);
  errorMsg = signal('');

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.matchId.set(id);
      this.loadMatch(id);
    } else {
      // For new mode, add one default option
      this.addOption();
    }
  }

  initForm() {
    this.form = this.fb.group({
      teamA: ['', Validators.required],
      teamB: ['', Validators.required],
      matchDate: ['', Validators.required],
      stadium: [''],
      referee: [''],
      options: this.fb.array([], [Validators.required, Validators.maxLength(4)])
    });
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  addOption(teamAScore: number = 0, teamBScore: number = 0) {
    if (this.options.length < 4) {
      this.options.push(
        this.fb.group({
          teamAScore: [teamAScore, [Validators.required, Validators.min(0)]],
          teamBScore: [teamBScore, [Validators.required, Validators.min(0)]]
        })
      );
    }
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  loadMatch(id: string) {
    this.matchesService.getMatchById(id).subscribe({
      next: (match) => {
        // Format ISO date local to datetime-local input format (YYYY-MM-DDThh:mm)
        const dateObj = new Date(match.matchDate);
        const formattedDate = dateObj.toISOString().slice(0, 16);

        this.form.patchValue({
          teamA: match.teamA,
          teamB: match.teamB,
          matchDate: formattedDate,
          stadium: match.stadium || '',
          referee: match.referee || ''
        });

        // Clear existing default options
        while (this.options.length) {
          this.options.removeAt(0);
        }

        // Add matching options
        match.predictionOptions.forEach((opt) => {
          this.addOption(opt.teamAScore, opt.teamBScore);
        });
      },
      error: () => {
        this.errorMsg.set('Erro ao buscar dados do jogo.');
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMsg.set('');

    const formVal = this.form.value;
    
    // Construct strict UTC ISO matchDate payload
    const dateLocal = new Date(formVal.matchDate);
    const matchDateUtc = dateLocal.toISOString();

    const payload: CreateMatchPayload = {
      teamA: formVal.teamA,
      teamB: formVal.teamB,
      matchDate: matchDateUtc,
      stadium: formVal.stadium,
      referee: formVal.referee,
      options: formVal.options
    };

    const request$ = this.isEditMode()
      ? this.matchesService.updateMatch(this.matchId()!, payload)
      : this.matchesService.createMatch(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMsg.set(err.error?.message || 'Erro ao salvar jogo.');
      }
    });
  }
}
