/*
@Author: Anish Thakurta
@Date: 05 January 2025
@Description:   This class provides utility methods for product search and cart management in a Salesforce B2B Commerce setup. 
                It leverages ConnectApi to interact with Salesforce Commerce features like searching for products and managing carts.
@Methods & Details: 
1. getProductDetailResult
        Purpose: Fetches product search results for a specific category ID and effective account in a given web store.
        Parameters:
        effectiveAccountId (String): The ID of the account for which the search is performed.
        categId (String): The category ID used to filter the product search.
        Returns: ConnectApi.ProductSearchResults containing the list of products matching the search criteria.
2. checkWebCartAvailable
        Purpose: Checks if an active cart exists for a user and account. If no cart exists, creates one and adds a product to it.
        Parameters:
        currentUserId (String): The ID of the currently logged-in user.
        currentBuyerAccount (String): The account ID of the buyer.
        prodId (String): The ID of the product to be added to the cart.
        Returns: String containing the cart ID if an active cart is found or created, otherwise null.
3. getOrCreateCartId
        Purpose: Deletes or creates an active cart and returns the cart ID.
        Parameters:
        cartStatus (Boolean): Indicates whether an active cart exists.
        availableCartId (String): The ID of the existing active cart, if any.
        currentBuyerAccount (String): The account ID of the buyer.
        prodId (String): The ID of the product to be added to the cart.
        Returns: String containing the cart ID or null if no cart is created.
4. addItemToCart (Helper Method)
        Purpose: Adds a product to a specified cart.
        Parameters:
        webstoreId (String): The ID of the web store.
        accountId (String): The account ID of the buyer.
        cartId (String): The ID of the cart to which the product is added.
        productId (String): The ID of the product to be added.
        Returns: void.
*/ 

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
         string webstoreId = system.label.WS_WebStoreID;
        // Query for the first active cart (optimized with LIMIT 1)
        List<WebCart> activeCartList = [
            SELECT Id, Name, Status, WebStoreId, AccountId, CreatedById
            FROM WebCart
            WHERE CreatedById = :currentUserId
            AND AccountId = :currentBuyerAccount
            AND Status = 'Active'
            AND WebStoreId =: webstoreId
            LIMIT 1
        ];
        WebCart activeCart = activeCartList.isEmpty() ? null : activeCartList[0];
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