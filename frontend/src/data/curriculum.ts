import type { Difficulty, Lesson, QuizQuestion, TopologyLink, TopologyNode } from "../types";

interface ModulePlan {
  level: number;
  levelName: string;
  moduleNumber: string;
  module: string;
  difficulty: Difficulty;
  labType: string;
  lessons: string[];
  commands: string[];
}

const nodes: TopologyNode[] = [
  { id: "pc", label: "Client", type: "host" },
  { id: "sw", label: "Switch", type: "switch" },
  { id: "rt", label: "Routeur", type: "router" },
  { id: "fw", label: "Firewall", type: "firewall" },
  { id: "srv", label: "Serveur", type: "server" },
  { id: "wan", label: "Internet", type: "internet" }
];

const links: TopologyLink[] = [
  { source: "pc", target: "sw", label: "Access" },
  { source: "sw", target: "rt", label: "Trunk/L3" },
  { source: "rt", target: "fw", label: "Transit" },
  { source: "fw", target: "srv", label: "DMZ" },
  { source: "fw", target: "wan", label: "WAN" }
];

const plan: ModulePlan[] = [
  {
    level: 1,
    levelName: "Fondamentaux",
    moduleNumber: "1.1",
    module: "Introduction aux reseaux",
    difficulty: "Debutant",
    labType: "Simulation interactive de topologies",
    lessons: ["C'est quoi un reseau?", "Types de reseaux LAN, WAN, MAN, PAN", "Topologies bus, star, ring, mesh", "Composants switch, routeur, hub"],
    commands: ["ping 8.8.8.8", "ip addr", "arp -n", "traceroute example.com"]
  },
  {
    level: 1,
    levelName: "Fondamentaux",
    moduleNumber: "1.2",
    module: "Modele OSI et TCP/IP",
    difficulty: "Debutant",
    labType: "Visualiseur de paquets interactif",
    lessons: ["Les 7 couches OSI expliquees simplement", "Modele TCP/IP en 4 couches", "Encapsulation et desencapsulation", "Comparaison OSI vs TCP/IP"],
    commands: ["ss -tulpn", "tcpdump -n -c 5", "curl -I https://example.com", "ping 1.1.1.1"]
  },
  {
    level: 1,
    levelName: "Fondamentaux",
    moduleNumber: "1.3",
    module: "Adressage IP IPv4",
    difficulty: "Debutant",
    labType: "Calculatrice de sous-reseaux interactive",
    lessons: ["Structure d'une adresse IPv4", "Classes A, B, C, D, E", "Adresses privees vs publiques", "Calcul de masque de sous-reseau"],
    commands: ["ipcalc 192.168.1.42/24", "ip route", "ip addr add 10.0.0.2/24 dev eth0", "arp -n"]
  },
  {
    level: 2,
    levelName: "Intermediaire",
    moduleNumber: "2.1",
    module: "Subnetting avance",
    difficulty: "Intermediaire",
    labType: "Simulateur de reseau d'entreprise",
    lessons: ["VLSM Variable Length Subnet Masking", "Notation CIDR", "Supernetting et aggregation de routes", "Decoupage pratique d'un plan IP"],
    commands: ["ipcalc 10.42.0.0/22", "ip route add 10.42.8.0/21 via 10.42.0.1", "python3 -m ipaddress", "ip -br addr"]
  },
  {
    level: 2,
    levelName: "Intermediaire",
    moduleNumber: "2.2",
    module: "Couche transport",
    difficulty: "Intermediaire",
    labType: "Analyseur de trafic TCP/UDP",
    lessons: ["TCP en detail handshake et fenetrage", "UDP et cas d'usage", "Ports et services", "QoS et bande passante"],
    commands: ["ss -ant", "nc -vz 10.0.0.10 443", "tcpdump -n tcp port 443", "iperf3 -c 10.0.0.10"]
  },
  {
    level: 2,
    levelName: "Intermediaire",
    moduleNumber: "2.3",
    module: "Routage",
    difficulty: "Intermediaire",
    labType: "Simulateur de routage multi-routeurs",
    lessons: ["Tables de routage et metriques", "Routage statique vs dynamique", "RIP OSPF EIGRP BGP concepts", "NAT et PAT"],
    commands: ["ip route get 203.0.113.10", "traceroute 8.8.8.8", "sudo nft list ruleset", "show ip route"]
  },
  {
    level: 2,
    levelName: "Intermediaire",
    moduleNumber: "2.4",
    module: "Switching et VLANs",
    difficulty: "Intermediaire",
    labType: "Createur de VLANs interactif",
    lessons: ["Fonctionnement d'un switch et table CAM", "VLANs et segmentation", "Trunking 802.1Q", "STP Spanning Tree Protocol"],
    commands: ["bridge fdb show", "ip link add link eth0 name eth0.10 type vlan id 10", "show vlan brief", "show spanning-tree"]
  },
  {
    level: 3,
    levelName: "Avance",
    moduleNumber: "3.1",
    module: "IPv6",
    difficulty: "Avance",
    labType: "Convertisseur et calculateur IPv6",
    lessons: ["Structure et notation IPv6", "Unicast Multicast Anycast", "Autoconfiguration et NDP", "Transition IPv4 vers IPv6"],
    commands: ["ip -6 addr", "ping -6 2606:4700:4700::1111", "ip -6 neigh", "dig AAAA example.com"]
  },
  {
    level: 3,
    levelName: "Avance",
    moduleNumber: "3.2",
    module: "Securite reseau",
    difficulty: "Avance",
    labType: "Constructeur de regles firewall",
    lessons: ["Firewalls stateful vs stateless", "IDS IPS Snort Suricata", "VPN IPsec SSL TLS", "DMZ et architecture securisee"],
    commands: ["sudo nft add rule inet filter input tcp dport 443 accept", "suricata -T -c suricata.yaml", "openssl s_client -connect host:443", "ipsec status"]
  },
  {
    level: 3,
    levelName: "Avance",
    moduleNumber: "3.3",
    module: "Protocoles applicatifs",
    difficulty: "Avance",
    labType: "Simulateur de resolution DNS",
    lessons: ["HTTP HTTPS et architecture web", "DNS hierarchie resolution DNSSEC", "DHCP decouverte et allocation", "SMTP POP3 IMAP email"],
    commands: ["curl -v https://example.com", "dig +trace example.com", "journalctl -u dhcpd", "openssl s_client -starttls smtp -connect mail:25"]
  },
  {
    level: 3,
    levelName: "Avance",
    moduleNumber: "3.4",
    module: "Wi-Fi et reseaux sans fil",
    difficulty: "Avance",
    labType: "Analyseur de spectre Wi-Fi",
    lessons: ["Standards 802.11 a b g n ac ax", "Securite WEP WPA WPA2 WPA3", "Canaux et interferences", "Design Wi-Fi d'entreprise"],
    commands: ["iw dev", "nmcli dev wifi", "iwlist wlan0 scan", "ip link show wlan0"]
  },
  {
    level: 4,
    levelName: "Expert pentester",
    moduleNumber: "4.1",
    module: "Network scanning et reconnaissance",
    difficulty: "Pentest",
    labType: "Terminal Nmap interactif avec scenarios",
    lessons: ["Methodologie de pentest reseau", "Nmap mastery tous les scans", "Service enumeration et fingerprinting", "OSINT pour reconnaissance reseau"],
    commands: ["nmap -sV 10.10.10.0/28", "nmap -sS -Pn --top-ports 100 10.10.10.5", "curl -I https://lab.local", "whois example.com"]
  },
  {
    level: 4,
    levelName: "Expert pentester",
    moduleNumber: "4.2",
    module: "Exploitation de vulnerabilites reseau",
    difficulty: "Pentest",
    labType: "Environnement virtuel securise",
    lessons: ["ARP spoofing et MITM en labo", "VLAN hopping et attaques switching", "Attaques protocoles de routage", "DNS poisoning et hijacking"],
    commands: ["arp -n", "ettercap --help", "yersinia --help", "dig @10.10.10.53 lab.local"]
  },
  {
    level: 4,
    levelName: "Expert pentester",
    moduleNumber: "4.3",
    module: "Wireless hacking",
    difficulty: "Pentest",
    labType: "Simulateur d'attaques Wi-Fi",
    lessons: ["Cracking WPA WPA2 et handshake", "Evil Twin et Rogue AP", "WPS Pixie Dust Reaver", "Bluetooth et autres protocoles sans fil"],
    commands: ["airmon-ng", "airodump-ng wlan0mon", "wash -i wlan0mon", "bluetoothctl scan on"]
  },
  {
    level: 4,
    levelName: "Expert pentester",
    moduleNumber: "4.4",
    module: "Packet crafting et analysis",
    difficulty: "Pentest",
    labType: "Packet crafter interactif",
    lessons: ["Scapy pour creer des paquets", "Wireshark filtres avances", "Protocol analysis et reverse engineering", "IDS IPS evasion techniques"],
    commands: ["python3 -q", "tshark -r capture.pcap -Y 'http'", "tcpdump -nnvvXSs 0", "scapy"]
  },
  {
    level: 4,
    levelName: "Expert pentester",
    moduleNumber: "4.5",
    module: "Advanced topics",
    difficulty: "Pentest",
    labType: "Environnement de programmation reseau",
    lessons: ["SDN Software Defined Networking", "Network automation Python Ansible", "Cloud networking AWS Azure GCP", "Container networking Docker Kubernetes"],
    commands: ["ansible -m ping all", "docker network ls", "kubectl get svc -A", "aws ec2 describe-vpcs"]
  }
];

