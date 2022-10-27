import { LightningElement, api, wire } from 'lwc';
import getResourcesWrapper from '@salesforce/apex/ResourceService.getResourcesWrapper';
import registerResource from '@salesforce/apex/ResourceService.registerResource';
//Importado ToastEvent
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

//Columnas a mostrar en la tabla
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

export default class ResourceAllocation extends LightningElement {
    @api recordId;
    columns = columns;
    recursos;
    recursosDeveloper;
    recursosArchitect;
    horas;
    hoursDev;
    hoursArch;
    draftValues=[];
    //Agrego fechas del proyecto para luego comparar
    ProjectStartDate;
    ProjectEndDate;
    errors;
    _wireResult;

    @api
    async refresh() {
          await refreshApex(this._wireResult);
      }

    get hours(){
        return 'Consultant - Hours to cover: '+ this.horas +' hours';
    }

    get hoursdev(){
        return 'Developer - Hours to cover: '+ this.hoursDev +' hours';
    }

    get hoursarch(){
        return 'Architect - Hours to cover: '+ this.hoursArch +' hours';
    }
                                                                           
    @wire(getResourcesWrapper,{projectId: '$recordId', Role:'Consultant'})
       resource(Result){
        const { data, error } = Result;
        this._wireResult=Result;
        if (data) {
            this.recursos = data.resources;
            this.horas = data.project.ProjectLineItems__r[0].QuantityHours__c;
            this.ProjectStartDate = data.project.Start_Date__c;
            this.ProjectEndDate = data.project.End_Date__c;
            //console.log("DATA: "+JSON.stringify(data));
            //console.log(this.ProjectStartDate +" "+ this.ProjectEndDate )
        } else if (error) {
            this.error = error;
        }
    }

     @wire(getResourcesWrapper,{projectId: '$recordId', Role:'Developer'})
       developer(ResultDev){
        const { data, error } = ResultDev;
        if (data) {
            this.recursosDeveloper = data.resources;
            this.hoursDev = data.project.ProjectLineItems__r[0].QuantityHours__c;
        } else if (error) {
            this.error = error;
        }
    }

    @wire(getResourcesWrapper,{projectId: '$recordId', Role:'Architect'})
       architect(ResultArch){
        const { data, error } = ResultArch;
        if (data) {
            this.recursosArchitect = data.resources;
            this.hoursArch = data.project.ProjectLineItems__r[0].QuantityHours__c;
        } else if (error) {
            this.error = error;
        }
    }

    handleSelectedRows(event){

        const rowsSelected=event.detail.selectedRows;
        const draftValues=event.target.draftValues;
       // console.log(draftValues);
        let eventAuxiliar=[];
        let mapa={};
        for(let i=0; i< rowsSelected.length; i++){
            //let array=draftValues.filter(elemento=> elemento.id=rowsSelected[i].id)
        //console.log(JSON.stringify(array))
            for(let j =0; j<draftValues.length;j++){
                if(draftValues[j].dateApiNameSD != null && draftValues[j].dateApiNameED != null ){
                    // agregado el chequeo de fechas ciertas
                        if(draftValues[j].dateApiNameSD < this.ProjectStartDate || draftValues[j].dateApiNameED > this.ProjectEndDate){
                            console.log(`no se puede procesar la solicitud para ${rowsSelected[i].Name} la fecha de inicio y fin deben estar dentro del rango del proyecto`)

                                this.errors = {
                                     rows: {
                                         b: {
                                             title: 'We found some errors!!.',
                                             messages: [
                                                `no se puede procesar la solicitud para ${rowsSelected[i].Name},
                                                 la fecha de inicio y fin deben estar dentro del rango del proyecto`,
                                                 ],
                                             fieldNames: ['dateApiNameSD', 'dateApiNameED']
                                         }
                                     },                                    
                                    table: {
                                        title: 'Your entry cannot be savedNo. Fix the errors and try again.',
                                        messages: [
                                            `no se puede procesar la solicitud para ${rowsSelected[i].Name},
                                                 la fecha de inicio y fin deben estar dentro del rango del proyecto`
                                        ]
                                    }
                                };
                            
                                    
                                
                              
                        //Agregado notificacion
                        } else if(draftValues[j].dateApiNameSD>draftValues[j].dateApiNameED){
                            console.log(`no se puede procesar la solicitud para ${rowsSelected[i].Name} La fecha de inicio nunca puede ser mayor a la de fin`);
                        } else {
                                if(draftValues[j].Id==rowsSelected[i].Id){
                                    mapa={};
                                    mapa=draftValues[j];
                                    mapa["Role"]=rowsSelected[i].Role__c;
                                    eventAuxiliar.push(mapa);
                                    //eventAuxiliar.push(draftValues[j])
                    }
                }

                }
            }

          //console.log(rowsSelected[i].Name + rowsSelected[i].Id + " " + JSON.stringify(draftValues));
        }

        console.log(eventAuxiliar, this.recordId);
        if(eventAuxiliar.length>0){
            registerResource({ProjectId: this.recordId, selected:eventAuxiliar})
            .then(resultado => {if(resultado==true){
                return this.refresh()      
            }
        })
            .catch(error=> console.log(JSON.stringify(error) + " Este es mi error"))
        } 

        
    }
}
// [{"dateApiNameSD":"2022-11-01","dateApiNameED":"2022-11-04","Id":"0054w00000BhH8JAAV"}]
//JSON.stringify(eventAuxiliar)


// triggerError(event) {
//     this.errors = {
//          rows: {
//              b: {
//                  title: 'We found some errors!!.',
//                  messages: [
//                     `no se puede procesar la solicitud para ${rowsSelected[i].Name},
//                      la fecha de inicio y fin deben estar dentro del rango del proyecto`,
//                      ],
//                  fieldNames: ['dateApiNameSD', 'dateApiNameED']
//              }
//          },
//          table: {
//              title: 'Your entry cannot be saved. Fix the errors and try again.',
//              messages: [
//                  'Row 2 amount must be number',
//                  'Row 2 email is invalid'
//              ]
//          }
//      };
//  }