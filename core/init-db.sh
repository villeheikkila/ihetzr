#!/usr/bin/env sh
set -eu

# Create per-service databases and users using POSTGRES_DB_* env vars.
# Example: POSTGRES_DB_APP_NAME=app POSTGRES_DB_APP_USER=app POSTGRES_DB_APP_PASSWORD=secret

for var in $(env | cut -d= -f1 | grep '^POSTGRES_DB_.*_NAME$' || true); do
  key=$(echo "$var" | sed 's/^POSTGRES_DB_//;s/_NAME$//')
  name=$(printenv "$var")
  user=$(printenv "POSTGRES_DB_${key}_USER" || true)
  pass=$(printenv "POSTGRES_DB_${key}_PASSWORD" || true)

  if [ -z "$name" ] || [ -z "$user" ] || [ -z "$pass" ]; then
    echo "Skipping $key: missing NAME/USER/PASSWORD"
    continue
  fi

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$user') THEN
        CREATE ROLE $user LOGIN PASSWORD '$pass';
      END IF;
    END
    $$;
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '$name') THEN
        CREATE DATABASE $name OWNER $user;
      END IF;
    END
    $$;
EOSQL

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$name" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_topology;
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    CREATE EXTENSION IF NOT EXISTS pg_partman;
    CREATE EXTENSION IF NOT EXISTS pgmq;
EOSQL

done
