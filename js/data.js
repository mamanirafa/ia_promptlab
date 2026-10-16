/* =========================================================
   PROMPTLAB · Taller de instrucciones a la IA
   Contenidos en ESPAÑOL (idioma por defecto) y configuración.
   Las versiones en francés e inglés están en data.fr.js y data.en.js
   y deben mantener la MISMA estructura, los mismos id y el mismo orden.
   ========================================================= */

const CONFIG = {
  titulo: "PromptLab",
  subtitulo: "Laboratorio de instrucciones a la IA",
  docente: "Prof. Rafael Mamani",
  curso: "5.º año · Ciclo Orientado en Economía",
  cursoI18n: { fr: "5e année · Cycle orienté Économie", en: "Year 5 · Economics Track" },
  institucion: "",
  minutosClase: 70,
  // Código para desbloquear momentos o seguir sin acceso a una IA. Cambialo antes de cada clase.
  codigoDocente: "NOVA2026",
  storageKey: "promptlab-v1"
};

/* Tiempos sugeridos (minutos) — suman 70 con inicio y cierre */
const AGENDA = [
  { id: "inicio", nombre: "Inicio", min: 5 },
  { id: "m1", nombre: "Momento 1 · Laboratorio de prompts", min: 22 },
  { id: "m2", nombre: "Momento 2 · Aprender con la IA", min: 23 },
  { id: "m3", nombre: "Momento 3 · Tanque de Inversores IA", min: 15 },
  { id: "cierre", nombre: "Cierre y bitácora", min: 5 }
];

const IA_LINKS = [
  { nombre: "Gemini", url: "https://gemini.google.com/" },
  { nombre: "ChatGPT", url: "https://chatgpt.com/" },
  { nombre: "Copilot", url: "https://copilot.microsoft.com/" }
];

/* ================= MOMENTO 1 ================= */
const MISIONES = [
  { id: "ahorro", emoji: "💰", titulo: "Plan de ahorro", desc: "Querés juntar plata para comprarte algo que deseás (zapatillas, celular, viaje)." },
  { id: "feria", emoji: "🛍️", titulo: "Emprendimiento para la feria", desc: "Tu curso va a vender algo en la feria del colegio y necesita una idea rentable." },
  { id: "inflacion", emoji: "📈", titulo: "Explicar la inflación", desc: "Tenés que explicarle a tu abuela qué es la inflación y por qué suben los precios." }
];

const RONDAS = [
  {
    id: "flash",
    nombre: "Prompt flash",
    emoji: "⚡",
    consigna: "Escribí el prompt MÁS CORTO posible para tu misión (máximo 8 palabras). Sin pensar mucho, como le escribís a un amigo.",
    maxPalabras: 8,
    pistas: "Ejemplo: “ideas para ahorrar plata”"
  },
  {
    id: "receta",
    nombre: "Prompt con receta",
    emoji: "🧪",
    consigna: "Ahora usá la receta completa: ROL + TAREA + CONTEXTO + FORMATO. Completá cada ingrediente y mirá cómo sube el medidor.",
    receta: true,
    minIngredientes: 4
  },
  {
    id: "ejemplos",
    nombre: "Prompt con ejemplos (few shot)",
    emoji: "🧩",
    consigna: "Dale a la IA 1 o 2 EJEMPLOS de lo que esperás, para que copie el estilo o el formato. Podés partir del prompt anterior.",
    requiere: "ejemplos",
    pistas: "Ejemplo: “…Quiero consejos cortos como estos: ‘Guardá el 10% apenas cobrás’ o ‘Anotá cada gasto en el celular’.”"
  },
  {
    id: "pasos",
    nombre: "Prompt paso a paso (cadena de pensamiento)",
    emoji: "🪜",
    consigna: "Pedile a la IA que razone por PASOS: Paso 1…, Paso 2…, Paso 3… Así ves cómo llega a la respuesta y podés revisarla.",
    requiere: "pasos",
    pistas: "Ejemplo: “…Paso 1: calculá cuánto necesito por mes. Paso 2: proponé 3 recortes de gastos. Paso 3: armá un calendario.”"
  }
];

