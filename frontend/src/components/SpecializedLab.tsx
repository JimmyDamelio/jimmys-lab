import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Globe2,
  Layers3,
  Lock,
  Network,
  Radio,
  Radar,
  Router,
  Shield,
  Split,
  Waypoints
} from "lucide-react";
import type { Lesson } from "../types";

interface Props {
  lesson: Lesson;
}

function ipToInt(ip: string) {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return 0;
  return parts.reduce((acc, part) => (acc << 8) + part, 0) >>> 0;
}

function intToIp(value: number) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

function PacketVisualizer() {
  const [step, setStep] = useState(0);
  const layers = [
    ["Application", "HTTP GET /admin", "Donnees visibles par le service"],
    ["Transport", "TCP src:51544 dst:443", "Ports et fiabilite"],
    ["Internet", "IP 10.42.0.24 -> 10.0.20.10", "Routage inter-reseaux"],
    ["Acces reseau", "Ethernet aa:bb -> 00:11", "Livraison locale"]
  ];

  return (
    <section className="panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers3 className="text-[var(--color-accent-soft)]" size={20} />
          <h3 className="font-semibold">Visualiseur de paquet OSI/TCP-IP</h3>
        </div>
        <button onClick={() => setStep((step + 1) % layers.length)} className="rounded bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white">
          Etape suivante
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {layers.map(([name, payload, detail], index) => (
          <div key={name} className={`rounded-md border p-3 ${index === step ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10" : "border-[var(--color-line)] bg-black/20"}`}>
            <p className="text-sm font-semibold">{name}</p>
            <code className="mt-2 block rounded bg-black/40 p-2 text-xs text-slate-100">{payload}</code>
            <p className="mt-2 text-xs text-[var(--color-muted)]">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SubnetLab() {
  const [cidr, setCidr] = useState("10.42.0.130/26");
  const result = useMemo(() => {
    const [ip, prefixRaw] = cidr.split("/");
    const prefix = Math.min(32, Math.max(0, Number(prefixRaw ?? 24)));
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const network = ipToInt(ip) & mask;
    const broadcast = network | (~mask >>> 0);
    const first = prefix >= 31 ? network : network + 1;
    const last = prefix >= 31 ? broadcast : broadcast - 1;
    return {
      mask: intToIp(mask),
      network: intToIp(network),
      first: intToIp(first),
      last: intToIp(last),
      broadcast: intToIp(broadcast),
      hosts: prefix >= 31 ? 2 ** (32 - prefix) : Math.max(0, 2 ** (32 - prefix) - 2)
    };
  }, [cidr]);

  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <Network className="text-[var(--color-accent-soft)]" size={20} />
        <h3 className="font-semibold">Calculateur IPv4 / VLSM</h3>
      </div>
      <label className="mt-4 block text-sm">
        Adresse CIDR
        <input value={cidr} onChange={(event) => setCidr(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50" />
      </label>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {Object.entries(result).map(([key, value]) => (
          <div key={key} className="rounded border border-[var(--color-line)] bg-black/20 p-3">
            <p className="text-xs uppercase text-[var(--color-muted)]">{key}</p>
            <p className="font-mono text-sm text-[var(--color-accent-soft)]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProtocolSimulator() {
  const [mode, setMode] = useState<"dns" | "dhcp">("dns");
  const dns = ["Client", "Resolveur DNS", "Racine", "TLD .local", "Autoritatif", "A 10.10.10.5"];
  const dhcp = ["Discover", "Offer", "Request", "Ack", "IP 10.42.0.24/24", "Gateway 10.42.0.1"];
  const sequence = mode === "dns" ? dns : dhcp;

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe2 className="text-[var(--color-accent-soft)]" size={20} />
          <h3 className="font-semibold">Simulateur DNS / DHCP</h3>
        </div>
        <div className="flex rounded border border-[var(--color-line)] p-1">
          {(["dns", "dhcp"] as const).map((item) => (
            <button key={item} onClick={() => setMode(item)} className={`rounded px-3 py-1 text-sm ${mode === item ? "bg-[var(--color-accent)] text-white" : "text-slate-100"}`}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {sequence.map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <span className="rounded border border-[var(--color-line)] bg-black/25 px-3 py-2 text-sm">{item}</span>
            {index < sequence.length - 1 && <ArrowRight size={16} className="text-slate-300/60" />}
          </div>
        ))}
      </div>
    </section>
  );
}

function FirewallBuilder() {
  const [source, setSource] = useState("LAN");
  const [dest, setDest] = useState("DMZ_WEB");
  const [service, setService] = useState("HTTPS");
  const [action, setAction] = useState("allow");

  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <Shield className="text-[var(--color-accent-soft)]" size={20} />
        <h3 className="font-semibold">Firewall Rule Builder</h3>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {[
          ["Source", source, setSource, ["LAN", "GUEST", "WAN", "ADMIN"]],
          ["Destination", dest, setDest, ["DMZ_WEB", "ADMIN", "INTERNET", "DNS"]],
          ["Service", service, setService, ["HTTPS", "DNS", "SSH", "ANY"]],
          ["Action", action, setAction, ["allow", "deny", "log", "rate-limit"]]
        ].map(([label, value, setter, options]) => (
          <label key={String(label)} className="text-sm">
            {String(label)}
            <select value={String(value)} onChange={(event) => (setter as (next: string) => void)(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50">
              {(options as string[]).map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
      </div>
      <code className="mt-4 block rounded bg-black/40 p-3 text-sm text-[var(--color-accent-soft)]">
        {action} from {source} to {dest} service {service}; log prefix "jimmys-lab"
      </code>
    </section>
  );
}

function TransportAnalyzer() {
  const [protocol, setProtocol] = useState<"tcp" | "udp">("tcp");
  const tcp = [
    ["SYN", "Client demande une session"],
    ["SYN-ACK", "Serveur accepte et synchronise"],
    ["ACK", "Session etablie"],
    ["DATA", "Flux controle par fenetre et ACK"]
  ];
  const udp = [
    ["DATAGRAM", "Envoi sans session"],
    ["NO ACK", "Pas d'acquittement natif"],
    ["APP LOGIC", "Fiabilite geree par l'application"],
    ["LOW LATENCY", "Moins de surcharge"]
  ];
  const rows = protocol === "tcp" ? tcp : udp;

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Waypoints className="text-[var(--color-accent-soft)]" size={20} />
          <h3 className="font-semibold">Analyseur TCP / UDP</h3>
        </div>
        <div className="flex rounded border border-[var(--color-line)] p-1">
          {(["tcp", "udp"] as const).map((item) => (
            <button key={item} onClick={() => setProtocol(item)} className={`rounded px-3 py-1 text-sm ${protocol === item ? "bg-[var(--color-accent)] text-white" : "text-slate-100"}`}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {rows.map(([name, detail]) => (
          <div key={name} className="rounded border border-[var(--color-line)] bg-black/20 p-3">
            <p className="font-mono text-sm text-[var(--color-accent-soft)]">{name}</p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{detail}</p>
          </div>
        ))}
      </div>
      <code className="mt-4 block rounded bg-black/40 p-3 text-sm text-slate-100">
        filtre: {protocol === "tcp" ? "tcp.flags.syn == 1 || tcp.flags.ack == 1" : "udp && (dns || dhcp || quic)"}
      </code>
    </section>
  );
}

function RoutingSimulator() {
  const [target, setTarget] = useState("10.20.30.44");
  const routes = [
    { prefix: "10.20.30.0/24", nextHop: "R2", metric: 10 },
    { prefix: "10.20.0.0/16", nextHop: "R3", metric: 5 },
    { prefix: "0.0.0.0/0", nextHop: "FW", metric: 1 }
  ];
  const best = target.startsWith("10.20.30.") ? routes[0] : target.startsWith("10.20.") ? routes[1] : routes[2];

  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <Router className="text-[var(--color-accent-soft)]" size={20} />
        <h3 className="font-semibold">Simulateur de routage</h3>
      </div>
      <label className="mt-4 block text-sm">
        Destination
        <input value={target} onChange={(event) => setTarget(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50" />
      </label>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {routes.map((route) => (
          <div key={route.prefix} className={`rounded border p-3 ${route.prefix === best.prefix ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10" : "border-[var(--color-line)] bg-black/20"}`}>
            <p className="font-mono text-sm">{route.prefix}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">next-hop {route.nextHop} | metric {route.metric}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-[var(--color-muted)]">Decision: route la plus specifique vers {best.nextHop}, avant comparaison de metrique.</p>
    </section>
  );
}

function VlanBuilder() {
  const [nativeVlan, setNativeVlan] = useState("999");
  const [allowed, setAllowed] = useState("10,20,30");
  const ports = [
    ["Gi0/1", "access", "10"],
    ["Gi0/2", "access", "20"],
    ["Gi0/24", "trunk", allowed]
  ];

  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <Split className="text-[var(--color-accent-soft)]" size={20} />
        <h3 className="font-semibold">VLAN Builder</h3>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          VLAN natif trunk
          <input value={nativeVlan} onChange={(event) => setNativeVlan(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50" />
        </label>
        <label className="text-sm">
          VLANs autorises
          <input value={allowed} onChange={(event) => setAllowed(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50" />
        </label>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {ports.map(([port, mode, vlan]) => (
          <div key={port} className="rounded border border-[var(--color-line)] bg-black/20 p-3">
            <p className="font-mono text-sm text-[var(--color-accent-soft)]">{port}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{mode} | vlan {vlan}</p>
          </div>
        ))}
      </div>
      <code className="mt-4 block rounded bg-black/40 p-3 text-sm text-slate-100">
        trunk native vlan {nativeVlan}; allowed vlan {allowed}; stp guard root
      </code>
    </section>
  );
}

function WifiSpectrum() {
  const [channel, setChannel] = useState(6);
  const overlap = channel === 1 || channel === 6 || channel === 11 ? "faible" : "eleve";
  const security = channel === 6 ? "WPA3-Enterprise recommande" : "WPA2/WPA3 avec mot de passe robuste";

  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <Radio className="text-[var(--color-accent-soft)]" size={20} />
        <h3 className="font-semibold">Analyseur de spectre Wi-Fi</h3>
      </div>
      <label className="mt-4 block text-sm">
        Canal 2.4 GHz: {channel}
        <input type="range" min="1" max="13" value={channel} onChange={(event) => setChannel(Number(event.target.value))} className="mt-2 w-full" />
      </label>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded border border-[var(--color-line)] bg-black/20 p-3">
          <p className="text-xs uppercase text-[var(--color-muted)]">Chevauchement</p>
          <p className="font-semibold text-[var(--color-accent-soft)]">{overlap}</p>
        </div>
        <div className="rounded border border-[var(--color-line)] bg-black/20 p-3">
          <p className="text-xs uppercase text-[var(--color-muted)]">Canaux propres</p>
          <p className="font-semibold text-[var(--color-accent-soft)]">1 / 6 / 11</p>
        </div>
        <div className="rounded border border-[var(--color-line)] bg-black/20 p-3">
          <p className="text-xs uppercase text-[var(--color-muted)]">Securite</p>
          <p className="font-semibold text-[var(--color-accent-soft)]">{security}</p>
        </div>
      </div>
    </section>
  );
}

function NmapSimulator() {
  const [scan, setScan] = useState("-sV");
  const results: Record<string, string[]> = {
    "-sV": ["10.10.10.5 443/tcp open https nginx 1.24", "10.10.10.5 53/tcp open domain CoreDNS"],
    "-sS": ["10.10.10.5 22/tcp filtered ssh", "10.10.10.5 443/tcp open https"],
    "-O": ["OS guess: Linux 5.x", "Accuracy: 93%", "Note: validation manuelle requise"],
    "--script safe": ["http-title: Jimmy Lab", "ssl-cert: CN=lab.local"]
  };

  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <Radar className="text-[var(--color-accent-soft)]" size={20} />
        <h3 className="font-semibold">Nmap simulator</h3>
      </div>
      <select value={scan} onChange={(event) => setScan(event.target.value)} className="mt-4 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50">
        {Object.keys(results).map((option) => <option key={option}>{option}</option>)}
      </select>
      <code className="mt-4 block whitespace-pre-wrap rounded bg-black/40 p-3 text-sm text-slate-100">
        $ nmap {scan} 10.10.10.0/28{"\n"}
        {results[scan].join("\n")}
      </code>
      <p className="mt-3 text-sm text-[var(--color-muted)]">Sortie simulee pour apprendre la lecture des resultats sans scanner un reseau externe.</p>
    </section>
  );
}

function PacketCrafter() {
  const [ttl, setTtl] = useState(64);
  const [flags, setFlags] = useState("S");
  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <Layers3 className="text-[var(--color-accent-soft)]" size={20} />
        <h3 className="font-semibold">Packet crafter</h3>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          TTL {ttl}
          <input type="range" min="1" max="255" value={ttl} onChange={(event) => setTtl(Number(event.target.value))} className="mt-2 w-full" />
        </label>
        <label className="text-sm">
          TCP flags
          <select value={flags} onChange={(event) => setFlags(event.target.value)} className="mt-1 w-full rounded border border-[var(--color-line)] bg-black/30 px-3 py-2 text-slate-50">
            {["S", "SA", "A", "F", "R"].map((flag) => <option key={flag}>{flag}</option>)}
          </select>
        </label>
      </div>
      <code className="mt-4 block rounded bg-black/40 p-3 text-sm text-slate-100">
        IP(dst="10.10.10.5", ttl={ttl})/TCP(dport=443, flags="{flags}")
      </code>
    </section>
  );
}

function GenericScenario({ lesson }: Props) {
  return (
    <section className="panel p-4">
      <div className="flex items-center gap-2">
        <Database className="text-[var(--color-accent-soft)]" size={20} />
        <h3 className="font-semibold">{lesson.labType}</h3>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {["Observer", "Tester", "Documenter"].map((step) => (
          <div key={step} className="rounded border border-[var(--color-line)] bg-black/20 p-3">
            <CheckCircle2 size={17} className="text-[var(--color-accent-soft)]" />
            <p className="mt-2 font-semibold">{step}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Utilise le terminal et le carnet pour produire une preuve claire.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SpecializedLab({ lesson }: Props) {
  if (lesson.moduleNumber === "1.2") return <PacketVisualizer />;
  if (lesson.moduleNumber === "1.3" || lesson.moduleNumber === "2.1") return <SubnetLab />;
  if (lesson.moduleNumber === "2.2") return <TransportAnalyzer />;
  if (lesson.moduleNumber === "2.3") return <RoutingSimulator />;
  if (lesson.moduleNumber === "2.4") return <VlanBuilder />;
  if (lesson.moduleNumber === "3.2") return <FirewallBuilder />;
  if (lesson.moduleNumber === "3.3") return <ProtocolSimulator />;
  if (lesson.moduleNumber === "3.4") return <WifiSpectrum />;
  if (lesson.moduleNumber === "4.1") return <NmapSimulator />;
  if (lesson.moduleNumber === "4.4") return <PacketCrafter />;
  if (lesson.level === 4) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        <GenericScenario lesson={lesson} />
        <section className="panel p-4">
          <div className="flex items-center gap-2">
            <Lock className="text-[var(--color-accent-soft)]" size={20} />
            <h3 className="font-semibold">Garde-fous pentest</h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
            <li>Scope explicite avant toute action.</li>
            <li>Preuve minimale, non destructive.</li>
            <li>Remediation obligatoire dans la conclusion.</li>
          </ul>
        </section>
      </div>
    );
  }
  return <GenericScenario lesson={lesson} />;
}
