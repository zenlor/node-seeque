/**
 * This test harness requires a Postgres database.
 */

const env = (name, fallback = null) => process.env[name] || fallback;
const ducktape = require('@frenz/ducktape')
const pg = require('pg')
const pool = new pg.Pool({
    port: env('DATABASE_PORT', 5432),
    host: env('DATABASE_HOST', 'localhost'),
    database: env('DATABASE_NAME', 'seequel'),
    username: env('DATABASE_USERNAME', 'root'),
    password: env('DATABASE_PASSWORD'),
})

const { sql, query } = require('..')

ducktape('seequel#query', (t) => {
    sql.
})
