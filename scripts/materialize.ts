import { lstatSync, realpathSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, relative, join, isAbsolute } from 'node:path';

// Inspect the complete tree before writing anything; links must stay inside this package.
export function inspectMaterializedTree(source:string) {
 const root=realpathSync(source),items:any[]=[],links:any[]=[];
 function visit(path:string,dest:string,ancestors:Set<string>){
  const stat=lstatSync(path),real=stat.isSymbolicLink()?realpathSync(path):path;
  const rel=relative(root,real);
  if(rel==='..'||rel.startsWith('../')||isAbsolute(rel))throw Error(`symlink escapes package: ${dest}`);
  if(stat.isSymbolicLink())links.push({path:dest,target:rel});
  const resolved=lstatSync(real);
  if(resolved.isDirectory()){
   if(ancestors.has(real))throw Error(`symlink directory cycle: ${dest}`);
   items.push({path:dest,source:real,directory:true,bytes:0});
   const next=new Set(ancestors);next.add(real);
   for(const name of readdirSync(real).sort()){
    if(name==='.git'||name==='.cache'||name==='.ready')continue;
    visit(join(real,name),join(dest,name),next);
   }
  }else if(resolved.isFile())items.push({path:dest,source:real,directory:false,bytes:resolved.size});
  else throw Error(`unsupported package node: ${dest}`);
 }
 visit(root,'',new Set());
 return {items,links,nodes:items.length,bytes:items.reduce((n,x)=>n+x.bytes,0)};
}
export function materializeTree(tree:ReturnType<typeof inspectMaterializedTree>,destination:string){
 for(const item of tree.items){const target=resolve(destination,item.path);
  if(item.directory)mkdirSync(target,{recursive:true});else copyFileSync(item.source,target);
 }
}
