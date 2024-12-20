public class productDetailsWrapper{
    
    // Class for Category Details
    public class CategoryDetails {
        public String categoryId { get; set; }
        public String description { get; set; }
        public String name { get; set; }
        public Integer productCount { get; set; }
        
        public CategoryDetails(String categoryId, String description, String name, Integer productCount) {
            this.categoryId = categoryId;
            this.description = description;
            this.name = name;
            this.productCount = productCount;
        }
    }
    
    // Class for Product Details
    public class ProductDetails {
        public String productId { get; set; }
        public String name { get; set; }
        public String description { get; set; }
        public String stockKeepingUnit { get; set; }
        public String productCode { get; set; }
        public String imageUrl { get; set; }
        
        public ProductDetails(String productId, String name, String description, String stockKeepingUnit, String productCode, String imageUrl) {
            this.productId = productId;
            this.name = name;
            this.description = description;
            this.stockKeepingUnit = stockKeepingUnit;
            this.productCode = productCode;
            this.imageUrl = imageUrl;
        }
    }
    
    // Wrapper properties
    public CategoryDetails categoryDetails { get; set; }
    public List<ProductDetails> products { get; set; }
    
    // Constructor for Wrapper
    public productDetailsWrapper(CategoryDetails categoryDetails, List<ProductDetails> products) {
        this.categoryDetails = categoryDetails;
        this.products = products;
    }
    
    
    
    
}