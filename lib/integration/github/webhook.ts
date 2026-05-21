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

import fs from 'fs';

import { App } from 'octokit';
import { createWebMiddleware } from '@octokit/webhooks';
import 'server-only';

const appId = process.env.GITHUB_APP_ID!;
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;
const privateKey = fs.readFileSync(
  process.env.GITHUB_PRIVATE_KEY_PATH__CONTAINER!,
  'utf8'
);

const app = new App({
  appId,
  privateKey,
  webhooks: {
    secret: webhookSecret
  }
});

async function handleNewIssue({ octokit, payload }: { octokit: any; payload: any }) {
  const issueNumber = payload.issue.number;
  const repoId = payload.repository.id;

  console.log(`Received a Issue Open event for #${issueNumber}:${repoId}`);
  
}

app.webhooks.on('issues.opened', handleNewIssue);

export const githubMiddleware = createWebMiddleware(app.webhooks, {
  path: '/api/webhook/github'
});
