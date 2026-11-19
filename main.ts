// Leonida Trophy Atlas — the entry program for gta6-trophy-guide-01.
// Written in this session. It hands the guide in: app/ (the offline guide and
// tracker, plain static files) and screenshots/ (real renders of the app) are
// copied from beside this file into the output directory, and dossier.json is
// written there with the vendored make.fun library, which is what the judge
// reads. Runs on Node 22 with the standard library only; it runs twice and
// both runs must write the same bytes, so nothing here depends on the time,
// the order files are read, or anything outside this directory.
// vendor/makefun-frontend.ts is the kit's copy and must stay unchanged.
//
// Try it locally first:
//   node serve.ts            (opens the guide at http://localhost:8080)
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The gate's caps: at most 4 screenshots, each at most 256 KiB; app/ at most
// 993 files and directories and 48 MiB in all; the dossier text at most
// 160 KiB. buildDossier refuses anything past those, so a bad entry fails
// here instead of silently handing in a broken dossier.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
