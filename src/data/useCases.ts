export interface UseCase {
  id: string;
  title: string;
  challenge: string;
  impact: string;
  icon: string;
  tags: string[];
  mockupType?: 'analytics' | 'wireframe' | 'tokens';
  deepDive?: {
    leftTitle: string;
    leftParagraphs: string[];
    rightTitle: string;
    rightBulletPoints: string[];
    footerBadge: string;
  };
}

export const useCases: UseCase[] = [
  {
    id: "illow_start",
    title: "illow from the Beginning",
    challenge: "Designing the initial brand identity, visual systems, high-converting checkout funnels, and initial UX wireframes for an early-stage privacy tech startup from zero to one.",
    impact: "Secured early market traction under a cohesive product aesthetic, with the visual identity and user interface driving robust early-stage signups.",
    icon: "rocket_launch",
    tags: ["UX Strategy", "Branding"],
    mockupType: "wireframe",
    deepDive: {
      leftTitle: "The Startup Spark",
      leftParagraphs: [
        "I worked on designing the startup's brand DNA, choosing color tokens, typography systems, and web architecture to resonate with developers and compliance officers alike. By controlling the complete zero-to-one design pipeline, I framed privacy compliance as a beautiful interactive asset.",
        "This aesthetic control laid a groundwork, allowing me to establish the company's internal UX department confidently before scaling processes."
      ],
      rightTitle: "Methodology & Launch Actions",
      rightBulletPoints: [
        "Designed high-converting interactive landing pages for developer signups.",
        "Built user experience blueprints for the original modal cookie sliders to maximize consent collection.",
        "Attracted capital and early-stage trials by presenting interactive clickable high-contrast prototypes representing a mature product."
      ],
      footerBadge: "Zero-To-One Blueprint • Cohesive Privacy Identity"
    }
  },
  {
    id: "illow_evolution",
    title: "illow to BigID Evolution",
    challenge: "Leading the branding, visual system, and user experience strategy from early-stage startup through its eventual, high-profile acquisition by enterprise titan BigID.",
    impact: "Unified the marketing and product workflows under a robust design system, allowing seamless enterprise transition to process complex high-volume compliance data.",
    icon: "trending_up",
    tags: ["Design Systems", "Branding"],
    mockupType: "tokens",
    deepDive: {
      leftTitle: "Acquisition & Enterprise Scale",
      leftParagraphs: [
        "Ensuring brand consistency through corporate transitions is a severe friction risk. I led the transition from illow's lightweight visual language to BigID's global compliance system, structuring UX patterns to support massive algorithmic volume without losing sensory clarity.",
        "This absolute control over aesthetics laid a profound groundwork, allowing me to comfortably establish the company's internal UX department from the ground up prior to acquisition."
      ],
      rightTitle: "Methodology & Adaptations",
      rightBulletPoints: [
        "Developed a streamlined Design System (UI Kit) translating marketing brand elements into reusable component code.",
        "Significantly reduced engineering visual debt, aligning product development with marketing brand consistency.",
        "Redesigned complex data-consent tables and user dashboards for BigID's global compliance standards post-acquisition."
      ],
      footerBadge: "Acquisition Catalyst • Enterprise Scale Orchestration Ready"
    }
  },
  {
    id: "bigid_cookie",
    title: "BigID Cookie Classification",
    challenge: "Streamlining nested compliance tabs, massive cookies datasets, and classification settings schemas containing heavily dense enterprise governance logic arrays into frictionless interactive interfaces.",
    impact: "Decreased overall system task navigation durations significantly through strict layout alignment and non-fatiguing data hierarchies.",
    icon: "grid_view",
    tags: ["Information Architecture", "UX Strategy"],
    mockupType: "analytics",
    deepDive: {
      leftTitle: "Overcoming Density Fatigue",
      leftParagraphs: [
        "Enterprise compliance auditors face huge cognitive overload when cataloging raw tracking cookies. By grouping massive cookie lists into logical categories and clean grids, the raw configurations became digestible and highly actionable.",
        "This re-architecture stripped away secondary visual noise, resulting in a clean grid system designed after strict interactive Fitts's and Hick's Laws."
      ],
      rightTitle: "Auditing & Control Milestones",
      rightBulletPoints: [
        "Designed clear classification and tagging status indicators for corporate tracking data blocks.",
        "Built easy pagination, smart quick-filtering, and drag-and-drop bucket systems.",
        "Successfully decreased auditor page travel durations and human identification errors."
      ],
      footerBadge: "Friction-Free Task Navigation Optimization"
    }
  },
  {
    id: "bojana",
    title: "Bojana Estudio Redesign",
    challenge: "Directing the physical-to-digital high-end storefront, structural visual grid architecture, and luxury branding framework for a premium architectural studio.",
    impact: "Generated substantial increase in qualified inquiries by framing structural portfolios inside an eye-catching luxury museum aesthetic.",
    icon: "palette",
    tags: ["Branding", "Design Systems"],
    mockupType: "tokens",
    deepDive: {
      leftTitle: "Digitalizing Physical Craft",
      leftParagraphs: [
        "Architecture is about the dialogue of empty spaces, materials, and light. I designed the studio's digital storefront as an extension of their buildings—crafted around extensive empty margins, stunning high-contrast typography, and seamless transitions.",
        "The minimal interface preserves and amplifies the high-value physical catalog, transforming digital viewers into design consult clients."
      ],
      rightTitle: "Spatial Interactive Elements",
      rightBulletPoints: [
        "Designed an editorial masonry grid aligning blueprints and photographs symmetrically.",
        "Paired high-impact display fonts with Fira Code for technical metric captions.",
        "Optimized high-resolution graphic rendering for immediate loading without visual stutter."
      ],
      footerBadge: "Luxury Preservation • Qualified High-Ticket Conversion"
    }
  }
];