/* Detector de ingredientes del prompt (medidor en vivo) */
const INGREDIENTES = [
  { id: "rol", nombre: "Rol", emoji: "🎭", re: /\b(sos|soy tu|eres|act[uú]a(?:\s|á)?\s*como|actu[aá] como|como (un|una) (experto|experta|profe|asesor|asesora|economista|tutor|tutora|especialista))/i },
  { id: "tarea", nombre: "Tarea clara", emoji: "🎯", re: /\b(explic|arm[aá]|cre[aá]|escrib|redact|hac[eé]|dame|list[aá]|propon|propo|calcul|compar|describ|gener|dise[ñn]|ayud|suger|eleg|organiz|plane)/i },
  { id: "contexto", nombre: "Contexto", emoji: "🧭", re: /(\d|\btengo\b|\bsoy\b|\baños\b|estudiante|para (mi|una|un|que)|\bmi (abuela|curso|familia)|ushuaia|colegio|presupuesto|\$)/i },
  { id: "formato", nombre: "Formato", emoji: "📋", re: /(tabla|lista|vi[ñn]etas|puntos|p[aá]rrafo|palabras|l[ií]neas|formato|resumen de|en \d|esquema|cuadro|emoji)/i },
  { id: "ejemplos", nombre: "Ejemplos", emoji: "🧩", re: /(por ejemplo|ejemplo|como estos|como este|como esta|estilo de|del tipo)/i },
  { id: "pasos", nombre: "Pasos", emoji: "🪜", re: /(paso\s*\d|paso a paso|primero.*(luego|despu[eé]s)|1\)|1\.)/i }
];

/* Alerta de datos personales */
const DATOS_SENSIBLES = [
  { re: /\b\d{2}\.?\d{3}\.?\d{3}\b/, msg: "Parece un DNI" },
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/, msg: "Parece un email" },
  { re: /\b(\+?54)?\s?(2901|11|9)\s?-?\d{3,4}\s?-?\d{4}\b/, msg: "Parece un teléfono" },
  { re: /contrase[ñn]a|password|clave del banco|cbu|cvu/i, msg: "Información bancaria o contraseñas" },
  { re: /\b(calle|av\.?|avenida)\s+[a-záéíóúñ]+\s+\d{2,5}/i, msg: "Parece una dirección" }
];

/* ================= MOMENTO 2 ================= */
const TEXTO = {
  titulo: "¿Quién decide si te prestan plata? El scoring crediticio en la era de la IA",
  parrafos: [
    "Cuando una persona pide un préstamo, una tarjeta de crédito o comprar en cuotas, el banco o la empresa necesita responder una pregunta clave: ¿esta persona va a poder devolver el dinero? Para contestarla se usa el scoring crediticio, un puntaje que estima el riesgo de que alguien no pague. Cuanto más alto el puntaje, menor el riesgo y mejores las condiciones: más monto, menos interés o más cuotas.",
    "Tradicionalmente, el scoring se calculaba con pocas variables: si la persona tiene un trabajo registrado, cuánto gana, cuántas deudas tiene y, sobre todo, su historial de pagos. En Argentina, los bancos consultan la Central de Deudores del Banco Central, donde figura si alguien está al día o atrasado con sus deudas. El problema es que mucha gente, como los jóvenes que recién empiezan o quienes trabajan de manera informal, no tiene historial. Para el sistema son “invisibles” y les cuesta acceder al crédito.",
    "Aquí aparece la inteligencia artificial. Las empresas financieras tecnológicas, llamadas fintech, entrenan modelos de Machine Learning con miles de casos del pasado etiquetados como “pagó” o “no pagó”. Es aprendizaje supervisado: el modelo busca patrones que se repiten entre quienes cumplieron y quienes no. Además, pueden usar datos alternativos, como el pago puntual de servicios, los movimientos de una billetera virtual o las recargas del celular. Así, alguien sin historial bancario puede demostrar que es responsable con su dinero.",
    "Los beneficios son importantes: decisiones en minutos en lugar de días y más inclusión financiera, porque personas que antes quedaban afuera pueden acceder a un primer crédito para estudiar, emprender o comprar herramientas de trabajo.",
    "Pero también hay riesgos. Si los datos con los que se entrenó el modelo reflejan desigualdades del pasado, la IA puede repetirlas: es el sesgo algorítmico. Por ejemplo, podría penalizar a quienes viven en ciertos barrios aunque sean buenos pagadores. Otro problema es la “caja negra”: algunos modelos son tan complejos que ni siquiera la empresa puede explicar con claridad por qué rechazó a alguien. Y está la privacidad: ¿aceptarías que una app analice tus contactos o tus compras para decidir si sos confiable?",
    "Por eso, el uso de IA en las finanzas necesita reglas. En Argentina, la Ley 25.326 de Protección de Datos Personales reconoce el derecho a saber qué datos tienen sobre nosotros y a pedir que se corrijan. Muchos especialistas proponen además que toda persona pueda conocer los motivos de una decisión automática y pedir que la revise un ser humano.",
    "La IA puede hacer que el crédito sea más rápido y más justo, o más rápido e injusto. La diferencia la hacen los datos que usamos, las reglas que ponemos y las preguntas que nos animamos a hacer."
  ],
  ideasClave: [
    "El scoring crediticio es un puntaje que estima el riesgo de que alguien no devuelva un préstamo.",
    "El scoring tradicional usa pocas variables, sobre todo el historial de pagos, y deja “invisibles” a quienes no tienen historial.",
    "Las fintech usan Machine Learning supervisado, entrenado con casos etiquetados “pagó / no pagó”.",
    "Los datos alternativos (servicios, billeteras, recargas) pueden favorecer la inclusión financiera.",
    "Hay riesgos: sesgo algorítmico, falta de explicación (caja negra) y privacidad.",
    "Se necesitan reglas: derecho a conocer y corregir nuestros datos y a pedir revisión humana."
  ]
};

