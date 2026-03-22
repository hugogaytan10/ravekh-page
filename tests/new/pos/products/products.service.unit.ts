import assert from "node:assert/strict";
import { ProductsService } from "../../../../src/new/systems/pos/features/products/services/ProductsService";
import { ManagedProduct } from "../../../../src/new/systems/pos/features/products/model/ManagedProduct";

const buildProduct = (id: number, available = true) =>
  new ManagedProduct(id, 10, `Product ${id}`, "desc", null, true, true, available, false, null, 30, null, 10, 2, null, null, null, null, null, [], null, []);

export async function run(): Promise<void> {
  const createRepo = {
    listByBusiness: async () => [],
    getById: async () => null,
    create: async () => buildProduct(101),
    update: async () => buildProduct(999),
    archive: async () => undefined,
  };

  const createService = new ProductsService(createRepo);
  const created = await createService.saveProduct(
    {
      businessId: 10,
      name: "New",
      description: "Desc",
      forSale: true,
      showInStore: true,
      available: true,
      images: [],
    },
    "token",
  );

  assert.equal(created.id, 101, "create flow should return created product");

  const updateRepo = {
    ...createRepo,
    create: async () => {
      throw new Error("create should not run in update flow");
    },
    update: async () => buildProduct(77),
  };

  const updateService = new ProductsService(updateRepo);
  const updated = await updateService.saveProduct(
    {
      id: 77,
      businessId: 10,
      name: "Updated",
      description: "Desc",
      forSale: true,
      showInStore: true,
      available: true,
      images: [],
    },
    "token",
  );

  assert.equal(updated.id, 77, "update flow should return updated product");

  let archivedId = 0;
  const archiveRepo = {
    ...createRepo,
    archive: async (id: number) => {
      archivedId = id;
    },
  };

  const archiveService = new ProductsService(archiveRepo);
  await archiveService.archiveProduct(55, "token");
  assert.equal(archivedId, 55, "archive should call repository with product id");
}
