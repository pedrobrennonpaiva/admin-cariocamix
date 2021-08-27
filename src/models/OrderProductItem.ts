import { v4 } from "uuid";
import { Base } from "./base/Base";

export class OrderProductItem extends Base {

    orderProductId: string = v4();
    
    productItemId: string = v4();
}
