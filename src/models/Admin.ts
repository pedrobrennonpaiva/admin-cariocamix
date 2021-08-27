import { Base } from "./base/Base";
import { Store } from "./Store";

export class Admin extends Base {

    name: string = '';

    username: string = '';

    birthday: Date | string = new Date();

    numberPhone: string = '';

    email: string = '';

    password: string | null = null;

    image: string = '';

    isActive: boolean = false;
    
    isRoot: boolean = false;

    storeId?: string | null = null;

    store?: Store | null = null;
}

export interface AdminAuthenticate extends Admin {

    token: string;

    tokenExpires: Date | string;
}