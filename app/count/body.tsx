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

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';

import api from '@/lib/api';

export default function Body() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const es = new EventSource('/api/events');

    es.onmessage = event => {
      const data = JSON.parse(event.data as string) as { count: number };

      setCount(data.count);
    };
  }, []);

  return (
    <span className='flex gap-4 justify-center'>
      <h1 className='text-3xl md:text-4xl font-extrabold'>{count}</h1>
      <Button
        onPress={() => {
          void api.post('/count', { count: count + 1 });
        }}
      >
        Increment
      </Button>
    </span>
  );
}
