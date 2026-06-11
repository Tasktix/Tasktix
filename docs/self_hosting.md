# Self Hosting

## Docker Compose

To quickly start the project with Docker Compose, copy this `compose.yaml` and run
`DB_DATABASE=your_db_name DB_PASSWORD=<your-password-here> docker compose up -d`. You'll
also want to run
`docker run --rm --network tasktix --env "DATABASE_URL=<your-database-url>" ghcr.io/tasktix/tasktix-deploy:latest`
to set up your database schema.

> [!WARNING]
> This is a **very minimal** configuration needed to start up Tasktix and test it out. It
> **is not** recommended for production deployment for a number reasons, including the
> ephemeral database that could result in **complete data loss**. For a more stable
> deployment, we strongly recommend using Podman Quadlets as described below or expanding
> this Compose file if you prefer using Docker.

```yaml
name: tasktix

services:
  web:
    image: ghcr.io/tasktix/tasktix-web
    ports:
      - 3000:3000
    environment:
      - DATABASE_URL=mysql://root:${DB_PASSWORD}@mariadb/${DB_DATABASE}

  mariadb:
    image: mariadb:latest
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
```

## Podman Quadlets

To start Tasktix more robustly as `systemd` services, you'll need to create a number of
definition files in your Quadlet configuration directory, `{base}`. For example, for
rootless deployments on Fedora CoreOS, `{base}` is `~/.config/containers/systemd`. The
file paths below are all relative to this directory.

> [!NOTE]
> All secrets should be stored using Podman secrets. For example,
> `TASKTIX_BETTER_AUTH_SECRET` can be generated and stored using:
>
> ```sh
> openssl rand -base64 32 | podman secret create TASKTIX_BETTER_AUTH_SECRET -
> ```

### Configuration Files

#### `tasktix.pod`
```ini
[Pod]
PodName=tasktix
PublishPort=<HOST_BINDING>:3000

[Install]
WantedBy=default.target
```
- `<HOST_BINDING>` (including the `<>`) should be replaced with the network binding on
  your local machine. For example, if you publish with a reverse proxy and have port
  3000 open, this could be `127.0.0.1:3000` to bind to your loopback address on port 3000.

#### `tasktix-db.volume`
```ini
[Volume]
```

#### `tasktix-db.container`
```ini
[Container]
Pod=tasktix.pod
Image=docker.io/library/mariadb:latest
Volume=tasktix-db.volume:/var/lib/mysql

Environment=MARIADB_USER=tasktix
Environment=MARIADB_DATABASE=tasktix
Environment=MARIADB_PASSWORD_FILE=/run/secrets/db_password
Environment=MARIADB_ROOT_PASSWORD_FILE=/run/secrets/db_root_password

Secret=TASKTIX_DB_PASSWORD,type=mount,target=/run/secrets/db_password
Secret=TASKTIX_DB_ROOT_PASSWORD,type=mount,target=/run/secrets/db_root_password

[Service]
Restart=always
```
- `TASKTIX_DB_PASSWORD` and `TASKTIX_DB_ROOT_PASSWORD` should be long, secure passwords
  that follow good password hygiene practices.

#### `tasktix-web.container`
```ini
[Container]
Pod=tasktix.pod
Image=ghcr.io/tasktix/tasktix-web

Environment=BETTER_AUTH_URL=<PATH_TO_TASKTIX_ROOT>

Secret=TASKTIX_DATABASE_URL,type=env,target=DATABASE_URL
Secret=TASKTIX_BETTER_AUTH_SECRET,type=env,target=BETTER_AUTH_SECRET

[Service]
Restart=unless-stopped
```
- `<PATH_TO_TASKTIX_ROOT>` (including the `<>`) should be replaced with the URL to the
  root of your Tasktix deployment. For example, if you deploy to
  `https://tasktix.example.com`, that should be the specified path. If you deploy to
  `https://containers.example.com/tasktix`, that should be the specified path.
- `TASKTIX_BETTER_AUTH_SECRET` should be securely generated, e.g. with
  `openssl rand -base64 32`.
- `TASKTIX_DATABASE_URL` needs to be a valid embedded credentials URL in the form
  `mysql://tasktix:<TASKTIX_DB_PASSWORD>@tasktix/tasktix`, where `<TASKTIX_DB_PASSWORD>`
  (including the `<>`) is replaced with value you set for the Podman secret with the same
  name.

### Initial Startup

After creating these files with your desired configuration and loading the corresponding
Podman secrets, run these commands to start the server:

