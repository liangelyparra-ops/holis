export type MultimediaSectionId = 'hero' | 'gallery' | 'methodology' | 'contact';

export interface SectionMeta {
  id: MultimediaSectionId;
  label: string;
}

export interface MultimediaPageContent {
  sectionsOrder: MultimediaSectionId[];
  hero: {
    badge: string;
    headline: string;
    description: string;
    toolkitTitle: string;
    aiTitle: string;
    aiDesc: string;
    motionTitle: string;
    motionDesc: string;
    designTitle: string;
    designDesc: string;
    locationTitle: string;
    locationDesc: string;
    contactBtnText: string;
  };
  gallery: {
    badge: string;
    title: string;
  };
  methodology: {
    badge: string;
    title: string;
    card1Num: string;
    card1Title: string;
    card1Desc: string;
    card2Num: string;
    card2Title: string;
    card2Desc: string;
    card3Num: string;
    card3Title: string;
    card3Desc: string;
  };
  contact: {
    badge: string;
    title: string;
    description: string;
    whatsappText: string;
    emailText: string;
    linkedinText: string;
  };
}

export const defaultMultimediaPageContent: MultimediaPageContent = {
  sectionsOrder: ['hero', 'gallery', 'methodology', 'contact'],
  hero: {
    badge: 'Multimedia Designer · AI, Motion & Content',
    headline: 'Creatividad visual impulsada por Inteligencia Artificial, Motion Graphics y contenido de alto impacto.',
    description: 'Diseñadora multimedia con formación sólida en diseño gráfico y dirección de arte. Especializada en la conceptualización de key visuals, producción audiovisual para paid media y redes sociales, integración de herramientas de IA generativa en el pipeline creativo y desarrollo de piezas en 3D y animación.',
    toolkitTitle: 'Stack Creativo & Producción',
    aiTitle: 'IA Generativa & Workflows',
    aiDesc: 'Midjourney, Runway Gen-3, Kling, Luma Dream Machine, Stable Diffusion, Photoshop AI / Generative Fill, Magnific, ElevenLabs.',
    motionTitle: 'Motion & Video',
    motionDesc: 'After Effects, Premiere Pro, Animate, Kinetic Typography, Micro-animaciones, edición rítmica y sound design.',
    designTitle: 'Diseño, Key Visuals & 3D',
    designDesc: 'Photoshop, Illustrator, Figma, Blender 3D, Spline, adaptaciones multiformato (9:16, 1:1, 16:9).',
    locationTitle: 'Ubicación & Modalidad',
    locationDesc: 'Buenos Aires (Palermo / CABA) · Modalidad Híbrida / Remota · Disponibilidad Inmediata.',
    contactBtnText: 'Contactar a Lia Parra',
  },
  gallery: {
    badge: 'Portfolio Showcase',
    title: 'Piezas audiovisuales, conceptos y adaptaciones.',
  },
  methodology: {
    badge: 'Cómo trabajo',
    title: 'Velocidad de ejecución con criterio visual y entendimiento de métricas.',
    card1Num: '01',
    card1Title: 'Hooks de 3 Segundos & Retención',
    card1Desc: 'Diseño cada pieza pensando en los códigos específicos de cada plataforma (Reels, TikTok, Shorts). Pattern interrupts, tipografía de lectura rápida y ritmo audiovisual para frenar el scroll.',
    card2Num: '02',
    card2Title: 'IA Integrada al Pipeline Real',
    card2Desc: 'La IA no reemplaza la dirección de arte: la potencia. Utilizo modelos generativos para explorar conceptos a alta velocidad, generar footage único y acelerar iteraciones manteniendo consistencia de marca.',
    card3Num: '03',
    card3Title: 'Adaptabilidad Omnicanal',
    card3Desc: 'Capacidad de tomar un concepto visual y transformarlo de forma coherente en adaptaciones 9:16 vertical, 1:1 feed, 16:9 paid ads y piezas de email marketing sin perder fuerza estética.',
  },
  contact: {
    badge: 'Hablemos',
    title: '¿Hablamos sobre tu próximo proyecto o campaña?',
    description: 'Disponible para sumarme en modalidad híbrida o remota y liderar proyectos de alto impacto visual, motion graphics y campañas creativas.',
    whatsappText: 'WhatsApp',
    emailText: 'Enviar Email',
    linkedinText: 'LinkedIn',
  },
};
