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

/**
 * Catches any errors thrown by the given function and retries it to resolve ephemeral
 * errors
 *
 * @param fn The function to retry
 * @param attempts The maximum number of times to retry the function
 */
export function retry<T>(fn: () => T, attempts = 3): T | undefined {
  for (let i = 1; i <= attempts; i++)
    try {
      return fn();
    } catch {
      /* Don't need to do anything; already retrying in loop */
    }

  return undefined;
}

export function parseBoolean(input: string | undefined): boolean {
  return (
    Boolean(input) &&
    input?.toLowerCase() !== 'false' &&
    input?.toLowerCase() !== 'no'
  );
}