/* Prompts tutores: {TEXTO} se reemplaza por el texto completo al copiar */
const TUTORES = [
  {
    id: "socratico", emoji: "🦉", nombre: "Tutor socrático",
    para: "Llegar a las ideas principales respondiendo preguntas.",
    prompt: "Actuá como un tutor paciente para un estudiante de 16 años. Quiero aprender el texto que te paso abajo, pero NO me lo resumas ni me des las respuestas. Haceme preguntas de a una, de lo más fácil a lo más difícil, para que yo descubra las ideas principales. Esperá mi respuesta antes de seguir. Si me equivoco, dame una pista en lugar de la solución.\n\nTexto:\n{TEXTO}"
  },
  {
    id: "feynman", emoji: "🗣️", nombre: "Explicalo con tus palabras",
    para: "Comprobar si entendiste, explicándolo vos (técnica Feynman).",
    prompt: "Voy a explicarte con mis palabras de qué trata el texto de abajo. Tu tarea es decirme qué entendí bien, qué me faltó y qué confundí. NO reescribas vos la explicación completa: haceme una o dos preguntas que me ayuden a corregirme solo.\n\nTexto:\n{TEXTO}\n\nMi explicación: [escribí acá lo que entendiste]"
  },
  {
    id: "puente", emoji: "🌉", nombre: "Puente con mi vida",
    para: "Conectar el texto con situaciones cotidianas (analogías).",
    prompt: "Soy estudiante secundario en Ushuaia. Ayudame a conectar las ideas del texto de abajo con situaciones de mi vida cotidiana. Proponé 2 analogías simples y después pedime que YO invente una tercera. Cuando te la escriba, evaluala y decime cómo mejorarla.\n\nTexto:\n{TEXTO}"
  },
  {
    id: "examen", emoji: "🎯", nombre: "Ponéme a prueba",
    para: "Practicar como en un examen oral, con devolución.",
    prompt: "Tomame un examen oral sobre el texto de abajo: 4 preguntas, de a una. Mezclá preguntas de memoria y de razonamiento. Después de cada respuesta mía, poneme una nota de 1 a 5 y explicame por qué, pero sin darme la respuesta perfecta. Al final, decime qué tema tengo que repasar.\n\nTexto:\n{TEXTO}"
  },
  {
    id: "mapa", emoji: "🗺️", nombre: "Mapa conceptual guiado",
    para: "Organizar los conceptos y sus relaciones.",
    prompt: "Quiero armar un mapa conceptual del texto de abajo. NO lo armes vos: guiame paso a paso. Primero preguntame cuál creo que es el concepto central. Después ayudame a encontrar 4 o 5 conceptos relacionados y a decidir con qué palabras se conectan. Validá cada paso antes de avanzar.\n\nTexto:\n{TEXTO}"
  },
  {
    id: "diablo", emoji: "😈", nombre: "Abogado del diablo",
    para: "Pensar críticamente y argumentar.",
    prompt: "Leí el texto de abajo. Planteame una postura polémica sobre el tema (por ejemplo: “los bancos deberían decidir los créditos solo con IA”) y debatí conmigo. Desafiá mis argumentos con preguntas, pero no me digas qué pensar. Después de 3 intercambios, resumí los mejores argumentos que dije YO.\n\nTexto:\n{TEXTO}"
  }
];

