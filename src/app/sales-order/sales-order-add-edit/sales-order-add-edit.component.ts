import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '@core/domain-classes/customer';
import { CustomerResourceParameter } from '@core/domain-classes/customer-resource-parameter';
import { DeliveryStatusEnum } from '@core/domain-classes/delivery-status-enum';
import { Product } from '@core/domain-classes/product';
import { ProductResourceParameter } from '@core/domain-classes/product-resource-parameter';
import { SalesOrder } from '@core/domain-classes/sales-order';
import { SalesOrderItem } from '@core/domain-classes/sales-order-item';
import { SalesOrderItemTax } from '@core/domain-classes/sales-order-item-tax';
import { SalesOrderStatusEnum } from '@core/domain-classes/sales-order-status';
import { Tax } from '@core/domain-classes/tax';
import { Unit } from '@core/domain-classes/unit';
import { CommonService } from '@core/services/common.service';
import { TaxService } from '@core/services/tax.service';
import { TranslationService } from '@core/services/translation.service';
import { QuantitiesUnitPriceTaxPipe } from '@shared/pipes/quantities-unitprice-tax.pipe';
import { QuantitiesUnitPricePipe } from '@shared/pipes/quantities-unitprice.pipe';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { BaseComponent } from 'src/app/base.component';
import { CustomerService } from 'src/app/customer/customer.service';
import { ProductService } from 'src/app/product/product.service';
import { SalesOrderService } from '../sales-order.service';

@Component({
  selector: 'app-sales-order-add-edit',
  templateUrl: './sales-order-add-edit.component.html',
  styleUrls: ['./sales-order-add-edit.component.scss'],
  viewProviders: [QuantitiesUnitPricePipe, QuantitiesUnitPriceTaxPipe]
})
export class SalesOrderAddEditComponent extends BaseComponent {

  taxes$: Observable<Tax[]>;
  salesOrderForm: UntypedFormGroup;
  products: Product[] = [];
  customers: Customer[] = [];
  customerResource: CustomerResourceParameter;
  productResource: ProductResourceParameter;
  isLoading: boolean = false;
  isCustomerLoading: boolean = false;
  filterProductsMap: { [key: string]: Product[] } = {};
  unitsMap: { [key: string]: Unit[] } = {};
  taxsMap: { [key: string]: Tax[] } = {};
  totalBeforeDiscount: number = 0;
  totalAfterDiscount: number = 0;
  totalDiscount: number = 0;
  grandTotal: number = 0;
  totalTax: number = 0;
  timeoutclear: any;
  salesOrder: SalesOrder;
  isEdit: boolean = false;

  get salesOrderItemsArray(): UntypedFormArray {
    return <UntypedFormArray>this.salesOrderForm.get('salesOrderItems');
  }

  constructor(
    private fb: UntypedFormBuilder,
    private customerService: CustomerService,
    private toastrService: ToastrService,
    private salesOrderService: SalesOrderService,
    private router: Router,
    private taxService: TaxService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private quantitiesUnitPricePipe: QuantitiesUnitPricePipe,
    private quantitiesUnitPriceTaxPipe: QuantitiesUnitPriceTaxPipe,
    public translationService: TranslationService
  ) {
    super(translationService);
    this.getLangDir();
    this.customerResource = new CustomerResourceParameter();
    this.productResource = new ProductResourceParameter();
  }

  ngOnInit(): void {
    this.getSalesOrderById();
    this.createSalesOrder();
    this.customerNameChangeValue();
    this.getNewSalesOrderNumber();
    this.getTaxes();
  }

  onFilterValue(filterValue: any) {
    console.log(filterValue);
  }

  getTaxes() {
    this.taxes$ = this.taxService.entities$;
  }

