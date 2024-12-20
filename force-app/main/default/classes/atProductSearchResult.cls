public without sharing class atProductSearchResult {

    private static Id getWebStore() {
        WebStore ws = [SELECT Id, Name FROM WebStore WHERE Name = 'Workspace Essentials' LIMIT 1];
        return ws.Id;
    }
    
    @AuraEnabled
    public static ConnectApi.ProductSearchResults getProductDetailResult ( string effectiveAccountId,string categId){
       
        string webstoreId = atProductSearchResult.getWebStore();
        system.debug('@@'+webstoreId);
        ConnectApi.ProductSearchInput productSearchInput = new ConnectApi.ProductSearchInput();
        productSearchInput.categoryId =categId;
        ConnectApi.ProductSearchResults result = ConnectApi.CommerceSearch.searchProducts(webstoreId, effectiveAccountId, productSearchInput);
        
        system.debug('@@'+JSON.serialize(result));
        system.debug('@@'+result.productsPage.products);
        
        return result;
    }
}