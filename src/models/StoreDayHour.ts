import { Base } from "./base/Base";
import { Store } from "./Store";
import { SelectModel } from "./utils/SelectModel";

export class StoreDayHour extends Base {

    storeId: string = '';

    store: Store | null = null;

    dayOfWeek: number = 0;

    dayOfWeekString: string = '';
    
    hourOpen: string = '';
    
    hourClose: string = '';
    
    selectDayOfWeek: SelectModel | null | undefined = null;
}
