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

import { BadGateway, Internal } from '../ServerError';

describe('Internal', () => {
  test('Returns a response with status 500 and provided headers and JSON-encoded body representing the message and content fields', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = Internal(message, content, headers);

    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 500 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = Internal(message);

    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = vi.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => Internal(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});

describe('BadGateway', () => {
  test('Returns a response with status 502 and provided headers and JSON-encoded body representing the message and content fields', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = BadGateway(message, content, headers);

    expect(response.status).toBe(502);
    expect(response.statusText).toBe('Bad Gateway');

    // Expect headers to include the provided header plus the default Content-Type
    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 502 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = BadGateway(message);

    expect(response.status).toBe(502);
    expect(response.statusText).toBe('Bad Gateway');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = vi.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => BadGateway(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});
