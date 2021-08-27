
export class SelectModel {

    constructor(value?: string, label?: string)
    {
        this.value = value || '';
        this.label = label || '';
    }
    
    value: string = '';
    label: string = '';
}