import { AdminAuthenticate } from "../models/Admin";


export class Session {

    static TOKEN_KEY = "Token";
    static ADMIN = "ADN";

    static isAuthenticated = () => {

        if(localStorage.getItem(Session.TOKEN_KEY) !== null)
        {
            var gItem = localStorage.getItem(Session.ADMIN) as string;
            var item = JSON.parse(gItem) as AdminAuthenticate;

            var data = new Date();
            var date = new Date(data.valueOf() - (data.getTimezoneOffset() * 60000)).toISOString();
            if(item.tokenExpires < date)
            {
                return false;
            }

            return true;
        }
        else {
            return false;
        }
    }

    static getToken = () => localStorage.getItem(Session.TOKEN_KEY);

    static login = (token: string, user: AdminAuthenticate) => {
        localStorage.setItem(Session.TOKEN_KEY, token);
        localStorage.setItem(Session.ADMIN, JSON.stringify(user));
    }
    
    static logout = () => {
        localStorage.removeItem(Session.TOKEN_KEY);
        localStorage.removeItem(Session.ADMIN);
    }

    static getAdmin = () : AdminAuthenticate | undefined => {
        var gItem = localStorage.getItem(Session.ADMIN) as string;

        try {
            return JSON.parse(gItem);
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
    }

    static getItem = <T>(item: string) : T | undefined => {
        var gItem = localStorage.getItem(item) as string;

        try {
            return JSON.parse(gItem);
        }
        catch (error) {
            console.log(error);
            return undefined;
        }
    }

    static setItem = <T>(name: string, item: T) => {
        localStorage.setItem(name, JSON.stringify(item));
    }

    static removeItem = (item: string) => {
        localStorage.removeItem(item);
    }
}
