import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreboardComponent {
  readonly #game = inject(GameService);

  protected readonly playerScore = this.#game.playerScore;
  protected readonly computerScore = this.#game.computerScore;
}
