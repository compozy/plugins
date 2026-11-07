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
export async function readRegistry(_root:string,allowlist:any[]){
 const result=await collectRegistry(async(url)=>{
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error(`Registry HTTP ${response.status}`);
  return response.json();
 },allowlist);
 console.error(`Registry complete: ${result.scan.pages} pages, ${result.scan.names} publishers/servers, ${result.admitted.length} reviewed matches`);
 return result;
}
