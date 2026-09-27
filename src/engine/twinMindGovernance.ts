export type PublicMindId = 'chatgpt' | 'claude' | 'gemini' | 'grok' | 'perplexity';

export interface AdmissionResult {
  passed: boolean;
  checkerId: string;
  kickedBackClaims: string[];
  diagnostic: string;
  verifiedAssumptions: string[];
}

export const PUBLIC_MIND_IDS: PublicMindId[] = ['chatgpt', 'claude', 'gemini', 'grok', 'perplexity'];

export function reasoningSegments(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 12)
    .slice(0, 12);
}

export function deterministicAdmissionCheck(mind: any, index: number): AdmissionResult {
  const rawReasoning = Array.isArray(mind?.reasoning)
    ? mind.reasoning.filter((x: any) => typeof x === 'string' && x.trim())
    : [];
  const hypothesis = typeof mind?.hypothesis === 'string' ? mind.hypothesis.trim() : '';
  const reasoning = rawReasoning.length ? rawReasoning : reasoningSegments(hypothesis);
  const kickedBackClaims: string[] = [];

  if (hypothesis.length < 20) kickedBackClaims.push('Hypothesis is too thin to admit.');
  if (reasoning.length < 2) kickedBackClaims.push('At least two explicit reasoning steps are required.');

  const absolutePattern = /\b(guarantee[sd]?|proven|100%|impossible|zero risk|always|never fails)\b/i;
  if (absolutePattern.test(hypothesis) && !reasoning.some((r: string) => /test|evidence|bound|measur|proof|source|data/i.test(r))) {
    kickedBackClaims.push('Absolute claim lacks an explicit evidence/test/bound step.');
  }

  const fabricatedAuthorityPattern = /\b(i authorized|i approve execution|permission granted|chek passed)\b/i;
  if (fabricatedAuthorityPattern.test(hypothesis)) {
    kickedBackClaims.push('Guest mind attempted to assert execution or CHEK authority.');
  }

  return {
    passed: kickedBackClaims.length === 0,
    checkerId: `CHECK-${String.fromCharCode(65 + Math.max(0, index))}`,
    kickedBackClaims,
    diagnostic: kickedBackClaims.length
      ? kickedBackClaims.join(' ')
      : 'Deterministic admission checks passed. This establishes admissibility only, not truth.',
    verifiedAssumptions: [],
  };
}

export function buildPublicMindCasePrompt(problem: string, _caseId?: string): string {
  // Public minds must receive only the operator's question. Twin Mind case
  // metadata, peer awareness, CHEK language, and evaluation instructions stay
  // inside Archie so they cannot bias the independent reasoning sample.
  return problem.trim();
}
