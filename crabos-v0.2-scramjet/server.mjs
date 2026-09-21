import http from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import { bootstrap } from "@mercuryworkshop/proxy-bootstrap";

const app = express();
const { routeRequest, routeUpgrade } = await bootstrap({ transport: "libcurl" });

app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});
app.use((req, res, next) => routeRequest(req, res) || next());
app.use(express.static(fileURLToPath(new URL(".", import.meta.url))));

const server = http.createServer(app);
server.on("upgrade", (req, socket, head) => {
  if (routeUpgrade(req, socket, head)) return;
  socket.end();
});
const port = Number(process.env.PORT || 8080);
server.listen(port, "0.0.0.0", () => console.log(`CrabOS online on port ${port}`));
