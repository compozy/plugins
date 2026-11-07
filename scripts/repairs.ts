import { existsSync, readFileSync, rmSync, copyFileSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { inspectMaterializedTree, materializeTree } from './materialize';
import { checkSnapshotQuota } from './check';
function license(dir:string){return ['LICENSE','LICENSE.md','LICENSE.txt','license','LICENCE'].map(f=>join(dir,f)).find(existsSync);}
function permissive(path:string){const text=readFileSync(path,'utf8');return /Apache License[\s\S]*Version 2\.0/.test(text)||/Permission is hereby granted, free of charge/.test(text)||/Redistribution and use in source and binary forms/.test(text);}
export function repairEntries(root:string,entries:Map<string,any>,lock:any,curation:any,report:any[],candidates:any){
 const excluded:any[]=[],attempted=new Set(entries.keys());
 function exclude(id:string,reason:string){
  const entry=entries.get(id);if(!entry)return;
  excluded.push({entry:id,source:entry.source,commit:lock.entries[id]?.commit,reason});entries.delete(id);
  report.splice(0,report.length,...report.filter(r=>r.name!==id));report.push({name:id,status:'excluded',reason});
  const local=join(root,'upstream/publishers',id);if(existsSync(local))rmSync(local,{recursive:true});
 }
 for(const [id,decision] of Object.entries(curation.exclusions??{}) as any){
  if(lock.entries[id]?.commit===decision.commit)exclude(id,decision.reason);
 }
 for(const id of curation.materializeEntries??[]){
  if(!entries.has(id))continue;
  const pin=lock.entries[id],repo=pin.repository.replace('https://github.com/','').replace(/\.git$/,'');
  const checkout=join(root,'.cache/publisher',repo,pin.commit),pkg=join(checkout,pin.path??'');
  try{
   if(!existsSync(join(checkout,'.ready')))throw Error('publisher archive unavailable within generator download limits');
   const real=realpathSync(pkg),rel=relative(realpathSync(checkout),real);
   if(rel==='..'||rel.startsWith('../'))throw Error('package path escapes publisher checkout');
   const governing=license(pkg)??license(checkout);
   if(governing){const licensePath=relative(realpathSync(checkout),realpathSync(governing));if(licensePath==='..'||licensePath.startsWith('../'))throw Error('license escapes publisher checkout');}
   if(!governing||!permissive(governing))throw Error('no recognized permissive publisher license');
   const tree=inspectMaterializedTree(pkg),quota=checkSnapshotQuota(root);
   const local=`upstream/publishers/${id}`,destination=join(root,local);
   // Retain headroom for attribution files, candidates and generator reports.
   const old=existsSync(destination)?inspectMaterializedTree(destination):{nodes:0,bytes:0};
   if(quota.nodes-old.nodes+tree.nodes>9000||quota.bytes-old.bytes+tree.bytes>100*1048576)throw Error('materialized package exceeds catalog snapshot quota');
   rmSync(destination,{recursive:true,force:true});materializeTree(tree,destination);
   for(const file of ['LICENSE','LICENSE.md','LICENSE.txt','NOTICE','NOTICE.md'])if(existsSync(join(checkout,file))&&!existsSync(join(destination,file)))copyFileSync(join(checkout,file),join(destination,file));
   copyFileSync(governing,join(destination,'PUBLISHER-LICENSE'));
   entries.get(id).source='./'+local;pin.vendored=true;delete pin.archive;
   report.splice(0,report.length,...report.filter(r=>r.name!==id));
   report.push({name:id,status:'vendored',repository:repo,commit:pin.commit,license:relative(checkout,governing),materializedSymlinks:tree.links});
  }catch(error){exclude(id,String(error));}
 }
 const governed=new Set([...Object.keys(curation.exclusions??{}),...(curation.materializeEntries??[])]);
 candidates.excludedEntries=[...(candidates.excludedEntries??[]).filter((c:any)=>!governed.has(c.entry)||!attempted.has(c.entry)),...excluded].sort((a:any,b:any)=>a.entry.localeCompare(b.entry,'en'));
 report.sort((a,b)=>a.name.localeCompare(b.name,'en'));
 return excluded;
}
