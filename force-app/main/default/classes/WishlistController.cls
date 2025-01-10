public without sharing class WishlistController {
    
    // Public method to create or update a wishlist
    // This is the initial method to call,check && act.
    @AuraEnabled
    public static void createOrUpdateWishlist(String effectiveAccountId, String currentUserId, String wishlistName ,String existingWishlistId, String ProdId) {
        string webstoreId = system.label.WS_WebStoreID;
        // Get existing wishlists
        List<Wishlist> wishlists = getAllWishlists(effectiveAccountId, currentUserId);
        
        if (wishlists.size() > 0) {
            ConnectApi.WishlistItemInput wishlistItemInput = new ConnectApi.WishlistItemInput();
            wishlistItemInput.productId = ProdId;
            
            ConnectApi.WishlistItem addProductToWishlist = ConnectApi.CommerceWishlist.addItemToWishlist(webstoreId, effectiveAccountId, existingWishlistId, wishlistItemInput);
        } else {
            // Create a new wishlist
            createNewWishlist(effectiveAccountId, currentUserId, wishlistName);
        }
    }
    
    @AuraEnabled
    public static List<Wishlist> getAllWishlists(string effectiveAccountId, string currentUserId) {
        return [SELECT Id, Name FROM Wishlist 
                WHERE WebStoreId  = '0ZEWU000001cxGD4AY'
                AND AccountId =: effectiveAccountId
                AND OwnerId =:currentUserId
               ];
    }
    //A private method to create wishlist using connectApi's
    private static void createNewWishlist(String effectiveAccountId, String currentUserId, String wishlistName) {
        ConnectApi.WishlistInput wishInput = new ConnectApi.WishlistInput();
        wishInput.name = wishlistName;
        ConnectApi.Wishlist createWish = ConnectApi.CommerceWishlist.createWishlist('0ZEWU000001cxGD4AY','001WU00000YN1UUYA1' ,wishInput);
        system.debug('@@'+createWish);
        
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