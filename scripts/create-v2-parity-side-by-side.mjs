import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outputRoot = path.resolve(
  root,
  process.env.V2_SIDE_BY_SIDE_OUTPUT_ROOT ?? 'docs/visual-evidence-assets/v2/parity-closeout-2026-04-23-side-by-side',
);
const currentRoot = path.resolve(
  root,
  process.env.V2_CURRENT_CAPTURE_ROOT ?? 'docs/visual-evidence-assets/v2/parity-closeout-2026-04-23-current/new',
);
const legacyRoot = path.resolve(
  root,
  process.env.V2_LEGACY_CAPTURE_ROOT ?? 'docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy',
);
const legacySupplementRoot = path.resolve(
  root,
  process.env.V2_LEGACY_SUPPLEMENT_CAPTURE_ROOT ?? process.env.V2_LEGACY_CAPTURE_ROOT ?? 'docs/visual-evidence-assets/v2/deep-capture-2026-04-22/legacy-supplement',
);

async function firstExistingPath(...candidates) {
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Keep trying fallbacks.
    }
  }
  return candidates[0];
}

const pairs = [
  ['database-ready', path.join(legacyRoot, '01-database-ready-viewport.png'), path.join(currentRoot, '01-database-ready-density-pass.png'), 'V2-GAP-001,V2-GAP-002,V2-GAP-010,V2-GAP-011,V2-GAP-012'],
  ['database-add-new-menu', path.join(legacyRoot, '05-add-new-menu-opened.png'), path.join(currentRoot, '02-database-add-new-menu-density-pass.png'), 'V2-GAP-004'],
  ['database-saved-filter-menu', path.join(legacyRoot, '06-saved-filters-section-or-menu.png'), path.join(currentRoot, '03-database-saved-filter-menu-density-pass.png'), 'V2-GAP-005'],
  ['database-saved-list-menu', path.join(legacyRoot, '07-saved-lists-section-or-menu.png'), path.join(currentRoot, '04-database-saved-list-menu-density-pass.png'), 'V2-GAP-006'],
  ['database-selected-bulk', path.join(legacyRoot, '11-bulk-actions-after-first-row-selected.png'), path.join(currentRoot, '05-database-row-selected-bulk-enabled.png'), 'V2-GAP-008'],
  ['database-add-column', path.join(legacyRoot, '08-add-column-menu-opened.png'), path.join(currentRoot, '06-database-add-column-menu-parity-pass.png'), 'V2-GAP-007'],
  ['database-no-match', path.join(legacyRoot, '12-database-search-filtered-no-match.png'), path.join(currentRoot, '07-database-search-no-match.png'), 'V2-GAP-009'],
  ['database-reset-default', path.join(legacyRoot, '13-reset-or-clear-filters-after-search.png'), path.join(currentRoot, '08-database-reset-default-after-search.png'), 'V2-GAP-009'],
  ['detail-ready', path.join(legacyRoot, '20-candidate-detail-ready-viewport.png'), path.join(currentRoot, '10-detail-ready-after-parity-pass.png'), 'V2-GAP-014,V2-GAP-015,V2-GAP-016,V2-GAP-018,V2-GAP-019,V2-GAP-020,V2-GAP-021'],
  ['detail-latest-cv', path.join(legacyRoot, '24-candidate-detail-latest-cv-tab.png'), path.join(currentRoot, '10a-detail-latest-cv-tab.png'), 'V2-GAP-021'],
  ['detail-activity', path.join(legacyRoot, '25-candidate-detail-activity-tab.png'), path.join(currentRoot, '10b-detail-activity-tab.png'), 'V2-GAP-020'],
  ['detail-forms-docs', path.join(legacySupplementRoot, '51-legacy-candidate-detail-forms-docs-tab-exact.png'), path.join(currentRoot, '10d-detail-forms-docs-tab.png'), 'V2-GAP-020,V2-GAP-022'],
  ['detail-interview-score', path.join(legacySupplementRoot, '52-legacy-candidate-detail-interview-score-tab-exact.png'), path.join(currentRoot, '10c-detail-interview-score-tab.png'), 'V2-GAP-020,V2-GAP-030'],
  ['detail-comments', path.join(legacySupplementRoot, '53-legacy-candidate-detail-comments-tab-exact.png'), path.join(currentRoot, '10f-detail-comments-tab.png'), 'V2-GAP-020,V2-GAP-023'],
  ['detail-emails', path.join(legacySupplementRoot, '54-legacy-candidate-detail-emails-tab-exact.png'), path.join(currentRoot, '10g-detail-emails-tab.png'), 'V2-GAP-020,V2-GAP-023'],
  ['detail-contracts', path.join(legacyRoot, '29-candidate-detail-contracts-tab.png'), path.join(currentRoot, '10e-detail-contracts-tab.png'), 'V2-GAP-020,V2-GAP-022'],
  ['detail-more-actions', path.join(legacyRoot, '22-candidate-detail-more-actions-opened.png'), path.join(currentRoot, '11-detail-more-actions-after-parity-pass.png'), 'V2-GAP-024,V2-GAP-026,V2-GAP-027,V2-GAP-028,V2-GAP-030'],
  ['email-candidate', path.join(legacySupplementRoot, '56-legacy-candidate-detail-more-actions-email-candidate-opened.png'), path.join(currentRoot, '12-detail-email-candidate-modal.png'), 'V2-GAP-026'],
  ['send-to-hiring-manager', path.join(legacySupplementRoot, '58-legacy-candidate-detail-more-actions-send-to-hiring-manager-opened.png'), path.join(currentRoot, '13-detail-send-to-hiring-manager-modal.png'), 'V2-GAP-027'],
  ['move-job', path.join(legacySupplementRoot, '59-legacy-candidate-detail-more-actions-move-job-opened.png'), path.join(currentRoot, '14-detail-move-job-modal.png'), 'V2-GAP-028'],
  ['score-now', path.join(legacySupplementRoot, '61-legacy-candidate-detail-score-now-modal-opened.png'), path.join(currentRoot, '15-detail-score-now-modal.png'), 'V2-GAP-030'],
  ['upload-new-cv', path.join(legacySupplementRoot, '60-legacy-candidate-detail-upload-new-cv-visible-control.png'), path.join(currentRoot, '16-detail-upload-new-cv-success.png'), 'V2-GAP-029'],
  ['schedule-modal', path.join(legacySupplementRoot, '57-legacy-candidate-detail-more-actions-interview-scheduler-opened.png'), path.join(currentRoot, '30-action-schedule-modal-route.png'), 'V2-GAP-024'],
  ['reject-modal', path.join(legacySupplementRoot, '55-legacy-candidate-detail-reject-modal-opened.png'), path.join(currentRoot, '32-action-reject-modal-route.png'), 'V2-GAP-025'],
];

