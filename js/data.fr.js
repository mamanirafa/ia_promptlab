/* =========================================================
   PROMPTLAB · Contenus en FRANÇAIS
   Même structure, mêmes id et même ordre que data.js (espagnol).
   ========================================================= */

const PL_FR = {
  AGENDA: [
    { id: "inicio", nombre: "Début", min: 5 },
    { id: "m1", nombre: "Moment 1 · Laboratoire des prompts", min: 22 },
    { id: "m2", nombre: "Moment 2 · Apprendre avec l’IA", min: 23 },
    { id: "m3", nombre: "Moment 3 · Le Bassin des investisseurs IA", min: 15 },
    { id: "cierre", nombre: "Clôture et carnet de bord", min: 5 }
  ],

  /* ================= MOMENT 1 ================= */
  MISIONES: [
    { id: "ahorro", emoji: "💰", titulo: "Plan d’épargne", desc: "Tu veux mettre de l’argent de côté pour t’acheter quelque chose qui te fait envie (baskets, téléphone, voyage)." },
    { id: "feria", emoji: "🛍️", titulo: "Projet pour la fête de l’école", desc: "Ta classe va vendre quelque chose à la fête de l’école et a besoin d’une idée rentable." },
    { id: "inflacion", emoji: "📈", titulo: "Expliquer l’inflation", desc: "Tu dois expliquer à ta grand-mère ce qu’est l’inflation et pourquoi les prix augmentent." }
  ],

  RONDAS: [
    {
      id: "flash", nombre: "Prompt éclair", emoji: "⚡",
      consigna: "Écris le prompt LE PLUS COURT possible pour ta mission (8 mots maximum). Sans trop réfléchir, comme si tu écrivais à un ami.",
      maxPalabras: 8,
      pistas: "Exemple : « idées pour économiser de l’argent »"
    },
    {
      id: "receta", nombre: "Prompt avec recette", emoji: "🧪",
      consigna: "Maintenant, utilise la recette complète : RÔLE + TÂCHE + CONTEXTE + FORMAT. Remplis chaque ingrédient et regarde le compteur monter.",
      receta: true, minIngredientes: 4
    },
    {
      id: "ejemplos", nombre: "Prompt avec exemples (few shot)", emoji: "🧩",
      consigna: "Donne à l’IA 1 ou 2 EXEMPLES de ce que tu attends, pour qu’elle copie le style ou le format. Tu peux partir du prompt précédent.",
      requiere: "ejemplos",
      pistas: "Exemple : « …Je veux des conseils courts comme ceux-ci : “Mets 10 % de côté dès que tu reçois ton argent” ou “Note chaque dépense sur ton téléphone”. »"
    },
    {
      id: "pasos", nombre: "Prompt étape par étape (chaîne de pensée)", emoji: "🪜",
      consigna: "Demande à l’IA de raisonner par ÉTAPES : Étape 1…, Étape 2…, Étape 3… Ainsi, tu vois comment elle arrive à la réponse et tu peux la vérifier.",
      requiere: "pasos",
      pistas: "Exemple : « …Étape 1 : calcule combien il me faut par mois. Étape 2 : propose 3 dépenses à réduire. Étape 3 : fais un calendrier. »"
    }
  ],

  INGREDIENTES: [
    { id: "rol", nombre: "Rôle", emoji: "🎭", re: /(tu es|vous êtes|vous etes|agis comme|agissez comme|joue le rôle|en tant que|imagine que tu es)/i },
    { id: "tarea", nombre: "Tâche claire", emoji: "🎯", re: /(expliqu|prépar|prepar|crée|créez|cree|écri|ecri|rédig|redig|fais|faites|donne|liste|propos|calcul|compar|décri|decri|génèr|gener|conçoi|aide|suggèr|sugger|choisi|organis|planifi)/i },
    { id: "contexto", nombre: "Contexte", emoji: "🧭", re: /(\d|j['’]ai|je suis|\bans\b|élève|eleve|étudiant|etudiant|pour (mon|ma|mes|un|une|que)|ma grand-mère|ma classe|ma famille|ushuaia|école|ecole|lycée|budget|\$|pesos)/i },
    { id: "formato", nombre: "Format", emoji: "📋", re: /(tableau|liste|puces|points|paragraphe|mots|lignes|format|résumé|resume en|en \d|schéma|schema|emoji)/i },
    { id: "ejemplos", nombre: "Exemples", emoji: "🧩", re: /(par exemple|exemple|comme ceux-ci|comme celui-ci|comme ces|comme celle-ci|style de|du type)/i },
    { id: "pasos", nombre: "Étapes", emoji: "🪜", re: /(étape\s*\d|etape\s*\d|étape par étape|etape par etape|d['’]abord.*(ensuite|puis)|1\)|1\.)/i }
  ],

  DATOS_SENSIBLES: [
    { re: /\b\d{2}\.?\d{3}\.?\d{3}\b/, msg: "On dirait un numéro d’identité" },
    { re: /[\w.+-]+@[\w-]+\.[\w.]+/, msg: "On dirait une adresse e-mail" },
    { re: /\b(\+?(54|32))?\s?(2901|11|9|4\d{2})\s?-?\d{2,4}\s?-?\d{2,4}\b/, msg: "On dirait un numéro de téléphone" },
    { re: /mot de passe|password|code secret|code pin|iban|cbu|cvu/i, msg: "Informations bancaires ou mots de passe" },
    { re: /\b\d{1,5},?\s+(rue|avenue|av\.|boulevard|bd|chaussée|place)\s+\S+/i, msg: "On dirait une adresse" }
  ],

  /* ================= MOMENT 2 ================= */
  TEXTO: {
    titulo: "Qui décide si on te prête de l’argent ? Le score de crédit à l’ère de l’IA",
    parrafos: [
      "Quand une personne demande un prêt, une carte de crédit ou un paiement en plusieurs fois, la banque ou l’entreprise doit répondre à une question clé : cette personne pourra-t-elle rembourser l’argent ? Pour y répondre, on utilise le score de crédit, une note qui estime le risque que quelqu’un ne paie pas. Plus le score est élevé, plus le risque est faible et meilleures sont les conditions : un montant plus élevé, moins d’intérêts ou plus de mensualités.",
      "Traditionnellement, le score se calculait avec peu de variables : si la personne a un emploi déclaré, combien elle gagne, combien de dettes elle a et, surtout, son historique de paiements. En Argentine, les banques consultent la Centrale des débiteurs de la Banque centrale, où l’on voit si quelqu’un est à jour ou en retard dans ses dettes. Le problème, c’est que beaucoup de gens, comme les jeunes qui débutent ou ceux qui travaillent de manière informelle, n’ont pas d’historique. Pour le système, ils sont « invisibles » et ont du mal à obtenir un crédit.",
      "C’est là qu’intervient l’intelligence artificielle. Les entreprises financières technologiques, appelées fintech, entraînent des modèles de Machine Learning avec des milliers de cas passés étiquetés « a payé » ou « n’a pas payé ». C’est de l’apprentissage supervisé : le modèle cherche les schémas qui se répètent chez ceux qui ont remboursé et chez ceux qui ne l’ont pas fait. Elles peuvent aussi utiliser des données alternatives, comme le paiement ponctuel des factures, les mouvements d’un portefeuille numérique ou les recharges du téléphone. Ainsi, quelqu’un sans historique bancaire peut montrer qu’il est responsable avec son argent.",
      "Les avantages sont importants : des décisions en quelques minutes au lieu de plusieurs jours et plus d’inclusion financière, car des personnes qui restaient autrefois exclues peuvent obtenir un premier crédit pour étudier, lancer un projet ou acheter des outils de travail.",
      "Mais il y a aussi des risques. Si les données utilisées pour entraîner le modèle reflètent des inégalités du passé, l’IA peut les reproduire : c’est le biais algorithmique. Par exemple, elle pourrait pénaliser les habitants de certains quartiers même s’ils paient bien. Un autre problème est la « boîte noire » : certains modèles sont si complexes que même l’entreprise ne peut pas expliquer clairement pourquoi elle a refusé quelqu’un. Et il y a la vie privée : accepterais-tu qu’une application analyse tes contacts ou tes achats pour décider si tu es fiable ?",
      "C’est pourquoi l’utilisation de l’IA dans la finance a besoin de règles. En Argentine, la loi 25.326 sur la protection des données personnelles reconnaît le droit de savoir quelles données on a sur nous et de demander qu’elles soient corrigées. De nombreux spécialistes proposent aussi que chacun puisse connaître les raisons d’une décision automatique et demander qu’un être humain la réexamine.",
      "L’IA peut rendre le crédit plus rapide et plus juste, ou plus rapide et injuste. La différence dépend des données que nous utilisons, des règles que nous fixons et des questions que nous osons poser."
    ],
    ideasClave: [
      "Le score de crédit est une note qui estime le risque que quelqu’un ne rembourse pas un prêt.",
      "Le score traditionnel utilise peu de variables, surtout l’historique de paiements, et rend « invisibles » ceux qui n’ont pas d’historique.",
      "Les fintech utilisent du Machine Learning supervisé, entraîné avec des cas étiquetés « a payé / n’a pas payé ».",
      "Les données alternatives (factures, portefeuilles numériques, recharges) peuvent favoriser l’inclusion financière.",
      "Il y a des risques : biais algorithmique, manque d’explication (boîte noire) et vie privée.",
      "Il faut des règles : droit de connaître et de corriger nos données et de demander une révision humaine."
    ]
  },

  TUTORES: [
    {
      id: "socratico", emoji: "🦉", nombre: "Tuteur socratique",
      para: "Découvrir les idées principales en répondant à des questions.",
      prompt: "Agis comme un tuteur patient pour un élève de 16 ans. Je veux apprendre le texte ci-dessous, mais NE le résume PAS et ne me donne pas les réponses. Pose-moi des questions une par une, de la plus facile à la plus difficile, pour que je découvre moi-même les idées principales. Attends ma réponse avant de continuer. Si je me trompe, donne-moi un indice au lieu de la solution.\n\nTexte :\n{TEXTO}"
    },
    {
      id: "feynman", emoji: "🗣️", nombre: "Explique-le avec tes mots",
      para: "Vérifier si tu as compris en l’expliquant toi-même (technique Feynman).",
      prompt: "Je vais t’expliquer avec mes mots de quoi parle le texte ci-dessous. Ta tâche est de me dire ce que j’ai bien compris, ce qui manque et ce que j’ai confondu. NE réécris PAS toi-même toute l’explication : pose-moi une ou deux questions qui m’aident à me corriger seul.\n\nTexte :\n{TEXTO}\n\nMon explication : [écris ici ce que tu as compris]"
    },
    {
      id: "puente", emoji: "🌉", nombre: "Pont avec ma vie",
      para: "Relier le texte à des situations de tous les jours (analogies).",
      prompt: "Je suis élève du secondaire. Aide-moi à relier les idées du texte ci-dessous à des situations de ma vie quotidienne. Propose 2 analogies simples, puis demande-moi d’en inventer MOI-MÊME une troisième. Quand je te l’écris, évalue-la et dis-moi comment l’améliorer.\n\nTexte :\n{TEXTO}"
    },
    {
      id: "examen", emoji: "🎯", nombre: "Mets-moi à l’épreuve",
      para: "S’entraîner comme pour un examen oral, avec un retour.",
      prompt: "Fais-moi passer un examen oral sur le texte ci-dessous : 4 questions, une par une. Mélange des questions de mémoire et de raisonnement. Après chacune de mes réponses, donne-moi une note de 1 à 5 et explique pourquoi, mais sans me donner la réponse parfaite. À la fin, dis-moi quel thème je dois revoir.\n\nTexte :\n{TEXTO}"
    },
    {
      id: "mapa", emoji: "🗺️", nombre: "Carte mentale guidée",
      para: "Organiser les concepts et leurs liens.",
      prompt: "Je veux faire une carte conceptuelle du texte ci-dessous. NE la fais PAS toi-même : guide-moi étape par étape. D’abord, demande-moi quel est selon moi le concept central. Ensuite, aide-moi à trouver 4 ou 5 concepts liés et à choisir les mots qui les relient. Valide chaque étape avant d’avancer.\n\nTexte :\n{TEXTO}"
    },
    {
      id: "diablo", emoji: "😈", nombre: "Avocat du diable",
      para: "Développer l’esprit critique et argumenter.",
      prompt: "J’ai lu le texte ci-dessous. Propose-moi une position polémique sur le sujet (par exemple : « les banques devraient décider des crédits uniquement avec l’IA ») et débats avec moi. Remets en question mes arguments avec des questions, mais ne me dis pas quoi penser. Après 3 échanges, résume les meilleurs arguments que J’AI donnés.\n\nTexte :\n{TEXTO}"
    }
  ],

  PROMPT_TRAMPA: "Résume-moi ce texte.",

  /* ================= MOMENT 3 ================= */
  TRAGAMONEDAS: {
    problema: [
      "Les touristes ne trouvent pas où bien manger pour pas cher à Ushuaia",
      "Les élèves dépensent tout leur argent dans les premiers jours du mois",
      "Les commerces du quartier jettent la nourriture qu’ils n’arrivent pas à vendre",
      "Les personnes âgées n’osent pas utiliser le portefeuille numérique",
      "Les familles ne savent pas combien d’électricité et de gaz elles consomment en hiver",
      "Les entrepreneurs locaux ne savent pas à quel prix vendre leurs produits",
      "Les vêtements qu’on ne porte plus finissent à la poubelle",
      "Les clubs de quartier ne trouvent pas de sponsors"
    ],
    cliente: ["Élèves du secondaire", "Touristes", "Personnes âgées", "Commerces du quartier", "Entrepreneurs", "Familles"],
    superpoder: [
      { t: "Recommandation", d: "suggère des choses selon tes goûts, comme Netflix", e: "🎬" },
      { t: "Vision artificielle", d: "reconnaît des objets sur des photos", e: "📷" },
      { t: "Prédiction", d: "anticipe ce qui va se passer grâce aux données du passé", e: "🔮" },
      { t: "Chatbot", d: "discute et répond aux questions", e: "💬" },
      { t: "Regroupement", d: "trouve des groupes de personnes ou de choses semblables", e: "🧲" }
    ],
    restriccion: [
      "Budget de départ : 0 $",
      "Elle doit respecter la vie privée à 100 %",
      "Elle doit pouvoir s’expliquer en un seul message",
      "Elle doit aider l’environnement",
      "Elle doit fonctionner sur un vieux téléphone"
    ]
  },

  SOCIOS_IA: [
    {
      id: "cofundador", emoji: "🎨", nombre: "Cofondateur·rice créatif·ve",
      prompt: "Tu es le cofondateur créatif d’une start-up d’élèves. Problème : {P}. Client : {C}. Notre IA utilise {S}. Contrainte : {R}. Propose 3 noms courts et 3 slogans de moins de 8 mots. Ne choisis pas à ma place : explique en une ligne pourquoi chacun pourrait fonctionner."
    },
    {
      id: "analista", emoji: "🔐", nombre: "Analyste de données et éthique",
      prompt: "Tu es analyste de données et spécialiste en éthique. Notre start-up résout : {P}, pour {C}, avec une IA de type {S}. Fais une liste de 4 données dont l’IA aurait besoin pour fonctionner. Pour chacune, indique un risque pour la vie privée et comment le limiter grâce à la transparence et au consentement. Réponds dans un tableau."
    },
    {
      id: "inversor", emoji: "🦈", nombre: "Investisseur·se impitoyable",
      prompt: "Tu es un investisseur très exigeant dans une émission de télé pour entrepreneurs. Je te présente ma start-up :\n{CANVAS}\nSignale 3 faiblesses et pose-moi 2 questions difficiles. Sois dur mais respectueux. NE me donne PAS les solutions : je veux les trouver moi-même."
    }
  ]
};
