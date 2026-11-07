import { mkdirSync, cpSync, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { validate, categories } from './check';
const root=resolve(import.meta.dir,'..');
const refresh=process.argv.includes('--refresh');
const upstreams=['anthropics/knowledge-work-plugins','anthropics/claude-plugins-official'];
const lockPath=join(root,'sources.lock.json');
const lock:any=existsSync(lockPath) && !refresh ? JSON.parse(readFileSync(lockPath,'utf8')) : {upstreams:{},entries:{},registry:[],officialNames:[]};
const run=(args:string[])=>{const p=Bun.spawnSync(args,{stdout:'pipe',stderr:'pipe'});if(p.exitCode)throw Error(`${args[0]}: ${p.stderr.toString()}`);return p.stdout.toString().trim()};
async function get(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`${r.status} ${url}`);return r.json()}
function sha(repo:string,ref='HEAD'){return run(['git','ls-remote',`https://github.com/${repo}.git`,ref]).split(/\s/)[0]}
function json(path:string,value:any){mkdirSync(resolve(path,'..'),{recursive:true});return Bun.write(path,JSON.stringify(value,null,2)+'\n')}
async function checkout(repo:string,commit:string){
 const dest=join(root,'.cache',repo,commit);
 if(!existsSync(dest)){
  mkdirSync(dest,{recursive:true});const archive=dest+'.tgz';
  run(['curl','-fsSL','--max-time','120','--max-filesize','100000000',`https://codeload.github.com/${repo}/tar.gz/${commit}`,'-o',archive]);
  run(['tar','-xzf',archive,'--strip-components=1','-C',dest]);rmSync(archive);
 }
 return dest;
}
const aliases:any={database:'data',analytics:'data',monitoring:'cloud',devops:'cloud',deployment:'cloud',infrastructure:'cloud',sales:'sales-marketing',marketing:'sales-marketing',legal:'finance',payments:'finance',education:'research',learning:'research',agents:'ai-agents',ai:'ai-agents'};
function category(p:any){
 const raw=p.category?.toLowerCase();if(categories.includes(raw))return raw;if(aliases[raw])return aliases[raw];
 const s=(p.name+' '+p.description).toLowerCase();
 for(const [c,re] of Object.entries({finance:/financ|payment|invoice|accounting|stripe/,communication:/slack|email|messag|chat|zoom|support/,design:/figma|design|image|video|canva|adobe/,data:/database|sql|analytics|airtable/,cloud:/cloud|deploy|monitor|infrastructure/,security:/secur|vulnerab|compliance/,research:/research|scientific|paper|education/, 'sales-marketing':/sales|marketing|crm|hubspot/,productivity:/notion|linear|task|document|calendar|productiv/, 'ai-agents':/agent|llm|model|ai /,development:/code|develop|git|debug|test|api/}))if((re as RegExp).test(s))return c;
 return 'more';
}
const publisherNamespaces = ['com.airtable','app.linear','com.notion','com.figma.mcp','com.stripe','com.slack','com.atlassian','com.asana','com.hubspot','com.salesforce','com.intercom','com.zendesk','com.dropbox','com.box','com.canva','com.miro','com.webflow','com.wordpress','com.shopify','com.squareup','com.paypal','com.plaid','com.ramp','com.brex','com.quickbooks','com.xero','com.mercury','com.twilio','com.sendgrid','com.mailchimp','com.klaviyo','com.posthog','com.amplitude','com.mixpanel','com.segment','com.datadoghq','com.newrelic','io.sentry','com.cloudflare','com.vercel','com.netlify','com.render','com.fly','com.digitalocean','com.mongodb','com.snowflake','com.databricks','com.clickhouse','com.supabase','tech.neon','com.planetscale','com.turso','com.redis','com.elastic','com.algolia','com.pinecone','io.weaviate','com.qdrant','com.github','com.gitlab','com.bitbucket','com.jfrog','com.docker','com.sonarsource','com.snyk','com.semgrep','com.socket','com.gitguardian','com.1password','com.okta','com.auth0','com.clerk','com.workos','com.stytch','com.descope','com.stytch','com.duo','com.vanta','com.drata','com.notion','com.todoist','com.ticktick','com.trello','com.monday','com.clickup','com.wrike','com.smartsheet','com.coda','com.n8n','com.zapier','com.make','com.pipedream','com.retool','com.airbyte','com.fivetran','com.dbt','com.prefect','io.dagster','com.temporal','com.browserbase','com.browserless','dev.firecrawl','com.exa','com.tavily','com.you','com.kagi','com.brave','com.perplexity','com.elevenlabs','com.deepl','com.heygen','com.runwayml','com.adobe','com.framer','com.sketch','com.invisionapp','com.lottiefiles','com.spline','com.loom','com.zoom','com.calendly','com.cal','com.savvycal','com.typeform','com.tally','com.jotform','com.surveymonkey','com.docusign','com.pandadoc','com.documenso','com.expensify','com.bill','com.gusto','com.rippling','com.deel','com.greenhouse','com.lever','com.ashbyhq','com.bamboohr','com.factorialhr','com.apollo','com.clay','com.attio','com.affinity','com.pipedrive','com.close','com.gong','com.fireflies','com.granola','com.fathom','com.otter','com.recall','com.read','com.mem','com.evernote','md.obsidian','com.roamresearch','com.logseq','com.readwise','com.raindrop','com.pocket','com.feedly','com.inoreader','com.zotero','org.crossref','org.arxiv','org.semanticscholar','com.pubmed','com.wolframalpha'];
const featured=new Set(['notion','linear','slack','figma','stripe','asana']);
const entries=new Map<string,any>();const identities=new Map<string,string>();
const documents:any[]=[];
for(const repo of upstreams){
 const commit=lock.upstreams[repo] ?? sha(repo);if(!/^[a-f0-9]{40}$/.test(commit))throw Error(`no commit ${repo}`);
 lock.upstreams[repo]=commit;
 const dir=await checkout(repo,commit);
 const doc=JSON.parse(readFileSync(join(dir,'.claude-plugin/marketplace.json'),'utf8'));documents.push({repo,commit,dir,doc});
 const attribution=join(root,'upstream',repo);mkdirSync(attribution,{recursive:true});
 for(const file of ['LICENSE','NOTICE'])if(existsSync(join(dir,file)))cpSync(join(dir,file),join(attribution,file));
 await json(join(attribution,'marketplace.json'),doc);
}
lock.officialNames=documents[1].doc.plugins.map((p:any)=>p.name);
for(const {repo,commit,dir,doc} of documents){
 for(const original of doc.plugins){
  const p=structuredClone(original);let identity:string;
  if(typeof p.source==='object' && !['url','git-subdir','github'].includes(p.source.source)){console.warn(`Excluded unsupported source: ${p.name} (${p.source.source})`);continue;}
  if(typeof p.source==='string' && p.source.startsWith('./')){
   identity=`${repo}/${p.source}`;
  }else{
   let s=typeof p.source==='string'?{source:'url',url:p.source}:p.source;
   const url=s.url ?? `https://github.com/${s.repo}.git`;
   identity=url.replace(/\.git$/,'').toLowerCase()+'/'+(s.path??'');
   const gitRepo=url.match(/^https:\/\/github.com\/([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
   const pin=s.sha ?? s.ref;
   const pinned=/^[a-f0-9]{40}$/.test(pin??'')?pin:lock.entries[p.name]?.commit ?? (gitRepo?sha(gitRepo,s.ref??'HEAD'):'');
   if(!/^[a-f0-9]{40}$/.test(pinned))throw Error(`cannot pin ${p.name}`);
   p.source={...s,ref:pinned};delete p.source.sha;
  }
  const existing=entries.get(p.name) ?? entries.get(identities.get(identity)!);
  const supersedes=repo.endsWith('claude-plugins-official')?[`claude-plugins-official/${p.name}`]:[];
  if(existing){
   const merged=[...new Set([...existing['x-compozy'].supersedes,...supersedes])];
   if(typeof p.source==='string'||typeof existing.source!=='string'){existing['x-compozy'].supersedes=merged;continue;}
   supersedes.splice(0,supersedes.length,...merged);entries.delete(existing.name);
  }
  if(typeof p.source==='string'){
   const local=`upstream/${repo}/${p.source.replace(/^\.\//,'')}`;
   cpSync(join(dir,p.source),join(root,local),{recursive:true});p.source='./'+local;
   lock.entries[p.name]={repository:repo,commit,path:original.source};
  }else lock.entries[p.name]={repository:p.source.url??p.source.repo,commit:p.source.ref,path:p.source.path??''};
  p['x-compozy']={category:category(p),featured:featured.has(p.name),supersedes};
  entries.set(p.name,p);identities.set(identity,p.name);
 }
}
if(refresh || !lock.registry.length){
 const priority:any[]=[];
 for(let i=0;i<publisherNamespaces.length;i+=4){
  const pages=await Promise.all(publisherNamespaces.slice(i,i+4).map(ns=>get('https://registry.modelcontextprotocol.io/v0.1/servers?limit=100&version=latest&search='+encodeURIComponent(ns))));
  for(let j=0;j<pages.length;j++)for(const item of pages[j].servers??[])if(item.server.name.split('/')[0]===publisherNamespaces[i+j] && item._meta?.['io.modelcontextprotocol.registry/official']?.status==='active')priority.push(item.server);
 }
 lock.registry=priority.filter(s=>(s.remotes??[]).some((r:any)=>r.type==='streamable-http'&&r.url.startsWith('https://'))).map(s=>({...s,remotes:s.remotes.filter((r:any)=>r.type==='streamable-http'&&r.url.startsWith('https://'))}));
 let cursor='';const seen=new Set(lock.registry.map((s:any)=>s.name));
 do{
  const page:any=await get('https://registry.modelcontextprotocol.io/v0.1/servers?limit=100&version=latest'+(cursor?'&cursor='+encodeURIComponent(cursor):''));
  for(const item of page.servers){const s=item.server;const meta=item._meta?.['io.modelcontextprotocol.registry/official'];
   if(meta?.status!=='active'||meta?.isLatest===false||!s.name.match(/^(?!io\.github\.)[a-z0-9.-]+\//)||seen.has(s.name))continue;
   const remotes=(s.remotes??[]).filter((r:any)=>r.type==='streamable-http' && r.url.startsWith('https://') && !r.url.includes('?'));
   if(!remotes.length)continue;seen.add(s.name);lock.registry.push({...s,remotes});
  }
  cursor=page.metadata?.nextCursor??'';
 }while(cursor && lock.registry.length<700);
}
const urls=new Set<string>();for(const p of entries.values()){
 const pin=lock.entries[p.name];
 if(typeof p.source==='string'){
  for(const file of ['.mcp.json','mcp.json']){const path=join(root,p.source,file);if(existsSync(path)){try{const d=JSON.parse(readFileSync(path,'utf8'));for(const s of Object.values(d.mcpServers??d) as any[])if(s.url)urls.add(s.url.replace(/\/$/,''));}catch{}}}
 }
}
for(const s of lock.registry){
 if(entries.size>=475)break;
 const namespace=s.name.split('/')[0];const base=(s.title??namespace.split('.').reverse().slice(0,-1).join('-')).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100);
 const remote=s.remotes[0];if(!base||entries.has(base)||urls.has(remote.url.replace(/\/$/,'')))continue;
 // Only one app per verified DNS namespace and endpoint, independent of server versions.
 if([...entries.values()].some(p=>p['x-registry-namespace']===namespace))continue;
 const id=publisherNamespaces.includes(namespace)?namespace.split('.')[1]:base;
 if(entries.has(id))continue;
 const mcp:any={type:'http',url:remote.url};
 const vars:any={};for(const [key,value] of Object.entries(remote.variables??{}) as any){vars[key]='${'+key.toUpperCase().replace(/[^A-Z0-9_]/g,'_')+'}';mcp.url=mcp.url.replaceAll('{'+key+'}',vars[key]);}
 if(/[{}]/.test(mcp.url.replace(/\$\{[A-Z_][A-Z0-9_]*\}/g,'')))continue;
 for(const h of remote.headers??[]){mcp.headers??={};mcp.headers[h.name]=h.value??'${'+h.name.toUpperCase().replace(/[^A-Z0-9_]/g,'_')+'_TOKEN}';}
 const path=`plugins/${id}`;
 await json(join(root,path,'.claude-plugin/plugin.json'),{name:id,version:s.version,description:s.description});
 await json(join(root,path,'mcp.json'),{mcpServers:{[id]:mcp}});
 const p:any={name:id,description:s.description,source:'./'+path,version:s.version,'x-registry-namespace':namespace,'x-compozy':{category:category({name:id,description:s.description}),featured:featured.has(id),supersedes:[]}};
 entries.set(id,p);urls.add(remote.url.replace(/\/$/,''));
 // Registry URLs are fixed strings in checked-in bytes; commit pins the generated wrapper.
 lock.entries[id]={repository:'https://registry.modelcontextprotocol.io',contentSHA256:Bun.CryptoHasher.hash('sha256',JSON.stringify(s),'hex'),registryName:s.name,registryVersion:s.version,url:remote.url};
}
const doc={name:'compozy-plugins',owner:{name:'Compozy'},plugins:[...entries.values()].sort((a,b)=>a.name.localeCompare(b.name,'en'))};
validate(doc,lock,root);
await json(join(root,'.claude-plugin/marketplace.json'),doc);await json(lockPath,lock);
const generated=new Set(doc.plugins.map(p=>p.source).filter(s=>typeof s==='string'&&s.startsWith('./plugins/')).map(s=>s.slice('./plugins/'.length)));
for(const dir of readdirSync(join(root,'plugins')))if(!generated.has(dir))rmSync(join(root,'plugins',dir),{recursive:true});
const counts:any={};for(const p of doc.plugins)counts[p['x-compozy'].category]=(counts[p['x-compozy'].category]??0)+1;
console.log(JSON.stringify({entries:entries.size,categories:counts,featured:doc.plugins.filter(p=>p['x-compozy'].featured).map(p=>p.name),supersedes:doc.plugins.reduce((n,p)=>n+p['x-compozy'].supersedes.length,0),danglingSupersedes:[]},null,2));
