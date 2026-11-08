import { checkIcons } from './icons';
import { existsSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative } from 'node:path';
export const categories = ['productivity','communication','design','development','data','cloud','finance','sales-marketing','research','security','ai-agents','more'];
export function validate(doc: any, lock: any, root: string, curation?: any) {
  if (Buffer.byteLength(JSON.stringify(doc,null,2)+'\n') > 2 * 1024 * 1024) throw Error('catalog exceeds daemon 2 MiB document limit');
 if (doc.name !== 'compozy-plugins' || !doc.plugins.length || doc.plugins.length > 1000) throw Error('invalid catalog size or name');
  const names = new Set<string>();
  for (const p of doc.plugins) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(p.name) || names.has(p.name)) throw Error(`invalid or duplicate name: ${p.name}`);
    names.add(p.name);
    if(curation?.exclusions?.[p.name]?.commit===lock.entries?.[p.name]?.commit && curation?.exclusions?.[p.name])throw Error(`excluded package listed: ${p.name}`);
    if(curation?.materializeEntries?.includes(p.name) && (typeof p.source!=='string'||!p.source.startsWith('./upstream/publishers/')))throw Error(`package requires materialized source: ${p.name}`);
    const reviewed=reviewedCategory(p.name,curation?.categories);
    if(p['x-compozy']?.category!==reviewed)throw Error(`category differs from reviewed table: ${p.name}`);
    if (p['x-registry-namespace']) {
      const app=curation?.registry.find((a:any)=>a.id===p.name && a.namespace===p['x-registry-namespace']);
      if (!app) throw Error(`unreviewed registry publisher: ${p.name}`);
      if (app.category!==p['x-compozy']?.category) throw Error(`unreviewed registry category: ${p.name}`);
    }
    if (p['x-compozy']?.featured && curation?.featured[p.name]!==p['x-compozy'].category) throw Error(`unreviewed featured category: ${p.name}`);
    if (!categories.includes(p['x-compozy']?.category)) throw Error(`invalid category: ${p.name}`);
    if (typeof p.source === 'string' && p.source.startsWith('https://')) {
      if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/archive\/[a-f0-9]{40}\.tar\.gz$/.test(p.source)) throw Error(`unpinned archive: ${p.name}`);
    } else if (typeof p.source === 'string') {
      const path = resolve(root,p.source);
      if (!p.source.startsWith('./') || relative(root,path).startsWith('..') || !existsSync(path)) throw Error(`invalid local source: ${p.name}`);
      const pin = lock.entries[p.name];
      if (!pin || (!/^[a-f0-9]{40}$/.test(pin.commit??'') && !/^[a-f0-9]{64}$/.test(pin.contentSHA256??''))) throw Error(`unpinned local source: ${p.name}`);
    } else if (!/^[a-f0-9]{40}$/.test(p.source.ref ?? '')) throw Error(`unpinned source: ${p.name}`);
    for (const target of p['x-compozy'].supersedes ?? []) {
      if (!lock.officialNames.includes(target.replace('claude-plugins-official/',''))) throw Error(`dangling supersede: ${target}`);
    }
  }
}
if (import.meta.main) {
 const root=resolve(import.meta.dir,'..');
 const curation=await Bun.file(`${root}/curation.json`).json();
 curation.categories=await Bun.file(`${root}/categories.json`).json();
 validate(await Bun.file(`${root}/.claude-plugin/marketplace.json`).json(),await Bun.file(`${root}/sources.lock.json`).json(),root,curation);
 checkIcons(await Bun.file(`${root}/.claude-plugin/marketplace.json`).json(),root);
 console.log(checkSnapshotQuota(root));
 console.log('Catalog validation passed (size, identities, categories, pins, local paths, supersedes).');
}

export function checkSnapshotQuota(root:string, reservedDirectories:string[] = []) {
 let nodes=0,bytes=0;
 function walk(dir:string){for(const name of readdirSync(dir)){
  if(name==='.git'||name==='.cache'||(dir===root&&reservedDirectories.includes(name)))continue;
  const path=resolve(dir,name),stat=lstatSync(path);nodes++;
  if(stat.isDirectory())walk(path);else bytes+=stat.size;
 }}
 walk(root);
 if(nodes>9500||bytes>400*1024*1024)throw Error(`catalog snapshot quota exceeded: ${nodes} nodes, ${bytes} bytes`);
 return {nodes,bytes};
}

export function reviewedCategory(name:string,review:Record<string,string>) {
 const category=review?.[name];
 if(!Object.hasOwn(review??{},name)||!categories.includes(category))throw Error(`missing reviewed category: ${name}`);
 return category;
}
