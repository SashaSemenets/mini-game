import { CellState } from "./cell-state.enum";

export interface Cell {
  id: number;
  state: CellState;
}
