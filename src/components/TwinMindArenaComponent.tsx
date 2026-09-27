import React, { useState } from 'react';
import { Copy, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { ConvergedProposal, ScenarioPreset, TwinMindCase, PublicMindId } from '../types/architecture';
import { buildPublicMindCasePrompt } from '../engine/twinMindGovernance';
import { buildMacroBookmarklet, buildMindLaunchUrl } from '../engine/publicMindMacro';

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
  caseHistory: Array<{ id: string; problem: string; createdAt: string; updatedAt: string; submissionCount: number; challengeCount: number; lastStatus: string | null }>;
  onLoadCase: (caseId: string) => Promise<void>;
}

const PUBLIC_MINDS: { id: PublicMindId; label: string; url: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'claude', label: 'Claude', url: 'https://claude.ai/new' },
  { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app' },
  { id: 'grok', label: 'Grok', url: 'https://grok.com/' },
  { id: 'perplexity', label: 'Perplexity', url: 'https://www.perplexity.ai/' },
];

export const TwinMindArenaComponent: React.FC<Props> = ({
  currentScenario, isDeliberating, onRunDeliberation, onRunPattyConvergence,
  twinMindCase, onCapturePublicMind, convergedProposal, onTransmitToChek,
  onTalkToPatty, pattyConversation, caseHistory, onLoadCase,
}) => {
  const [question, setQuestion] = useState('');
  const [captureMind, setCaptureMind] = useState<PublicMindId>('chatgpt');
  const [captureText, setCaptureText] = useState('');
  const [status, setStatus] = useState('');
  const [pattyInput, setPattyInput] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);
  const [showMacroSetup, setShowMacroSetup] = useState(false);
  const [showCaseHistory, setShowCaseHistory] = useState(false);

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
    setStatus('Question packet copied.');
    setTimeout(() => setStatus(''), 2000);
  };

  const launchUrl = (mind: typeof PUBLIC_MINDS[number]) => {
    if (!twinMindCase?.bridgeToken) return mind.url;
    return buildMindLaunchUrl(mind.url, {
      caseId: twinMindCase.id, token: twinMindCase.bridgeToken, mindId: mind.id, bridgeOrigin: window.location.origin,
    });
  };

  const openMind = async (mind: typeof PUBLIC_MINDS[number]) => {
    if (!packet) return;
    try { await navigator.clipboard.writeText(packet); } catch {}
    setCaptureMind(mind.id);
    window.open(launchUrl(mind), mind.id);
    setStatus(`${mind.label} opened with the active Archie case attached. Run the Archie Macro bookmark there; it will submit and return the answer automatically.`);
  };

  const openAllMinds = async () => {
    if (!packet) return;
    try { await navigator.clipboard.writeText(packet); } catch {}
    let opened = 0;
    for (const mind of PUBLIC_MINDS) {
      const win = window.open(launchUrl(mind), mind.id);
      if (win) opened++;
    }
    setStatus(opened === PUBLIC_MINDS.length
      ? 'Five public minds opened with this Archie case attached. Run the Archie Macro in each tab.'
      : `Opened ${opened}/5 tabs. Your browser blocked the rest; use the individual Open buttons.`);
  };

  const copyMacro = async () => {
    await navigator.clipboard.writeText(buildMacroBookmarklet());
    setStatus('Archie Macro copied. Save it once as a browser bookmark URL named Archie Macro.');
    setShowMacroSetup(true);
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
    <section className="rounded-2xl border border-stone-800 bg-[#0b0a08] p-4 sm:p-5">
      <button onClick={()=>setShowCaseHistory(!showCaseHistory)} className="w-full flex items-center justify-between gap-3 text-left">
        <div>
          <p className="text-[11px] font-mono tracking-[.18em] text-amber-200/70">CASE HISTORY</p>
          <p className="text-xs text-stone-500 mt-1">{caseHistory.length} persisted case{caseHistory.length===1?'':'s'} available</p>
        </div>
        {showCaseHistory?<ChevronUp size={16} className="text-stone-500"/>:<ChevronDown size={16} className="text-stone-500"/>}
      </button>
      {showCaseHistory && <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
        {caseHistory.length===0 ? <p className="text-xs text-stone-600">No persisted cases found.</p> : caseHistory.map(item=>
          <button key={item.id} onClick={async()=>{ setStatus('Loading case...'); try { await onLoadCase(item.id); setStatus('Case restored.'); } catch(e:any){ setStatus(e?.message || 'Unable to restore case.'); } }}
            className={`w-full rounded-lg border p-3 text-left ${twinMindCase?.id===item.id?'border-amber-200/30 bg-amber-950/10':'border-stone-800 bg-black/30'}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-mono text-stone-500">{item.id}</span>
              <span className={`text-[10px] font-mono ${item.lastStatus==='CONVERGED_DEFENSIBLE'?'text-emerald-400':item.lastStatus==='EVIDENCE_DEFICIT'?'text-amber-300':'text-stone-600'}`}>{item.lastStatus || 'OPEN'}</span>
            </div>
            <p className="mt-1 text-sm text-stone-200 line-clamp-2">{item.problem}</p>
            <p className="mt-2 text-[10px] font-mono text-stone-600">{item.submissionCount}/5 responses · {new Date(item.updatedAt).toLocaleString()}</p>
          </button>
        )}
      </div>}
    </section>

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
        <div className="flex flex-wrap gap-2">
          <button onClick={openAllMinds} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#9b7a3f] to-[#c8a96b] px-3 py-2 text-xs font-bold text-black"><ExternalLink size={14}/> Open Five Minds</button>
          <button onClick={copyMacro} className="flex items-center gap-2 rounded-lg border border-amber-200/20 px-3 py-2 text-xs text-amber-100"><Copy size={14}/> Install / Copy Macro</button>
          <button onClick={copyPacket} className="flex items-center gap-2 rounded-lg border border-stone-800 px-3 py-2 text-xs text-stone-500"><Copy size={14}/> Manual fallback</button>
        </div>
      </div>
      {showMacroSetup && <div className="rounded-xl border border-amber-200/15 bg-black/40 p-4 text-xs text-stone-400">
        <b className="text-stone-200">One-time macro setup:</b> the button copied a bookmark URL beginning with <code className="text-amber-100">javascript:</code>. Save any bookmark in your browser, edit its name to <b>Archie Macro</b>, and replace its URL with what was copied. After that: open the five minds from Archie and run <b>Archie Macro</b> on each AI tab. The macro finds the input, inserts this case, submits it, waits for the answer, and sends the captured response back to this case. If a site changes its page controls and cannot be detected, use Manual fallback rather than fabricating a response.
      </div>}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PUBLIC_MINDS.map(m => {
          const admitted=twinMindCase.submissions.some(x=>x.id===m.id);
          return <div key={m.id}
            className={`rounded-lg border p-3 ${captureMind===m.id?'border-amber-200/40 bg-amber-950/15':'border-stone-800 bg-black/30'}`}>
            <button onClick={()=>setCaptureMind(m.id)} className="w-full text-left">
              <div className="text-xs font-bold text-stone-200">{m.label}</div>
              <div className={`mt-1 text-[10px] font-mono ${admitted?'text-emerald-400':'text-stone-600'}`}>{admitted?'ADMITTED':'WAITING'}</div>
            </button>
            <button onClick={()=>openMind(m)} className="mt-3 flex items-center gap-1 text-[10px] font-bold text-amber-100/80"><ExternalLink size={11}/> OPEN</button>
          </div>
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
