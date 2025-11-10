// Export all database repositories
export { BaseRepository } from './base-repository';
export { StoresRepository } from './stores-repository';
export { SuppliersRepository } from './suppliers-repository';
export { InventoryRepository } from './inventory-repository';
export { SalesRepository } from './sales-repository';
export { ForecastsRepository } from './forecasts-repository';
export { PurchaseOrdersRepository } from './purchase-orders-repository';
export { CleanupIssuesRepository } from './cleanup-issues-repository';

// Import classes for instantiation
import { StoresRepository } from './stores-repository';
import { SuppliersRepository } from './suppliers-repository';
import { InventoryRepository } from './inventory-repository';
import { SalesRepository } from './sales-repository';
import { ForecastsRepository } from './forecasts-repository';
import { PurchaseOrdersRepository } from './purchase-orders-repository';
import { CleanupIssuesRepository } from './cleanup-issues-repository';

// Repository instances for easy import
export const storesRepo = new StoresRepository();
export const suppliersRepo = new SuppliersRepository();
export const inventoryRepo = new InventoryRepository();
export const salesRepo = new SalesRepository();
export const forecastsRepo = new ForecastsRepository();
export const purchaseOrdersRepo = new PurchaseOrdersRepository();
export const cleanupIssuesRepo = new CleanupIssuesRepository();