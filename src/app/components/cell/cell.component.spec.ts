import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CellComponent } from './cell.component';
import { Cell, CellState } from '../../types';

function makeCell(state: CellState): Cell {
  return { id: 0, state };
}

describe('CellComponent', () => {
  let fixture: ComponentFixture<CellComponent>;

  function setup(state: CellState, index = 0): HTMLElement {
    fixture = TestBed.createComponent(CellComponent);
    fixture.componentRef.setInput('cell', makeCell(state));
    fixture.componentRef.setInput('index', index);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.cell');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CellComponent] });
  });

  // ─── CSS classes ──────────────────────────────────────────────────────────

  it('has no state class when idle', () => {
    const el = setup(CellState.Idle);
    expect(el.classList.contains('cell--active')).toBe(false);
    expect(el.classList.contains('cell--player-won')).toBe(false);
    expect(el.classList.contains('cell--computer-won')).toBe(false);
  });

  it('adds cell--active class when active', () => {
    expect(setup(CellState.Active).classList.contains('cell--active')).toBe(true);
  });

  it('adds cell--player-won class when player won', () => {
    expect(setup(CellState.PlayerWon).classList.contains('cell--player-won')).toBe(true);
  });

  it('adds cell--computer-won class when computer won', () => {
    expect(setup(CellState.ComputerWon).classList.contains('cell--computer-won')).toBe(true);
  });

  // ─── click output ─────────────────────────────────────────────────────────

  it('emits cellClick with index when active cell is clicked', () => {
    const el = setup(CellState.Active, 42);
    const emitted: number[] = [];
    fixture.componentInstance.cellClick.subscribe(v => emitted.push(v));
    el.click();
    expect(emitted).toEqual([42]);
  });

  it('does not emit cellClick when idle cell is clicked', () => {
    const el = setup(CellState.Idle, 5);
    const emitted: number[] = [];
    fixture.componentInstance.cellClick.subscribe(v => emitted.push(v));
    el.click();
    expect(emitted).toEqual([]);
  });

  it('does not emit cellClick when player-won cell is clicked', () => {
    const el = setup(CellState.PlayerWon, 5);
    const emitted: number[] = [];
    fixture.componentInstance.cellClick.subscribe(v => emitted.push(v));
    el.click();
    expect(emitted).toEqual([]);
  });

  it('does not emit cellClick when computer-won cell is clicked', () => {
    const el = setup(CellState.ComputerWon, 5);
    const emitted: number[] = [];
    fixture.componentInstance.cellClick.subscribe(v => emitted.push(v));
    el.click();
    expect(emitted).toEqual([]);
  });
});
