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
  },
  {
    id: "mission-05",
    title: "Analyse de logs web suspects",
    level: "Intermediaire",
    duration: "45 min",
    scenario:
      "Un serveur web de lab presente des pics d'erreurs 404 et quelques requetes inhabituelles. Tu dois qualifier le signal sans confondre bruit, scan et attaque confirmee.",
    scope: ["web.lab.local", "logs nginx simules", "fenetre 14:00-15:00"],
    rules: [
      "Ne pas attribuer d'intention sans preuve.",
      "Preserver les lignes de log importantes.",
      "Distinguer erreur applicative, scan opportuniste et tentative ciblee.",
      "Terminer par une mesure de detection ou de durcissement."
    ],
    skills: ["Logs", "Detection", "HTTP", "Risque", "Reporting"],
    assets: [
      "Access log nginx simule",
      "Endpoint /login",
      "Requetes 404 repetees",
      "User agents varies"
    ],
    steps: [
      {
        title: "Extraire les faits",
        objective: "Identifier les lignes utiles: IP source, URL, statut HTTP, user agent et frequence.",
        expectedEvidence: "Table courte: source, chemin, statut, volume, periode.",
        mentorHints: [
          "Commence par compter avant d'interpreter.",
          "Un 404 isole n'est pas une compromission.",
          "Regroupe par chemin et par source."
        ],
        commands: ["tshark -r capture.pcap -Y 'http'", "curl -I https://lab.local"],
        commonMistake: "Confondre beaucoup d'erreurs 404 avec une exploitation reussie.",
        validation: "Les observations sont factuelles et groupees."
      },
      {
        title: "Qualifier le comportement",
        objective: "Comparer les hypotheses: trafic normal, robot, scan, tentative d'enumeration.",
        expectedEvidence: "Hypotheses avec arguments pour et contre.",
        mentorHints: [
          "Cherche les patterns: chemins admin, extensions, repetition.",
          "Regarde le statut HTTP avec le chemin demande.",
          "Une bonne qualification reste prudente."
        ],
        commands: ["curl -v https://example.com"],
        commonMistake: "Annoncer une intrusion parce qu'un chemin sensible a ete demande.",
        validation: "Au moins deux hypotheses sont comparees."
      },
      {
        title: "Proposer une detection",
        objective: "Definir une regle simple ou un indicateur a surveiller.",
        expectedEvidence: "Signal, seuil, action et limite de faux positifs.",
        mentorHints: [
          "Une detection utile doit avoir un seuil.",
          "Evite les alertes sur chaque 404.",
          "Associe la detection a une action concrete."
        ],
        commands: ["sudo nft list ruleset"],
        commonMistake: "Bloquer trop large sans comprendre l'impact utilisateur.",
        validation: "La detection est mesurable et proportionnee."
      }
    ],
    finalReport: {
      executiveSummary:
        "Les logs web montrent un signal a qualifier. Le bon livrable separe volume, chemins touches, preuve et recommandation de surveillance.",
      technicalFindings: [
        "Les statuts HTTP et chemins demandes permettent de differencier bruit et tentative ciblee.",
        "La frequence et la repetition par source donnent le contexte.",
        "La remediation doit limiter le bruit sans casser le service."
      ],
      remediation: [
        "Mettre en place des seuils d'alerte sur chemins sensibles.",
        "Journaliser les user agents et sources repetitives.",
        "Verifier les routes admin et leur exposition."
      ]
    }
  },
  {
    id: "mission-06",
    title: "Durcissement SSH defensif",
    level: "Intermediaire",
    duration: "40 min",
    scenario:
      "Un serveur d'administration expose SSH en lab. Tu dois evaluer les risques de configuration et proposer un durcissement realiste.",
    scope: ["admin.lab.local", "port 22 simule", "configuration sshd fictive"],
    rules: [
      "Ne pas bruteforcer.",
      "Ne pas tester de mots de passe reels.",
      "Raisonner configuration, exposition et journalisation.",
      "Proposer des controles applicables par un admin."
    ],
    skills: ["SSH", "Durcissement", "Moindre privilege", "Detection", "Remediation"],
    assets: [
      "sshd_config simule",
      "Port 22 filtre ou ouvert selon scenario",
      "Extraits auth.log simules"
    ],
    steps: [
      {
        title: "Evaluer l'exposition",
        objective: "Determiner si SSH devrait etre accessible et depuis quelles sources.",
        expectedEvidence: "Source autorisee, port, filtrage attendu, justification.",
        mentorHints: [
          "Un service admin ne devrait pas etre expose partout.",
          "Le filtrage source est souvent plus important que le port.",
          "Note ce que tu ne peux pas conclure sans logs."
        ],
        commands: ["nmap -sS -Pn --top-ports 100 10.10.10.5", "sudo nft list ruleset"],
        commonMistake: "Dire que SSH est dangereux simplement parce que le port existe.",
        validation: "L'exposition est analysee avec contexte."
      },
      {
        title: "Lister les controles de durcissement",
        objective: "Identifier les options prioritaires: cles, root login, MFA, rate limiting, logs.",
        expectedEvidence: "Controle, benefice, risque residuel.",
        mentorHints: [
          "Priorise les controles qui reduisent vraiment le risque.",
          "Un changement doit rester operable.",
          "La journalisation fait partie du durcissement."
        ],
        commands: ["ss -tulpn"],
        commonMistake: "Proposer uniquement de changer le port SSH.",
        validation: "Les controles sont priorises et justifies."
      },
      {
        title: "Rediger la remediation",
        objective: "Produire une recommandation exploitable et verifiable.",
        expectedEvidence: "Plan court: config, filtrage, logs, test de verification.",
        mentorHints: [
          "Ajoute toujours un test apres changement.",
          "Evite les recommandations vagues.",
          "Precise le proprietaire probable: systeme, reseau, IAM."
        ],
        commands: ["sudo nft add rule inet filter input tcp dport 443 accept"],
        commonMistake: "Oublier comment verifier que la correction fonctionne.",
        validation: "La remediation contient une verification."
      }
    ],
    finalReport: {
      executiveSummary:
        "Le durcissement SSH vise a reduire l'exposition administrative sans bloquer l'exploitation legitime.",
      technicalFindings: [
        "L'acces SSH doit etre limite aux sources d'administration.",
        "Les cles, le blocage root et la journalisation reduisent le risque.",
        "Changer le port seul ne constitue pas une defense suffisante."
      ],
      remediation: [
        "Desactiver root login et l'authentification par mot de passe si possible.",
        "Limiter SSH par source via firewall ou VPN.",
        "Surveiller les echecs repetes et tester l'acces admin apres changement."
      ]
    }
  },
  {
    id: "mission-07",
    title: "DNS mal configure",
    level: "Avance",
    duration: "50 min",
    scenario:
      "Un domaine interne expose trop d'informations DNS en lab. Tu dois verifier les risques sans effectuer d'action intrusive.",
    scope: ["dns.lab.local", "zone lab.local", "resolveur 10.10.10.53"],
    rules: [
      "Interroger uniquement le DNS de lab.",
      "Ne pas enumerer de domaines externes.",
      "Documenter les enregistrements sensibles.",
      "Proposer une correction cote DNS et reseau."
    ],
    skills: ["DNS", "Enumeration", "Risque", "Remediation", "Reporting"],
    assets: [
      "Zone lab.local simulee",
      "Resolveur autorise 10.10.10.53",
      "Enregistrements A, MX et TXT fictifs"
    ],
    steps: [
      {
        title: "Verifier la resolution autorisee",
        objective: "Confirmer les reponses DNS utiles sans sortir du scope.",
        expectedEvidence: "Nom, type d'enregistrement, valeur et interpretation.",
        mentorHints: [
          "Commence par les noms explicitement autorises.",
          "DNS donne des indices, pas des conclusions finales.",
          "Note les TTL et types de reponse si disponibles."
        ],
        commands: ["dig @10.10.10.53 lab.local", "dig AAAA example.com"],
        commonMistake: "Transformer une enumeration DNS en scan hors scope.",
        validation: "Les requetes restent dans le perimetre."
      },
      {
        title: "Chercher les informations sensibles",
        objective: "Identifier ce qui pourrait aider un attaquant: noms internes, roles, environnements.",
        expectedEvidence: "Liste des informations exposees et impact potentiel.",
        mentorHints: [
          "Un nom de machine peut reveler un role.",
          "Un TXT peut exposer une configuration.",
          "Le risque depend de la sensibilite des informations."
        ],
        commands: ["dig +trace example.com", "dig @10.10.10.53 lab.local"],
        commonMistake: "Confondre information visible et faille critique.",
        validation: "L'impact est proportionne aux donnees exposees."
      },
      {
        title: "Recommander la correction",
        objective: "Proposer une hygiene DNS: split-horizon, limitation, revue de zone.",
        expectedEvidence: "Mesures DNS et controle de verification.",
        mentorHints: [
          "La correction peut etre organisationnelle et technique.",
          "Une revue de zone reguliere evite l'accumulation.",
          "Pense exposition interne vs externe."
        ],
        commands: ["sudo nft list ruleset"],
        commonMistake: "Supprimer des enregistrements sans comprendre les dependances.",
        validation: "La remediation preserve le service legitime."
      }
    ],
    finalReport: {
      executiveSummary:
        "Une mauvaise hygiene DNS peut exposer des informations d'architecture utiles a la reconnaissance.",
      technicalFindings: [
        "Les enregistrements DNS doivent etre limites aux besoins reels.",
        "Les noms internes et roles techniques peuvent augmenter la surface d'information.",
        "La correction doit preserver la resolution necessaire."
      ],
      remediation: [
        "Mettre en place split-horizon si necessaire.",
        "Limiter les transferts de zone et l'acces aux resolveurs internes.",
        "Revoir periodiquement les enregistrements sensibles."
      ]
    }
  },
  {
    id: "mission-08",
    title: "Firewall trop permissif",
    level: "Avance",
    duration: "55 min",
    scenario:
      "Une regle temporaire semble avoir ouvert trop largement la DMZ. Tu dois analyser les flux et proposer une regle plus stricte.",
    scope: ["Firewall LAB-FW", "DMZ_WEB", "VLAN 20 GUEST", "VLAN 30 SERVERS"],
    rules: [
      "Analyser les flux avant de corriger.",
      "Ne jamais proposer allow any.",
      "Justifier chaque exception.",
      "Inclure un plan de retour arriere."
    ],
    skills: ["Firewall", "Moindre privilege", "VLAN", "Routage", "Remediation"],
    assets: [
      "Ruleset nft simule",
      "Matrice de flux attendue",
      "Zones LAN, GUEST, SERVERS, DMZ"
    ],
    steps: [
      {
        title: "Lire la politique actuelle",
        objective: "Identifier la politique par defaut et les exceptions trop larges.",
        expectedEvidence: "Regle suspecte, source, destination, service, action.",
        mentorHints: [
          "Lis la politique par defaut avant les exceptions.",
          "Une regle large peut masquer plusieurs besoins differents.",
          "Cherche source, destination et service."
        ],
        commands: ["sudo nft list ruleset", "show vlan brief"],
        commonMistake: "Corriger une regle sans comprendre le besoin metier.",
        validation: "La regle suspecte est decrite precisement."
      },
      {
        title: "Construire une matrice cible",
        objective: "Definir les flux qui doivent rester autorises apres correction.",
        expectedEvidence: "Matrice source -> destination -> service -> decision.",
        mentorHints: [
          "Une matrice evite les exceptions implicites.",
          "Chaque flux doit avoir un proprietaire ou un besoin.",
          "Documente aussi les flux refuses."
        ],
        commands: ["ip route", "ip route get 203.0.113.10"],
        commonMistake: "Se concentrer uniquement sur ce qui doit etre autorise.",
        validation: "La matrice contient autorisations et refus."
      },
      {
        title: "Proposer une regle minimale",
        objective: "Remplacer la permissivite par une regle ciblee et testable.",
        expectedEvidence: "Regle proposee, justification, test, rollback.",
        mentorHints: [
          "La regle doit etre lisible et testable.",
          "Le rollback est une preuve de maturite operationnelle.",
          "Ajoute du logging temporaire si utile."
        ],
        commands: ["sudo nft add rule inet filter input tcp dport 443 accept"],
        commonMistake: "Remplacer une regle large par plusieurs regles toujours trop larges.",
        validation: "La correction applique le moindre privilege."
      }
    ],
    finalReport: {
      executiveSummary:
        "Un firewall trop permissif augmente le risque de mouvement lateral et d'exposition involontaire.",
      technicalFindings: [
        "Les exceptions doivent etre limitees par source, destination et service.",
        "Les flux refuses sont aussi importants que les flux autorises.",
        "Un plan de rollback limite le risque operationnel."
      ],
      remediation: [
        "Remplacer les regles larges par des flux documentes.",
        "Activer une journalisation temporaire pendant la verification.",
        "Revoir les regles temporaires avec une date d'expiration."
      ]
    }
  },
  {
    id: "mission-09",
    title: "Service interne expose",
    level: "Pentest encadre",
    duration: "55 min",
    scenario:
      "Un service prevu pour le reseau interne apparait accessible depuis une zone moins fiable. Tu dois confirmer l'exposition et expliquer l'impact sans exploitation.",
    scope: ["10.10.10.0/28", "service interne simule", "zones GUEST et DMZ"],
    rules: [
      "Ne pas exploiter le service.",
      "Verifier uniquement l'accessibilite et les bannieres.",
      "Documenter l'impact metier possible.",
      "Proposer une segmentation corrigee."
    ],
    skills: ["Enumeration", "Scope", "Risque", "Firewall", "Reporting"],
    assets: [
      "Banniere service simulee",
      "Topologie zones",
      "Ruleset de filtrage"
    ],
    steps: [
      {
        title: "Confirmer l'accessibilite",
        objective: "Verifier si le service repond depuis une zone non prevue.",
        expectedEvidence: "Source, destination, port, reponse observee.",
        mentorHints: [
          "Accessibilite ne veut pas dire exploitation.",
          "La source du test est essentielle.",
          "Une banniere peut suffire comme preuve d'exposition."
        ],
        commands: ["nc -vz 10.0.0.10 443", "nmap -sV 10.10.10.0/28"],
        commonMistake: "Aller plus loin que necessaire pour prouver l'exposition.",
        validation: "La preuve montre uniquement l'exposition."
      },
      {
        title: "Analyser l'impact",
        objective: "Expliquer ce que cette exposition permettrait ou faciliterait.",
        expectedEvidence: "Impact technique et impact metier plausible.",
        mentorHints: [
          "Reste conditionnel si tu n'as pas teste l'exploitation.",
          "Relie le service a une fonction metier.",
          "Priorise selon zone source et sensibilite."
        ],
        commands: ["curl -I http://10.0.20.10", "ss -ant"],
        commonMistake: "Ecrire une criticite haute sans contexte.",
        validation: "L'impact est nuance et justifie."
      },
      {
        title: "Recommander la segmentation",
        objective: "Proposer une correction reseau qui bloque l'exposition non necessaire.",
        expectedEvidence: "Flux a bloquer, flux a conserver, test de verification.",
        mentorHints: [
          "Corrige le chemin, pas seulement le symptome.",
          "Garde les flux legitimes.",
          "Prevois une verification apres changement."
        ],
        commands: ["sudo nft list ruleset", "show vlan brief"],
        commonMistake: "Bloquer le service pour tout le monde sans analyse.",
        validation: "La segmentation cible la zone non fiable."
      }
    ],
    finalReport: {
      executiveSummary:
        "L'exposition d'un service interne a une zone moins fiable augmente le risque d'enumeration et d'abus futur.",
      technicalFindings: [
        "La preuve doit montrer accessibilite, source et destination.",
        "L'impact depend du role du service et de la zone source.",
        "La segmentation doit bloquer le chemin non legitime."
      ],
      remediation: [
        "Restreindre le service aux zones autorisees.",
        "Mettre a jour la matrice de flux.",
        "Verifier apres changement depuis chaque zone."
      ]
    }
  },
  {
    id: "mission-10",
    title: "Incident blue team simule",
    level: "Pentest encadre",
    duration: "65 min",
    scenario:
      "Une alerte combine DNS inhabituel, connexions web et tentative d'acces admin. Tu dois conduire une mini investigation et produire une decision proportionnee.",
    scope: ["logs DNS simules", "logs web simules", "auth.log simule", "client 10.42.0.24"],
    rules: [
      "Preserver les faits avant decision.",
      "Ne pas conclure incident majeur sans correlation.",
      "Proposer containment proportionne.",
      "Inclure les limites de l'analyse."
    ],
    skills: ["Detection", "Logs", "Communication", "Risque", "Reporting"],
    assets: [
      "Evenements DNS",
      "Requetes web",
      "Tentatives SSH",
      "Chronologie fictive"
    ],
    steps: [
      {
        title: "Construire la chronologie",
        objective: "Ordonner les evenements par heure, source et systeme concerne.",
        expectedEvidence: "Timeline courte avec source, evenement et preuve.",
        mentorHints: [
          "La chronologie evite les conclusions trop rapides.",
          "Regroupe les evenements par source.",
          "Note les trous dans les donnees."
        ],
        commands: ["dig @10.10.10.53 lab.local", "tshark -r capture.pcap -Y 'http'"],
        commonMistake: "Analyser chaque log separement sans correlation.",
        validation: "La timeline relie au moins deux sources de logs."
      },
      {
        title: "Qualifier la gravite",
        objective: "Determiner si le signal justifie surveillance, containment ou escalation.",
        expectedEvidence: "Gravite, justification, incertitudes.",
        mentorHints: [
          "Une bonne decision inclut les incertitudes.",
          "Containment ne veut pas toujours dire coupure totale.",
          "La gravite depend des actifs touches."
        ],
        commands: ["ss -tulpn", "sudo nft list ruleset"],
        commonMistake: "Escalader au niveau maximum sans preuve de compromission.",
        validation: "La gravite est argumentee et proportionnee."
      },
      {
        title: "Proposer le plan de reponse",
        objective: "Definir actions immediates, verification et suivi.",
        expectedEvidence: "Actions a 1h, 24h, 7j avec proprietaire probable.",
        mentorHints: [
          "Un plan de reponse doit etre executable.",
          "Separe containment, eradication et amelioration.",
          "Ajoute un critere de retour a la normale."
        ],
        commands: ["sudo nft add rule inet filter input tcp dport 443 accept"],
        commonMistake: "Faire une liste technique sans priorite temporelle.",
        validation: "Le plan est priorise dans le temps."
      }
    ],
    finalReport: {
      executiveSummary:
        "Une investigation blue team efficace correle les signaux, qualifie la gravite et propose une reponse proportionnee.",
      technicalFindings: [
        "La chronologie est la base de la qualification.",
        "La correlation multi-sources reduit les faux positifs.",
        "Le plan de reponse doit inclure actions immediates et suivi."
      ],
      remediation: [
        "Centraliser les logs DNS, web et authentification.",
        "Definir des seuils et procedures d'escalade.",
        "Tester regulierement les plans de reponse."
      ]
    }
  }
];
