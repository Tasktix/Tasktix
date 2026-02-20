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

import { betterAuth, DBFieldType } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { haveIBeenPwned, username } from 'better-auth/plugins';

import { namedColors } from './model/color';

const prisma = new PrismaClient();

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
    changeEmail: {
      enabled: true,
      // Necessary unless we have an email server
      updateEmailWithoutVerification: true
    },
    additionalFields: {
      color: {
        type: namedColors as unknown as DBFieldType,
        required: true
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

  socialProviders: {},
  plugins: [
    username(),
    ...(process.env.ENABLE_PASSWORD_STRENGTH_CHECK === 'true' ? [
      haveIBeenPwned({
        customPasswordCompromisedMessage: 'Please choose a more secure password'
      })
    ] : [])
  ]
});
