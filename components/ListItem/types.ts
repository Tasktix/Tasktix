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

import { NamedColor } from '@/lib/model/color';
import ListItem from '@/lib/model/listItem';
import Tag from '@/lib/model/tag';

export type ItemAction =
  | { type: 'SetName'; name: ListItem['name'] }
  | { type: 'SetDueDate'; date: ListItem['dateDue'] }
  | { type: 'SetPriority'; priority: ListItem['priority'] }
  | { type: 'SetIncomplete' }
  | { type: 'SetComplete'; dateCompleted: ListItem['dateCompleted'] }
  | { type: 'SetExpectedMs'; expectedMs: ListItem['expectedMs'] }
  | { type: 'StartTime' }
  | { type: 'PauseTime' }
  | {
      type: 'ResetTime';
      status: Extract<ListItem['status'], 'Unstarted' | 'Completed'>;
    }
  | { type: 'LinkTag'; id: string; tagsAvailable: Tag[] }
  | { type: 'LinkNewTag'; id: string; name: string; color: NamedColor }
  | { type: 'UnlinkTag'; id: string };

export interface SetItem {
  startedRunning: () => void;
  pausedRunning: () => void;
  resetTime: () => void;
}
