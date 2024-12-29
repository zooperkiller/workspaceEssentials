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
        
        // WebCart cart = [SELECT Id FROM WebCart ORDER BY CreatedDate desc];
        // system.debug('@@cart::'+cart);
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
    
    @AuraEnabled
    public static cartDetailWrapper checkWebCartAvailable(String currentUserId, String currentBuyerAccount) {
        // Initialize the wrapper object
        cartDetailWrapper cartWrap = new cartDetailWrapper();
        cartWrap.cartStatus = false; // Default to no active cart found
        cartWrap.availableCartId = null; // Default to no cart ID
        
        // Query for active carts
        List<WebCart> cartList = [
            SELECT Id, Name, Status, WebStoreId, AccountId, CreatedById
            FROM WebCart
            WHERE CreatedById = :currentUserId
            AND AccountId = :currentBuyerAccount
            AND Status = 'Active'
            AND WebStoreId = :atProductSearchResult.getWebStore()
        ];
        
        // Process the query results
        if (!cartList.isEmpty()) {
            WebCart activeCart = cartList[0]; // Assuming there's only one active cart
            cartWrap.cartStatus = true; // Active cart found
            cartWrap.availableCartId = activeCart.Id; // Set the cart ID
        }
        
        System.debug('@@ Cart Wrapper Details: ' + cartWrap);
        String cartDetailsMessage = deleteActiveCart(cartWrap);
    	System.debug('Cart Details Message: ' + cartDetailsMessage);
        return cartWrap; // Return the wrapper with details
    }
    
    // Wrapper class to return the response
    public class cartDetailWrapper {
        @AuraEnabled
        public Boolean cartStatus { get; set; } // Indicates if a cart is available
        @AuraEnabled
        public String availableCartId { get; set; } // ID of the available cart
    }
    
    //Assumption as to the active cart can be deleted. 
    @AuraEnabled
    public static String deleteActiveCart(cartDetailWrapper cartWrapper){
        
        if (cartWrapper.cartStatus) {
            // If an active cart exists
            System.debug('Active Cart Found: ' + cartWrapper.availableCartId);
            string webstoreId=atProductSearchResult.getWebStore();
            string effectiveAccountId = '001WU00000YN1UUYA1';
            string activeCartOrId = cartWrapper.availableCartId;
            //commenting to update the cart item. 
            //ConnectApi.CommerceCart.deleteCart(webstoreId, effectiveAccountId, activeCartOrId);
            return 'Cart is Active. Cart ID: ' + cartWrapper.availableCartId;
        } else {
            // If no active cart exists
            // If no active cart exists
            System.debug('No Active Cart Found.');
            return 'No Active Cart Found.';
        }
    }
    
    
    
    
}