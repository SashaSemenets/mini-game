import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App } from './app';
import { GameService } from './services/game.service';
import { Winner } from './types';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let restartSpy: ReturnType<typeof vi.fn>;

  const isRunning     = signal(false);
  const winner        = signal<Winner | null>(null);
  const playerScore   = signal(0);
  const computerScore = signal(0);
  const statusMessage = signal('Press Start to play!');

  beforeEach(() => {
    restartSpy = vi.fn();

    TestBed.configureTestingModule({
      imports: [App],
      providers: [{
        provide: GameService,
        useValue: {
          isRunning:     isRunning.asReadonly(),
          winner:        winner.asReadonly(),
          playerScore:   playerScore.asReadonly(),
          computerScore: computerScore.asReadonly(),
          statusMessage: computed(() => statusMessage()),
          restartGame:   restartSpy,
          startGame:     vi.fn(),
          onCellClick:   vi.fn(),
          intervalMs:    signal(1000),
          cells:         signal([]),
        },
      }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    isRunning.set(false);
    winner.set(null);
    playerScore.set(0);
    computerScore.set(0);
    statusMessage.set('Press Start to play!');
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  // ─── status bar ───────────────────────────────────────────────────────────

  it('shows status message', () => {
    statusMessage.set('Click the yellow cell!');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.status').textContent.trim())
      .toBe('Click the yellow cell!');
  });

  it('adds status--active class when running', () => {
    isRunning.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.status').classList.contains('status--active')).toBe(true);
  });

  it('removes status--active class when not running', () => {
    expect(fixture.nativeElement.querySelector('.status').classList.contains('status--active')).toBe(false);
  });

  // ─── modal ────────────────────────────────────────────────────────────────

  it('does not show modal when no winner', () => {
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeNull();
  });

  it('shows modal when player wins', () => {
    winner.set(Winner.Player);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).not.toBeNull();
  });

  it('shows modal when computer wins', () => {
    winner.set(Winner.Computer);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).not.toBeNull();
  });

  it('shows "You Win!" when player wins', () => {
    winner.set(Winner.Player);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-title').textContent.trim()).toBe('You Win!');
  });

  it('shows "CPU Wins!" when computer wins', () => {
    winner.set(Winner.Computer);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-title').textContent.trim()).toBe('CPU Wins!');
  });

  it('shows score in modal', () => {
    playerScore.set(10);
    computerScore.set(7);
    winner.set(Winner.Player);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal-score').textContent.trim()).toBe('10 — 7');
  });

  it('calls restartGame on Play Again click', () => {
    winner.set(Winner.Player);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.modal-btn').click();
    expect(restartSpy).toHaveBeenCalledOnce();
  });

  it('calls restartGame on backdrop click', () => {
    winner.set(Winner.Player);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.modal-backdrop').click();
    expect(restartSpy).toHaveBeenCalledOnce();
  });
});
