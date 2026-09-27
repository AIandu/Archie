import React, { useState } from 'react';
import { Copy, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ConvergedProposal, ScenarioPreset, TwinMindCase, PublicMindId } from '../types/architecture';
import { buildPublicMindCasePrompt } from '../engine/twinMindGovernance';

interface Props {
  currentScenario: ScenarioPreset;
  onSelectScenario: (scenario: ScenarioPreset) => void;
  minds: any[];
  pattyDialogue: any[];
  convergedProposal: ConvergedProposal | null;
  isDeliberating: boolean;
  onRunDeliberation: (problemText?: string) => void;
  onRunPattyConvergence: (caseId?: string) => void;
  twinMindCase: TwinMindCase | null;
  onCapturePublicMind: (id: PublicMindId, response: string) => Promise<any>;
  onTransmitToChek: (proposal: ConvergedProposal) => void;
  onTalkToPatty: (message: string) => Promise<string>;
  onOpenCase: () => Promise<void>;
  pattyConversation: { at: string; role: 'USER' | 'PATTY'; text: string }[];
}

const PUBLIC_MINDS: { id: PublicMindId; label: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT' }, { id: 'claude', label: 'Claude' },
  { id: 'gemini', label: 'Gemini' }, { id: 'grok', label: 'Grok' },
  { id: 'perplexity', label: 'Perplexity' },
];

