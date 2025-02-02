public without sharing class LWRCaseReasonDetails {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String query) {
        System.debug('Search Query: ' + query); // Debugging the input query
        String searchQuery = '%' + query + '%'; // Prepare the query for LIKE
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE Name LIKE :searchQuery ];
        
        System.debug('Accounts found: ' + accounts); // Debugging the result
        return accounts;
    }
    
    @AuraEnabled
    public static List<Map<String, String>> getAccounts2(String query) {
        List<Map<String, String>> accounts = new List<Map<String, String>>();
        System.debug('Search Query: ' + query);
        String searchQuery = '%' + query + '%';
        System.debug('Search Query 2: ' + searchQuery);
        for (Account a : [SELECT Id, Name FROM Account WHERE Name LIKE :searchQuery]) {
            accounts.add(
                new Map<String, String>{ 'label' => a.Name, 'value' => a.Id }
            );
        }
        System.debug('accounts: ' + accounts);
        return accounts;
    }
    
    @AuraEnabled(cacheable=true)
    Public static list<Customer_Service_Case__mdt> showCustomMetadata(){
         return getCustomerServiceMDT();
    }
    
    @testVisible
    private static list<Customer_Service_Case__mdt> getCustomerServiceMDT(){
        list<Customer_Service_Case__mdt> mdt = [Select Id,RecordType1__c,Reason1__c,SubReason1__c from Customer_Service_Case__mdt];
		system.debug('@@'+mdt);
        return mdt;
    }

    // Wrapper class to hold case data
    public class CaseDataWrapper {
        public String caseRecordType { get; set; }
        public String caseReason { get; set; }
        public String caseSubReason { get; set; }
        public String orderNumber { get; set; }
        public String quoteNumber { get; set; }
        public String poNumber { get; set; }
        public String subject { get; set; }
        public String description { get; set; }
    }

    // Method to process case creation data
    @AuraEnabled
    public static void createCase(CaseDataWrapper caseData) {
        // Validate required fields (example: caseRecordType, caseReason, subject)
        if (String.isBlank(caseData.caseRecordType) || String.isBlank(caseData.caseReason) || String.isBlank(caseData.subject)) {
            throw new IllegalArgumentException('Required fields are missing: caseRecordType, caseReason, or subject.');
        }

        Case newCase = new Case();
        newCase.RecordTypeId = caseData.caseRecordType;
        newCase.RecordTypeId = caseData.caseRecordType;
        newCase.Case_Reason__c = caseData.caseReason;
        newCase.Case_Sub_Reason__c = caseData.caseSubReason;
        newCase.Status  = 'New';
        newCase.Subject = caseData.subject;
        newCase.Description = caseData.description;

        // Insert the case
        insert newCase;
    }
    
    @AuraEnabled
    public static void createCaseFromJson(String jsonData) {
        // Check if the JSON input is null or empty
        System.debug('@@AY'+jsonData);
        if (String.isBlank(jsonData)) {
            throw new IllegalArgumentException('JSON input cannot be null or empty.');
        }

        try {
            // Deserialize JSON into the wrapper class
            CaseDataWrapper caseData = (CaseDataWrapper) JSON.deserialize(jsonData, CaseDataWrapper.class);

            // Call the createCase method
            createCase(caseData);
        } catch (System.JSONException e) {
            // Handle JSON parsing errors
            throw new IllegalArgumentException('Invalid JSON input: ' + e.getMessage());
        }
    }

    public class CaseDetailWrapper {
        @AuraEnabled public String caseId;
        @AuraEnabled public String caseNumber;
        @AuraEnabled public String caseType;
        @AuraEnabled public String caseSubject;
        @AuraEnabled public String caseReason;
        @AuraEnabled public String caseStatus;
        @AuraEnabled public String caseDate;

        public CaseDetailWrapper(Case caseRec) {
            this.caseId = caseRec.Id;
            this.caseNumber = caseRec.CaseNumber;
            this.caseType = caseRec.Type;
            this.caseSubject = caseRec.Subject;
            this.caseReason = caseRec.Case_Reason__c;
            this.caseStatus = caseRec.Status;
            this.caseDate = String.valueOf(caseRec.CreatedDate);
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<CaseDetailWrapper> getCases() {
        List<CaseDetailWrapper> caseList = new List<CaseDetailWrapper>();
        try {
            List<Case> cases = [
                SELECT Id, CaseNumber, Type, Subject, Case_Reason__c, Status, CreatedDate 
                FROM Case ORDER BY CreatedDate DESC
            ];
            for (Case c : cases) {
                caseList.add(new CaseDetailWrapper(c));
            }
        } catch (Exception e) {
            System.debug('Error fetching cases: ' + e.getMessage());
            throw new AuraHandledException('Error retrieving cases. Please try again later.');
        }
        return caseList;
    }
}