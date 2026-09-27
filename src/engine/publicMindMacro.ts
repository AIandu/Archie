export interface MacroLaunch {
  caseId: string;
  token: string;
  mindId: string;
  bridgeOrigin: string;
}

export function buildMindLaunchUrl(baseUrl: string, launch: MacroLaunch): string {
  const hash = new URLSearchParams({
    archie_case: launch.caseId,
    archie_token: launch.token,
    archie_mind: launch.mindId,
    archie_origin: launch.bridgeOrigin,
  });
  return `${baseUrl}${baseUrl.includes('#') ? '&' : '#'}${hash.toString()}`;
}

export function buildMacroBookmarklet(): string {
  const source = `(async()=>{try{
const p=new URLSearchParams(location.hash.slice(1)),caseId=p.get('archie_case'),token=p.get('archie_token'),mind=p.get('archie_mind'),origin=p.get('archie_origin');
if(!caseId||!token||!mind||!origin){alert('Open this AI from Archie first.');return}
const b=await fetch(origin+'/api/twin-mind/bridge/'+encodeURIComponent(caseId)+'?token='+encodeURIComponent(token)).then(r=>{if(!r.ok)throw Error('Archie bridge unavailable');return r.json()});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let input=null;
for(let n=0;n<30&&!input;n++){input=document.querySelector('textarea:not([disabled]),[contenteditable="true"][role="textbox"],[contenteditable="true"]');if(!input)await sleep(500)}
if(!input)throw Error('Could not find this AI input box');
input.focus();
if(input.tagName==='TEXTAREA'||input.tagName==='INPUT'){const s=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input),'value')?.set;s?s.call(input,b.packet):input.value=b.packet;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))}
else{input.textContent='';document.execCommand('insertText',false,b.packet);input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:b.packet}))}
await sleep(400);
const labels=['send','submit','ask','search'];
let send=[...document.querySelectorAll('button:not([disabled])')].find(x=>labels.some(k=>((x.getAttribute('aria-label')||x.getAttribute('data-testid')||x.textContent||'').toLowerCase()).includes(k)));
if(send)send.click();else input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
const before=document.body.innerText,started=Date.now();let best='',stable=0,last='';
while(Date.now()-started<180000){
 await sleep(1500);
 const sels=mind==='chatgpt'?['[data-message-author-role="assistant"]']:mind==='claude'?['[data-is-streaming]','.font-claude-response','[data-testid*="assistant"]']:mind==='gemini'?['message-content','.model-response-text','.markdown-main-panel']:mind==='grok'?['[data-testid*="message"]','.response-content']:['[data-testid*="answer"]','.prose','.markdown'];
 const nodes=[...new Set(sels.flatMap(s=>[...document.querySelectorAll(s)]))];
 const texts=nodes.map(x=>(x.innerText||x.textContent||'').trim()).filter(x=>x.length>40&&!x.includes(b.packet.slice(0,80)));
 if(texts.length)best=texts[texts.length-1];
 if(!best){const now=document.body.innerText;const tail=now.startsWith(before)?now.slice(before.length).trim():'';if(tail.length>80)best=tail}
 if(best&&best===last)stable++;else stable=0;
 last=best;
 if(best&&stable>=2)break;
}
if(!best)throw Error('Response was not detected. Copy it into Archie manually.');
const r=await fetch(origin+'/api/twin-mind/bridge/'+encodeURIComponent(caseId),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,id:mind,response:best})}).then(r=>r.json());
alert(r.admitted?'Archie captured and admitted '+mind+'.':'Archie captured '+mind+', but its checker kicked the response back.');
}catch(e){alert('Archie macro: '+(e&&e.message?e.message:e))}})()`;
  return 'javascript:' + source.replace(/\n/g, '');
}
