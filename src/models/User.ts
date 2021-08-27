import { Base } from "./base/Base";

export class User extends Base {

    name: string = '';

    username: string = '';

    birthday: Date | string = new Date();
    
    cpf: string = '';
    
    email: string = '';
    
    password: string | null = null;
    
    numberPhone: string = '';

    points: number = 0;

    image: string = '';
}
