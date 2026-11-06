const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),esbuild=require('esbuild');
function load(file,resolve,extra={}){const m={exports:{}};vm.runInNewContext(esbuild.transformSync(fs.readFileSync(file,'utf8'),{loader:'ts',format:'cjs',target:'es2020'}).code,{module:m,exports:m.exports,require:resolve,...extra});return m.exports;}
const model=load('src/new/systems/loyalty/rewards-management/model/RewardCoupon.ts',require);
const {LoyaltyApi}=load('src/new/systems/loyalty/rewards-management/api/LoyaltyApi.ts',()=>model);
const {RewardService}=load('src/new/systems/loyalty/rewards-management/services/RewardService.ts',require);
const {RewardsManagementPage}=load('src/new/systems/loyalty/rewards-management/pages/RewardsManagementPage.ts',require);
const calls=[];let support=1;
const dto={Id:5,Business_Id:1,QR:'test',Description:'test',LimitUsers:10,Branch_Ids:[11,12],Branch_Names:['Principal','Norte']};
const http={request:async request=>{calls.push(request);if(request.path==='coupons/branch-capabilities')return {couponBranchScopeVersion:support};if(request.path==='coupons/business/1')return [dto];if(request.method==='POST')return 5;if(request.method==='PUT')return {affectedRows:1};return dto;}};
const api=new LoyaltyApi(http),page=new RewardsManagementPage(new RewardService(api));
(async()=>{
 const old={businessId:1,qr:'test',description:'test',maxRedemptions:10};await api.createCoupon(old,'fake');assert.equal(calls.length,1);assert(!('Branch_Ids' in calls[0].body));
 await page.createCoupon(1,{...old,branchIds:[11,12]},'fake');assert.equal(calls.at(-2).path,'coupons/branch-capabilities');assert.deepEqual(calls.at(-1).body.Branch_Ids,[11,12]);
 const lookup=await page.lookupCoupon(1,'test','fake');assert.deepEqual(Array.from(lookup.branchIds),[11,12]);assert.deepEqual(Array.from(lookup.branchNames),['Principal','Norte']);
 const list=await page.listCoupons(1,'fake');assert.deepEqual(Array.from(list[0].branchIds),[11,12]);
 await page.updateCoupon(5,1,{...old,branchIds:null},'fake');assert.equal(calls.at(-2).body.Branch_Ids,null);
 support=0;const before=calls.length;await assert.rejects(api.createCoupon({...old,branchIds:[11]},'fake'),/aún no está disponible/);assert.equal(calls.length,before+1);assert.equal(calls.at(-1).method,'GET');
 assert.equal(model.couponBranchLabel([11],['Principal']),'Válido en: Principal');assert.equal(model.couponBranchLabel(null),'Válido en todas las sucursales');
 const fetchCalls=[];
 const branch={readActivePosBranchId:()=>11,buildPosAuthHeaders:()=>({'X-Branch-Id':'11',token:'fake'})};
 const coupons=load('src/new/systems/loyalty/features/coupons/services/couponsApi.ts',path=>path.endsWith('/posBranch')?branch:path.endsWith('/posSession')?{readPosSessionSnapshot:()=>({token:'fake'})}:path.endsWith('/session')?{getCuponesToken:()=>''}:{COUPONS_API_URL:'https://local.invalid/'},{fetch:async(url,options)=>{fetchCalls.push({url,options});return {ok:true,json:async()=>({})};}});
 await coupons.redeemCouponByUser(5,7);assert.equal(fetchCalls[0].options.headers['X-Coupon-Scope'],'branch-v1');assert.equal(fetchCalls[0].options.headers['X-Branch-Id'],'11');
 console.log('Coupon web OK: legacy payloads, capability gate, scope through page/service/API, edit/list/lookup metadata, selected POS branch on redemption. No network.');
})().catch(error=>{console.error(error);process.exitCode=1;});
