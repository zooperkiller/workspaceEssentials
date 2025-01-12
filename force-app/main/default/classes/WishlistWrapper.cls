public class WishlistWrapper {

    @AuraEnabled
    public String effectiveAccountId { get; set; }
    @AuraEnabled
    public String currentUserId { get; set; }
    @AuraEnabled
    public String wishlistName { get; set; }
    @AuraEnabled
    public String existingWishlistId { get; set; }
    @AuraEnabled
    public String productId { get; set; }
    @AuraEnabled
    public String typeOfWishlist { get; set; }
}