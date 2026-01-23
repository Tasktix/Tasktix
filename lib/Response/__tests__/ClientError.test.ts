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
  BadRequest,
  Conflict,
  Forbidden,
  Gone,
  NotFound,
  PayloadTooLarge,
  Unauthenticated
} from '../ClientError';

describe('BadRequest', () => {
  test('Returns a response with status 400 and provided headers and JSON-encoded body representing the message and content fields', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = BadRequest(message, content, headers);

    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 400 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = BadRequest(message);

    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = jest.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => BadRequest(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});

describe('Unauthenticated', () => {
  test('Returns a response with status 401 and provided message, content, and headers', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = Unauthenticated(message, content, headers);

    expect(response.status).toBe(401);
    expect(response.statusText).toBe('Unauthorized');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 401 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = Unauthenticated(message);

    expect(response.status).toBe(401);
    expect(response.statusText).toBe('Unauthorized');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = jest.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => Unauthenticated(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});

describe('Forbidden', () => {
  test('Returns a response with status 403 and provided message, content, and headers', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = Forbidden(message, content, headers);

    expect(response.status).toBe(403);
    expect(response.statusText).toBe('Forbidden');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 403 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = Forbidden(message);

    expect(response.status).toBe(403);
    expect(response.statusText).toBe('Forbidden');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = jest.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => Forbidden(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});

describe('NotFound', () => {
  test('Returns a response with status 404 and provided message, content, and headers', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = NotFound(message, content, headers);

    expect(response.status).toBe(404);
    expect(response.statusText).toBe('Not Found');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 404 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = NotFound(message);

    expect(response.status).toBe(404);
    expect(response.statusText).toBe('Not Found');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = jest.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => NotFound(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});

describe('Conflict', () => {
  test('Returns a response with status 409 and provided message, content, and headers', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = Conflict(message, content, headers);

    expect(response.status).toBe(409);
    expect(response.statusText).toBe('Conflict');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 409 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = Conflict(message);

    expect(response.status).toBe(409);
    expect(response.statusText).toBe('Conflict');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = jest.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => Conflict(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});

describe('Gone', () => {
  test('Returns a response with status 410 and provided message, content, and headers', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = Gone(message, content, headers);

    expect(response.status).toBe(410);
    expect(response.statusText).toBe('Gone');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 410 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = Gone(message);

    expect(response.status).toBe(410);
    expect(response.statusText).toBe('Gone');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = jest.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => Gone(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});

describe('PayloadTooLarge', () => {
  test('Returns a response with status 413 and provided message, content, and headers', async () => {
    const message = 'Error message';
    const content = 'Extra details';
    const headers = { 'X-Custom': 'some header value' };

    const response = PayloadTooLarge(message, content, headers);

    expect(response.status).toBe(413);
    expect(response.statusText).toBe('Payload Too Large');

    expect(Array.from(response.headers.keys())).toHaveLength(2);
    expect(response.headers.get('X-Custom')).toBe(headers['X-Custom']);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message, content });
  });

  test('Returns a response with status 413 and JSON-encoded body representing just the message when content and headers are not provided', async () => {
    const message = 'Error message';

    const response = PayloadTooLarge(message);

    expect(response.status).toBe(413);
    expect(response.statusText).toBe('Payload Too Large');

    expect(Array.from(response.headers.keys())).toHaveLength(1);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(await response.json()).toEqual({ message });
  });

  test('Throws an error when Response.json() fails', () => {
    const message = 'Error message';

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalJson = Response.json;

    Response.json = jest.fn(() => {
      throw new Error('Stringification failed');
    });

    expect(() => PayloadTooLarge(message)).toThrow('Stringification failed');

    Response.json = originalJson;
  });
});
