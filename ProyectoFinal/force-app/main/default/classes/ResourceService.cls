public class ResourceService {
  @auraEnabled
     public static void registerResource(Id ProjectId,List<Map<String,Object>> selected){
          system.debug('Estos son mis recursos seleccionados: '+selected);
         system.debug('Estoy en proyecto : '+ProjectId);
         if(selected.size()>0){
            Project__c project = [SELECT Id, Start_Date__c,End_Date__c, (SELECT Id,QuantityHours__c,Role__c FROM ProjectLineItems__r) FROM Project__c WHERE Id=:projectId];
            List<ProjectLineItem__C>ProjectLineItemList = project.ProjectLineItems__r;
            Date startDate = project.Start_Date__c;
            Date endDate = project.End_Date__c;
            set<Id> IdsUsuarios = new set<Id>();
            for(Map<String,Object>m:selected){
               IdsUsuarios.add((Id)m.get('Id'));
            }
            List<User> UsuariosEscogidosEnInterfaz = [SELECT Id,(SELECT Id,Start_Date__c,End_Date__c FROM ProjectResources__r WHERE End_Date__c <:endDate ORDER BY End_Date__c DESC) FROM User WHERE Id In:IdsUsuarios];
              system.debug('Usuarios desde Interfaz : '+UsuariosEscogidosEnInterfaz);
            Map<Id,User> MapUsuariosEscogidos = new Map<Id,User>(UsuariosEscogidosEnInterfaz);
             system.debug('MapDeUsuarios : '+MapUsuariosEscogidos);
            List<ProjectResource__c>recursosAInsertar = new List<ProjectResource__c>();
            for(Map<String,Object> m:selected){
                system.debug('mi usuario : '+m);
              Id IdDeUsuarioSeleccionado = (Id)m.get('Id');
              Date fechaInicioDesdeInterfaz = Date.valueOf((String.valueOf(m.get('dateApiNameSD'))));
              Date fechaFinalDesdeInterfaz = Date.valueOf((String.valueOf(m.get('dateApiNameED'))));
                ProjectResource__c ultimoProyectoEnElqueTrabajo = new ProjectResource__c();
                if(MapUsuariosEscogidos.get(IdDeUsuarioSeleccionado).ProjectResources__r.size()>0){
             ultimoProyectoEnElqueTrabajo = MapUsuariosEscogidos.get(IdDeUsuarioSeleccionado).ProjectResources__r[0];
                 system.debug('su ultimo proyecto hecho : '+ultimoProyectoEnElqueTrabajo);
                
              if(ultimoProyectoEnElqueTrabajo.End_Date__c >= fechaInicioDesdeInterfaz){
                 
                break;
               }else if(ultimoProyectoEnElqueTrabajo.End_Date__c < startDate || ultimoProyectoEnElqueTrabajo.End_Date__c < fechaInicioDesdeInterfaz){
                        ProjectResource__c recurso = new ProjectResource__c();
                        recurso.User__c = IdDeUsuarioSeleccionado;
                        String Role =(String)m.get('Role');
                        for(ProjectLineItem__c ProjectLineItem:ProjectLineItemList){
                            if(ProjectLineItem.Role__c == Role){
                                recurso.ProjectLineItem__c =ProjectLineItem.Id;
                                break;
                            }
                        }
                        recurso.Start_Date__c = fechaInicioDesdeInterfaz;
                        recurso.End_Date__c = fechaFinalDesdeInterfaz;
                       system.debug('recurso con dato : '+recurso);
                        recursosAInsertar.add(recurso);
               }
                }
                else{
                    ProjectResource__c recurso = new ProjectResource__c();
                        recurso.User__c = IdDeUsuarioSeleccionado;
                        String Role =(String)m.get('Role');
                        for(ProjectLineItem__c ProjectLineItem:ProjectLineItemList){
                            if(ProjectLineItem.Role__c == Role){
                                recurso.ProjectLineItem__c =ProjectLineItem.Id;
                                break;
                            }
                        }
                        recurso.Start_Date__c = fechaInicioDesdeInterfaz;
                        recurso.End_Date__c = fechaFinalDesdeInterfaz;
                       system.debug('recurso con dato : '+recurso);
                        recursosAInsertar.add(recurso);
                }
            }
            if(recursosAInsertar.size()>0){
                insert recursosAInsertar;
            }      
         }
     }
    
    
    ////////////////////////////////////Método getResourcesWrapper/////////////////////////////////////////////////////////
    @AuraEnabled(cacheable=true)
    public static ResourceWrapper getResourcesWrapper(Id projectId,String Role){
        Project__c project = [SELECT Id, Start_Date__c,End_Date__c, (SELECT Id,QuantityHours__c FROM ProjectLineItems__r WHERE Role__c=: Role)FROM Project__c WHERE Id=:projectId];
        List<User> resourcesAvailable = getResourcesWrap(project,Role);
      //  system.debug('Estos son mis recursos: '+resourcesAvailable);
        ResourceWrapper resourceWrap = new ResourceWrapper(project,resourcesAvailable);
        return resourceWrap;
    }
    
   private static List <User> getResourcesWrap(Project__c project,String Role){
        Date startDate = project.Start_Date__c;
        Date endDate = project.End_Date__c;
        //List<ProjectResource__c> infoResourcesNotAvailable= [SELECT User__c,Id, Start_Date__c,End_Date__c From ProjectResource__c WHERE (Start_Date__c <:endDate AND Start_Date__c >=:startDate)  OR (Start_Date__c <:startDate AND End_Date__c >=:endDate)];
        List<ProjectResource__c> infoResourcesNotAvailable= [SELECT User__c,Id, Start_Date__c,End_Date__c From ProjectResource__c WHERE Start_Date__c <:startDate AND End_Date__c >=:endDate];
       // System.debug('ProjectResource: '+ infoResourcesNotAvailable);
        Set<Id> resourcesNotAvailableId = new Set<Id>();
        for (ProjectResource__c projectResource:infoResourcesNotAvailable){
             resourcesNotAvailableId.add(projectResource.User__c);
        }
        System.debug('Id que no quiero: '+resourcesNotAvailableId);
        List<User> resourcesAvailable = [SELECT Id,Name, RatePerHour__c,Role__c FROM User WHERE Role__c =:Role AND Id NOT IN: resourcesNotAvailableId];
       // System.debug(resourcesAvailable);
        return resourcesAvailable;
    }
    public class ResourceWrapper {
        @AuraEnabled
        public Project__c project;
        @AuraEnabled
        public List <User> resources;
        public ResourceWrapper(Project__c project,List <User>resources){
            this.project =project;
            this.resources = resources;
        }
        
    }
}