import express, { Request, Response } from 'express';
import path from 'path';
import { createHash, randomUUID } from 'crypto';
import { mkdir, readFile, writeFile, rename } from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { deterministicAdmissionCheck, PUBLIC_MIND_IDS, type PublicMindId } from './src/engine/twinMindGovernance';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const PATTY_MODEL = process.env.PATTY_MODEL || 'gpt-5.6';
let ai: GoogleGenAI | null = null;

interface PublicMindSubmission {
  evidenceId: string;
  evidenceHash: string;
  id: PublicMindId;
  name: string;
  provider: string;
  response: string;
  capturedAt: string;
  sourceMode: 'PUBLIC_FRESH_SESSION' | 'MANUAL_CAPTURE' | 'SUPPORTED_CONNECTOR';
  revision: number;
  parentEvidenceHash?: string;
  challengeId?: string;
  admission: ReturnType<typeof deterministicAdmissionCheck>;
}

interface PattyChallenge {
  id: string;
  target: PublicMindId;
  instruction: string;
  createdAt: string;
  sourceEvidenceHashes: string[];
  status: 'AWAITING_RESPONSE' | 'ANSWERED';
}

interface TwinMindCase {
  id: string;
  problem: string;
  createdAt: string;
  updatedAt: string;
  submissions: PublicMindSubmission[];
  challenges: PattyChallenge[];
  history: Array<{ at: string; event: string; detail: string }>;
}

const twinMindCases = new Map<string, TwinMindCase>();
let persistQueue: Promise<void> = Promise.resolve();

function canonicalize(value: any): string {
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + canonicalize(value[k])).join(',') + '}';
  return JSON.stringify(value);
}

function sha256(value: any): string {
  return createHash('sha256').update(canonicalize(value)).digest('hex');
}
const CASE_STORE_PATH = process.env.CASE_STORE_PATH || path.join(__dirname, 'data', 'twin-mind-cases.json');

async function loadTwinMindCases() {
  try {
    const raw = await readFile(CASE_STORE_PATH, 'utf8');
    const rows = JSON.parse(raw);
    if (Array.isArray(rows)) for (const item of rows) if (item?.id) {
      item.submissions = Array.isArray(item.submissions) ? item.submissions : [];
      item.challenges = Array.isArray(item.challenges) ? item.challenges : [];
      twinMindCases.set(item.id, item);
    }
  } catch (err: any) {
    if (err?.code !== 'ENOENT') console.warn('Twin Mind case store load failed:', err?.message);
  }
}

