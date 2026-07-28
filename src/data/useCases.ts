export interface UseCaseBlock {
  type: 'text' | 'image' | 'carousel' | 'video' | 'pdf' | 'custom';
  customType?: 'illow_diagram' | 'illow_callout' | 'illow_adapt' | 'bigid_diagram' | 'bigid_callout' | 'bigid_adapt' | 'brand_channels' | 'brand_diagram' | 'brand_callout' | 'brand_gallery' | 'brand_todo' | 'brand_adapt' | 'cookie_flow_diagram' | 'cookie_trust_callout' | 'cookie_interactive_preview' | 'cookie_adapt' | 'cookie_live_prototype';
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
    challenge: "The scanner's dictionary couldn't recognize every cookie, leaving client sites exposed. Automating outright posed legal risk, so we needed AI to close the gap while keeping every classification defensible by a human.",
    impact: "Engineered a dedicated AI suggestion review queue with field-level trust mechanics, transforming a tedious cookie-by-cookie audit into a fast pass while keeping every classification legally defensible.",
    icon: "psychology",
    tags: ["AI Governance", "AIX Strategy", "UX Strategy"],
    footerBadge: "BigID • AI Governance & Interface Explainability",
    liveUrl: "https://cookie-ai-assist.lovable.app",
    metrics: [
      { value: "100%", label: "Human Decision Traceability" },
      { value: "3x", label: "Faster Queue Review Speed" },
      { value: "0", label: "Unvetted Auto-Applies" }
    ],
    blocks: [
      {
        type: "text",
        title: "01. Context",
        paragraphs: [
          "The Cookie workspace, originally illow's core product and now part of BigID's larger platform following the acquisition, scans a client's website and detects every cookie, tracking pixel, and third-party script it uses. To generate a legally compliant consent banner, each cookie has to be sorted into one of the platform's mandatory categories (e.g. Necessary, Functional, Analytics, Marketing)."
        ]
      },
      {
        type: "text",
        title: "02. The Problem",
        paragraphs: [
          "The scanner's classification dictionary couldn't recognize every cookie it found, as newer or less common vendors would come back as Uncategorized. This wasn't a cosmetic gap: an uncategorized cookie can't be correctly represented in a consent banner, which means the client site is left exposed on the exact compliance problem the product exists to solve.",
          "For some tenants, the volume of uncategorized cookies could be substantial, not a handful of edge cases, but enough to make manual research a real burden. For a platform whose value proposition is 'get your consent management right,' an incomplete categorization list undermines the core promise and left users doing tedious cookie-by-cookie manual research to close the gap themselves."
        ]
      },
      {
        type: "text",
        title: "03. Role & Constraints",
        paragraphs: [
          "I owned the end-to-end UX/UI for the platform, including this feature, working directly with engineering with light day-to-day product oversight.",
          "The brief: use AI to close the categorization gap without letting the AI silently make compliance-relevant decisions on the client's behalf, as a wrong auto-applied category is a legal risk, not just a UX inconvenience."
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
        content: "Approving with no edits applies the suggestion as-is and moves the cookie into its category. Editing breaks the suggestion tag on that field specifically, so what's ultimately saved is always traceable back to whether a human validated it as-is or altered it."
      },
      {
        type: "custom",
        customType: "cookie_live_prototype"
      },
      {
        type: "text",
        title: "05. Why This Pattern",
        paragraphs: [
          "Automating cookie categorization outright would have been the faster build. The reason it wasn't designed that way: in a compliance product, an AI that classifies with full autonomy removes the one thing that makes the classification defensible: a human decision behind it.",
          "The suggestion/approval loop keeps the AI doing the labor-intensive first pass (reading dictionary gaps, proposing category + description + vendor together) while keeping the accountability with the person who understands their own site's legal exposure. The edit-breaks-suggestion mechanic extends that same logic down to the field level, so approval isn't an all-or-nothing rubber stamp."
        ]
      },
      {
        type: "text",
        title: "06. Outcome & Impact",
        paragraphs: [
          "Approving a suggestion moved the cookie straight into its category, closing exactly the gap that made the platform's core promise incomplete. Instead of manually researching each unrecognized cookie's vendor, category, and purpose one by one, users could clear an entire backlog by reviewing AI-generated suggestions in a single dedicated queue, correcting only what actually needed correcting.",
          "For tenants with a large volume of uncategorized cookies, this turned what had been a slow, manual audit into a fast review pass, while keeping every applied category traceable to a human decision, whether that was a straight approval or an edit."
        ]
      }
    ]
  },
  {
    id: "illow_brand_system",
    title: "Building one brand system across every channel",
    challenge: "Identity, website, paid ads, and social, designed and held consistent end-to-end for an international B2B launch, before the platform's UX even existed.",
    impact: "Created a centralized token-based design system, increasing production speed by 25–35% while preserving absolute visual trust across four major channels through to acquisition.",
    icon: "campaign",
    tags: ["Brand System", "Creative Direction", "Systems Design"],
    footerBadge: "Omnichannel System • Brand Continuity",
    liveUrl: "https://drive.google.com/file/d/1RaXo5PfAY3AWsNuaJ9BVLhl1UVl-RN9p/view?usp=sharing",
    metrics: [
      { value: "1", label: "Designer covering all channels" },
      { value: "25–35%", label: "Faster production speed" },
      { value: "✓", label: "Visual consistency held" }
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
          "1 Designer covering identity, web, ads & social simultaneously.",
          "25–35% Faster production via standardized, reusable templates.",
          "✓ Visual consistency held across markets through to acquisition."
        ]
      },
      {
        type: "text",
        title: "06. Reflection",
        paragraphs: [
          "Running four channels solo taught me to design systems before assets, but it also meant I was the single point of failure for brand consistency. If I did this again, I'd document the system as a shareable guideline earlier, rather than carrying it mostly in my own head, so it could survive beyond me."
        ]
      },
      {
        type: "custom",
        customType: "brand_todo"
      }
    ]
  },
  {
    id: "bigid_scaling_to_enterprise",
    title: "Scaling a mid-market product to enterprise",
    challenge: "How I adapted a privacy platform's core patterns to support enterprise-scale, multi-tenant complexity, without a ground-up rebuild.",
    impact: "Extended the existing component library to nest permission-row, validation, and conflict-detection patterns, letting the platform absorb 10x more complexity without a parallel rebuild.",
    icon: "grid_view",
    tags: ["Systems Design", "AIX Strategy"],
    footerBadge: "Enterprise Systems • Multi-Tenant Complexity",
    metrics: [
      { value: "10x", label: "Managed data volume" },
      { value: "35%", label: "Reduction in cognitive load" },
      { value: "20%", label: "Faster joint release cycles" }
    ],
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
          "The existing interface patterns worked well for a handful of tenants with moderate rule complexity. Enterprise clients needed to manage data governance across dozens of business units, each with distinct compliance rules, and doing that inside the existing UI would have meant either a full rebuild (too slow, too risky for existing customers) or bolting on complexity that would raise cognitive load for everyone."
        ]
      },
      {
        type: "text",
        title: "03. Constraints",
        bulletPoints: [
          "Existing mid-market customers were live on the platform, so any change had to be backward-compatible.",
          "No dedicated PM for this initiative; I owned problem definition and success criteria directly with engineering.",
          "Global organizations required WCAG 2.1 AA compliance and support for internal AI governance workflows (AIX) that didn't exist in the original product."
        ]
      },
      {
        type: "text",
        title: "04. Process & Decisions",
        paragraphs: [
          "Success criterion, defined before designing anything: support multi-tenant configuration for enterprise-scale data volume without increasing the number of setup steps perceived by any single user, whether mid-market or enterprise. Complexity had to live in the system's structure, not in the number of clicks a person faced.",
          "Research: structured interviews with enterprise data-governance teams surfaced a pattern absent from the original design: users needed to reason about permissions in layers (org-wide → business unit → region) rather than as one flat rule set. The existing UI exposed one flat layer, so enterprise users compensated with spreadsheets outside the tool, a strong signal the interface didn't match their mental model."
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
        content: "Rather than design three separate interfaces for the three governance layers, I extended the existing component library so the same permission-row, validation, and conflict-detection patterns from the mid-market product (see Illow case study) could be nested. This is what let the platform absorb 10x more data-governance complexity without a parallel rebuild."
      },
      {
        type: "text",
        paragraphs: [
          "AI governance (AIX): enterprise clients also needed visibility into how internal AI models used their governed data. I defined agentic workflow patterns and explainability signals, surfacing at each layer which automated process touched which data category and why, so trust in automation didn't depend on a black box.",
          "Alternative considered and rejected: a fully separate 'enterprise mode' UI. I rejected it because it would have doubled the maintenance surface for engineering and made it harder for mid-market customers to grow into enterprise usage without relearning the tool."
        ]
      },
      {
        type: "text",
        title: "05. Result",
        paragraphs: [
          "10x Growth in managed data volume without a base-flow redesign.",
          "35% Reduction in enterprise cognitive load, measured in moderated testing.",
          "20% Faster joint release cycles via cross-functional frameworks."
        ]
      },
      {
        type: "text",
        title: "06. Reflection",
        paragraphs: [
          "The layered model solved the immediate need, but in hindsight I'd push earlier for a dedicated enterprise research pool, as I leaned on a small number of design partners longer than I should have before validating the layered structure more broadly."
        ]
      }
    ]
  },
  {
    id: "illow_brand_to_product",
    title: "Illow: From Brand Identity to Product System",
    challenge: "Spotting the gap between a high-converting brand promise and a dense, technical configuration panel, leading my own transition into UX to design an inline conflict resolution flow.",
    impact: "Designed the highest-friction configuration flow with inline validation and conflict states, dramatically reducing mid-flow drop-off and configuration support tickets.",
    icon: "alt_route",
    tags: ["UX Strategy", "Information Architecture"],
    footerBadge: "UX Transformation • Inline Conflict Resolution Flow",
    metrics: [
      { value: "↓", label: "Drop-off at conflict step" },
      { value: "↓", label: "Configuration support tickets" },
      { value: "40%", label: "Reduction in design & tech debt" }
    ],
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
          "As the marketing funnel started converting well, a gap opened up: users arrived drawn in by a clear, simple brand promise, but the product itself, a privacy configuration panel with multi-tenant logic, felt dense, technical, and disconnected from that promise. This wasn't just a hunch; it showed up in post-signup funnel drop-off and in how long it took a new user to complete their first configuration.",
          "I proposed and led my own transition into the platform's foundational UX team, with the mandate to close that gap between brand and product."
        ]
      },
      {
        type: "text",
        title: "03. Constraints",
        bulletPoints: [
          "No dedicated research team: I designed and ran research myself with existing clients.",
          "Multi-tenant platform: any flow change had to work for very different privacy setups, from a small startup to a corporation with dozens of consent rules.",
          "Small engineering team, so any redesign had to ship incrementally, never as a single 'big bang' relaunch."
        ]
      },
      {
        type: "text",
        title: "04. Process & Decisions",
        paragraphs: [
          "Success criterion, defined before designing anything: a new user should be able to complete a valid privacy configuration in their first session, without abandoning midway or needing support. That was the metric I was designing toward, not 'make it look better.'",
          "Research: I ran moderated interviews with existing users and reviewed support tickets for patterns. The strongest signal: users dropped off at the step where the system asked them to define consent rules that conflicted with each other, for example allowing a data category broadly but restricting it for a specific region, and the system blocked progress without explaining the conflict."
        ]
      },
      {
        type: "custom",
        customType: "illow_callout",
        title: "Edge Case: The Core of the Redesign",
        content: "Instead of a generic error message, I designed an inline validation system that (1) detects the conflict the moment it's created, (2) explains in plain language which rule clashes with which, (3) offers two clear resolution paths instead of forcing a restart, and (4) preserves a partial-save state so users can leave and return without losing progress, something that didn't exist before and drove a large share of support tickets."
      },
      {
        type: "custom",
        customType: "illow_diagram"
      },
      {
        type: "text",
        paragraphs: [
          "Prototype fidelity: to validate the flow logic before investing in visual polish, I used medium-fidelity clickable wireframes with real users. That fidelity was a deliberate choice: I needed to validate decision logic, not visual style, and high fidelity would have pulled feedback toward color and type instead of flow.",
          "Alternative considered and rejected: simplifying the permissions model so conflicts couldn't occur. I rejected it, as that complexity reflected real compliance needs from enterprise clients; over-simplifying would have fixed user confusion at the cost of removing capabilities they actually needed.",
          "Design system: I documented the new patterns (inline validation, conflict states, partial save) as reusable components rather than a one-off screen, so the rest of the product could adopt the same logic without a separate redesign per flow."
        ]
      },
      {
        type: "text",
        title: "05. Result",
        paragraphs: [
          "↓ Drop-off at conflict step, measured in moderated testing.",
          "↓ Drop-off in 'Can't save my configuration' support tickets.",
          "40% Reduction in design & technical debt from the reusable component system.",
          "Note: exact percentage figures for drop-off and ticket reduction to be confirmed against original testing notes before publishing."
        ]
      },
      {
        type: "text",
        title: "06. Reflection",
        paragraphs: [
          "If I did this again, I'd instrument quantitative analytics from day one of the new flow, as at the time I relied too heavily on moderated testing and support tickets as signal. I'd also document the 'why' behind each design decision in the moment, not after the fact; reconstructing that reasoning for this case took longer than it should have."
        ]
      }
    ]
  },
  {
    id: "illow_case1",
    title: "illow: Scaling a B2B Data Privacy Platform from Startup to Acquisition.",
    challenge: "How I owned the end-to-end product design and visual strategy for a data-privacy compliance startup, working hand-in-hand with executive leadership to transform complex global regulations into an intuitive SaaS platform, ultimately leading to its successful acquisition by BigID.",
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
          "https://drive.google.com/file/d/1knrRCKiUMyjzhXRbiCc3PPvwJUtp9qfk/view?usp=share_link"
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
  }
];
