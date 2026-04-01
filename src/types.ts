export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isReady: boolean;
  isHost: boolean;
  papelitos?: string[];
}

export interface GameCard {
  id: string;
  category: string;
  content: string;
  emoji: string;
  tabooWords?: string[]; // For TABÚ category
  answer?: string; // For QUIÉN DIJO ESTO category
  context?: string; // For ACTUAR category
}

export interface GameState {
  status: 'HOME' | 'LOBBY' | 'GAME' | 'RESULTS';
  players: Player[];
  cards: GameCard[];
  currentCardIndex: number;
  timer: number;
  mode: 'CHAOS' | 'PENALTY' | 'PRIMOS' | 'PAPELITO';
  currentTurnPlayerId: string | null;
  readyCount: number;
  turnOrder: string[]; // List of player IDs in order
  currentRound?: number; // For PAPELITO mode (1, 2, 3)
  papelitosPerPlayer?: number;
  lastWinnerId?: string | null;
  lastWinnerName?: string | null;
  isShowingWinner?: boolean;
}

export const PREDEFINED_PLAYERS = [
  "Camichi", "Tim", "Ale", "Vane", "Nai", "David", "Cesar", "MG", "Rebe", "Lia", "Boji"
];

export const PRIMOS_CARDS: GameCard[] = [
  // ACTUAR
  ...[
    { content: "audio largo", context: "Actúa como si estuvieras mandando un audio larguísimo explicando algo innecesario" },
    { content: "llegar tarde", context: "Actúa que dices que llegas en una hora pero claramente no vas ni a salir" },
    { content: "no entiendo", context: "Actúa completamente perdido en una conversación sin entender nada" },
    { content: "votar", context: "Actúa desesperado pidiendo a todos que voten ya mismo" },
    { content: "chat caótico", context: "Actúa un chat donde todos hablan y nadie se entiende" },
    { content: "gym intenso", context: "Actúa como si estuvieras entrenando pesado y presumiendo calorías" },
    { content: "sin comer", context: "Actúa que no has comido nada en todo el día pero sigues activo" },
    { content: "emocionado", context: "Actúa reaccionando exageradamente feliz a algo mínimo" },
    { content: "confundido", context: "Actúa preguntando qué está pasando porque no entiendes nada" },
    { content: "organizando", context: "Actúa tratando de organizar algo pero nadie responde" },
  ].map((c, i) => ({ id: `primo-act-${i}`, category: "ACTUAR", content: c.content, emoji: "🎭", context: c.context })),

  // TABÚ
  ...[
    { content: "votación", tabooWords: ["votar", "gente", "grupo"] },
    { content: "audio", tabooWords: ["voz", "mensaje", "minutos"] },
    { content: "chat", tabooWords: ["grupo", "mensajes", "whatsapp"] },
    { content: "gimnasio", tabooWords: ["pesas", "ejercicio", "entrenar"] },
    { content: "llegar tarde", tabooWords: ["hora", "esperar", "tarde"] },
    { content: "comida", tabooWords: ["comer", "hambre", "comida"] },
    { content: "plan", tabooWords: ["salir", "organizar", "grupo"] },
    { content: "confusión", tabooWords: ["entender", "nada", "explicar"] },
    { content: "emoción", tabooWords: ["feliz", "reacción", "wow"] },
    { content: "chat activo", tabooWords: ["mensaje", "grupo", "hablar"] },
  ].map((c, i) => ({ id: `primo-tab-${i}`, category: "TABÚ", content: c.content, emoji: "🗣️", tabooWords: c.tabooWords })),

  // QUIÉN DIJO ESTO
  ...[
    { content: "yo no entiendo nada", answer: "Dana" },
    { content: "Este estuvo malo", answer: "Liangely Parra" },
    { content: "Activen a quien tengan cerca pa votar", answer: "Mily Nuevo" },
    { content: "No se me imagino q al final sale la opción", answer: "Mily Nuevo" },
    { content: "Si a lo último sale una encuesta", answer: "Jiss US" },
    { content: "Ojalá que lo hagan por round para ir votando de una", answer: "Jiss US" },
    { content: "Eso no lo puede hacer chat gpt", answer: "Edwin David" },
    { content: "Siiiii BUGARON", answer: "Mily Nuevo" },
    { content: "COMO QUE ES algo chimbo pero ajá no importa", answer: "Mily Nuevo" },
    { content: "Ahhh ellos lo q decían es que no puede decir ron", answer: "Liangely Parra" },
    { content: "Llego en una hora qlq", answer: "Edwin André" },
    { content: "Hoy puedo", answer: "Liangely Parra" },
    { content: "A que hora es el mani", answer: "Liangely Parra" },
    { content: "Buscando una direccion aqui en tampa y me sale eso", answer: "Edwin André" },
    { content: "Diosito nos cuide", answer: "Edwin André" },
    { content: "Será una señal?", answer: "Majo" },
    { content: "Hey quien pueda escribir en el súper chat así sea con 0.99 pesitos", answer: "Mily Nuevo" },
    { content: "Yo voy en camino hago cena y bórralo", answer: "Mily Nuevo" },
    { content: "Coyyyyy", answer: "Jiss US" },
    { content: "Marico no he comido nada en todo el dia", answer: "Edwin André" },
    { content: "Solo agua", answer: "Edwin André" },
    { content: "Así habréis comido jajajajajaja", answer: "Edwin David" },
    { content: "57 min trotando, 558 kcal quemadas", answer: "Edwin André" },
    { content: "Voy por pesas ahora", answer: "Edwin André" },
    { content: "Investiguen, me ayuda bastante a seguir entrenando cuando me achanto", answer: "Edwin André" },
    { content: "Estoy pensando en hacer un grupo de WhatsApp con los de confianza", answer: "Mily Nuevo" },
    { content: "Igual la gente q está en el en vivo también vota por el q le parezca mejor", answer: "Mily Nuevo" },
    { content: "Voy desocupándome", answer: "Edwin David" },
    { content: "Cómo van las votaciones", answer: "Edwin David" },
    { content: "Vi el grupo pero hay muchos mensajes y no me quiero perder la votación", answer: "Edwin David" },
    { content: "Tenéis q estar pendiente tipo 8 pm más tardar", answer: "Mily Nuevo" },
  ].map((c, i) => ({ id: `primo-who-${i}`, category: "QUIÉN DIJO ESTO", content: c.content, emoji: "🤔", answer: c.answer })),
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
