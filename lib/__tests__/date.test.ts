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

import {
  getDateDiff,
  getDayOffset,
  formatDate,
  formatTime,
  inputToDate,
  dateToInput,
  parseTime
} from '../date';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2023-01-01 00:00:00'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('getDateDiff', () => {
  test('Returns positive difference when a is later than b', () => {
    // Short variable name matches test name - skipcq: JS-C1002
    const a = new Date('2023-01-02');
    // Short variable name matches test name - skipcq: JS-C1002
    const b = new Date('2023-01-01');

    expect(getDateDiff(a, b)).toBe(24 * 60 * 60 * 1000);
  });

  test('Returns negative difference when a is earlier than b', () => {
    // Short variable name matches test name - skipcq: JS-C1002
    const a = new Date('2023-01-01');
    // Short variable name matches test name - skipcq: JS-C1002
    const b = new Date('2023-01-02');

    expect(getDateDiff(a, b)).toBe(-(24 * 60 * 60 * 1000));
  });
});

describe('getDayOffset', () => {
  test('Returns correct day offsets for dates with no time component', () => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    expect(getDayOffset(today)).toBe(0);
    expect(getDayOffset(tomorrow)).toBe(1);
    expect(getDayOffset(yesterday)).toBe(-1);
  });

  test('Returns correct day offsets for dates with time components', () => {
    const today = new Date();

    today.setHours(2, 6, 9, 14);

    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    expect(getDayOffset(today)).toBe(0);
    expect(getDayOffset(tomorrow)).toBe(1);
    expect(getDayOffset(yesterday)).toBe(-1);
  });
});

describe('formatDate', () => {
  test('Returns "Today" for current date when pretty printing', () => {
    const today = new Date();

    expect(formatDate(today)).toBe('Today');
  });

  test('Returns "Today" for current date at midnight when pretty printing', () => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expect(formatDate(today)).toBe('Today');
  });

  test('Returns "Today" for current date just before midnight when pretty printing', () => {
    const today = new Date();

    today.setHours(23, 59, 59, 999);
    expect(formatDate(today)).toBe('Today');
  });

  test('Returns "Tomorrow" for tomorrow when pretty printing', () => {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatDate(tomorrow)).toBe('Tomorrow');
  });

  test('Returns "Tomorrow" for tomorrow at midnight when pretty printing', () => {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    expect(formatDate(tomorrow)).toBe('Tomorrow');
  });

  test('Returns "Tomorrow" for tomorrow just before midnight when pretty printing', () => {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    expect(formatDate(tomorrow)).toBe('Tomorrow');
  });

  test('Returns "Yesterday" for yesterday when pretty printing', () => {
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDate(yesterday)).toBe('Yesterday');
  });

  test('Returns "Yesterday" for yesterday at midnight when pretty printing', () => {
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    expect(formatDate(yesterday)).toBe('Yesterday');
  });

  test('Returns "Yesterday" for yesterday just before midnight when pretty printing', () => {
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    expect(formatDate(yesterday)).toBe('Yesterday');
  });

  test('Returns weekday for future dates within this week when pretty printing', () => {
    vi.setSystemTime(new Date('2023-01-01 00:00:00')); // A Sunday

    const wednesday = new Date(2023, 0, 4);
    const saturday = new Date(2023, 0, 7);

    expect(formatDate(wednesday)).toBe('Wednesday');
    expect(formatDate(saturday)).toBe('Saturday');
  });

  test('Returns weekday for future dates within three days, even if a different week, when pretty printing', () => {
    vi.setSystemTime(new Date('2023-01-05 00:00:00')); // A Thursday

    const sunday = new Date();

    sunday.setDate(sunday.getDate() + 3);

    expect(formatDate(sunday)).toBe('Sunday');
  });

  test('Returns formatted date string for past dates within this week when pretty printing', () => {
    vi.setSystemTime(new Date('2023-01-06 00:00:00')); // A Friday

    const sunday = new Date(2023, 0, 1);
    const thursday = new Date(2023, 0, 4);

    expect(formatDate(sunday)).toBe('01/01/2023');
    expect(formatDate(thursday)).toBe('01/04/2023');
  });

  test('Returns formatted date string for future dates more than three days out, if a different week, when pretty printing', () => {
    vi.setSystemTime(new Date('2023-01-05 00:00:00')); // A Thursday

    const sunday = new Date();

    sunday.setDate(sunday.getDate() + 4);

    expect(formatDate(sunday)).toBe('01/09/2023');
  });

  test('Returns formatted date string when not pretty printing', () => {
    const date = new Date();

    expect(formatDate(date, false)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('formatTime', () => {
  test('Formats hours and minutes correctly', () => {
    expect(formatTime(30 * 60 * 1000)).toBe('00:30');
    expect(formatTime(60 * 60 * 1000)).toBe('01:00');
    expect(formatTime(90 * 60 * 1000)).toBe('01:30');
    expect(formatTime(120 * 60 * 1000)).toBe('02:00');
  });

  test('Maintains formatting for time zero', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  test('Rounds to the nearest minute', () => {
    expect(formatTime(3600000)).toBe('01:00');
    expect(formatTime(3629999)).toBe('01:00');
    expect(formatTime(3630000)).toBe('01:01');
    expect(formatTime(3660000)).toBe('01:01');
  });
});

describe('inputToDate', () => {
  test('converts date string to Date object', () => {
    const result = inputToDate('2023-01-15');

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(0); // January is 0
    expect(result.getDate()).toBe(15);
  });
});

describe('dateToInput', () => {
  test('converts Date object to date string', () => {
    const date = new Date(2023, 0, 15); // 2023-01-15

    expect(dateToInput(date)).toBe('2023-01-15');
  });

  test('pads month and day with leading zeros', () => {
    const date = new Date(2023, 0, 5); // 2023-01-05

    expect(dateToInput(date)).toBe('2023-01-05');
  });
});

describe('parseTime', () => {
  test('Parses hours:minutes:seconds format', () => {
    expect(parseTime('01:30:30')).toBe(5430000); // 1.5 hours + 30 seconds in ms
  });

  test('Parses hours:minutes format', () => {
    expect(parseTime('01:30')).toBe(5400000); // 1.5 hours in ms
  });

  test('Parses minutes-only format', () => {
    expect(parseTime('30')).toBe(1800000); // 30 minutes in ms
  });

  test('Treats empty string like zero', () => {
    expect(parseTime('')).toBe(0);
  });

  test('Throws error for invalid format', () => {
    expect(() => parseTime('01:01:01:01')).toThrow(
      'Invalid time to parse: 01:01:01:01'
    );
    expect(() => parseTime('invalid_str')).toThrow(
      'Invalid time to parse: invalid_str'
    );
  });
});
