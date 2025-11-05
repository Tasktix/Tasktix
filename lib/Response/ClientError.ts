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

export function BadRequest(
  message: string,
  content?: string,
  headers?: HeadersInit
): Response {
  return Response.json(
    { message, content },
    { status: 400, statusText: 'Bad Request', headers }
  );
}

export function Unauthenticated(
  message: string,
  content?: string,
  headers?: HeadersInit
): Response {
  return Response.json(
    { message, content },
    { status: 401, statusText: 'Unauthorized', headers }
  );
}

export function Forbidden(
  message: string,
  content?: string,
  headers?: HeadersInit
): Response {
  return Response.json(
    { message, content },
    { status: 403, statusText: 'Forbidden', headers }
  );
}

export function NotFound(
  message: string,
  content?: string,
  headers?: HeadersInit
): Response {
  return Response.json(
    { message, content },
    { status: 404, statusText: 'Not Found', headers }
  );
}

export function Conflict(
  message: string,
  content?: string,
  headers?: HeadersInit
): Response {
  return Response.json(
    { message, content },
    { status: 409, statusText: 'Conflict', headers }
  );
}

export function Gone(
  message: string,
  content?: string,
  headers?: HeadersInit
): Response {
  return Response.json(
    { message, content },
    { status: 410, statusText: 'Gone', headers }
  );
}

export function PayloadTooLarge(
  message: string,
  content?: string,
  headers?: HeadersInit
): Response {
  return Response.json(
    { message, content },
    { status: 413, statusText: 'Payload Too Large', headers }
  );
}
