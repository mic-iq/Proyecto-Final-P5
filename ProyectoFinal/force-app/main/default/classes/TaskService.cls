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
        List<Project_Task__c> tasksList = [SELECT Name,State__c,EstimatedHours__c,RegisterHours__c,Project__r.Alias__c FROM Project_Task__c WHERE ProjectResource__r.User__c =:currentUser];
        return new TaskWrapper(tasksList);
    }

    //Metodo para Cambiar de estado *
    @AuraEnabled
    public static void updateTaskState(Id taskId, string state) {
        Project_Task__c task = [SELECT Id FROM Project_Task__c WHERE Id =:taskId];
        task.State__c = state;
        update task;
    }
    //Metodo para registrar horas *
    @AuraEnabled
    public static void registerHours(Id taskId, Integer hoursToAdd){
        Project_Task__c task = [SELECT Id,RegisterHours__c FROM Project_Task__c WHERE Id =:taskId];
        task.RegisterHours__c += hoursToAdd;
        update task;
    }
}