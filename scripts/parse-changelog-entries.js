#!/usr/bin/env node

/**
 * Parse conventional commits and extract changelog entries
 * Outputs JSON with entries categorized by type
 */

const { execSync } = require('child_process');
const parser = require('conventional-commits-parser');

function parseCommits() {
  // Get commits between base and head
  const commits = execSync(
    'git log origin/main..HEAD --format=%H|||%s|||%b|||',
    { encoding: 'utf8' }
  )
    .trim()
    .split('|||')
    .filter(Boolean);

  // Parse commits
  const entries = {
    added: [],
    changed: [],
    fixed: [],
    deprecated: [],
    removed: [],
    security: [],
  };

  for (let i = 0; i < commits.length; i += 3) {
    const subject = commits[i + 1];
    if (!subject) continue;

    // Skip non-user-facing commits
    if (subject.match(/^(chore|ci|style|test|build|perf|revert)\(/)) {
      continue;
    }

    const parsed = parser.sync(subject);
    const scope = parsed.scope ? ` (${parsed.scope})` : '';
    const description = parsed.subject || subject;
    const isBreaking = subject.includes('!:') || parsed.notes?.some((n) => n.title === 'BREAKING CHANGE');
    const fullBody = commits[i + 2] || '';

    const entry = `${description}${scope}${isBreaking ? ' **BREAKING CHANGE**' : ''}`;

    // Categorize based on conventional commit type
    if (parsed.type === 'feat') {
      entries.added.push(entry);
    } else if (parsed.type === 'fix') {
      // Check if security-related
      if (fullBody.match(/security|vulnerability|cve|sec-fix/i) || description.match(/security|vulnerability|cve/i)) {
        entries.security.push(entry);
      } else {
        entries.fixed.push(entry);
      }
    } else if (parsed.type === 'docs' || parsed.type === 'refactor' || parsed.type === 'perf' || parsed.type === 'style') {
      entries.changed.push(entry);
    }

    // Check for deprecation or removal in commit body
    if (fullBody.match(/deprecat/i)) {
      entries.deprecated.push(entry);
    }
    if (isBreaking && fullBody.match(/remov|delete|drop/i)) {
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

try {
  const entries = parseCommits();

  if (mode === 'preview') {
    const preview = generatePreview(entries);
    const hasChanges = Object.values(entries).some((arr) => arr.length > 0);

    console.log('::group::Changelog Entry Preview');
    console.log(preview);
    console.log('::endgroup::');

    // Output for GitHub Actions
    console.log(`::set-output name=has_changes::${hasChanges}`);
    console.log(`::set-output name=preview::${preview.replace(/\n/g, '%0A')}`);
    console.log(`::set-output name=entries_json::${JSON.stringify(entries)}`);
  } else if (mode === 'apply') {
    applyChangelog(entries);
  }
} catch (error) {
  console.error('Error parsing commits:', error.message);
  process.exit(1);
}
