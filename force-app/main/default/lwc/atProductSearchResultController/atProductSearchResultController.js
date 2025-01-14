/*
@Author:Anish Thakurta
@description:   This is an LWC which helps to get the product details from category 
                 and display it in a grid.
                 Also adds the product to cart.
                 On successful addition of cart , a toast message is displayed.
@date:05 January 2022
@method: 



*/


import { LightningElement,api, track,wire } from 'lwc';
import getProductDetailResult from '@salesforce/apex/atProductSearchResult.getProductDetailResult';
import checkWebCartAvailable from '@salesforce/apex/atProductSearchResult.checkWebCartAvailable';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import USER_ACCOUNT_ID from '@salesforce/schema/User.AccountId';
import NAME_FIELD from '@salesforce/schema/User.Name';
import getAllWishlists from '@salesforce/apex/WishlistController.getAllWishlists';
import updateWishlist from '@salesforce/apex/WishlistController.updateWishlist';
import getMultipleWishlists from '@salesforce/apex/WishlistController.getMultipleWishlists';



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
        console.log('@@PRODUCT NAME:', event.currentTarget.dataset.name);
        let prodName = event.currentTarget.dataset.name;
        let prodId = event.target.id;
        console.log('@@PRODUCT ID:', prodId);
        this.addToCartProdId = prodId.split('-')[0];
        console.log('@@PRODUCT ID:', this.addToCartProdId);

        checkWebCartAvailable({currentUserId:this.currentUserId,currentBuyerAccount:this.effectiveAccountId,prodId:this.addToCartProdId})
        .then(res=>{
            console.log('@@res',res);
            this.template.querySelector('c-at-toast-message-utility').showToast('success', prodName + ' added to cart.');
            
            
        })
        .catch(err=>{
            console.log('@@err',err);
            this.template.querySelector('c-at-toast-message-utility').showToast('error', err);
            
        })

        
    }

    handlePDPPage(event){
        console.log('@@Inside Handle PDP Page');
        console.log('@@PDP', event.currentTarget.dataset.id);
        let prodDetail = event.currentTarget.dataset.id;
        console.log('@@PDP ID:', prodDetail);
        
        
       
    }

    @track wishlists = []; // Store all wishlists for the dropdown
    @track selectedWishlistId = ''; // Selected wishlist ID
    @track newWishlistName = ''; // New wishlist name
    @track isModalOpen = false; // Modal visibility
    @track isLoading = false;
    @track isWishlistAvailable = false;
    @track selectedOption = 'new'; // Default option: 'new' or 'existing'
    @track prodWish;


    handleAddToWishlist(event){
        console.log('@@Inside Handle Wishlist Page');
        this.prodWish = event.currentTarget.dataset.id;
        console.log('@@Product Wish ID:', this.prodWish);
        this.isModalOpen = true;
        this.fetchAllWishlists();
        
            
    }

    // Options for the radio group
    wishlistOptions = [
        { label: 'Create New Wishlist', value: 'new' },
        { label: 'Add to Existing Wishlist', value: 'existing' }
    ];

    get isNewWishlistSelected() {
        return this.selectedOption === 'new';
    }

    get isExistingWishlistSelected() {
        return this.selectedOption === 'existing';
    }

    handleOptionChange(event) {
        this.selectedOption = event.detail.value;
    }

    fetchAllWishlists(){
        
        getAllWishlists({currentUserId:this.currentUserId,effectiveAccountId:this.effectiveAccountId})
        .then(result=>{
            console.log('@@result wish',result);
            if(result.length > 0) {
                this.isWishlistAvailable = true;
                this.wishlists = result.map(wishlist => ({
                    label: wishlist.Name,
                    value: wishlist.Id,
                }));
            }
            else {
                this.isWishlistAvailable = false;
            }
            
        })
        .catch(err=>{
            console.log('@@err-wish',err);
        })
    }

    handleWishlistSelection(event) {
        this.selectedWishlistId = event.target.value;
        console.log('@@WISHSELECTION-wish',this.selectedWishlistId);
    }

    handleNewWishlistNameChange(event) {
        this.newWishlistName = event.target.value;
        console.log('@@WISHNAME-wish',this.newWishlistName);
    }

    handleSave(){

        if (this.selectedOption === 'new' && this.newWishlistName) {
            console.log('Creating a new wishlist:', this.newWishlistName);
            // Call Apex method to create a new wishlist and add the product to the wishlist
            this.wishlistCreation();
        } else if (this.selectedOption === 'existing' && this.selectedWishlistId) {
            console.log('Adding to existing wishlist:', this.selectedWishlistId);
            // Call Apex method to update the existing wishlist
            this.wishlistUpdation();
        } else {
            console.error('Please select an option and provide the necessary details.');
        }
    }

    //method for creation and adding product to wishlist.
    wishlistCreation(){
        const wrapperCreateAndAdd = {
            effectiveAccountId: this.effectiveAccountId,
            currentUserId: this.currentUserId,
            wishlistName: this.newWishlistName,
            existingWishlistId: null,
            productId: this.prodWish,
            typeOfWishlist:'new'
        };
        console.log('@@wrapperCreateAndAdd=>>',wrapperCreateAndAdd);
        createAndAddWishList({wrapper: wrapperCreateAndAdd})
        .then(finalRes=>{
            console.log('@@finalRes=>>',finalRes);


        })
        .catch(finalErr=>{
            console.log('@@finalErr=>>',finalErr);
        })
    }

    //method for updating wishlist.
    wishlistUpdation(){
        const wrapperUpdate = {
            effectiveAccountId: this.effectiveAccountId,
            currentUserId: this.currentUserId,
            wishlistName: null,
            existingWishlistId: this.selectedWishlistId,
            productId: this.prodWish,
            typeOfWishlist:'existing'
        };
        console.log('@@wrapperUpdate=>>',wrapperUpdate);
        updateWishlist({wrapper: wrapperUpdate})
        .then(finalRes=>{
            console.log('@@finalRes=>>',finalRes);
            this.template.querySelector('c-at-toast-message-utility').showToast('success',  finalRes );
        })
        .catch(finalErr=>{
            console.log('@@finalErr=>>',finalErr);
            this.template.querySelector('c-at-toast-message-utility').showToast('error', finalErr);
        })
    }
    handleCloseModal() {
        this.isModalOpen = false;
    }



    //
    handleShowWishlist(){
        console.log('@@inside handleShowWishlist');
        getMultipleWishlists({currentUserId:this.currentUserId,effectiveAccountId:this.effectiveAccountId, productFields:null})
        .then(result=>{
            console.log('@@result wish',result);
        })
        .catch(c=>{
            console.log('@@c',c);
        })
    }
}