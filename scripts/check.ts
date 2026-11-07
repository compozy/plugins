import { existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
export const categories = ['productivity','communication','design','development','data','cloud','finance','sales-marketing','research','security','ai-agents','more'];
export function validate(doc: any, lock: any, root: string) {
  if (doc.name !== 'compozy-plugins' || !doc.plugins.length || doc.plugins.length > 1000) throw Error('invalid catalog size or name');
  const names = new Set<string>();
  for (const p of doc.plugins) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(p.name) || names.has(p.name)) throw Error(`invalid or duplicate name: ${p.name}`);
    names.add(p.name);
    if (!categories.includes(p['x-compozy']?.category)) throw Error(`invalid category: ${p.name}`);
    if (typeof p.source === 'string') {
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
 validate(await Bun.file(`${root}/.claude-plugin/marketplace.json`).json(),await Bun.file(`${root}/sources.lock.json`).json(),root);
 console.log('Catalog validation passed (size, identities, categories, pins, local paths, supersedes).');
}
