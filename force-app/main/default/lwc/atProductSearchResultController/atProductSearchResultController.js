import { LightningElement,api, track,wire } from 'lwc';
import getProductDetailResult from '@salesforce/apex/atProductSearchResult.getProductDetailResult';
import getCartDetails from '@salesforce/apex/atProductSearchResult.getCartDetails';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import USER_ACCOUNT_ID from '@salesforce/schema/User.AccountId';
import NAME_FIELD from '@salesforce/schema/User.Name';
import checkWebCartAvailable from '@salesforce/apex/atProductSearchResult.checkWebCartAvailable';
export default class AtProductSearchResultController extends LightningElement {


    @api recordId;//stores the category Id 
    @api effectiveAccountId; //stores the current user's account Id 
    @track error;
    @track name ;
    productDetail = [];
    observer;
    catId;
    addToCartProdId;
    currentUserId = USER_ID;

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
    this.catId = segments[segments.length - 1]; // Extract ID dynamically
    console.log('Extracted ID:', this.catId);
   }


    @wire(getRecord, { recordId: USER_ID, fields: [NAME_FIELD,USER_ACCOUNT_ID] })
         
    wireuser({ error, data })
    {
        if(error) 
        {
            this.error = error ; 
        } 
        else if (data) 
        {
            console.log('1st wire result: '+data);
            console.log('1st wire result: '+JSON.stringify(data));
            console.log('1st current user id:',this.currentUserId);
            this.name = data.fields.Name.value;
            this.effectiveAccountId = data.fields.AccountId.value;
            console.log('name:',this.name, 'accountId:',this.effectiveAccountId);
            if(this.effectiveAccountId){
                console.log('Account ID:',this.effectiveAccountId ,'++','Category ID:',this.catId);
                getProductDetailResult({ effectiveAccountId: this.effectiveAccountId , categId: this.catId })
                
                .then(result=>{
                    
                    console.log('result: '+result); 
                    console.log('result: '+JSON.stringify(result)); 
                    this.productDetail = result;  
                    console.log('Detail result: '+this.productDetail);
                    console.log('@@',result.productsPage.products);
                    this.productDetail = result.productsPage.products;  
                    
                })
                .catch(error=>{
                    console.log('error: '+error);
                    console.log('error: '+JSON.stringify(error));
                })
            }
            
        }
    }

    //handles the add to cart button 
    handleAddToCart(event){
        console.log('@@inside add to cart');
        let prodId = event.target.id;
        console.log('@@PRODUCT ID:', prodId);
        this.addToCartProdId = prodId.split('-')[0];
        console.log('@@PRODUCT ID:', this.addToCartProdId);

        checkWebCartAvailable({currentUserId:this.currentUserId,currentBuyerAccount:this.effectiveAccountId})
        .then(res=>{
            console.log('@@res',res);
        })
        .catch(err=>{
            console.log('@@err',err);
        })

        // getCartDetails({effectiveAccountId : this.effectiveAccountId , prodId: this.addToCartProdId})
        // .then (result =>{
        //     console.log('@@AddToCart',result);x
        //     console.log('@@AddToCart',JSON.stringify(result));
        // })
        // .catch(error =>{
        //     console.log('@@AddToCartError',error);
        //     console.log('@@AddToCartError',JSON.stringify(error));
        // })
    }

}