import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TruncatePipe } from './truncate.pipe';
import { DateAgoPipe } from './date-ago.pipe';
import { CustomCurrencyPipe } from './custome-currency.pipe';
import { PaymentMethodPipe } from '@shared/pipes/paymentMethod.pipe';
import { UTCToLocalTime } from './utc-to-localtime.pipe';



@NgModule({
    declarations: [
        TruncatePipe,
        DateAgoPipe,
        CustomCurrencyPipe,
        PaymentMethodPipe,
        UTCToLocalTime
    ],
    imports: [
        CommonModule
    ],
    exports: [
        TruncatePipe,
        DateAgoPipe,
        CustomCurrencyPipe,
        PaymentMethodPipe,
        UTCToLocalTime
    ],
    providers: [CurrencyPipe]
})
export class PipesModule { }
