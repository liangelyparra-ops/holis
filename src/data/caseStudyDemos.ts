// Local explanatory demos only. No AI calls, policy evaluation or persistence.
export const cookieFields = [
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'vendor', label: 'Vendor' },
] as const;

export type CookieField = typeof cookieFields[number]['key'];
export interface CookieDemoState {
  stage: 'uncategorized' | 'review' | 'approved';
  values: Record<CookieField, string>;
  edited: Partial<Record<CookieField, boolean>>;
}

export const exampleSuggestion: Record<CookieField, string> = {
  category: 'Analytics',
  description: 'Example cookie used to understand visits.',
  vendor: 'Example Metrics',
};

export function createCookieDemoState(): CookieDemoState {
  return { stage: 'uncategorized', values: { ...exampleSuggestion }, edited: {} };
}

export type CookieDemoAction =
  | { type: 'load' }
  | { type: 'edit'; field: CookieField; value: string }
  | { type: 'approve' }
  | { type: 'reset' };

export function canApproveCookie(state: CookieDemoState): boolean {
  return state.stage === 'review' && cookieFields.every(({ key }) => state.values[key].trim().length > 0);
}

export function cookieDemoReducer(state: CookieDemoState, action: CookieDemoAction): CookieDemoState {
  switch (action.type) {
    case 'reset': return createCookieDemoState();
    case 'load': return state.stage === 'uncategorized' ? { ...state, stage: 'review' } : state;
    case 'edit': return state.stage === 'review'
      ? { ...state, values: { ...state.values, [action.field]: action.value }, edited: { ...state.edited, [action.field]: true } }
      : state;
    case 'approve': return canApproveCookie(state) ? { ...state, stage: 'approved' } : state;
  }
}