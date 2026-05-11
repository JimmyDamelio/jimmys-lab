import type { Mission } from "../types";

export const missions: Mission[] = [
  {
    id: "mission-01",
    title: "Cartographie initiale d'une PME",
    level: "Fondation",
    duration: "35 min",
    scenario:
      "Une PME vient de deplacer son serveur web dans une petite DMZ. Ton role est de produire un inventaire clair sans sortir du perimetre autorise.",
    scope: ["10.10.10.0/28", "lab.local", "web.lab.local"],
    rules: [
      "Ne tester que les adresses du scope.",
      "Limiter les scans aux ports courants dans ce scenario.",
      "Documenter chaque conclusion avec une preuve courte.",
      "Ne jamais confondre service expose et vulnerabilite exploitable."
    ],
    skills: ["Scope", "Reconnaissance", "Enumeration", "Lecture Nmap", "Rapport"],
    assets: [
      "Topologie: LAN -> Firewall -> DMZ",
      "Serveur cible simule: 10.10.10.5",
      "Sorties Nmap et DNS simulees dans le terminal"
    ],
    steps: [
      {
        title: "Confirmer le perimetre",
        objective: "Reformuler ce qui est autorise avant toute action technique.",
        expectedEvidence: "Une phrase qui liste reseaux, domaines et limites.",
        mentorHints: [
          "Commence comme dans une mission reelle: le scope decide tout.",
          "Si une cible n'est pas nommee, elle n'existe pas pour ce test.",
          "Ecris aussi ce que tu ne feras pas."
        ],
        commands: ["scope: 10.10.10.0/28, lab.local", "dig @10.10.10.53 lab.local"],
        commonMistake: "Scanner un reseau voisin parce qu'il repond au ping.",
        validation: "Le scope est explicite et les limites sont notees."
      },
      {
        title: "Identifier les services",
        objective: "Lister les ports ouverts et la fonction probable de chaque service.",
        expectedEvidence: "Ports, protocoles, versions et interpretation.",
        mentorHints: [
          "Un port ouvert est un fait, pas encore une faille.",
          "Lis la version seulement comme une piste.",
          "Cherche d'abord DNS et HTTPS: ce sont les signaux du scenario."
        ],
        commands: ["nmap -sV 10.10.10.0/28", "curl -I https://lab.local"],
        commonMistake: "Conclure qu'un service est vulnerable sans contexte ni preuve.",
        validation: "Chaque service a une hypothese fonctionnelle."
      },
      {
        title: "Prioriser les controles",
        objective: "Decider quoi verifier ensuite sans augmenter inutilement l'agressivite.",
        expectedEvidence: "Une priorite justifiee: TLS, DNS, filtrage ou exposition web.",
        mentorHints: [
          "La meilleure prochaine action est souvent une verification douce.",
          "Une bonne priorisation explique le risque metier.",
          "Associe chaque test a une question precise."
        ],
        commands: ["openssl s_client -connect lab.local:443", "dig @10.10.10.53 lab.local"],
        commonMistake: "Lancer un scan agressif avant d'avoir formule une hypothese.",
        validation: "La prochaine action est justifiee par un risque plausible."
      }
    ],
    finalReport: {
      executiveSummary:
        "Le perimetre expose principalement un service HTTPS et un service DNS simules. Aucun impact ne doit etre annonce sans preuve technique supplementaire.",
      technicalFindings: [
        "10.10.10.5 expose HTTPS et DNS dans la DMZ.",
        "Les tests restent non destructifs et limites au scope.",
        "La priorite est de verifier configuration TLS, enregistrements DNS et filtrage firewall."
      ],
      remediation: [
        "Maintenir une liste d'exposition validee par l'equipe systeme.",
        "Limiter DNS aux usages necessaires et journaliser les requetes anormales.",
        "Revoir les regles firewall DMZ apres chaque changement d'architecture."
      ]
    }
  },
  {
    id: "mission-02",
    title: "Segmentation VLAN et acces DMZ",
    level: "Intermediaire",
    duration: "45 min",
    scenario:
      "Un reseau invite semble pouvoir joindre des ressources internes. Tu dois analyser la segmentation et proposer une correction defensible.",
    scope: ["VLAN 20 GUEST", "VLAN 30 SERVERS", "Firewall LAB-FW"],
    rules: [
      "Raisonner sur les flux autorises avant les commandes.",
      "Ne pas proposer de regle 'allow any'.",
      "Produire une preuve par flux: source, destination, service, decision.",
      "Inclure une remediation exploitable par un admin."
    ],
    skills: ["VLAN", "Routage", "Firewall", "Moindre privilege", "Remediation"],
    assets: [
      "VLAN 20: invites",
      "VLAN 30: serveurs internes",
      "DMZ_WEB: service HTTPS public"
    ],
    steps: [
      {
        title: "Classifier les zones",
        objective: "Identifier les roles des VLAN et le niveau de confiance associe.",
        expectedEvidence: "Table zone, role, niveau de confiance, flux attendus.",
        mentorHints: [
          "Un VLAN n'est utile que si les flux inter-VLAN sont controles.",
          "Commence par nommer les zones comme un firewall les verrait.",
          "Le reseau invite doit etre traite comme non fiable."
        ],
        commands: ["show vlan brief", "ip route"],
        commonMistake: "Croire que deux VLAN suffisent sans filtrage L3.",
        validation: "Chaque zone a un role et une confiance clairement definis."
      },
      {
        title: "Tester les chemins",
        objective: "Verifier quels flux devraient etre autorises ou bloques.",
        expectedEvidence: "Matrice source -> destination -> service -> decision.",
        mentorHints: [
          "Pense en matrice de flux, pas en liste de machines.",
          "La DMZ peut etre joignable depuis certains reseaux, pas forcement depuis tous.",
          "Documente aussi les flux bloques: c'est une preuve de controle."
        ],
        commands: ["ip route get 203.0.113.10", "sudo nft list ruleset"],
        commonMistake: "Tester seulement ce qui marche et oublier ce qui doit echouer.",
        validation: "La matrice contient au moins un flux autorise et un flux bloque."
      },
      {
        title: "Proposer la correction",
        objective: "Ecrire une regle de filtrage minimale et comprehensible.",
        expectedEvidence: "Regle source/destination/service/action plus justification.",
        mentorHints: [
          "Une bonne regle est lisible six mois plus tard.",
          "Le deny implicite protege mieux qu'une longue liste permissive.",
          "Ajoute du logging seulement la ou il aide l'exploitation."
        ],
        commands: ["sudo nft add rule inet filter input tcp dport 443 accept"],
        commonMistake: "Corriger avec une regle trop large pour gagner du temps.",
        validation: "La correction applique le principe du moindre privilege."
      }
    ],
    finalReport: {
      executiveSummary:
        "La segmentation doit etre validee par une matrice de flux. Le reseau invite ne doit disposer que d'acces explicitement justifies.",
      technicalFindings: [
        "Les VLAN separent les domaines L2, mais le routage inter-VLAN doit etre filtre.",
        "Les flux invites vers ressources internes doivent etre bloques par defaut.",
        "Les exceptions doivent etre limitees au service, a la destination et au besoin metier."
      ],
      remediation: [
        "Appliquer une politique deny par defaut entre zones.",
        "Autoriser uniquement les flux documentes.",
        "Ajouter une revue periodique des regles firewall et des VLAN trunks."
      ]
    }
  },
  {
    id: "mission-03",
    title: "Analyse d'un signal DNS suspect",
    level: "Avance",
    duration: "50 min",
    scenario:
      "L'equipe blue team observe des requetes DNS inhabituelles. Tu dois analyser sans paniquer, separer hypothese et preuve, puis recommander une action.",
    scope: ["dns.lab.local", "logs DNS simules", "client 10.42.0.24"],
    rules: [
      "Ne pas qualifier d'incident sans preuve suffisante.",
      "Preserver les observations brutes.",
      "Chercher une explication normale avant une hypothese offensive.",
      "Terminer par une action defensive mesurable."
    ],
    skills: ["DNS", "Logs", "Hypotheses", "Detection", "Communication"],
    assets: [
      "Resolveur DNS: 10.10.10.53",
      "Client: 10.42.0.24",
      "Domaines de test: lab.local, updates.lab.local"
    ],
    steps: [
      {
        title: "Preserver les faits",
        objective: "Lister les observations sans interpretation prematuree.",
        expectedEvidence: "Horodatage, client, domaine, type de requete, frequence.",
        mentorHints: [
          "Un bon analyste separe toujours fait et hypothese.",
          "Commence par ce qui est observable.",
          "La frequence peut etre plus importante que le domaine seul."
        ],
        commands: ["dig @10.10.10.53 lab.local", "dig +trace example.com"],
        commonMistake: "Dire 'exfiltration' des la premiere requete inhabituelle.",
        validation: "Les faits sont notes sans vocabulaire alarmiste."
      },
      {
        title: "Formuler les hypotheses",
        objective: "Comparer au moins deux hypotheses: activite normale, erreur de config, comportement suspect.",
        expectedEvidence: "Hypotheses classees avec preuve pour et contre.",
        mentorHints: [
          "Une hypothese faible est acceptable si elle est marquee comme faible.",
          "Cherche ce qui pourrait refuter ton idee.",
          "Plusieurs petites preuves valent mieux qu'un mot impressionnant."
        ],
        commands: ["ss -tulpn", "curl -I https://lab.local"],
        commonMistake: "Chercher seulement les indices qui confirment l'hypothese preferee.",
        validation: "Au moins deux hypotheses sont comparees."
      },
      {
        title: "Recommander une action",
        objective: "Proposer une action de containment ou de surveillance proportionnee.",
        expectedEvidence: "Action, benefice, risque operationnel, critere de succes.",
        mentorHints: [
          "Une action defensive doit pouvoir etre mesuree.",
          "Bloquer trop large peut casser le metier.",
          "La surveillance peut etre la bonne premiere reponse."
        ],
        commands: ["sudo nft list ruleset"],
        commonMistake: "Bloquer tout DNS sans mesurer l'impact.",
        validation: "La recommandation est proportionnee et mesurable."
      }
    ],
    finalReport: {
      executiveSummary:
        "Les requetes DNS inhabituelles doivent etre traitees comme un signal a qualifier, pas comme une conclusion automatique.",
      technicalFindings: [
        "Les observations doivent inclure client, domaine, type et frequence.",
        "Les hypotheses normales et suspectes doivent etre comparees.",
        "La reponse doit commencer par journalisation, limitation ciblee ou verification endpoint."
      ],
      remediation: [
        "Activer une journalisation DNS exploitable.",
        "Definir des seuils d'alerte par volume et type de domaine.",
        "Limiter les clients a un resolveur interne controle."
      ]
    }
  },
  {
    id: "mission-04",
    title: "Mini rapport de pentest reseau",
    level: "Pentest encadre",
    duration: "60 min",
    scenario:
      "Tu as termine une reconnaissance autorisee. L'objectif n'est plus de trouver plus, mais d'ecrire un rapport clair, utile et defensible.",
    scope: ["Resultats des missions precedentes", "Rapport client fictif", "Remediation reseau"],
    rules: [
      "Aucune conclusion sans preuve.",
      "Aucun jargon inutile dans le resume executif.",
      "Chaque risque doit avoir un impact et une correction.",
      "Le rapport doit aider quelqu'un a agir."
    ],
    skills: ["Reporting", "Risque", "Impact", "Remediation", "Communication"],
    assets: [
      "Inventaire DMZ",
      "Matrice de flux",
      "Observations DNS",
      "Modele de rapport integre"
    ],
    steps: [
      {
        title: "Rediger le resume executif",
        objective: "Expliquer le risque en langage simple pour un responsable non technique.",
        expectedEvidence: "3 a 5 phrases: contexte, exposition, risque, priorite.",
        mentorHints: [
          "Le resume executif ne doit pas ressembler a une sortie de terminal.",
          "Parle d'impact, pas seulement de ports.",
          "Evite les certitudes si la preuve est incomplete."
        ],
        commands: ["nmap -sV 10.10.10.0/28"],
        commonMistake: "Coller une sortie Nmap comme conclusion principale.",
        validation: "Un non-technicien peut comprendre quoi faire ensuite."
      },
      {
        title: "Structurer une finding",
        objective: "Construire une observation technique complete.",
        expectedEvidence: "Titre, severite, preuve, impact, remediation.",
        mentorHints: [
          "Le titre doit decrire le probleme, pas l'outil utilise.",
          "La preuve doit etre courte et reproductible.",
          "La remediation doit etre actionnable."
        ],
        commands: ["curl -I https://lab.local", "openssl s_client -connect lab.local:443"],
        commonMistake: "Mettre une severite haute parce que le sujet semble technique.",
        validation: "La finding contient preuve, impact et correction."
      },
      {
        title: "Finaliser le plan d'action",
        objective: "Classer les corrections par priorite et effort.",
        expectedEvidence: "Quick wins, actions moyen terme, controles recurrents.",
        mentorHints: [
          "Un bon rapport donne un ordre de bataille.",
          "Les quick wins doivent etre realistes.",
          "Ajoute un controle de verification apres correction."
        ],
        commands: ["sudo nft list ruleset", "show vlan brief"],
        commonMistake: "Lister des recommandations generiques sans priorisation.",
        validation: "Le plan d'action est priorise et verifiable."
      }
    ],
    finalReport: {
      executiveSummary:
        "Le rapport transforme les preuves techniques en decisions. Il doit etre clair, proportionne et directement exploitable.",
      technicalFindings: [
        "Chaque finding doit contenir un fait observable, une analyse et un impact.",
        "La severite depend du contexte, pas seulement du nom du service.",
        "Les recommandations doivent etre testables apres correction."
      ],
      remediation: [
        "Classer les actions par risque et facilite.",
        "Assigner un proprietaire pour chaque correction.",
        "Planifier une verification apres changement."
      ]
    }
  }
];
