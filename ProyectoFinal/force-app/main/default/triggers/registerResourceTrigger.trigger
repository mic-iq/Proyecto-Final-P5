trigger registerResourceTrigger on ProjectResource__c (before insert) {
    set<Id>IdUser = new set<Id>();
    for(ProjectResource__c projectResource:Trigger.New){
       IdUser.add(ProjectResource.User__c);
    }
    List<User>users=[SELECT Id,(SELECT Id,Start_Date__c,End_Date__c,ProjectLineItem__r.Project__r.Status__c FROM ProjectResources__r WHERE ProjectLineItem__r.Project__r.Status__c!='Completed' ORDER BY Start_Date__c ) FROM User WHERE Id IN:IdUser];
    Map<Id,User>usersMap = new Map<Id,User>(users);
    List<ProjectResource__c>resourceToInsert = new List<ProjectResource__c>();
    for(ProjectResource__c projectResource:Trigger.New){
        Date endDate = projectResource.End_Date__c;
        Date startDate = projectResource.Start_Date__c;
        List<ProjectResource__c> projectPerUserList=usersMap.get(projectResource.User__c).ProjectResources__r;
        Integer sizeList =(Integer)projectPerUserList.size();
        Integer counter=0;
         for(ProjectResource__c projectPerUser: projectPerUserList){
            Date startDateProjectResource= projectPerUser.Start_Date__c;
            Date endDateProjectResource = projectPerUser.End_Date__c;
            if((startDateProjectResource < startDate && endDateProjectResource < startDate)||(startDateProjectResource > endDate && endDateProjectResource > endDate)){
                counter +=1;
            }
         }
        if(counter == sizeList){
            resourceToInsert.add(projectResource);
       }else{
            Trigger.newMap.get(projectResource.Id).addError('Please,check the insert dates for this resource');
        }
    }
    
}