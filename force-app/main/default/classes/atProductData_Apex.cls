public without sharing class atProductData_Apex {
    @AuraEnabled(cacheable=true)
    public static Id getWebStore() {
        WebStore ws = [SELECT Id, Name FROM WebStore WHERE Name = 'Workspace Essentials' LIMIT 1];
        return ws.Id;
    }
    
    //SUSTAINABLILTY
    // get the featured products and associated default images
  @AuraEnabled(cacheable=true)
  public static List<featuredProductWrapper> getFeaturedProducts(String webStoreId, String catgId) {

    // initialize a list of the wrapper class type for storing return data
    // NOTE: THIS IS ONLY NECESSARY BECAUSE AURA ENABLED METHODS DON'T SUPPORT THE ConnectApi.ProductOverview RETURN TYPE
    List<featuredProductWrapper> productData = new List<featuredProductWrapper>();

    List<ProductCategoryProduct> featuredProducts = [
        SELECT Id, ProductId 
        FROM ProductCategoryProduct 
        WHERE ProductCategoryId = :catgId AND Product.StockKeepingUnit LIKE 'WS%'
    ];
      System.debug('@@featuredProducts:'+featuredProducts);
     // get all of the featured products that are currently active
     List<Product2> pp2 = [
       SELECT Id
       FROM Product2
       WHERE IsActive = TRUE AND StockKeepingUnit LIKE 'WS%'
     ];
	System.debug('@@pp2:'+pp2);
    // if there are featured products
    if (featuredProducts.size() > 0) {
      List<String> productIds = new List<String>();

      // get the product2 object ids
      for (ProductCategoryProduct featuredProduct: featuredProducts) {
        String prodId = featuredProduct.ProductId;
        productIds.add(prodId);
      }
	System.debug('@@productIds:'+productIds);
      // store the Product2 object fields to be retrieved via ConnectApi
      List<String> productFields = new List<String>{'Name', 'Description', 'StockKeepingUnit'};

      // get product data using ConnectApi
      ConnectApi.ProductOverviewCollection productObjectdata = ConnectApi.CommerceCatalog.getProducts(webStoreId, null, productIds, null, productFields, false);

      // get the ConnectApi.ProductOverview objects from the collection
      for (ConnectApi.ProductOverview product: productObjectdata.products) {
        productData.add(new FeaturedProductWrapper(product));
      }
  }

    system.debug('@@MEDIA:'+productData);
  return productData;
}

  // the wrapper class for returning featured product data
  public class featuredProductWrapper {
    @AuraEnabled
    public ConnectApi.ProductOverview product { get; set; }

    public featuredProductWrapper(ConnectApi.ProductOverview product) {
      this.product = product;
    }
  }
}