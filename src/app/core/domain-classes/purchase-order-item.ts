import { Product } from "./product";
import { PurchaseOrderItemTax } from "./purchase-order-item-tax";
import { PurchaseOrderStatusEnum } from "./purchase-order-status";

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  purchaseOrderId?: string;
  unitPrice: number;
  quantity: number;
  taxValue: number;
  discount: number;
  product?: Product;
  discountPercentage: number;
  status?: PurchaseOrderStatusEnum;
  unitName?: string;
  purchaseOrderNumber?: string;
  poCreatedDate?: Date;
  supplierName?: string;
  purchaseOrderItemTaxes: PurchaseOrderItemTax[];
  productName?: string;
}
