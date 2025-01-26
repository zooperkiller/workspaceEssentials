public without sharing class LWRCaseReasonDetails {

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(String query) {
        System.debug('Search Query: ' + query); // Debugging the input query
        String searchQuery = '%' + query + '%'; // Prepare the query for LIKE
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE Name LIKE :searchQuery LIMIT 10];
        
        System.debug('Accounts found: ' + accounts); // Debugging the result
        return accounts;
    }
    
}