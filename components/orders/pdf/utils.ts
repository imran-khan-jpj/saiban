/**
 * Splits long unbroken strings (e.g. batch numbers) so @react-pdf/renderer
 * can wrap them inside fixed-width table cells.
 */
export function breakLongWord(word: string, chunkSize = 8): string[] {
  if (word.length <= chunkSize) return [word];

  const chunks: string[] = [];
  for (let i = 0; i < word.length; i += chunkSize) {
    chunks.push(word.slice(i, i + chunkSize));
  }
  return chunks;
}
