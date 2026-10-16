/* =========================================================
   PROMPTLAB · Content in ENGLISH
   Same structure, same ids and same order as data.js (Spanish).
   ========================================================= */

const PL_EN = {
  AGENDA: [
    { id: "inicio", nombre: "Start", min: 5 },
    { id: "m1", nombre: "Part 1 · Prompt Lab", min: 22 },
    { id: "m2", nombre: "Part 2 · Learning with AI", min: 23 },
    { id: "m3", nombre: "Part 3 · AI Investor Tank", min: 15 },
    { id: "cierre", nombre: "Wrap-up and logbook", min: 5 }
  ],

  /* ================= PART 1 ================= */
  MISIONES: [
    { id: "ahorro", emoji: "💰", titulo: "Savings plan", desc: "You want to save money to buy something you really want (sneakers, a phone, a trip)." },
    { id: "feria", emoji: "🛍️", titulo: "School fair business", desc: "Your class is going to sell something at the school fair and needs a profitable idea." },
    { id: "inflacion", emoji: "📈", titulo: "Explain inflation", desc: "You have to explain to your grandmother what inflation is and why prices go up." }
  ],

  RONDAS: [
    {
      id: "flash", nombre: "Flash prompt", emoji: "⚡",
      consigna: "Write the SHORTEST possible prompt for your mission (8 words max). Don’t overthink it, write it like a text to a friend.",
      maxPalabras: 8,
      pistas: "Example: “ideas to save money”"
    },
    {
      id: "receta", nombre: "Recipe prompt", emoji: "🧪",
      consigna: "Now use the full recipe: ROLE + TASK + CONTEXT + FORMAT. Fill in each ingredient and watch the meter go up.",
      receta: true, minIngredientes: 4
    },
    {
      id: "ejemplos", nombre: "Prompt with examples (few shot)", emoji: "🧩",
      consigna: "Give the AI 1 or 2 EXAMPLES of what you expect, so it copies the style or format. You can start from your previous prompt.",
      requiere: "ejemplos",
      pistas: "Example: “…I want short tips like these: ‘Save 10% as soon as you get paid’ or ‘Write down every expense on your phone’.”"
    },
    {
      id: "pasos", nombre: "Step-by-step prompt (chain of thought)", emoji: "🪜",
      consigna: "Ask the AI to reason in STEPS: Step 1…, Step 2…, Step 3… That way you can see how it reaches the answer and check it.",
      requiere: "pasos",
      pistas: "Example: “…Step 1: work out how much I need per month. Step 2: suggest 3 expenses to cut. Step 3: make a calendar.”"
    }
  ],

  INGREDIENTES: [
    { id: "rol", nombre: "Role", emoji: "🎭", re: /\b(you are|you're|act as|acting as|pretend (that )?you are|as an? (expert|teacher|advisor|adviser|economist|tutor|coach|specialist))/i },
    { id: "tarea", nombre: "Clear task", emoji: "🎯", re: /\b(explain|create|make|write|draft|give|list|propose|suggest|calculate|compare|describe|generate|design|help|choose|organi[sz]e|plan|build|prepare)/i },
    { id: "contexto", nombre: "Context", emoji: "🧭", re: /(\d|\bi have\b|\bi'm\b|\bi am\b|years old|student|for (my|a|an|the)\b|my (grandma|grandmother|class|family)|ushuaia|school|budget|\$|pesos)/i },
    { id: "formato", nombre: "Format", emoji: "📋", re: /(table|list|bullet|points|paragraph|words|lines|format|summary|in \d|outline|chart|emoji)/i },
    { id: "ejemplos", nombre: "Examples", emoji: "🧩", re: /(for example|e\.g\.|example|like these|like this one|such as|in the style of)/i },
    { id: "pasos", nombre: "Steps", emoji: "🪜", re: /(step\s*\d|step by step|first.*(then|next)|1\)|1\.)/i }
  ],

  DATOS_SENSIBLES: [
    { re: /\b\d{2}\.?\d{3}\.?\d{3}\b/, msg: "Looks like an ID number" },
    { re: /[\w.+-]+@[\w-]+\.[\w.]+/, msg: "Looks like an email address" },
    { re: /\b(\+?(54|44|1))?\s?(2901|11|9|\d{3})\s?-?\d{3,4}\s?-?\d{4}\b/, msg: "Looks like a phone number" },
    { re: /password|pin number|pin code|bank account|iban|cbu|cvu/i, msg: "Bank details or passwords" },
    { re: /\b\d{1,5}\s+\S+\s+(street|st\.|avenue|ave\.|road|rd\.|lane)\b/i, msg: "Looks like an address" }
  ],

  /* ================= PART 2 ================= */
  TEXTO: {
    titulo: "Who decides whether you get a loan? Credit scoring in the age of AI",
    parrafos: [
      "When someone applies for a loan, a credit card or to pay in installments, the bank or company has to answer one key question: will this person be able to pay the money back? To answer it, they use a credit score, a number that estimates the risk that someone won’t pay. The higher the score, the lower the risk and the better the conditions: a larger amount, less interest or more installments.",
      "Traditionally, scores were calculated with just a few variables: whether the person has a formal job, how much they earn, how much debt they have and, above all, their payment history. In Argentina, banks check the Central Bank’s Debtors Registry, which shows whether someone is up to date or behind on their debts. The problem is that many people, like young people who are just starting out or those who work informally, have no history. To the system they are “invisible”, and it’s hard for them to get credit.",
      "This is where artificial intelligence comes in. Financial technology companies, known as fintechs, train Machine Learning models with thousands of past cases labeled “paid” or “didn’t pay”. This is supervised learning: the model looks for patterns that repeat among those who paid and those who didn’t. They can also use alternative data, such as paying bills on time, activity in a digital wallet or phone top-ups. That way, someone with no banking history can show that they are responsible with money.",
      "The benefits are important: decisions in minutes instead of days, and more financial inclusion, because people who used to be left out can get a first loan to study, start a business or buy work tools.",
      "But there are also risks. If the data used to train the model reflects past inequalities, the AI can repeat them: this is algorithmic bias. For example, it might penalize people who live in certain neighborhoods even if they are good payers. Another problem is the “black box”: some models are so complex that not even the company can clearly explain why it rejected someone. And then there is privacy: would you accept an app analyzing your contacts or your purchases to decide whether you are trustworthy?",
      "That’s why the use of AI in finance needs rules. In Argentina, Personal Data Protection Law 25.326 recognizes the right to know what data is held about us and to ask for it to be corrected. Many experts also propose that everyone should be able to know the reasons behind an automated decision and ask for a human being to review it.",
      "AI can make credit faster and fairer, or faster and unfair. The difference comes down to the data we use, the rules we set and the questions we dare to ask."
    ],
    ideasClave: [
      "A credit score is a number that estimates the risk that someone won’t repay a loan.",
      "Traditional scoring uses few variables, mainly payment history, and leaves people with no history “invisible”.",
      "Fintechs use supervised Machine Learning, trained on cases labeled “paid / didn’t pay”.",
      "Alternative data (bills, digital wallets, top-ups) can promote financial inclusion.",
      "There are risks: algorithmic bias, lack of explanation (black box) and privacy.",
      "Rules are needed: the right to know and correct our data and to ask for human review."
    ]
  },

  TUTORES: [
    {
      id: "socratico", emoji: "🦉", nombre: "Socratic tutor",
      para: "Reach the main ideas by answering questions.",
      prompt: "Act as a patient tutor for a 16-year-old student. I want to learn the text below, but DO NOT summarize it or give me the answers. Ask me questions one at a time, from easiest to hardest, so that I discover the main ideas myself. Wait for my answer before continuing. If I get something wrong, give me a hint instead of the solution.\n\nText:\n{TEXTO}"
    },
    {
      id: "feynman", emoji: "🗣️", nombre: "Explain it in your own words",
      para: "Check whether you understood by explaining it yourself (Feynman technique).",
      prompt: "I’m going to explain in my own words what the text below is about. Your job is to tell me what I understood well, what I missed and what I mixed up. DO NOT rewrite the full explanation yourself: ask me one or two questions that help me correct myself.\n\nText:\n{TEXTO}\n\nMy explanation: [write what you understood here]"
    },
    {
      id: "puente", emoji: "🌉", nombre: "Bridge to my life",
      para: "Connect the text to everyday situations (analogies).",
      prompt: "I’m a high school student. Help me connect the ideas in the text below to situations in my everyday life. Suggest 2 simple analogies and then ask ME to come up with a third one. When I write it, evaluate it and tell me how to improve it.\n\nText:\n{TEXTO}"
    },
    {
      id: "examen", emoji: "🎯", nombre: "Test me",
      para: "Practice like in an oral exam, with feedback.",
      prompt: "Give me an oral exam on the text below: 4 questions, one at a time. Mix memory questions and reasoning questions. After each of my answers, give me a score from 1 to 5 and explain why, but without giving me the perfect answer. At the end, tell me which topic I need to review.\n\nText:\n{TEXTO}"
    },
    {
      id: "mapa", emoji: "🗺️", nombre: "Guided concept map",
      para: "Organize the concepts and how they connect.",
      prompt: "I want to make a concept map of the text below. DO NOT make it yourself: guide me step by step. First, ask me what I think the central concept is. Then help me find 4 or 5 related concepts and decide which linking words connect them. Check each step before moving on.\n\nText:\n{TEXTO}"
    },
    {
      id: "diablo", emoji: "😈", nombre: "Devil’s advocate",
      para: "Think critically and build arguments.",
      prompt: "I read the text below. Give me a controversial position on the topic (for example: “banks should decide on loans using only AI”) and debate with me. Challenge my arguments with questions, but don’t tell me what to think. After 3 exchanges, summarize the best arguments that I made.\n\nText:\n{TEXTO}"
    }
  ],

  PROMPT_TRAMPA: "Summarize this text for me.",

  /* ================= PART 3 ================= */
  TRAGAMONEDAS: {
    problema: [
      "Tourists can’t find good, cheap places to eat in Ushuaia",
      "Students spend all their money in the first few days of the month",
      "Neighborhood shops throw away food they can’t sell",
      "Older adults are afraid to use digital wallets",
      "Families don’t know how much electricity and gas they use in winter",
      "Local entrepreneurs don’t know how to price what they sell",
      "Clothes we no longer wear end up in the trash",
      "Neighborhood clubs can’t find sponsors"
    ],
    cliente: ["High school students", "Tourists", "Older adults", "Neighborhood shops", "Entrepreneurs", "Families"],
    superpoder: [
      { t: "Recommendation", d: "suggests things based on your tastes, like Netflix", e: "🎬" },
      { t: "Computer vision", d: "recognizes objects in photos", e: "📷" },
      { t: "Prediction", d: "anticipates what will happen using past data", e: "🔮" },
      { t: "Chatbot", d: "chats and answers questions", e: "💬" },
      { t: "Clustering", d: "finds groups of similar people or things", e: "🧲" }
    ],
    restriccion: [
      "Starting budget: $0",
      "It must respect privacy 100%",
      "It must be explainable in a single message",
      "It must help the environment",
      "It must work on an old phone"
    ]
  },

  SOCIOS_IA: [
    {
      id: "cofundador", emoji: "🎨", nombre: "Creative co-founder",
      prompt: "You are the creative co-founder of a student startup. Problem: {P}. Customer: {C}. Our AI uses {S}. Constraint: {R}. Suggest 3 short names and 3 slogans of fewer than 8 words. Don’t choose for me: explain in one line why each one could work."
    },
    {
      id: "analista", emoji: "🔐", nombre: "Data and ethics analyst",
      prompt: "You are a data analyst and ethics specialist. Our startup solves: {P}, for {C}, using {S} AI. List 4 pieces of data the AI would need to work. For each one, point out a privacy risk and how to handle it with transparency and consent. Answer in a table."
    },
    {
      id: "inversor", emoji: "🦈", nombre: "Ruthless investor",
      prompt: "You are a very demanding investor on a TV show for entrepreneurs. Here is my startup:\n{CANVAS}\nPoint out 3 weaknesses and ask me 2 tough questions. Be tough but respectful. DO NOT give me the solutions: I want to work them out myself."
    }
  ]
};
