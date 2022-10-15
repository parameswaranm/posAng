import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { Unit } from '@core/domain-classes/unit';
import { TranslationService } from '@core/services/translation.service';
import { BaseComponent } from 'src/app/base.component';
import { ManageUnitComponent } from '../manage-unit/manage-unit.component';

@Component({
  selector: 'app-unit-list-presentation',
  templateUrl: './unit-list-presentation.component.html',
  styleUrls: ['./unit-list-presentation.component.scss']
})
export class UnitListPresentationComponent extends BaseComponent implements OnInit {

  @Input() units: Unit[];
  @Input() loading: boolean = false;
  @Output() deleteUnitHandler: EventEmitter<string> = new EventEmitter<string>();
  displayedColumns: string[] = ['action', 'name'];
  constructor(
    private dialog: MatDialog,
    private commonDialogService: CommonDialogService,
    public translationService: TranslationService
  ) {
    super(translationService);
    this.getLangDir();
  }

  ngOnInit(): void {
  }

  deleteUnit(unit: Unit): void {
    const areU = this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE');
    this.sub$.sink = this.commonDialogService.deleteConformationDialog(`${areU} :: ${unit.name}`)
      .subscribe(isTrue => {
        if (isTrue) {
          this.deleteUnitHandler.emit(unit.id);
        }
      });
  }

  manageUnit(unit: Unit): void {
    this.dialog.open(ManageUnitComponent, {
      width: '350px',
      direction:this.langDir,
      data: Object.assign({}, unit)
    });
  }

}
