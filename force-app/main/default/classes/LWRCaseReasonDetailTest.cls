@IsTest
public class LWRCaseReasonDetailTest {
    
    @IsTest
    static void testGetCustomerServiceMDT() {
        
        // Call the method being tested
        Test.startTest();
        List<Customer_Service_Case__mdt> result = LWRCaseReasonDetails.getCustomerServiceMDT();
        Test.stopTest();

        
    }
    @IsTest
    static void testShowCustomMetadata() {
        
        // Call the method being tested
        Test.startTest();
        List<Customer_Service_Case__mdt> result = LWRCaseReasonDetails.showCustomMetadata();
        Test.stopTest();

        
    }
    
     @TestSetup
    static void setupTestData() {
        // Create test cases owned by the current user
        List<Case> testCases = new List<Case>();
        for (Integer i = 1; i <= 3; i++) {
            testCases.add(new Case(
                Subject = 'Test Case ' + i,
                Status = 'New',
                Type = 'Problem',
                Case_Reason__c = 'Inquiry',
                OwnerId = UserInfo.getUserId()
            ));
        }
        insert testCases;
    }

    // Test method for when cases exist
    @IsTest
    static void testGetCasesWithRecords() {
        // Re-query cases in DESC order to match Apex method's order
        List<Case> insertedCases = [
            SELECT Id, CaseNumber, Type, Subject, Case_Reason__c, Status, CreatedDate
            FROM Case
            ORDER BY CreatedDate DESC
        ];

        Test.startTest();
        List<LWRCaseReasonDetails.CaseDetailWrapper> results = LWRCaseReasonDetails.getCases();
        Test.stopTest();

        // Verify the number of results matches
        System.assertEquals(insertedCases.size(), results.size(), 'Incorrect number of cases returned');

        // Verify all fields and date formatting
        for (Integer i = 0; i < results.size(); i++) {
            LWRCaseReasonDetails.CaseDetailWrapper wrapper = results[i];
            Case testCase = insertedCases[i];

            System.assertEquals(testCase.CaseNumber, wrapper.caseNumber, 'CaseNumber mismatch');
            System.assertEquals(testCase.Type, wrapper.caseType, 'Type mismatch');
            System.assertEquals(testCase.Subject, wrapper.caseSubject, 'Subject mismatch');
            System.assertEquals(testCase.Case_Reason__c, wrapper.caseReason, 'Case_Reason__c mismatch');
            System.assertEquals(testCase.Status, wrapper.caseStatus, 'Status mismatch');
            
            // Verify date formatting (MM-DD-YYYY)
            Date createdDate = testCase.CreatedDate.date();
            String expectedDate = String.valueOf(createdDate.month()).leftPad(2, '0') + '-' + 
                                  String.valueOf(createdDate.day()).leftPad(2, '0') + '-' + 
                                  createdDate.year();
            System.assertEquals(expectedDate, wrapper.caseDate, 'Date formatting incorrect');
        }
    }

    // Test method for when no cases exist
    @IsTest
    static void testGetCasesWithNoRecords() {
        // Delete all cases first
        delete [SELECT Id FROM Case];

        Test.startTest();
        List<LWRCaseReasonDetails.CaseDetailWrapper> results = LWRCaseReasonDetails.getCases();
        Test.stopTest();

        System.assertEquals(0, results.size(), 'Should return empty list when no cases exist');
    }
    
   
}