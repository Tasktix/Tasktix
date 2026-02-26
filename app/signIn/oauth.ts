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

interface OAuthOptions {
  setLoggedInUser: (user: User) => void;
  router: AppRouterInstance;
}

export async function handleOauth(provider: string, options: OAuthOptions) {
  await authClient.signIn.social(
    {
      provider: provider
    },
    {
      onSuccess: (ctx: SuccessContext<{ User: User }>) => {
        options.setLoggedInUser(ctx.data.User);
        options.router.push('/list');
      },
      onError: ctx => {
        addToast({ title: ctx.error.message, color: 'danger' });
      }
    }
  );
}
