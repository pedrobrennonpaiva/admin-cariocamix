
export class Utils {

    static removeDiacritics = (value: string) => {
        return value
            .replace(" ", "")
            .replace("+", "")
            .replace(":", "")
            .replace(".", "")
            .replace(".", "")
            .replace("-", "")
            .replace("/", "")
            .replace("(", "")
            .replace(")", "");
    }

    static currencyValue = (value: Number) => {
        return value?.toFixed(2).replace(',', '.').replace('.', ',');
    }

    static convertToCurrencyDb = (value: string) => {
        return value.replace('.', ',').replace(',', '.');
    }

    static formatDate = (date?: string | undefined) => {

        var d = date != null ? new Date(date!) : new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + (d.getDate() + 1),
            year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }

    static newDate = (date?: string | undefined) => {
        var d = date != null ? new Date(date!) : new Date();
        return new Date(d.getFullYear(), d.getMonth(), !date ? d.getDate() : d.getDate() + 1);
    }

    static formatDateSplitView = (string: string) => {   
        var dateSplit = string.split('-');
        var date = `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`;
        return date;
    }

    // static formatDateView = (string: string) => {   
    //     var options = { year: 'numeric', month: 'long', day: 'numeric' };
    // }

    static dateMask = (date: string) => {
        var d = date != null ? new Date(date!) : new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + (d.getDate() + 1),
            year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [day, month, year].join('/');
    }

    static onlyLetterMask = (value: string) => {
        return value
            .replace(/[^A-Za-z]/ig, '');
    }

    static hourMinuteMask = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d{2}).*/, '$1:$2');
    }

    static numberPhoneMask = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^\(?([0-9]{2})\)?[-. ]?([0-9]{5})[-. ]?([0-9]{4})$/, "($1) $2-$3");
    }

    //not working
    static cepMask = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/g,"($1) $2")
            .replace(/(\d)(\d{4})$/,"$1-$2");
    }

    static cpfMask = (value: string) => {
        return value
          .replace(/\D/g, '') // substitui qualquer caracter que nao seja numero por nada
          .replace(/(\d{3})(\d)/, '$1.$2') // captura 2 grupos de numero o primeiro de 3 e o segundo de 1, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de numero
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})/, '$1-$2')
          .replace(/(-\d{2})\d+?$/, '$1') // captura 2 numeros seguidos de um traço e não deixa ser digitado mais nada
    }

    static groupBy = <T>(xs: T[], key: string) => {
        return xs.reduce(function(rv: any, x: any) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    static alertLocalStorage = (message: string, isSuccess: boolean) => {
        localStorage.setItem('alert-message', message);
        localStorage.setItem('alert-type', isSuccess ? 'alert-success' : 'alert-danger');
    }

    static convertDayWeek = (dayWeek: number) : string => {

        return Utils.daysOfWeek[dayWeek];
    }
    
    static daysOfWeek = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    static validImageExtensions = ["image/jpg", "image/jpeg", "image/png"];  
}