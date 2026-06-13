import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatchesService } from './matches.service';
import { CreateMatchPayload } from '@repo/utils';
import { CardComponent } from '../shared/components/ui/card.component';
import { ButtonComponent } from '../shared/components/ui/button.component';
import { InputComponent } from '../shared/components/ui/input.component';
import { ToastService } from '../shared/components/ui/toast.service';

export const futureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) {
    return null;
  }
  const date = new Date(control.value);
  const now = new Date();
  return date > now ? null : { futureDate: true };
};

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
  templateUrl: './matches-form.component.html',
  styleUrl: './matches-form.component.scss'
})
export class MatchesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private matchesService = inject(MatchesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

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
      matchDate: ['', [Validators.required, futureDateValidator]],
      stadium: [''],
      referee: [''],
      options: this.fb.array([], [Validators.required, Validators.maxLength(4)])
    });
  }

  getErrorMessage(controlPath: string, message: string, errorKey?: string): string | null {
    const control = this.form.get(controlPath);
    if (!control || !control.touched) {
      return null;
    }
    if (errorKey) {
      return control.hasError(errorKey) ? message : null;
    }
    return control.invalid ? message : null;
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
        this.toastService.success('Jogo salvo com sucesso!');
        this.router.navigate(['/admin/matches']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const erro_message = err.error?.message || 'Erro ao salvar jogo.'
        this.errorMsg.set(erro_message);
        this.toastService.error(erro_message);
      }
    });
  }
}
