import { Component, inject, computed } from '@angular/core';
import { ControlsComponent, GridComponent, ScoreboardComponent } from './components';
import { GameService } from './services';
import { Winner } from './types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ScoreboardComponent,
    ControlsComponent,
    GridComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly #game = inject(GameService);

  protected readonly winner = this.#game.winner;
  protected readonly isRunning = this.#game.isRunning;
  protected readonly playerScore = this.#game.playerScore;
  protected readonly computerScore = this.#game.computerScore;
  protected readonly statusMessage = this.#game.statusMessage;

  protected readonly playerWon = computed(() => this.#game.winner() === Winner.Player);

  protected restartGame(): void {
    this.#game.restartGame();
  }
}
