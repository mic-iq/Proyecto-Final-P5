import { LightningElement, api, wire } from 'lwc';
import getResourcesWrapper from '@salesforce/apex/ResourceService.getResourcesWrapper';

//Columnas a mostrar en la tabla
const columns = [
    { label: 'Name', fieldName: 'Name' },
    {
        label: 'Rate p/hour', fieldName: 'RatePerHour__c'
    },
    {
    label: 'Start Date',
    fieldName: 'dateApiName',
    type: 'date',
    editable: true,
    typeAttributes: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }
},{
    label: 'End Date',
    fieldName: 'dateApiName',
    type: 'date',
    editable: true,
    typeAttributes: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }
},
];

export default class ResourceAllocation extends LightningElement {
    @api recordId;
    columns = columns;
    recursos;

    horas;
  

    get hours(){
        return 'Consultant - Hours to cover: '+ this.horas +' hours';
    }

                                                                           
    @wire(getResourcesWrapper,{projectId: '$recordId', Role:'Consultant'})
       resource(Result){
        const { data, error } = Result;
        if (data) {
            this.recursos = data.resources;
            this.horas = data.project.ProjectLineItems__r[0].QuantityHours__c;
            console.log("DATA: "+this.recursos);
        } else if (error) {
            this.error = error;
        }
    }

   
}