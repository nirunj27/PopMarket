import type { StallZone } from '@/types';

export interface StallLayoutCell {
  row: number;
  col: number;
  zone: StallZone;
  isPremium?: boolean;
  premiumFee?: number;
}

export const MAX_ENTRANCE_CELLS = 2;
export const MAX_STAGE_CELLS = 2;

const ZONE_LIMITS: Partial<Record<StallZone, number>> = {
  entrance: MAX_ENTRANCE_CELLS,
  stage: MAX_STAGE_CELLS,
};

export function countZoneInLayout(layout: StallLayoutCell[], zone: StallZone): number {
  return layout.filter((cell) => cell.zone === zone).length;
}

export function canPlaceZone(
  layout: StallLayoutCell[],
  row: number,
  col: number,
  zone: StallZone,
): boolean {
  const existing = layout.find((c) => c.row === row && c.col === col);
  if (existing?.zone === zone) return true;

  const limit = ZONE_LIMITS[zone];
  if (limit === undefined) return true;

  const count = layout.filter(
    (c) => c.zone === zone && !(c.row === row && c.col === col),
  ).length;
  return count < limit;
}

function defaultZoneForCell(
  row: number,
  col: number,
  rows: number,
  cols: number,
): StallZone {
  if (row === 0 && col === Math.floor(cols / 2)) return 'entrance';
  if (row === rows - 1 && col === Math.floor(cols / 2)) return 'stage';
  if (col === 0 || col === cols - 1) return 'food_stall';
  if (row === 0 || row === rows - 1) return 'food_stall';
  return 'food_truck';
}

export function buildDefaultStallLayout(rows: number, cols: number): StallLayoutCell[] {
  const layout: StallLayoutCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      layout.push({
        row: r,
        col: c,
        zone: defaultZoneForCell(r, c, rows, cols),
      });
    }
  }
  return layout;
}

export function resizeStallLayout(
  current: StallLayoutCell[],
  rows: number,
  cols: number,
): StallLayoutCell[] {
  const cellMap = new Map(current.map((cell) => [`${cell.row}-${cell.col}`, cell]));
  return buildDefaultStallLayout(rows, cols).map((cell) => {
    const prev = cellMap.get(`${cell.row}-${cell.col}`);
    if (!prev) return cell;
    return {
      ...cell,
      zone: prev.zone,
      isPremium: prev.isPremium,
      premiumFee: prev.premiumFee,
    };
  });
}

export function updateStallCellZone(
  layout: StallLayoutCell[],
  row: number,
  col: number,
  zone: StallZone,
): StallLayoutCell[] {
  return layout.map((cell) => (cell.row === row && cell.col === col ? { ...cell, zone } : cell));
}

export function countAssignableStalls(layout: StallLayoutCell[]): number {
  return layout.filter((cell) => cell.zone === 'food_truck' || cell.zone === 'food_stall').length;
}

export function stallCodeForCell(row: number, col: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return `${letters[row] ?? `R${row}`}${col + 1}`;
}

export function layoutToPreviewStalls(layout: StallLayoutCell[]) {
  return layout.map((cell) => ({
    id: `${cell.row}-${cell.col}`,
    stall_code: stallCodeForCell(cell.row, cell.col),
    row_index: cell.row,
    col_index: cell.col,
    zone: cell.zone,
    is_available: cell.zone === 'food_truck' || cell.zone === 'food_stall',
    assignment: undefined,
  }));
}
