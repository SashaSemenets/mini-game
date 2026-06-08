import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ScoreboardComponent } from './scoreboard.component';
import { GameService } from '../../services/game.service';

describe('ScoreboardComponent', () => {
  let fixture: ComponentFixture<ScoreboardComponent>;
  const playerScore   = signal(0);
  const computerScore = signal(0);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ScoreboardComponent],
      providers: [{
        provide: GameService,
        useValue: {
          playerScore:   playerScore.asReadonly(),
          computerScore: computerScore.asReadonly(),
        },
      }],
    });

    playerScore.set(0);
    computerScore.set(0);
    fixture = TestBed.createComponent(ScoreboardComponent);
    fixture.detectChanges();
  });

  function scoreValues(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('.score-value');
  }

  it('shows initial player score of 0', () => {
    expect(scoreValues()[0].textContent!.trim()).toBe('0');
  });

  it('shows initial computer score of 0', () => {
    expect(scoreValues()[1].textContent!.trim()).toBe('0');
  });

  it('reflects updated player score', () => {
    playerScore.set(7);
    fixture.detectChanges();
    expect(scoreValues()[0].textContent!.trim()).toBe('7');
  });

  it('reflects updated computer score', () => {
    computerScore.set(3);
    fixture.detectChanges();
    expect(scoreValues()[1].textContent!.trim()).toBe('3');
  });

  it('renders Player and CPU labels', () => {
    const labels = fixture.nativeElement.querySelectorAll('.score-label');
    expect(labels[0].textContent!.trim()).toBe('Player');
    expect(labels[1].textContent!.trim()).toBe('CPU');
  });
});