export const TwinMindArenaComponent: React.FC<Props> = ({
  currentScenario, isDeliberating, onRunDeliberation, onRunPattyConvergence,
  twinMindCase, onCapturePublicMind, convergedProposal, onTransmitToChek,
  onTalkToPatty, pattyConversation,
}) => {
  const [question, setQuestion] = useState('');
  const [captureMind, setCaptureMind] = useState<PublicMindId>('chatgpt');
  const [captureText, setCaptureText] = useState('');
  const [status, setStatus] = useState('');
  const [pattyInput, setPattyInput] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);

  const uniqueMinds = new Set((twinMindCase?.submissions || []).map(x => x.id)).size;
  const activeQuestion = twinMindCase?.problem || '';
  const packet = twinMindCase ? buildPublicMindCasePrompt(twinMindCase.problem, twinMindCase.id) : '';

  const startCase = () => {
    const q = question.trim();
    if (!q) return;
    setStatus('Opening case...');
    onRunDeliberation(q);
    setStatus('');
  };

  const copyPacket = async () => {
    if (!packet) return;
    await navigator.clipboard.writeText(packet);
    setStatus('Case packet copied. Ask each fresh public mind the identical question.');
    setTimeout(() => setStatus(''), 2500);
  };

  const capture = async () => {
    if (!captureText.trim()) return;
    setStatus('Checking response...');
    try {
      const admission = await onCapturePublicMind(captureMind, captureText.trim());
      setCaptureText('');
      setStatus(admission?.passed ? `${captureMind} admitted.` : `${captureMind} kicked back by its checker.`);
    } catch (e: any) { setStatus(e?.message || 'Capture failed.'); }
  };

  return <div className="max-w-4xl mx-auto space-y-5">
    <section className="rounded-2xl border border-amber-200/15 bg-[#0b0a08] p-5 sm:p-7">
      <p className="text-[11px] font-mono tracking-[.18em] text-amber-200/70">ASK ARCHIE</p>
      <h2 className="text-2xl font-bold text-stone-100 mt-2">What do you want the minds to solve?</h2>
      {!twinMindCase ? <>
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={5}
          placeholder="Type your question, problem, idea, or decision here..."
          className="mt-5 w-full rounded-xl border border-stone-800 bg-black/50 p-4 text-sm text-stone-100 focus:outline-none focus:border-amber-200/40" />
        <button onClick={startCase} disabled={!question.trim() || isDeliberating}
          className="mt-3 w-full sm:w-auto rounded-lg bg-gradient-to-r from-[#9b7a3f] to-[#c8a96b] px-6 py-3 font-bold text-black disabled:opacity-40">
          Ask the Five Minds
        </button>
      </> : <>
        <div className="mt-4 rounded-xl border border-stone-800 bg-black/40 p-4 text-sm text-stone-200">{activeQuestion}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={()=>{ setQuestion(''); onRunDeliberation(''); }} className="hidden">New</button>
          <span className="text-[11px] font-mono text-stone-500">CASE {twinMindCase.id}</span>
        </div>
      </>}
    </section>

    {twinMindCase && <section className="rounded-2xl border border-stone-800 bg-[#0b0a08] p-5 sm:p-7 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[11px] font-mono tracking-[.18em] text-amber-200/70">THE FIVE MINDS</p>
          <p className="text-sm text-stone-400 mt-1">{uniqueMinds}/5 independent responses admitted</p></div>
        <button onClick={copyPacket} className="flex items-center gap-2 rounded-lg border border-amber-200/20 px-3 py-2 text-xs text-amber-100"><Copy size={14}/> Copy question packet</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PUBLIC_MINDS.map(m => {
          const admitted=twinMindCase.submissions.some(x=>x.id===m.id);
          return <button key={m.id} onClick={()=>setCaptureMind(m.id)}
            className={`rounded-lg border p-3 text-left ${captureMind===m.id?'border-amber-200/40 bg-amber-950/15':'border-stone-800 bg-black/30'}`}>
            <div className="text-xs font-bold text-stone-200">{m.label}</div>
            <div className={`mt-1 text-[10px] font-mono ${admitted?'text-emerald-400':'text-stone-600'}`}>{admitted?'ADMITTED':'WAITING'}</div>
          </button>
        })}
      </div>
      <textarea value={captureText} onChange={e=>setCaptureText(e.target.value)} rows={5}
        placeholder={`Paste the fresh ${PUBLIC_MINDS.find(x=>x.id===captureMind)?.label} response here...`}
        className="w-full rounded-xl border border-stone-800 bg-black/50 p-4 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-200/40" />
      <button onClick={capture} disabled={!captureText.trim()} className="rounded-lg bg-stone-100 px-5 py-2.5 text-xs font-bold text-black disabled:opacity-40">Capture + Check</button>
      {status && <p className="text-xs font-mono text-stone-500">{status}</p>}
      <button onClick={()=>setShowEvidence(!showEvidence)} className="flex items-center gap-1 text-xs text-stone-500">
        {showEvidence?<ChevronUp size={14}/>:<ChevronDown size={14}/>} {showEvidence?'Hide':'View'} evidence details
      </button>
      {showEvidence && <div className="space-y-2">{twinMindCase.submissions.map(x=><div key={x.evidenceId} className="rounded-lg border border-stone-800 p-3 text-xs text-stone-400"><b className="text-stone-200">{x.name}</b><p className="mt-2 whitespace-pre-wrap">{x.response}</p></div>)}</div>}
    </section>}

    {twinMindCase && <section className="rounded-2xl border border-amber-200/20 bg-[#0b0a08] p-5 sm:p-7 space-y-4">
      <div><p className="text-[11px] font-mono tracking-[.18em] text-amber-200/70">SARGENT PATTY</p>
        <h3 className="text-xl font-bold text-stone-100 mt-1">Convergence & conversation</h3></div>
      <div className="rounded-xl border border-stone-800 bg-black/40 p-4 max-h-80 overflow-y-auto space-y-3">
        {pattyConversation.length===0?<p className="text-xs text-stone-500">Patty has the case. Ask what she knows, where the minds disagree, or what evidence is missing.</p>:
        pattyConversation.map((m,i)=><p key={i} className="text-sm text-stone-300"><b className={m.role==='PATTY'?'text-amber-100':'text-stone-100'}>{m.role==='PATTY'?'PATTY':'YOU'}:</b> {m.text}</p>)}
      </div>
      <textarea value={pattyInput} onChange={e=>setPattyInput(e.target.value)} rows={3} placeholder="Talk to Patty..."
        className="w-full rounded-xl border border-stone-800 bg-black/50 p-4 text-sm text-stone-200 focus:outline-none focus:border-amber-200/40"/>
      <div className="flex flex-wrap gap-2">
        <button disabled={!pattyInput.trim()} onClick={async()=>{const m=pattyInput.trim();setPattyInput('');await onTalkToPatty(m);}}
          className="rounded-lg bg-gradient-to-r from-[#9b7a3f] to-[#c8a96b] px-5 py-2.5 text-xs font-bold text-black disabled:opacity-40">Ask Patty</button>
        <button disabled={uniqueMinds<2 || isDeliberating} onClick={()=>onRunPattyConvergence(twinMindCase.id)}
          className="rounded-lg border border-amber-200/25 px-5 py-2.5 text-xs font-bold text-amber-100 disabled:opacity-30">Resolve the Minds</button>
      </div>
      {uniqueMinds<2 && <p className="text-[11px] text-stone-600">Patty needs admitted evidence from at least two independent minds before convergence.</p>}
    </section>}

    {convergedProposal && <section className="rounded-2xl border border-stone-800 bg-[#0b0a08] p-5 sm:p-7">
      <div className="flex gap-3 items-start">{convergedProposal.status==='CONVERGED_DEFENSIBLE'?<CheckCircle2 className="text-emerald-400"/>:<AlertCircle className="text-amber-300"/>}
        <div><p className="text-xs font-mono text-stone-500">{convergedProposal.status}</p><h3 className="text-lg font-bold text-stone-100 mt-1">{convergedProposal.title}</h3><p className="text-sm text-stone-300 mt-2">{convergedProposal.coreDecision}</p></div></div>
      {convergedProposal.status==='CONVERGED_DEFENSIBLE' && <button onClick={()=>onTransmitToChek(convergedProposal)} className="mt-4 rounded-lg border border-amber-200/30 px-5 py-2.5 text-xs font-bold text-amber-100">Send consequential proposal to CHEK</button>}
    </section>}

    <details className="rounded-xl border border-stone-900 bg-black/20 p-4 text-xs text-stone-600">
      <summary className="cursor-pointer">Diagnostics & demo tools</summary>
      <p className="mt-3">Neuromorphic mesh inspection, scenario presets, legacy simulation harness, fault injection, and engineering telemetry are available from their dedicated system stages. They are not required to use Twin Mind.</p>
    </details>
  </div>;
};
