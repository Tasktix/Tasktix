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
 *
 * @vitest-environment jsdom
 */

import api from '../api'; // Adjust the import path as needed

function createFetchResponse(
  status: number,
  message: string,
  content: unknown
): Response {
  return {
    status,
    json: vi.fn().mockResolvedValue({ message, content })
  } as never;
}

beforeEach(() => {
  if (!globalThis.fetch) {
    globalThis.fetch = vi.fn();
  }
  vi.spyOn(globalThis, 'fetch').mockClear();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('get', () => {
  test('Makes request to the provided API route, prepended with "/api"', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.get('/resource');

    expect(vi.mocked(globalThis.fetch).mock.calls[0][0]).toBe('/api/resource');
  });

  test('Makes an HTTP GET request with no body', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.get('/resource');

    expect(vi.mocked(globalThis.fetch).mock.calls[0][1]).toMatchObject({
      method: 'GET',
      body: undefined
    });
  });

  test('Parses the JSON-encoded server response', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    const response = await api.get('/resource');

    expect(response).toEqual({
      code: 200,
      message: 'OK',
      content: 'data'
    });
  });

  test('Rejects the promise if fetch fails', async () => {
    const error = new Error('Exception message');

    vi.mocked(globalThis.fetch).mockRejectedValue(error);

    await expect(api.get('/resource')).rejects.toThrow('Exception message');
  });

  // Test broken by JSDom upgrade for latest Vitest version: https://github.com/jsdom/jsdom/issues/3492
  test.skip('Redirects to /signIn when response code is 403 and reject with server response', async () => {
    const fakeResponse = createFetchResponse(403, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.get('/resource')).rejects.toEqual({
      code: 403,
      message: 'Server error message',
      content: null
    });

    expect(window.location.href).toBe('/signIn');
  });

  test('Rejects for error responses with HTTP status codes >= 400 (other than 403)', async () => {
    const fakeResponse = createFetchResponse(500, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.get('/resource')).rejects.toEqual({
      code: 500,
      message: 'Server error message',
      content: null
    });
  });
});

describe('post', () => {
  test('Makes request to the provided API route, prepended with "/api"', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.post('/resource', {});

    expect(vi.mocked(globalThis.fetch).mock.calls[0][0]).toBe('/api/resource');
  });

  test('Makes an HTTP POST request with JSON-encoded body by default when `data` is an object', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.post('/resource', { key: 'value' });

    expect(vi.mocked(globalThis.fetch).mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"key":"value"}'
    });
  });

  test('Throws an unknown encoding error when `data` is an object and `encodingType` is not JSON', async () => {
    const data = { key: 'value' };

    await expect(api.post('/resource', data, 'text/plain')).rejects.toThrow(
      'Unknown encoding text/plain for object parameter'
    );
  });

  test('Makes an HTTP POST request with plaintext body by default when `data` is a string', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.post('/resource', 'data here');

    expect(vi.mocked(globalThis.fetch).mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'data here'
    });
  });

  test('Makes an HTTP POST request with custom encoding type when when `data` is a string and an encoding is specified', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.post('/resource', 'data here', 'text/somethingCustom');

    expect(vi.mocked(globalThis.fetch).mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'text/somethingCustom' },
      body: 'data here'
    });
  });

  test('Parses the server response as JSON', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'postData');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);
    const data = { key: 'value' };

    const response = await api.post('/resource', data);

    expect(response).toEqual({
      code: 200,
      message: 'OK',
      content: 'postData'
    });
  });

  test('Rejects the promise if fetch fails', async () => {
    const error = new Error('Exception message');

    vi.mocked(globalThis.fetch).mockRejectedValue(error);

    await expect(api.post('/resource', {})).rejects.toThrow(
      'Exception message'
    );
  });

  test.skip('Redirects to /signIn when response code is 403 and reject with server response', async () => {
    const fakeResponse = createFetchResponse(403, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.post('/resource', {})).rejects.toEqual({
      code: 403,
      message: 'Server error message',
      content: null
    });

    expect(window.location.href).toBe('/signIn');
  });

  test('Rejects for error responses with HTTP status codes >= 400 (other than 403)', async () => {
    const fakeResponse = createFetchResponse(500, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.post('/resource', {})).rejects.toEqual({
      code: 500,
      message: 'Server error message',
      content: null
    });
  });
});