const knowledge: Record<string, { summary: string; keyPoints: string[]; mistakes: string[]; labSteps: string[]; question: QuizQuestion }> = {
  "1.1": {
    summary: "Un reseau est un systeme de machines qui partagent de l'information selon des regles communes. Le plus important au debut est de distinguer les roles: l'hote produit ou consomme, le switch relie un segment local, le routeur relie des reseaux differents, et Internet est un assemblage de reseaux autonomes.",
    keyPoints: ["Un LAN reste local et rapide, un WAN traverse des operateurs", "Une topologie decrit les liens physiques ou logiques", "Un hub repete, un switch apprend, un routeur decide"],
    mistakes: ["Confondre switch et routeur", "Croire qu'une topologie logique est toujours identique au cablage", "Diagnostiquer Internet avant de verifier le lien local"],
    labSteps: ["Place un client, un switch, un routeur et un serveur", "Teste la connectivite locale avec ping", "Observe l'adresse MAC de la passerelle avec ARP"],
    question: { type: "mcq", question: "Quel equipement apprend les adresses MAC sur un LAN ?", options: ["Hub", "Switch", "Modem", "Proxy"], answer: 1, explanation: "Le switch maintient une table CAM associant ports et adresses MAC." }
  },
  "1.2": {
    summary: "OSI est un modele de diagnostic; TCP/IP est le modele vraiment deploye. L'encapsulation ajoute des en-tetes a chaque couche: donnees applicatives, segment TCP ou datagramme UDP, paquet IP, puis trame Ethernet ou Wi-Fi.",
    keyPoints: ["Couche 2: MAC et commutation", "Couche 3: IP et routage", "Couche 4: ports TCP/UDP et sessions"],
    mistakes: ["Mettre DNS en couche 3", "Oublier que TCP n'est pas chiffre par defaut", "Chercher un probleme applicatif avant de verifier IP et route"],
    labSteps: ["Associe une panne a une couche", "Lis les ports ecoutes avec ss", "Observe la difference entre ping, curl et tcpdump"],
    question: { type: "mcq", question: "Quel element appartient surtout a la couche transport ?", options: ["Adresse MAC", "Port TCP", "Masque CIDR", "SSID"], answer: 1, explanation: "TCP et UDP utilisent des ports en couche transport." }
  },
  "1.3": {
    summary: "IPv4 identifie une interface avec 32 bits. Le masque separe la partie reseau de la partie hote. Les plages privees RFC1918 ne sont pas routees directement sur Internet et sortent souvent via NAT.",
    keyPoints: ["10.0.0.0/8, 172.16.0.0/12 et 192.168.0.0/16 sont privees", "La passerelle doit etre dans le meme sous-reseau", "Le broadcast joint tous les hotes du segment IPv4"],
    mistakes: ["Confondre adresse reseau et premiere adresse utilisable", "Mettre une passerelle hors sous-reseau", "Oublier les deux adresses reservees d'un subnet classique"],
    labSteps: ["Calcule reseau, broadcast et plage utilisable", "Compare masque /24 et /27", "Verifie la route par defaut"],
    question: { type: "calculation", question: "Quelle plage est privee RFC1918 ?", options: ["8.8.8.0/24", "192.168.1.0/24", "1.1.1.0/24", "203.0.113.0/24"], answer: 1, explanation: "192.168.0.0/16 est une plage privee." }
  },
  "2.1": {
    summary: "Le subnetting avance consiste a allouer des blocs de tailles differentes selon les besoins. VLSM evite le gaspillage; CIDR simplifie la notation; l'agregation reduit la taille des tables de routage.",
    keyPoints: ["On alloue les plus grands besoins en premier", "CIDR note le nombre de bits reseau", "Une route agregee doit couvrir des blocs contigus"],
    mistakes: ["Creer des sous-reseaux qui se chevauchent", "Oublier la croissance future", "Agreger des routes non contigues"],
    labSteps: ["Trie les besoins par nombre d'hotes", "Assigne chaque subnet sans chevauchement", "Documente reseau, broadcast, passerelle et reserve"],
    question: { type: "mcq", question: "Quelle methode limite le gaspillage d'adresses ?", options: ["VLSM", "ARP", "STP", "SMTP"], answer: 0, explanation: "VLSM adapte la taille des sous-reseaux aux besoins." }
  },
  "2.2": {
    summary: "TCP privilegie la fiabilite avec handshake, acquittements et controle de congestion. UDP privilegie la simplicite et la latence, utile pour DNS, voix, streaming et protocoles qui gerent eux-memes les pertes.",
    keyPoints: ["SYN, SYN-ACK, ACK ouvrent une session TCP", "UDP n'a pas de connexion", "Les ports identifient les services et conversations"],
    mistakes: ["Penser qu'UDP est toujours mauvais", "Confondre port ouvert et application saine", "Ignorer la latence et la perte dans un diagnostic"],
    labSteps: ["Compare ss pour TCP et UDP", "Teste un port avec nc", "Observe SYN et ACK dans une capture"],
    question: { type: "mcq", question: "Quel paquet commence le handshake TCP ?", options: ["FIN", "SYN", "RST", "ICMP"], answer: 1, explanation: "Le client initie une connexion TCP par un SYN." }
  },
  "2.3": {
    summary: "Le routage choisit le prochain saut selon la route la plus specifique et une metrique. Le routage statique est simple mais manuel; les protocoles dynamiques apprennent et recalculent selon la topologie.",
    keyPoints: ["Longest prefix match gagne", "NAT/PAT traduit adresses et parfois ports", "BGP relie des systemes autonomes"],
    mistakes: ["Oublier la route retour", "Confondre NAT source et NAT destination", "Lire uniquement la route par defaut"],
    labSteps: ["Lis une table de routage", "Teste ip route get", "Ajoute une route fictive et explique son effet"],
    question: { type: "mcq", question: "Quelle route gagne entre /16 et /24 ?", options: ["/16", "/24", "La plus ancienne", "La moins couteuse uniquement"], answer: 1, explanation: "La correspondance la plus specifique gagne." }
  },
  "2.4": {
    summary: "Le switching construit des domaines de couche 2. Les VLANs segmentent le LAN, les trunks transportent plusieurs VLANs et STP evite les boucles qui pourraient saturer le reseau.",
    keyPoints: ["La table CAM associe MAC et port", "802.1Q tague les trames sur un trunk", "STP bloque certains liens redondants"],
    mistakes: ["Mettre tous les ports dans le VLAN natif", "Oublier d'autoriser un VLAN sur un trunk", "Desactiver STP sans design solide"],
    labSteps: ["Cree VLAN admin et invite", "Relie deux switches en trunk", "Verifie les chemins redondants"],
    question: { type: "mcq", question: "Quel standard tague les VLANs sur un trunk ?", options: ["802.1Q", "802.11ax", "OSPF", "IPsec"], answer: 0, explanation: "802.1Q ajoute une balise VLAN aux trames." }
  },
  "3.1": {
    summary: "IPv6 utilise 128 bits, supprime le broadcast et introduit NDP pour la decouverte locale. L'autoconfiguration facilite l'adressage, mais impose une bonne comprehension des prefixes et types d'adresses.",
    keyPoints: ["fe80::/10 est link-local", "NDP remplace ARP", "AAAA publie une adresse IPv6 dans DNS"],
    mistakes: ["Desactiver IPv6 sans mesurer l'impact", "Confondre link-local et global unicast", "Oublier les regles firewall IPv6"],
    labSteps: ["Lis les adresses IPv6", "Teste ping -6", "Interroge un enregistrement AAAA"],
    question: { type: "mcq", question: "Quel protocole remplace ARP en IPv6 ?", options: ["NDP", "RIP", "SMTP", "WEP"], answer: 0, explanation: "Neighbor Discovery Protocol gere la decouverte locale IPv6." }
  },
  "3.2": {
    summary: "La securite reseau combine segmentation, filtrage, detection et acces chiffre. Une architecture robuste limite les flux, journalise les evenements utiles et place les services exposes dans une zone controlee.",
    keyPoints: ["Stateful suit l'etat des connexions", "IDS detecte, IPS peut bloquer", "Une DMZ isole les services publics"],
    mistakes: ["Autoriser any-any temporairement puis l'oublier", "Ne pas journaliser les refus critiques", "Confondre VPN et autorisation applicative"],
    labSteps: ["Redige une politique default deny", "Autorise HTTPS vers DMZ", "Explique les logs attendus"],
    question: { type: "mcq", question: "Quel composant peut bloquer activement un trafic suspect ?", options: ["IDS", "IPS", "Hub", "NTP"], answer: 1, explanation: "Un IPS est place en ligne et peut bloquer." }
  },
  "3.3": {
    summary: "Les protocoles applicatifs rendent le reseau utile: HTTP transporte le web, DNS traduit les noms, DHCP attribue la configuration IP, et les protocoles mail separent envoi et reception.",
    keyPoints: ["DNS est hierarchique", "DHCP suit discover offer request ack", "HTTPS ajoute TLS a HTTP"],
    mistakes: ["Accuser HTTP quand DNS echoue", "Oublier le bail DHCP", "Ne pas verifier le certificat TLS"],
    labSteps: ["Trace une resolution DNS", "Observe les en-tetes HTTP", "Simule un bail DHCP"],
    question: { type: "mcq", question: "Quel outil trace la delegation DNS ?", options: ["dig +trace", "arp -n", "ss -l", "iw dev"], answer: 0, explanation: "dig +trace suit la resolution depuis la racine." }
  },
  "3.4": {
    summary: "Le Wi-Fi partage un medium radio. Les performances dependent du standard, du signal, du canal, de la largeur de bande et de la securite. Un design d'entreprise privilegie couverture, capacite et isolation.",
    keyPoints: ["WPA3 est plus moderne que WPA2", "Les canaux 1/6/11 evitent le chevauchement en 2.4 GHz", "Le signal radio est half-duplex"],
    mistakes: ["Multiplier les AP trop puissants", "Reutiliser WEP", "Ignorer les interferences"],
    labSteps: ["Liste les SSID visibles", "Compare canal et puissance", "Propose un plan 2.4/5 GHz"],
    question: { type: "mcq", question: "Quel mecanisme est obsolete et faible ?", options: ["WEP", "WPA3", "802.1X", "AES"], answer: 0, explanation: "WEP est casse depuis longtemps et ne doit plus etre utilise." }
  },
  "4.1": {
    summary: "La reconnaissance pentest autorisee cherche a connaitre le perimetre sans perturber. Nmap aide a decouvrir hotes, ports, versions et parfois OS, mais chaque option doit respecter les limites du mandat.",
    keyPoints: ["Le scope prime sur l'outil", "La detection de version aide a prioriser", "Les resultats doivent etre confirmes"],
    mistakes: ["Scanner hors perimetre", "Confondre port ouvert et faille", "Oublier l'impact du timing"],
    labSteps: ["Definis le scope fictif", "Lance un scan de version simule", "Transforme un service expose en finding documente"],
    question: { type: "mcq", question: "Quel element est obligatoire avant un scan reel ?", options: ["Autorisation et perimetre", "Exploit public", "Compte root", "VPN anonyme"], answer: 0, explanation: "Un pentest commence par autorisation, perimetre et regles d'engagement." }
  },
  "4.2": {
    summary: "Les attaques reseau sont etudiees ici pour comprendre les risques et defenses. ARP spoofing, VLAN hopping ou DNS poisoning doivent rester en labo; le livrable attendu est l'impact, la detection et la mitigation.",
    keyPoints: ["ARP n'authentifie pas les reponses", "La configuration trunk limite le VLAN hopping", "DNSSEC reduit certains risques d'empoisonnement"],
    mistakes: ["Faire une preuve destructive", "Ne pas proposer de mitigation", "Oublier la detection reseau"],
    labSteps: ["Decris l'attaque sans viser l'externe", "Identifie les logs/alertes", "Ajoute une remediation precise"],
    question: { type: "mcq", question: "Quelle defense aide contre ARP spoofing en entreprise ?", options: ["Dynamic ARP Inspection", "POP3", "WEP", "Telnet"], answer: 0, explanation: "DAI valide les associations ARP sur switches compatibles." }
  },
  "4.3": {
    summary: "Le wireless hacking en lab analyse la capture de handshake, les points d'acces malveillants et les faiblesses WPS. L'objectif defensif est de durcir WPA, surveiller les rogue AP et eduquer les utilisateurs.",
    keyPoints: ["Un handshake seul ne donne pas le mot de passe", "Evil Twin abuse la confiance utilisateur", "WPS doit souvent etre desactive"],
    mistakes: ["Tester un Wi-Fi sans autorisation", "Croire qu'un SSID masque protege", "Sous-estimer les mots de passe faibles"],
    labSteps: ["Simule une capture de handshake", "Compare WPA2 et WPA3", "Redige une checklist d'audit"],
    question: { type: "mcq", question: "Quel controle reduit fortement le risque WPS ?", options: ["Desactiver WPS", "Masquer le SSID", "Utiliser WEP", "Changer le canal uniquement"], answer: 0, explanation: "Desactiver WPS supprime une surface d'attaque frequente." }
  },
  "4.4": {
    summary: "Le packet crafting apprend a comprendre les champs protocolaires et les signatures. Scapy et Wireshark servent a construire, filtrer et expliquer des paquets; l'evasion IDS est abordee pour mieux detecter et durcir.",
    keyPoints: ["Un filtre precis evite le bruit", "Scapy manipule les couches paquet par paquet", "L'evasion doit etre testee uniquement en lab"],
    mistakes: ["Partager une capture avec secrets", "Filtrer trop large", "Confondre anomalie et compromission"],
    labSteps: ["Ecris un filtre Wireshark", "Decris les champs d'un paquet", "Propose une signature defensive"],
    question: { type: "mcq", question: "Quel outil Python permet de fabriquer des paquets ?", options: ["Scapy", "Postfix", "BIND", "Ansible"], answer: 0, explanation: "Scapy est une bibliotheque Python de manipulation de paquets." }
  },
  "4.5": {
    summary: "Les sujets avances relient reseau et plateforme: SDN separe controle et donnees, l'automatisation rend les configurations repetables, le cloud virtualise les reseaux et les containers ajoutent une couche d'overlay.",
    keyPoints: ["L'automatisation doit etre idempotente", "Les security groups ne remplacent pas toute segmentation", "Kubernetes expose services, pods et policies"],
    mistakes: ["Changer a la main ce qui est gere par code", "Oublier les routes cloud", "Ignorer DNS et policies container"],
    labSteps: ["Modele une modification en YAML", "Liste les reseaux Docker", "Explique un flux service Kubernetes"],
    question: { type: "mcq", question: "Quelle qualite est centrale en automation reseau ?", options: ["Idempotence", "Hasard", "Broadcast public", "WEP"], answer: 0, explanation: "Une action idempotente peut etre rejouee sans effet secondaire inutile." }
  }
};

