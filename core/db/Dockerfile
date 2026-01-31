FROM postgres:18.1 AS builder

ARG POSTGIS_VERSION=3.6.1
ARG PG_CRON_VERSION=v1.6.7
ARG PG_PARTMAN_VERSION=v5.1.0
ARG PGMQ_VERSION=v1.9.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    autoconf \
    automake \
    build-essential \
    ca-certificates \
    clang \
    cmake \
    curl \
    git \
    libcurl4-gnutls-dev \
    libgdal-dev \
    libgeos-dev \
    libjson-c-dev \
    libproj-dev \
    libprotobuf-c-dev \
    libssl-dev \
    libtool \
    libxml2-dev \
    pkg-config \
    postgresql-server-dev-18 \
    protobuf-c-compiler \
  && rm -rf /var/lib/apt/lists/*

RUN git clone --branch ${POSTGIS_VERSION} https://github.com/postgis/postgis.git /tmp/postgis \
  && cd /tmp/postgis \
  && ./autogen.sh \
  && ./configure \
  && make -j"$(nproc)" \
  && make install \
  && cd / \
  && rm -rf /tmp/postgis

RUN git clone --branch ${PG_CRON_VERSION} https://github.com/citusdata/pg_cron.git /tmp/pg_cron \
  && cd /tmp/pg_cron \
  && make \
  && make install \
  && rm -rf /tmp/pg_cron

RUN git clone --branch ${PG_PARTMAN_VERSION} https://github.com/pgpartman/pg_partman.git /tmp/pg_partman \
  && cd /tmp/pg_partman \
  && make \
  && make install \
  && rm -rf /tmp/pg_partman

RUN git clone --branch ${PGMQ_VERSION} https://github.com/pgmq/pgmq.git /tmp/pgmq \
  && cd /tmp/pgmq/pgmq-extension \
  && make \
  && make install \
  && rm -rf /tmp/pgmq

FROM postgres:18.1

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libcurl4 \
    libgdal-dev \
    libgeos-c1v5 \
    libjson-c5 \
    libproj-dev \
    libprotobuf-c1 \
    libssl3 \
    libxml2 \
    pgbackrest \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/lib/postgresql/18/lib/ /usr/lib/postgresql/18/lib/
COPY --from=builder /usr/share/postgresql/18/extension/ /usr/share/postgresql/18/extension/
COPY --from=builder /usr/share/postgresql/18/contrib/ /usr/share/postgresql/18/contrib/
