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

const prisma = new PrismaClient();

async function main() {
  await auth.api.signUpEmail({
    body: {
      email: 'newUser@example.com',
      name: 'newUser',
      password: 'password123',
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
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    await prisma.$disconnect();
    throw e;
  });
