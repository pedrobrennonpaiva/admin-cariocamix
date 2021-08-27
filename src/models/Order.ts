import { v4 } from "uuid";
import { Base } from "./base/Base";

export class Order extends Base {

    userId: string = v4();
    
    couponId: string = '';
    
    total: number = 0;

    paymentTypeId: string = v4();

    paymentStatusId: string = '';
    
    deliveryStatusId: string = '';
    
    deliveryTaxId: string = v4();
}
