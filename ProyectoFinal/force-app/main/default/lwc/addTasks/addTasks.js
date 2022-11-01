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
    pendingTasks;    

    @api
    async refresh() {
          await refreshApex(this._wireResult);
    }

    @wire (getTasks, {currentUser:'$userId'})
    wireTask(Result){
        const { data, error } = Result;
        this._wireResult=Result;
        if (data) {
            this.tasks = data.tasks;
            if(data.tasks.length>0){
                this.projectName = data.tasks[0].Project__r.Alias__c + ' - ' + data.tasks.length + ' Pending Task' ;
            }else {
                this.projectName = 'No Pending Task' ;
            }
            
        } else if (error){
                this.error = error;
                console.log(error);
        }
    }

    updateTasks(event) {
         this.refresh(); 
    }
}