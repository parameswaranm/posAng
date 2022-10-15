import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Unit } from '@core/domain-classes/unit';
import { UnitService } from '@core/services/unit.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderUnitResolver implements Resolve<Unit[]> {
  /**
   *
   */
  constructor(private unitService: UnitService) {

  }
  resolve(route: ActivatedRouteSnapshot): Observable<Unit[]> | Promise<Unit[]> | Unit[] {
    return  this.unitService.getAll();
  }
}
