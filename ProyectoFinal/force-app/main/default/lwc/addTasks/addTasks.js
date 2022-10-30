import { LightningElement, wire, api } from 'lwc';
import getTasks from '@salesforce/apex/TaskService.getTasks';
import uId from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';


export default class AddTasks extends LightningElement {
    userId = uId;
    tasks;
    projectName;
    states;
    errors;
    _wireResult;
    draftValues = [];

    @api
    async refresh() {
          await refreshApex(this._wireResult);
      }

    @wire (getTasks, {currentUser:'$userId'})
    wireTask(Result){
        const { data, error } = Result;
        this._wireResult=Result;
        if (data) {
            console.log('DATAAA NUEVO LWC' + JSON.stringify(data.tasks));
            this.tasks = data.tasks;
            this.projectName = data.tasks[0].Project__r.Alias__c;
            //console.log('soy algo'+ JSON.stringify(this.projectName));
            //console.log('soy data'+ JSON.stringify(data));
        } else if (error){
                this.error = error;
                console.log(error);
        }
    }

    updateTasks(event) {
         this.refresh(); 
    }


}