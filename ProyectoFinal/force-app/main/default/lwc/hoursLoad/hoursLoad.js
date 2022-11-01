import { LightningElement, wire, api } from 'lwc';
import getTasks from '@salesforce/apex/TaskService.getTasks';
import registerHours from '@salesforce/apex/TaskService.registerHours';
import updateTaskState from '@salesforce/apex/TaskService.updateTaskState';
import uId from '@salesforce/user/Id';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLS = [
    { label: 'Task', fieldName: 'Name', editable: false },
    { label: 'State', fieldName: 'State__c', editable: false },
    { label: 'Estimated Hours', fieldName: 'EstimatedHours__c', editable: false },
    { label: 'Registered Hours', fieldName: 'RegisterHours__c', editable: false},
    { label: 'Hours', fieldName: 'Hours', editable: true, type: 'phone' },
    { type: "button", typeAttributes: {
        label: 'Register Hours',
        name: 'addHours',
        title: 'Edit',
        disabled: false,
        value: 'edit',
        iconPosition: 'left',
        variant: 'brand-outline',
    } },
    { type: "button", typeAttributes: {
        label: 'Complete Task',
        name: 'complete',
        title: 'Edit',
        disabled: false,
        value: 'edit',
        iconPosition: 'left',
        variant: 'brand-outline',
    } },
    { type: "button", typeAttributes: {
        label: 'Start Task',
        name: 'start',
        title: 'Edit',
        disabled: false,
        value: 'edit',
        iconPosition: 'left',
        variant: 'brand',
    } }
];

export default class HoursLoad extends LightningElement {
    userId = uId;
    tasks;
    projectName;
    taskId;
    hours;
    states;
    errors;
    _wireResult;
    columns = COLS;
    draftValues = [];

    renderedCallback(){
        this.handlemensaje();
    }

    handlemensaje(){
        console.log('HOLAA');
    }
    @api
    async refresh() {
          await refreshApex(this._wireResult);
      }

    @wire (getTasks, {currentUser:'$userId'})
    wireTask(Result){
        const { data, error } = Result;
        this._wireResult=Result;
           if (data) {
            this.tasks = data.tasks
            this.projectName = data.tasks[0].Project__r.Alias__c;
            //console.log('soy algo'+ JSON.stringify(this.projectName));
            //console.log('soy data'+ JSON.stringify(data));
           } else if (error){
               this.error = error;
               console.log(error);
           }
        }
    
    
    handleHours(event){
        //const draftValues = event.target.draftValues;
        //console.log('DRAFT VALUES' + JSON.stringify(draftValues[0]));
        //this.draftValues = []; 
    }

    handleUpdateHours(event){
        const draftValues = event.target.draftValues;
        const actionName = event.detail.action.name;
        this.taskId = draftValues[0].Id;
        this.hours = draftValues[0].Hours;
        let rowId = event.detail.row.Id;
        if (actionName === 'addHours' ) {
            //console.log(JSON.stringify(this.taskId) + " Este es mi task");
            //console.log(JSON.stringify(this.hours) + " Este es mi hours");
        registerHours({taskId:this.taskId, hoursToAdd:this.hours})     
        .then(result => {
            if(result==true){
             this.draftValues = [];   
             return this.refresh();      
            }
        })
        .catch(error=> console.log(JSON.stringify(error) + " Este es mi error"))       
        } else if(actionName === 'complete') {
            //console.log('complete');
            //let rowId = event.detail.row.Id;
            //console.log('selected Row '+ rowId);
            let status = 'Completed'
            updateTaskState({taskId:rowId, state: status})
            .then(result => {
                if (result==true) {
                    this.draftValues = [];
                    return this.refresh();
                }
            })
            .catch(
                error=> console.log(JSON.stringify(error) + " Este es mi error")
            )
       }else if(actionName === 'start') {
        let status = 'In progress'
            updateTaskState({taskId:rowId, state: status})
            .then(result => {
                if (result==true) {
                    this.draftValues = [];
                    return this.refresh();
                }
            })
            .catch(
                error=> console.log(JSON.stringify(error) + " Este es mi error")
            )
       
       }
       //console.log('Draf' + JSON.stringify(draftValues[0]));
       
     
    }


}