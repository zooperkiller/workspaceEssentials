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
}