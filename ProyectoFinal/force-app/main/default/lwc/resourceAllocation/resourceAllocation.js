import { LightningElement, api, wire, track } from 'lwc';
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
    horas;
    hoursArch;
    draftValues=[];
    ProjectStartDate;
    ProjectEndDate;
    errors;
    _wireResult;
    arreglo=[];
    roleArray= ['Consultant', 'Developer', 'Architect'];
    allResources;
    _hours;
    iconsRole=["custom:custom62","custom:custom67","custom:custom63"];
    @track arregloDraftsArch=[];
    @track arregloDraftsCons=[];
    @track arregloDraftsDevelop=[];
    @track arrayComplete=[];

    

    @api
    async refresh() {
          await refreshApex(this._wireResult);
      }

                                                                           
    @wire(getResourcesWrapper,{projectId: '$recordId'})
    resource(Result){
     const { data, error } = Result;
     this._wireResult=Result;
     if (data) {
        this.allResources = data.resources;
        let vector=[];
        this.allResources.forEach((element, index) => {
            vector[index]=data.project.ProjectLineItems__r[index].QuantityHours__c 
            

        });

        this._hours=vector;
        //this.horas = data.project.ProjectLineItems__r[0].QuantityHours__c;
        this.ProjectStartDate = data.project.Start_Date__c;
        this.ProjectEndDate = data.project.End_Date__c;

     } else if (error) {
         this.error = error;
     }
    }

     handleSave(event){
        const draftValues=event.target.draftValues;
        let mapa={};
        this.errors={};
        const misRecursos= this.allResources;
        //console.log(misRecursos)
        let eventAuxiliar=[];
        for(let i=0; i< misRecursos.length; i++){
          for(let f=0; f< misRecursos[i].length; f++){
            for(let j =0; j<draftValues.length;j++){
                if(draftValues[j].Id==misRecursos[i][f].Id){
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
                                 if(draftValues[j].Id==misRecursos[i][f].Id){
                                     mapa={};
                                     mapa=draftValues[j];
                                     mapa["Role"]=misRecursos[i][f].Role__c;
                                     eventAuxiliar.push(mapa);
                                    }                
                                }
                }}
            }
            }
        }
      }

handleSelectedRows(event){
    const rowsSelected=event.detail.selectedRows;
    const draftValues=event.target.draftValues;
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
                                  
                   //Agregado notificacion
                    } else if(draftValues[j].dateApiNameSD>draftValues[j].dateApiNameED){
                       // console.log(`no se puede procesar la solicitud para ${rowsSelected[i].Name} La fecha de inicio nunca puede ser mayor a la de fin`);
                    } else {
                            if(draftValues[j].Id==rowsSelected[i].Id){
                                mapa={};
                                mapa=draftValues[j];
                                mapa["Role"]=rowsSelected[i].Role__c;
                                eventAuxiliar.push(mapa);
                                //this.eventAux.push(mapa)
                               //eventAuxiliar.push(draftValues[j])
                }
            }

            }

        }

      
    }

    //console.log(eventAuxiliar, this.recordId);
    
    
   if(eventAuxiliar.length>0){    
    this.arreglo=eventAuxiliar;
    this.enqueueWork(eventAuxiliar);
    }
}

    handleClick(){
      let mapa={};
      let arrayArch=[];
      let arrayDev=[];
      let arrayCon=[];
      this.arrayComplete;      
         if(this.arregloDraftsArch.length>0){
            JSON.stringify(this.arregloDraftsArch)
            for(let i=0; i<this.arregloDraftsArch.length;i++){
              
              mapa={};
              mapa["Role"]=this.arregloDraftsArch[i].Role;
              mapa["dateApiNameSD"]=this.arregloDraftsArch[i].dateApiNameSD;
              mapa["dateApiNameED"]=this.arregloDraftsArch[i].dateApiNameED;
              mapa["Id"]=this.arregloDraftsArch[i].Id;
              arrayArch.push(mapa);
            }
          }
          if(this.arregloDraftsCons.length>0){
            JSON.stringify(this.arregloDraftsCons)
            for(let j=0; j<this.arregloDraftsCons.length;j++){
             mapa={};
             mapa["Role"]=this.arregloDraftsCons[j].Role;
             mapa["dateApiNameSD"]=this.arregloDraftsCons[j].dateApiNameSD;
             mapa["dateApiNameED"]=this.arregloDraftsCons[j].dateApiNameED;
             mapa["Id"]=this.arregloDraftsCons[j].Id;
             arrayCon.push(mapa);       
             }
          }
          if(this.arregloDraftsDevelop.length>0){
            JSON.stringify(this.arregloDraftsDevelop)
            for(let f=0; f< this.arregloDraftsDevelop.length;f++){
              mapa={};
              mapa["Role"]=this.arregloDraftsDevelop[f].Role;
              mapa["dateApiNameSD"]=this.arregloDraftsDevelop[f].dateApiNameSD;
              mapa["dateApiNameED"]=this.arregloDraftsDevelop[f].dateApiNameED;
              mapa["Id"]=this.arregloDraftsDevelop[f].Id;
              arrayDev.push(mapa);
            }
          }
          
          
          let respuesta=[]

          let arch = JSON.parse(JSON.stringify(arrayArch))
          let dev = JSON.parse(JSON.stringify(arrayDev))
          let con = JSON.parse(JSON.stringify(arrayCon))
          
          if(arch.length>0){
            for(let f=0; f< arch.length;f++){
              respuesta.push(arch[f])
            }
          }
          if(dev.length>0){
            for(let f=0; f< dev.length;f++){
              respuesta.push(dev[f])
            }
          }
          if(con.length>0){
            for(let f=0; f< con.length;f++){
              respuesta.push(con[f])
            }
          }

          console.log(respuesta);
          
          registerResource({ProjectId: this.recordId, selected:respuesta})

          .then(resultado => {
              if(resultado==true){
                const toast = new ShowToastEvent({
                  title:'Successful insertion',
                  message:'Your resources have been inserted',
                  variant: 'Success',
              });
                this.dispatchEvent(toast);
                  this.arregloDraftsArch=[];
                  this.arregloDraftsCons=[];
                  this.arregloDraftsDevelop=[];
                  this.arrayComplete=[];
                  return this.refresh()
               }else{
                const toast = new ShowToastEvent({
                  title:'Insert Failed',
                  message:'Please check the dates of the resources that were not inserted',
                  variant: 'error',
              });
                  this.dispatchEvent(toast);
                  this.arregloDraftsArch=[];
                  this.arregloDraftsCons=[];
                  this.arregloDraftsDevelop=[];
                  this.arrayComplete=[];
                  return this.refresh();
               }
           })
           .catch(error=> console.log(JSON.stringify(error) + " Este es mi error"))
    }

    enqueueWork(toApex){ 
        if(toApex[0]["Role"]=="Consultant"){
          if(this.arregloDraftsCons.length==0){
            this.arregloDraftsCons.push(toApex);
          } else{
            this.arregloDraftsCons=toApex;
          }
        }
   			if(toApex[0]["Role"]=="Architect"){
          if(this.arregloDraftsArch.length==0){
            this.arregloDraftsArch.push(toApex);
          } else{
            this.arregloDraftsArch=toApex;
          }
        }
   			if(toApex[0]["Role"]=="Developer"){
          if(this.arregloDraftsDevelop.length==0){
            this.arregloDraftsDevelop.push(toApex);
          } else{
            this.arregloDraftsDevelop=toApex;
          }
        }
        console.log(this.arregloDraftsCons);
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

   
    //     console.log(eventAuxiliar)
    // }