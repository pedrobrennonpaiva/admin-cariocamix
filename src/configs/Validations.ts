import { SelectModel } from "../models/utils/SelectModel";

export class Validations {

    static validateRequiredField = (field: string | number, nameField: string) => {

        if(!field || field === undefined || field == null) {
            return `O campo ${nameField} deve ser preenchido!\n`;
        }
        
        return '';
    }

    static validateNumberMoreThanZero = (field: number, nameField: string) => {

        if(!field || field === undefined || field == null || field <= 0) {
            return `O campo ${nameField} deve ser preenchido e maior que 0!\n`;
        }
        
        return '';
    }

    static validateUsername = (username: string) => {

        var error = '';

        if(!username || username === undefined || username == null) {
            error += 'O e-mail/username deve ser preenchido!\n';
        }

        return error;
    }

    static validatePassword = (password: string) => {

        var error = '';

        if(!password || password === undefined || password == null) {
            error += 'A senha deve ser preenchido!\n';
        }

        if(password?.length < 8) {
            error += 'A senha deve ter mais de 8 caracteres!\n';
        }

        return error;
    }

    static validateRequiredSelect = (select: SelectModel | null | undefined, nameField: string) => {

        if(!select || select === undefined || select == null 
            || select.value === '' || select.value === undefined) {
            return `O campo ${nameField} deve ser preenchido!\n`;
        }
        
        return '';
    }

    static validateFile = (file: File | undefined, nameField: string) => {

        if(!file || file === undefined || file == null)
        {
            return `O campo ${nameField} deve ser preenchido!\n`;
        }

        return '';
    }
}
