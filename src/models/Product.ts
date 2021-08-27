import { Base } from "./base/Base";
import { CategoryProduct } from "./CategoryProduct";
import { ProductItem } from "./ProductItem";

export class Product extends Base {

    title: string = '';
    
    description: string = '';
    
    image: string = '';
    
    price: number = 0;

    points: number = 0;

    isOneItem: boolean = false;

    categoryProductsId: string[] | null = null;
    
    categoryProducts: CategoryProduct[] | null = null;
    
    productItemsId: string[] | null = null;

    productItems: ProductItem[] | null = null;
}
