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
  templateUrl: './matches-list.component.html',
  styleUrl: './matches-list.component.scss'
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
    console.log("MatchesListComponent.loadMatches()- chamada");

    this.matchesService.getMatches().subscribe({
      next: (matches) => {
        console.log("MatchesListComponent.loadMatches()- recebido")
        this.matchesList.set(matches);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Erro ao carregar lista de jogos.');
        this.isLoading.set(false);
      }
    });
    console.log("já fiz tudo");
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
