public without sharing class WishlistController {
    
    Private static final string WEBSTOREID = system.label.WS_WebStoreID;
    
    @AuraEnabled
    public static List<Wishlist> getAllWishlists(string effectiveAccountId, string currentUserId) {
        return [SELECT Id, Name FROM Wishlist 
                WHERE WebStoreId  =: WEBSTOREID
                AND AccountId =: effectiveAccountId
                AND OwnerId =:currentUserId
               ];
    }
    //A private method to create wishlist using connectApi's
    private static string createNewWishlist( String effectiveAccountId, String currentUserId, String wishlistName) {
        ConnectApi.WishlistInput wishInput = new ConnectApi.WishlistInput();
        wishInput.name = wishlistName;
        ConnectApi.Wishlist createWish = ConnectApi.CommerceWishlist.createWishlist(WEBSTOREID,effectiveAccountId, wishInput);
        system.debug('@@'+createWish);
        String wishlistId = createWish.summary.id;
    	System.debug('Wishlist Created with Id: ' + wishlistId);
    	return wishlistId;	
    }
    //A private method to ADD items to wishlist using connectApi's
    private static ConnectApi.WishlistItem addWishlistItem( String effectiveAccountId, String existingWishlistId, string ProdId) {
        ConnectApi.WishlistItemInput wishlistItemInput = new ConnectApi.WishlistItemInput();
        wishlistItemInput.productId = ProdId;
        
        ConnectApi.WishlistItem addProductToWishlist = ConnectApi.CommerceWishlist.addItemToWishlist(WEBSTOREID, effectiveAccountId, existingWishlistId, wishlistItemInput);
        
        system.debug('@@'+addProductToWishlist);
        return addProductToWishlist;
    }
    
    
    @AuraEnabled
    Public static ConnectApi.WishlistItem createAndAddWishList(WishlistWrapper wrapper){
        String effectiveAccountId = wrapper.effectiveAccountId;
        String currentUserId = wrapper.currentUserId;
        String wishlistName = wrapper.wishlistName;
        String existingWishlistId = wrapper.existingWishlistId;
        String productId = wrapper.productId;
        String typeOfWishlist = wrapper.typeOfWishlist;
        if(typeOfWishlist == 'new'){
            string newlyCreatedWishlistId = createNewWishlist(effectiveAccountId, currentUserId,wishlistName);
            system.debug('@@newlyCreatedWishlistId=>'+newlyCreatedWishlistId);
            if(newlyCreatedWishlistId != null){
              return addWishlistItem(effectiveAccountId, newlyCreatedWishlistId,productId);
            }
        }
        return null;
    }
    
    @AuraEnabled
    public static string updateWishlist(WishlistWrapper wrapper){
        String effectiveAccountId = wrapper.effectiveAccountId;
        String currentUserId = wrapper.currentUserId;
        String wishlistName = wrapper.wishlistName;
        String existingWishlistId = wrapper.existingWishlistId;
        String productId = wrapper.productId;
        String typeOfWishlist = wrapper.typeOfWishlist;
        
        if(typeOfWishlist == 'existing'){
            ConnectApi.WishlistItemInput wishlistItemInput = new ConnectApi.WishlistItemInput();
            wishlistItemInput.productId = productId;
            
            ConnectApi.WishlistItem addProductToWishlist = ConnectApi.CommerceWishlist.addItemToWishlist(WEBSTOREID, effectiveAccountId, existingWishlistId, wishlistItemInput);
            string listItemId = addProductToWishlist.wishlistItemId;
            system.debug('@@'+addProductToWishlist);
            return listItemId;
        }
        return null;
    }
    
    
    
    
    
    //DEVELOPMENT IN PROGRESS
    public static List<ConnectApi.Wishlist> getMultipleWishlists(
        String webstoreId,
        String effectiveAccountId,
        List<String> wishlistIds,
        String productFields,
        ConnectApi.WishlistItemSortOrder sortItemsBy
    ) {
        
        
        List<ConnectApi.Wishlist> wishlists = new List<ConnectApi.Wishlist>();
        
        for (String wishlistId : wishlistIds) {
            // Fetch each wishlist
            ConnectApi.Wishlist wishlist = ConnectApi.CommerceWishlist.getWishlist(
                webstoreId,
                effectiveAccountId,
                wishlistId,
                productFields,
                sortItemsBy
            );
            wishlists.add(wishlist);
        }
        
        return wishlists;
        
    }
    
    
    
}