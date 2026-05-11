import { useMemo, useState } from "react";
import { Calculator, DatabaseZap, Globe2, Radar, Route, Shield, Wifi, Binary, Activity, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function ipToInt(ip: string) {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part || 0), 0) >>> 0;
}

function intToIp(value: number) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

export default function ToolsPanel() {
  const [cidr, setCidr] = useState("192.168.10.42/27");
  const [number, setNumber] = useState("42");
  const [domain, setDomain] = useState("lab.local");

  const subnet = useMemo(() => {
    const [ip, prefixRaw] = cidr.split("/");
    const prefix = Math.min(32, Math.max(0, Number(prefixRaw ?? 24)));
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = ipToInt(ip) & mask;
    const broadcast = network | (~mask >>> 0);
    const hosts = Math.max(0, 2 ** (32 - prefix) - 2);
    return { network: intToIp(network), broadcast: intToIp(broadcast), mask: intToIp(mask), hosts };
  }, [cidr]);

  const decimal = Number(number || 0);
  const tools: Array<[string, LucideIcon, string]> = [
    ["Subnet Calculator", Calculator, `${subnet.network} - ${subnet.broadcast} | ${subnet.hosts} hotes`],
    ["Binary/Hex/Decimal", Binary, `${decimal.toString(2)} | 0x${decimal.toString(16).toUpperCase()} | ${decimal}`],
    ["Port Scanner Simulator", Radar, "22/tcp SSH, 53/tcp DNS, 443/tcp HTTPS"],
    ["Packet Capture Analyzer", Activity, "Filtre: tcp.flags.syn == 1 && tcp.flags.ack == 0"],
    ["DNS Lookup Tool", Globe2, `${domain} -> A 10.10.10.5, MX mail.${domain}`],
    ["Traceroute Visualizer", Route, "LAN -> FW -> ISP -> target"],
    ["Bandwidth Calculator", DatabaseZap, "100 Mbps = 12.5 MB/s theorique"],
    ["Firewall Rule Builder", Shield, "default deny, allow 443 vers DMZ"],
    ["Wi-Fi Spectrum Analyzer", Wifi, "Canaux 1/6/11 recommandes en 2.4 GHz"],
    ["OSINT Recon Helper", Search, "scope, ASN, DNS, certificats, exposition"]
  ];

  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <h3 className="text-xl font-semibold">Outils integres</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">10 outils locaux pour calculer, simuler et documenter sans cloud.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            CIDR
            <input value={cidr} onChange={(event) => setCidr(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50" />
          </label>
          <label className="text-sm">
            Nombre
            <input value={number} onChange={(event) => setNumber(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50" />
          </label>
          <label className="text-sm">
            Domaine
            <input value={domain} onChange={(event) => setDomain(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50" />
          </label>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map(([name, Icon, result]) => (
          <article key={String(name)} className="panel p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded bg-[var(--color-accent)]/15 text-[var(--color-accent-soft)]">
                <Icon size={18} />
              </div>
              <h4 className="font-semibold">{name}</h4>
            </div>
            <code className="mt-4 block rounded bg-black/40 p-3 font-mono text-sm text-slate-100">{String(result)}</code>
          </article>
        ))}
      </section>
    </div>
  );
}