const simpleExplanations: Record<string, string> = {
  "1.1": "Un reseau, c'est simplement plusieurs machines qui savent se parler. Imagine une equipe: chaque machine a un role, le switch met les machines d'une meme piece en relation, le routeur fait passer les messages vers d'autres reseaux, et le firewall decide ce qui a le droit d'entrer ou de sortir. Avant de penser securite ou pentest, il faut savoir qui parle a qui, par quel chemin, et pourquoi.",
  "1.2": "Les modeles OSI et TCP/IP servent a ranger un probleme reseau par etapes. Si un site ne repond pas, tu ne dois pas deviner au hasard: tu verifies d'abord le lien, puis l'adresse IP, puis les ports, puis l'application. C'est une methode de diagnostic. Chaque couche ajoute une information au message, comme une enveloppe dans une autre enveloppe.",
  "1.3": "Une adresse IPv4 est l'identite d'une interface sur un reseau. Le masque dit quelle partie identifie le reseau et quelle partie identifie la machine. Si deux machines ne sont pas dans le meme reseau, elles ont besoin d'une passerelle. Beaucoup de pannes viennent d'une adresse, d'un masque ou d'une passerelle mal choisis.",
  "2.1": "Le subnetting consiste a decouper un grand bloc d'adresses en blocs plus petits et mieux organises. Dans une entreprise, tu ne mets pas les serveurs, les invites et l'administration dans le meme sac. Tu donnes a chaque zone assez d'adresses, sans gaspiller, et tu documentes clairement les plages.",
  "2.2": "La couche transport explique comment une application parle a une autre application. TCP prend le temps de verifier que la conversation est bien etablie; UDP envoie plus directement, avec moins de controle. Les ports sont les portes d'entree des services. Quand tu testes un service web, DNS ou SSH, tu testes souvent un couple protocole plus port.",
  "2.3": "Le routage, c'est le choix du prochain chemin. Une machine peut connaitre plusieurs routes, mais elle choisit la plus precise pour atteindre une destination. Si un paquet part mais ne revient pas, le probleme peut etre la route aller, la route retour, le NAT ou un filtrage sur le chemin.",
  "2.4": "Un switch connecte les machines d'un reseau local. Les VLANs permettent de separer logiquement ce reseau local en zones distinctes, meme si les cables arrivent sur les memes equipements. Un trunk transporte plusieurs VLANs entre equipements. C'est la base pour segmenter proprement un reseau d'entreprise.",
  "3.1": "IPv6 est une autre maniere d'adresser les machines, avec beaucoup plus d'adresses qu'IPv4. Il n'utilise pas exactement les memes mecanismes: ARP disparait, NDP arrive, et les adresses link-local deviennent importantes. Il ne faut pas le desactiver par reflexe; il faut apprendre a le lire et a le filtrer.",
  "3.2": "La securite reseau consiste a reduire ce qui peut circuler inutilement. Tu separes les zones, tu autorises seulement les flux necessaires, tu chiffres les acces sensibles et tu gardes des traces utiles. Un bon firewall ne remplace pas une bonne architecture, mais il impose des limites claires.",
  "3.3": "Les protocoles applicatifs sont les services que les utilisateurs voient vraiment: web, DNS, DHCP, mail. Quand ils tombent en panne, le symptome semble souvent applicatif, mais la cause peut etre DNS, IP, route, certificat ou port bloque. Le bon reflexe est de tester la chaine complete.",
  "3.4": "Le Wi-Fi est un reseau partage dans l'air. La qualite depend du signal, du canal, des interferences, du nombre de clients et de la securite choisie. Un bon reseau Wi-Fi ne se resume pas a un mot de passe fort: il faut penser couverture, capacite, isolation et standards modernes.",
  "4.1": "La reconnaissance pentest consiste a cartographier un perimetre autorise sans casser le service. Tu cherches les hotes, ports, versions et indices utiles, puis tu verifies ce que tu trouves. Un scan n'est pas une preuve de faille: c'est une observation a confirmer et a replacer dans le contexte.",
  "4.2": "Les attaques reseau etudiees ici servent a comprendre comment un mauvais design peut etre abuse. En professionnel, tu ne cherches pas seulement a reproduire une attaque: tu dois expliquer l'impact, la detection possible et la correction. Le cadre autorise et la preuve minimale sont essentiels.",
  "4.3": "Le wireless hacking en labo montre comment des faiblesses Wi-Fi peuvent etre exploitees: mots de passe faibles, WPS, points d'acces malveillants, utilisateurs trompes. Le but professionnel est de savoir auditer, durcir et surveiller, pas de tester des reseaux sans autorisation.",
  "4.4": "Le packet crafting consiste a comprendre les paquets au niveau de leurs champs. Quand tu sais lire et construire un paquet, tu comprends mieux les captures, les alertes IDS et les comportements anormaux. C'est une competence avancee, mais elle repose sur les bases: IP, ports, flags et protocoles.",
  "4.5": "Les sujets avances relient le reseau aux plateformes modernes. Dans le cloud, les containers ou l'automatisation, les memes principes restent presents: adressage, routage, filtrage, DNS et segmentation. Le niveau pro consiste a appliquer ces bases dans des environnements plus dynamiques et codes."
};

