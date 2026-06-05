import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GuessBoardComponent } from './guess-board.component';
import { GuessesService } from './guesses.service';
import { MatchDto } from '@repo/utils';

describe('GuessBoardComponent', () => {
  let component: GuessBoardComponent;
  let fixture: ComponentFixture<GuessBoardComponent>;

  const mockGuessesService = {
    getOpenMatches: vi.fn(),
    getMyClosedMatches: vi.fn(),
    submitGuess: vi.fn()
  };

  const dummyOpenMatches: MatchDto[] = [
    {
      id: 'match-1',
      teamA: 'Brasil',
      teamB: 'Croácia',
      matchDate: '2026-06-18T16:00:00.000Z',
      stadium: 'Lusail Stadium',
      referee: 'Referee A',
      isClosed: false,
      predictionOptions: [
        { id: 'opt-1', matchId: 'match-1', teamAScore: 2, teamBScore: 1, guessCount: 5 }
      ]
    }
  ];

  const dummyClosedMatches: MatchDto[] = [
    {
      id: 'match-2',
      teamA: 'França',
      teamB: 'Argentina',
      matchDate: '2026-06-19T18:00:00.000Z',
      stadium: 'Al Bayt Stadium',
      referee: 'Referee B',
      isClosed: true,
      predictionOptions: [
        { id: 'opt-2', matchId: 'match-2', teamAScore: 3, teamBScore: 3, guessCount: 10 }
      ],
      userGuess: {
        id: 'guess-2',
        predictionOptionId: 'opt-2',
        createdAt: new Date().toISOString()
      }
    }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    mockGuessesService.getOpenMatches.mockReturnValue(of(dummyOpenMatches));
    mockGuessesService.getMyClosedMatches.mockReturnValue(of(dummyClosedMatches));

    await TestBed.configureTestingModule({
      imports: [GuessBoardComponent],
      providers: [
        { provide: GuessesService, useValue: mockGuessesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GuessBoardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load open matches by default on init', () => {
    fixture.detectChanges();
    expect(mockGuessesService.getOpenMatches).toHaveBeenCalled();
    expect(component.openMatches()).toEqual(dummyOpenMatches);
    expect(component.activeTab()).toBe('open');
  });

  it('should load closed matches when switching tab', () => {
    fixture.detectChanges();
    component.setTab('closed');
    fixture.detectChanges();

    expect(mockGuessesService.getMyClosedMatches).toHaveBeenCalled();
    expect(component.myClosedMatches()).toEqual(dummyClosedMatches);
    expect(component.activeTab()).toBe('closed');
  });
});
