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

export interface ServerResponse {
  code: number;
  message: string;
  content: string | undefined;
}

export default {
  // TS requires `this: void` to allow referencing `api.get` in tests without binding `this`.
  // DeepSource is unfamiliar with this use of `void` in a type signature - skipcq: JS-0333
  get(this: void, resource: string) {
    return request(resource, 'GET');
  },

  post(
    // TS requires `this: void` to allow referencing `api.post` in tests without binding `this`.
    // DeepSource is unfamiliar with this use of `void` in a type signature - skipcq: JS-0333
    this: void,
    resource: string,
    data: string | object,
    encodingType?: string
  ) {
    return request(resource, 'POST', data, encodingType);
  },

  put(
    // TS requires `this: void` to allow referencing `api.put` in tests without binding `this`.
    // DeepSource is unfamiliar with this use of `void` in a type signature - skipcq: JS-0333
    this: void,
    resource: string,
    data: object,
    encodingType = 'application/json'
  ) {
    return request(resource, 'PUT', data, encodingType);
  },

  patch(
    // TS requires `this: void` to allow referencing `api.patch` in tests without binding `this`.
    // DeepSource is unfamiliar with this use of `void` in a type signature - skipcq: JS-0333
    this: void,
    resource: string,
    data: object,
    encodingType = 'application/json'
  ) {
    return request(resource, 'PATCH', data, encodingType);
  },

  // TS requires `this: void` to allow referencing `api.delete` in tests without binding `this`.
  // DeepSource is unfamiliar with this use of `void` in a type signature - skipcq: JS-0333
  delete(this: void, resource: string) {
    return request(resource, 'DELETE');
  }
} as const;

async function request(
  resource: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: string | object,
  encodingType?: string
): Promise<ServerResponse> {
  let body: string | undefined;

  if (typeof data === 'string') {
    encodingType ??= 'text/plain';
    body = data;
  } else if (data !== undefined) {
    if (!encodingType) encodingType = 'application/json';

    if (encodingType === 'application/json') body = JSON.stringify(data);
    else
      throw new Error(`Unknown encoding ${encodingType} for object parameter`);
  }

  const options: RequestInit = {
    method,
    body
  };

  if (encodingType) options.headers = { 'Content-Type': encodingType };

  const result = await fetch(`/api${resource}`, options);
  const parsedResult = await result.json();

  const serverResponse: ServerResponse = {
    code: result.status,
    message: parsedResult.message,
    content: parsedResult.content
  };

  if (serverResponse.code === 401) window.location.href = '/signIn';
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (serverResponse.code >= 400) throw serverResponse;

  return serverResponse;
}
