import { AddressStore } from "./AddressStore";
import { Base } from "./base/Base";
import { StoreDayHour } from "./StoreDayHour";

export class Store extends Base {

    name: string = '';

    storeDayHours: StoreDayHour[] | null = null;

    addressStore: AddressStore | null = null;
}
