import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ip, port = 8728, username = "admin", password = "", ssl = false } = await req.json();

    if (!ip) {
      return NextResponse.json({ ok: false, error: "IP address required" }, { status: 400 });
    }

    // Attempt dynamic import of routeros-client if installed
    // In production, install: npm install routeros-client
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { RouterOSAPI } = require("routeros-client");

      const api = new RouterOSAPI({
        host: ip,
        user: username,
        password: password,
        port: Number(port),
        tls: ssl,
        timeout: 5000,
      });

      await api.connect();
      const [sysResource] = await api.write("/system/resource/print");
      const [sysRouterboard] = await api.write("/system/routerboard/print").catch(() => [{}]);
      await api.close();

      return NextResponse.json({
        ok: true,
        board: (sysRouterboard as Record<string, string>)?.["board-name"] ?? sysResource?.["board-name"] ?? "Unknown",
        version: (sysResource as Record<string, string>)?.["version"] ?? "Unknown",
        uptime: (sysResource as Record<string, string>)?.["uptime"] ?? "Unknown",
        platform: (sysResource as Record<string, string>)?.["platform"] ?? "Unknown",
        cpu_load: (sysResource as Record<string, string>)?.["cpu-load"] ?? "0",
        free_memory: (sysResource as Record<string, string>)?.["free-memory"] ?? "0",
      });
    } catch (importErr: unknown) {
      // routeros-client not installed — return simulated connectivity check
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const errMsg = importErr instanceof Error ? importErr.message : String(importErr);

      // Try basic TCP connection to check if device is reachable
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const net = require("net");
      const isReachable = await new Promise<boolean>((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(3000);
        socket.on("connect", () => { socket.destroy(); resolve(true); });
        socket.on("timeout", () => { socket.destroy(); resolve(false); });
        socket.on("error", () => resolve(false));
        socket.connect(Number(port), ip);
      });

      if (isReachable) {
        return NextResponse.json({
          ok: true,
          board: "Reachable (install routeros-client for full info)",
          version: "—",
          uptime: "—",
          note: "Install routeros-client npm package for full API access",
        });
      }

      return NextResponse.json({
        ok: false,
        error: `Device unreachable at ${ip}:${port}. Install routeros-client for full API: ${errMsg}`,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
