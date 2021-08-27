import { v4 } from "uuid";
import { Base } from "./base/Base";

export class CategoryProduct extends Base {

    constructor(categoryId: string, productId: string) {
        super();
        this.categoryId = categoryId;
        this.productId = productId;
    }
    categoryId: string = v4();

    productId: string = v4();
}
