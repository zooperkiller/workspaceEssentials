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
    
}