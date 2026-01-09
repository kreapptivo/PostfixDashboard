#!/usr/bin/env node

/**
 * Parse conventional commits and extract changelog entries
 * Outputs JSON with entries categorized by type
 */

import { execSync } from 'child_process';
import { parse } from 'parse-commit-message';

function parseCommits() {
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
  // NOTE: Do NOT filter out empty strings - they represent empty commit bodies
  // and filtering breaks the alignment between hash, subject, and body
  const parts = gitOutput.split('\0');

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

    // Parse the commit message using parse-commit-message
    let commit;
    try {
      const parsed = parse(subject);
      commit = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch (error) {
      console.warn(`Failed to parse commit ${hash}: ${error.message}`);
      continue;
    }

    if (!commit || !commit.header || !commit.header.type) {
      console.warn(`Could not determine type for: ${subject}`);
      continue;
    }

    const { type, scope, subject: description } = commit.header;
    const isBreaking = subject.includes('!:') || body.match(/BREAKING[\s-]CHANGE/);

    const entry = `${description}${scope ? ` (${scope})` : ''}${isBreaking ? ' **BREAKING CHANGE**' : ''}`;

    // Categorize based on conventional commit type
    if (type === 'feat') {
      entries.added.push(entry);
    } else if (type === 'fix') {
      // Check if security-related
      if (body.match(/security|vulnerability|cve|sec-fix/i) || description.match(/security|vulnerability|cve/i)) {
        entries.security.push(entry);
      } else {
        entries.fixed.push(entry);
      }
    } else if (type === 'docs' || type === 'refactor' || type === 'perf' || type === 'style') {
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
  console.info('::group::Applying changelog entries');
  
  let totalApplied = 0;
  for (const [category, categoryEntries] of Object.entries(entries)) {
    if (categoryEntries.length === 0) {
      console.warn(`[${category}] No entries to apply`);
      continue;
    }
    
    console.info(`[${category}] Processing ${categoryEntries.length} entries...`);
    
    for (const entry of categoryEntries) {
      console.info(`  → Applying: "${entry}"`);
      try {
        // Properly escape the entry string for shell
        const escapedEntry = entry.replace(/"/g, '\\"');
        const command = `npx --yes kacl ${category} "${escapedEntry}"`;
        console.debug(`     Command: ${command}`);
        execSync(command, { stdio: 'inherit' });
        totalApplied++;
      } catch (error) {
        console.error(`  ✗ ERROR: ${error.message}`);
        throw error;
      }
    }
  }
  
  console.info(`::endgroup::`);
  console.info(`Total changelog entries applied: ${totalApplied}`);
}

// Main execution
const mode = process.argv[2] || 'preview';

try {
  const entries = parseCommits();

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
