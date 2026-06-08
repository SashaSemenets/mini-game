import { test, expect, Page } from '@playwright/test';

const WIN_SCORE   = 10;
const INTERVAL_MS = 1000;
const LONG_INTERVAL = 30000; // won't expire during player-interaction tests

// Starts game without touching the clock — safe for player-interaction tests
async function startGame(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('.input-field').fill(String(LONG_INTERVAL));
  await page.locator('.btn').click();
}

// Starts game with fake clock — for computer-claim and timeout tests
async function startGameWithClock(page: Page): Promise<void> {
  await page.clock.install();
  await page.goto('/');
  await page.locator('.btn').click();
}

async function getActiveCellIndex(page: Page): Promise<number> {
  return page.locator('.cell--active').evaluate(el =>
    [...el.closest('.grid')!.querySelectorAll('.cell')].indexOf(el)
  );
}

async function clickActiveCell(page: Page, expectedScore?: number): Promise<void> {
  await page.locator('.cell--active').click();
  if (expectedScore !== undefined) {
    await expect(page.locator('.score-player .score-value')).toHaveText(String(expectedScore));
  }
}

async function letComputerClaim(page: Page): Promise<void> {
  await page.clock.fastForward(INTERVAL_MS);
}

// ─── page load ───────────────────────────────────────────────────────────────

test.describe('page load', () => {
  test('renders 100 cells', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.cell')).toHaveCount(100);
  });

  test('shows zero scores', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.score-player .score-value')).toHaveText('0');
    await expect(page.locator('.score-cpu .score-value')).toHaveText('0');
  });

  test('Start Game button is enabled', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.btn')).toBeEnabled();
  });

  test('shows idle status message', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status')).toHaveText('Press Start to play!');
  });
});

// ─── start game ──────────────────────────────────────────────────────────────

test.describe('start game', () => {
  test('activates exactly one cell', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('.cell--active')).toHaveCount(1);
  });

  test('disables Start Game button while playing', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('.btn')).toBeDisabled();
  });

  test('shows playing status message', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('.status')).toHaveText('Click the yellow cell!');
  });

  test('disables interval input while playing', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('.input-field')).toBeDisabled();
  });
});

// ─── player clicks active cell ───────────────────────────────────────────────

test.describe('player clicks active cell', () => {
  test('cell turns green (player-won)', async ({ page }) => {
    await startGame(page);
    const idx = await getActiveCellIndex(page);
    await clickActiveCell(page);
    await expect(page.locator('.cell').nth(idx)).toHaveClass(/cell--player-won/);
  });

  test('player score increments', async ({ page }) => {
    await startGame(page);
    await clickActiveCell(page);
    await expect(page.locator('.score-player .score-value')).toHaveText('1');
  });

  test('new active cell appears after click', async ({ page }) => {
    await startGame(page);
    await clickActiveCell(page);
    await expect(page.locator('.cell--active')).toHaveCount(1);
  });

  test('cpu score stays at 0', async ({ page }) => {
    await startGame(page);
    await clickActiveCell(page);
    await expect(page.locator('.score-cpu .score-value')).toHaveText('0');
  });
});

// ─── computer claims cell ────────────────────────────────────────────────────

test.describe('computer claims cell (timeout)', () => {
  test('cell turns red (computer-won) after timeout', async ({ page }) => {
    await startGameWithClock(page);
    const idx = await getActiveCellIndex(page);
    await letComputerClaim(page);
    await expect(page.locator('.cell').nth(idx)).toHaveClass(/cell--computer-won/);
  });

  test('cpu score increments after timeout', async ({ page }) => {
    await startGameWithClock(page);
    await letComputerClaim(page);
    await expect(page.locator('.score-cpu .score-value')).toHaveText('1');
  });

  test('player score stays at 0 after timeout', async ({ page }) => {
    await startGameWithClock(page);
    await letComputerClaim(page);
    await expect(page.locator('.score-player .score-value')).toHaveText('0');
  });

  test('new active cell appears after timeout', async ({ page }) => {
    await startGameWithClock(page);
    await letComputerClaim(page);
    await expect(page.locator('.cell--active')).toHaveCount(1);
  });
});

// ─── win condition ────────────────────────────────────────────────────────────

test.describe('win condition', () => {
  test('player wins: modal shows "You Win!"', async ({ page }) => {
    await startGame(page);
    for (let i = 0; i < WIN_SCORE; i++) {
      await clickActiveCell(page, i + 1 < WIN_SCORE ? i + 1 : undefined);
    }
    await expect(page.locator('.modal-title')).toHaveText('You Win!');
  });

  test('player wins: score in modal', async ({ page }) => {
    await startGame(page);
    for (let i = 0; i < WIN_SCORE; i++) {
      await clickActiveCell(page, i + 1 < WIN_SCORE ? i + 1 : undefined);
    }
    await expect(page.locator('.modal-score')).toHaveText(`${WIN_SCORE} — 0`);
  });

  test('cpu wins: modal shows "CPU Wins!"', async ({ page }) => {
    await startGameWithClock(page);
    for (let i = 0; i < WIN_SCORE; i++) {
      await letComputerClaim(page);
    }
    await expect(page.locator('.modal-title')).toHaveText('CPU Wins!');
  });

  test('cpu wins: score in modal', async ({ page }) => {
    await startGameWithClock(page);
    for (let i = 0; i < WIN_SCORE; i++) {
      await letComputerClaim(page);
    }
    await expect(page.locator('.modal-score')).toHaveText(`0 — ${WIN_SCORE}`);
  });
});

// ─── restart ──────────────────────────────────────────────────────────────────

test.describe('restart game', () => {
  async function playerWinsGame(page: Page): Promise<void> {
    await startGame(page);
    for (let i = 0; i < WIN_SCORE; i++) {
      await clickActiveCell(page, i + 1 < WIN_SCORE ? i + 1 : undefined);
    }
    await expect(page.locator('.modal-backdrop')).toBeVisible();
  }

  test('Play Again closes modal', async ({ page }) => {
    await playerWinsGame(page);
    await page.locator('.modal-btn').click();
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();
  });

  test('Play Again resets scores', async ({ page }) => {
    await playerWinsGame(page);
    await page.locator('.modal-btn').click();
    await expect(page.locator('.score-player .score-value')).toHaveText('0');
    await expect(page.locator('.score-cpu .score-value')).toHaveText('0');
  });

  test('Play Again resets all cells to idle', async ({ page }) => {
    await playerWinsGame(page);
    await page.locator('.modal-btn').click();
    await expect(page.locator('.cell--player-won')).toHaveCount(0);
    await expect(page.locator('.cell--active')).toHaveCount(0);
  });

  test('backdrop click closes modal', async ({ page }) => {
    await playerWinsGame(page);
    await page.locator('.modal-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();
  });
});
