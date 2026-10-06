import type { PoolConfig } from "mariadb";

// Turns DATABASE_URL into driver settings. Shared by the app and the seed script.
//
// SSL follows Prisma's URL options, so the same URL also works for `prisma migrate`:
//   ?sslaccept=strict                -> encrypted, server certificate verified
//   ?sslaccept=accept_invalid_certs  -> encrypted, certificate not verified (e.g. a provider's self-signed CA)
// If DATABASE_CA_CERT holds a CA certificate (PEM text), it is used to verify the server.
export function databaseConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  const url = new URL(raw);

  const sslaccept = url.searchParams.get("sslaccept");
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
  let ssl: PoolConfig["ssl"];
  if (ca) ssl = { ca, rejectUnauthorized: true };
  else if (sslaccept === "strict") ssl = { rejectUnauthorized: true };
  else if (sslaccept === "accept_invalid_certs") ssl = { rejectUnauthorized: false };

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    ssl,
    // MySQL 8 users with caching_sha2_password auth need this over non-TLS connections.
    allowPublicKeyRetrieval: !ssl,
  };
}
