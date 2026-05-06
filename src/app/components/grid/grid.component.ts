import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { GameService } from '../../services/game.service';
import { CellComponent } from '../cell/cell.component';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CellComponent],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  readonly #game = inject(GameService);

  protected readonly cells = this.#game.cells;

  protected onCellClick(index: number): void {
    this.#game.onCellClick(index);
  }
}
