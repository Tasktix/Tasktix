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

import { PrismaClient } from '@prisma/client';

import { auth } from '@/lib/auth';

const prisma = new PrismaClient({
  omit: {
    item: {
      issueId: true // Always omit issueId unless explicity necessary to prevent BigInt Serialization issues
    }
  }
});
const SEEDED_USER_SIGN_IN_VALUE = 'password123';

async function main() {
  await auth.api.signUpEmail({
    body: {
      email: 'newUser@example.com',
      name: 'newUser',
      password: SEEDED_USER_SIGN_IN_VALUE,
      username: 'newUser',
      color: 'Blue'
    }
  });

  await auth.api.signUpEmail({
    body: {
      email: 'individualUser@example.com',
      name: 'individualUser',
      password: '5up2r_s3cr3t',
      username: 'individualUser',
      color: 'Yellow'
    }
  });

  await auth.api.signUpEmail({
    body: {
      email: 'responsiveUser@example.com',
      name: 'responsiveUser',
      password: SEEDED_USER_SIGN_IN_VALUE,
      username: 'responsiveUser',
      color: 'Cyan'
    }
  });

  const [responsiveUser, adminRole] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { username: 'responsiveUser' } }),
    prisma.memberRole.findUniqueOrThrow({ where: { name: 'Admin' } })
  ]);

  await prisma.list.create({
    data: {
      id: 'responsiveList01',
      name: 'Responsive Cypress List',
      color: 'Blue',
      hasTimeTracking: true,
      hasDueDates: true,
      isAutoOrdered: true,
      members: {
        create: {
          roleId: adminRole.id,
          userId: responsiveUser.id
        }
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    await prisma.$disconnect();
    throw e;
  });
