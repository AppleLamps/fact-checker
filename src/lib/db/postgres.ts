import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __factCheckerPostgresPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __factCheckerSchemaReady: Promise<void> | undefined;
}

function createPool() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  return new Pool({
    connectionString: DATABASE_URL,
    ssl:
      DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1")
        ? false
        : {
            rejectUnauthorized: false
          }
  });
}

export function getPool() {
  if (!globalThis.__factCheckerPostgresPool) {
    globalThis.__factCheckerPostgresPool = createPool();
  }

  return globalThis.__factCheckerPostgresPool;
}

export async function ensureDatabaseSchema() {
  if (!globalThis.__factCheckerSchemaReady) {
    globalThis.__factCheckerSchemaReady = (async () => {
      const pool = getPool();

      await pool.query(`
        create table if not exists submissions (
          id text primary key,
          input_type text not null,
          x_url text,
          pasted_text text,
          uploaded_images jsonb not null default '[]'::jsonb,
          status text not null,
          created_at timestamptz not null
        );
      `);

      await pool.query(`
        create table if not exists results (
          submission_id text primary key references submissions(id) on delete cascade,
          payload jsonb not null,
          created_at timestamptz not null default now()
        );
      `);
    })();
  }

  return globalThis.__factCheckerSchemaReady;
}
