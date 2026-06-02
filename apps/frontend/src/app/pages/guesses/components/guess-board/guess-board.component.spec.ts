import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GuessBoardComponent } from './guess-board.component';
import { GuessesService } from '../../services/guesses.service';

describe('GuessBoardComponent', () => {
  let component: GuessBoardComponent;
  let fixture: ComponentFixture<GuessBoardComponent>;

  const mockGuessesService = {
    getOpenMatches: vi.fn(),
    getMyClosedMatches: vi.fn(),
    submitGuess: vi.fn(),
  };

  const mockOpenMatches = [
    {
      id: 'match-1',
      teamA: 'Brasil',
      teamB: 'França',
      matchDate: new Date().toISOString(),
      stadium: 'Lusail Stadium',
      userGuessId: null,
      userPredictionOptionId: null,
      options: [
        { id: 'opt-1', teamAScore: 2, teamBScore: 1, guessCount: 15 },
        { id: 'opt-2', teamAScore: 1, teamBScore: 0, guessCount: 5 }
      ]
    }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    mockGuessesService.getOpenMatches.mockReturnValue(of(mockOpenMatches));
    mockGuessesService.getMyClosedMatches.mockReturnValue(of([]));
    mockGuessesService.submitGuess.mockReturnValue(of({ id: 'guess-1' }));

    await TestBed.configureTestingModule({
      imports: [GuessBoardComponent],
      providers: [
        { provide: GuessesService, useValue: mockGuessesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GuessBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render open matches and their prediction options with guess count badges', () => {
    expect(mockGuessesService.getOpenMatches).toHaveBeenCalled();
    expect(component.openMatches().length).toBe(1);

    const matchEl: HTMLElement = fixture.nativeElement;
    
    // Check teams
    expect(matchEl.textContent).toContain('Brasil');
    expect(matchEl.textContent).toContain('França');
    expect(matchEl.textContent).toContain('Lusail Stadium');

    // Check prediction score option text
    expect(matchEl.textContent).toContain('Brasil 2 x 1 França');

    // Check guess count badge text
    expect(matchEl.textContent).toContain('15 votos');
    expect(matchEl.textContent).toContain('5 votos');
  });

  it('should call api and show toast on successful guess submission', () => {
    // Select match and option
    const match = component.openMatches()[0];
    const option = match.options[0];

    // Trigger guess selection
    component.confirmGuess(match, option);
    fixture.detectChanges();

    expect(component.showConfirmModal()).toBe(true);
    expect(component.selectedOptionString()).toContain('Brasil 2 x 1 França');

    // Execute guess confirmation
    component.executeGuess();
    fixture.detectChanges();

    expect(mockGuessesService.submitGuess).toHaveBeenCalledWith('match-1', 'opt-1');
    expect(component.successMsg()).toContain('registrado com sucesso');
    expect(component.showConfirmModal()).toBe(false);
  });

  it('should switch tabs, load closed matches from API, and render them when clicking "Meus Jogos Encerrados"', () => {
    const mockClosedGuesses = [
      {
        id: 'guess-2',
        predictionOptionId: 'opt-c1',
        match: {
          id: 'match-2',
          teamA: 'Alemanha',
          teamB: 'Espanha',
          matchDate: new Date().toISOString(),
          options: [
            { id: 'opt-c1', teamAScore: 1, teamBScore: 1, guessCount: 30 }
          ]
        }
      }
    ];
    mockGuessesService.getMyClosedMatches.mockReturnValue(of(mockClosedGuesses));

    // Find the closed matches tab button in template
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    const closedTabBtn = buttons.find(btn => btn.textContent?.includes('Meus Jogos Encerrados'));
    expect(closedTabBtn).toBeDefined();

    // Click tab button
    closedTabBtn!.click();
    fixture.detectChanges();

    // Verify correct API was called
    expect(mockGuessesService.getMyClosedMatches).toHaveBeenCalled();
    expect(component.activeTab()).toBe('closed');
    expect(component.myClosedMatches().length).toBe(1);

    // Verify rendered content
    const matchEl: HTMLElement = fixture.nativeElement;
    expect(matchEl.textContent).toContain('Alemanha');
    expect(matchEl.textContent).toContain('Espanha');
    expect(matchEl.textContent).toContain('Seu Palpite');
    expect(matchEl.textContent).toContain('30 votos');
  });
});
