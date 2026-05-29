#!/usr/bin/env node
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

const SmeeClient = require('smee-client');

/**
 * Get a proxy URL from https://smee.io, and configure Github App to route
 * webhook traffic to that URL, then run this in a seperate terminal to
 * forward requests to local machine
 */
if (!process.argv[2]) {
  console.log('usage: ./proxy-webhooks.js [proxy-url]');
  process.exit(1);
}
const smee = new SmeeClient({
  source: process.argv[2],
  target: 'http://localhost:3000/api/webhook/github',
  logger: console
});

smee.start();
