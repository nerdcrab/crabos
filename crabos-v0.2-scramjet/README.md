# CrabOS v0.2

Standalone CrabOS build for `os.nerdcrab.com`, including the CrabScape browser powered by Scramjet v2.

## Run

Requires Node.js 20 or newer.

```sh
npm install
npm start
```

The server listens on `PORT` or port `8080` by default.

## Hosting

This edition is no longer a static-site upload. Scramjet requires a Node service with WebSocket support, so deploy this folder to a Node-capable host using:

- Build command: `npm install`
- Start command: `npm start`
- Runtime: Node.js 20+

Keep DNS at Cloudflare, then point `os.nerdcrab.com` to the Node host according to that provider's custom-domain instructions. Do not attach the same hostname to the old static Worker at the same time.

## Open-source dependency

Scramjet and proxy-bootstrap are Mercury Workshop projects distributed under AGPL-3.0. Review and follow their license requirements when publicly hosting or redistributing this build: https://github.com/MercuryWorkshop/scramjet
