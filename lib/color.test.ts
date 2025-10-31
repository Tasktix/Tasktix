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

import { namedColors, NamedColor } from '@/lib/model/color';

import {
  getBackgroundColor,
  getBorderColor,
  getPriorityColor,
  getTextColor,
  randomNamedColor
} from './color';

describe('getPriorityColor', () => {
  test('Returns the correct semantic color for each priority level', () => {
    expect(getPriorityColor('all')).toBe('danger');
    expect(getPriorityColor(new Set(['High']))).toBe('danger');
    expect(getPriorityColor(new Set(['High', 'Medium']))).toBe('danger');
    expect(getPriorityColor(new Set(['High', 'Low']))).toBe('danger');
    expect(getPriorityColor(new Set(['High', 'Medium', 'Low']))).toBe('danger');

    expect(getPriorityColor(new Set(['Medium']))).toBe('warning');
    expect(getPriorityColor(new Set(['Medium', 'Low']))).toBe('warning');

    expect(getPriorityColor(new Set(['Low']))).toBe('success');

    expect(getPriorityColor(new Set(['invalid']))).toBe('success');
  });
});

describe('getTextColor', () => {
  test('Returns the correct NextUI text color class for valid semantic colors', () => {
    expect(getTextColor('danger')).toBe('text-danger');
    expect(getTextColor('warning')).toBe('text-warning');
    expect(getTextColor('success')).toBe('text-success');
  });

  test('Returns a valid Tailwind text color class for valid named colors', () => {
    expect(getTextColor('Pink')).toMatch(/^text-pink-(\d{2,3})$/);
    expect(getTextColor('Red')).toMatch(/^text-red-(\d{2,3})$/);
    expect(getTextColor('Orange')).toMatch(/^text-orange-(\d{2,3})$/);
    expect(getTextColor('Amber')).toMatch(/^text-amber-(\d{2,3})$/);
    expect(getTextColor('Yellow')).toMatch(/^text-yellow-(\d{2,3})$/);
    expect(getTextColor('Lime')).toMatch(/^text-lime-(\d{2,3})$/);
    expect(getTextColor('Green')).toMatch(/^text-green-(\d{2,3})$/);
    expect(getTextColor('Emerald')).toMatch(/^text-emerald-(\d{2,3})$/);
    expect(getTextColor('Cyan')).toMatch(/^text-cyan-(\d{2,3})$/);
    expect(getTextColor('Blue')).toMatch(/^text-blue-(\d{2,3})$/);
    expect(getTextColor('Violet')).toMatch(/^text-violet-(\d{2,3})$/);
  });
});

describe('getBackgroundColor', () => {
  test('Returns the correct NextUI background color class for valid semantic colors', () => {
    expect(getBackgroundColor('danger')).toBe('bg-danger');
    expect(getBackgroundColor('warning')).toBe('bg-warning');
    expect(getBackgroundColor('success')).toBe('bg-success');
  });

  test('Returns a valid Tailwind background color class for valid named colors', () => {
    expect(getBackgroundColor('Pink')).toMatch(/^bg-pink-(\d{2,3})$/);
    expect(getBackgroundColor('Red')).toMatch(/^bg-red-(\d{2,3})$/);
    expect(getBackgroundColor('Orange')).toMatch(/^bg-orange-(\d{2,3})$/);
    expect(getBackgroundColor('Amber')).toMatch(/^bg-amber-(\d{2,3})$/);
    expect(getBackgroundColor('Yellow')).toMatch(/^bg-yellow-(\d{2,3})$/);
    expect(getBackgroundColor('Lime')).toMatch(/^bg-lime-(\d{2,3})$/);
    expect(getBackgroundColor('Green')).toMatch(/^bg-green-(\d{2,3})$/);
    expect(getBackgroundColor('Emerald')).toMatch(/^bg-emerald-(\d{2,3})$/);
    expect(getBackgroundColor('Cyan')).toMatch(/^bg-cyan-(\d{2,3})$/);
    expect(getBackgroundColor('Blue')).toMatch(/^bg-blue-(\d{2,3})$/);
    expect(getBackgroundColor('Violet')).toMatch(/^bg-violet-(\d{2,3})$/);
  });
});

describe('getBorderColor', () => {
  test('Returns the correct NextUI border color class for valid semantic colors', () => {
    expect(getBorderColor('danger')).toBe('border-danger');
    expect(getBorderColor('warning')).toBe('border-warning');
    expect(getBorderColor('success')).toBe('border-success');
  });

  test('Returns a valid Tailwind border color class for valid named colors', () => {
    expect(getBorderColor('Pink')).toMatch(/^border-pink-(\d{2,3})$/);
    expect(getBorderColor('Red')).toMatch(/^border-red-(\d{2,3})$/);
    expect(getBorderColor('Orange')).toMatch(/^border-orange-(\d{2,3})$/);
    expect(getBorderColor('Amber')).toMatch(/^border-amber-(\d{2,3})$/);
    expect(getBorderColor('Yellow')).toMatch(/^border-yellow-(\d{2,3})$/);
    expect(getBorderColor('Lime')).toMatch(/^border-lime-(\d{2,3})$/);
    expect(getBorderColor('Green')).toMatch(/^border-green-(\d{2,3})$/);
    expect(getBorderColor('Emerald')).toMatch(/^border-emerald-(\d{2,3})$/);
    expect(getBorderColor('Cyan')).toMatch(/^border-cyan-(\d{2,3})$/);
    expect(getBorderColor('Blue')).toMatch(/^border-blue-(\d{2,3})$/);
    expect(getBorderColor('Violet')).toMatch(/^border-violet-(\d{2,3})$/);
  });
});

describe('randomNamedColor', () => {
  test('Returns a valid named color', () => {
    const result = randomNamedColor();

    expect(namedColors.includes(result)).toBe(true);
  });

  test('Returns random results across multiple calls', () => {
    const results = new Set<NamedColor>();

    for (let i = 0; i < 100; i++) {
      results.add(randomNamedColor());
    }

    // Ensure that at least a few different colors are picked
    expect(results.size).toBeGreaterThan(1);
  });
});
