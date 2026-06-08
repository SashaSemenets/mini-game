import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { GridComponent } from './grid.component';
import { GameService } from '../../services/game.service';
import { Cell, CellState, GRID_SIZE } from '../../types';

function createGrid(): Cell[] {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({ id: i, state: CellState.Idle }));
}

describe('GridComponent', () => {
  let fixture: ComponentFixture<GridComponent>;
  let onCellClickSpy: ReturnType<typeof vi.fn>;
  const cells = signal<Cell[]>(createGrid());

  beforeEach(() => {
    onCellClickSpy = vi.fn();

    TestBed.configureTestingModule({
      imports: [GridComponent],
      providers: [{
        provide: GameService,
        useValue: {
          cells: cells.asReadonly(),
          onCellClick: onCellClickSpy,
        },
      }],
    });

    cells.set(createGrid());
    fixture = TestBed.createComponent(GridComponent);
    fixture.detectChanges();
  });

  it(`renders ${GRID_SIZE} cells`, () => {
    expect(fixture.nativeElement.querySelectorAll('app-cell').length).toBe(GRID_SIZE);
  });

  it('calls onCellClick with correct index when active cell is clicked', () => {
    const updatedGrid = createGrid();
    updatedGrid[5] = { id: 5, state: CellState.Active };
    cells.set(updatedGrid);
    fixture.detectChanges();

    fixture.nativeElement.querySelectorAll('app-cell')[5].querySelector('.cell').click();
    expect(onCellClickSpy).toHaveBeenCalledWith(5);
  });
});
