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

import { danger, fail, warn, message } from 'danger';

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

const modifiedSchema = danger.git.modified_files.includes(
  'prisma/schema.prisma'
);
const addedMigrations = danger.git.created_files.filter(f =>
  f.startsWith('prisma/migrations/')
);
const deletedMigrations = danger.git.deleted_files.filter(f =>
  f.startsWith('prisma/migrations/')
);
const modifiedMigrations = danger.git.modified_files.filter(f =>
  f.startsWith('prisma/migrations/')
);

if (modifiedSchema)
  message(
    '`prisma/schema.prisma` was modified. Is the [dbdiagram.io schema](<https://dbdiagram.io/d/Tasktix-691fa53e228c5bbc1ad3060f>) up to date?'
  );

if (modifiedSchema && addedMigrations.length === 0) {
  fail(
    '❌ `prisma/schema.prisma` was modified, but no new migration files were added. Run `npm run prisma:migrate` and commit the generated files.'
  );
}

if (!modifiedSchema && addedMigrations.length > 0) {
  warn(
    "⚠️ New Prisma migration files were added, but `prisma/schema.prisma` wasn't changed. Did you forget to update the schema?"
  );
}

if (deletedMigrations.length > 0) {
  const fileList = deletedMigrations.map(f => `- ${f}`).join('\n');

  fail(
    `❌ Migration files were deleted: \n${fileList}\nPrisma migrations should never be removed from version control.`
  );
}

if (modifiedMigrations.length > 0) {
  const fileList = modifiedMigrations.map(f => `- ${f}`).join('\n');

  warn(
    `⚠️ Existing migration files were modified: \n${fileList}\nMigration files should be immutable once committed.`
  );
}
