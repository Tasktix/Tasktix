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

import { retry } from '../util';

describe('retry', () => {
  test('It runs the function only once and returns its value if it succeeds', () => {
    const fn = vi.fn().mockReturnValue(true);

    const result = retry(fn) as true | undefined;

    expect(result).toBe(true);
    expect(fn).toHaveBeenCalledOnce();
  });

  test('It retries the function and returns its value if it fails the first time', () => {
    const fn = vi.fn().mockImplementationOnce(() => {
      throw new Error();
    });

    fn.mockReturnValueOnce(true);

    const result = retry(fn) as true | undefined;

    expect(result).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('It retries the function 3 times by default and returns undefined if still fails', () => {
    const fn = vi.fn().mockImplementation(() => {
      throw new Error();
    });

    const result = retry(fn) as true | undefined;

    expect(result).toBe(undefined);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('It retries the function as many times as specified and returns undefined if still fails', () => {
    const fn = vi.fn().mockImplementation(() => {
      throw new Error();
    });

    const result = retry(fn, 6) as true | undefined;

    expect(result).toBe(undefined);
    expect(fn).toHaveBeenCalledTimes(6);
  });
});
