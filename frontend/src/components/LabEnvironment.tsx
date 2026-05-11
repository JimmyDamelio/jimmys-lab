import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { CheckCircle2, Play, Save } from "lucide-react";
import type { LabProgressRow, Lesson } from "../types";
import { getNotes, saveLabProgress, saveLabRun, saveNotes } from "../utils/api";
import SpecializedLab from "./SpecializedLab";

interface Props {
  lesson: Lesson;
  labProgress: LabProgressRow[];
  onLabProgressChange: () => Promise<void>;
}

const simulatedOutputs: Record<string, string> = {
  "ip addr": "2: eth0: mtu 1500 state UP\n    inet 10.42.0.24/24 brd 10.42.0.255 scope global eth0",
  "ip route": "default via 10.42.0.1 dev eth0\n10.42.0.0/24 dev eth0 proto kernel scope link",
  "ip route get 203.0.113.10": "203.0.113.10 via 10.42.0.1 dev eth0 src 10.42.0.24 uid 1000\n    cache",
  "ip route add 10.42.8.0/21 via 10.42.0.1": "Route ajoutee en simulation: 10.42.8.0/21 via 10.42.0.1",
  "ping 1.1.1.1": "64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=12.4 ms\n64 bytes from 1.1.1.1: icmp_seq=2 ttl=57 time=12.1 ms",
  "ping 8.8.8.8": "64 bytes from 8.8.8.8: icmp_seq=1 ttl=116 time=14.8 ms",
  "ss -tulpn": "Netid State  Local Address:Port  Process\nudp   UNCONN 0.0.0.0:53          dnsmasq\ntcp   LISTEN 0.0.0.0:443         nginx",
  "ss -ant": "State      Recv-Q Send-Q Local Address:Port Peer Address:Port\nSYN-SENT   0      1      10.42.0.24:51544 10.0.20.10:443\nESTAB      0      0      10.42.0.24:51545 10.0.20.10:443",
  "traceroute example.com": "1  10.42.0.1  1.3 ms\n2  198.51.100.1  8.4 ms\n3  93.184.216.34  16.2 ms",
  "traceroute 8.8.8.8": "1  10.42.0.1  0.8 ms\n2  198.51.100.254  6.1 ms\n3  8.8.8.8  12.9 ms",
  "arp -n": "Address       HWtype  HWaddress           Iface\n10.42.0.1     ether   00:11:22:33:44:55   eth0",
  "bridge fdb show": "00:11:22:33:44:55 dev eth0 vlan 10 master br0\n66:77:88:99:aa:bb dev eth0 vlan 20 master br0",
  "ip link add link eth0 name eth0.10 type vlan id 10": "Interface simulee eth0.10 creee pour VLAN 10",
  "show vlan brief": "VLAN Name     Status Ports\n10   ADMIN    active Gi0/1\n20   GUEST    active Gi0/2\n30   SERVERS  active Gi0/3",
  "show spanning-tree": "VLAN0010 Root ID priority 32768 address 0011.2233.4455\nGi0/24 role root state forwarding",
  "nmap -sV 10.10.10.0/24": "Nmap scan report for 10.10.10.5\n443/tcp open  https  nginx 1.24\n53/tcp  open  domain  CoreDNS",
  "nmap -sV 10.10.10.0/28": "Nmap scan report for 10.10.10.5\n443/tcp open  https  nginx 1.24\n53/tcp open domain CoreDNS\nMAC Address: 02:42:AC:10:00:05",
  "nmap -sS -Pn --top-ports 100 10.10.10.5": "22/tcp filtered ssh\n53/tcp open domain\n443/tcp open https\nScan done: SYN simulation",
  "curl -I http://10.0.20.10": "HTTP/1.1 301 Moved Permanently\nLocation: https://10.0.20.10/",
  "curl -v https://example.com": "* TLS handshake complete\n> GET / HTTP/2\n< HTTP/2 200\n< server: lab-edge",
  "curl -I https://lab.local": "HTTP/2 200\nserver: nginx\nstrict-transport-security: max-age=31536000",
  "sudo nft list ruleset": "table inet filter {\n chain input { type filter hook input priority 0; policy drop; }\n}",
  "sudo nft add rule inet filter input tcp dport 443 accept": "Regle simulee ajoutee: accept tcp dport 443",
  "openssl s_client -connect lab.local:443": "Protocol  : TLSv1.2\nCipher    : TLS_AES_128_GCM_SHA256\nVerify return code: 0 (ok)",
  "openssl s_client -connect host:443": "Protocol  : TLSv1.3\nCipher    : TLS_AES_256_GCM_SHA384\nVerify return code: 0 (ok)",
  "openssl s_client -starttls smtp -connect mail:25": "250-STARTTLS\nProtocol  : TLSv1.2\nVerify return code: 0 (ok)",
  "dig axfr example.local @10.10.10.53": "; Transfer failed.\n; AXFR disabled on authoritative server.",
  "dig +trace example.com": ". -> com. -> example.com. -> A 93.184.216.34",
  "dig AAAA example.com": "example.com. 3600 IN AAAA 2606:2800:220:1:248:1893:25c8:1946",
  "dig @10.10.10.53 lab.local": "lab.local. 300 IN A 10.10.10.5",
  "ip -6 addr": "inet6 fe80::42/64 scope link\ninet6 2001:db8:42::24/64 scope global",
  "ping -6 2606:4700:4700::1111": "64 bytes from 2606:4700:4700::1111: icmp_seq=1 time=18.3 ms",
  "ip -6 neigh": "fe80::1 dev eth0 lladdr 00:11:22:33:44:55 router REACHABLE",
  "iw dev": "phy#0\n Interface wlan0\n  type managed\n  channel 6 (2437 MHz)",
  "nmcli dev wifi": "SSID        CHAN RATE       SIGNAL SECURITY\nLAB-WPA3    6    540 Mbit/s 82     WPA3\nGUEST       11   270 Mbit/s 55     WPA2",
  "iwlist wlan0 scan": "Cell 01 - Channel:6 Quality=70/70 ESSID:\"LAB-WPA3\"\nCell 02 - Channel:11 Quality=42/70 ESSID:\"GUEST\"",
  "ip link show wlan0": "3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP",
  "tshark -r capture.pcap -Y 'http'": "1 10.42.0.24 -> 10.0.20.10 HTTP GET /login\n2 10.0.20.10 -> 10.42.0.24 HTTP 200 OK",
  "tcpdump -nnvvXSs 0": "IP 10.42.0.24.51544 > 10.0.20.10.443: Flags [S], seq 1000, win 64240",
  "scapy": ">>> IP(dst='10.10.10.5')/TCP(dport=443, flags='S')\n<IP  frag=0 proto=tcp dst=10.10.10.5 |<TCP dport=https flags=S |>>"
};

