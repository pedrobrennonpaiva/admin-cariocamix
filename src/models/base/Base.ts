import { v4 as uuid } from 'uuid';

export abstract class Base {

    id: string = uuid();

    registerDate: Date | string = new Date();
}