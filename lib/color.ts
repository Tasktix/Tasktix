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

import { Selection } from '@heroui/react';

import {
  Color,
  NamedColor,
  namedColors,
  SemanticColor
} from '@/lib/model/color';

export function getPriorityColor(priority: Selection): SemanticColor {
  if (priority === 'all' || priority.has('High')) return 'danger';

  return priority.has('Medium') ? 'warning' : 'success';
}

// Default case intentionally omitted to surface TS error if not all cases are
// explicitly handled (e.g. because the Color type was expanded). All VALID code paths
// (based on the Color type) do return - skipcq: JS-0045
export function getTextColor(color: Color): string {
  switch (color) {
    case 'danger':
      return 'text-danger';
    case 'warning':
      return 'text-warning';
    case 'success':
      return 'text-success';
    case 'Pink':
      return 'text-pink-500';
    case 'Red':
      return 'text-red-500';
    case 'Orange':
      return 'text-orange-500';
    case 'Amber':
      return 'text-amber-500';
    case 'Yellow':
      return 'text-yellow-500';
    case 'Lime':
      return 'text-lime-500';
    case 'Green':
      return 'text-green-500';
    case 'Emerald':
      return 'text-emerald-500';
    case 'Cyan':
      return 'text-cyan-500';
    case 'Blue':
      return 'text-blue-500';
    case 'Violet':
      return 'text-violet-500';
  }
}

// Default case intentionally omitted to surface TS error if not all cases are
// explicitly handled (e.g. because the Color type was expanded). All VALID code paths
// (based on the Color type) do return - skipcq: JS-0045
export function getBackgroundColor(color: Color): string {
  switch (color) {
    case 'danger':
      return 'bg-danger';
    case 'warning':
      return 'bg-warning';
    case 'success':
      return 'bg-success';
    case 'Pink':
      return 'bg-pink-500';
    case 'Red':
      return 'bg-red-500';
    case 'Orange':
      return 'bg-orange-500';
    case 'Amber':
      return 'bg-amber-500';
    case 'Yellow':
      return 'bg-yellow-500';
    case 'Lime':
      return 'bg-lime-500';
    case 'Green':
      return 'bg-green-500';
    case 'Emerald':
      return 'bg-emerald-500';
    case 'Cyan':
      return 'bg-cyan-500';
    case 'Blue':
      return 'bg-blue-500';
    case 'Violet':
      return 'bg-violet-500';
  }
}

// Default case intentionally omitted to surface TS error if not all cases are
// explicitly handled (e.g. because the Color type was expanded). All VALID code paths
// (based on the Color type) do return - skipcq: JS-0045
export function getBorderColor(color: Color): string {
  switch (color) {
    case 'danger':
      return 'border-danger';
    case 'warning':
      return 'border-warning';
    case 'success':
      return 'border-success';
    case 'Pink':
      return 'border-pink-500';
    case 'Red':
      return 'border-red-500';
    case 'Orange':
      return 'border-orange-500';
    case 'Amber':
      return 'border-amber-500';
    case 'Yellow':
      return 'border-yellow-500';
    case 'Lime':
      return 'border-lime-500';
    case 'Green':
      return 'border-green-500';
    case 'Emerald':
      return 'border-emerald-500';
    case 'Cyan':
      return 'border-cyan-500';
    case 'Blue':
      return 'border-blue-500';
    case 'Violet':
      return 'border-violet-500';
  }
}

export function randomNamedColor(): NamedColor {
  const index = Math.floor(Math.random() * namedColors.length);

  return namedColors[index];
}
