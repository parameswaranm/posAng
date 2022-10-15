import { HttpResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inventory } from '@core/domain-classes/inventory';
import { Product } from '@core/domain-classes/product';
import { ProductResourceParameter } from '@core/domain-classes/product-resource-parameter';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BaseComponent } from 'src/app/base.component';
import { ProductService } from 'src/app/product/product.service';
import { InventoryService } from '../inventory.service';

@Component({
  selector: 'app-manage-inventory',
  templateUrl: './manage-inventory.component.html',
  styleUrls: ['./manage-inventory.component.scss']
})
export class ManageInventoryComponent extends BaseComponent implements OnInit {
  inventoryForm: UntypedFormGroup;
  products: Product[] = [];
  productResource: ProductResourceParameter;

  constructor(
    public dialogRef: MatDialogRef<ManageInventoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Inventory,
    private inventoryService: InventoryService,
    private toastrService: ToastrService,
    public translationService:TranslationService,
    private fb: UntypedFormBuilder,
    private productService: ProductService) {
    super(translationService);
    this.getLangDir();
    this.productResource = new ProductResourceParameter();
  }

  ngOnInit(): void {
    this.getProducts();
    this.createForm();
    this.productNameChangeValue();
    if (this.data.productId) {
      this.inventoryForm.get('filerProduct').setValue(this.data.productName);
      this.inventoryForm.get('productId').setValue(this.data.productId);
    }
  }

  createForm() {
    this.inventoryForm = this.fb.group({
      id: [''],
      stock: ['', [Validators.required, Validators.min(1)]],
      filerProduct: [],
      productName: [''],
      productId: ['', [Validators.required]],
      pricePerUnit: ['', [Validators.required]]
    });
  }

  getProducts() {
    this.productResource.name = '';
    this.productService.getProducts(this.productResource)
      .subscribe(resp => {
        if (resp && resp.headers) {
          this.products = [...resp.body];
        }
      });
  }

  productNameChangeValue() {
    this.sub$.sink = this.inventoryForm.get('filerProduct').valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(c => {
          this.productResource.name = c;
          return this.productService.getProducts(this.productResource);
        })
      ).subscribe((resp: HttpResponse<Product[]>) => {
        if (resp && resp.headers) {
          this.products = [...resp.body];
          if (this.data.id) {
            this.inventoryForm.get('productId').setValue(this.data.productId);
          }
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  addInventory(): void {
    if (!this.inventoryForm.valid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }
    const inventory: Inventory = this.inventoryForm.value;
    this.inventoryService.addInventory(inventory).subscribe(() => {
      this.toastrService.success(this.translationService.getValue('INVENTORY_SAVED_SUCCESSFULLY'));
      this.dialogRef.close(true);
    });
  }
}
