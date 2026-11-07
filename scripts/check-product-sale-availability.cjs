const assert = require('node:assert/strict');
const esbuild = require('esbuild');
function load(file) {
  const code = esbuild.buildSync({entryPoints: [file], bundle: true, platform: 'node', format: 'cjs', write: false}).outputFiles[0].text;
  const module = {exports: {}};
  new Function('module', 'exports', 'require', code)(module, module.exports, require);
  return module.exports;
}
const {PosProductApi} = load('src/new/systems/pos/features/sales/api/PosProductApi.ts');
const {ProductService} = load('src/new/systems/pos/features/sales/services/ProductService.ts');
const cases = [
  [{ForSale: 1, Available: 0}, false],
  [{ForSale: true, Available: false}, false],
  [{ForSale: '1', Available: '0'}, false],
  [{ForSale: 0, Available: 1}, false],
  [{ForSale: false, Available: true}, false],
  [{ForSale: '0', Available: '1'}, false],
  [{ForSale: 1, Available: 1}, true],
  [{ForSale: true, Available: true}, true],
  [{ForSale: '1', Available: '1'}, true],
  [{ForSale: true}, true],
  [{}, true],
  [{ForSale: null, Available: null}, true],
  [{ForSale: 'invalid', Available: 1}, false],
  [{ForSale: 1, Available: 'invalid'}, false],
];
(async () => {
  for (const [flags, expected] of cases) {
    const row = {Id: 1913, Business_Id: 105, Name: 'Test', Price: 123, Stock: 10, ...flags};
    const requests = [];
    const api = new PosProductApi({request: async request => {
      requests.push(request); return {data: [row], pagination: {page: 1, totalPages: 1}};
    }});
    const service = new ProductService(api);
    for (const query of [undefined, 'Test']) {
      const result = await service.getSellableProductsPaginated(105, 'test', 'MAX', 1, null, query);
      assert.equal(result.products.length, expected ? 1 : 0, JSON.stringify(flags));
    }
    const search = await service.getSellableProductsForSearch(105, 'test', 'MAX');
    assert.equal(search.length, expected ? 1 : 0);
    assert.ok(requests.every(request => request.method === 'GET' && request.path.includes('/branch')));
  }
  console.log('PASS: 14 web availability cases across listing, query search and full search (42 checks). No network.');
})().catch(error => {console.error(error); process.exitCode = 1;});
