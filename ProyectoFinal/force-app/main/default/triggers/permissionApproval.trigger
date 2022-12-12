trigger permissionApproval on Out_of_Office_Approval__c (before insert,after update) {
    if(Trigger.isInsert){
        set<Id>usersId =new set<Id>();
        set<Id>projectsId =new set<Id>();
        for(Out_of_Office_Approval__c p:Trigger.New){
            usersId.add(p.User__c);
            system.debug('USERS'+ p.User__c);
            projectsId.add(p.Project__c);
        }
        
        List<User>users =[SELECT Id, (SELECT Id,End_Date__c,Start_Date__c,ProjectLineItem__r.Project__r.Status__c,ProjectLineItem__r.Project__r.Id,ProjectLineItem__r.Project__r.SquadLead__c,ProjectLineItem__r.Project__r.Opportunity__r.Project_Manager__c FROM ProjectResources__r WHERE ProjectLineItem__r.Project__r.Status__c !='Completed'ORDER BY Start_Date__c ASC ) FROM User WHERE Id IN:usersId];
        
        system.debug('USERS'+ users);
        Map<Id,User> usersMap = new Map<Id,User>(users);
        system.debug('usersMap'+ usersMap);
        List<Project__c> projects = [SELECT Id,SquadLead__c, Opportunity__r.Project_Manager__c,ProjectResource__r.User__r.Id FROM Project__c  WHERE Id IN: projectsId ];
        Map<Id,Project__c> projectsMap = new Map<Id,Project__c>(projects);
        List<Out_of_Office_Approval__c>approvalNewList = new List<Out_of_Office_Approval__c>();
        for(Out_of_Office_Approval__c p:Trigger.New){
            system.debug('USER C'+ p.User__c);
            p.Squad_Lead__c = projectsMap.get(p.Project__c).ProjectResource__r.User__r.Id;
            p.PM__c = projectsMap.get(p.Project__c).Opportunity__r.Project_Manager__c;
            Date starDate = p.Start_Date__c;
            Date endDate = p.End_Date__c;
            List<ProjectResource__c> projectResourcesPerUser = usersMap.get(p.User__c).ProjectResources__r;
            Integer sizeProjectResourcesPerUserList = (Integer)projectResourcesPerUser.size();
            Integer counter = 0;
            
            for(ProjectResource__c projectResource:projectResourcesPerUser){
                Date startDateProjectResource= projectResource.Start_Date__c;
                Date endDateProjectResource = projectResource.End_Date__c;
                if((startDateProjectResource < starDate && endDateProjectResource < starDate)||(startDateProjectResource >endDate && endDateProjectResource > endDate)){
                    counter +=1;
                }
                
            }
            if(counter==sizeProjectResourcesPerUserList){
                p.Status__c='Approved';
                
            }
            else{
                p.Status__c='Pending Approval';
            }
        }
    }
    
    if(Trigger.isUpdate){
        set<Id>usersId =new set<Id>();
        set<Id>projectsId =new set<Id>();
        for(Out_of_Office_Approval__c p:Trigger.New){
            usersId.add(p.User__c);
            system.debug('USERS'+ p.User__c);
            //projectsId.add(p.Project__c);
        }
        
        List<User>users =[SELECT Id, (SELECT Id,End_Date__c,Start_Date__c,ProjectLineItem__r.Project__r.Status__c,ProjectLineItem__r.Project__r.Id,ProjectLineItem__r.Project__r.SquadLead__c,ProjectLineItem__r.Project__r.Opportunity__r.Project_Manager__c FROM ProjectResources__r WHERE ProjectLineItem__r.Project__r.Status__c !='Completed' ORDER BY Start_Date__c ASC) FROM User WHERE Id IN:usersId];
        system.debug('USERS'+ users);
        Map<Id,User> usersMap = new Map<Id,User>(users);
        system.debug('usersMap'+ usersMap);
        //List<Project__c> projects = [SELECT Id,SquadLead__c, Project_Manager__c FROM Project__c WHERE Id IN: projectsId ];
        //Map<Id,Project__c> projectsMap = new Map<Id,Project__c>(projects);
        List<Out_of_Office_Approval__c>approvalNewList = new List<Out_of_Office_Approval__c>();
        for(Out_of_Office_Approval__c p:Trigger.New){
            system.debug('USER C'+ p.User__c);
            Date starDate = p.Start_Date__c;
            Date endDate = p.End_Date__c;
            List<ProjectResource__c> projectResourcesPerUser = usersMap.get(p.User__c).ProjectResources__r;
            system.debug('Lista de proyectoss'+ projectResourcesPerUser);
            Integer sizeProjectResourcesPerUserList = (Integer)projectResourcesPerUser.size();
            List<ProjectResource__c>filtered =new List<ProjectResource__c>();
            for(ProjectResource__c projectResource:projectResourcesPerUser){
                Date startDateProjectResource= projectResource.Start_Date__c;
                Date endDateProjectResource = projectResource.End_Date__c;
                if(!((startDateProjectResource < starDate && endDateProjectResource < starDate)||(startDateProjectResource >endDate && endDateProjectResource > endDate))){
                    Out_of_Office_Approval__c approval = new Out_of_Office_Approval__c();
                    approval.PM__c=projectResource.ProjectLineItem__r.Project__r.Opportunity__r.Project_Manager__c;
                    approval.Squad_Lead__c=projectResource.ProjectLineItem__r.Project__r.SquadLead__c;
                    approval.Project__c= projectResource.ProjectLineItem__r.Project__r.Id;
                    approval.User__c=p.User__c;
                    approval.Status__c = 'Pending Approval';
                    approval.Start_Date__c=projectResource.Start_Date__c;
                    approval.End_Date__c=projectResource.End_Date__c;
                    system.debug('Nueva aprobación'+ approval);
                    approvalNewList.add(approval);
                    filtered.add(projectResource);
                }
            }
            if(filtered.size()>0){
                Integer auxiliar = (Integer)filtered.size();
                system.debug('auxiliar:'+auxiliar);
                for(Integer i=0;i<auxiliar;i++){
                    Out_of_Office_Approval__c subPermission = new Out_of_Office_Approval__c();
                    subPermission.User__c = p.User__c;
                    system.debug('subPermission:'+subPermission.User__c);
                    subPermission.Status__c ='Approved';
                    subPermission.Squad_Lead__c =p.Squad_Lead__c;
                    subPermission.PM__c = p.PM__c;
                    subPermission.Project__c =p.Project__c;
                    //ProjectResource__c projectResource = filtered[i];
                    Date startDateProjectResource = filtered[i].Start_Date__c;
                    Date endDateProjectResource = filtered[i].End_Date__c;
                    if(i==0){
                        if(startDateProjectResource<=starDate && starDate<=endDateProjectResource){
                            subPermission.Start_Date__c = endDateProjectResource +1;
                            if(auxiliar==1){
                                subPermission.End_Date__c = endDate;
                            }
                            else{
                                subPermission.End_Date__c = filtered[i+1].Start_Date__c -1;
                            }
                        }else if(startDateProjectResource > starDate && endDateProjectResource < endDate){
                            subPermission.Start_Date__c = starDate;
                            subPermission.End_Date__c = startDateProjectResource - 1;
                            Out_of_Office_Approval__c subPermission2 = new Out_of_Office_Approval__c();
                            subPermission2.User__c = p.User__c;
                            subPermission2.Squad_Lead__c =p.Squad_Lead__c;
                            subPermission2.PM__c = p.PM__c;
                            subPermission2.Project__c =p.Project__c;
                            subPermission2.Status__c ='Approved';
                            subPermission2.Start_Date__c = endDateProjectResource +1;
                            if(auxiliar==1){
                                subPermission2.End_Date__c = endDate;
                            }
                            else{
                                subPermission2.End_Date__c = filtered[i+1].Start_Date__c -1;
                            }
                            approvalNewList.add(subPermission2);
                            
                        }else if(startDateProjectResource > starDate && endDateProjectResource >= endDate){
                            subPermission.Start_Date__c = starDate;
                            subPermission.End_Date__c = startDateProjectResource - 1;
                        }
                        
                    }else if(i>0 && i<auxiliar-1){
                        subPermission.Start_Date__c = endDateProjectResource +1;
                        subPermission.End_Date__c = filtered[i+1].Start_Date__c -1;
                        if(filtered[0].Start_Date__c <=starDate && starDate <=filtered[0].End_Date__c){
                            subPermission.Start_Date__c = endDateProjectResource +1;
                            subPermission.End_Date__c = filtered[i+1].Start_Date__c -1;
                        }else if(filtered[0].Start_Date__c > starDate){
                            subPermission.Start_Date__c = filtered[i-1].End_Date__c +1;
                            subPermission.End_Date__c = startDateProjectResource - 1;
                        }
                    }
                    else if(i>0 && i==auxiliar-1){
                        if(endDateProjectResource < endDate){
                            subPermission.Start_Date__c = endDateProjectResource+1;
                            subPermission.End_Date__c =  endDate;
                        }
                    }
                    approvalNewList.add(subPermission);
                    system.debug('nuevos permisos'+approvalNewList);
                }  
            }
        }
        insert approvalNewList;
        for(Out_of_Office_Approval__c o:approvalNewList){
            if(o.Status__c =='Pending Approval'){
                Approval.ProcessSubmitRequest req1 = new Approval.ProcessSubmitRequest();
                req1.setObjectId(o.id);
                Approval.ProcessResult result = Approval.process(req1);
            }
        }
    }
}