```sh
systemctl --user daemon-reload
systemctl --user start tasktix-pod
```

You'll also need to run the following command to set up your database:
```sh
podman run --rm --detach --pod tasktix --secret "TASKTIX_DATABASE_URL,type=env,target=DATABASE_URL" ghcr.io/tasktix/tasktix-deploy:latest
```

### Configuration

As the administrator for your Tasktix instance, you can customize some of Tasktix's
behavior to better align with your (or your organization's) needs.

#### Authentication Customization

To customize how Tasktix handles authentication, you can adjust `tasktix-web.container`.
After changing the file, you will need to run these commands to apply the changes:

```sh
systemctl --user daemon-reload
systemctl --user restart tasktix-web
```

- To disable local username/password authentication:
  ```ini
  Environment=DISABLE_LOCAL_AUTH=true
  ```

- To allow passwords that've shown up in prior data breaches:
  ```ini
  Environment=DISABLE_PASSWORD_STRENGTH_CHECK=true
  ```
  This is **strongly discouraged** because it is very easy for hackers to compromise these
  accounts.

- To enable GitHub SSO authentication:
  ```ini
  Environment=GITHUB_CLIENT_ID=<YOUR_CLIENT_ID>
  Secret=TASKTIX_GITHUB_SECRET,type=env,target=GITHUB_CLIENT_SECRET
  ```
  See [`docs/auth.md`](./auth.md) for more details on setting `GITHUB_CLIENT_ID` and
  `TASKTIX_GITHUB_SECRET`.

- To enable OIDC authentication:
  ```ini
  Environment=OAUTH_PROVIDER_ID=<YOUR_PROVIDER_NAME>
  Environment=OAUTH_DISCOVERY_URL=<YOUR_PROVIDER_DISCOVERY_URL>
  Environment=OAUTH_CLIENT_ID=<YOUR_CLIENT_ID>
  Secret=TASKTIX_OAUTH_SECRET,type=env,target=OAUTH_CLIENT_SECRET
  ```
  `<YOUR_PROVIDER_NAME>` is the name that users will see for this sign-in option. If your
  provider does not support discovery URLs, you can instead provide
  `OAUTH_AUTHORIZATION_URL`, `OAUTH_TOKEN_URL`, and `OAUTH_USERINFO_URL` environment
  variables.

#### List Member Roles

You may want to add additional roles beyond the Admin role to limit list members'
permissions. All role customization must be done directly in the database. To access the
database's SQL interface, you can run:

```sh
podman exec -it tasktix-db mariadb tasktix -utasktix -p
```

Then, enter the non-root password that you created when you set up Tasktix.

Some sensible defaults might look like this:
```sql
INSERT INTO `MemberRole` (
  `id`,
  `name`,
  `description`,
  `canAddItems`,
  `canUpdateItems`,
  `canDeleteItems`,
  `canManageTags`,
  `canManageAssignees`,
  `canManageMembers`,
  `canUpdateList`,
  `canDeleteList`
) VALUES (
  'Ok2GO5KJcAXOjnnT',
  'Manager',
  'Manage tags, tasks, and members; cannot delete list',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE
), (
  'V4A5fgB4Yui8et75',
  'Product Owner',
  'Manage tags and tasks, including assigning tasks',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE,
  FALSE
), (
  'y9Be3uYVU9JLtUYm',
  'Collaborator',
  'Add and update tasks, excluding assigning tasks',
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE
), (
  'YbkaiSyYGyQDWzt7',
  'Stakeholder',
  'Viewer permissions and add tasks',
  TRUE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE
), (
  'EVCEq6rSFUDa0uGt',
  'Viewer',
  'Can only view current status',
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  FALSE
);
```

### Updates

To update Tasktix to a newer version, we recommend first stopping the webserver so clients
don't make changes
mid-migration:

```sh
systemctl --user stop tasktix-web
```

Then, pull the latest version of the `tasktix-web` and `tasktix-deploy` containers:
```sh
podman pull ghcr.io/tasktix-web:latest
podman pull ghcr.io/tasktix-deploy:latest
```

Next, run the `tasktix-deploy` container to update your database's configuration:
```sh
podman run --rm -d --pod tasktix --secret "TASKTIX_DATABASE_URL,type=env,target=DATABASE_URL" ghcr.io/tasktix/tasktix-deploy:latest
```

Finally, start the webserver again:
```sh
systemctl --user start tasktix-web
```
