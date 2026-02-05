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

import { Reorder, useDragControls } from 'framer-motion';

import ListItem from './ListItem';
import { ListItemParams } from './types';

/**
 * Provides a wrapper over <ListItem /> to allow reordering using Framer Motion's reorder
 * components
 *
 * @param onDragEnd Callback to trigger API call & "official" reorder after a reordering
 *  interaction finishes
 * @param params Parameters passed through to <ListItem />
 */
export default function ReorderableListItem({
  onDragEnd,
  ...params
}: ListItemParams & { onDragEnd: () => unknown }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      key={params.item.id}
      className='border-b-1 border-content3 last:border-b-0'
      dragControls={controls}
      dragListener={false}
      value={params.item}
      onDragEnd={onDragEnd}
    >
      <ListItem {...params} key={params.item.id} reorderControls={controls} />
    </Reorder.Item>
  );
}