const PROMPT_TRAMPA = "Resumime este texto.";

/* ================= MOMENTO 3 ================= */
const TRAGAMONEDAS = {
  problema: [
    "Los turistas no encuentran dónde comer rico y barato en Ushuaia",
    "Los estudiantes se gastan toda la plata los primeros días del mes",
    "Los comercios del barrio tiran comida que no llegan a vender",
    "Los adultos mayores no se animan a usar la billetera virtual",
    "Las familias no saben cuánta luz y gas gastan en invierno",
    "Los emprendedores locales no saben qué precio ponerle a lo que venden",
    "La ropa que ya no usamos termina en la basura",
    "Los clubes de barrio no consiguen sponsors"
  ],
  cliente: ["Estudiantes secundarios", "Turistas", "Adultos mayores", "Comercios del barrio", "Emprendedores", "Familias"],
  superpoder: [
    { t: "Recomendación", d: "sugiere cosas según tus gustos, como Netflix", e: "🎬" },
    { t: "Visión artificial", d: "reconoce objetos en fotos", e: "📷" },
    { t: "Predicción", d: "anticipa lo que va a pasar con datos del pasado", e: "🔮" },
    { t: "Chatbot", d: "conversa y responde preguntas", e: "💬" },
    { t: "Agrupamiento", d: "encuentra grupos de personas o cosas parecidas", e: "🧲" }
  ],
  restriccion: [
    "Presupuesto inicial: $0",
    "Tiene que respetar al 100% la privacidad",
    "Se tiene que poder explicar en un solo mensaje",
    "Tiene que ayudar al medio ambiente",
    "Tiene que funcionar en un celular viejo"
  ]
};

const SOCIOS_IA = [
  {
    id: "cofundador", emoji: "🎨", nombre: "Cofundador/a creativo/a",
    prompt: "Sos cofundador/a creativo/a de una startup de estudiantes. Problema: {P}. Cliente: {C}. Nuestra IA usa {S}. Restricción: {R}. Proponé 3 nombres cortos y 3 slogans de menos de 8 palabras. No elijas por mí: explicá en una línea por qué podría funcionar cada uno."
  },
  {
    id: "analista", emoji: "🔐", nombre: "Analista de datos y ética",
    prompt: "Sos analista de datos y especialista en ética. Nuestra startup resuelve: {P}, para {C}, usando IA de tipo {S}. Hacé una lista de 4 datos que necesitaría la IA para funcionar. Para cada uno, señalá un riesgo de privacidad y cómo cuidarlo con transparencia y consentimiento. Respondé en una tabla."
  },
  {
    id: "inversor", emoji: "🦈", nombre: "Inversor/a despiadado/a",
    prompt: "Sos un inversor muy exigente de un programa de TV de emprendedores. Te presento mi startup:\n{CANVAS}\nSeñalá 3 debilidades y haceme 2 preguntas difíciles. Sé duro pero respetuoso. NO me des las soluciones: quiero pensarlas yo."
  }
];

/* Paquete de contenidos en español (lo usa el selector de idioma) */
const PL_ES = { AGENDA, MISIONES, RONDAS, INGREDIENTES, DATOS_SENSIBLES, TEXTO, TUTORES, PROMPT_TRAMPA, TRAGAMONEDAS, SOCIOS_IA };
