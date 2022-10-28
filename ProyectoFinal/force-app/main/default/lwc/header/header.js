import { LightningElement, api } from 'lwc';

export default class Header extends LightningElement {

    @api
    index;
    @api
    hr;
    @api
    iconsRole;
    @api
    role;

    get title(){
        return this.role+'- Horas a cubrir : ' + this.hr[this.index];
    }

    get icon(){
        return this.iconsRole[this.index];
    }
    


}