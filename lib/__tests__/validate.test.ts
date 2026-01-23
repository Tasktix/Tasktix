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
  validateColor,
  validateEmail,
  validateListItemName,
  validateListName,
  validateListSectionName,
  validatePassword,
  validateUsername
} from '../validate';

describe('validateUsername', () => {
  test('Usernames with letters are valid', () => {
    const data = 'abcABC';

    const result = validateUsername(data);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('Usernames with numbers are valid', () => {
    const data = '123987';

    const result = validateUsername(data);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('Usernames with underscores are valid', () => {
    const data = '___';

    const result = validateUsername(data);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('Usernames with letters, numbers, and underscores are valid', () => {
    const data = 'abc_123';

    const result = validateUsername(data);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('Usernames with no more than 32 characters are valid', () => {
    const data = 'abcdefghijklmnopqrstuvwxyz789012';

    const result = validateUsername(data);

    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  test('Empty usernames are invalid', () => {
    const data = '';

    const result = validateUsername(data);

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Username must be at least 3 characters');
  });

  test('Short usernames are invalid', () => {
    const data = '2c';

    const result = validateUsername(data);

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Username must be at least 3 characters');
  });

  test('Usernames with special characters are invalid', () => {
    const data = 'd@b0y!';

    const result = validateUsername(data);

    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      'Username can only have letters, numbers, and underscores'
    );
  });

  test('Usernames with more than 32 characters are invalid', () => {
    const data = 'abcdefghijklmnopqrstuvwxyz7890123';

    const result = validateUsername(data);

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Username cannot be more than 32 characters');
  });
});

describe('validateEmail', () => {
  test('Valid emails are accepted', () => {
    const data = 'test+gmail-alias@subdomain.example.com';

    const result = validateEmail(data);

    expect(result).toBe(true);
  });

  // No further tests because validateEmail is currently implemented with a regex that
  // matches the email address RFC
});

describe('validatePassword', () => {
  test('Accepts passwords with at least 10 characters made of letters, numbers, or special characters', () => {
    const numbers_data = '1234567890';
    const letters_data = 'abcdefghij';
    const special_chars_data = '!@#$%^&*()';

    const numbers_result = validatePassword(numbers_data);
    const letters_result = validatePassword(letters_data);
    const special_chars_result = validatePassword(special_chars_data);

    expect(numbers_result.valid).toBe(true);
    expect(letters_result.valid).toBe(true);
    expect(special_chars_result.valid).toBe(true);
  });

  test('Marks passwords with less than 16 characters as "acceptable"', () => {
    const short_data = '1234567890';
    const long_data = '123456789012345';

    const short_result = validatePassword(short_data);
    const long_result = validatePassword(long_data);

    expect(short_result.message).toBe('acceptable');
    expect(long_result.message).toBe('acceptable');
    expect(short_result.color).toBe('warning');
    expect(short_result.color).toBe('warning');
  });

  test('Marks passwords with at least 16 characters as "strong"', () => {
    const data = '1234567890123456';

    const result = validatePassword(data);

    expect(result.message).toBe('strong');
    expect(result.color).toBe('success');
  });

  test('Rejects passwords with less than 10 characters', () => {
    const data = '1z2a9b@!,';

    const result = validatePassword(data);

    expect(result.valid).toBe(false);
    expect(result.message).toBe('weak');
    expect(result.color).toBe('danger');
  });

  test('Rejects passwords with more than 128 characters', () => {
    const data =
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901' +
      '2345678901234567890123456789';

    const result = validatePassword(data);

    expect(result.valid).toBe(false);
    expect(result.color).toBe('danger');
  });
});

describe('validateListName', () => {
  test('Accepts list names with no more than 64 characters', () => {
    const data =
      '1234567890123456789012345678901234567890123456789012345678901234';

    const [isValid, fixed_result] = validateListName(data);

    expect(isValid).toBe(true);
    expect(fixed_result).toEqual(data);
  });

  test('Rejects list names with more than 64 characters and returns a valid result', () => {
    const data =
      '12345678901234567890123456789012345678901234567890123456789012345';

    const [isValid, fixed_result] = validateListName(data);

    expect(isValid).toBe(false);
    expect(fixed_result).toEqual(
      '1234567890123456789012345678901234567890123456789012345678901234'
    );
  });
});

describe('validateListSectionName', () => {
  test('Accepts names with no more than 64 characters', () => {
    const data =
      '1234567890123456789012345678901234567890123456789012345678901234';

    const [isValid, fixed_result] = validateListSectionName(data);

    expect(isValid).toBe(true);
    expect(fixed_result).toEqual(data);
  });

  test('Rejects names with more than 64 characters and returns a valid result', () => {
    const data =
      '12345678901234567890123456789012345678901234567890123456789012345';

    const [isValid, fixed_result] = validateListSectionName(data);

    expect(isValid).toBe(false);
    expect(fixed_result).toEqual(
      '1234567890123456789012345678901234567890123456789012345678901234'
    );
  });
});

describe('validateListItemName', () => {
  test('Accepts names with no more than 128 characters', () => {
    const data =
      '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678';

    const [isValid, fixed_result] = validateListItemName(data);

    expect(isValid).toBe(true);
    expect(fixed_result).toEqual(data);
  });

  test('Rejects names with more than 128 characters and returns a valid result', () => {
    const data =
      '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890' +
      '12345678901234567890123456789';

    const [isValid, fixed_result] = validateListItemName(data);

    expect(isValid).toBe(false);
    expect(fixed_result).toEqual(
      '1234567890123456789012345678901234567890123456789012345678901234567890' +
        '1234567890123456789012345678901234567890123456789012345678'
    );
  });
});

describe('validateColor', () => {
  test('Accepts named colors', () => {
    let result = validateColor('Pink');

    expect(result).toBe(true);

    result = validateColor('Red');
    expect(result).toBe(true);

    result = validateColor('Orange');
    expect(result).toBe(true);

    result = validateColor('Amber');
    expect(result).toBe(true);

    result = validateColor('Yellow');
    expect(result).toBe(true);

    result = validateColor('Lime');
    expect(result).toBe(true);

    result = validateColor('Green');
    expect(result).toBe(true);

    result = validateColor('Emerald');
    expect(result).toBe(true);

    result = validateColor('Cyan');
    expect(result).toBe(true);

    result = validateColor('Blue');
    expect(result).toBe(true);

    result = validateColor('Violet');
    expect(result).toBe(true);
  });

  test('Rejects semantic colors', () => {
    let result = validateColor('success');

    expect(result).toBe(false);

    result = validateColor('warning');
    expect(result).toBe(false);

    result = validateColor('danger');
    expect(result).toBe(false);
  });

  test('Rejects unknown colors', () => {
    const data = 'Mint Green';

    const result = validateColor(data);

    expect(result).toBe(false);
  });
});
