export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isReady: boolean;
  isHost: boolean;
}

export interface GameCard {
  id: string;
  category: string;
  content: string;
  emoji: string;
  tabooWords?: string[]; // For TABÚ category
}

export interface GameState {
  status: 'HOME' | 'LOBBY' | 'GAME' | 'RESULTS';
  players: Player[];
  cards: GameCard[];
  currentCardIndex: number;
  timer: number;
  mode: 'CHAOS' | 'PENALTY' | 'PRIMOS';
  currentTurnPlayerId: string | null;
  readyCount: number;
  turnOrder: string[]; // List of player IDs in order
}

export const PREDEFINED_PLAYERS = [
  "Camichi", "Tim", "Ale", "Vane", "Nai", "David", "Cesar", "MG", "Rebe", "Lia", "Boji"
];

export const PRIMOS_CARDS: GameCard[] = [
  // ACTUAR (50+ provided)
  ...[
    "Cancelar plan a último momento con excusa absurda",
    "Responder 5 horas tarde como si nada",
    "Decir 'ya voy' pero seguir en casa",
    "Excusa ridícula tipo 'me dormí'",
    "Entrar al chat, leer todo y no responder",
    "Volver después de ghostear días",
    "Prometer algo y olvidarte completamente",
    "Responder con puro emoji",
    "Hacer drama por algo mínimo",
    "Decir 'no gasto más' y comprar igual",
    "Mandar audio eterno",
    "Responder 'voy pero veo'",
    "Confundir todo en el grupo",
    "Pelear por algo insignificante",
    "Hacerse el ocupado estando online",
    "Decir 'no vi el mensaje' cuando sí lo viste",
    "Organizar plan y desaparecer",
    "Responder tarde y sin contexto",
    "Exagerar una historia",
    "Decir 'todo bien' estando enojado",
    "Responder con sarcasmo total",
    "Aparecer justo cuando ya terminó el plan",
    "Responder solo a una parte del chat",
    "No entender nada pero opinar igual",
    "Responder sin leer todo",
    "Decir 'ahí veo' y nunca ver",
    "Prometer llegar temprano y llegar tarde",
    "Justificar algo injustificable",
    "Ignorar pregunta directa",
    "Responder fuera de contexto",
    "Mandar sticker en momento serio",
    "Cambiar tema incómodo",
    "Responder solo con 'jajaja'",
    "Aparecer solo para opinar",
    "Responder todo tarde",
    "Decir 'sí' y no hacer nada",
    "Inventar excusa en el momento",
    "Hacerte el distraído",
    "Responder sin ganas",
    "Reaccionar exagerado",
    "Decir 'llego en 10' y tardar 1 hora",
    "Responder solo con GIF",
    "Olvidarte del plan completamente",
    "Decir 'no puedo' sin razón",
    "Reaccionar como si fuera grave",
    "Responder con delay extremo",
    "Decir 'todo chill' en caos",
    "Aparecer solo cuando conviene",
    "Responder con audio corto inútil",
    "Confundir fechas del plan",
    "Responder tarde y mal",
    "Decir 'me olvidé'",
    "Ignorar conversación activa",
    "Responder sin sentido",
    "Decir 'ahora sí' y no hacer nada",
    "Responder automático",
    "Reaccionar con enojo fake",
    "Responder como robot",
    "No seguir hilo de conversación",
    "Cambiar versión de historia",
    "Decir 'era joda'",
    "Responder tarde y seco",
    "Aparecer cuando ya terminó todo",
    "Responder con '??'",
    "Ignorar contexto total",
    "Responder con excusa random",
    "No entender chiste",
    "Responder con delay incómodo",
    "Hacerte el sorprendido",
    "Responder contradictorio",
    "Responder sin ganas total",
    "Decir 'no sé' a todo",
    "Responder evasivo",
    "Responder tarde con excusa",
    "Responder solo emojis",
    "Ignorar mensajes largos",
    "Responder con error",
    "Hacerte el ocupado",
    "Decir 'ok' a todo",
    "Responder sin sentido final"
  ].map((c, i) => ({ id: `primo-act-${i}`, category: "ACTUAR", content: c, emoji: "🎭" })),

  // TABU
  ...[
    { content: "Excusa para no salir", taboo: ["mentira", "plan", "cancelar"] },
    { content: "Llegar tarde siempre", taboo: ["hora", "esperar", "retraso"] },
    { content: "Gastar sin culpa", taboo: ["plata", "comprar", "caro"] },
    { content: "Audio eterno", taboo: ["mensaje", "voz", "minutos"] },
    { content: "Plan improvisado", taboo: ["salir", "organizar", "grupo"] },
    { content: "Ghostear chat", taboo: ["ignorar", "responder", "mensaje"] },
    { content: "Chamuyo básico", taboo: ["hablar", "decir", "gustar"] },
    { content: "Drama innecesario", taboo: ["problema", "conflicto", "exagerar"] },
    { content: "Prometer y no cumplir", taboo: ["decir", "hacer", "mentir"] },
    { content: "Plan que muere", taboo: ["grupo", "cancelar", "organizar"] },
    { content: "Responder tarde", taboo: ["hora", "mensaje", "leer"] },
    { content: "Excusa laboral", taboo: ["trabajo", "ocupado", "reunión"] },
    { content: "Responder con meme", taboo: ["imagen", "gracioso", "chat"] },
    { content: "Querer ahorrar", taboo: ["plata", "guardar", "gastar"] },
    { content: "Organizar viaje", taboo: ["plan", "grupo", "fecha"] },
  ].map((c, i) => ({ id: `primo-tab-${i}`, category: "TABÚ", content: c.content, emoji: "🗣️", tabooWords: c.taboo })),

  // WHO SAID
  ...[
    "'ya llego'",
    "'voy pero veo'",
    "'no gasto más'",
    "'no vi el mensaje'",
    "'estaba ocupado'",
    "'era joda'",
    "'después vemos'",
    "'yo no fui'",
    "'me olvidé'",
    "'todo bien'"
  ].map((c, i) => ({ id: `primo-who-${i}`, category: "WHO SAID THIS", content: c, emoji: "🤔" })),
];

