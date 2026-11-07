import { test, expect } from 'bun:test';
import { validate } from './check';
// Invariant: the published catalog never admits mutable repository refs or dangling supersedes.
// Owner: catalog generator; canonical suite: check.test.ts.
const entry={name:'fixture',source:{source:'url',url:'https://github.com/example/plugin',ref:'a'.repeat(40)},'x-compozy':{category:'productivity',featured:true,supersedes:['claude-plugins-official/fixture']}};
const doc=(p:any)=>({name:'compozy-plugins',plugins:[p]});
const lock={officialNames:['fixture']};
test('accepts immutable repository sources',()=>expect(()=>validate(doc(entry),lock,'.')).not.toThrow());
test('rejects mutable repository refs',()=>expect(()=>validate(doc({...entry,source:{...entry.source,ref:'main'}}),lock,'.')).toThrow('unpinned'));
test('reports dangling supersedes',()=>expect(()=>validate(doc(entry),{officialNames:[]},'.')).toThrow('dangling supersede'));
test('rejects duplicated app identities',()=>expect(()=>validate({name:'compozy-plugins',plugins:[entry,entry]},lock,'.')).toThrow('duplicate'));
