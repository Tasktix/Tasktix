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

import { OK, Created } from '../Success';

describe('OK', () => {
  test('Returns a response with status 200 and provided headers and JSON-encoded body representing the message and content fields', async () => {
    const message = 'Success message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = OK(message, content, headers);

    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 200 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Success message';

    const response = OK(message);

    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Success message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = vi.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => OK(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});

describe('Created', () => {
  test('Returns a response with status 201 and provided headers merged with Location header and JSON-encoded body representing the message and location as content', async () => {
    const message = 'Success message';
    const location = '/new/resource';
    const headers = { 'X-Custom': 'some header value' };

    const response = Created(message, location, headers);

    expect(response.status).toBe(201);
    expect(response.statusText).toBe('Created');

    // Headers should include custom header, Location, and Content-Type
    expect(Array.from(response.headers.keys())).toHaveLength(3);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Location')).toBe(location);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content: location });
  });

  test('Returns a response with status 201 and JSON-encoded body representing the message and location when headers are not provided', async () => {
    const message = 'Success message';
    const location = '/new/resource';

    const response = Created(message, location);

    expect(response.status).toBe(201);
    expect(response.statusText).toBe('Created');

    // With no extra headers, only Location and Content-Type should be present
    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('Location')).toBe(location);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content: location });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Success message';
    const location = '/new/resource';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = vi.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => Created(message, location)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});
