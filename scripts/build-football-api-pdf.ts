/**
 * Builds docs/football-api-reference.pdf from docs/football-api-reference.md
 *
 * Usage: pnpm docs:football-pdf
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mdToPdf } from 'md-to-pdf';

const ROOT = process.cwd();
const MD = join(ROOT, 'docs/football-api-reference.md');
const OUT = join(ROOT, 'docs/football-api-reference.pdf');

async function main(): Promise<void> {
  const css = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #1a1a1a;
      max-width: 100%;
    }
    h1 { font-size: 22pt; border-bottom: 2px solid #111; padding-bottom: 6px; margin-top: 0; }
    h2 { font-size: 15pt; margin-top: 1.4em; color: #111; page-break-after: avoid; }
    h3 { font-size: 12pt; margin-top: 1.1em; page-break-after: avoid; }
    table { border-collapse: collapse; width: 100%; font-size: 9.5pt; margin: 0.6em 0; }
    th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; vertical-align: top; }
    th { background: #f3f4f6; font-weight: 600; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9pt; background: #f5f5f5; padding: 1px 4px; border-radius: 3px; }
    pre { background: #f8f8f8; border: 1px solid #e5e5e5; border-radius: 4px; padding: 10px; font-size: 8.5pt; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
    pre code { background: none; padding: 0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0; }
    blockquote { display: none; }
  `;

  const pdf = await mdToPdf(
    { content: readFileSync(MD, 'utf8') },
    {
      dest: OUT,
      css,
      pdf_options: {
        format: 'A4',
        margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
        printBackground: true,
      },
    },
  );

  if (!pdf?.filename) {
    throw new Error('PDF generation failed.');
  }

  console.log(`[docs] wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