async function persistTwinMindCases() {
  persistQueue = persistQueue.then(async () => {
    await mkdir(path.dirname(CASE_STORE_PATH), { recursive: true });
    const tmp = `${CASE_STORE_PATH}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify([...twinMindCases.values()], null, 2), 'utf8');
    await rename(tmp, CASE_STORE_PATH);
  });
  return persistQueue;
}

function createCase(problem: string): TwinMindCase {
  const now = new Date().toISOString();
  const item: TwinMindCase = {
    id: `CASE-${randomUUID().toUpperCase()}`,
    problem,
    createdAt: now,
    updatedAt: now,
    submissions: [],
    challenges: [],
    history: [{ at: now, event: 'CASE_CREATED', detail: 'Patty opened a persistent deliberation case.' }],
  };
  twinMindCases.set(item.id, item);
  return item;
}

async function runPattyOpenAI(prompt: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: PATTY_MODEL,
      input: prompt,
      text: { format: { type: 'json_object' } },
    }),
  });
  if (!response.ok) throw new Error(`Patty OpenAI request failed: ${response.status} ${await response.text()}`);
  const data: any = await response.json();
  if (typeof data.output_text === 'string') return data.output_text;
  const parts = Array.isArray(data.output) ? data.output.flatMap((o: any) => o?.content || []) : [];
  return parts.find((p: any) => p?.type === 'output_text')?.text || null;
}

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Gemini AI:', err);
  }
}


function normalizeMind(m: any, index: number) {
  return {
    id: m?.id || ['charlie','claude','gemini','athena','daedalus'][index],
    name: m?.name || `Mind ${index + 1}`,
    specialty: m?.specialty || 'General reasoning',
    hypothesis: typeof m?.hypothesis === 'string' ? m.hypothesis : '',
    reasoning: Array.isArray(m?.reasoning) ? m.reasoning.map(String).slice(0, 8) : [],
    confidence: Math.max(0, Math.min(1, Number(m?.confidence ?? 0.5))),
    outerCheck: deterministicAdmissionCheck(m, index),
  };
}

app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    geminiLive: Boolean(ai),
    pattyLive: Boolean(OPENAI_API_KEY || ai),
    pattyProvider: OPENAI_API_KEY ? `OpenAI:${PATTY_MODEL}` : ai ? `Gemini:${GEMINI_MODEL}` : 'offline',
    architecture: {
      womb: 'Governed pre-activation',
      substrate: 'Virtual Neuromorphic Spiking Chip (LIF + STDP)',
      twinMind: 'Independent Public Minds + Deterministic Admission Checkers + Persistent Sargent Patty',
      chek: 'Independent Authority Verification (Intake -> Auditor -> Verifier -> Vault)',
      execution: 'Controlled Output Bus & Feedback Loop',
      caseStore: `Host file: ${CASE_STORE_PATH} (mount persistent storage for durable deployment)`,
    },
  });
});

app.post('/api/twin-mind/cases', async (req: Request, res: Response) => {
  const problem = typeof req.body?.problem === 'string' ? req.body.problem.trim() : '';
  if (!problem) return res.status(400).json({ error: 'Problem description is required.' });
  const item = createCase(problem);
  await persistTwinMindCases();
  return res.json({ case: item });
});

app.get('/api/twin-mind/cases/:caseId', (req: Request, res: Response) => {
  const item = twinMindCases.get(req.params.caseId);
  if (!item) return res.status(404).json({ error: 'Case not found.' });
  return res.json({ case: item });
});

app.post('/api/twin-mind/cases/:caseId/submissions', async (req: Request, res: Response) => {
  const item = twinMindCases.get(req.params.caseId);
  if (!item) return res.status(404).json({ error: 'Case not found.' });
  const id = String(req.body?.id || '').toLowerCase() as PublicMindId;
  const allowed = PUBLIC_MIND_IDS;
  const response = typeof req.body?.response === 'string' ? req.body.response.trim() : '';
  if (!allowed.includes(id) || response.length < 20) {
    return res.status(400).json({ error: 'A recognized public mind and substantive response are required.' });
  }
  const names: Record<PublicMindId, string> = {
    chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', grok: 'Grok', perplexity: 'Perplexity',
  };
  const admission = deterministicAdmissionCheck({
    hypothesis: response,
    reasoning: [],
  }, allowed.indexOf(id));
  const capturedAt = new Date().toISOString();

  if (!admission.passed) {
    item.updatedAt = capturedAt;
    item.history.push({
      at: capturedAt,
      event: 'PUBLIC_MIND_KICKED_BACK',
      detail: `${names[id]} response failed admission: ${admission.diagnostic}`,
    });
    await persistTwinMindCases();
    return res.json({ case: item, admission });
  }

  const prior = [...item.submissions].reverse().find((x) => x.id === id);
  const challengeId = typeof req.body?.challengeId === 'string' ? req.body.challengeId : undefined;
  const challenge = challengeId ? item.challenges?.find((x) => x.id === challengeId && x.target === id) : undefined;
  if (challengeId && !challenge) return res.status(400).json({ error: 'Challenge does not exist or targets a different mind.' });

  const revision = (prior?.revision || 0) + 1;
  const evidenceCore = { caseId: item.id, id, response, capturedAt, sourceMode: req.body?.sourceMode || 'PUBLIC_FRESH_SESSION', revision, parentEvidenceHash: prior?.evidenceHash, challengeId };
  const submission: PublicMindSubmission = {
    evidenceId: `EVID-${randomUUID().toUpperCase()}`,
    evidenceHash: sha256(evidenceCore),
    id,
    name: names[id],
    provider: names[id],
    response,
    capturedAt,
    sourceMode: evidenceCore.sourceMode,
    revision,
    parentEvidenceHash: prior?.evidenceHash,
    challengeId,
    admission,
  };
  item.submissions.push(submission);
  if (challenge) challenge.status = 'ANSWERED';
  item.updatedAt = capturedAt;
  item.history.push({ at: capturedAt, event: 'PUBLIC_MIND_ADMITTED', detail: `${submission.name} response admitted as fresh external evidence.` });
  await persistTwinMindCases();
  return res.json({ case: item, admission });
});

app.post('/api/twin-mind/patty-converge', async (req: Request, res: Response) => {
  const { problem, mindsData, caseId } = req.body;
  const persistentCase = caseId ? twinMindCases.get(caseId) : undefined;
  const publicEvidence = persistentCase?.submissions?.length
    ? persistentCase.submissions.map((x) => ({ evidenceId: x.evidenceId, evidenceHash: x.evidenceHash, id: x.id, name: x.name, response: x.response, capturedAt: x.capturedAt, revision: x.revision, parentEvidenceHash: x.parentEvidenceHash, challengeId: x.challengeId }))
    : mindsData;

  const pattyPrompt = `You are Sargent Patty, the persistent convergence controller in Twin Mind.
The outer minds are independent public AI systems. They are evidence-producing guests, not authorities and not persistent memory.
You preserve the case, challenge disagreements, demand reconstruction of another mind's reasoning, and refuse majority voting.
Every claim admitted to the center must survive deterministic admission checks outside the model.
You have ZERO execution authority. CHEK independently decides whether any consequential proposal may execute.

Problem: "${problem}"
Admitted public-mind evidence: ${JSON.stringify(publicEvidence)}

Produce either a defensible convergence or a precise evidence deficit. Do not invent experiments, measurements, signatures, or facts that are absent from the evidence.
Return JSON:
{
  "dialogue": [{"speaker":"Sargent Patty","target":"one of the submitted public minds","instruction":"a challenge/reconstruction task for that mind","response":""}],
  "disputedAssumption":"string",
  "reconstructedEvidence":"string",
  "status":"CONVERGED_DEFENSIBLE" | "EVIDENCE_DEFICIT",
  "missingEvidenceCatalog":["string"],
  "convergedProposal":{
    "title":"string","coreDecision":"string","computationalProof":"string","defensibilityPact":"string",
    "targetSubstrateAction":{"target":"string","actionType":"STATE_TRANSITION" | "ACTUATOR_DISPATCH" | "WEIGHT_REBALANCE","parameters":{},"riskScore":number}
  }
}

IMPORTANT: Never write a public mind's reply yourself. Every dialogue.response MUST be an empty string. If another round is needed, issue the challenge in dialogue.instruction and return EVIDENCE_DEFICIT until a real external response is captured and admitted.`;

  const sanitizePatty = (parsed: any) => {
    if (Array.isArray(parsed?.dialogue)) parsed.dialogue = parsed.dialogue.map((x: any) => ({ ...x, speaker: 'Sargent Patty', response: '' }));
    const unresolved = Array.isArray(parsed?.dialogue) && parsed.dialogue.some((x: any) => typeof x?.instruction === 'string' && x.instruction.trim());
    if (unresolved) {
      parsed.status = 'EVIDENCE_DEFICIT';
      parsed.missingEvidenceCatalog = Array.isArray(parsed.missingEvidenceCatalog) ? parsed.missingEvidenceCatalog : [];
      if (!parsed.missingEvidenceCatalog.includes('A real external public-mind response to Patty\'s challenge is required.')) {
        parsed.missingEvidenceCatalog.push('A real external public-mind response to Patty\'s challenge is required.');
      }
    }
    return parsed;
  };

  if (OPENAI_API_KEY) {
    try {
      const text = await runPattyOpenAI(pattyPrompt);
      if (text) {
        const parsed = sanitizePatty(JSON.parse(text));
        if (persistentCase && Array.isArray(parsed.dialogue)) {
          persistentCase.challenges ||= [];
          for (const d of parsed.dialogue) {
            const target = String(d?.target || '').toLowerCase() as PublicMindId;
            if (PUBLIC_MIND_IDS.includes(target) && typeof d?.instruction === 'string' && d.instruction.trim()) {
              persistentCase.challenges.push({
                id: `CHAL-${randomUUID().toUpperCase()}`,
                target,
                instruction: d.instruction.trim(),
                createdAt: new Date().toISOString(),
                sourceEvidenceHashes: persistentCase.submissions.map((x) => x.evidenceHash),
                status: 'AWAITING_RESPONSE',
              });
            }
          }
        }
        if (persistentCase) {
          const now = new Date().toISOString();
          persistentCase.updatedAt = now;
          persistentCase.history.push({ at: now, event: 'PATTY_CONVERGENCE', detail: parsed.status || 'UNKNOWN' });
          await persistTwinMindCases();
        }
        return res.json({ ...parsed, caseId: persistentCase?.id, pattyProvider: `OpenAI:${PATTY_MODEL}` });
      }
    } catch (err: any) {
      console.warn('OpenAI Patty convergence error, trying Gemini:', err?.message);
    }
  }

  if (ai) {
    try {
      const prompt = pattyPrompt + `\n\nPreserve the JSON schema exactly. `;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const parsed = sanitizePatty(JSON.parse(response.text || '{}'));
      if (persistentCase && Array.isArray(parsed.dialogue)) {
        persistentCase.challenges ||= [];
        for (const d of parsed.dialogue) {
          const target = String(d?.target || '').toLowerCase() as PublicMindId;
          if (PUBLIC_MIND_IDS.includes(target) && typeof d?.instruction === 'string' && d.instruction.trim()) {
            persistentCase.challenges.push({
              id: `CHAL-${randomUUID().toUpperCase()}`,
              target,
              instruction: d.instruction.trim(),
              createdAt: new Date().toISOString(),
              sourceEvidenceHashes: persistentCase.submissions.map((x) => x.evidenceHash),
              status: 'AWAITING_RESPONSE',
            });
          }
        }
      }
      if (persistentCase) {
        const now = new Date().toISOString();
        persistentCase.updatedAt = now;
        persistentCase.history.push({ at: now, event: 'PATTY_CONVERGENCE', detail: parsed.status || 'UNKNOWN' });
        await persistTwinMindCases();
      }
      return res.json({ ...parsed, caseId: persistentCase?.id, pattyProvider: `Gemini:${GEMINI_MODEL}` });
    } catch (err: any) {
      console.warn('Patty convergence error, fallback:', err?.message);
    }
  }

  // Safe offline fallback: never fabricate convergence evidence.
  return res.json({
    dialogue: [{
      speaker: 'Sargent Patty',
      target: 'Twin Mind',
      instruction: 'Convergence is paused until a configured Patty provider can evaluate the admitted evidence.',
      response: 'No synthetic agreement will be substituted for missing deliberation.',
    }],
    disputedAssumption: 'Not evaluated while Patty provider is offline.',
    reconstructedEvidence: '',
    status: 'EVIDENCE_DEFICIT',
    missingEvidenceCatalog: ['Configure OPENAI_API_KEY (preferred Patty control plane) or GEMINI_API_KEY fallback, then rerun convergence.'],
    convergedProposal: {
      title: 'NO AUTHORIZED PROPOSAL',
      coreDecision: 'Hold. Evidence has not been converged by Patty.',
      computationalProof: 'No proof claimed.',
      defensibilityPact: 'No pact claimed.',
      targetSubstrateAction: { target: 'NONE', actionType: 'STATE_TRANSITION', parameters: {}, riskScore: 1, energyEstimateMilliJoules: 0 },
    },
    caseId: persistentCase?.id,
    pattyProvider: 'offline',
  });
});

async function startServer() {
  await loadTwinMindCases();
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[The Superpower] Autonomous Intelligence Architecture Server running on port ${PORT}`);
  });
}

startServer();
