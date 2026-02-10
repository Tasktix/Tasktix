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

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  ssr: {
    // Bundle these ESM-only deps so they can be required from CJS entrypoints in tests
    noExternal: ['html-encoding-sniffer', '@exodus/bytes']
  },
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: 'coverage',
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}'
      ],
      exclude: ['node_modules/', 'lib/database/*.ts']
    },
    globals: true,
    // Inline deps that ship ESM so Vitest transpiles them when running in CJS mode
    deps: { inline: ['html-encoding-sniffer', '@exodus/bytes'] }
  }
});
