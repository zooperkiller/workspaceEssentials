import { LightningElement,api, track,wire } from 'lwc';
import getProductDetailResult from '@salesforce/apex/atProductSearchResult.getProductDetailResult';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import USER_ACCOUNT_ID from '@salesforce/schema/User.AccountId';
import NAME_FIELD from '@salesforce/schema/User.Name';
export default class AtProductSearchResultController extends LightningElement {


    @api recordId;//stores the category Id 
    @api effectiveAccountId; //stores the current user's account Id 
    @track error;
    @track error2;
    @track name ;
    productDetail = [];
    observer;
    catId;

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
            this.name = data.fields.Name.value;
            this.effectiveAccountId = data.fields.AccountId.value;
            console.log('name:',this.name, 'accountId:',this.effectiveAccountId);
            if(this.effectiveAccountId){
                console.log('Account ID:',this.effectiveAccountId ,'++','Category ID:',this.catId);
                
            }
            
        }
    }

    
}