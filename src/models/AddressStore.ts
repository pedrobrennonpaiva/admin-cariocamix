import { v4 } from "uuid";
import { Base } from "./base/Base";
import { Store } from "./Store";

export class AddressStore extends Base {

    storeId: string = v4();

    store: Store | null = null;

    cep: string = '';
    
    addressText: string = '';
    
    complement: string = '';
    
    neighborhood: string = '';
    
    city: string = '';

    state: string = '';

    country: string = '';
}
