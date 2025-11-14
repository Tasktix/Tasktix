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

import { Button } from '@heroui/react';
import { PauseFill, PlayFill } from 'react-bootstrap-icons';

import ListItem from '@/lib/model/listItem';

export default function TimeButton({
  status,
  startRunning,
  pauseRunning
}: {
  status: ListItem['status'];
  startRunning: () => unknown;
  pauseRunning: () => unknown;
}) {
  const playBtn = <PlayFill className='shrink-0' />;
  const pauseBtn = <PauseFill className='shrink-0' />;

  switch (status) {
    case 'Unstarted':
      return (
        <Button
          className='w-24'
          color='primary'
          startContent={playBtn}
          tabIndex={0}
          variant='ghost'
          onPress={startRunning}
        >
          Start
        </Button>
      );
    case 'In Progress':
      return (
        <Button
          className='w-24'
          color='warning'
          startContent={pauseBtn}
          tabIndex={0}
          variant='ghost'
          onPress={pauseRunning}
        >
          Pause
        </Button>
      );
    case 'Paused':
    case 'Completed':
      return (
        <Button
          className='w-24'
          color='primary'
          isDisabled={status === 'Completed'}
          startContent={playBtn}
          tabIndex={status === 'Completed' ? 1 : 0}
          variant='ghost'
          onPress={startRunning}
        >
          Resume
        </Button>
      );
  }
}
