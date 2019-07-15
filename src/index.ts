import { head } from 'fp-ts/lib/Array'
import {
    PGPoolError, PGClientError, PGTransactionError
} from './errors'
import {
    TaskEither, taskEither, tryCatch
} from 'fp-ts/lib/TaskEither'
import { Option } from 'fp-ts/lib/Option'
import { Sql, Query } from 'sql-ts'
import * as pg from 'pg'
import { isLeft } from 'fp-ts/lib/Either';

export const sql = new Sql('postgres')

export enum TransactionModes {
    isolation_level_serializable = "ISOLATION_LEVEL SERIALIZABLE",
    isolation_level_repeatable_read = "ISOLATION_LEVEL REPEATABLE READ",
    isolation_level_read_committed = "ISOLATION_LEVEL READ COMMITTED",
    isolation_level_read_uncommitted = "ISOLATION_LEVEL READ UNCOMMITTED",
    read_write = "READ WRITE",
    read_only = "READ ONLY",
    deferrable = "DEFERRABLE",
    not_deferrable = "NOT DEFERRABLE",
    none = ""
}

export interface QueryResult<T> extends pg.QueryResult {
    rows: T[];
}

export type BoundQuery = <T>(opts: Query<T>) => TaskEither<PGClientError, T[]>;

export interface TransactionWorker<T> {
    (query: BoundQuery): Promise<T>;
}

export function getClient(pool: pg.Pool): TaskEither<PGPoolError, pg.PoolClient> {
    return tryCatch(
        () => pool.connect(),
        (err: Error) => new PGPoolError(err),
    );
}

export function queryRaw(client: pg.PoolClient, opts: pg.QueryConfig): TaskEither<PGClientError, pg.QueryResult> {
    return tryCatch(
        () => client.query(opts),
        (err: Error) => new PGClientError(err),
    );
}

export function query<T>(client: pg.PoolClient, opts: Query<T>): TaskEither<PGClientError, T[]> {
    return tryCatch(
        () => client
            .query(opts.toQuery())
            .then((r) => r.rows),
        (err: Error) => new PGClientError(err),
    );
}

export function one<T>(qr: TaskEither<PGClientError, T[]>): TaskEither<PGClientError, Option<T>> {
    return taskEither.map(qr, head);
}

export default function wrapper(opts: pg.PoolConfig) {
    const pool = new pg.Pool(opts);

    const wrapper = {
        async query<T>(opts: Query<T>): Promise<T[]> {
            const client = await pool.connect();
            const results = await query(client, opts)();

            if (isLeft(results)) {
                const err = results.left;
                throw new PGClientError(err);
            }

            await client.release();
            return results.right;
        },

        async transaction<T>(
            worker: TransactionWorker<T>,
            mode: TransactionModes = TransactionModes.none,
        ): Promise<T> {
            const client = await pool.connect();
            const boundQuery: BoundQuery = (opts) => query(client, opts);

            let results: T;
            try {
                await client.query(`BEGIN TRANSACTION ${mode}`)

                results = await worker(boundQuery);
            } catch (err) {
                await client.query('ROLLBACK')
            } finally {
                await client.query('COMMIT')

                await client.release();
                return results;
            }
        },

        async withClient<T>(worker: TransactionWorker<T>): Promise<T> {
            const client = await pool.connect()
            const boundQuery: BoundQuery = (opts) => query(client, opts);

            let results: T;
            try {
                results = await worker(boundQuery)
            } finally {
                client.release()
                return results
            }
        },
    };

    const fp = {
        query<T>(opts: Query<T>): TaskEither<PGClientError, T[]> {
            return tryCatch(
                () => wrapper.query(opts),
                (err: PGClientError) => err,
            );
        },

        one<T>(opts: Query<T>): TaskEither<PGClientError, Option<T>> {
            return one(this.query(opts))
        },

        transaction<T>(
            worker: TransactionWorker<T>,
            mode: TransactionModes = TransactionModes.none
        ): TaskEither<PGTransactionError, T> {
            return tryCatch(
                () => wrapper.transaction(worker, mode),
                (err: Error) => new PGTransactionError(err),
            );
        },

        withClient<T>(
            worker: TransactionWorker<T>,
        ): TaskEither<PGTransactionError, T> {
            return tryCatch(
                () => wrapper.withClient(worker),
                (err: Error) => new PGTransactionError(err),
            );
        },
    };

    return {
        pool,
        fp,
        ...wrapper,
    };
}
