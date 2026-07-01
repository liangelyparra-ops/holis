export interface UseCaseBlock {
  type: 'text' | 'image' | 'carousel' | 'video' | 'pdf';
  // Text options
  title?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  
  // Image options
  imageUrl?: string;
  imageCaption?: string;
  
  // Carousel options
  carouselImages?: string[];
  carouselCaption?: string;
  
  // Video options
  videoUrl?: string;
  videoCaption?: string;
  
  // PDF options
  pdfUrl?: string;
  pdfCaption?: string;
}

export interface UseCase {
  id: string;
  title: string;
  challenge: string;
  impact: string;
  icon: string;
  tags: string[];
  footerBadge: string;
  blocks: UseCaseBlock[];
  liveUrl?: string;
  metrics?: { value: string; label: string }[];
}

export const useCases: UseCase[] = [
  {
    id: "illow_case1",
    title: "illow: Scaling a B2B Data Privacy Platform from Startup to Acquisition.",
    challenge: "How I owned the end-to-end product design and visual strategy for a data-privacy compliance startup, working hand-in-hand with executive leadership to transform complex global regulations into an intuitive SaaS platform—ultimately leading to its successful acquisition by BigID.",
    impact: "Secured early market traction under a cohesive product aesthetic, with the visual identity and user interface driving robust early-stage signups.",
    icon: "rocket_launch",
    tags: ["UX Strategy", "Branding"],
    footerBadge: "Zero-To-One Blueprint • Cohesive Privacy Identity",
    liveUrl: "https://illow.io",
    metrics: [
      { value: "40+", label: "Core B2B Workflows Designed" },
      { value: "1×", label: "Shared Component Ecosystem" },
      { value: "→ BigID", label: "Commercial Acquisition" }
    ],
    blocks: [

      {
        type: "image",
        imageUrl: "https://drive.google.com/file/d/1RaXo5PfAY3AWsNuaJ9BVLhl1UVl-RN9p/view?usp=sharing",
        imageCaption: "illow Marketing asset."
      },
      {
        type: "text",
        title: "The Startup Spark",
        paragraphs: [
          "I worked on designing the startup's brand DNA, choosing color tokens, typography systems, and web architecture to resonate with developers and compliance officers alike. By controlling the complete zero-to-one design pipeline, I framed privacy compliance as a beautiful interactive asset.",
          "This aesthetic control laid a groundwork, allowing me to establish the company's internal UX department confidently before scaling processes."
        ]
      },
      {
        type: "image",
        carouselImages: [
         
          "https://drive.google.com/file/d/1knrRCKiUMyjzhXRbiCc3PPvwJUtp9qfk/view?usp=share_link",
         
        ],
        imageCaption: "From Regulation to Roadmap"
      },
      {
        type: "text",
        title: "Methodology & Launch Actions",
        bulletPoints: [
          "Designed high-converting interactive landing pages, ads for developer signups.",
          "Built user experience blueprints for the original modal cookie sliders to maximize consent collection.",
          "Attracted capital and early-stage trials by presenting interactive clickable high-contrast prototypes representing a mature product."
        ]
      }
    ]
  },
 
  
  {
    id: "bojana",
    title: "Bojana Estudio Redesign",
    challenge: "Directing the physical-to-digital high-end storefront, structural visual grid architecture, and luxury branding framework for a premium architectural studio.",
    impact: "Generated substantial increase in qualified inquiries by framing structural portfolios inside an eye-catching luxury museum aesthetic.",
    icon: "palette",
    tags: ["Branding", "Design Assets"],
    footerBadge: "Luxury Preservation • Qualified High-Ticket Conversion",
    liveUrl: "https://drive.google.com/file/d/17VQemWoQ3Hi07G55l94_M8p7MCeaJ3xi/view?usp=share_link",
    metrics: [
      { value: "2.4x", label: "Increase in Qualified Leads" },
      { value: "400px", label: "Generous White Space Layouts" },
      { value: "15+", label: "Architectural Projects Showcased" }
    ],
    blocks: [
      {
        type: "image",
        imageUrl: "https://drive.google.com/file/d/17VQemWoQ3Hi07G55l94_M8p7MCeaJ3xi/view?usp=share_link",
        imageCaption: "Bojana Estudio Site"
      },
      {
        type: "carousel",
        carouselImages: [
          "https://drive.google.com/file/d/1vdWNqsGOWLzNbLyUkuPGGqMSu0L8ojd4/view?usp=sharing",
          "https://drive.google.com/file/d/1qsUJH2sjn-IMr4WHkzEFCwS808pDSCEZ/view?usp=share_link",
          "https://drive.google.com/file/d/1VZ1u9iofm4heZVHjPDJPBlTDN7kQG1zi/view?usp=share_link"
        ],
        carouselCaption: "Brandbook"
      },
      {
        type: "text",
        title: "Digitalizing Physical Craft",
        paragraphs: [
          "Architecture is about the dialogue of empty spaces, materials, and light. I designed the studio's digital storefront as an extension of their buildings—crafted around extensive empty margins, stunning high-contrast typography, and seamless transitions.",
          "The minimal interface preserves and amplifies the high-value physical catalog, transforming digital viewers into design consult clients."
        ]
      },
      {
        type: "text",
        title: "Spatial Interactive Elements",
        bulletPoints: [
          "Designed an editorial masonry grid aligning blueprints and photographs symmetrically.",
          "Paired high-impact display fonts with Fira Code for technical metric captions.",
          "Optimized high-resolution graphic rendering for immediate loading without visual stutter."
        ]
      }
    ]
  }
];