const analogies: Record<string, string> = {
  "1.1": "Pense a un immeuble de bureaux. Les personnes dans un meme etage peuvent se parler facilement: c'est le role du switch dans un LAN. Pour envoyer un courrier a un autre immeuble, il faut passer par l'accueil ou le service courrier: c'est le routeur. Le gardien qui laisse passer ou bloque certaines personnes joue le role du firewall.",
  "1.2": "Imagine l'envoi d'un colis. Le contenu est l'application, l'emballage ajoute les informations de transport, l'adresse indique la destination, puis le livreur choisit le support physique. Si le colis n'arrive pas, tu verifies chaque etape au lieu d'accuser directement le contenu.",
  "1.3": "Une adresse IP ressemble a une adresse postale. Le masque indique le quartier. Deux maisons dans le meme quartier peuvent se joindre directement; pour aller dans un autre quartier, elles passent par une route principale, la passerelle. Si le quartier est mal defini, le courrier part au mauvais endroit.",
  "2.1": "Le subnetting ressemble au decoupage d'un grand batiment en salles. Tu ne reserves pas une salle de 500 places pour une reunion de 8 personnes. Tu adaptes la taille de chaque salle au besoin, tu gardes de la place pour grandir, et tu notes clairement qui occupe quoi.",
  "2.2": "TCP ressemble a un appel telephonique ou les deux personnes confirment qu'elles s'entendent avant de parler. UDP ressemble plutot a une annonce au micro: rapide, simple, mais sans garantie que tout le monde ait bien entendu. Les ports sont les numeros de service a contacter.",
  "2.3": "Le routage fonctionne comme un GPS. Si plusieurs routes existent, il choisit celle qui correspond le mieux a la destination. Une route tres precise vers une rue gagne face a une route generale vers une ville. Si le chemin retour manque, la conversation echoue meme si l'aller fonctionne.",
  "2.4": "Les VLANs ressemblent a des badges de couleur dans une entreprise. Tout le monde peut etre dans le meme batiment, mais les badges limitent les zones accessibles. Un trunk est comme un ascenseur technique qui transporte plusieurs groupes entre les etages sans les melanger.",
  "3.1": "IPv6 ressemble a un systeme d'adresses beaucoup plus grand, comme passer de noms de rues limites a des coordonnees tres detaillees. Il donne plus d'espace, mais demande d'apprendre de nouvelles habitudes: adresses link-local, NDP, prefixes et filtrage specifique.",
  "3.2": "La securite reseau ressemble a l'organisation d'un aeroport. Tout le monde ne peut pas aller partout. Il y a des zones publiques, des zones controlees, des controles d'identite, des journaux et des portes limitees. Le but est de laisser passer le necessaire, pas tout bloquer au hasard.",
  "3.3": "DNS, DHCP et HTTP ressemblent aux services d'une ville. DNS est l'annuaire, DHCP donne une adresse temporaire, HTTP transporte les pages, TLS protege la conversation. Si un service ne marche pas, le probleme peut venir de l'annuaire, de l'adresse, de la route ou du service lui-meme.",
  "3.4": "Le Wi-Fi ressemble a une conversation dans une piece bruyante. Plus il y a de personnes, plus il faut organiser les canaux et la puissance. Parler plus fort ne regle pas toujours le probleme: parfois cela cree plus d'interferences.",
  "4.1": "La reconnaissance ressemble a faire le plan d'un batiment avant une intervention autorisee. Tu notes les portes visibles, les services ouverts et les indices, mais tu ne forces rien. Le plan sert a prioriser et a poser des hypotheses.",
  "4.2": "Etudier une attaque reseau ressemble a tester une serrure dans un atelier autorise. Le but n'est pas de casser des portes au hasard, mais de comprendre pourquoi la serrure cede, comment le voir dans les logs, et comment la remplacer ou la renforcer.",
  "4.3": "Le Wi-Fi offensif en labo ressemble a analyser comment quelqu'un peut imiter un point d'accueil officiel. La technique compte, mais le risque humain compte aussi: un utilisateur peut choisir le mauvais reseau s'il ne sait pas reconnaitre un piege.",
  "4.4": "Le packet crafting ressemble a demonter une lettre caractere par caractere pour comprendre son format. Quand tu sais construire une lettre toi-meme, tu comprends mieux pourquoi certains filtres la reconnaissent ou la ratent.",
  "4.5": "Le cloud et les containers ressemblent a une ville qui se reconstruit en permanence. Les batiments changent vite, mais les routes, les adresses, les controles d'acces et les noms restent indispensables. L'automatisation est le plan qui evite les changements manuels incoherents."
};

