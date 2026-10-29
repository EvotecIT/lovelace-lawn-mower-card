/** A row whose buttons carry text labels: view tabs, or Dashboard commands. */
type LabelRow<Label> = {
  dataset: DOMStringMap;
  querySelectorAll(selector: string): ArrayLike<Label>;
};

/** How far a label's text reaches past its own box, in CSS pixels (sub-pixel precise). */
export function textOverflow(label: Element): number {
  const range = label.ownerDocument.createRange();
  range.selectNodeContents(label);
  return range.getBoundingClientRect().width - label.getBoundingClientRect().width;
}

/**
 * Keeps button labels whole. Each row is laid out once with words unbreakable; if any
 * label's text then reaches past its box, the row is marked loose, which gives it fewer,
 * wider columns. CSS only sees the row's width, not the longest translated word, so this
 * is measured. A row that is still too narrow when loose falls back to wrapping.
 */
export function fitLabelRows<Label>(rows: Iterable<LabelRow<Label>>, overflow: (label: Label) => number): void {
  for (const row of rows) {
    row.dataset.fit = "measure";
    const tight = Array.from(row.querySelectorAll(":scope > button > span")).some((label) => overflow(label) > 0.05);
    if (tight) row.dataset.fit = "loose";
    else delete row.dataset.fit;
  }
}

/** Fewer columns for a loose tab row: two rows of tabs. */
export function looseTabColumns(views: number): number {
  return Math.max(1, Math.ceil(views / 2));
}