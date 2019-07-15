# seequel

This library requires SQL queries written using the excellent's fork of
[sql](sql) by [charsleysa](charsleysa) [sql-ts](sql-ts) and the help of
[fp-ts](https://github.com/gcanti/fp-ts) for more theorically strict types.

We are using a fork since the main library is currently unmaintained and it is
directly using Typescript providing us with good typed `Query<T>` object interfaces.

[sql]: https://github.com/brianc/node-sql/
[sql-ts]: https://github.com/charsleysa/node-sql-ts/
[charsleysa]: https://github.com/charsleysa/


## API

The default export is a function that accepts an `pg.PoolConfig` object, it will
return a set of wrapper functions, promise-based and it's strict counterpart:

- `query`
- `fp.query`
- `one`
- `fp.one`
- `withClient`
- `fp.withClient`
- `transaction`
- `fp.transaction`

and the pool object itself:

- `pool`

### Query

- `module#query`
  - signature: `query<T>(client: pg.PoolClient, opts: Query<T>): TaskEither<PGClientError, T[]>`
- `sql.query`
  - signature: `async query<T>(opts: Query<T>): Promise<T[]>`
- `sql.fp.query`
  - signature: `one<T>(opts: Query<T>): TaskEither<PGClientError, Option<T>>`

eg:

``` typescript
query(
    client,
    users
    .select()
    .where({
        email: "my@users.com",
    }),
); // => TaskEither<PGClientError, [{ id: 1, email: 'my@users.com' }]>
```

### One

- `module#one`
  - signature: `one<T>(client: pg.PoolClient, opts: Query<T>): TaskEither<PGClientError, Option<T>>`
- `sql.one`
  - signature: `async query<T>(opts: Query<T>): Promise<T>`
- `sql.fp.one`
  - signature: `one<T>(opts: Query<T>): TaskEither<PGClientError, Option<T>>`

It will return the first result or void.

``` typescript
one(
    client,
    users
    .select()
    .where({
        email: "my@users.com",
    }),
); // => TaskEither<PGClientError, { id: 1, email: 'my@users.com' }>
```

### withClient

- `sql.withClient`
  - signature: `async withClient<T>(worker: TransactionWorker<T>): Promise<T>`
- `sql.fp.withClient`
  - signature: `withClient<T>(worker: TransactionWorker<T>): TaskEither<PGClientError, T>`


``` typescript
withClient(
    async (query) => {
        await query(sqlQuery1);
        await query(sqlQuery2);
    },
); // => TaskEither<PGClientError, { id: 1, email: 'my@users.com' }>
```

### transaction

- `sql.transaction`
  - signature: `async transaction<T>(worker: TransactionWorker<T>, mode: TransactionModes = TransactionModes.none): Promise<T>`
- `sql.fp.transaction`
  - signature: `transaction<T>(worker: TransactionWorker<T>,mode: TransactionModes = TransactionModes.none): TaskEither<PGTransactionError, T>` 

``` typescript
transaction(
    async (query) => {
        await query(sqlQuery1);
        await query(sqlQuery2);
    },
); // => TaskEither<PGClientError, { id: 1, email: 'my@users.com' }>

```

# License

    Copyright 2019 Lorenzo Giuliani <lorenzo at giuliani dot me>

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
