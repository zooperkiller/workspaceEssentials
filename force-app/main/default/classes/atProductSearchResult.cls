public without sharing class atProductSearchResult {
    
    @AuraEnabled
    public static ConnectApi.ProductSearchResults getProductDetailResult ( string effectiveAccountId,string categId){
        
        //string webstoreId = atProductSearchResult.getWebStore();
        string webstoreId = system.label.WS_WebStoreID;
        system.debug('@@'+webstoreId);
        ConnectApi.ProductSearchInput productSearchInput = new ConnectApi.ProductSearchInput();
        productSearchInput.categoryId =categId;
        ConnectApi.ProductSearchResults result = ConnectApi.CommerceSearch.searchProducts(webstoreId, effectiveAccountId, productSearchInput);
        
        system.debug('@@'+JSON.serialize(result));
        system.debug('@@'+result.productsPage.products);
        
        return result;
    }
    
    @AuraEnabled
    public static String checkWebCartAvailable(String currentUserId, String currentBuyerAccount, String prodId) {
        // Query for the first active cart (optimized with LIMIT 1)
        WebCart activeCart = [
            SELECT Id, Name, Status, WebStoreId, AccountId, CreatedById
            FROM WebCart
            WHERE CreatedById = :currentUserId
            AND AccountId = :currentBuyerAccount
            AND Status = 'Active'
            AND WebStoreId =: system.label.WS_WebStoreID
            LIMIT 1
        ];
        
        // Determine cart details
        Boolean cartStatus = (activeCart != null);
        String availableCartId = cartStatus ? activeCart.Id : null;
        
        // Call the method to delete or create the cart and return the cart ID or null
        return getOrCreateCartId(
            cartStatus,
            availableCartId,
            currentBuyerAccount,
            prodId
        );
    }
    
    // Handles deleting or creating an active cart and returns the cart ID or null
    @AuraEnabled
    public static String getOrCreateCartId(Boolean cartStatus, String availableCartId, String currentBuyerAccount, String prodId) {
        // Fetch the web store ID
        string webstoreId = system.label.WS_WebStoreID;
        if (cartStatus) {
            System.debug('Active Cart Found: ' + availableCartId);
            
            // Add the product to the existing cart
            addItemToCart(webstoreId, currentBuyerAccount, availableCartId, prodId);
            
            System.debug('Product added to active cart.');
            return availableCartId; // Return the ID of the active cart
        } else {
            System.debug('No Active Cart Found. Creating a new one.');
            
            // Create a new cart
            ConnectApi.CartInput cartInput = new ConnectApi.CartInput();
            cartInput.effectiveAccountId = currentBuyerAccount;
            ConnectApi.CartSummary newCart = ConnectApi.CommerceCart.createCart(webstoreId, cartInput);
            
            if (newCart != null) {
                System.debug('New Cart Created: ' + newCart.cartId);
                
                // Add the product to the newly created cart
                addItemToCart(webstoreId, currentBuyerAccount, newCart.cartId, prodId);
                
                System.debug('Product added to new cart.');
                return newCart.cartId; // Return the ID of the newly created cart
            } else {
                System.debug('Failed to create a new cart.');
                return null; // Return null if cart creation failed
            }
        }
    }
    
    // Helper method to add an item to the cart
    private static void addItemToCart(String webstoreId, String accountId, String cartId, String productId) {
        ConnectApi.CartItemInput cartItemInput = new ConnectApi.CartItemInput();
        cartItemInput.productId = productId;
        cartItemInput.quantity = '1';
        cartItemInput.type = ConnectApi.CartItemType.Product;
        
        // Add item to cart
        ConnectApi.CommerceCart.addItemToCart(webstoreId, accountId, cartId, cartItemInput);
    }
    
    
    
}