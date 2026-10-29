const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),esbuild=require('esbuild');
const m={exports:{}};vm.runInNewContext(esbuild.transformSync(fs.readFileSync('src/new/systems/pos/shared/api/PosBranchApi.ts','utf8'),{loader:'ts',format:'cjs'}).code,{module:m,exports:m.exports,require:()=>({})});
const calls=[];let capability=0;const api=new m.exports.PosBranchApi({request:async request=>{calls.push(request);return request.method==='GET'?{tableCopyVersion:capability}:{data:{Id:12,Business_Id:1}};}});
(async()=>{
 const base={name:'Norte',code:'N',slug:'n'};await api.create(base,'fake');assert.equal(calls.length,1);assert(!('copyOptions' in calls[0].body));
 const copyOptions={version:2,categories:false,products:false,prices:false,shipping:false,tables:true,inventoryMode:'zero'};
 await assert.rejects(api.create({...base,copyOptions},'fake'),/copia de mesas/);assert.equal(calls.at(-1).method,'GET');
 capability=1;await api.create({...base,copyOptions},'fake');assert.equal(calls.at(-2).path,'branches/copy-capabilities');assert.equal(calls.at(-1).body.copyOptions.tables,true);assert.equal(calls.at(-1).body.copyOptions.products,false);
 assert.equal(m.exports.initialBranchCopyOptions().tables,false);
 console.log('Table web client OK: legacy create untouched, table copy capability before POST, tables-only copy, default off. No network.');
})().catch(error=>{console.error(error);process.exitCode=1;});
