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

import { addToast } from '@heroui/react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { SuccessContext } from 'better-auth/react';

import { authClient } from '@/lib/auth-client';
import User from '@/lib/model/user';

export interface OAuthControllers {
  setLoggedInUser: (user: User) => void;
  router: AppRouterInstance;
}

const SUPPORTED_PROVIDERS = ['github'];
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
 * @param controllers.router - Next.js App Router instance for navigation
 *
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await handleOauth('github', {
 *   setLoggedInUser: (user) => setUser(user),
 *   router: useRouter()
 * });
 * ```
 */

export async function handleOauth(
  provider: string,
  controllers: OAuthControllers
) {
  // Error Early if provider is not supported
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    return;
  }
  await authClient.signIn.social(
    {
      provider
    },
    {
      onSuccess: (ctx: SuccessContext<{ User: User }>) => {
        controllers.setLoggedInUser(ctx.data.User);
        controllers.router.push('/list');
      },
      onError: ctx => {
        addToast({ title: ctx.error.message, color: 'danger' });
      }
    }
  );
}
