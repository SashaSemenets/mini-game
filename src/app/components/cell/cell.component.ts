import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import type { Cell } from '../../types';
import { CellState } from '../../types';

@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [],
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellComponent {
  readonly cell = input.required<Cell>();
  readonly index = input.required<number>();

  readonly cellClick = output<number>();

  protected onClick(): void {
    if (this.cell().state === CellState.Active) {
      this.cellClick.emit(this.index());
    }
  }

  protected get isActive(): boolean {
    return this.cell().state === CellState.Active;
  }

  protected get isPlayerWon(): boolean {
    return this.cell().state === CellState.PlayerWon;
  }

  protected get isComputerWon(): boolean {
    return this.cell().state === CellState.ComputerWon;
  }
}
