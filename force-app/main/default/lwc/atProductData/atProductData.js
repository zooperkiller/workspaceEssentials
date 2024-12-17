import { LightningElement, wire,api,track } from 'lwc';
import getWebStore from '@salesforce/apex/atProductData_Apex.getWebStore';
import getFeaturedProducts from '@salesforce/apex/atProductData_Apex.getFeaturedProducts';

export default class ProductTile extends LightningElement {
   @track products = [];
   @track productImages = [];
   @track productMedia =[];
    
    recordId;
    observer;
    webStoreIdFromApex;

    connectedCallback(){
         // Initial ID extraction
         this.extractIdFromUrl();

         // Set up a MutationObserver to monitor changes
        this.observer = new MutationObserver(() => {
            this.extractIdFromUrl(); // Re-extract ID when the URL changes
        });

        // Observe the body or specific container where URL path changes
        this.observer.observe(document.body, { childList: true, subtree: true });
       
    }
    disconnectedCallback() {
        // Disconnect the observer to prevent memory leaks
        if (this.observer) {
            this.observer.disconnect();
        }
    }
    extractIdFromUrl() {
        const pathname = window.location.pathname;
        const segments = pathname.split('/');
        this.recordId = segments[segments.length - 1]; // Extract ID dynamically
        console.log('Extracted ID:', this.recordId);

        if (this.recordId ?? false)
            {
                console.log('Received ID:',this.recordId);
                getWebStore({})
                    .then(data => {
                        console.log('data',data);
                        this.webStoreIdFromApex = data;
                        console.log('webStoreIdFromApex-1',this.webStoreIdFromApex);
                        console.log('webStoreIdFromApexType-1:',typeof(this.webStoreIdFromApex));
                    })
                    .catch(error =>{
                        console.log('error-webstore-1:',error);
                    })
                   
                    if(this.webStoreIdFromApex){
                        getFeaturedProducts({webStoreId:this.webStoreIdFromApex , catgId:this.recordId})
                        .then(output =>{
                            console.log('output-2:',output);
                            this.productMedia = output;
                        })
                        .catch(error => {
                            console.log('error-featuredproducts-2:',error);
                        })
                    }

                    

            }
    }

    get formattedProductMedias() {
        return this.productMedia.map(item => ({
            url: item.product.defaultImage.url,
            name:item.product.fields.Name,
            description:item.product.fields.Description,
            sku:item.product.fields.StockKeepingUnit,
            recId:item.product.Id
        }))
    }
            
}