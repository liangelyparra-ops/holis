export type CaseVisualType = 'cookie' | 'enterprise' | 'brand';

export interface UseCaseBlock {
  type: 'text' | 'custom' | 'image';
  customType?: CaseVisualType | 'cookie_live_prototype';
  title?: string;
  paragraphs?: string[];
  bulletPoints?: string[];
  imageUrl?: string;
  imageCaption?: string;
  alt?: string;
}

export interface UseCase {
  id: string;
  title: string;
  challenge: string;
  impact: string;
  icon: string;
  tags: string[];
  footerBadge: string;
  role: string;
  context: string;
  visualType: CaseVisualType;
  evidenceNote: string;
  blocks: UseCaseBlock[];
  liveUrl?: string;
  references?: { label: string; url: string }[];
}

export const useCases: UseCase[] = [
  {
    id: 'bigid_ai_cookie_classification',
    title: 'AI suggestions. Human decisions.',
    challenge: 'Help people classify unfamiliar cookies without silently turning an AI suggestion into a final decision.',
    impact: 'A focused review queue and field-level labels keep proposed information separate from human input.',
    icon: 'psychology',
    tags: ['AI-assisted UX', 'Human review'],
    footerBadge: 'BigID · Cookie Classification',
    role: 'UX/UI design for the classification workflow',
    context: 'Consent management · illow / BigID',
    visualType: 'cookie',
    evidenceNote: 'The local demo uses sample data. The linked prototype demonstrates a design, not a production release or measured impact.',
    liveUrl: 'https://cookie-ai-assist.lovable.app',
    blocks: [
      {
        type: 'text', title: '01. Context & contribution',
        paragraphs: [
          'The Cookie workspace scans a website and groups detected cookies by category. When its classification dictionary does not recognize an item, that item still needs a decision before it can be represented in the consent workflow.',
          'My work on the platform included the UX/UI of this classification flow and collaboration with engineering. The question was how to make AI assistance useful without obscuring who makes the final choice.',
        ],
      },
      {
        type: 'text', title: '02. The boundary to protect',
        bulletPoints: [
          'An uncategorized item needs attention; a model proposal is not a confirmed category.',
          'Category, description and vendor may need different corrections.',
          'Pending review should remain visible rather than blending into the classified list.',
        ],
      },
      {
        type: 'text', title: '03. Decisions & tradeoffs',
        paragraphs: [
          'Concentrate unclassified items in a dedicated review queue. This makes the next action explicit instead of scattering suggestions across an otherwise unchanged table.',
          'Keep approval separate from generation. Automatic application would remove a step, but would hide the boundary between a proposal and a decision.',
          'Track that distinction per field during review. Editing the vendor should mark that field as manual without relabeling an untouched category or description.',
        ],
      },
      { type: 'custom', customType: 'cookie' },
      {
        type: 'text', title: '04. Design outcome',
        paragraphs: [
          'The pattern connects detection, suggestion, review and approval. A reviewer can inspect a proposal, change individual fields and explicitly accept the result.',
          'Field labels describe the current review state. They do not establish a persistent audit trail, model accuracy or legal compliance.',
        ],
      },
      { type: 'custom', customType: 'cookie_live_prototype' },
      {
        type: 'text', title: '05. What I would validate next',
        bulletPoints: [
          'Can reviewers distinguish a pending suggestion from an approved classification?',
          'Are field labels understandable after mixed manual and suggested edits?',
          'How should the queue handle empty results, failed generation and larger batches?',
        ],
      },
    ],
  },
  {
    id: 'bigid_scaling_to_enterprise',
    title: 'Enterprise complexity, one interaction model.',
    challenge: 'Expose organizational rules and regional exceptions without a separate interface for every level.',
    impact: 'A layered model makes rule origin, inheritance and exceptions visible within a shared structure.',
    icon: 'account_tree',
    tags: ['Enterprise UX', 'Systems design'],
    footerBadge: 'BigID · Layered configuration',
    role: 'Product design for layered configuration patterns',
    context: 'Enterprise privacy · BigID',
    visualType: 'enterprise',
    evidenceNote: 'This illustrative model is based on the existing case narrative. Organizations and rules are examples; production screens, release status and usability results are not asserted.',
    blocks: [
      {
        type: 'text', title: '01. Context & contribution',
        paragraphs: [
          'After illow’s acquisition, I continued working at BigID. The existing case material describes extending a privacy product’s patterns to accommodate business units and regional exceptions.',
          'The focus here is the configuration model: making the relationship between a base rule and a more specific rule legible while retaining a common interaction language.',
        ],
      },
      {
        type: 'text', title: '02. Constraints',
        bulletPoints: [
          'Additional organizational levels should not require a ground-up interface redesign.',
          'An inherited value and an explicit exception need distinct explanations.',
          'Dense configuration should preserve context: where am I, and where does this rule come from?',
        ],
      },
      {
        type: 'text', title: '03. Decisions & tradeoffs',
        paragraphs: [
          'Use organization, business unit and region as layers in the same model. A rule row can show its source alongside its value, rather than asking the user to infer inheritance from location alone.',
          'Keep validation and exception patterns consistent across levels. A separate enterprise mode could isolate complexity, but would introduce a second interaction model to understand and maintain.',
          'Show an exception in its parent context rather than as an unrelated configuration. The diagram makes that relationship explicit with example rules.',
        ],
      },
      { type: 'custom', customType: 'enterprise' },
      {
        type: 'text', title: '04. Design outcome',
        paragraphs: [
          'The model explains how base rules can carry through organizational layers while exceptions remain visible. This is a structural design response, not a measured claim of increased capacity or reduced support load.',
          'The same rule row, source label and validation vocabulary can apply at each level without hiding the additional complexity.',
        ],
      },
      {
        type: 'text', title: '05. What I would validate next',
        bulletPoints: [
          'Can someone identify the source of a rule without opening every parent level?',
          'Are inherited values distinguishable from explicit exceptions?',
          'Does the structure remain understandable with deeper hierarchies and longer lists?',
        ],
      },
    
    ],
  },
  {
    id: 'illow_brand_system',
    title: 'One visual foundation, multiple channels.',
    challenge: 'Keep identity, website, paid campaigns and social coherent without treating every asset as a new system.',
    impact: 'Shared visual rules and repeatable layouts connect brand work across channels and into product design.',
    icon: 'campaign',
    tags: ['Brand systems', 'Visual design'],
    footerBadge: 'illow · Brand continuity',
    role: 'Visual identity and marketing design',
    context: 'B2B privacy product · illow',
    visualType: 'brand',
    evidenceNote: 'Original design assets produced for illow marketing and campaign launches. The interactive system map illustrates reuse principles across channels.',
    blocks: [
      {
        type: 'text', title: '01. Context & contribution',
        paragraphs: [
          'My initial work at illow covered visual identity and marketing design, including websites, landing pages and campaign assets. I later moved into its core product experience.',
          'The portfolio work describes a shared system spanning identity, web, paid ads and social. This case focuses on the relationship between common rules and channel-specific layouts across digital touchpoints.',
        ],
      },
      {
        type: 'image',
        imageUrl: 'https://drive.google.com/file/d/1RaXo5PfAY3AWsNuaJ9BVLhl1UVl-RN9p/view?usp=sharing',
        imageCaption: 'Marketing asset · Visual foundation, typographic lockup and brand layout across digital touchpoints.',
        alt: 'illow marketing visual identity and website design asset',
      },
      {
        type: 'text', title: '02. Constraints',
        bulletPoints: [
          'Different formats need different hierarchies without becoming unrelated identities.',
          'Reusable patterns should leave room for message and format changes.',
          'The foundation should stay coherent as work expands from marketing into product.',
        ],
      },
      {
        type: 'text', title: '03. Decisions & tradeoffs',
        paragraphs: [
          'Treat color, typography, spacing and layout relationships as shared rules, with channel-specific templates rather than a universal composition.',
          'Separate reusable structure from campaign content. A headline, supporting message and call to action can change without redefining the entire asset.',
          'Balance consistency with context: a landing page can explain more than an ad; a social format can emphasize one idea. Reuse should support those differences, not flatten them.',
        ],
      },
      { type: 'custom', customType: 'brand' },
      {
        type: 'text', title: '04. Design outcome',
        paragraphs: [
          'The system approach connects communication across formats and provides a foundation for the later move into product design. No production-time improvement or campaign-performance figure is claimed.',
          'The design collateral and blueprint below demonstrate how the visual hierarchy adapts from commercial marketing to strategic product communication.',
        ],
      },
      {
        type: 'image',
        imageUrl: 'https://drive.google.com/file/d/1knrRCKiUMyjzhXRbiCc3PPvwJUtp9qfk/view?usp=share_link',
        imageCaption: '“From Regulation to Roadmap” · Cross-channel campaign asset and strategic blueprint.',
        alt: 'Strategic blueprint: From Regulation to Roadmap campaign asset',
      },
      {
        type: 'text', title: '05. What I would validate next',
        bulletPoints: [
          'Can another designer produce a new format using the same rules?',
          'Which rules stay fixed, and which can adapt to content and channel?',
          'Is marketing-to-product continuity recognizable without forcing identical layouts?',
        ],
      },
    ],
  },
];