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

'use client';

import { addToast } from '@heroui/react';
import { ErrorContext, SuccessContext } from 'better-auth/react';

import { authClient } from '@/lib/auth-client';
import User from '@/lib/model/user';
import { OAuthConfig } from '@/lib/auth';

type supportedProvider = 'github' | 'custom';
/**
 * Handles OAuth social sign-in authentication flow.
 *
 * Initiates a social authentication process with the specified provider and manages
 * the success/error callbacks. On successful authentication, sets the logged-in user
 * and navigates to the task list page. On error, displays a toast notification with
 * the error message.
 *
 * @param provider - The OAuth provider name (e.g., 'google', 'github')
 * @param controllers - Object containing callback functions and router instance
 * @param controllers.setLoggedInUser - Callback to set the authenticated user in application state
 *
 * @example
 * ```typescript
 * await handleOauth('github', {
 *   setLoggedInUser: (user) => setUser(user),
 * });
 * ```
 */

export async function handleOAuth(
  provider: supportedProvider,
  setLoggedInUser: (user: User) => void,
  oauthConfig: OAuthConfig
) {
  const handleSuccess = (ctx: SuccessContext<{ User: User }>) => {
    setLoggedInUser(ctx.data.User);
  };
  const handleError = (ctx: ErrorContext) => {
    addToast({ title: ctx.error.message, color: 'danger' });
  };

  if (provider === 'custom') {
    await authClient.signIn.oauth2(
      {
        providerId: oauthConfig.customProviderId,
        callbackURL: '/list',
        scopes: oauthConfig.customProviderScope
          ? (JSON.parse(oauthConfig.customProviderScope) as string[])
          : undefined
      },
      { onSuccess: handleSuccess, onError: handleError }
    );
  } else {
    await authClient.signIn.social(
      {
        provider,
        callbackURL: '/list'
      },
      { onSuccess: handleSuccess, onError: handleError }
    );
  }
}
