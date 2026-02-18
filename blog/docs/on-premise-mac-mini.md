# On-Premise Deployment (Mac mini + blog.yena.io.kr)

## 1. Runtime prerequisites

- macOS with Node.js 20+
- MongoDB URI configured in `.env.local` (`MONGO_URI`)
- Non-secret runtime constants set in `server/config/constants.ts`
- GitHub backup token (`POSTS_GITHUB_TOKEN`) configured in `.env.local`
- Optional: Resend API key for publication email delivery

## 2. Build and run

```bash
yarn install
yarn build
yarn start
```

Default app port is `3000`.

## 3. Keep process alive

Use `launchd`, `pm2`, or system service runner. Example with `pm2`:

```bash
pm2 start yarn --name i2na-blog -- start
pm2 save
pm2 startup
```

## 4. Reverse proxy and TLS

Place Nginx or Caddy in front of Next.js runtime.

- Upstream target: `http://127.0.0.1:3000`
- Domain: `blog.yena.io.kr`
- TLS: Let's Encrypt automatic renewal

## 5. DNS

Point `blog.yena.io.kr` A/AAAA record to the public IP of the Mac mini network.

## 6. Router / firewall

- Forward `80` and `443` to Mac mini
- Restrict direct external access to port `3000`

## 7. Operational checks

- `GET /api/posts` returns MongoDB-backed data
- Post create/update reflects in MongoDB and GitHub backup commit
- Public post publish triggers subscription alert logs
- `public/uploads` media is cleaned when files are no longer referenced by any post
