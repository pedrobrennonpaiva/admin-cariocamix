import { v4 } from "uuid";
import { Base } from "./base/Base";
import { Item } from "./Item";
import { Product } from "./Product";

export class ProductItem extends Base {

    productId: string = v4();

    product: Product | null = null;
    
    itemId: string = v4();

    item: Item | null = null;
    
    isDefault: boolean = false;
    
    price: number = 0;
}
