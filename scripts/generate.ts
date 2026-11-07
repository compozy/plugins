import { mkdirSync, cpSync, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { validate, checkSnapshotQuota, reviewedCategory } from './check';
import { readRegistry, reviewCandidates } from './registry';
import { vendorEntries } from './vendor';
import { repairEntries } from './repairs';
const root=resolve(import.meta.dir,'..');
const refresh=process.argv.includes('--refresh');
const curation=await Bun.file(join(root,'curation.json')).json();
curation.categories=await Bun.file(join(root,'categories.json')).json();
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
if(process.argv.includes('--repair-known')){
 const doc=await Bun.file(join(root,'.claude-plugin/marketplace.json')).json();
 const entries=new Map<string,any>(doc.plugins.map((p:any)=>[p.name,p]));
 const report=await Bun.file(join(root,'vendoring.json')).json();
 const candidates=await Bun.file(join(root,'candidates.json')).json();
 repairEntries(root,entries,lock,curation,report,candidates);
 doc.plugins=[...entries.values()];
 lock.entries=Object.fromEntries(doc.plugins.map((p:any)=>[p.name,lock.entries[p.name]]));
 validate(doc,lock,root,curation);
 await json(join(root,'.claude-plugin/marketplace.json'),doc);await json(lockPath,lock);
 await json(join(root,'vendoring.json'),report);await json(join(root,'candidates.json'),candidates);
 console.log(checkSnapshotQuota(root));console.log(`Repaired catalog: ${doc.plugins.length} entries`);process.exit(0);
}
if(process.argv.includes('--metadata-only')){
 const doc=await Bun.file(join(root,'.claude-plugin/marketplace.json')).json();
 for(const entry of doc.plugins)entry['x-compozy'].category=reviewedCategory(entry.name,curation.categories);
 validate(doc,lock,root,curation);
 const candidates=await Bun.file(join(root,'candidates.json')).json();
 candidates.registryCandidates=reviewCandidates(candidates.registryCandidates,curation.registryReview);
 await json(join(root,'.claude-plugin/marketplace.json'),doc);
 await json(join(root,'candidates.json'),candidates);
 console.log(checkSnapshotQuota(root));
 console.log(`Reviewed categories applied to ${doc.plugins.length} entries without network or package changes.`);
 process.exit(0);
}
const featured=new Set(Object.keys(curation.featured));
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
  p['x-compozy']={category:'',featured:featured.has(p.name),supersedes};
  entries.set(p.name,p);identities.set(identity,p.name);
 }
}
if(refresh || process.argv.includes('--refresh-registry') || !lock.registryScan?.complete){
 const result=await readRegistry(root,curation.registry,curation.registryReview);
 lock.registry=result.admitted;
 lock.registryScan=result.scan;
 const candidates=await Bun.file(join(root,'candidates.json')).json();
 candidates.registryCandidates=result.candidates;
 await json(join(root,'candidates.json'),candidates);
}
const urls=new Set<string>();for(const p of entries.values()){
 const pin=lock.entries[p.name];
 if(typeof p.source==='string'){
  for(const file of ['.mcp.json','mcp.json']){const path=join(root,p.source,file);if(existsSync(path)){try{const d=JSON.parse(readFileSync(path,'utf8'));for(const s of Object.values(d.mcpServers??d) as any[])if(s.url)urls.add(s.url.replace(/\/$/,''));}catch{}}}
 }
}
for(const s of lock.registry){

 const namespace=s.name.split('/')[0];
 const app=curation.registry.find((app:any)=>app.namespace===namespace && app.server===s.name);
 if(!app)throw Error(`Unreviewed registry admission: ${s.name}`);
 const remote=s.remotes.find((r:any)=>r.type==='streamable-http'&&r.url===app.url);
 if(!remote)throw Error(`Reviewed endpoint missing: ${s.name}`);
 const id=app.id;
 if(entries.has(id)||urls.has(remote.url.replace(/\/$/,'')))continue;
 const mcp:any={type:'http',url:remote.url};
 const vars:any={};for(const [key,value] of Object.entries(remote.variables??{}) as any){vars[key]='${'+key.toUpperCase().replace(/[^A-Z0-9_]/g,'_')+'}';mcp.url=mcp.url.replaceAll('{'+key+'}',vars[key]);}
 if(/[{}]/.test(mcp.url.replace(/\$\{[A-Z_][A-Z0-9_]*\}/g,'')))continue;
 for(const h of remote.headers??[]){mcp.headers??={};mcp.headers[h.name]=h.value??'${'+h.name.toUpperCase().replace(/[^A-Z0-9_]/g,'_')+'_TOKEN}';}
 const path=`plugins/${id}`;
 await json(join(root,path,'.claude-plugin/plugin.json'),{name:id,version:s.version,description:s.description});
 await json(join(root,path,'mcp.json'),{mcpServers:{[id]:mcp}});
 const p:any={name:id,description:s.description,source:'./'+path,version:s.version,'x-registry-namespace':namespace,'x-compozy':{category:app.category,featured:featured.has(id),supersedes:[]}};
 entries.set(id,p);urls.add(remote.url.replace(/\/$/,''));
 // Registry URLs are fixed strings in checked-in bytes; commit pins the generated wrapper.
 lock.entries[id]={repository:'https://registry.modelcontextprotocol.io',contentSHA256:Bun.CryptoHasher.hash('sha256',JSON.stringify(s),'hex'),registryName:s.name,registryVersion:s.version,url:remote.url};
}
const candidates=await Bun.file(join(root,'candidates.json')).json();
candidates.registryCandidates=reviewCandidates(candidates.registryCandidates,curation.registryReview);
await json(join(root,'candidates.json'),candidates);
for(const entry of entries.values())entry['x-compozy'].category=reviewedCategory(entry.name,curation.categories);
const vendoring=await vendorEntries(root,entries,lock);
repairEntries(root,entries,lock,curation,vendoring,candidates);
await json(join(root,'candidates.json'),candidates);
await json(join(root,'vendoring.json'),vendoring);
const doc={name:'compozy-plugins',owner:{name:'Compozy'},plugins:[...entries.values()].sort((a,b)=>a.name.localeCompare(b.name,'en'))};
lock.entries=Object.fromEntries(doc.plugins.map(p=>[p.name,lock.entries[p.name]]));
validate(doc,lock,root,curation);
await json(join(root,'.claude-plugin/marketplace.json'),doc);await json(lockPath,lock);
const generated=new Set(doc.plugins.map(p=>p.source).filter(s=>typeof s==='string'&&s.startsWith('./plugins/')).map(s=>s.slice('./plugins/'.length)));
for(const dir of readdirSync(join(root,'plugins')))if(!generated.has(dir))rmSync(join(root,'plugins',dir),{recursive:true});
checkSnapshotQuota(root);
const counts:any={};for(const p of doc.plugins)counts[p['x-compozy'].category]=(counts[p['x-compozy'].category]??0)+1;
console.log(JSON.stringify({entries:entries.size,categories:counts,featured:doc.plugins.filter(p=>p['x-compozy'].featured).map(p=>p.name),supersedes:doc.plugins.reduce((n,p)=>n+p['x-compozy'].supersedes.length,0),danglingSupersedes:[]},null,2));
