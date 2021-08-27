import { Base } from "./base/Base";
import { User } from "./User";
import { Coupon } from "./Coupon";
import { v4 } from "uuid";

export class UserCoupon extends Base {

    userId: string = v4();

    user: User | null = null;
    
    couponId: string = v4();
    
    coupon: Coupon | null = null;
}
