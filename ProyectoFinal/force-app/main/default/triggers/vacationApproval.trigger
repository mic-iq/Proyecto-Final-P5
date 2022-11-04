trigger vacationApproval on Out_of_Office_Approval__c (before insert,after update) {
    if(Trigger.isInsert){
        ////
        //User jona =[SELECT Id,Username FROM User WHERE Username='jongamboa1717@gmail.com'];
        /////
        set<Id>usersId =new set<Id>();
        for(Out_of_Office_Approval__c p:Trigger.New){
            usersId.add(p.User__c);
        }
        List<User>users =[SELECT Id, (SELECT Id,End_Date__c,Start_Date__c,ProjectLineItem__r.Project__r.Status__c FROM ProjectResources__r WHERE ProjectLineItem__r.Project__r.Status__c !='Completed') FROM USER WHERE Id IN:usersId];
        Map<Id,User> usersMap = new Map<Id,User>(users);
        for(Out_of_Office_Approval__c p:Trigger.New){
            Date starDate = p.Start_Date__c;
            Date endDate = p.End_Date__c;
            List<ProjectResource__c> projectResources = usersMap.get(p.User__c).ProjectResources__r;
            Integer counter = 0;
            for(ProjectResource__c projectResource:projectResources){
                if(projectResource.Start_Date__c > starDate && projectResource.End_Date__c <endDate){
                    counter +=1;
                }else if((projectResource.Start_Date__c <= starDate && projectResource.End_Date__c >= endDate)||(projectResource.Start_Date__c<=starDate && starDate<=projectResource.End_Date__c)||(endDate>=projectResource.Start_Date__c && endDate<=projectResource.End_Date__c)){
                    //Trigger.newMap.get(p.Id).addError('Revise sus fechas');
                }
            }
            if(counter==0){
                p.Status__c='Approved';
                //p.PM__c=jona.Id;
            }
            else{
                p.Status__c='Pending Approval';
                p.Out_of_Office_Approval_Needed__c=true;
                // p.PM__c=jona.Id;
                
            }
        }
        
        
    }else if(Trigger.isUpdate){
        set<Id>usersId =new set<Id>();
        for(Out_of_Office_Approval__c p:Trigger.New){
            if(p.Status__c == 'Approved' && Trigger.OldMap.get(p.Id).Status__c=='Pending Approval'){
                usersId.add(p.User__c);
            }
        }
        List<User>users =[SELECT Id, (SELECT Id,End_Date__c,Start_Date__c,ProjectLineItem__r.Project__r.Status__c FROM ProjectResources__r WHERE ProjectLineItem__r.Project__r.Status__c !='Completed' ORDER BY Start_Date__c ASC) FROM USER WHERE Id IN:usersId];
        
        Map<Id,User> usersMap = new Map<Id,User>(users);
        List<Out_of_Office_Approval__c>approvalList =new List<Out_of_Office_Approval__c>();
        for(Out_of_Office_Approval__c p:Trigger.New){
            system.debug('Registro de permiso: '+p);
            Date starDate = p.Start_Date__c;
            Date endDate = p.End_Date__c;
            List<ProjectResource__c> projectResources = usersMap.get(p.User__c).ProjectResources__r;
            system.debug('Lista de Proyectos pendientes: '+projectResources);
            
            
            List<ProjectResource__c> filter = new List<ProjectResource__c>();
            for(ProjectResource__c projectResource:projectResources){
                if(projectResource.Start_Date__c >starDate && projectResource.End_Date__c <endDate){
                    filter.add(projectResource);
                    
                }
            }
            system.debug('Proyectos Filtrados: '+filter);
            Integer auxiliar = (Integer)filter.size();
            system.debug('Auxiliar: '+auxiliar);
            for(Integer i=0;i<=auxiliar;i++){
                Out_of_Office_Approval__c approval = new Out_of_Office_Approval__c();
                if(i==0){
                    approval.Start_Date__c = starDate;
                    approval.End_Date__c = filter[0].Start_Date__c-1;
                    approval.User__c =p.User__c;
                    system.debug('Primer permiso creado: '+approval);
                    
                }else if(i>0 && i<auxiliar){
                    approval.Start_Date__c = filter[i-1].End_Date__c+1;
                    approval.End_Date__c = filter[i].Start_Date__c-1;
                    approval.User__c =p.User__c;
                }else if(i==auxiliar){
                    approval.Start_Date__c = filter[i-1].End_Date__c+1;
                    approval.End_Date__c = endDate;
                    approval.User__c =p.User__c;
                }
                approvalList.add(approval);
                system.debug('Lista de permisos nuevos creados: '+approvalList);
            }
            
            
        }   system.debug('Lista de antes de inserción: '+approvalList);
        insert approvalList;
        system.debug('Se hizo inserción');
        
    }
}