  createSalesOrder() {
    this.route.data
      .pipe(
      )
      .subscribe((salesOrderData: { 'salesorder': SalesOrder }) => {
        this.salesOrder = salesOrderData.salesorder;
        if (this.salesOrder) {
          this.isEdit = true;
          this.salesOrderForm = this.fb.group({
            orderNumber: [this.salesOrder.orderNumber, [Validators.required]],
            filerCustomer: [''],
            deliveryDate: [this.salesOrder.deliveryDate, [Validators.required]],
            soCreatedDate: [this.salesOrder.soCreatedDate, [Validators.required]],
            deliveryStatus: [this.salesOrder.deliveryStatus],
            customerId: [this.salesOrder.customerId, [Validators.required]],
            note: [this.salesOrder.note],
            termAndCondition: [this.salesOrder.termAndCondition],
            salesOrderItems: this.fb.array([])
          });
          this.salesOrder.salesOrderItems.forEach(c => {
            this.salesOrderItemsArray.push(this.createSalesOrderItemPatch(this.salesOrderItemsArray.length, c));
          });
          this.getCustomers();
          this.getAllTotal();
        } else {
          this.isEdit = false;
          this.getCustomers();
          this.salesOrderForm = this.fb.group({
            orderNumber: ['', [Validators.required]],
            filerCustomer: [''],
            deliveryDate: [new Date(), [Validators.required]],
            soCreatedDate: [new Date(), [Validators.required]],
            deliveryStatus: [1],
            customerId: ['', [Validators.required]],
            note: [''],
            termAndCondition: [''],
            salesOrderItems: this.fb.array([])
          });
          this.salesOrderItemsArray.push(this.createSalesOrderItem(this.salesOrderItemsArray.length));
        }
      });
  }

  onAddAnotherProduct() {
    this.salesOrderItemsArray.push(this.createSalesOrderItem(this.salesOrderItemsArray.length));
  }

  createSalesOrderItemPatch(index: number, salesOrderItem: SalesOrderItem) {
    const taxs = salesOrderItem.salesOrderItemTaxes.map(c => c.taxId);
    const formGroup = this.fb.group({
      productId: [salesOrderItem.productId, [Validators.required]],
      filterProductValue: [''],
      unitPrice: [salesOrderItem.unitPrice, [Validators.required]],
      quantity: [salesOrderItem.quantity, [Validators.required]],
      taxValue: [taxs],
      unitId: [{ value: salesOrderItem.product.unitId, disabled: true }, [Validators.required]],
      discountPercentage: [salesOrderItem.discountPercentage]
    });
    this.unitsMap[index] = [... this.route.snapshot.data['units']];
    this.taxsMap[index] = [... this.route.snapshot.data['taxs']];
    this.filterProductsMap[index.toString()] = [salesOrderItem.product];
    return formGroup;
  }

  createSalesOrderItem(index: number) {
    const formGroup = this.fb.group({
      productId: ['', [Validators.required]],
      filterProductValue: [''],
      unitPrice: [0, [Validators.required,Validators.min(1)]],
      quantity: [1, [Validators.required,Validators.min(1)]],
      taxValue: [null],
      unitId: [{ value: null, disabled: true }],
      discountPercentage: [0,[Validators.min(0)]]
    });
    this.unitsMap[index] = [... this.route.snapshot.data['units']];
    this.taxsMap[index] = [... this.route.snapshot.data['taxs']];
    this.filterProductsMap[index.toString()] = [...this.route.snapshot.data['products']];
    this.getProductByNameValue(formGroup, index);
    return formGroup;
  }

