#!/usr/bin/env node

/**
 * Parse conventional commits and extract changelog entries
 * Outputs JSON with entries categorized by type
 */

import { execSync } from 'child_process';
import { parseCommits as parseConventionalCommits } from 'conventional-commits-parser';

async function parseCommits() {
  // Get commits between base and head using %x00 (null byte) as delimiter
  const gitOutput = execSync(
    'git log origin/main..HEAD --format=%H%x00%s%x00%b%x00',
    { encoding: 'utf8' }
  ).trim();

  if (!gitOutput) {
    return {
      added: [],
      changed: [],
      fixed: [],
      deprecated: [],
      removed: [],
      security: [],
    };
  }

  // Split by null byte and group into commits (3 parts each: hash, subject, body)
  const parts = gitOutput.split('\0').filter(line => line.trim() !== '');
  
  // Parse commits
  const entries = {
    added: [],
    changed: [],
    fixed: [],
    deprecated: [],
    removed: [],
    security: [],
  };

  for (let i = 0; i < parts.length; i += 3) {
    const hash = parts[i]?.trim();
    const subject = parts[i + 1]?.trim();
    const body = parts[i + 2]?.trim() || '';

    if (!subject) continue;

    // Skip non-user-facing commits
    if (subject.match(/^(chore|ci|style|test|build|perf|revert)\(/)) {
      continue;
    }

    // Parse the commit using conventional-commits-parser
    const parsed = await parseConventionalCommits([subject]);
    const commit = parsed[0];

    if (!commit) continue;

    const scope = commit.scope ? ` (${commit.scope})` : '';
    const description = commit.subject || subject;
    const isBreaking = subject.includes('!:') || commit.notes?.some((n) => n.title === 'BREAKING CHANGE');

    const entry = `${description}${scope}${isBreaking ? ' **BREAKING CHANGE**' : ''}`;

    // Categorize based on conventional commit type
    if (commit.type === 'feat') {
      entries.added.push(entry);
    } else if (commit.type === 'fix') {
      // Check if security-related
      if (body.match(/security|vulnerability|cve|sec-fix/i) || description.match(/security|vulnerability|cve/i)) {
        entries.security.push(entry);
      } else {
        entries.fixed.push(entry);
      }
    } else if (commit.type === 'docs' || commit.type === 'refactor' || commit.type === 'perf' || commit.type === 'style') {
      entries.changed.push(entry);
    }

    // Check for deprecation or removal in commit body
    if (body.match(/deprecat/i)) {
      entries.deprecated.push(entry);
    }
    if (isBreaking && body.match(/remov|delete|drop/i)) {
      entries.removed.push(entry);
    }
  }

  return entries;
}

function generatePreview(entries) {
  let preview = '## Suggested Changelog Entries\n\n';

  const categories = [
    { key: 'added', title: 'Added' },
    { key: 'changed', title: 'Changed' },
    { key: 'deprecated', title: 'Deprecated' },
    { key: 'removed', title: 'Removed' },
    { key: 'fixed', title: 'Fixed' },
    { key: 'security', title: 'Security' },
  ];

  let hasEntries = false;
  for (const category of categories) {
    if (entries[category.key].length > 0) {
      hasEntries = true;
      preview += `### ${category.title}\n\n`;
      entries[category.key].forEach((e) => (preview += `- ${e}\n`));
      preview += '\n';
    }
  }

  if (!hasEntries) {
    preview = 'No user-facing changes detected in commits.';
  }

  return preview;
}

function applyChangelog(entries) {
  const categoryMap = {
    added: 'kacl added',
    changed: 'kacl changed',
    deprecated: 'kacl deprecated',
    removed: 'kacl removed',
    fixed: 'kacl fixed',
    security: 'kacl security',
  };

  for (const [category, categoryEntries] of Object.entries(entries)) {
    for (const entry of categoryEntries) {
      const cmd = `npx --yes ${categoryMap[category]} "${entry.replace(/"/g, '\\"')}"`;
      execSync(cmd, { stdio: 'inherit' });
    }
  }
}

// Main execution
const mode = process.argv[2] || 'preview';

(async () => {
  try {
    const entries = await parseCommits();

    if (mode === 'preview') {
      const preview = generatePreview(entries);
      const hasChanges = Object.values(entries).some((arr) => arr.length > 0);

      // Output for human readability (to stderr, not captured by $GITHUB_OUTPUT)
      console.error('::group::Changelog Entry Preview');
      console.error(preview);
      console.error('::endgroup::');

      // Output for GitHub Actions (to stdout, captured by $GITHUB_OUTPUT)
      console.log(`has_changes=${hasChanges}`);
      console.log(`preview<<EOF`);
      console.log(preview);
      console.log(`EOF`);
      console.log(`entries_json=${JSON.stringify(entries)}`);
    } else if (mode === 'apply') {
      applyChangelog(entries);
    }
  } catch (error) {
    console.error('Error parsing commits:', error.message);
    process.exit(1);
  }
})();
