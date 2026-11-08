import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// Mirrors internal/marketplace.ValidateIcon: the URL, including its encoding, is at most 64 KiB.
export function validateIcon(value: string) {
 if (value === '') return;
 if (typeof value !== 'string' || Buffer.byteLength(value) > 65536) throw Error('icon exceeds 64 KiB or is not a string');
 if (value.startsWith('data:')) {
  const match = /^data:(image\/(?:png|svg\+xml|webp))(;base64)?,(.+)$/s.exec(value);
  if (!match) throw Error('invalid icon data URL');
  if (match[2]) {
   const data = match[3].replace(/[\r\n]/g, '');
   if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data)) throw Error('invalid icon base64');
  } else if (/%(?![0-9a-f]{2})/i.test(match[3])) throw Error('invalid icon escaping');
  return;
 }
 const url = new URL(value);
 if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.hash || !/\.(png|svg|webp)$/i.test(url.pathname)) throw Error('invalid icon HTTPS URL');
}

export function applyIcons(doc: any, root: string) {
 const sources = JSON.parse(readFileSync(resolve(root, 'icons/sources.json'), 'utf8'));
 for (const entry of doc.plugins) {
  const source = sources[entry.name];
  if (source) entry.icon = iconData(root, source);
  else delete entry.icon;
 }
}
function iconData(root: string, source: any) {
 if (!/^icons\/[a-z0-9._-]+\.(png|svg|webp)$/.test(source.file)) throw Error('invalid icon asset path');
 const bytes = readFileSync(resolve(root, source.file));
 if (bytes.length !== source.bytes || createHash('sha256').update(bytes).digest('hex') !== source.sha256) throw Error('icon provenance hash mismatch');
 if (!['image/png', 'image/svg+xml', 'image/webp'].includes(source.contentType)) throw Error('invalid icon media type');
 if (source.catalogCommit !== undefined) {
  if (!/^[a-f0-9]{40}$/.test(source.catalogCommit)) throw Error('icon catalog commit must be immutable');
  const url = `https://raw.githubusercontent.com/compozy/plugins/${source.catalogCommit}/${source.file}`;
  validateIcon(url);
  return url;
 }
 return `data:${source.contentType};base64,${bytes.toString('base64')}`;
}
export function checkIcons(doc: any, root: string) {
 const sources = JSON.parse(readFileSync(resolve(root, 'icons/sources.json'), 'utf8'));
 const review = JSON.parse(readFileSync(resolve(root, 'icons.json'), 'utf8'));
 const names = new Set(doc.plugins.map((p: any) => p.name));
 for (const [name, source] of Object.entries(sources) as [string, any][]) {
  if (!names.has(name) || !review[name] || source.entry !== name || !source.sourcePage || !source.assetURL) throw Error(`unreviewed icon provenance: ${name}`);
 }
 for (const entry of doc.plugins) {
  if (entry.icon !== undefined) {
   validateIcon(entry.icon);
   if (!sources[entry.name] || entry.icon !== iconData(root, sources[entry.name])) throw Error(`missing or mismatched icon provenance: ${entry.name}`);
  } else if (sources[entry.name]) throw Error(`reviewed icon missing: ${entry.name}`);
 }
}
