import { v4 } from "uuid";
import { Base } from "./base/Base";
import { User } from "./User";

export class Address extends Base {

    userId: string = v4();

    user: User | null = null;

    cep: string = '';
    
    addressText: string = '';
    
    complement: string = '';
    
    neighborhood: string = '';
    
    city: string = '';

    state: string = '';

    country: string = '';
}
