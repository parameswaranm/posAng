import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Unit } from '@core/domain-classes/unit';
import { TranslationService } from '@core/services/translation.service';
import { UnitService } from '@core/services/unit.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';

@Component({
  selector: 'app-manage-unit',
  templateUrl: './manage-unit.component.html',
  styleUrls: ['./manage-unit.component.scss']
})
export class ManageUnitComponent extends BaseComponent implements OnInit {
  isEdit: boolean = false;
  unitForm: UntypedFormGroup;
  constructor(
    public dialogRef: MatDialogRef<ManageUnitComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Unit,
    private unitService: UnitService,
    private toastrService: ToastrService,
    private fb: UntypedFormBuilder,
    public translationService: TranslationService) {
    super(translationService);
    
  }
  ngOnInit(): void {
    this.createForm();
    if (this.data.id) {
      this.unitForm.patchValue(this.data);
      this.isEdit = true;
    }
  }

  createForm() {
    this.unitForm = this.fb.group({
      id: [''],
      name: ['', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  saveUnit(): void {
    if (!this.unitForm.valid) {
      this.unitForm.markAllAsTouched();
      return;
    }
    const inquiryStatus: Unit = this.unitForm.value;

    if (this.data.id) {
      this.unitService.update(inquiryStatus).subscribe(() => {
        this.toastrService.success(this.translationService.getValue('UNIT_UPDATED_SUCCESSFULLY'));
        this.dialogRef.close();
      });
    } else {
      this.unitService.add(inquiryStatus).subscribe(() => {
        this.toastrService.success(this.translationService.getValue('UNIT_ADDED_SUCCESSFULLY'));
        this.dialogRef.close();
      });
    }
  }

}
