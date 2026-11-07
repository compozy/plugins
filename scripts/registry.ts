import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
export async function collectRegistry(get: (url:string)=>Promise<any>, allowlist:any[]) {
 const admitted:any[]=[], candidates:any[]=[];
 const seen=new Set<string>(), cursors=new Set<string>();
 let cursor='',pages=0,records=0;
 do {
  const url='https://registry.modelcontextprotocol.io/v0.1/servers?limit=100&version=latest'+(cursor?'&cursor='+encodeURIComponent(cursor):'');
  const page=await get(url);pages++;
  if(!Array.isArray(page.servers))throw Error('Registry page missing servers');
  for(const item of page.servers){
   records++;
   const s=item.server, meta=item._meta?.['io.modelcontextprotocol.registry/official'];
   if(!s?.name || seen.has(s.name))continue;
   seen.add(s.name);
   const app=allowlist.find(a=>a.namespace===s.name.split('/')[0]&&a.server===s.name);
   const remote=app && s.remotes?.find((r:any)=>r.type==='streamable-http'&&r.url===app.url);
   if(app && remote && meta?.status==='active' && meta.isLatest!==false){
    admitted.push({...s,remotes:[remote]});
   }else candidates.push({registryName:s.name,version:s.version,reason:app?'reviewed endpoint unavailable or inactive':'publisher not allowlisted'});
  }
  cursor=page.metadata?.nextCursor??'';
  if(cursor && cursors.has(cursor))throw Error('Registry cursor cycle');
  cursors.add(cursor);
 }while(cursor);
 return {admitted:admitted.sort((a,b)=>a.name.localeCompare(b.name,'en')),candidates:candidates.sort((a,b)=>a.registryName.localeCompare(b.registryName,'en')),scan:{complete:true,pages,records,names:seen.size}};
}
export function reviewCandidates(records:any[],review:any[]) {
 const selected=new Map<string,any>();
 for(const record of records){
  const app=review.find((a:any)=>a.server===record.registryName);
  if(app)selected.set(record.registryName,{...record,app:app.app,publisher:app.publisher,reason:'recognizable publisher; endpoint, license and app overlap require review'});
 }
 return [...selected.values()].sort((a,b)=>a.registryName.localeCompare(b.registryName,'en'));
}
export async function readRegistry(root:string,allowlist:any[],review:any[]){
 const raw=join(root,'.cache','registry-pages',new Date().toISOString().replaceAll(':','-'));
 mkdirSync(raw,{recursive:true});let pageNumber=0;
 const result=await collectRegistry(async(url)=>{
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error(`Registry HTTP ${response.status}`);
  const page=await response.json();
  await Bun.write(join(raw,`${++pageNumber}.json`),JSON.stringify(page));
  return page;
 },allowlist);
 console.error(`Registry complete: ${result.scan.pages} pages, ${result.scan.names} publishers/servers, ${result.admitted.length} reviewed matches`);
 return {...result,candidates:reviewCandidates(result.candidates,review)};
}
