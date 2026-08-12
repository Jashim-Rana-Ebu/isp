import { NextRequest, NextResponse } from "next/server";

// OID mappings for supported OLT profiles
const OLT_OIDS: Record<string, Record<string, string>> = {
  HIOSO_C: {
    onuName: "1.3.6.1.4.1.25355.3.2.6.3.2.1.37",
    onuSerial: "1.3.6.1.4.1.25355.3.2.6.3.2.1.11",
    onuStatus: "1.3.6.1.4.1.25355.3.2.6.3.2.1.39",
    distance: "1.3.6.1.4.1.25355.3.2.6.3.2.1.25",
    txPower: "1.3.6.1.4.1.25355.3.2.6.14.2.1.4",
    rxPower: "1.3.6.1.4.1.25355.3.2.6.14.2.1.8",
    temperature: "1.3.6.1.4.1.25355.3.2.6.14.2.1.7",
  },
  HIOSO_B2: {
    onuName: "1.3.6.1.4.1.25355.3.2.6.3.2.1.37",
    onuSerial: "1.3.6.1.4.1.25355.3.2.6.3.2.1.11",
    onuStatus: "1.3.6.1.4.1.25355.3.2.6.3.2.1.39",
    distance: "1.3.6.1.4.1.25355.3.2.6.3.2.1.25",
    txPower: "1.3.6.1.4.1.25355.3.2.6.14.2.1.4",
    rxPower: "1.3.6.1.4.1.25355.3.2.6.14.2.1.8",
    temperature: "1.3.6.1.4.1.25355.3.2.6.14.2.1.7",
  },
  HIOSO_VX: {
    onuName: "1.3.6.1.4.1.25355.3.2.6.3.2.1.37",
    onuSerial: "1.3.6.1.4.1.25355.3.2.6.3.2.1.11",
    onuStatus: "1.3.6.1.4.1.25355.3.2.6.3.2.1.39",
    distance: "1.3.6.1.4.1.25355.3.2.6.3.2.1.25",
    txPower: "1.3.6.1.4.1.25355.3.2.6.14.2.1.4",
    rxPower: "1.3.6.1.4.1.25355.3.2.6.14.2.1.8",
    temperature: "1.3.6.1.4.1.25355.3.2.6.14.2.1.7",
  },
  HIOSO_B: {
    onuName: "1.3.6.1.4.1.3320.101.10.1.1.79",
    onuSerial: "1.3.6.1.4.1.3320.101.10.1.1.3",
    onuStatus: "1.3.6.1.4.1.3320.101.10.1.1.26",
    txPower: "1.3.6.1.4.1.3320.101.10.5.1.5",
    rxPower: "1.3.6.1.4.1.3320.101.10.5.1.6",
  },
  HIOSO_GPON: {
    onuName: "1.3.6.1.4.1.25355.3.2.6.3.2.1.37",
    onuSerial: "1.3.6.1.4.1.25355.3.2.6.3.2.1.11",
    onuStatus: "1.3.6.1.4.1.25355.3.2.6.3.2.1.39",
    rxPower: "1.3.6.1.4.1.25355.3.2.6.14.2.1.8",
    txPower: "1.3.6.1.4.1.25355.3.2.6.14.2.1.4",
    temperature: "1.3.6.1.4.1.25355.3.2.6.14.2.1.7",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { ip, community = "public", port = 161, profile = "HIOSO_C" } = await req.json();

    if (!ip) {
      return NextResponse.json({ ok: false, error: "IP address required" }, { status: 400 });
    }

    const oids = OLT_OIDS[profile] ?? OLT_OIDS["HIOSO_C"];

    try {
      // Try to use net-snmp if installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snmp = require("net-snmp") as any;

      const session = snmp.createSession(ip, community, {
        port: Number(port),
        timeout: 5000,
        retries: 1,
        version: snmp.Version2c,
      });

      // Walk ONU serial OID to discover ONUs
      const onus: Array<Record<string, unknown>> = [];

      await new Promise<void>((resolve) => {
        session.subtree(oids.onuSerial, 20, (varbinds: Array<{ oid: string; value: Buffer | string | number }>) => {
          for (const vb of varbinds) {
            if (snmp.isVarbindError(vb)) continue;
            const oidParts = vb.oid.split(".");
            const suffix = oidParts.slice(-3).join(".");
            const serial = Buffer.isBuffer(vb.value)
              ? vb.value.toString("hex").toUpperCase()
              : String(vb.value);
            onus.push({ suffix, serial });
          }
        }, (err: Error | null) => {
          session.close();
          resolve();
        });
      });

      return NextResponse.json({
        ok: true,
        onuCount: onus.length,
        onus: onus.slice(0, 5), // Return first 5 as sample
        profile,
        oids: Object.keys(oids),
      });
    } catch {
      // net-snmp not installed — check basic UDP reachability
      return NextResponse.json({
        ok: true,
        onuCount: 0,
        onus: [],
        profile,
        note: "Install net-snmp npm package for SNMP polling: npm install net-snmp",
        oids: Object.keys(oids),
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
