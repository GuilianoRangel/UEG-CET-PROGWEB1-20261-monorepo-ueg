import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatchesFormComponent } from './matches-form.component';
import { MatchesService } from '../../services/matches.service';
import { Router, ActivatedRoute } from '@angular/router';

describe('MatchesFormComponent', () => {
  let component: MatchesFormComponent;
  let fixture: ComponentFixture<MatchesFormComponent>;

  const mockMatchesService = {
    getMatch: vi.fn(),
    createMatch: vi.fn(),
    updateMatch: vi.fn(),
  };

  const mockRouter = {
    navigate: vi.fn(),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn().mockReturnValue(null), // Default to create mode
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockMatchesService.getMatch.mockReturnValue(of({
      id: 'match-1',
      teamA: 'Brasil',
      teamB: 'Argentina',
      matchDate: new Date().toISOString(),
      stadium: 'Maracanã',
      referee: 'Wilton Sampaio',
      isClosed: false,
      options: [
        { id: 'opt-1', teamAScore: 2, teamBScore: 1 },
        { id: 'opt-2', teamAScore: 1, teamBScore: 0 }
      ]
    }));

    mockMatchesService.createMatch.mockReturnValue(of({ id: 'new-match-id' }));
    mockMatchesService.updateMatch.mockReturnValue(of({ id: 'match-1' }));

    await TestBed.configureTestingModule({
      imports: [MatchesFormComponent, ReactiveFormsModule],
      providers: [
        { provide: MatchesService, useValue: mockMatchesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default fields and options array', () => {
    expect(component.form).toBeDefined();
    expect(component.options.length).toBe(2); // In create mode, defaults to 2 options
    expect(component.isEditMode()).toBe(false);
  });

  it('should disable "add option" button when options array length reaches 4', async () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('#add-option-btn');
    expect(component.options.length).toBe(2);
    expect(button.disabled).toBe(false);

    // Click to add 3rd option
    button.click();
    fixture.detectChanges();
    expect(component.options.length).toBe(3);
    expect(button.disabled).toBe(false);

    // Click to add 4th option
    button.click();
    fixture.detectChanges();
    expect(component.options.length).toBe(4);
    expect(button.disabled).toBe(true);
  });

  it('should submit payload correctly structured with nested options', async () => {
    // Fill required form fields
    component.form.patchValue({
      teamA: 'Brasil',
      teamB: 'Alemanha',
      matchDate: '2026-06-15T18:00',
      stadium: 'Mineirão',
      referee: 'Howard Webb',
    });

    fixture.detectChanges();

    // Verify submit button is enabled
    const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('#submit-form-btn');
    expect(submitBtn.disabled).toBe(false);

    // Call submit
    component.onSubmit();

    expect(mockMatchesService.createMatch).toHaveBeenCalledWith({
      teamA: 'Brasil',
      teamB: 'Alemanha',
      matchDate: '2026-06-15T18:00',
      stadium: 'Mineirão',
      referee: 'Howard Webb',
      options: [
        { teamAScore: 0, teamBScore: 0 },
        { teamAScore: 0, teamBScore: 0 }
      ]
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/matches']);
  });
});
