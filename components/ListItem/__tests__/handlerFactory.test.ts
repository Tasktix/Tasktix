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

import api from '@/lib/api';

import { itemHandlerFactory } from '../handlerFactory';

vi.mock('@/lib/api');

describe('itemHandlerFactory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.patch).mockResolvedValue({
      code: 200,
      message: 'Success',
      content: undefined
    });
  });

  test('dispatches the priority update after a successful patch', async () => {
    const dispatchItemChange = vi.fn();
    const handlers = itemHandlerFactory(
      'item-id',
      'section-id',
      {
        timer: { current: undefined },
        lastTime: { current: new Date('2026-01-01T00:00:00.000Z') },
        setElapsedLive: vi.fn(),
        stopRunning: vi.fn()
      },
      dispatchItemChange
    );

    handlers.setPriority('High');

    await Promise.resolve();

    expect(api.patch).toHaveBeenCalledWith('/item/item-id', {
      priority: 'High'
    });
    expect(dispatchItemChange).toHaveBeenCalledWith({
      type: 'SetItemPriority',
      id: 'item-id',
      priority: 'High'
    });
  });
});
