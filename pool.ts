import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  // A truly unexpected error on an idle client - log and let the process
  // supervisor (pm2, k8s, etc.) decide whether to restart.
  console.error('Unexpected error on idle Postgres client', err);
});
