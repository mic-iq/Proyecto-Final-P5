public class ResourceService {
    
   /* public static ResourceWrapper getResourcesWrapper(Id projectId,String Role){
        Project__c project = [SELECT Id, Start_Date__c,End_Date__c, (SELECT Id,QuantityHours__c FROM ProjectLineItems__r WHERE Role__c=: Role)FROM Project__c WHERE Id=:projectId];
        List<User> resourcesAvailable = getResourcesWrap(project,Role);
        ResourceWrapper resourceWrap = new ResourceWrapper(project,resourcesAvailable);
        return resourceWrap;
    }*/
    
    //public static List <User> getResourcesWrap(Project__c project,String Role){
    public static List <User> getResourcesWrap(Id projectId,String Role){
        Project__c project = [SELECT Id, Start_Date__c,End_Date__c, (SELECT Id,QuantityHours__c FROM ProjectLineItems__r WHERE Role__c=: Role)FROM Project__c WHERE Id=:projectId]; //Hay que quitarla
        Date startDate = project.Start_Date__c;
        Date endDate = project.End_Date__c;
        List<ProjectResource__c> infoResourcesNotAvailable= [SELECT User__c,Id, Start_Date__c,End_Date__c From ProjectResource__c WHERE (Start_Date__c <:endDate AND Start_Date__c >=:startDate)  OR (Start_Date__c <:startDate AND End_Date__c >=:endDate)];
        Set<Id> resourcesNotAvailableId = new Set<Id>();
        for (ProjectResource__c projectResource:infoResourcesNotAvailable){
             resourcesNotAvailableId.add(projectResource.User__c);
        }
        List<User> resourcesAvailable = [SELECT Id,Name, RatePerHour__c,Role__c FROM User WHERE Role__c =:Role AND Id NOT IN :resourcesNotAvailableId];
        System.debug(resourcesAvailable);
        return resourcesAvailable;
    }
    
   /* public class ResourceWrapper {
        public Project__c project;
        public List <User> resources;
        public ResourceWrapper(Project__c project,List <User>resources){
            this.project =project;
            this.resources = resources;
        }
        
    }*/
}