const realExamples: Record<string, string> = {
  "1.1": "Dans une petite entreprise, trois PC sont branches sur un switch, le switch est relie a une box ou un routeur, et un serveur de fichiers est sur le meme LAN. Si un PC ne voit pas le serveur, tu testes d'abord le cable, l'adresse IP, puis la passerelle avant d'accuser Internet.",
  "1.2": "Un utilisateur dit que l'intranet ne fonctionne plus. Tu testes le lien reseau, puis l'adresse IP, puis un ping vers la passerelle, puis le port HTTPS, puis l'application. Cette methode evite de perdre une heure sur le navigateur alors que le poste n'a plus d'adresse valide.",
  "1.3": "Un poste a l'adresse 192.168.10.50/24 avec une passerelle 192.168.20.1. Il peut croire que tout est configure, mais sa passerelle n'est pas dans son sous-reseau. Resultat: il parle peut-etre au LAN local, mais il ne sort pas correctement vers les autres reseaux.",
  "2.1": "Une PME veut separer 80 postes utilisateurs, 20 telephones IP, 12 serveurs et 30 invites Wi-Fi. Un plan propre donne des sous-reseaux differents a chaque zone, reserve de la marge, documente les passerelles et evite les plages qui se chevauchent.",
  "2.2": "Un site web ecoute sur TCP 443, DNS utilise souvent UDP 53, et SSH utilise TCP 22. Quand un service semble indisponible, tu verifies si le port est ouvert, si le protocole attendu repond, et si un firewall ne bloque pas la session.",
  "2.3": "Un serveur peut joindre Internet, mais les utilisateurs d'un autre VLAN ne peuvent pas le joindre. La cause peut etre une route absente sur le routeur, une route retour manquante sur le serveur, ou une regle firewall qui bloque seulement un sens du trafic.",
  "2.4": "Le service compta et le Wi-Fi invite arrivent sur les memes switches, mais pas dans le meme VLAN. Les ports utilisateurs sont en access VLAN 10 ou 20, tandis que le lien entre switches est en trunk. Si le VLAN 20 n'est pas autorise sur le trunk, les invites perdent la connectivite.",
  "3.1": "Un poste a une IPv4 correcte mais accede a certains services via IPv6 sans que l'equipe ne l'ait remarque. Si le firewall IPv6 est oublie, un service peut etre expose alors que la politique IPv4 semble stricte. Il faut donc verifier les deux piles.",
  "3.2": "Une DMZ contient un serveur web public. Le firewall autorise HTTPS depuis Internet vers ce serveur, mais bloque l'acces direct de la DMZ vers le LAN interne. Les logs des refus sont conserves pour detecter un comportement anormal.",
  "3.3": "Un utilisateur tape app.entreprise.local. DNS doit resoudre le nom, le poste doit avoir une IP via DHCP, la route doit mener au serveur, TLS doit presenter un certificat valide, puis HTTP doit repondre. Une panne a n'importe quelle etape casse l'experience.",
  "3.4": "Dans un open space, deux points d'acces trop proches utilisent le meme canal 2.4 GHz. Les utilisateurs ont un signal fort mais des debits faibles. Le correctif consiste a revoir les canaux, la puissance, le placement et parfois a pousser les clients vers 5 GHz ou 6 GHz.",
  "4.1": "Dans un pentest autorise, le scope indique 10.10.10.0/28. Tu lances un scan de version sur cette plage seulement, tu notes les ports 53 et 443, puis tu verifies manuellement les services avant de rediger une observation exploitable.",
  "4.2": "En labo, tu simules un ARP spoofing pour montrer qu'un poste peut recevoir du trafic qui ne lui etait pas destine. Le livrable utile explique l'impact, les signes dans les tables ARP, et les defenses comme Dynamic ARP Inspection.",
  "4.3": "Un audit Wi-Fi interne detecte WPS actif sur un ancien point d'acces. Le risque n'est pas juste theorique: WPS peut faciliter des attaques en labo. La recommandation est de desactiver WPS, renforcer WPA2/WPA3 et surveiller les points d'acces non autorises.",
  "4.4": "Une alerte IDS signale des paquets TCP suspects vers 443. En lisant les flags et le timing dans une capture, tu distingues un scan SYN d'une connexion normale. Cette lecture precise evite de classer toute anomalie comme compromission.",
  "4.5": "Une equipe de plateforme cree des VPC cloud, des security groups et des services Kubernetes via code. Si une route ou une policy est modifiee a la main, l'etat reel diverge du code. Le reseau devient difficile a auditer et a reproduire."
};

