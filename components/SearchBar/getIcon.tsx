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
  CalendarEventFill,
  ChevronDown,
  InputCursorText,
  StopwatchFill,
  Toggle2On
} from 'react-bootstrap-icons';
import { ReactElement } from 'react';

import { InputOption } from './types';

/**
 * Default case intentionally omitted to surface TS error if not all cases are explicitly
 * handled (e.g. because the Color type was expanded). All VALID code paths (based on the
 * Color type) do return - skipcq: JS-0045
 */
export function getIcon(type: InputOption['type']): ReactElement {
  switch (type) {
    case 'String':
      return <InputCursorText />;

    case 'Select':
      return <ChevronDown />;

    case 'Date':
      return <CalendarEventFill />;

    case 'Time':
      return <StopwatchFill />;

    case 'Toggle':
      return <Toggle2On />;
  }
}
