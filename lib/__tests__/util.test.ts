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

import { mergeMaps, retry } from '../util';

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

    expect(result).toBe(undefined); // toBe expects an argument- skipcq: JS-W1042
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('It retries the function as many times as specified and returns undefined if still fails', () => {
    const fn = vi.fn().mockImplementation(() => {
      throw new Error();
    });

    const result = retry(fn, 6) as true | undefined;

    expect(result).toBe(undefined); // toBe expects an argument- skipcq: JS-W1042
    expect(fn).toHaveBeenCalledTimes(6);
  });
});

describe('mergeMaps', () => {
  it('Takes two maps without overlapping keys and creates a new map with all key:value from the two maps', () => {
    const map1 = new Map([
      ['key1', 'value1'],
      ['key2', 'value2']
    ]);
    const map2 = new Map([
      ['key3', 'value3'],
      ['key4', 'value4']
    ]);

    const result = mergeMaps([map1, map2]);

    expect(result).not.toBe(map1);
    expect(result).not.toBe(map2);
    expect(result.get('key1')).toBe('value1');
    expect(result.get('key2')).toBe('value2');
    expect(result.get('key3')).toBe('value3');
    expect(result.get('key4')).toBe('value4');
  });

  it("Keeps the last map's corresponding value for maps that have duplicate keys", () => {
    const map1 = new Map([
      ['key1', 'value1'],
      ['key2', 'value2']
    ]);
    const map2 = new Map([
      ['key2', 'value3'],
      ['key3', 'value4']
    ]);

    const result = mergeMaps([map1, map2]);

    expect(result.get('key1')).toBe('value1');
    expect(result.get('key2')).toBe('value3');
    expect(result.get('key3')).toBe('value4');
  });

  it('Returns a new empty map if given only empty maps', () => {
    const map1 = new Map(),
      map2 = new Map(),
      map3 = new Map();

    const result = mergeMaps([map1, map2, map3]);

    expect(result).not.toBe(map1);
    expect(result).not.toBe(map2);
    expect(result).not.toBe(map3);
    expect(result.size).toBe(0);
  });

  it('Returns a new empty map if given no maps', () => {
    const result = mergeMaps([]);

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });
});
