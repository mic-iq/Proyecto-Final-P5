import { LightningElement, wire } from 'lwc';
import uId from '@salesforce/user/Id';
import getTasks from '@salesforce/apex/TaskService.getTasks';

export default class HourTask extends LightningElement {
    userId = uId;
    value = 'notStart';
    tasks;

    get options() {
        return [
            { label: 'Not Start', value: 'notStart' },
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Completed', value: 'completed' },
        ];
    }
@wire (getTasks, {currentUser:'$userId'})
wireTask({data, error}){
       if (data) {
        this.tasks = data.tasks
        console.log('soy data'+ JSON.stringify(data));
       } else if (error){
            console.log(error);
       }
    }

    handleChange(event) {
        this.value = event.detail.value;
    }

}