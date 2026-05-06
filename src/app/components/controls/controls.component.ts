import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsComponent {
  readonly #game = inject(GameService);

  protected readonly isRunning = this.#game.isRunning;
  protected readonly intervalMs = this.#game.intervalMs;

  protected startGame(): void {
    this.#game.startGame();
  }

  protected onIntervalChange(value: string): void {
    const ms = parseInt(value, 10);
    if (!isNaN(ms) && ms >= 100) {
      this.#game.intervalMs.set(ms);
    }
  }
}
