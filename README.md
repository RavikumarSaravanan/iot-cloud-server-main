# Knowledge Garden — Full Stack (Frontend + Backend)

Secure Node.js + MongoDB backend serving a static frontend.

## Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Copy env and edit
cp .env.sample .env
# update MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3) Generate self-signed SSL (offline)
# Creates certs/selfsigned.key and certs/selfsigned.crt
openssl req -x509 -nodes -days 365 -newkey rsa:4096 \  -keyout certs/selfsigned.key -out certs/selfsigned.crt \  -subj "/C=IN/ST=TN/L=Nagapattinam/O=EGSPEC/OU=KG/CN=localhost"

# 4) Run
npm start
# HTTPS on 3443, HTTP redirect on 3000
## API Overview

- `POST /api/auth/register` — {email, password}
- `POST /api/auth/login` — returns {token, user}
- `GET /api/auth/me` — bearer token
- `POST /api/notifications` (admin) — {title, when, cat, venue}
- `GET /api/notifications` — filters: search, cat, today, page, limit
- `DELETE /api/notifications/:id` (admin)
- `GET /api/projects`
- `POST /api/projects` (admin, multipart form-data: image + fields)
- `DELETE /api/projects/:id` (admin)
- `GET /api/gallery` — alias to projects
- `GET /api/stats` — counts from join submissions
- `POST /api/join` — public intake from frontend modal

## Frontend

Static files in `public/` folder. Configure the frontend to reach backend by adding:

```html
<script>window.API_BASE='';</script>
```

(Empty string assumes same origin.)

## Offline SSL (Self-signed)

- Uses OpenSSL and does **not** require internet.
- Certificates are stored in `certs/` and loaded automatically.

### Renew

```
openssl req -x509 -nodes -days 825 -newkey rsa:4096   -keyout certs/selfsigned.key -out certs/selfsigned.crt   -subj "/C=IN/ST=TN/L=Nagapattinam/O=EGSPEC/OU=KG/CN=your-hostname"
```

## Database Protection (MongoDB)

1. **Enable Auth & Least Privilege**
   - Create admin and app user:
     ```js
     // In Mongo shell
     use admin
     db.createUser({user:'kgAdmin', pwd:'StrongAdminPass!', roles:[{role:'userAdminAnyDatabase', db:'admin'}, 'readWriteAnyDatabase']})
     use kgdb
     db.createUser({user:'appuser', pwd:'StrongAppPass!', roles:[{role:'readWrite', db:'kgdb'}]})
     ```
   - Use the app user in `MONGODB_URI`.

2. **Network Binding (on server)**
   - In `/etc/mongod.conf`:
     ```yaml
     net:
       bindIp: 127.0.0.1
     security:
       authorization: enabled
     ```
   - Restart MongoDB and access via localhost only (use reverse proxy if needed).

3. **Firewall**
   - `ufw allow 3443` (HTTPS)
   - `ufw allow 22` (SSH)
   - `ufw deny 27017` (block remote DB access)

4. **Input Validation & Sanitization**
   - Backend sanitizes strings and enforces schema on Mongoose.
   - Rate limiting is enabled on `/api` and `/api/auth`.

5. **Backup & Restore**
   - Nightly dump:
     ```bash
     mongodump --db kgdb --out /var/backups/kg-$(date +%F)
     # restore: mongorestore --db kgdb /var/backups/kg-YYYY-MM-DD/kgdb
     ```
   - Store backups on encrypted disk (e.g., LUKS).

6. **Logs & Monitoring**
   - Use `morgan` logs or reverse-proxy logs for audits.
   - Consider `fail2ban` for SSH and reverse-proxy.

7. **At-Rest Encryption (Optional)**
   - Use full-disk encryption (LUKS) or MongoDB Enterprise Encrypted Storage Engine.

## Systemd (optional)

Create `/etc/systemd/system/kg.service`:

```
[Unit]
Description=KG App
After=network.target mongod.service

[Service]
Environment=NODE_ENV=production
WorkingDirectory=/opt/kg-app
ExecStart=/usr/bin/node server.js
Restart=always
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
sudo systemctl enable --now kg
```

## Hardening Notes

- Set strong `JWT_SECRET`, rotate periodically.
- Consider switching frontend auth to **HttpOnly** cookies for higher security.
- Set `CORS_ORIGIN` precisely (no `*` in production).
- Serve through Nginx with HSTS for public domains.
```)
"# iot-cloud-server-main" 


