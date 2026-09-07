export interface HighlightSegment {
  readonly text: string;
  readonly match: boolean;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Splits `text` into segments, marking the parts that match any whitespace-
 * separated term in `query` (case-insensitive). Mirrors the AND search terms so
 * the palette can highlight what the user typed.
 */
export function highlightMatches(text: string, query: string): readonly HighlightSegment[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return [{ text, match: false }];
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  const segments: HighlightSegment[] = [];
  let last = 0;

  for (const found of text.matchAll(pattern)) {
    const index = found.index;
    if (index > last) {
      segments.push({ text: text.slice(last, index), match: false });
    }
    segments.push({ text: found[0], match: true });
    last = index + found[0].length;
  }

  if (last < text.length) {
    segments.push({ text: text.slice(last), match: false });
  }

  return segments.length ? segments : [{ text, match: false }];
}