export default function LabEnvironment({ lesson, labProgress, onLabProgressChange }: Props) {
  const [notes, setNotes] = useState(lesson.starterCode);
  const [command, setCommand] = useState(lesson.commands[0] ?? "ip addr");
  const [savingLab, setSavingLab] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const currentLab = labProgress.find((row) => row.lesson_id === lesson.id);
  const labDone = currentLab?.completed === 1;

  useEffect(() => {
    setNotes(lesson.starterCode);
    getNotes(lesson.id).then((saved) => {
      if (saved.trim()) setNotes(saved);
    });
  }, [lesson]);

  useEffect(() => {
    if (!terminalRef.current) return;
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: "JetBrains Mono, Consolas, monospace",
      fontSize: 13,
      theme: { background: "#111827", foreground: "#f8fafc", cursor: "#10b981" }
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    term.writeln("Jimmy's Lab CLI simule");
    term.writeln("Tape une commande via le champ puis execute.");
    xtermRef.current = term;
    return () => term.dispose();
  }, [lesson.id]);

  async function runCommand() {
    const normalized = command.trim();
    const output = simulatedOutputs[normalized] ?? `Commande simulee: ${normalized}\nIndice: compare avec les commandes proposees dans la lecon.`;
    xtermRef.current?.writeln("");
    xtermRef.current?.writeln(`$ ${normalized}`);
    output.split("\n").forEach((line) => xtermRef.current?.writeln(line));
    await saveLabRun(lesson.id, normalized, output);
  }

  async function completeLab() {
    setSavingLab(true);
    const evidence = notes
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, 12)
      .join("\n");
    await saveLabProgress(lesson.id, true, evidence || "Lab valide depuis Jimmy's Lab");
    await onLabProgressChange();
    setSavingLab(false);
  }

  return (
    <div className="space-y-5">
      <SpecializedLab lesson={lesson} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] px-4 py-3">
          <div>
            <h3 className="font-semibold">Carnet de lab</h3>
            <p className="text-sm text-[var(--color-muted)]">{lesson.labPrompt}</p>
          </div>
          <button
            onClick={() => saveNotes(lesson.id, notes)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white"
          >
            <Save size={16} />
            Sauver
          </button>
          <button
            onClick={completeLab}
            disabled={savingLab}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
              labDone ? "bg-red-300 text-black" : "bg-[var(--color-accent-soft)] text-black"
            } disabled:opacity-60`}
          >
            <CheckCircle2 size={16} />
            {labDone ? "Lab valide" : "Valider lab"}
          </button>
        </div>
        <div className="h-[620px]">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            value={notes}
            onChange={(value) => setNotes(value ?? "")}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>
        </section>

        <aside className="space-y-5">
        <section className="panel p-4">
          <h3 className="font-semibold">Terminal virtuel</h3>
          <div className="mt-3 flex gap-2">
            <select
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              className="min-w-0 flex-1 rounded-md border border-[var(--color-line)] bg-black/30 px-3 py-2 text-sm text-slate-50"
            >
              {lesson.commands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              onClick={runCommand}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-blue-soft)] px-3 py-2 text-sm font-semibold text-black"
            >
              <Play size={16} />
              Run
            </button>
          </div>
          <div ref={terminalRef} className="mt-4 h-[360px] overflow-hidden rounded-md bg-ink" />
        </section>

        <section className="panel p-4">
          <h3 className="font-semibold">Checklist</h3>
          <div className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
            <label className="flex items-center gap-2"><input type="checkbox" /> Hypothese de couche formulee</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Commande executee et interpretee</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Remediation ou conclusion notee</label>
          </div>
        </section>
        </aside>
      </div>
    </div>
  );
}
