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
    
    @AuraEnabled
    public static ConnectApi.CartItem getCartDetails( string effectiveAccountId, string prodId){
        
        WebCart cart = [SELECT Id FROM WebCart ORDER BY CreatedDate desc];
        system.debug('@@cart::'+cart);
        ConnectApi.CartItem addCart;
        string webstoreId = atProductSearchResult.getWebStore();
        
            ConnectApi.CartInput inp = new ConnectApi.CartInput();
            inp.effectiveAccountId = effectiveAccountId;
            ConnectApi.CartSummary crcart = ConnectApi.CommerceCart.createCart(webstoreId, inp);
            system.debug('@@'+crcart);
            
            
            string activeCartOrId = crcart.cartId;
            ConnectApi.CartItemInput addCartInput = new ConnectApi.CartItemInput();
            addCartInput.productId = prodId;
            addCartInput.quantity = '1';
            addCartInput.type = ConnectApi.CartItemType.Product;
            addCart = ConnectApi.CommerceCart.addItemToCart(webstoreId, effectiveAccountId,activeCartOrId , addCartInput);
            system.debug('@@'+addCart);  
        
        return addCart;
    }
}