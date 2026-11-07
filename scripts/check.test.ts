import { test, expect } from 'bun:test';
import { validate } from './check';
// Invariant: the published catalog never admits mutable repository refs or dangling supersedes.
// Owner: catalog generator; canonical suite: check.test.ts.
const entry={name:'fixture',source:{source:'url',url:'https://github.com/example/plugin',ref:'a'.repeat(40)},'x-compozy':{category:'productivity',featured:true,supersedes:['claude-plugins-official/fixture']}};
const doc=(p:any)=>({name:'compozy-plugins',plugins:[p]});
const lock={officialNames:['fixture']};
const curation={featured:{fixture:'productivity'},registry:[],categories:{fixture:'productivity'}};
test('accepts immutable repository sources',()=>expect(()=>validate(doc(entry),lock,'.',curation)).not.toThrow());
test('rejects mutable repository refs',()=>expect(()=>validate(doc({...entry,source:{...entry.source,ref:'main'}}),lock,'.',curation)).toThrow('unpinned'));
test('reports dangling supersedes',()=>expect(()=>validate(doc(entry),{officialNames:[]},'.',curation)).toThrow('dangling supersede'));
test('rejects duplicated app identities',()=>expect(()=>validate({name:'compozy-plugins',plugins:[entry,entry]},lock,'.',curation)).toThrow('duplicate'));

// Invariant: registry admission and category ownership stay explicit and pagination reaches the final page.
// Owner: catalog generator; canonical suite: check.test.ts.
import { collectRegistry } from './registry';
const official=(name:string,url:string)=>({server:{name,version:'1',remotes:[{type:'streamable-http',url}]},_meta:{'io.modelcontextprotocol.registry/official':{status:'active',isLatest:true}}});
test('scans past unreviewed early pages and only admits reviewed publishers',async()=>{
 const calls:string[]=[];
 const pages=[{servers:[official('ai.unknown/spam','https://spam.example/mcp')],metadata:{nextCursor:'z'}},{servers:[official('com.vendor/mcp','https://vendor.example/mcp')],metadata:{}}];
 const result=await collectRegistry(async(url)=>{calls.push(url);return pages[calls.length-1]},[{namespace:'com.vendor',server:'com.vendor/mcp',id:'vendor',category:'data',url:'https://vendor.example/mcp'}]);
 expect(calls).toHaveLength(2);expect(result.admitted.map(s=>s.name)).toEqual(['com.vendor/mcp']);expect(result.candidates.map(s=>s.registryName)).toEqual(['ai.unknown/spam']);expect(result.scan.complete).toBe(true);
});
test('rejects a wrapper outside the reviewed publisher allowlist',()=>{
 const p={...entry,'x-registry-namespace':'ai.unknown'};
 expect(()=>validate(doc(p),lock,'.',curation)).toThrow('unreviewed registry publisher');
});
test('rejects a wrapper category that disagrees with review',()=>{
 const p={...entry,'x-registry-namespace':'com.vendor'};
 expect(()=>validate(doc(p),lock,'.',{...curation,registry:[{id:'fixture',namespace:'com.vendor',category:'data'}]})).toThrow('unreviewed registry category');
});
test('accepts a SHA-pinned publisher archive without requiring vendoring rights',()=>{
 expect(()=>validate(doc({...entry,source:'https://github.com/example/plugin/archive/'+'a'.repeat(40)+'.tar.gz'}),lock,'.',curation)).not.toThrow();
});
test('rejects branch archive sources',()=>{
 expect(()=>validate(doc({...entry,source:'https://github.com/example/plugin/archive/main.tar.gz'}),lock,'.',curation)).toThrow('unpinned archive');
});

// Invariant: every published app has an explicit category and candidate review remains bounded.
// Owner: catalog generation; canonical suite: check.test.ts.
import { reviewedCategory } from './check';
import { reviewCandidates } from './registry';
test('rejects a category absent from the reviewed per-entry table',()=>{
 expect(()=>reviewedCategory('unknown',curation.categories)).toThrow('missing reviewed category');
 expect(()=>validate(doc(entry),lock,'.',{...curation,categories:{}})).toThrow('missing reviewed category');
});
test('rejects a published category that differs from explicit review',()=>{
 expect(()=>validate(doc({...entry,'x-compozy':{...entry['x-compozy'],category:'more'}}),lock,'.',curation)).toThrow('category differs from reviewed table');
});
test('keeps only deduplicated explicitly reviewed recognizable candidates',()=>{
 const known={registryName:'com.vendor/mcp',version:'1'},unknown={registryName:'ai.unknown/spam',version:'1'};
 const selected=reviewCandidates([known,unknown,known],[{server:'com.vendor/mcp',app:'Vendor',publisher:'Vendor'}]);
 expect(selected.map(c=>c.registryName)).toEqual(['com.vendor/mcp']);
});

// Invariant: publisher symlinks become regular package files only when every target is contained.
// Owner: catalog package materialization; canonical suite: check.test.ts.
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, lstatSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectMaterializedTree, materializeTree } from './materialize';
test('materializes contained file and directory links without retaining symlinks',()=>{
 const root=mkdtempSync(join(tmpdir(),'mpc-links-'));
 try{
  const source=join(root,'source'),dest=join(root,'dest');mkdirSync(join(source,'skills'),{recursive:true});
  writeFileSync(join(source,'skills','guide.md'),'guide');symlinkSync('skills/guide.md',join(source,'guide.md'));symlinkSync('skills',join(source,'alias'));
  const tree=inspectMaterializedTree(source);materializeTree(tree,dest);
  expect(tree.links).toHaveLength(2);expect(lstatSync(join(dest,'guide.md')).isSymbolicLink()).toBe(false);
  expect(lstatSync(join(dest,'alias')).isDirectory()).toBe(true);expect(readFileSync(join(dest,'alias','guide.md'),'utf8')).toBe('guide');
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('rejects escaping and cyclic links before copying package bytes',()=>{
 const root=mkdtempSync(join(tmpdir(),'mpc-links-'));
 try{
  const source=join(root,'source');mkdirSync(source);writeFileSync(join(root,'outside'),'outside');
  symlinkSync('../outside',join(source,'escape'));
  expect(()=>inspectMaterializedTree(source)).toThrow('symlink escapes package');
  rmSync(join(source,'escape'));symlinkSync('.',join(source,'cycle'));
  expect(()=>inspectMaterializedTree(source)).toThrow('symlink directory cycle');
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('rejects reintroduced known unloadable packages and unmaterialized sources',()=>{
 expect(()=>validate(doc(entry),{...lock,entries:{fixture:{commit:'a'.repeat(40)}}},'.',{...curation,exclusions:{fixture:{commit:'a'.repeat(40)}}})).toThrow('excluded package listed');
 expect(()=>validate(doc(entry),lock,'.',{...curation,materializeEntries:['fixture']})).toThrow('requires materialized source');
});
