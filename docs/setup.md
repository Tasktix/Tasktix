# Setup Guide

There are two main options for developing on Tasktix:

1. Develop locally, i.e. by cloning the repo normally, installing prerequisite software &
   dependencies, and running everything on your local machine
1. Use GitHub Codespaces to do all work (minus running end-to-end tests) in the browser,
   using GitHub's servers to run the dev server, database, etc.

## Developing Locally

### Prerequisites

You will need to install the following software before running Tasktix locally:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended) or
  [Docker Engine](https://docs.docker.com/engine/install/) (optional for Linux if not
  using Dev Containers)
- [Node.js v22](https://nodejs.org/en/download)

### Setup

Start by cloning the repository. If you're not a repository member, you'll want to fork
the repository on GitHub and clone the fork. Either way, you'll run commands like this:

```bash
git clone git@github.com:Tasktix/Tasktix.git
cd Tasktix
```

After this, you once again have two options for developing on Tasktix:

1. Using VS Code with Dev Containers to write your code inside the sandbox where the
   development server will run to allow you to test your changes. This avoids creating 2
   copies of `node_modules/` (one local for ESLint and IntelliSense to use; one in the
   sandbox for the dev server to use) and a bit of pain around running `prisma` commands
   that need access to the database container. The Dev Container also comes pre-configured
   with some extensions we think will make development easier, so it could be a bit
   quicker to get going with.

   The main downside to this option is that Cypress end-to-end tests cannot be run from
   within the Dev Container, so you'll still have to run this locally. It also exposes
   your Git credentials/signing key to the development server, but the sandbox the
   development server runs in should not be thought of as a security boundary anyway. It's
   really just a way to ensure the environment (e.g. system packages installed) is
   consistent between all developers.

1. Using your local system, copying code to the sandbox where the development server will
   run to allow you to test your changes. This copying happens automatically, so there is
   very little DX overhead to this option. The main advantage with this option is that
   it's easier to run Cypress end-to-end tests this way.

   The main downsides to this option are (a) that you'll have 2 full copies of
   `node_modules/` and (b) `prisma` commands that require a database connection will need
   to be prefixed with `docker compose exec web `.

If your host machine is not particularly powerful or is significantly RAM constrained,
GitHub Codespaces may allow you to work significantly faster than locally. However, many
modern machines are more powerful than the 2 vCPU Codespaces that come with a free quota.

Regardless of which option you pick, the development server where you can preview changes
will run in a Docker container that binds the server to your host machine's port `3000`.
Both options also spin up a MariaDB database container for the web server to use, which is
inaccessible from your host machine.

#### Dev Container

To develop from a Dev Container, you'll need to install Microsoft's
[Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
Then, open the Tasktix repo in VS Code and click the notification to reopen the project
in a Dev Container.

#### Local System

We recommend installing an ESLint plugin and spellchecking plugin in your preferred IDE to
catch simple errors as they're written. If you're using VS Code, you should be
automatically prompted to install our recommended extensions when first opening the
project.

If you're not planning to develop from a Dev Container, run the following command to
locally install dependencies for IntelliSense and ESLint to use:

```bash
npm install --ignore-scripts
```

And run this command to configure Prisma ORM with the appropriate database types:

```bash
npm run prisma:generate
```

Finally, copy [`.env.example`](./.env.example) to `.env` and update the default values to
match your environment. Sensitive values (e.g. secrets) should be stored in this file to
avoid exposure on GitHub.

## Developing through GitHub Codespaces

To use GitHub Codespaces:

1. Visit the Tasktix repository
1. Click the green "Code" button
1. Click the "Codespaces" tab
1. Click "Create codespace on main"
1. Wait for the Codespace to build

This should set up a fully-configured environment where you can write code, test changes,
and push your changes back to GitHub. However, you may need to create a signing key in the
Codespace to sign your commits before pushing them back to GitHub.

## Starting the Development Server

As you make changes to Tasktix, you'll likely need to preview them to ensure everything
works as expected. Next.js provides a development server for this purpose, which quickly
loads the page you're previewing without waiting to build the whole project. Any changes
you make to `.ts` or `.tsx` files will also be immediately reflected via Next.js' hot
reloading capability!

If you are using a Dev Container or GitHub Codespaces, the development server is already
running! Open a terminal in VS Code, click the "Ports" tab, and click the globe icon that
shows up when hovering over the "Forwarded Address".

If you are running locally, a bit more work is needed to preview your changes. You can
spin up a webserver and database via:

```bash
npm start
```

You'll also need to apply database changes to ensure it's up to date:

```bash
docker compose exec web npm run prisma:apply
```

After your webserver is started and your database is up to date, you can view the project
by visiting [127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

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
