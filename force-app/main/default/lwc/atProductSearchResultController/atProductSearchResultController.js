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
    @track name;
    productDetail = [];

    @wire(getRecord, { recordId: USER_ID, fields: [NAME_FIELD,USER_ACCOUNT_ID] })
         
    wireuser({ error, data })
    {
        if(error) 
        {
            this.error = error ; 
        } 
        else if (data) 
        {
            this.name = data.fields.Name.value;
            this.effectiveAccountId = data.fields.AccountId.value;
            console.log('name:',this.name, 'accountId:',this.effectiveAccountId);
            console.log('recordId: '+this.recordId);
            if(this.effectiveAccountId){
                getProductDetailResult({ effectiveAccountId: this.effectiveAccountId , categId: this.recordId })
                
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
                })
            }
            
        }
    }
    
}