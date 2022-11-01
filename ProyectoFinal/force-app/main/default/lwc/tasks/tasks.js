import { LightningElement, api} from 'lwc';
import registerHours from '@salesforce/apex/TaskService.registerHours';
import updateTaskState from '@salesforce/apex/TaskService.updateTaskState';
import { refreshApex } from '@salesforce/apex';
export default class Task extends LightningElement {
    @api task;
    hours;
    taskIsStarted=true;
    
    handleInput(event) {
        this.hours = event.target.value;
        console.log('HORAS' + this.hours);
        console.log('ID' + this.task.Id);
    }

    handleLoadHours() {
        registerHours({taskId:this.task.Id, hoursToAdd:this.hours})     
        .then(result => {
            if(result==true){  
                //let hoursSum;
                  return this.updateTask();
            }
        })
        .catch(error=> console.log(JSON.stringify(error) + " Este es mi error")) 
    }
    
    handleMarkCompleted() {
        let status = '';
        if (this.task.State__c==='In progress') {
            status='Completed';
        }
        if (this.task.State__c==='Not started yet') {
            status = 'In progress';
        
        }
        
        
        updateTaskState({taskId:this.task.Id, state:status})
        .then(result => {
            if (result==true) {
                return this.updateTask();
            }
        })
        .catch(
            error=> console.log(JSON.stringify(error) + " Este es mi error")
        )
    }

    updateTask() {
        const hoursAdded = new CustomEvent('hoursadded', {});
        this.dispatchEvent(hoursAdded);    
    }



}