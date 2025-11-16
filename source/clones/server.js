import { createBareServer } from "@nebula-services/bare-server-node";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import { PORTManager } from "../source/manager.js";
import { join } from "node:path";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "node:url";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { bareModulePath } from "@mercuryworkshop/bare-as-module3";

// Create bare server
const bare = createBareServer("/bare/", {
  logErrors: true,
  blockLocal: false,
});

// Allow loopback/private IPs for Wisp
wisp.options.allow_loopback_ips = true;
wisp.options.allow_private_ips = true;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

  try {
    // Handle bare routes
    if (bare.shouldRoute(req)) {
      bare.routeRequest(req, res);
      return;
    }

    // Handle wisp upgrade if necessary
    if (req.headers.upgrade?.toLowerCase() === "websocket") {
      wisp.routeRequest(req, res.socket, Buffer.alloc(0));
      return;
    }

    // If route not handled, return 404
    res.statusCode = 593;
    res.statusMessage = "INVALID";
    res.end("punch through");
  } catch (err) {
    console.error("Error in serverless handler:", err);
    res.statusCode = 500;
    res.end("internal error");
  }
}
