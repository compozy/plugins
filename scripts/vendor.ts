import { existsSync, mkdirSync, cpSync, readFileSync, rmSync, readdirSync, lstatSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
async function run(args:string[]){const p=Bun.spawn(args,{stdout:'ignore',stderr:'pipe'});const stderr=await new Response(p.stderr).text();if(await p.exited)throw Error(stderr.slice(0,300));}
function license(dir:string){return ['LICENSE','LICENSE.md','LICENSE.txt','license','LICENCE'].map(f=>join(dir,f)).find(existsSync);}
function permissive(path:string){const text=readFileSync(path,'utf8');return /Apache License[\s\S]*Version 2\.0/.test(text)||/Permission is hereby granted, free of charge/.test(text)||/Redistribution and use in source and binary forms/.test(text);}
function size(dir:string):{files:number,bytes:number,nodes:number}{
 let files=0,bytes=0,nodes=1;
 for(const name of readdirSync(dir)){
  if(name==='.git'||name==='.cache'||name==='.ready')continue;
  const path=join(dir,name),stat=lstatSync(path);
  if(stat.isSymbolicLink())throw Error('package contains symlinks requiring publisher review');
  if(stat.isDirectory()){const s=size(path);files+=s.files;bytes+=s.bytes;nodes+=s.nodes;}else{files++;nodes++;bytes+=stat.size;}
 }
 return {files,bytes,nodes};
}
export async function vendorEntries(root:string,entries:Map<string,any>,lock:any){
 const checkouts=new Map<string,Promise<string>>(),report:any[]=[],eligible:any[]=[];
 async function checkout(repo:string,commit:string){
  const key=repo+'@'+commit;
  if(!checkouts.has(key))checkouts.set(key,(async()=>{
   const dir=join(root,'.cache','publisher',repo,commit),ready=join(dir,'.ready');
   if(!existsSync(ready)){
    rmSync(dir,{recursive:true,force:true});mkdirSync(dir,{recursive:true});const file=dir+'.tgz';
    try{
     await run(['curl','-fsSL','--max-time','45','--max-filesize','33554432',`https://codeload.github.com/${repo}/tar.gz/${commit}`,'-o',file]);
     await run(['tar','-xzf',file,'--strip-components=1','-C',dir]);await Bun.write(ready,'complete\n');
    }catch(error){rmSync(dir,{recursive:true,force:true});throw error;}finally{rmSync(file,{force:true});}
   }
   return dir;
  })());
  return checkouts.get(key)!;
 }
 const plugins=[...entries.values()].filter(p=>typeof p.source!=='string');let next=0;
 await Promise.all(Array.from({length:4},async()=>{
  for(;;){const p=plugins[next++];if(!p)break;
   const source=p.source,url=source.url??`https://github.com/${source.repo}.git`;
   const repo=url.match(/^https:\/\/github.com\/([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
   if(!repo){report.push({name:p.name,status:'retained external',reason:'non-GitHub publisher'});continue;}
   try{
    const checkoutRoot=await checkout(repo,source.ref),packageRoot=resolve(checkoutRoot,source.path??'.');
    if(relative(checkoutRoot,packageRoot).startsWith('..')||!existsSync(packageRoot))throw Error('package path unavailable');
    const governing=license(packageRoot)??license(checkoutRoot);
    if(!governing||!permissive(governing))throw Error('no recognized permissive publisher license');
    const stats=size(packageRoot),subdir=Boolean(source.path);
    if(stats.files>(subdir?1000:100)||stats.bytes>(subdir?10:1)*1048576)throw Error('package exceeds catalog vendoring size allowance');
    eligible.push({p,source,repo,checkoutRoot,packageRoot,governing,stats,subdir});
   }catch(error){report.push({name:p.name,status:'retained external',reason:String(error)});}
  }
 }));
 // Reserve the remaining source snapshot quota for authoring files, candidates and Anthropic trees.
 let nodes=0,bytes=0;
 for(const item of eligible.sort((a,b)=>Number(b.subdir)-Number(a.subdir)||a.stats.files-b.stats.files||a.p.name.localeCompare(b.p.name,'en'))){
  const {p,source,repo,checkoutRoot,packageRoot,governing,stats}=item;
  if(nodes+stats.nodes>5500||bytes+stats.bytes>80*1048576){report.push({name:p.name,status:'retained external',reason:'catalog snapshot quota reserve'});continue;}
  const local=`upstream/publishers/${p.name}`;rmSync(join(root,local),{recursive:true,force:true});
  cpSync(packageRoot,join(root,local),{recursive:true,filter:(path)=>path!==join(checkoutRoot,'.ready')});
  for(const file of ['LICENSE','LICENSE.md','LICENSE.txt','NOTICE','NOTICE.md'])if(existsSync(join(checkoutRoot,file))&&!existsSync(join(root,local,file)))cpSync(join(checkoutRoot,file),join(root,local,file));
  cpSync(governing,join(root,local,'PUBLISHER-LICENSE'));
  p.source='./'+local;lock.entries[p.name].vendored=true;nodes+=stats.nodes;bytes+=stats.bytes;
  report.push({name:p.name,status:'vendored',repository:repo,commit:source.ref,license:relative(checkoutRoot,governing)});
 }
 const localNames=new Set([...entries.values()].filter(p=>typeof p.source==='string'&&p.source.startsWith('./upstream/publishers/')).map(p=>p.name));
 for(const name of readdirSync(join(root,'upstream/publishers')))if(!localNames.has(name))rmSync(join(root,'upstream/publishers',name),{recursive:true});
 // Whole-repository archives already have a supported immutable HTTPS acquisition path, without API ref resolution.
 for(const p of plugins){if(typeof p.source==='string'||p.source.path)continue;
  const repo=(p.source.url??'').match(/^https:\/\/github.com\/([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
  if(repo){p.source=`https://github.com/${repo}/archive/${p.source.ref}.tar.gz`;lock.entries[p.name].archive=true;}
 }
 return report.sort((a,b)=>a.name.localeCompare(b.name,'en'));
}
