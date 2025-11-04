/**
 * Tasktix: A powerful and flexible task-tracking tool for all.
 * Copyright (C) 2025 Nate Baird & other Tasktix contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { danger, fail, warn } from 'danger';

// Regular expression for conventional commits
// UPDATE CONTRIBUTING.md PR TYPE LIST WHEN MAKING ANY REGEX CHANGES
// /////////////////////////////////////////////////////////
const conventionalCommitRegex =
  /^(feat|fix|docs|style|refactor|perf|test|chore)(\((ui|api|)\))?!?: .+/;
// UPDATE CONTRIBUTING.md PR TYPE LIST WHEN MAKING ANY REGEX CHANGES
// /////////////////////////////////////////////////////////

// Get the PR title
const prTitle = danger.github.pr.title;

// Check if the title matches Conventional Commits
if (!conventionalCommitRegex.test(prTitle)) {
  fail(
    `❌ PR title does not follow Conventional Commits format.\n` +
      'Expected format: `type(scope?): subject` where:\n' +
      '- type is one of: feat, fix, docs, style, refactor, perf, test, or chore.\n' +
      '- scope is one of: ui, api, or db.\n' +
      `Your PR title: "${prTitle}"`
  );
}

if (prTitle.length > 72) {
  warn('⚠️ PR title longer than 72 characters. Consider shortening it.');
}

const subject = prTitle.split(':')[1]?.trim();

if (subject[0] !== subject[0].toLowerCase()) {
  fail('❌ PR title should start with lowercase letter after type/scope.');
}
