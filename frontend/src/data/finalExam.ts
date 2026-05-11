export const finalExam = {
  id: "final-network-pentest-01",
  title: "Examen final - Audit reseau encadre",
  duration: "90 min",
  passingScore: 80,
  scenario:
    "Une organisation fictive te confie un audit reseau limite a une DMZ de lab. Tu dois respecter le scope, identifier les services exposes, analyser les risques, puis produire un rapport actionnable.",
  scope: ["10.10.10.0/28", "lab.local", "web.lab.local", "dns.lab.local"],
  forbidden: [
    "Tester une adresse hors 10.10.10.0/28",
    "Utiliser des commandes destructrices",
    "Annoncer une vulnerabilite sans preuve",
    "Oublier la remediation"
  ],
  evidencePack: [
    "nmap -sV 10.10.10.0/28 -> 10.10.10.5: 53/tcp domain CoreDNS, 443/tcp https nginx 1.24",
    "curl -I https://lab.local -> HTTP/2 200, server nginx, strict-transport-security present",
    "dig @10.10.10.53 lab.local -> A 10.10.10.5",
    "sudo nft list ruleset -> policy drop, allow tcp dport 443 vers DMZ_WEB, allow udp dport 53 vers DNS",
    "show vlan brief -> VLAN 20 GUEST, VLAN 30 SERVERS, VLAN 40 DMZ"
  ],
  tasks: [
    "Reformuler le scope et les limites.",
    "Produire une reconnaissance non agressive.",
    "Lister les services et hypotheses.",
    "Identifier au moins deux risques plausibles.",
    "Proposer une remediation priorisee.",
    "Rediger un rapport final lisible."
  ],
  criteria: [
    { key: "scope_score", label: "Scope respecte", max: 20, helper: "Autorisation, limites, interdits, perimetre clair." },
    { key: "recon_score", label: "Reconnaissance propre", max: 20, helper: "Commandes douces, inventaire, lecture des ports et services." },
    { key: "evidence_score", label: "Preuves techniques", max: 20, helper: "Faits courts, reproductibles, relies aux observations." },
    { key: "risk_score", label: "Analyse du risque", max: 20, helper: "Impact, vraisemblance, priorisation et prudence." },
    { key: "remediation_score", label: "Remediation et rapport", max: 20, helper: "Actions concretes, verifiables, comprehensibles." }
  ] as const
};