function buildQuiz(module: ModulePlan, title: string, lessonIndex: number): QuizQuestion[] {
  const info = knowledge[module.moduleNumber];
  const cleanTitle = formatTitle(title);
  return [
    {
      type: "mcq",
      question: formatSentence(`Quel est l'objectif principal de "${cleanTitle}" ?`),
      options: ["Memoriser sans pratiquer", "Comprendre le concept puis le verifier en lab", "Ignorer les commandes", "Supprimer la segmentation"],
      answer: 1,
      explanation: formatSentence("Jimmy's Lab relie toujours theorie, observation et manipulation controlee.")
    },
    {
      type: "true_false",
      question: formatSentence(`Vrai ou faux: le module ${formatTitle(module.module)} doit etre valide par des preuves reproductibles.`),
      options: ["Vrai", "Faux"],
      answer: 0,
      explanation: formatSentence("Une preuve reproductible rend le diagnostic ou le pentest utile et defensible.")
    },
    {
      type: "calculation",
      question: lessonIndex % 2 === 0 ? "Combien d'adresses utilisables contient un /29 IPv4 ?" : "Quel score minimum debloque la suite du parcours ?",
      options: lessonIndex % 2 === 0 ? ["2", "6", "8", "14"] : ["50%", "70%", "80%", "100%"],
      answer: lessonIndex % 2 === 0 ? 1 : 2,
      explanation: lessonIndex % 2 === 0 ? "Un /29 contient 8 adresses dont reseau et broadcast, donc 6 utilisables." : "Le plan demande 80% pour valider et debloquer la suite."
    },
    info.question,
    {
      type: "matching",
      question: formatSentence(`Quel piege faut-il eviter dans ${formatTitle(module.module)} ?`),
      options: [info.mistakes[0], "Documenter les preuves", "Tester dans le scope", "Valider par observation"],
      answer: 0,
      explanation: formatSentence(info.mistakes[0])
    },
    {
      type: "mcq",
      question: formatSentence(`Quelle action de lab est pertinente pour "${cleanTitle}" ?`),
      options: [info.labSteps[0], "Effacer les logs", "Scanner Internet sans autorisation", "Ignorer les resultats"],
      answer: 0,
      explanation: formatSentence(`Etape de lab recommandee: ${info.labSteps[0]}.`)
    }
  ];
}

