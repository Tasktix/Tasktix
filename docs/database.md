# Database

## Database Schema

To view an interactive schema for Tasktix' database, visit
[dbdiagrams.io](https://dbdiagram.io/d/Tasktix-691fa53e228c5bbc1ad3060f).

## Prisma ORM

When first setting up this project, you'll need to run `npm run prisma:generate` to create
the ORM types and functions from the database schema.

If you are using devcontainers, when pulling changes that include database migrations,
you'll need to run `npm run prisma:apply` to update your database with the new migrations.

> [!NOTE]
> You should not use `npm run prisma:apply` to update a production database. Instead, run
> `npm run prisma:deploy`.

> [!TIP]
> If you are not using devcontainers, you'll need to run Prisma commands that modify the
> database from the `web` container's context - the database isn't exposed to your
> `localhost` network. To do this, run `npm start`, then in a separate terminal, prefix
> your Prisma command with `docker compose exec web`. For example, `npm run prisma:reset`
> would become `docker compose exec web npm run prisma:reset`.
>
> Commands that require this are:
>
> - `prisma:apply`
>   - Can be skipped if you just ran `npm start` since it is internally run by `npm start`
> - `prisma:reset`
> - `prisma:seed`

## Database Changes

Database changes are handled by creating migrations in Prisma. To create a new migration
and apply it to your environment:

1. Either
   1. Update the [Prisma schema](../prisma/schema.prisma) with your changes, or
   1. Directly modify the database using SQL commands (e.g. `CREATE TABLE`, `ALTER TABLE`,
      etc.), then run `npm run prisma:introspect` to update the Prisma schema with the
      database changes
1. Run `npm run prisma:migrate`. This will create a new SQL migration file in the
   [migrations directory](../prisma/migrations/) to apply the changes

> [!WARNING]
> If you are not using devcontainers, be **very careful** about running `npm start` in the
> middle of developing a new migration. The Docker Compose environment used by `npm start`
> will automatically apply any new migrations in
> [`prisma/migrations`](/prisma/migrations/). This could lead to unexpected database
> changes if you're still partway through editing a migration.

3. Validate the generated SQL matches expected behavior

   - Renames may be implemented as `DROP` and `CREATE` statements by default. These should
     be edited by hand to avoid data loss when the migration is applied to the production
     database
   - Some database features
     [may not be supported](https://www.prisma.io/docs/orm/prisma-migrate/workflows/unsupported-database-features)
     by Prisma and will need to be implemented manually

1. If you started by editing the Prisma schema instead of the database directly, run
   `npm run prisma:apply` to apply the new migration to your database

## Database Interaction During Tests

End-to-end tests require a running web server, which relies on also having a database
server running. To avoid flaky tests, the tests need to control the database's state at
the start of each test. In the [default testing infrastructure](/compose.test.yaml), this
access is provided by the `test` container. Tests will run:

- `npm run prisma:reset` to fully clear the database and restore its schema to the most
  recent migration's result
- `npm run prisma:seed` to add seed data via [the seed script](/prisma/seed.ts)
