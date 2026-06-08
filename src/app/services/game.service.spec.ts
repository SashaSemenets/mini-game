import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { CellState, Winner, WIN_SCORE, GRID_SIZE } from '../types';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // ─── initial state ────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('creates grid of GRID_SIZE idle cells', () => {
      expect(service.cells().length).toBe(GRID_SIZE);
      expect(service.cells().every(c => c.state === CellState.Idle)).toBe(true);
    });

    it('has zero scores', () => {
      expect(service.playerScore()).toBe(0);
      expect(service.computerScore()).toBe(0);
    });

    it('is not running', () => {
      expect(service.isRunning()).toBe(false);
    });

    it('has no winner', () => {
      expect(service.winner()).toBeNull();
    });

    it('statusMessage returns idle text', () => {
      expect(service.statusMessage()).toBe('Press Start to play!');
    });
  });

  // ─── startGame ────────────────────────────────────────────────────────────

  describe('startGame()', () => {
    it('sets isRunning to true', () => {
      service.startGame();
      expect(service.isRunning()).toBe(true);
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('resets scores to zero', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs() * 3);
      service.startGame();
      expect(service.playerScore()).toBe(0);
      expect(service.computerScore()).toBe(0);
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('resets winner to null', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs() * WIN_SCORE);
      service.startGame();
      expect(service.winner()).toBeNull();
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('activates exactly one cell', () => {
      service.startGame();
      expect(service.cells().filter(c => c.state === CellState.Active).length).toBe(1);
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('statusMessage returns playing text', () => {
      service.startGame();
      expect(service.statusMessage()).toBe('Click the yellow cell!');
      vi.advanceTimersByTime(service.intervalMs());
    });
  });

  // ─── onCellClick ──────────────────────────────────────────────────────────

  describe('onCellClick()', () => {
    it('ignores click when game is not running', () => {
      service.onCellClick(0);
      expect(service.playerScore()).toBe(0);
    });

    it('ignores click on non-active cell', () => {
      service.startGame();
      const nonActive = service.cells().findIndex(c => c.state !== CellState.Active);
      service.onCellClick(nonActive);
      expect(service.playerScore()).toBe(0);
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('scores player point on active cell click', () => {
      service.startGame();
      const active = service.cells().findIndex(c => c.state === CellState.Active);
      service.onCellClick(active);
      expect(service.playerScore()).toBe(1);
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('marks clicked cell as player-won', () => {
      service.startGame();
      const active = service.cells().findIndex(c => c.state === CellState.Active);
      service.onCellClick(active);
      expect(service.cells()[active].state).toBe(CellState.PlayerWon);
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('activates new cell after click', () => {
      service.startGame();
      const active = service.cells().findIndex(c => c.state === CellState.Active);
      service.onCellClick(active);
      expect(service.cells().filter(c => c.state === CellState.Active).length).toBe(1);
      vi.advanceTimersByTime(service.intervalMs());
    });
  });

  // ─── computer claims cell ─────────────────────────────────────────────────

  describe('computer claims cell (timeout)', () => {
    it('scores computer point after intervalMs', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs());
      expect(service.computerScore()).toBe(1);
    });

    it('marks expired cell as computer-won', () => {
      service.startGame();
      const active = service.cells().findIndex(c => c.state === CellState.Active);
      vi.advanceTimersByTime(service.intervalMs());
      expect(service.cells()[active].state).toBe(CellState.ComputerWon);
    });

    it('does not claim cell already clicked by player', () => {
      service.startGame();
      const active = service.cells().findIndex(c => c.state === CellState.Active);
      service.onCellClick(active);
      expect(service.computerScore()).toBe(0);
      expect(service.cells()[active].state).toBe(CellState.PlayerWon);
    });
  });

  // ─── win condition ────────────────────────────────────────────────────────

  describe('win condition', () => {
    function playerWinsGame(): void {
      service.startGame();
      for (let i = 0; i < WIN_SCORE; i++) {
        const active = service.cells().findIndex(c => c.state === CellState.Active);
        service.onCellClick(active);
      }
    }

    it('player wins after WIN_SCORE clicks', () => {
      playerWinsGame();
      expect(service.winner()).toBe(Winner.Player);
      expect(service.isRunning()).toBe(false);
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('computer wins after WIN_SCORE timeouts', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs() * WIN_SCORE);
      expect(service.winner()).toBe(Winner.Computer);
      expect(service.isRunning()).toBe(false);
    });

    it('statusMessage returns player win text', () => {
      playerWinsGame();
      expect(service.statusMessage()).toBe('You win!');
      vi.advanceTimersByTime(service.intervalMs());
    });

    it('statusMessage returns CPU win text', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs() * WIN_SCORE);
      expect(service.statusMessage()).toBe('CPU wins!');
    });
  });

  // ─── restartGame ──────────────────────────────────────────────────────────

  describe('restartGame()', () => {
    it('stops the game', () => {
      service.startGame();
      service.restartGame();
      expect(service.isRunning()).toBe(false);
    });

    it('resets scores', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs() * 3);
      service.restartGame();
      expect(service.playerScore()).toBe(0);
      expect(service.computerScore()).toBe(0);
    });

    it('clears winner', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs() * WIN_SCORE);
      service.restartGame();
      expect(service.winner()).toBeNull();
    });

    it('resets all cells to idle', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs() * 3);
      service.restartGame();
      expect(service.cells().every(c => c.state === CellState.Idle)).toBe(true);
    });

    it('statusMessage returns idle text', () => {
      service.startGame();
      vi.advanceTimersByTime(service.intervalMs() * WIN_SCORE);
      service.restartGame();
      expect(service.statusMessage()).toBe('Press Start to play!');
    });
  });
});
