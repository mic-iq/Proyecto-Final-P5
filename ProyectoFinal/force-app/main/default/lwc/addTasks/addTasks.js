import { LightningElement, wire, api } from 'lwc';
import getTasks from '@salesforce/apex/TaskService.getTasks';
import registerHours from '@salesforce/apex/TaskService.registerHours';
import updateTaskState from '@salesforce/apex/TaskService.updateTaskState';
import uId from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';

export default class AddTasks extends LightningElement {
  
  taskIsStarted = false;
  taskIsCompleted = false;
  hours=0;
  userId = uId;
  projectName;
  states;
  taskId;
  error;
  tasks;


  @wire (getTasks, {currentUser:'$userId'})
  wireTask(Result){
      const { data, error } = Result;
         if (data) {
          this.tasks = data.tasks
          this.projectName = data.tasks[0].Project__r.Alias__c;
          console.log('soy algo de addTasks'+ JSON.stringify(this.projectName));
          console.log('soy addTasks'+ JSON.stringify(data));
         } else if (error){
             this.error = error;
             console.log(error);
         }
      }  


  handleInput(event) {
    this.hours = event.target.value;
  }

  handleLoadHours() {
    registerHours({taskId:this.taskId, hoursToAdd:this.hours})     
    .then(result => {
        if(result==true){  
         return this.refresh();      
        }
    })
    .catch(error=> console.log(JSON.stringify(error) + " Este es mi error")) 
  }

  handleMarkCompleted() {
    let status = 'Completed'
    updateTaskState({taskId:this.taskId, state:status})
    .then(result => {
        if (result==true) {
            return this.refresh();
        }
    })
    .catch(
        error=> console.log(JSON.stringify(error) + " Este es mi error")
    )
  }

  handleStartTask() {
    let status = 'In progress'
    updateTaskState({taskId:this.taskId, state:status})
    .then(result => {
        if (result==true) {
            return this.refresh();
        }
    })
    .catch(
        error=> console.log(JSON.stringify(error) + " Este es mi error")
    )
  }
}