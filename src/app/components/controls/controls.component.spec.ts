import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ControlsComponent } from './controls.component';
import { GameService } from '../../services/game.service';

describe('ControlsComponent', () => {
  let fixture: ComponentFixture<ControlsComponent>;
  let startGameSpy: ReturnType<typeof vi.fn>;
  const isRunning = signal(false);
  const intervalMs = signal(1000);

  beforeEach(() => {
    startGameSpy = vi.fn();

    TestBed.configureTestingModule({
      imports: [ControlsComponent],
      providers: [{
        provide: GameService,
        useValue: {
          isRunning: isRunning.asReadonly(),
          intervalMs,
          startGame: startGameSpy,
        },
      }],
    });

    isRunning.set(false);
    intervalMs.set(1000);
    fixture = TestBed.createComponent(ControlsComponent);
    fixture.detectChanges();
  });

  function btn(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.btn');
  }

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.input-field');
  }

  // ─── button state ─────────────────────────────────────────────────────────

  it('shows "Start Game" when not running', () => {
    expect(btn().querySelector('.btn-text')!.textContent!.trim()).toBe('Start Game');
  });

  it('shows "Playing..." when running', () => {
    isRunning.set(true);
    fixture.detectChanges();
    expect(btn().querySelector('.btn-text')!.textContent!.trim()).toBe('Playing...');
  });

  it('button is enabled when not running', () => {
    expect(btn().disabled).toBe(false);
  });

  it('button is disabled when running', () => {
    isRunning.set(true);
    fixture.detectChanges();
    expect(btn().disabled).toBe(true);
  });

  it('calls startGame on button click', () => {
    btn().click();
    expect(startGameSpy).toHaveBeenCalledOnce();
  });

  // ─── input state ──────────────────────────────────────────────────────────

  it('input reflects intervalMs value', () => {
    expect(input().value).toBe('1000');
  });

  it('input is disabled when running', () => {
    isRunning.set(true);
    fixture.detectChanges();
    expect(input().disabled).toBe(true);
  });

  // ─── onIntervalChange ─────────────────────────────────────────────────────

  it('updates intervalMs on valid input', () => {
    input().value = '500';
    input().dispatchEvent(new Event('input'));
    expect(intervalMs()).toBe(500);
  });

  it('ignores value below minimum (100)', () => {
    input().value = '50';
    input().dispatchEvent(new Event('input'));
    expect(intervalMs()).toBe(1000);
  });

  it('ignores non-numeric input', () => {
    input().value = 'abc';
    input().dispatchEvent(new Event('input'));
    expect(intervalMs()).toBe(1000);
  });

  it('accepts boundary value of 100', () => {
    input().value = '100';
    input().dispatchEvent(new Event('input'));
    expect(intervalMs()).toBe(100);
  });
});
