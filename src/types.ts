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
  isChaosMode: boolean;
  isPenaltyMode: boolean;
  currentTurnPlayerId: string | null;
  readyCount: number;
}

export const PREDEFINED_PLAYERS = [
  "Camichi", "Tim", "Ale", "Vane", "Nai", "David", "Cesar", "MG", "Rebe", "Lia", "Boji"
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