export const DEFAULT_CARDS: GameCard[] = [
  // 🎭 ACTING (20)
  ...[
    "Alguien diciendo “voy” y cancelando",
    "Reacción exagerada a algo mínimo",
    "“Estoy con muchos gastos ahorita 🙃” explicado con drama",
    "Alguien que aparece después de horas sin responder",
    "Plan que nunca se concreta",
    "“No los veo” pero estaba activo",
    "Chamuyo en el grupo",
    "Hacerse la víctima sin razón",
    "“Cositaaaaaaa” exagerado",
    "Discusión absurda",
    "Excusa ridícula para no salir",
    "Llegar tardísimo al plan",
    "Desaparecer en conversación",
    "Prometer cambiar y no cambiar",
    "Reacción a plan cancelado",
    "Querer ahorrar pero gastar igual",
    "Defender algo indefendible",
    "Mensajes confusos",
    "Drama innecesario",
    "Volver como si nada después de ghostear"
  ].map((c, i) => ({ id: `act-${i}`, category: "ACTING", content: c, emoji: "🎭" })),

  // 🤔 WHO SAID THIS (20)
  ...[
    "“Cositaaaaaaa”",
    "“Estoy con muchos gastos ahorita 🙃”",
    "“No los veo”",
    "“Porque soy principiante”",
    "“Malayo”",
    "“Voy pero no sé”",
    "“Después veo”",
    "“Ya llego”",
    "“No era para tanto”",
    "“Tranqui”",
    "“Yo no fui”",
    "“Fue sin querer”",
    "“Ya lo hago”",
    "“Me olvidé”",
    "“No entendí nada”",
    "“Era joda”",
    "“Ahora sí posta”",
    "“No tengo batería”",
    "“Estoy ocupada/o”",
    "“Después hablamos”"
  ].map((c, i) => ({ id: `who-${i}`, category: "WHO SAID THIS", content: c, emoji: "🤔" })),

  // 🔥 EXPOSE (20)
  ...[
    "Decí una mentira que dijiste en el grupo",
    "Contá el peor plan fallido",
    "¿A quién le creés menos?",
    "¿Quién es el más fantasma?",
    "¿Qué te molesta del grupo?",
    "Contá una excusa que usaste",
    "¿Quién exagera más?",
    "¿Fingiste interés alguna vez?",
    "¿Quién organiza y no concreta?",
    "¿Quién cambia de humor rápido?",
    "¿Ignoraste a alguien a propósito?",
    "¿Quién es el más dramático?",
    "¿Quién promete y no cumple?",
    "Momento más incómodo",
    "¿Quién miente mejor?",
    "¿Quién habla de más?",
    "¿Quién desaparece más?",
    "Algo que te arrepentís de decir",
    "¿Quién pone más excusas?",
    "¿Quién es más impredecible?"
  ].map((c, i) => ({ id: `exp-${i}`, category: "EXPOSE", content: c, emoji: "🔥" })),

  // ☠️ WHO IS MOST LIKELY (15)
  ...[
    "Más mentiroso/a",
    "Más dramático/a",
    "Más colgado/a",
    "Más chamuyero/a",
    "Más probable que cancele",
    "Más intenso/a",
    "Más exagerado/a",
    "Más divertido/a",
    "Más problemático/a",
    "Más desaparecido/a",
    "Más impuntual",
    "Más tóxico/a",
    "Más confiable",
    "Más caótico/a",
    "Más rompe planes"
  ].map((c, i) => ({ id: `likely-${i}`, category: "WHO IS MOST LIKELY", content: c, emoji: "☠️" })),

  // 🗣️ TABÚ (15)
  { id: "tab-1", category: "TABÚ", content: "Gastos", emoji: "🗣️", tabooWords: ["plata", "dinero", "caro"] },
  { id: "tab-2", category: "TABÚ", content: "Principiante", emoji: "🗣️", tabooWords: ["nuevo", "empezar", "aprender"] },
  { id: "tab-3", category: "TABÚ", content: "Excusa", emoji: "🗣️", tabooWords: ["mentira", "razón", "evitar"] },
  { id: "tab-4", category: "TABÚ", content: "Plan", emoji: "🗣️", tabooWords: ["salir", "noche", "organizar"] },
  { id: "tab-5", category: "TABÚ", content: "Cancelar", emoji: "🗣️", tabooWords: ["no ir", "último momento", "baja"] },
  { id: "tab-6", category: "TABÚ", content: "Drama", emoji: "🗣️", tabooWords: ["problema", "exagerar", "conflicto"] },
  { id: "tab-7", category: "TABÚ", content: "Grupo", emoji: "🗣️", tabooWords: ["chat", "amigos", "WhatsApp"] },
  { id: "tab-8", category: "TABÚ", content: "Mentira", emoji: "🗣️", tabooWords: ["falso", "verdad", "invento"] },
  { id: "tab-9", category: "TABÚ", content: "After", emoji: "🗣️", tabooWords: ["fiesta", "noche", "boliche"] },
  { id: "tab-10", category: "TABÚ", content: "Ahorro", emoji: "🗣️", tabooWords: ["guardar", "plata", "gastar"] },
  { id: "tab-11", category: "TABÚ", content: "Desaparecer", emoji: "🗣️", tabooWords: ["ghostear", "irse", "no responder"] },
  { id: "tab-12", category: "TABÚ", content: "Chamuyo", emoji: "🗣️", tabooWords: ["hablar", "conquistar", "decir"] },
  { id: "tab-13", category: "TABÚ", content: "Tarde", emoji: "🗣️", tabooWords: ["retraso", "hora", "llegar"] },
  { id: "tab-14", category: "TABÚ", content: "Audio", emoji: "🗣️", tabooWords: ["voz", "mensaje", "escuchar"] },
  { id: "tab-15", category: "TABÚ", content: "Excusas", emoji: "🗣️", tabooWords: ["justificar", "evitar", "mentira"] },

  // 💣 TRUTH OR BOMB (10)
  ...[
    "¿A quién del grupo soportás menos?",
    "¿Mentiste fuerte en el chat?",
    "¿Quién te cae mejor realmente?",
    "¿Qué secreto ocultaste?",
    "¿A quién ignorás más?",
    "¿Qué te da vergüenza admitir?",
    "¿Quién te decepcionó?",
    "¿Qué cambiarías del grupo?",
    "¿Tu peor momento en el chat?",
    "¿Quién es el más falso?"
  ].map((c, i) => ({ id: `truth-${i}`, category: "TRUTH OR BOMB", content: c, emoji: "💣" })),
];
