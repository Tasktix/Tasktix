# Setup Guide

## Prerequisites

You will need to install the following software before running Tasktix locally:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended) or
  [Docker Engine](https://docs.docker.com/engine/install/) (optional for Linux if not
  using Dev Containers)
- [Node.js v22](https://nodejs.org/en/download)

## Setup

Start by cloning the repository. If you're not a repository member, you'll want to fork
the repository on GitHub and clone the fork. Either way, you'll run commands like this:

```bash
git clone git@github.com:Tasktix/Tasktix.git
cd Tasktix
```

We recommend installing an ESLint plugin and spellchecking plugin in your preferred IDE to
catch simple errors as they're written. If you're using VS Code, you should be
automatically prompted to install our recommended extensions when first opening the
project.

If you're not planning to develop from a Dev Container, run the following command to
locally install dependencies for IntelliSense and ESLint to use:

```bash
npm install --ignore-scripts
```

Finally, copy [`.env.example`](./.env.example) to `.env` and update the default values to
match your environment. Sensitive values (e.g. secrets) should be stored in this file to
avoid exposure on GitHub.

## Starting the Development Server

To preview your changes, you can spin up a webserver and database via:

```bash
npm start
```

You'll also need to pull database changes. If you're not using devcontainers, you'll need
to `exec` into your Next.js web server to run the commands necessary to update the
database:

```bash
docker compose exec web npm run prisma:apply
```

You'll need to do the same to run any other `prisma:*` commands.

After your webserver is started and your database is up to date, you can view the project
by visiting [127.0.0.1:3000](http://127.0.0.1:3000) in your browser. Any changes you make
to `.ts` or `.tsx` files will be immediately reflected via Next.js' hot reloading
capability.

## Stopping the Development Server

If the server is running as a foregrounded terminal process, pressing <kbd>Ctrl</kbd> +
<kbd>C</kbd> should be sufficient to stop the server. You could also run:

```bash
npm stop
```

To delete the development environment's containers, run:

```bash
npm run teardown
```
