const graphemeSegmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

export function countGraphemes(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  if (graphemeSegmenter) {
    let count = 0;
    const iterator = graphemeSegmenter.segment(text)[Symbol.iterator]();
    let next = iterator.next();
    while (!next.done) {
      count += 1;
      next = iterator.next();
    }
    return count;
  }
  return [...text].length;
}

export function countLines(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  let lines = 1;
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10 /* \n */) {
      lines += 1;
    }
  }
  return lines;
}
