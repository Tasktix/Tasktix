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
import { createWebMiddleware, EmitterWebhookEvent } from '@octokit/webhooks';

import 'server-only';
import {
  createListSection,
  getSectionInfoByRepoId
} from '@/lib/database/listSection';
import {
  createListItem,
  getListItemsByIssueId,
  updateListItem
} from '@/lib/database/listItem';
import ListItem from '@/lib/model/listItem';
import { ClientError } from '@/lib/Response';
import ListSection from '@/lib/model/listSection';

let githubMiddlewareSingleton: ReturnType<typeof createWebMiddleware> | null =
  null;

/**
 * Creates and controls a singleton instance of Github webhook middleware. All
 * event handlers should be registered here, with definitions elsewhere, If
 * necessary environment variables are not present, this will return null.
 */
function getGithubMiddleware() {
  if (githubMiddlewareSingleton) return githubMiddlewareSingleton;

  if (
    !process.env.GITHUB_APP_ID ||
    !process.env.GITHUB_WEBHOOK_SECRET ||
    !process.env.GITHUB_PRIVATE_KEY_PATH__CONTAINER
  ) {
    console.warn('Github Webhook Integration Not Configured');

    return null;
  }
  const appId = process.env.GITHUB_APP_ID;
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
  const privateKey = fs.readFileSync(
    process.env.GITHUB_PRIVATE_KEY_PATH__CONTAINER,
    'utf8'
  );

  const app = new App({
    appId,
    privateKey,
    webhooks: { secret: webhookSecret }
  });

  app.webhooks.on('issues.opened', handleNewIssue);
  app.webhooks.on('issues.closed', handleCloseIssue);

  githubMiddlewareSingleton = createWebMiddleware(app.webhooks, {
    path: '/api/webhook/github'
  });

  return githubMiddlewareSingleton;
}

/**
 * Handles webhook events for newly created issues in a repository that Tasktix
 * is installed in by creating a Task within all Tasktix lists that are
 * tracking that repository. Tasks are created within the first section in a
 * list when sorted by alphabetical order
 *
 * Transferred Fields:
 *  - Issue Title
 *  - Issue Description
 *  - Issue Creation Date
 *
 * Defaults
 *  - Low Priority
 * @param payload - Octokit API Webhook request object
 */
async function handleNewIssue({
  payload
}: EmitterWebhookEvent<'issues.opened'>) {
  const repoId = payload.repository.id;

  console.log(`handleNewIssue: rx issue open event for repo ${repoId}`);

  const trackingLists = await getSectionInfoByRepoId(repoId);

  if (!trackingLists) {
    return;
  }

  const name = payload.issue.title;
  const description = payload.issue.body ?? undefined;
  const priority = 'Low';
  const dateCreated = new Date(payload.issue.created_at);
  const issueId = BigInt(payload.issue.id);

  for (const list of trackingLists) {
    if (!list.sectionId) {
      const name = 'Github Issues';
      const newSection = new ListSection(name, []);
      const result = await createListSection(list.listId, newSection);

      if (result) {
        list.sectionId = result;
      } else {
        console.error(
          'handleNewIssue: failed to create section in list ',
          list.listId
        );

        return;
      }
    }

    const item = new ListItem(name, list.listId, {
      priority,
      description,
      dateCreated,
      issueId
    });

    item.sectionIndex = list.itemCount + 1;

    const result = await createListItem(list.sectionId, item);

    if (!result)
      console.error(
        'handleNewIssue: failed to create item in section',
        list.sectionId
      );
  }
}

/**
 * Handles webhook events for closed GitHub issues by marking all Tasktix Tasks
 * that track that issue as completed.
 * @param payload - Octokit API Webhook request object
 */
async function handleCloseIssue({
  payload
}: EmitterWebhookEvent<'issues.closed'>) {
  const issueId = BigInt(payload.issue.id);

  console.log(`handleCloseIssue: rx issue closed event for repo ${issueId}`);

  const trackingItems = await getListItemsByIssueId(issueId);

  if (!trackingItems) {
    return;
  }

  for (const item of trackingItems) {
    item.status = 'Completed';
    item.dateCompleted = new Date();
    const result = await updateListItem(item);

    if (!result)
      console.error('handleCloseIssue: failed to update item ', item.id);
  }
}

/**
 * Middleware for handling receipts of Webhook from Github. Will instantiate a
 * singleton instance of Middleware if one doesn't already exist. Returns Not
 * Found error if middleware null/not configured.
 * @param req - Request object from API
 */
export async function githubMiddleware(req: Request): Promise<Response> {
  const middleware = getGithubMiddleware();

  if (!middleware) {
    return ClientError.NotFound(
      'Github webhook integration not configured. Please contact your system administrator'
    );
  }

  return (await middleware(req)) as Response;
}