  getProductByNameValue(formGroup: UntypedFormGroup, index: number) {
    if (this.salesOrder) {
      this.getProducts(index);
    }
    this.sub$.sink = formGroup.get('filterProductValue').valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(c => {
          this.productResource.name = c;
          return this.productService.getProducts(this.productResource);
        })
      ).subscribe((resp: HttpResponse<Product[]>) => {
        if (resp && resp.headers) {
          this.filterProductsMap[index.toString()] = [...resp.body];
        }
      }, (err) => {

      });

  }

  getAllTotal() {
    let salesOrderItems = this.salesOrderForm.get('salesOrderItems').value;
    this.totalBeforeDiscount = 0;
    this.grandTotal = 0;
    this.totalDiscount = 0;
    this.totalTax = 0;
    if (salesOrderItems && salesOrderItems.length > 0) {
      salesOrderItems.forEach(so => {
        if (so.unitPrice && so.quantity) {
          const totalBeforeDiscount = this.totalBeforeDiscount + parseFloat(this.quantitiesUnitPricePipe.transform(so.quantity, so.unitPrice));
          this.totalBeforeDiscount = parseFloat(totalBeforeDiscount.toFixed(2));
          const gradTotal = this.grandTotal + parseFloat(this.quantitiesUnitPricePipe.transform(so.quantity, so.unitPrice, so.discountPercentage, so.taxValue, this.taxsMap[0]));
          this.grandTotal = parseFloat(gradTotal.toFixed(2));
          const totalTax = this.totalTax + parseFloat(this.quantitiesUnitPriceTaxPipe.transform(so.quantity, so.unitPrice, so.discountPercentage, so.taxValue, this.taxsMap[0]));
          this.totalTax = parseFloat(totalTax.toFixed(2));
          const totalDiscount = this.totalDiscount + parseFloat(this.quantitiesUnitPriceTaxPipe.transform(so.quantity, so.unitPrice, so.discountPercentage));
          this.totalDiscount = parseFloat(totalDiscount.toFixed(2));
        }
      })
    }
  }

  onUnitPriceChange() {
    this.getAllTotal();
  }
  onQuantityChange() {
    this.getAllTotal();
  }
  onDiscountChange() {
    this.getAllTotal();
  }
  onTaxSelectionChange() {
    this.getAllTotal();
  }

  onRemoveSalesOrderItem(index: number) {
    this.salesOrderItemsArray.removeAt(index);
    this.salesOrderItemsArray.controls.forEach((c: UntypedFormGroup, index: number)=>{
      const productId= c.get('productId').value;
      if(productId){
    this.salesOrder.salesOrderItems.map(pi => {
          if(pi.product.id=== productId){
          if(this.products.find(c=> c.id=== productId)){
            this.getProducts(index);
          } else {
            this.getProducts(index, productId);
          }
          }
      });
    } else {
      this.getProducts(index);
    }
    });

    this.getAllTotal();
  }

  getProducts(index: number, productId?: string) {
    if (this.products.length === 0 || productId) {
      this.productResource.name = '';
      this.productResource.id= productId? productId:'';
      this.productService.getProducts(this.productResource)
        .subscribe((resp: HttpResponse<Product[]>) => {
          this.products = [...resp.body];
          this.filterProductsMap[index.toString()] = [...resp.body];
        }, (err) => {
        });
    } else {
      this.filterProductsMap[index.toString()] = [...this.products];
    }

  }

  onProductSelectionChange(value: any, index: number) {
    this.salesOrderItemsArray.controls[index].patchValue({
      unitPrice:'',
      filterProductValue: ''
    });
    const product = this.filterProductsMap[index].find((c: Product) => c.id === value.value);
    if (product) {
      this.salesOrderItemsArray.controls[index].patchValue({
        unitId: product.unitId,
        unitPrice:product.salesPrice,
      });
    }
  }

  getNewSalesOrderNumber() {
    this.salesOrderService.getNewSalesOrderNumber().subscribe(salesOrder => {
      if (!this.salesOrder) {
        this.salesOrderForm.patchValue({
          orderNumber: salesOrder.orderNumber
        });
      }
    });
  }


  customerNameChangeValue() {
    this.sub$.sink = this.salesOrderForm.get('filerCustomer').valueChanges
      .pipe(
        tap(c => this.isCustomerLoading = true),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(c => {
          this.customerResource.customerName = c;
          this.customerResource.id = null;
          return this.customerService.getCustomers(this.customerResource);
        })
      ).subscribe((resp: HttpResponse<Customer[]>) => {
        this.isCustomerLoading = false;
        if (resp && resp.headers) {
          this.customers = [...resp.body];
        }
      }, (err) => {
        this.isCustomerLoading = false;
      });
  }

  getCustomers() {

    if (this.salesOrder) {
      this.customerResource.id = this.salesOrder.customerId;
    } else {
      this.customerResource.customerName = '';
      this.customerResource.id = null;
    }
    this.customerService.getCustomers(this.customerResource)
      .subscribe(resp => {
        if (resp && resp.headers) {
          this.customers = [...resp.body];
        }
      });
  }

  onSalesOrderSubmit() {
    if (!this.salesOrderForm.valid) {
      this.salesOrderForm.markAllAsTouched();
    } else {
      if (this.salesOrder && this.salesOrder.salesOrderStatus === SalesOrderStatusEnum.Return) {
        this.toastrService.error(this.translationService.getValue('RETURN_SALES_ORDER_CANT_BE_EDIT'));
        return;
      }
      const salesOrder = this.buildSalesOrder();
      if (salesOrder.id) {
        this.salesOrderService.updateSalesOrder(salesOrder)
          .subscribe((c: SalesOrder) => {
            this.toastrService.success(this.translationService.getValue("SALES_ORDER_UPDATED_SUCCESSFULLY"));
            this.router.navigate(['/sales-order/list']);
          })
      } else {
        this.salesOrderService.addSalesOrder(salesOrder)
          .subscribe((c: SalesOrder) => {
            this.toastrService.success(this.translationService.getValue("SALES_ORDER_ADDED_SUCCESSFULLY"));
            this.router.navigate(['/sales-order/list']);
          });
      }

    }
  }

  buildSalesOrder() {
    const salesOrder: SalesOrder = {
      id: this.salesOrder ? this.salesOrder.id : '',
      orderNumber: this.salesOrderForm.get('orderNumber').value,
      deliveryDate: this.salesOrderForm.get('deliveryDate').value,
      deliveryStatus: DeliveryStatusEnum.UnDelivery,
      isSalesOrderRequest: false,
      soCreatedDate: this.salesOrderForm.get('soCreatedDate').value,
      salesOrderStatus: SalesOrderStatusEnum.Not_Return,
      customerId: this.salesOrderForm.get('customerId').value,
      totalAmount: this.grandTotal,
      totalDiscount: this.totalDiscount,
      totalTax: this.totalTax,
      note: this.salesOrderForm.get('note').value,
      termAndCondition: this.salesOrderForm.get('termAndCondition').value,
      salesOrderItems: []
    };

    const salesOrderItems = this.salesOrderForm.get('salesOrderItems').value;
    if (salesOrderItems && salesOrderItems.length > 0) {
      salesOrderItems.forEach(so => {
        salesOrder.salesOrderItems.push(
          {
            discount: parseFloat(this.quantitiesUnitPriceTaxPipe.transform(so.quantity, so.unitPrice, so.discountPercentage)),
            discountPercentage: so.discountPercentage,
            productId: so.productId,
            quantity: so.quantity,
            taxValue: parseFloat(this.quantitiesUnitPriceTaxPipe.transform(so.quantity, so.unitPrice, so.discountPercentage, so.taxValue, this.taxsMap[0])),
            unitPrice: parseFloat(so.unitPrice),
            salesOrderItemTaxes: so.taxValue ? [
              ...so.taxValue.map(element => {
                const salesOrderItemTaxes: SalesOrderItemTax = {
                  taxId: element
                };
                return salesOrderItemTaxes;
              })
            ] : []
          }
        )
      })
    }
    return salesOrder;
  }
  onSalesOrderList() {
    this.router.navigate(['/sales-order/list']);
  }

  getSalesOrderById() {
    this.salesOrder = this.route.snapshot.data['salesorder'];
    if (this.salesOrder) {

    }
  }

}