describe('put', () => {
  it('should send a PUT request with JSON stringified data and resolve with server response', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'putData');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);
    const data = { key: 'value' };

    const response = await api.put('/resource', data);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/resource', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response).toEqual({
      code: 200,
      message: 'OK',
      content: 'putData'
    });
  });

  test('Makes request to the provided API route, prepended with "/api"', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.put('/resource', {});

    expect(vi.mocked(globalThis.fetch).mock.calls[0][0]).toBe('/api/resource');
  });

  test('Makes an HTTP PUT request with JSON-encoded body by default', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.put('/resource', { key: 'value' });

    expect(vi.mocked(globalThis.fetch).mock.calls[0][1]).toMatchObject({
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: '{"key":"value"}'
    });
  });

  test('Throws an unknown encoding error when encodingType is not JSON', async () => {
    const data = { key: 'value' };

    await expect(api.put('/resource', data, 'text/plain')).rejects.toThrow(
      'Unknown encoding text/plain for object parameter'
    );
  });

  test('Parses the server response as JSON', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'postData');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);
    const data = { key: 'value' };

    const response = await api.put('/resource', data);

    expect(response).toEqual({
      code: 200,
      message: 'OK',
      content: 'postData'
    });
  });

  test('Rejects the promise if fetch fails', async () => {
    const error = new Error('Exception message');

    vi.mocked(globalThis.fetch).mockRejectedValue(error);

    await expect(api.put('/resource', {})).rejects.toThrow('Exception message');
  });

  test.skip('Redirects to /signIn when response code is 403 and reject with server response', async () => {
    const fakeResponse = createFetchResponse(403, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.put('/resource', {})).rejects.toEqual({
      code: 403,
      message: 'Server error message',
      content: null
    });

    expect(window.location.href).toBe('/signIn');
  });

  test('Rejects for error responses with HTTP status codes >= 400 (other than 403)', async () => {
    const fakeResponse = createFetchResponse(500, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.put('/resource', {})).rejects.toEqual({
      code: 500,
      message: 'Server error message',
      content: null
    });
  });
});

describe('patch', () => {
  it('should send a PATCH request with JSON stringified data and resolve with server response', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'patchData');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);
    const data = { key: 'value' };

    const response = await api.patch('/resource', data);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/resource', {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    expect(response).toEqual({
      code: 200,
      message: 'OK',
      content: 'patchData'
    });
  });

  test('Makes request to the provided API route, prepended with "/api"', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.patch('/resource', {});

    expect(vi.mocked(globalThis.fetch).mock.calls[0][0]).toBe('/api/resource');
  });

  test('Makes an HTTP PATCH request with JSON-encoded body by default', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.patch('/resource', { key: 'value' });

    expect(vi.mocked(globalThis.fetch).mock.calls[0][1]).toMatchObject({
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{"key":"value"}'
    });
  });

  test('Throws an unknown encoding error when encodingType is not JSON', async () => {
    const data = { key: 'value' };

    await expect(api.patch('/resource', data, 'text/plain')).rejects.toThrow(
      'Unknown encoding text/plain for object parameter'
    );
  });

  test('Parses the server response as JSON', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'patchData');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);
    const data = { key: 'value' };

    const response = await api.patch('/resource', data);

    expect(response).toEqual({
      code: 200,
      message: 'OK',
      content: 'patchData'
    });
  });

  test('Rejects the promise if fetch fails', async () => {
    const error = new Error('Exception message');

    vi.mocked(globalThis.fetch).mockRejectedValue(error);

    await expect(api.patch('/resource', {})).rejects.toThrow(
      'Exception message'
    );
  });

  test.skip('Redirects to /signIn when response code is 403 and reject with server response', async () => {
    const fakeResponse = createFetchResponse(403, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.patch('/resource', {})).rejects.toEqual({
      code: 403,
      message: 'Server error message',
      content: null
    });

    expect(window.location.href).toBe('/signIn');
  });

  test('Rejects for error responses with HTTP status codes >= 400 (other than 403)', async () => {
    const fakeResponse = createFetchResponse(500, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.patch('/resource', {})).rejects.toEqual({
      code: 500,
      message: 'Server error message',
      content: null
    });
  });
});

describe('delete', () => {
  test('Makes request to the provided API route, prepended with "/api"', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.delete('/resource');

    expect(vi.mocked(globalThis.fetch).mock.calls[0][0]).toBe('/api/resource');
  });

  test('Makes an HTTP GET request with no body', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await api.delete('/resource');

    expect(vi.mocked(globalThis.fetch).mock.calls[0][1]).toMatchObject({
      method: 'DELETE',
      body: undefined
    });
  });

  test('Parses the JSON-encoded server response', async () => {
    const fakeResponse = createFetchResponse(200, 'OK', 'data');

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    const response = await api.delete('/resource');

    expect(response).toEqual({
      code: 200,
      message: 'OK',
      content: 'data'
    });
  });

  test('Rejects the promise if fetch fails', async () => {
    const error = new Error('Exception message');

    vi.mocked(globalThis.fetch).mockRejectedValue(error);

    await expect(api.delete('/resource')).rejects.toThrow('Exception message');
  });

  test.skip('Redirects to /signIn when response code is 403 and reject with server response', async () => {
    const fakeResponse = createFetchResponse(403, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.delete('/resource')).rejects.toEqual({
      code: 403,
      message: 'Server error message',
      content: null
    });

    expect(window.location.href).toBe('/signIn');
  });

  test('Rejects for error responses with HTTP status codes >= 400 (other than 403)', async () => {
    const fakeResponse = createFetchResponse(500, 'Server error message', null);

    vi.mocked(globalThis.fetch).mockResolvedValue(fakeResponse);

    await expect(api.delete('/resource')).rejects.toEqual({
      code: 500,
      message: 'Server error message',
      content: null
    });
  });
});
