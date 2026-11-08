import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// Catalog policy is stricter than the daemon: only inline images, at most 64 KiB encoded.
export function validateIcon(value: string) {
 if (typeof value !== 'string' || Buffer.byteLength(value) > 65536) throw Error('icon exceeds 64 KiB or is not a string');
 if (value.startsWith('data:')) {
  const match = /^data:(image\/(?:png|svg\+xml|webp))(;base64)?,(.+)$/s.exec(value);
  if (!match) throw Error('invalid icon data URL');
  if (match[2]) {
   const data = match[3].replace(/[\r\n]/g, '');
   if (!data || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(data)) throw Error('invalid icon base64');
  } else if (/%(?![0-9a-f]{2})/i.test(match[3])) throw Error('invalid icon escaping');
  return;
 }
 throw Error('catalog icons must be inline data URLs');
}

export function applyIcons(doc: any, root: string) {
 const sources = JSON.parse(readFileSync(resolve(root, 'icons/sources.json'), 'utf8'));
 for (const entry of doc.plugins) {
  const source = sources[entry.name];
  if (source) entry.icon = iconData(root, source, true);
  else delete entry.icon;
 }
}
function iconData(root: string, source: any, writeDerived = false) {
 if (!/^icons\/[a-z0-9._-]+\.(png|svg|webp)$/.test(source.file)) throw Error('invalid icon asset path');
 const bytes = readFileSync(resolve(root, source.file));
 if (bytes.length !== source.bytes || createHash('sha256').update(bytes).digest('hex') !== source.sha256) throw Error('icon provenance hash mismatch');
 if (!['image/png', 'image/svg+xml', 'image/webp'].includes(source.contentType)) throw Error('invalid icon media type');
 let data = `data:${source.contentType};base64,${bytes.toString('base64')}`;
 // Bound the whole 333-entry feed as well as each icon. Keep small originals exact.
 if (Buffer.byteLength(data) > 8192) {
  let input = bytes;
  if (source.contentType === 'image/svg+xml') {
   input = convert('rsvg-convert', ['--keep-aspect-ratio', '--width', '128', '--height', '128'], bytes);
  }
  const derived = convert('magick', ['-', '-resize', '128x128>', '-strip', '-define', 'webp:lossless=true', '-quality', '100', 'webp:-'], input);
  const candidate = `data:image/webp;base64,${derived.toString('base64')}`;
  if (candidate.length < data.length) {
   data = candidate;
   if (writeDerived) {
    mkdirSync(resolve(root, 'icons/derived'), {recursive:true});
    writeFileSync(resolve(root, 'icons/derived', source.file.slice(6).replace(/\.[^.]+$/, '.webp')), derived);
   }
  }
 }
 validateIcon(data);
 return data;
}
function convert(command: string, args: string[], input: Buffer): Buffer {
 const result = spawnSync(command, args, {input, maxBuffer: 8 * 1024 * 1024});
 if (result.error || result.status !== 0) throw Error(`icon conversion failed (${command}): ${result.error?.message ?? result.stderr.toString()}`);
 return result.stdout;
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
