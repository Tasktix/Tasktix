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

import { getOAuthConfig } from '../auth';

beforeEach(vi.unstubAllEnvs);

describe('getOAuthConfig', () => {
  test('Marks GitHub enabled if client ID and secret environment variables are set', () => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'github-id');
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'github-secret');

    const config = getOAuthConfig();

    expect(config).toMatchObject({
      githubEnabled: true
    });
  });

  test('Marks custom SSO enabled if provider ID and client ID environment variables are set', () => {
    vi.stubEnv('OAUTH_PROVIDER_ID', 'OAuth Provider');
    vi.stubEnv('OAUTH_CLIENT_ID', 'client-id');

    const config = getOAuthConfig();

    expect(config).toMatchObject({
      customEnabled: true,
      customProviderId: 'OAuth Provider'
    });
  });

  test('Marks GitHub disabled if client ID or secret environment variables are not set', () => {
    vi.stubEnv('GITHUB_CLIENT_ID', 'github-id');
    vi.stubEnv('GITHUB_CLIENT_SECRET', undefined); // TS requires 2 args - skipcq: JS-W1042

    let config = getOAuthConfig();

    expect(config).toMatchObject({
      githubEnabled: false
    });

    vi.stubEnv('GITHUB_CLIENT_ID', undefined); // TS requires 2 args - skipcq: JS-W1042
    vi.stubEnv('GITHUB_CLIENT_SECRET', 'github-secret');

    config = getOAuthConfig();

    expect(config).toMatchObject({
      githubEnabled: false
    });
  });

  test('Marks custom SSO enabled if provider ID or client ID environment variables are not set', () => {
    vi.stubEnv('OAUTH_PROVIDER_ID', 'OAuth Provider');
    vi.stubEnv('OAUTH_CLIENT_ID', undefined); // TS requires 2 args - skipcq: JS-W1042

    let config = getOAuthConfig();

    expect(config).toMatchObject({
      customEnabled: false
    });

    vi.stubEnv('OAUTH_PROVIDER_ID', undefined); // TS requires 2 args - skipcq: JS-W1042
    vi.stubEnv('OAUTH_CLIENT_ID', 'client-id');

    config = getOAuthConfig();

    expect(config).toMatchObject({
      customEnabled: false
    });
  });

  test('Properly parses custom SSO scopes environment variable', () => {
    vi.stubEnv('OAUTH_SCOPES', '["oauth", "password"]');
    vi.stubEnv('OAUTH_PROVIDER_ID', 'customProvider');
    vi.stubEnv('OAUTH_CLIENT_ID', 'customProvider');

    const config = getOAuthConfig();

    expect(config).toMatchObject({
      customProviderScope: ['oauth', 'password']
    });
  });

  test('Leaves custom SSO scopes undefined if no environment variable', () => {
    vi.stubEnv('OAUTH_SCOPES', undefined); // TS requires 2 args - skipcq: JS-W1042

    const config = getOAuthConfig();

    expect(config).not.toHaveProperty('customProviderScope');
  });

  test('Logs an error if custom SSO scopes environment variable is unparsable', () => {
    vi.stubEnv('OAUTH_SCOPES', 'oauth password');
    const consoleSpy = vi.spyOn(console, 'error');

    getOAuthConfig();

    expect(consoleSpy).toHaveBeenCalled();
  });
});
