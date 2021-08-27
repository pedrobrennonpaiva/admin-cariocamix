import { v4 } from "uuid";
import { Base } from "./base/Base";
import { Store } from "./Store";

export class DeliveryTax extends Base {

    storeId: string = v4();

    store: Store | null = null;
    
    radius: number = 0;
    
    price: number = 0;
}
