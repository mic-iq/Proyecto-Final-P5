import { LightningElement, api } from 'lwc';


const columns = [
    { label: 'Name', fieldName: 'Name' },
    {
        label: 'Rate p/hour', fieldName: 'RatePerHour__c'
    },
    {
    label: 'Start Date',
    fieldName: 'dateApiNameSD',
    type: 'date-local',
    editable: true,
    typeAttributes: {
         year: "numeric",
         month: "2-digit",
         day: "2-digit"
     }
},{
    label: 'End Date',
    fieldName: 'dateApiNameED',
    type: 'date-local',
    editable: true,
    typeAttributes: {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }
},
];


export default class Auxiliar extends LightningElement {
   @api
   datos;
   draftValues=[];
   columns=columns;

}