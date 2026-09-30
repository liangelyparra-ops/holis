export interface UseCaseBlock {
  type: 'text' | 'image' | 'carousel' | 'video' | 'pdf' | 'custom';
  customType?: 'illow_diagram' | 'illow_callout' | 'illow_adapt' | 'bigid_diagram' | 'bigid_callout' | 'bigid_adapt' | 'brand_channels' | 'brand_diagram' | 'brand_callout' | 'brand_gallery' | 'brand_adapt' | 'cookie_flow_diagram' | 'cookie_trust_callout' | 'cookie_interactive_preview' | 'cookie_adapt' | 'cookie_live_prototype';
  content?: string;
  
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
    id: "bigid_ai_cookie_classification",
    title: "AI-Assisted Cookie Classification: Designing Trust Into Automated Suggestions",
    challenge: "The scanner's dictionary couldn't recognize every cookie. The workflow needed to use AI without silently turning a suggestion into a final, compliance-relevant decision.",
    impact: "Designed a dedicated review queue that keeps AI suggestions distinct from human decisions and preserves the origin of each field while it is reviewed.",
    icon: "psychology",
    tags: ["AI Governance", "AIX Strategy", "UX Strategy"],
    footerBadge: "BigID • AI Governance & Interface Explainability",
    liveUrl: "https://cookie-ai-assist.lovable.app",
    blocks: [
      {
        type: "text",
        title: "01. Context",
        paragraphs: [
          "The Cookie workspace, originally part of illow's core product and later developed within BigID following the acquisition, scans a website and detects cookies and related technologies. Each item then needs a category, such as Necessary, Functional, Analytics or Marketing, so it can be represented in the consent-management workflow."
        ]
      },
      {
        type: "text",
        title: "02. The Problem",
        paragraphs: [
          "The scanner's classification dictionary couldn't recognize every cookie it found, as newer or less common vendors would come back as Uncategorized. This wasn't a cosmetic gap: an uncategorized cookie still required a decision before it could be represented accurately in the consent experience.",
          "For some tenants, the volume of uncategorized cookies could be substantial, not a handful of edge cases, but enough to make manual research a real burden. For a platform whose value proposition is 'get your consent management right,' an incomplete categorization list undermines the core promise and left users doing tedious cookie-by-cookie manual research to close the gap themselves."
        ]
      },
      {
        type: "text",
        title: "03. Role & Constraints",
        paragraphs: [
          "I owned the end-to-end UX/UI for the platform, including this feature, working directly with engineering with light day-to-day product oversight.",
          "The brief: use AI to help close the categorization gap without letting the system silently make a consequential classification on the user's behalf."
        ]
      },
      {
        type: "text",
        title: "04. The 5-Step Workflow",
        bulletPoints: [
          "1. Detecting the gap: After a scan completes, cookies land in the table sorted by category, including a distinct Uncategorized bucket for anything the dictionary couldn't match.",
          "2. Triggering AI classification: An 'AI Classification' action filters the table to only uncategorized cookies. Confirming opens a short loading state while the model processes in the backend, and then the user gets a notification: 'You have [N] suggestions to review.'",
          "3. Dedicated review queue, not a silent update: Clicking through filters the table to exactly those cookies, flagged with an Action Required status. Nothing changes automatically, so every suggestion sits in a pending state until a human acts on it.",
          "4. Reviewing a suggestion: Opening a cookie's edit modal shows the AI's proposal across three fields at once: category, description, and vendor, each visually marked as AI-suggested rather than blended in as fact.",
          "5. The trust mechanic: The moment a user edits any one of those fields, even just correcting the vendor name, that field silently loses its 'AI suggestion' status and becomes a manual entry. Approving with no edits applies the suggestion as-is."
        ]
      },
      {
        type: "custom",
        customType: "cookie_trust_callout",
        title: "The Trust Mechanic: Core Design Decision",
        content: "Approving with no edits applies the suggestion as-is and moves the cookie into its category. Editing removes the suggestion label from that field specifically, keeping the distinction between model-proposed and manually entered information visible during review."
      },
      {
        type: "custom",
        customType: "cookie_live_prototype"
      },
      {
        type: "text",
        title: "05. Why This Pattern",
        paragraphs: [
          "A fully automatic classification would reduce interaction, but it would also hide an important boundary between a model proposal and the user's final decision. The review step was kept explicit for that reason.",
          "The suggestion/approval loop lets the model propose category, description and vendor together while keeping the final choice with the user. The edit-breaks-suggestion mechanic extends that distinction to each field, so approval isn't an all-or-nothing action."
        ]
      },
      {
        type: "text",
        title: "06. Outcome & Impact",
        paragraphs: [
          "Approving a suggestion moved the cookie straight into its category, closing exactly the gap that made the platform's core promise incomplete. Instead of manually researching each unrecognized cookie's vendor, category, and purpose one by one, users could clear an entire backlog by reviewing AI-generated suggestions in a single dedicated queue, correcting only what actually needed correcting.",
          "The resulting design concentrates unclassified items in one review flow and makes it possible to correct only the fields that need attention."
        ]
      }
    ]
  },
  {
    id: "illow_brand_system",
    title: "Building one brand system across every channel",
    challenge: "Identity, website, paid ads, and social, designed and held consistent end-to-end for an international B2B launch, before the platform's UX even existed.",
    impact: "Created a shared visual system for identity, website, paid campaigns and social content, replacing one-off decisions with reusable rules and templates.",
    icon: "campaign",
    tags: ["Brand System", "Creative Direction", "Systems Design"],
    footerBadge: "Omnichannel System • Brand Continuity",
    liveUrl: "https://drive.google.com/file/d/1RaXo5PfAY3AWsNuaJ9BVLhl1UVl-RN9p/view?usp=sharing",
    metrics: [
      { value: "1", label: "Designer covering all channels" },
      { value: "4", label: "Channels using shared rules" },
      { value: "1×", label: "Reusable visual system" }
    ],
    blocks: [
      {
        type: "text",
        title: "01. Context",
        paragraphs: [
          "Before Illow had a dedicated UX team, someone had to be the single source of visual truth for a B2B privacy startup trying to look credible to enterprise buyers from day one. That was me, the only designer across brand identity, the marketing website, paid ad creative, and social presence."
        ]
      },
      {
        type: "text",
        title: "02. The Problem",
        paragraphs: [
          "A B2B privacy product sells trust before it sells features. Every channel, such as an ad, a LinkedIn post, or the homepage, was a chance to either build or undercut that trust. With one designer and no shared system, the risk was obvious: each channel drifting into its own visual dialect, which for a privacy company would have read as a lack of rigor."
        ]
      },
      {
        type: "custom",
        customType: "brand_channels"
      },
      {
        type: "text",
        title: "04. Process & Decisions",
        paragraphs: [
          "The decision that made this scalable: instead of designing each channel as its own project, I built one token-based system first, covering color, type, spacing, and a small set of layout patterns, and treated the website, ads, and social templates as different expressions of the same underlying rules. That's what let one person keep four channels consistent without redoing the thinking each time.",
          "Website / landing pages: designed for funnel-stage intent rather than one generic homepage, where a cold-traffic landing page led with trust signals and plain-language explanations of privacy concepts; a bottom-funnel page for warm leads led with product specificity and a direct CTA.",
          "Paid ad creative: built a small set of modular templates (headline zone, proof-point zone, CTA zone) that could be reskinned per campaign in hours instead of days, since paid campaigns needed fast iteration based on performance data.",
          "Social: defined a repeatable content system (a handful of post formats tied to the same type and color rules) so the account didn't depend on one-off creative decisions per post, and could be handed off or scaled without me personally designing every asset."
        ]
      },
      {
        type: "custom",
        customType: "brand_diagram"
      },
      {
        type: "custom",
        customType: "brand_callout",
        title: "Alternative Considered & Rejected",
        content: "A more expressive, illustration-heavy identity, which is more common in consumer-facing B2C brands. I rejected it because the primary audience was enterprise privacy and compliance buyers, where a more restrained, precise visual language did more to build credibility than personality-led illustration would have."
      },
      {
        type: "custom",
        customType: "brand_gallery"
      },
      {
        type: "text",
        title: "05. Result",
        paragraphs: [
          "One designer covered identity, web, paid campaigns and social using a shared set of visual rules.",
          "Reusable templates reduced repeated design decisions and made campaign variations easier to produce.",
          "The system created continuity between illow's product and communication as the company evolved."
        ]
      },
      {
        type: "text",
        title: "06. Reflection",
        paragraphs: [
          "Running four channels solo taught me to design systems before assets, but it also meant I was the single point of failure for brand consistency. If I did this again, I'd document the system as a shareable guideline earlier, rather than carrying it mostly in my own head, so it could survive beyond me."
        ]
      },
    ]
  },
  {
    id: "bigid_scaling_to_enterprise",
    title: "Scaling a mid-market product to enterprise",
    challenge: "How I adapted a privacy platform's core patterns to support enterprise-scale, multi-tenant complexity, without a ground-up rebuild.",
    impact: "Extended existing permission, validation and conflict patterns into a layered model rather than creating a separate enterprise interface.",
    icon: "grid_view",
    tags: ["Systems Design", "AIX Strategy"],
    footerBadge: "Enterprise Systems • Multi-Tenant Complexity",
    blocks: [
      {
        type: "text",
        title: "01. Context",
        paragraphs: [
          "After BigID acquired Illow, the privacy platform I had helped build needed to serve a very different customer profile: large, global organizations with far more complex data governance requirements than the mid-market clients it was originally designed for."
        ]
      },
      {
        type: "text",
        title: "02. The Problem",
        paragraphs: [
          "The existing interface patterns were created for a simpler organizational model. Enterprise use introduced multiple business units and regional exceptions, while the product still needed to support existing configurations. The design challenge was to add those layers without forcing every user into a separate interface."
        ]
      },
      {
        type: "text",
        title: "03. Constraints",
        bulletPoints: [
          "Existing mid-market customers were live on the platform, so any change had to be backward-compatible.",
          "The solution had to extend existing patterns instead of requiring a ground-up rebuild.",
          "Dense data and nested policy relationships had to remain understandable at different levels of the organization."
        ]
      },
      {
        type: "text",
        title: "04. Process & Decisions",
        paragraphs: [
          "The design goal was to support multi-tenant configuration while keeping the additional complexity in the system's structure rather than duplicating the whole workflow.",
          "The proposed model organized permissions in layers—organization, business unit and region—so users could understand where a policy originated and where an exception applied."
        ]
      },
      {
        type: "custom",
        customType: "bigid_diagram"
      },
      {
        type: "custom",
        customType: "bigid_callout",
        title: "Key Decision",
        content: "Rather than design separate interfaces for each governance layer, I extended the existing component library so the same permission-row, validation and conflict patterns could be nested. This reduced the need for parallel interaction models."
      },
      {
        type: "text",
        paragraphs: [
          "For AI-related workflows, I explored visibility patterns that connect an automated process with the data category it uses, keeping system behavior inspectable rather than presenting it as a black box.",
          "Alternative considered and rejected: a fully separate 'enterprise mode' UI. I rejected it because it would have doubled the maintenance surface for engineering and made it harder for mid-market customers to grow into enterprise usage without relearning the tool."
        ]
      },
      {
        type: "text",
        title: "05. Result",
        paragraphs: [
          "The layered model reused the base interaction patterns instead of introducing a separate enterprise mode.",
          "Permission rows, validation and conflict states could remain consistent across organizational levels.",
          "The model makes inherited rules and regional exceptions visible within the same interaction structure."
        ]
      },
      {
        type: "text",
        title: "06. Reflection",
        paragraphs: [
          "The layered model addressed the structural problem, but a future iteration should test how quickly people can identify inherited rules and exceptions across different data volumes."
        ]
      }
    ]
  },
  {
    id: "illow_brand_to_product",
    title: "Illow: From Brand Identity to Product System",
    challenge: "Closing the gap between a clear brand promise and a dense, technical configuration panel as I moved from brand ownership into product design.",
    impact: "Designed an inline conflict-resolution flow with plain-language explanations, resolution paths and reusable validation states.",
    icon: "alt_route",
    tags: ["UX Strategy", "Information Architecture"],
    footerBadge: "UX Transformation • Inline Conflict Resolution Flow",
    blocks: [
      {
        type: "text",
        title: "01. Context",
        paragraphs: [
          "Illow was a B2B SaaS platform for privacy and consent management. I joined as the lead for brand identity and marketing design, including brand sites, landing pages, and the company's full commercial communication system. There was no formal UX team yet."
        ]
      },
      {
        type: "text",
        title: "02. The Problem",
        paragraphs: [
          "The brand communicated privacy in clear language, but the product itself contained dense configuration and multi-tenant logic. The experience needed the same clarity without removing necessary controls.",
          "I moved from owning illow's visual identity and marketing work into its core product experience, eventually working as the company's sole UX designer."
        ]
      },
      {
        type: "text",
        title: "03. Constraints",
        bulletPoints: [
          "Multi-tenant platform: any flow change had to work for very different privacy setups, from a small startup to a corporation with dozens of consent rules.",
          "Small engineering team, so any redesign had to ship incrementally, never as a single 'big bang' relaunch."
        ]
      },
      {
        type: "text",
        title: "04. Process & Decisions",
        paragraphs: [
          "The design goal was to help a user resolve a conflicting rule without restarting the configuration or losing the work already completed.",
          "The key interaction problem appeared when one consent rule conflicted with another—for example, allowing a data category broadly while restricting it for a region—and the interface blocked progress without explaining a path forward."
        ]
      },
      {
        type: "custom",
        customType: "illow_callout",
        title: "Edge Case: The Core of the Redesign",
        content: "Instead of a generic error message, I designed an inline validation system that detects a conflict, explains which rules clash, offers clear resolution paths and preserves the rest of the configuration."
      },
      {
        type: "custom",
        customType: "illow_diagram"
      },
      {
        type: "text",
        paragraphs: [
          "Prototype fidelity: I used medium-fidelity clickable wireframes to focus review on decision logic before investing in visual polish.",
          "Alternative considered and rejected: simplifying the permissions model so conflicts couldn't occur. I rejected it, as that complexity reflected real compliance needs from enterprise clients; over-simplifying would have fixed user confusion at the cost of removing capabilities they actually needed.",
          "Design system: I documented the new patterns (inline validation, conflict states, partial save) as reusable components rather than a one-off screen, so the rest of the product could adopt the same logic without a separate redesign per flow."
        ]
      },
      {
        type: "text",
        title: "05. Result",
        paragraphs: [
          "Conflicts became visible at the point where they were created instead of appearing as an unexplained hard stop.",
          "Users were given explicit resolution paths while the rest of their configuration remained intact.",
          "The validation and conflict states were documented as reusable patterns for other flows."
        ]
      },
      {
        type: "text",
        title: "06. Reflection",
        paragraphs: [
          "If I did this again, I'd instrument the flow from the start and document the rationale alongside each state. That would make it easier to compare completion, recovery and support signals after implementation."
        ]
      }
    ]
  },
  {
    id: "illow_case1",
    title: "Building and evolving illow’s product experience",
    challenge: "How my role grew from visual identity and marketing design into the core experience of a B2B privacy product, followed by continued work at BigID after the acquisition.",
    impact: "Created continuity between illow's brand and product, established reusable interface patterns and supported the product through a change in organizational context.",
    icon: "rocket_launch",
    tags: ["UX Strategy", "Branding"],
    footerBadge: "Zero-To-One Blueprint • Cohesive Privacy Identity",
    liveUrl: "https://illow.io",
    metrics: [
      { value: "2021–24", label: "Product work at illow" },
      { value: "1×", label: "Shared component ecosystem" },
      { value: "2024–26", label: "Continued work at BigID" }
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
          "That visual foundation later informed my transition into the product, where I became illow's sole UX designer and worked on its core experience."
        ]
      },
      {
        type: "image",
        carouselImages: [
          "https://drive.google.com/file/d/1knrRCKiUMyjzhXRbiCc3PPvwJUtp9qfk/view?usp=share_link"
        ],
        imageCaption: "From Regulation to Roadmap"
      },
      {
        type: "text",
        title: "Methodology & Launch Actions",
        bulletPoints: [
          "Designed landing pages and campaign assets around different levels of product awareness.",
          "Translated the visual system into product interface patterns as my role expanded into UX.",
          "Built clickable prototypes to communicate workflows and collaborate with product and engineering."
        ]
      }
    ]
  }
];
