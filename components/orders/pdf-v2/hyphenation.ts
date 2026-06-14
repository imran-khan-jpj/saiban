import { Font } from "@react-pdf/renderer";

/**
 * Robust word-breaking for @react-pdf/renderer.
 *
 * react-pdf only breaks lines on natural break opportunities (spaces, hyphens,
 * etc.). A long unbroken token — e.g. an 18-character batch number like
 * `AUG2024XK10056789` — has no break opportunity, so react-pdf renders it on a
 * single line that overflows the fixed-width table cell and visually bleeds
 * into the neighbouring column.
 *
 * The documented, reliable fix is a GLOBAL hyphenation callback. For every word
 * react-pdf wants to lay out, we either:
 *   - return it untouched (normal words keep their natural spelling, and we do
 *     NOT introduce English hyphenation), or
 *   - split very long unbroken tokens into fixed-size chunks so the line
 *     breaker can wrap the remainder onto the next line of the SAME cell.
 *
 * The callback is idempotent and safe to call multiple times.
 */

const LONG_TOKEN_THRESHOLD = 12;
const CHUNK_SIZE = 10;

function chunkToken(token: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < token.length; i += size) {
    chunks.push(token.slice(i, i + size));
  }
  return chunks;
}

let registered = false;

export function registerPdfHyphenation(): void {
  if (registered) return;
  registered = true;

  Font.registerHyphenationCallback((word) => {
    if (word.length <= LONG_TOKEN_THRESHOLD) {
      return [word];
    }
    return chunkToken(word, CHUNK_SIZE);
  });
}
