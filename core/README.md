# Core services (Postgres, Redis, Caddy)

This compose is intended to run on the VPS under `/srv/services/core`.
It provides shared Postgres 18 (with PostGIS, pg_cron, pg_partman, pgmq), Redis, pgBackRest backups to S3, and the shared Caddy gateway.

## Quick start

```bash
mkdir -p /srv/services/core /srv/services/caddy
cp -R /Users/villeheikkila/Developer/ihetzr/core/* /srv/services/core/
cp -R /Users/villeheikkila/Developer/ihetzr/caddy/* /srv/services/caddy/
cd /srv/services/core

# Update passwords and DB user config in a secure way
nano redis.env

# Example per-service DB config (add to db.env or export)
echo "POSTGRES_DB_APP_NAME=app" >> /srv/services/core/db.env
echo "POSTGRES_DB_APP_USER=app" >> /srv/services/core/db.env
echo "POSTGRES_DB_APP_PASSWORD=change-me" >> /srv/services/core/db.env

# Configure pgBackRest S3 credentials (required)
nano /srv/services/core/pgbackrest/pgbackrest.env

docker compose up -d
```

## Notes

- Postgres listens only on localhost (127.0.0.1:5432).
- Redis listens only on localhost (127.0.0.1:6379).
- Caddy listens on 80/443 and uses `/etc/caddy/sites/*.caddy` for per-service configs.
- Helper scripts: `/srv/services/core/bin/add-db.sh` and `/srv/services/core/bin/add-site.sh` (copy from `infra/core/bin/`).
- pgBackRest runs via systemd timers (full daily at 02:00, incremental hourly).
