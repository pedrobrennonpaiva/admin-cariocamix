import { v4 } from "uuid";
import { Base } from "./base/Base";

export class OrderProduct extends Base {

    orderId: string = v4();
    
    productId: string = v4();
    
    obs: string = '';
}