function capitalizeFirst(value: string) {
  const trimmed = value.trim();
  return trimmed ? `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}` : trimmed;
}

function formatSentence(value: string) {
  const clean = capitalizeFirst(value.replace(/\s+/g, " "));
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function formatTitle(value: string) {
  const clean = capitalizeFirst(value.replace(/\s+/g, " "));
  return clean.replace(/\s+([?!:;])/g, "$1");
}

function buildCommandPractice(module: ModulePlan) {
  const [first, second, third, fourth] = module.commands;
  return formatSentence(
    `Commandes a tester: commence par "${first}" pour observer l'etat de base, utilise "${second}" pour confirmer une hypothese, puis compare avec "${third}" et "${fourth}". Ne lance pas une commande juste pour la lancer: avant chaque test, ecris ce que tu t'attends a voir, puis note si la sortie confirme ou contredit ton hypothese.`
  );
}

function buildCommonError(module: ModulePlan) {
  const info = knowledge[module.moduleNumber];
  return formatSentence(
    `Erreur frequente: ${info.mistakes[0]}. En pratique, cette erreur arrive quand on saute trop vite a la conclusion sans verifier les indices simples. Pour l'eviter, relis le contexte, controle l'adresse ou le service concerne, puis cherche une preuve concrete dans une commande ou une capture avant de modifier la configuration.`
  );
}

function buildGuidedDiagnostic(module: ModulePlan) {
  const info = knowledge[module.moduleNumber];
  return formatSentence(
    `Diagnostic guide: 1. decris le symptome en une phrase; 2. identifie la couche ou le service le plus probable; 3. execute "${module.commands[0]}" pour obtenir un premier indice; 4. applique l'etape "${info.labSteps[0].toLowerCase()}"; 5. compare le resultat avec le comportement attendu; 6. conclus par cause probable, preuve observee et prochaine action.`
  );
}

function buildExercise(module: ModulePlan, title: string) {
  const info = knowledge[module.moduleNumber];
  return formatSentence(
    `Exercice: pour "${title}", pars du scenario suivant: un utilisateur signale un comportement anormal lie a ${module.module.toLowerCase()}. Redige une hypothese, choisis deux commandes parmi "${module.commands.join('", "')}", execute mentalement le test, puis note l'indice qui permettrait de confirmer ou rejeter ton hypothese. Termine par une phrase de conclusion exploitable.`
  );
}

function buildCorrection(module: ModulePlan) {
  const info = knowledge[module.moduleNumber];
  return formatSentence(
    `Correction attendue: une bonne reponse commence par un symptome clair, utilise une commande d'observation avant toute modification, s'appuie sur au moins un point cle comme "${info.keyPoints[0].toLowerCase()}", evite le piege "${info.mistakes[0].toLowerCase()}", puis propose une action limitee et reversible. Si la preuve ne confirme pas l'hypothese, il faut changer d'hypothese au lieu de forcer la conclusion.`
  );
}

function buildMiniChallenge(module: ModulePlan, title: string) {
  const info = knowledge[module.moduleNumber];
  return formatSentence(
    `Mini challenge: valide "${title}" comme un ticket professionnel. Objectif: produire une preuve courte qui montre que tu comprends le concept, que tu sais l'observer avec "${module.commands[0]}", et que tu peux expliquer le resultat a un collegue junior. Bonus: ajoute une remediation ou une amelioration basee sur "${info.labSteps[info.labSteps.length - 1].toLowerCase()}".`
  );
}

function buildValidationCriteria(module: ModulePlan) {
  return formatSentence(
    `Criteres de validation: tu peux passer a la suite si tu sais expliquer le sujet sans lire la fiche, choisir la bonne commande de depart, interpreter une sortie normale et une sortie anormale, citer une erreur frequente, documenter une preuve, et obtenir au moins 80% au quiz. Si un de ces points bloque, refais le lab avant de continuer.`
  );
}

function buildTheory(module: ModulePlan, title: string): string[] {
  const info = knowledge[module.moduleNumber];
  const cleanTitle = formatTitle(title);
  return [
    `Explication simple: ${simpleExplanations[module.moduleNumber]}`,
    `Analogie: ${analogies[module.moduleNumber]}`,
    `Exemple reel: ${realExamples[module.moduleNumber]}`,
    buildCommandPractice(module),
    buildCommonError(module),
    buildGuidedDiagnostic(module),
    buildExercise(module, cleanTitle),
    buildCorrection(module),
    buildMiniChallenge(module, cleanTitle),
    buildValidationCriteria(module),
    `${cleanTitle} s'inscrit dans le niveau ${module.level} ${module.levelName}. ${info.summary}`,
    `Points cles: ${info.keyPoints.join("; ")}.`,
    `Erreurs frequentes a eviter: ${info.mistakes.join("; ")}.`,
    `Procedure de lab: ${info.labSteps.join(" -> ")}.`,
    "Preuve attendue: une capture de commande, une interpretation courte, et une conclusion qui dit ce qui fonctionne, ce qui echoue, et quelle couche ou quel controle est concerne.",
    module.level === 4
      ? "Les techniques offensives sont presentees comme simulations locales et scenarios autorises. Le travail attendu est de comprendre l'impact, produire une preuve minimale et proposer une remediation, sans viser de systeme externe."
      : "Le lab associe la theorie a un outil interactif. Note tes hypotheses, execute une commande simulee, puis compare le resultat avec le comportement attendu."
  ].map(formatSentence);
}

export const lessons: Lesson[] = plan.flatMap((module) =>
  module.lessons.map((title, index) => {
    const id = `${module.moduleNumber}.${index + 1}`;
    const cleanTitle = formatTitle(title);
    const cleanModule = formatTitle(module.module);
    return {
      id,
      level: module.level,
      levelName: module.levelName,
      moduleNumber: module.moduleNumber,
      lessonNumber: index + 1,
      title: cleanTitle,
      module: cleanModule,
      difficulty: module.difficulty,
      duration: module.level === 1 ? "15 min" : module.level === 2 ? "30 min" : module.level === 3 ? "40 min" : "55 min",
      xp: module.level * 100 + index * 25,
      resources: ["RFC 791", "RFC 8200", "Cisco Networking Basics", "OWASP Testing Guide"],
      labType: module.labType,
      objectives: [
        `Expliquer ${cleanTitle.toLowerCase()} avec un vocabulaire precis`,
        `Observer ${cleanModule.toLowerCase()} dans une topologie de lab`,
        "Produire une note personnelle avec hypothese, test et conclusion"
      ].map(formatSentence),
      theory: buildTheory(module, cleanTitle),
      commands: module.commands,
      labPrompt: formatSentence(`${module.labType}: realise le scenario, capture les observations importantes et valide par au moins deux commandes.`),
      starterCode: `lesson: "${id} - ${cleanTitle}"
module: "${cleanModule}"
objectif: "Comprendre, manipuler, documenter"
hypothese: ""
points_cles:
${knowledge[module.moduleNumber].keyPoints.map((point) => `  - "${point}"`).join("\n")}
procedure:
${knowledge[module.moduleNumber].labSteps.map((step) => `  - "${step}"`).join("\n")}
tests:
  - commande: "${module.commands[0]}"
    resultat_attendu: ""
conclusion: ""
`,
      quiz: buildQuiz(module, cleanTitle, index),
      topology: { nodes, links }
    };
  })
);

export const modules = plan.map((module) => module.module);
export const modulePlans = plan;
