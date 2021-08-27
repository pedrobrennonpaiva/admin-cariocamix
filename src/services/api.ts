import axios from "axios";
import { Admin } from "../models/Admin";
import { AuthenticateModel } from "../models/Authenticate";
import { Base } from "../models/base/Base";
import { User } from "../models/User";
import { Session } from "./session";

const ADDRESS_URL = 'address';
const ADDRESS_STORE_URL = 'addressStore';
const CATEGORY_URL = 'category';
const CATEGORY_PRODUCT_URL = 'categoryProduct';
const COUPON_URL = 'coupon';
const DELIVERY_STATUS_URL = 'deliveryStatus';
const DELIVERY_TAX_URL = 'deliveryTax';
const ITEM_URL = 'item';
const IMAGE_URL = 'image';
const ORDER_URL = 'order';
const ORDER_PRODUCT_URL = 'orderProduct';
const ORDER_PRODUCT_ITEM_URL = 'orderProductItem';
const PAYMENT_STATUS_URL = 'paymentStatus';
const PAYMENT_TYPE_URL = 'paymentType';
const PRODUCT_URL = 'product';
const PRODUCT_ITEM_URL = 'productItem';
const STORE_URL = 'store';
const STOREDAYHOUR_URL = 'storeDayHour';
const USER_COUPON_URL = 'userCoupon';

class Api {

    // BASE_URL = "https://api-cariocamix.herokuapp.com";
    BASE_URL = "http://localhost:5000";

    accessToken = Session.getToken();

    //#region User

    getUser = async () => {

        return await axios.get(`${this.BASE_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res.data;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    getUserById = async (id: string) => {

        return await axios.get(`${this.BASE_URL}/user/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res.data;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    insertUser = async (model: User) => {

        return await axios.post(`${this.BASE_URL}/user`, model)
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    authenticateUser = async (model: AuthenticateModel) => {

        return await axios.post(`${this.BASE_URL}/user/authenticate`, model)
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    updateUser = async (model: User) => {

        return await axios.put(`${this.BASE_URL}/user/${model.id}`, model, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    deleteUser = async (id: string) => {

        return await axios.delete(`${this.BASE_URL}/user/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    resetPasswordUser = async (id: string, newPassword: string) => {

        return await axios.post(`${this.BASE_URL}/user/resetPassword/${id}/${newPassword}`, {}, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    forgotPasswordUser = async (email: string) => {

        return await axios.post(`${this.BASE_URL}/user/forgotPassword/${email}`, {}, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    //#endregion

    //#region Admin

    getAdmin = async () => {

        return await axios.get(`${this.BASE_URL}/admin`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res.data;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    getAdminById = async (id: string) => {

        return await axios.get(`${this.BASE_URL}/admin/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res.data;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    insertAdmin = async (model: Admin) => {

        return await axios.post(`${this.BASE_URL}/admin`, model)
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    authenticateAdmin = async (model: AuthenticateModel) => {

        return await axios.post(`${this.BASE_URL}/admin/authenticate`, model)
            .then((res) => {
                return res;
            })
            .catch(async (error) => {
                return Promise.reject(error);
            });
    }

    updateAdmin = async (model: Admin) => {

        return await axios.put(`${this.BASE_URL}/admin/${model.id}`, model, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    deleteAdmin = async (id: string) => {

        return await axios.delete(`${this.BASE_URL}/admin/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    resetPasswordAdmin = async (id: string, newPassword: string) => {

        return await axios.post(`${this.BASE_URL}/admin/resetPassword/${id}/${newPassword}`, {}, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    //#endregion

    //#region Generic

    get = async (url: string) => {

        return await axios.get(`${this.BASE_URL}/${url}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res.data;
            })
            .catch((error) => {
                return Promise.reject(error.response);
            });
    }

    getById = async (url: string, id: string) => {

        return await axios.get(`${this.BASE_URL}/${url}/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res.data;
            })
            .catch((error) => {
                return Promise.reject(error.response);
            });
    }

    insert = async <T> (url: string, model: T) => {

        return await axios.post(`${this.BASE_URL}/${url}`, model, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error.response);
            });
    }

    update = async <T extends Base> (url: string, model: T) => {

        return await axios.put(`${this.BASE_URL}/${url}/${model.id}`, model, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error.response);
            });
    }

    delete = async (url: string, id: string) => {

        return await axios.delete(`${this.BASE_URL}/${url}/${id}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error.response);
            });
    }

    //#endregion

    //#region Additionals

    insertImage = async (url: string, file: File | undefined) => {

        var formData = new FormData();
        formData.append('file', file!);

        return await axios.post(`${this.BASE_URL}/${url}`, formData, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        })
            .then((res) => {
                return res;
            })
            .catch((error) => {
                return Promise.reject(error.response);
            });
    }

    //#endregion

    //#region External

    cepSearch = async (cep: string) => {

        return await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
            .then((res) => {
                return res.data;
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    }

    //#endregion
}

export {
    ADDRESS_URL,
    ADDRESS_STORE_URL,
    CATEGORY_URL,
    CATEGORY_PRODUCT_URL,
    COUPON_URL,
    DELIVERY_STATUS_URL,
    DELIVERY_TAX_URL,
    ITEM_URL,
    IMAGE_URL,
    ORDER_URL,
    ORDER_PRODUCT_URL,
    ORDER_PRODUCT_ITEM_URL,
    PAYMENT_STATUS_URL,
    PAYMENT_TYPE_URL,
    PRODUCT_URL,
    PRODUCT_ITEM_URL,
    STORE_URL,
    USER_COUPON_URL,
    STOREDAYHOUR_URL
};

export default Api;