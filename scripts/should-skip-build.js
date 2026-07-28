#!/usr/bin/env node
const SKIP = [/^README\.md$/,/\.md$/,/^LICENSE$/,/^\.gitignore$/,/^\.github\//,/^\.env\.example$/,/^scripts\//,/^DEPLOY\.md$/];
const diff = process.env.VERCEL_GIT_COMMIT_FILE_DIFFS || '';
if (!diff) process.exit(1);
const files = diff.split('\n').filter(Boolean);
const skip = files.every(f => SKIP.some(p => p.test(f.trim())));
if (skip && files.length) { console.log('Skipping build — docs/scripts only:', files.join(', ')); process.exit(0); }
console.log('Building — code changes detected'); process.exit(1);
