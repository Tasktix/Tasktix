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

/* eslint-disable no-console */

import 'server-only';

import { betterAuth, DBFieldType } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { genericOAuth, haveIBeenPwned, username } from 'better-auth/plugins';

import { namedColors } from './model/color';

const prisma = new PrismaClient();

export type OAuthConfig = {
  githubEnabled: boolean;
  customEnabled: boolean;
  customProviderId: string;
  customProviderScope?: string[];
};

/**
 * Server function that allows client to access state of OAuth configuration, available from the useAuth hook.
 * Should not be called from client
 *
 * @returns Object containing all supported oauth providers and whether they have been configured
 */
export const getOAuthConfig = () => {
  let scopes;

  try {
    scopes = process.env.OAUTH_SCOPES
      ? (JSON.parse(process.env.OAUTH_SCOPES) as string[])
      : undefined;
  } catch {
    console.error(
      'Failed to parse OAUTH_SCOPES environment variable. Should be a JSON array of strings'
    );
  }

  const config: OAuthConfig = {
    githubEnabled:
      Boolean(process.env.GITHUB_CLIENT_ID) &&
      Boolean(process.env.GITHUB_CLIENT_SECRET),
    customEnabled:
      Boolean(process.env.OAUTH_PROVIDER_ID) &&
      Boolean(process.env.OAUTH_CLIENT_ID),
    customProviderId: process.env.OAUTH_PROVIDER_ID ?? 'SSO',
    customProviderScope: scopes
  };

  return config;
};

// auth functionality is tested where used - skipcq: TCV-001
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql'
  }),
  /**
   * The user and session table schemas support adding additional/renaming
   * fields, but they must be documented here. For details on how to apply this
   * read this: https://www.better-auth.com/docs/concepts/database#custom-tables
   */
  user: {
    modelName: 'User',
    tableName: 'User',
    deleteUser: {
      enabled: true
    },
    changeEmail: {
      enabled: true,
      // Necessary unless we have an email server
      updateEmailWithoutVerification: true
    },
    additionalFields: {
      color: {
        type: namedColors as unknown as DBFieldType,
        required: true,
        defaultValue: 'Blue'
      },
      legacyPassword: {
        type: 'string',
        required: false,
        input: false
      }
    }
  },
  session: {
    modelName: 'Session',
    tableName: 'Session'
  },
  account: {
    modelName: 'Account',
    tableName: 'Account'
  },
  verification: {
    modelName: 'Verification',
    tableName: 'Verification'
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10
  },
  socialProviders: {
    ...(getOAuthConfig().githubEnabled
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
          }
        }
      : {})
  },
  plugins: [
    username(),
    ...(process.env.ENABLE_PASSWORD_STRENGTH_CHECK === 'true'
      ? [
          haveIBeenPwned({
            customPasswordCompromisedMessage:
              'Please choose a more secure password'
          })
        ]
      : []),
    ...(getOAuthConfig().customEnabled
      ? [
          genericOAuth({
            config: [
              {
                providerId: process.env.OAUTH_PROVIDER_ID as string,
                authorizationUrl: process.env.OAUTH_AUTHORIZATION_URL,
                tokenUrl: process.env.OAUTH_TOKEN_URL,
                userInfoUrl: process.env.OAUTH_USERINFO_URL,
                clientId: process.env.OAUTH_CLIENT_ID as string,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                discoveryUrl: process.env.OAUTH_DISCOVERY_URL
              }
            ]
          })
        ]
      : [])
  ]
});
