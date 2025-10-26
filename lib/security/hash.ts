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

import { BinaryLike, randomFill, scrypt } from 'crypto';

export async function hash(password: string): Promise<string> {
  function randomString(length = 16): Promise<Uint8Array<ArrayBuffer>> {
    return new Promise((resolve, reject) => {
      randomFill(new Uint8Array(length), (err, str) => {
        if (err) reject(err);
        resolve(str);
      });
    });
  }

  const salt = Buffer.from(await randomString());

  return `${salt.toString('hex')}:${await _hash(password, salt)}`;
}

export async function compare(
  password: string,
  hash: string
): Promise<boolean> {
  const [saltString, otherPass, ...extra] = hash.split(':');

  if (extra.length || !otherPass) return false;

  const salt = Uint8Array.from(Buffer.from(saltString, 'hex'));

  const hashedPassword = await _hash(password, salt);

  return hashedPassword === otherPass;
}

function _hash(password: string, salt: BinaryLike): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 128, (err, key) => {
      if (err) reject(err);

      resolve(key.toString('base64'));
    });
  });
}
