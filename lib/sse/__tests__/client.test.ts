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

import { Mock } from 'vitest';
import { addToast } from '@heroui/react';

import { subscribe } from '../client';

class MockEventSource {
  onopen = null;
  onmessage = null;
  onerror = null;
  readyState = 0;

  constructor(_: string) {}
  close = () => {};

  CONNECTING = 0;
  OPEN = 1;
  CLOSED = 2;
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;
}

vi.mock('@heroui/react');

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe('subscribe', () => {
  test('Triggers onEvent with JSON-parsed event when SSE message sent', () => {
    const eventHandler = vi.fn();
    const es = vi.fn(MockEventSource) as Mock<typeof EventSource>;

    vi.stubGlobal('EventSource', es);

    subscribe(['list-id'], eventHandler);
    es.mock.instances[0].onopen!(new Event('Mock connect event'));

    es.mock.instances[0].onmessage!({
      data: '{"contents": true}'
    } as MessageEvent);

    expect(eventHandler).toHaveBeenCalledExactlyOnceWith({ contents: true });
  });

  test('Displays toast warning when SSE connection lost', () => {
    const eventHandler = vi.fn();
    const es = vi.fn(MockEventSource) as Mock<typeof EventSource>;

    vi.stubGlobal('EventSource', es);
    vi.mocked(addToast).mockReturnValue('toast-id');

    subscribe(['list-id'], eventHandler);
    es.mock.instances[0].onopen!(new Event('Mock connect event'));

    (es.mock.instances[0] as { readyState: number }).readyState = es.CONNECTING;
    es.mock.instances[0].onerror!(new Event('Mock disconnect event'));

    expect(addToast).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ title: 'Reconnecting for live updates' })
    );
  });

  test('Displays toast error when SSE connection is unexpectedly closed', () => {
    const eventHandler = vi.fn();
    const es = vi.fn(MockEventSource) as Mock<typeof EventSource>;

    vi.stubGlobal('EventSource', es);
    vi.mocked(addToast).mockReturnValue('toast-id');

    subscribe(['list-id'], eventHandler);
    es.mock.instances[0].onopen!(new Event('Mock connect event'));

    (es.mock.instances[0] as { readyState: number }).readyState = es.CONNECTING;
    es.mock.instances[0].onerror!(new Event('Mock disconnect event'));
    (es.mock.instances[0] as { readyState: number }).readyState = es.CLOSED;
    es.mock.instances[0].onerror!(new Event('Mock connection closed event'));

    expect(addToast).toHaveBeenCalledTimes(2);
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Reconnecting for live updates' })
    );
    expect(addToast).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: 'Unable to connect for live updates' })
    );
  });

  test('Displays toast message when SSE connection is regained', () => {
    const eventHandler = vi.fn();
    const es = vi.fn(MockEventSource) as Mock<typeof EventSource>;

    vi.stubGlobal('EventSource', es);
    vi.mocked(addToast).mockReturnValue('toast-id');

    subscribe(['list-id'], eventHandler);
    es.mock.instances[0].onopen!(new Event('Mock connect event'));

    (es.mock.instances[0] as { readyState: number }).readyState = es.CONNECTING;
    es.mock.instances[0].onerror!(new Event('Mock disconnect event'));
    es.mock.instances[0].onopen!(new Event('Mock reconnect event'));

    expect(addToast).toHaveBeenCalledTimes(2);
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Reconnecting for live updates' })
    );
    expect(addToast).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: 'Reconnected' })
    );
  });

  test('Cleans up SSE connection when returned function called', () => {
    const eventHandler = vi.fn();
    const es = vi.fn(MockEventSource) as Mock<typeof EventSource>;

    vi.stubGlobal('EventSource', es);

    const cleanup = subscribe(['list-id'], eventHandler);

    es.mock.instances[0].close = vi.fn();
    es.mock.instances[0].onopen!(new Event('Mock connect event'));

    cleanup();

    // ESLint is warning about the `this` parameter being unbound on the close method,
    // not realizing that it isn't a function being called here
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(es.mock.instances[0].close).toHaveBeenCalledOnce();
    expect(addToast).not.toHaveBeenCalled();
  });
});
