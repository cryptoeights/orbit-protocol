# Deploying ORBIT (and other projects) on one VPS

Target VPS: **Ubuntu, 2 vCPU / 8 GB / 160 GB (DigitalOcean, SGP)**.
Strategy: **Docker Compose per project** behind a single **Cloudflare Tunnel**.
No host ports are exposed — Cloudflare routes each hostname to a container.

```
Cloudflare (DNS + SSL + Tunnel)
        │
        ▼
┌──────────── VPS — docker network "web" ────────────┐
│  cloudflared (edge)                                 │
│     ├─ orbitprotocol.dev      → frontend:3000       │
│     ├─ api.orbitprotocol.dev  → api:3001            │
│     ├─ projectb.com           → projectb-app:3000   │
│     └─ projectc.dev           → projectc-app:8000   │
│                                                     │
│  orbit/      (frontend + api + postgres + redis)    │
│  project-b/  (own compose + own db)                 │
│  project-c/  (own compose + own db)                 │
└─────────────────────────────────────────────────────┘
```

RAM budget: Orbit ≈ 0.8 GB, two more projects ≈ 1.5 GB, system ≈ 0.6 GB → **~3 GB of 8 GB used**. Plenty of headroom.

---

## 1. One-time VPS setup

```bash
# Install Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sh

# Shared network that every project + the tunnel join
docker network create web

# Recommended layout
sudo mkdir -p /opt && cd /opt
git clone https://github.com/cryptoeights/orbit-protocol.git orbit
```

## 2. Cloudflare Tunnel (the public door)

1. Point your domains' nameservers to Cloudflare (DNS managed there).
2. Cloudflare dashboard → **Zero Trust → Networks → Tunnels → Create tunnel** (type: *Cloudflared*).
3. Copy the **tunnel token**.
4. On the VPS:
   ```bash
   cd /opt/orbit/deploy/cloudflared
   cp .env.example .env
   nano .env            # paste TUNNEL_TOKEN
   docker compose up -d
   ```
5. Back in the dashboard, add **Public Hostnames** for the tunnel:

   | Hostname | Service |
   |---|---|
   | `orbitprotocol.dev` | `http://frontend:3000` |
   | `api.orbitprotocol.dev` | `http://api:3001` |

   (Service uses the **container name** because cloudflared shares the `web` network.)

## 3. Launch the Orbit stack

```bash
cd /opt/orbit/deploy
cp .env.example .env
nano .env                       # set POSTGRES_PASSWORD + NEXT_PUBLIC_PRIVY_APP_ID

docker compose up -d --build    # build images + start all 4 services

# First boot only: create the DB schema
docker compose run --rm api pnpm db:push
```

Verify:
```bash
docker compose ps                       # all healthy/running
docker compose logs -f api              # watch API boot
curl -s https://api.orbitprotocol.dev/  # via the tunnel
```

## 4. Day-to-day

```bash
# Deploy new code
git pull && docker compose up -d --build

# Logs / restart a single service
docker compose logs -f frontend
docker compose restart api

# Backup the database
docker compose exec postgres pg_dump -U orbit orbit_protocol > backup_$(date +%F).sql
```

---

## 5. Adding project B / C (the multi-project part)

Each extra project is the **same pattern** — its own folder, its own compose, its
own DB, joined to the shared `web` network. Minimal example:

```yaml
# /opt/project-b/docker-compose.yml
name: projectb
services:
  app:
    build: .
    container_name: projectb-app    # <- the name cloudflared routes to
    restart: unless-stopped
    networks: [web, internal]
  db:
    image: postgres:15-alpine
    environment: { POSTGRES_PASSWORD: ... }
    volumes: [pgdata:/var/lib/postgresql/data]
    networks: [internal]
networks:
  web: { external: true }
  internal:
volumes: { pgdata: }
```

Then add a Public Hostname in the tunnel (`projectb.com → http://projectb-app:3000`)
and `docker compose up -d`. Projects are fully isolated: each has its own DB and
network; only the containers you put on `web` are reachable by the tunnel.

---

## Notes

- **Secrets**: `deploy/.env` and `deploy/cloudflared/.env` are gitignored. Never commit them.
- **NEXT_PUBLIC_* are build-time.** Changing `NEXT_PUBLIC_API_URL` requires a
  `docker compose up -d --build frontend` (not just a restart).
- **CSP**: `frontend/next.config.ts` still allows `*.vercel.app` in script/frame
  sources — harmless, but you can tighten it to your own domain when fully off Vercel.
- **No exposed ports** = much smaller attack surface. You can keep `ufw` default-deny
  inbound except SSH; the tunnel needs only outbound 443.