async function dataUrl(filePath) {
  const bytes = await fs.readFile(filePath);
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

async function renderPair(page, { id, legacyPath, currentPath, gaps }) {
  const outputPath = path.join(outputRoot, `${id}-side-by-side.png`);
  const legacyDataUrl = await dataUrl(legacyPath);
  const currentDataUrl = await dataUrl(currentPath);
  const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; background: #eef0f3; font: 16px Arial, sans-serif; color: #222; }
          .bar { height: 52px; display: grid; grid-template-columns: 1fr 1fr; align-items: center; background: #202536; color: #fff; }
          .bar div { padding: 0 18px; }
          .bar small { display: block; margin-top: 3px; color: #cbd5e1; font-size: 12px; }
          .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px; }
          img { width: 100%; height: auto; display: block; background: #fff; }
        </style>
      </head>
      <body>
        <div class="bar">
          <div>Legacy reference<small>${id} · ${gaps}</small></div>
          <div>Current V2 capture<small>${id} · ${gaps}</small></div>
        </div>
        <div class="wrap">
          <img src="${legacyDataUrl}" />
          <img src="${currentDataUrl}" />
        </div>
      </body>
    </html>`;
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: outputPath, fullPage: true });
  return outputPath;
}

async function main() {
  await fs.mkdir(outputRoot, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 2900, height: 970 }, deviceScaleFactor: 1 });
  const records = [];

  for (const [id, legacyPath, currentPath, gaps] of pairs) {
    const resolvedLegacyPath = id === 'detail-contracts'
      ? await firstExistingPath(
          legacyPath,
          path.join(legacyRoot, '29-legacy-candidate-detail-contracts-tab-exact.png'),
        )
      : legacyPath;
    const missing = [];
    for (const candidate of [resolvedLegacyPath, currentPath]) {
      try {
        await fs.access(candidate);
      } catch {
        missing.push(path.relative(root, candidate));
      }
    }
    if (missing.length) {
      records.push({ id, status: 'blocked-missing-asset', gaps, missing });
      continue;
    }
    const outputPath = await renderPair(page, { id, legacyPath: resolvedLegacyPath, currentPath, gaps });
    records.push({
      id,
      status: 'created',
      gaps,
      legacyPath: path.relative(root, resolvedLegacyPath),
      currentPath: path.relative(root, currentPath),
      outputPath: path.relative(root, outputPath),
    });
  }

  await browser.close();
  await fs.writeFile(path.join(outputRoot, 'side-by-side-records.json'), `${JSON.stringify({
    createdAt: new Date().toISOString(),
    currentRoot: path.relative(root, currentRoot),
    legacyRoots: [path.relative(root, legacyRoot), path.relative(root, legacySupplementRoot)],
    records,
  }, null, 2)}\n`);
  console.log(`Created ${records.filter((record) => record.status === 'created').length} V2 side-by-side review artifacts.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
