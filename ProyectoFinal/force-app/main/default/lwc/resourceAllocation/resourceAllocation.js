import { LightningElement, api, wire } from 'lwc';
import getResourcesWrapper from '@salesforce/apex/ResourceService.getResourcesWrapper';
import registerResource from '@salesforce/apex/ResourceService.registerResource';
//Importado ToastEvent
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';


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
    @api errors;
    _wireResult;
    arreglo=[];
    roleArray= ['Consultant', 'Developer', 'Architect'];
    // nuevos atributos
    @api
    allResources;
    index=0;
    
   
    @api
    async refresh() {
          await refreshApex(this._wireResult);
      }

    get hours(){
        
        return this.resource.Role__c;
    }

                                                                           
    @wire(getResourcesWrapper,{projectId: '$recordId'})
    resource(Result){
     const { data, error } = Result;
     this._wireResult=Result;
     if (data) {
        this.allResources = data.resources;
        //this.horas = data.project.ProjectLineItems__r[0].QuantityHours__c;
        this.ProjectStartDate = data.project.Start_Date__c;
        this.ProjectEndDate = data.project.End_Date__c;

     } else if (error) {
         this.error = error;
     }
    }

    // console.log("DATA: "+JSON.stringify(data));
    // console.log(this.ProjectStartDate +" "+ this.ProjectEndDate )

    

    //  @wire(getResourcesWrapper,{projectId: '$recordId', Role:'Developer'})
    //    developer(ResultDev){
    //     const { data, error } = ResultDev;
    //     if (data) {
    //         this.recursosDeveloper = data.resources;
    //         this.hoursDev = data.project.ProjectLineItems__r[0].QuantityHours__c;
    //     } else if (error) {
    //         this.error = error;
    //     }
    // }

    // @wire(getResourcesWrapper,{projectId: '$recordId', Role:'Architect'})
    //    architect(ResultArch){
    //     const { data, error } = ResultArch;
    //     if (data) {
    //         this.recursosArchitect = data.resources;
    //         this.hoursArch = data.project.ProjectLineItems__r[0].QuantityHours__c;
    //     } else if (error) {
    //         this.error = error;
    //     }
    // }

    handleSave(event){
        const draftValues=event.target.draftValues;
        let mapa={};
        //|
        this.errors={};
        const misRecursos= this.recursos;
        let eventAuxiliar=[];
        for(let i=0; i< misRecursos.length; i++){
            for(let j =0; j<draftValues.length;j++){
                if(draftValues[j].Id==misRecursos[i].Id){
                    if(draftValues[j].dateApiNameSD != null && draftValues[j].dateApiNameED != null ){
                        if(draftValues[j].dateApiNameSD>draftValues[j].dateApiNameED){
                            let error = {};
                            error.rows = {};
                            error.rows[draftValues[j].Id] = { title: 'Too much coffee??..', messages: [ `Usually we start with the "Start Date", wich in this case, as example ${this.ProjectStartDate} then, "End date" that could be ${this.ProjectEndDate}.`], fields: ['dateApiNameSD', 'dateApiNameED']};
                            this.errors = error;

                        } else if(draftValues[j].dateApiNameSD < this.ProjectStartDate || draftValues[j].dateApiNameED > this.ProjectEndDate){
                            let error = {};
                            error.rows = {};
                            error.rows[draftValues[j].Id] = { title: 'Please check your input', messages: [ `Dates should be between ${this.ProjectStartDate} and ${this.ProjectEndDate}.`], fields: ['dateApiNameSD', 'dateApiNameED']};
                            this.errors = error;                            
                             } else {
                                 if(draftValues[j].Id==misRecursos[i].Id){
                                     mapa={};
                                     mapa=draftValues[j];
                                     mapa["Role"]=misRecursos[i].Role__c;
                                     eventAuxiliar.push(mapa);
                                    }                
                                }
                }
            }
            }
        }
        console.log(eventAuxiliar)
    }
 

handleSelectedRows(event){
    const rowsSelected=event.detail.selectedRows;
    const draftValues=event.target.draftValues;
   //console.log(draftValues);
    let eventAuxiliar=[];
    let mapa={};
    for(let i=0; i< rowsSelected.length; i++){
       //let array=draftValues.filter(elemento=> elemento.id=rowsSelected[i].id)
    //console.log(rowsSelected[i])
        for(let j =0; j<draftValues.length;j++){
            if(draftValues[j].dateApiNameSD != null && draftValues[j].dateApiNameED != null ){
               //agregado el chequeo de fechas ciertas
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

      
    }
    console.log(eventAuxiliar, this.recordId);
    
    
   if(eventAuxiliar.length>0){    
    this.arreglo=eventAuxiliar;
    }
}


    handleClick(){
        registerResource({ProjectId: this.recordId, selected:this.arreglo})
     
    .then(resultado => {
        if(resultado==true){
         return this.refresh()      
         }
     })
    .catch(error=> console.log(JSON.stringify(error) + " Este es mi error"))
    }

}