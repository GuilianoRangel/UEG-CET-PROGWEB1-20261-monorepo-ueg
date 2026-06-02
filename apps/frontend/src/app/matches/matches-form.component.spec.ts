import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatchesFormComponent } from './matches-form.component';
import { MatchesService } from './matches.service';
import { Router, ActivatedRoute } from '@angular/router';

describe('MatchesFormComponent', () => {
  let component: MatchesFormComponent;
  let fixture: ComponentFixture<MatchesFormComponent>;

  const mockMatchesService = {
    getMatchById: vi.fn(),
    createMatch: vi.fn(),
    updateMatch: vi.fn()
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn().mockReturnValue(null) // New mode by default
      }
    }
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MatchesFormComponent, ReactiveFormsModule],
      providers: [
        { provide: MatchesService, useValue: mockMatchesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesFormComponent);
    component = fixture.componentInstance;
    // Don't call fixture.detectChanges() in beforeEach to avoid ExpressionChangedAfterItHasBeenCheckedError in dynamic state tests
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should disable add option button when options reaches 4', () => {
    fixture.detectChanges();
    expect(component.options.length).toBe(1); // 1 default option on init in new mode

    component.addOption();
    component.addOption();
    component.addOption();
    expect(component.options.length).toBe(4);

    // Try adding a 5th option
    component.addOption();
    expect(component.options.length).toBe(4); // remains capped at 4!
  });

  it('should submit payload correctly structured with nested options', () => {
    fixture.detectChanges();
    component.form.patchValue({
      teamA: 'Brasil',
      teamB: 'Argentina',
      matchDate: '2026-06-18T16:00',
      stadium: 'Maracanã',
      referee: 'Juiz Teste'
    });

    // Make sure we have 2 options
    while (component.options.length) {
      component.options.removeAt(0);
    }

    component.addOption(2, 1);
    component.addOption(3, 0);

    mockMatchesService.createMatch.mockReturnValue(of({}));

    component.onSubmit();

    expect(mockMatchesService.createMatch).toHaveBeenCalledWith({
      teamA: 'Brasil',
      teamB: 'Argentina',
      matchDate: new Date('2026-06-18T16:00').toISOString(),
      stadium: 'Maracanã',
      referee: 'Juiz Teste',
      options: [
        { teamAScore: 2, teamBScore: 1 },
        { teamAScore: 3, teamBScore: 0 }
      ]
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
  });
});
