import { Injectable, signal, computed } from '@angular/core';
import { Cell, CellState, Winner, WIN_SCORE, GRID_SIZE } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  readonly #cells = signal<Cell[]>(this.#createGrid());

  readonly #playerScore = signal<number>(0);
  readonly #computerScore = signal<number>(0);
  readonly #isRunning = signal<boolean>(false);
  readonly #winner = signal<Winner | null>(null);

  readonly intervalMs = signal<number>(1000);

  readonly cells = this.#cells.asReadonly();
  readonly winner = this.#winner.asReadonly();
  readonly isRunning = this.#isRunning.asReadonly();
  readonly playerScore = this.#playerScore.asReadonly();
  readonly computerScore = this.#computerScore.asReadonly();

  readonly statusMessage = computed(() => {
    if (this.#winner() === Winner.Player)   return 'You win!';
    if (this.#winner() === Winner.Computer) return 'CPU wins!';
    if (this.#isRunning())                  return 'Click the yellow cell!';
    return 'Press Start to play!';
  });

  #activeIndex: number | null = null;
  #timer: ReturnType<typeof setTimeout> | null = null;

  startGame(): void {
    this.#clearTimer();
    this.#cells.set(this.#createGrid());
    this.#playerScore.set(0);
    this.#computerScore.set(0);
    this.#winner.set(null);
    this.#isRunning.set(true);
    this.#activateRandomCell();
  }

  onCellClick(index: number): void {
    if (!this.#isRunning() || this.#activeIndex !== index) return;

    this.#clearTimer();
    this.#activeIndex = null;
    this.#setCellState(index, CellState.PlayerWon);
    this.#playerScore.update(s => s + 1);

    if (this.#playerScore() >= WIN_SCORE) {
      this.#endGame(Winner.Player);
    } else {
      this.#activateRandomCell();
    }
  }

  restartGame(): void {
    this.#clearTimer();
    this.#activeIndex = null;
    this.#isRunning.set(false);
    this.#winner.set(null);
    this.#cells.set(this.#createGrid());
    this.#playerScore.set(0);
    this.#computerScore.set(0);
  }

  #activateRandomCell(): void {
    const idleIndexes = this.#cells().flatMap((c, i) => c.state === CellState.Idle ? [i] : []);

    if (idleIndexes.length === 0) {
      this.#endGame(this.#playerScore() >= this.#computerScore() ? Winner.Player : Winner.Computer);
      return;
    }

    const idx = idleIndexes[Math.floor(Math.random() * idleIndexes.length)];
    this.#activeIndex = idx;
    this.#setCellState(idx, CellState.Active);
    this.#timer = setTimeout(() => this.#computerClaimsCell(idx), this.intervalMs());
  }

  #computerClaimsCell(index: number): void {
    if (this.#activeIndex !== index) return;

    this.#activeIndex = null;
    this.#setCellState(index, CellState.ComputerWon);
    this.#computerScore.update(s => s + 1);

    if (this.#computerScore() >= WIN_SCORE) {
      this.#endGame(Winner.Computer);
    } else {
      this.#activateRandomCell();
    }
  }

  #endGame(winner: Winner): void {
    this.#clearTimer();
    this.#isRunning.set(false);
    this.#winner.set(winner);
  }

  #setCellState(index: number, state: CellState): void {
    this.#cells.update(cells => cells.with(index, { ...cells[index], state }));
  }

  #createGrid(): Cell[] {
    return Array.from({ length: GRID_SIZE }, (_, i) => ({ id: i, state: CellState.Idle }));
  }

  #clearTimer(): void {
    if (this.#timer !== null) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
}
