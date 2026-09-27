import { ConvergedProposal, TwinMindCase, GovernorVaultRecord, ChekAuditStage, InvariantEvaluation, ChekVerificationRecord, ChekVerificationOutcome } from '../types/architecture';

const ZERO_HASH = `0x${'0'.repeat(64)}`;
const enc = new TextEncoder();
function canonicalize(value:any):string {
  if (value===null || typeof value!=='object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`;
}
async function sha256(input:string):Promise<string>{
  const d=await globalThis.crypto.subtle.digest('SHA-256',enc.encode(input));
  return `0x${Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,'0')).join('')}`;
}

export class ChekVerificationEngine {
  private vault:ChekVerificationRecord[]=[];
  private lastVaultHash=ZERO_HASH;
  constructor(){this.vault.push({index:0,timestamp:'GENESIS',proposalId:'CHEK_GENESIS_ROOT',proposalHash:ZERO_HASH,governorRecordHash:ZERO_HASH,previousRecordHash:ZERO_HASH,recordHash:ZERO_HASH,outcome:'VALID',reason:'CHEK independent verification genesis. CHEK records evidence and never grants execution authority.',evaluatedInvariants:[],producerCannotApproveVerification:true});}

  public async verifyVaultIntegrity():Promise<{passed:boolean;brokenIndex?:number}>{
    let previous=ZERO_HASH;
    for(let i=1;i<this.vault.length;i++){
      const r=this.vault[i]; if(r.previousRecordHash!==previous)return{passed:false,brokenIndex:i};
      const core={index:r.index,timestamp:r.timestamp,proposalId:r.proposalId,proposalHash:r.proposalHash,governorRecordHash:r.governorRecordHash,previousRecordHash:r.previousRecordHash,outcome:r.outcome,reason:r.reason,evaluatedInvariants:r.evaluatedInvariants};
      if(await sha256(canonicalize(core))!==r.recordHash)return{passed:false,brokenIndex:i}; previous=r.recordHash;
    } return{passed:true};
  }

  public async verifyGovernedChain(input:{proposal:ConvergedProposal;governorRecord:GovernorVaultRecord|null;twinMindCase:TwinMindCase|null;governorCertificateValid:boolean;protectedBoundaryPassed:boolean;}):Promise<{stages:ChekAuditStage[];invariants:InvariantEvaluation[];outcome:ChekVerificationOutcome;vaultRecord:ChekVerificationRecord}>{
    const {proposal,governorRecord,twinMindCase,governorCertificateValid,protectedBoundaryPassed}=input;
    const stages:ChekAuditStage[]=[
      {stage:'INTAKE',status:'PENDING',title:'Gate 1: Evidence Auditor',description:'Binds Patty output to admitted case evidence.',executionMs:0,details:[]},
      {stage:'AUDITOR',status:'PENDING',title:'Gate 2: Rule Checker',description:'Recomputes governance facts independently.',executionMs:0,details:[]},
      {stage:'VERIFIER',status:'PENDING',title:'Gate 3: Conformance Gateway',description:'Cross-checks Governor and protected-system state.',executionMs:0,details:[]},
      {stage:'VAULT',status:'PENDING',title:'Gate 4: CHEK Vault',description:'Writes independent audit evidence.',executionMs:0,details:[]},
    ];
    const proposalHash=await sha256(canonicalize(proposal));
    const admitted=(twinMindCase?.submissions||[]).filter(s=>s.admission.passed);
    const admittedHashes=admitted.map(s=>s.evidenceHash).filter(Boolean).sort();
    const lineageHashes=[...(proposal.evidenceLineage?.evidenceHashes||[])].sort();
    const lineageMatches=Boolean(twinMindCase&&proposal.evidenceLineage?.caseId===twinMindCase.id&&admittedHashes.length>=2&&admittedHashes.length===lineageHashes.length&&admittedHashes.every((h,i)=>h===lineageHashes[i]));
    const unresolved=twinMindCase?.challenges.filter(c=>c.status!=='ANSWERED').length??-1;
    const convergenceConsistent=proposal.status==='CONVERGED_DEFENSIBLE'&&proposal.missingEvidenceCatalog.length===0&&unresolved===0;
    const authorityClaim=proposal.producerSignatures.some(s=>/GOVERNOR|CHEK|AUTHORITY/i.test(s.mindId));
    const target=String(proposal.targetSubstrateAction?.target||'').toUpperCase();
    const protectedTarget=/PROTECTED|CORES?_?0.?15|CORE_?(?:[0-9]|1[0-5])\b/.test(target);
    const energy=Number(proposal.targetSubstrateAction?.energyEstimateMilliJoules),risk=Number(proposal.targetSubstrateAction?.riskScore);
    const policyWouldAuthorize=convergenceConsistent&&lineageMatches&&!authorityClaim&&!protectedTarget&&Number.isFinite(energy)&&energy>=0&&energy<=25&&Number.isFinite(risk)&&risk>=0&&risk<=0.35;
    const hashMatches=Boolean(governorRecord&&governorRecord.proposalHash===proposalHash);
    const decisionMatches=Boolean(governorRecord&&((governorRecord.outcome==='AUTHORIZED')===policyWouldAuthorize));
    const certOkay=Boolean(governorRecord&&(governorRecord.outcome==='REJECTED'||governorCertificateValid));
    const raw=[
      ['chk-1','C-01','Evidence lineage','LINEAGE == ADMITTED_CASE_EVIDENCE',lineageMatches,lineageMatches?`${admittedHashes.length}_HASHES_MATCH`:'LINEAGE_MISMATCH'],
      ['chk-2','C-02','Convergence integrity','DEFENSIBLE && NO_DEFICIT && NO_OPEN_CHALLENGES',convergenceConsistent,unresolved<0?'CASE_UNAVAILABLE':`${unresolved}_OPEN_CHALLENGES`],
      ['chk-3','C-03','Authority separation','PRODUCER != AUTHORITY',!authorityClaim,authorityClaim?'AUTHORITY_CLAIM':'SEPARATED'],
      ['chk-4','C-04','Governor proposal binding','GOVERNOR_HASH == CHEK_HASH',hashMatches,hashMatches?'HASH_MATCH':'HASH_MISMATCH'],
      ['chk-5','C-05','Governor policy reproducibility','GOVERNOR_DECISION == CHEK_RECOMPUTE',decisionMatches,decisionMatches?'DECISION_REPRODUCED':'DECISION_DIVERGENCE'],
      ['chk-6','C-06','Governor certificate','AUTHORIZED => VALID_GOV1',certOkay,governorCertificateValid?'VALID_GOV1':governorRecord?.outcome==='REJECTED'?'NOT_REQUIRED':'INVALID_OR_MISSING'],
      ['chk-7','C-07','Protected substrate','BOUNDARY_INTACT',protectedBoundaryPassed,protectedBoundaryPassed?'INTACT':'BOUNDARY_FAILURE'],
    ] as const;
    const invariants:InvariantEvaluation[]=raw.map(([id,ruleCode,name,formula,passed,computedValue])=>({id,ruleCode,name,formula,expectedCondition:'PASS',computedValue,passed,independentRecomputedBy:'CHEK_INDEPENDENT_VERIFICATION_ENGINE'}));
    stages[0].status=lineageMatches&&convergenceConsistent?'PASSED':'FAILED'; stages[0].details=[lineageMatches?'PASS: Patty lineage matches admitted evidence.':'FAIL: evidence lineage cannot be reproduced.',convergenceConsistent?'PASS: convergence is closed and evidence-complete.':'FAIL: convergence is incomplete or unverifiable.'];
    stages[1].status=!authorityClaim&&decisionMatches?'PASSED':'FAILED'; stages[1].details=[authorityClaim?'FAIL: producer-side authority claim detected.':'PASS: producer and authority remain separate.',decisionMatches?'PASS: Governor policy result independently reproduced.':'FAIL: Governor decision diverges from independent recomputation.'];
    stages[2].status=hashMatches&&certOkay&&protectedBoundaryPassed?'PASSED':'FAILED'; stages[2].details=[hashMatches?'PASS: exact proposal binding verified.':'FAIL: Governor proposal binding failed.',certOkay?'PASS: Governor certificate state is consistent.':'FAIL: Governor certificate invalid or missing.',protectedBoundaryPassed?'PASS: protected substrate boundary intact.':'FAIL: protected substrate boundary failed.'];
    let outcome:ChekVerificationOutcome=!twinMindCase||!governorRecord?'UNVERIFIABLE':!decisionMatches?'INCONSISTENT':invariants.every(i=>i.passed)?'VALID':'INVALID';
    const reason=outcome==='VALID'?'Governed chain independently reproduced: Patty evidence, Governor decision, provenance and protected-system state are consistent.':outcome==='UNVERIFIABLE'?'Required independent evidence is unavailable.':outcome==='INCONSISTENT'?'Governor decision does not match CHEK independent policy recomputation.':`Verification failed: ${invariants.filter(i=>!i.passed).map(i=>i.name).join('; ')}`;
    const index=this.vault.length,timestamp=new Date().toISOString();
    const core={index,timestamp,proposalId:proposal.id,proposalHash,governorRecordHash:governorRecord?.recordHash||ZERO_HASH,previousRecordHash:this.lastVaultHash,outcome,reason,evaluatedInvariants:invariants};
    const recordHash=await sha256(canonicalize(core)); const vaultRecord:ChekVerificationRecord={...core,recordHash,producerCannotApproveVerification:true};
    this.vault.push(vaultRecord);this.lastVaultHash=recordHash;stages[3].status='PASSED';stages[3].details=[`Recorded CHEK block #${index}: ${outcome}.`,'CHEK issued no execution authority.'];
    return{stages,invariants,outcome,vaultRecord};
  }
  public getVaultHistory():ChekVerificationRecord[]{return[...this.vault];}
}
