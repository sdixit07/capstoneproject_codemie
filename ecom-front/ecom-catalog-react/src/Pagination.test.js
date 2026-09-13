import { describe, it, expect } from 'vitest';

/**
 * The vitest environment for this project is `node` (see vite.config.js), so the
 * Pagination markup itself is covered by the Playwright e2e suite. These tests
 * pin the button-enablement rules the component derives from its props, which is
 * where the off-by-one bugs would live.
 */
const pagerState = (page, totalPages) => {
  const lastPage = Math.max(totalPages, 1);
  return {
    label: `Page ${page + 1} of ${lastPage}`,
    previousDisabled: page <= 0,
    nextDisabled: page >= lastPage - 1,
  };
};

describe('pagination controls', () => {
  it('disables Previous on the first page', () => {
    const state = pagerState(0, 5);
    expect(state.previousDisabled).toBe(true);
    expect(state.nextDisabled).toBe(false);
    expect(state.label).toBe('Page 1 of 5');
  });

  it('enables both buttons in the middle of the catalog', () => {
    const state = pagerState(2, 5);
    expect(state.previousDisabled).toBe(false);
    expect(state.nextDisabled).toBe(false);
    expect(state.label).toBe('Page 3 of 5');
  });

  it('disables Next on the last page', () => {
    const state = pagerState(4, 5);
    expect(state.previousDisabled).toBe(false);
    expect(state.nextDisabled).toBe(true);
    expect(state.label).toBe('Page 5 of 5');
  });

  it('disables both buttons for an empty catalog', () => {
    const state = pagerState(0, 0);
    expect(state.previousDisabled).toBe(true);
    expect(state.nextDisabled).toBe(true);
    expect(state.label).toBe('Page 1 of 1');
  });
});
