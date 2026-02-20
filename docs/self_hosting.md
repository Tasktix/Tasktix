# Docker Compose

To quickly start the project with Docker Compose, copy this `compose.yaml` and run
`DB_DATABASE=your_db_name DB_PASSWORD=<your-password-here> docker compose up -d`. You'll
also want to run `docker run --rm --network tasktix --env "DATABASE_URL=<your-database-url>" ghcr.io/tasktix/tasktix-deploy:latest` to set up your database schema.

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
    volumes:
      - /path/on/your/host:/var/lib/mysql
```

# Podman Quadlets

To start Tasktix more robustly as `systemd` services, you'll need to create files like
these:

.config/containers/systemd/tasktix/tasktix-web.container

```ini
[Container]
Pod=tasktix.pod
Image=ghcr.io/tasktix/tasktix-web

Environment=BETTER_AUTH_URL=https://tasktix.com

Secret=TASKTIX_DATABASE_URL,type=env,target=DATABASE_URL
Secret=TASKTIX_BETTER_AUTH_SECRET,type=env,target=BETTER_AUTH_SECRET

[Service]
Restart=unless-stopped
```

.config/containers/systemd/tasktix-db.container

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

.config/containers/systemd/tasktix-db.volume

```ini
[Volume]
```

.config/containers/systemd/tasktix.pod

```ini
[Pod]
PodName=tasktix
PublishPort=127.0.0.1:3000:3000

[Install]
WantedBy=default.target
```

Then run these commands to securely load your secrets into `podman` and start the server:

```console
foo@bar:~$ read
<your-password-here>
foo@bar:~$ echo "$REPLY" | podman secret create TASKTIX_DB_PASSWORD -
foo@bar:~$ read
mysql://tasktix:<your-password-here>@tasktix/tasktix
foo@bar:~$ echo "$REPLY" | podman secret create TASKTIX_DATABASE_URL -
foo@bar:~$ read
<your-root-password-here>
foo@bar:~$ echo "$REPLY" | podman secret create TASKTIX_DB_PASSWORD -
foo@bar:~$ unset $REPLY
foo@bar:~$ openssl rand -base64 32 | podman secret create TASKTIX_BETTER_AUTH_SECRET -
foo@bar:~$ systemctl --user daemon-reload
foo@bar:~$ systemctl --user start tasktix-pod
foo@bar:~$ podman run --rm --pod tasktix --secret "TASKTIX_DATABASE_URL,type=env,target=DATABASE_URL" ghcr.io/tasktix/tasktix-deploy:latest
```
