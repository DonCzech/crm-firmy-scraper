// Webero Commerce — public surface.
// Domain schema: ./schema.ts (lazy init, separate from platform db.ts).

export { initCommerceDb, COMMERCE_CORE_MODULES } from "./schema";
export { getShopByTenantId, ensureShopInTx, updateShop, nextOrderNumberInTx } from "./shop";
export {
  listCategories, getCategory, getCategoryBySlug,
  createCategory, updateCategory, deleteCategory,
} from "./categories";
export {
  listProducts, getProduct, getProductBySlug, resolveProductSlugRedirect,
  createProduct, updateProduct, archiveProduct, adjustStock,
} from "./products";
export { listOrders, getOrder, createOrder, updateOrderStatus, canTransitionOrder } from "./orders";
export { activateCommerceInTx, seedDemoCatalogInTx } from "./seed";
export type * from "./types";
