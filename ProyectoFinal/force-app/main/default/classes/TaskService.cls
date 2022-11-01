public class TaskService {
    
    //|------Clases--------|
    public class TaskWrapper {
        @AuraEnabled
        public List <Project_Task__c> tasks;

        public TaskWrapper(List <Project_Task__c> tasks) {
            this.tasks = tasks;
        }
    }
    
    //|------Metodos--------|
    //Metodo para obtener tareas filtradas por usuario logueado *
    @AuraEnabled(cacheable=true)
    public static TaskWrapper getTasks(Id currentUser) {
        List<Project_Task__c> tasksList = [ 
                                            SELECT Name,
                                            State__c,
                                            EstimatedHours__c,
                                            RegisterHours__c,
                                            Project__r.Alias__c,
                                            Project__r.Total_Tasks__c, 
                                            Project__r.Total_Tasks_Completed__c
                                            FROM Project_Task__c 
                                            WHERE ProjectResource__r.User__c =:currentUser 
                                            AND State__c != 'Completed' 
                                            ORDER BY State__c DESC
                                             ];
        return new TaskWrapper(tasksList);
    }

    //Metodo para Cambiar de estado *
    
    @AuraEnabled
    public static Boolean updateTaskState(Id taskId, string state) {
        Boolean stateUpdated = false;
        Project_Task__c task = [SELECT Id FROM Project_Task__c WHERE Id =:taskId];
        task.State__c = state;
        if(task != null){
            update task;
            stateUpdated = true;
        }
        return stateUpdated;
    }
    //Metodo para registrar horas *
    @AuraEnabled
    public static Boolean registerHours(Id taskId, Integer hoursToAdd){
        Boolean hoursUpdated = false;
        Project_Task__c task = [SELECT Id,RegisterHours__c FROM Project_Task__c WHERE Id =:taskId];
        task.RegisterHours__c += hoursToAdd;
        if(task != null){
            update task;
            hoursUpdated = true;
        }
        return hoursUpdated;
        
    }
}