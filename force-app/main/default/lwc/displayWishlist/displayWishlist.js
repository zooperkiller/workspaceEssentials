import { LightningElement,track,wire, api } from 'lwc';
import getMultipleWishlists from '@salesforce/apex/WishlistController.getMultipleWishlists';

import getSummary from '@salesforce/apex/WishlistController.getSummary';

export default class DisplayWishlist extends LightningElement {


    // @track wishlistData = []; // Array to hold all wishlists
    // @track activeTabId = ''; // ID of the active tab
    // @track isLoading = false; // Loading state

    @track wishlists = [];
    connectedCallback() {
        getSummary({webstoreId:'0ZEWU000001cxGD4AY',effectiveAccountId: '001WU00000YN1UUYA1',includeDisplayedList:true})
        .then(result=>{
            console.log('@@result',result);
        })
        .catch(error=>{
            console.log('@@result error',error);
        })
       

        this.initializeWishlists();
    }

    initializeWishlists() {

        getMultipleWishlists({currentUserId:'005WU000008QuWbYAK',effectiveAccountId:'001WU00000YN1UUYA1', productFields:null})
        .then(result=>{
            console.log('@@result wish',result);
            this.wishlists = result.map(response => ({
                name: response.summary.name,
                id: response.summary.id,
                products: response.page.items.map(item => ({
                    productId: item.productSummary.productId,
                    name: item.productSummary.name,
                    sku: item.productSummary.sku,
                    imageUrl: item.productSummary.thumbnailImage.url,
                    salesPrice: item.salesPrice
                }))
            }))  
        })

        .catch(error=>{
            console.log('@@result error',error);
        })
    
}

get isDataAvailable() {
    return this.wishlists && this.wishlists.length > 0;
}

    // async fetchWishlists() {
    //     this.isLoading = true;
    //     try {
    //         const wishlistItems = await getMultipleWishlists({currentUserId:'005WU000008QuWbYAK',effectiveAccountId:'001WU00000YN1UUYA1', productFields:null});
    //         console.log('@@ wishlistItems: ',wishlistItems);
    //         // Group data by wishlistId
    //         const groupedWishlists = wishlistItems.reduce((acc, item) => {
    //             if (!acc[item.id]) {
    //                 acc[item.id] = { 
    //                     wishlistName: item.name, 
    //                     products: [] 
    //                 };
    //             }
    //             acc[item.id].products.push({
    //                 productId: item.productId,
    //                 productName: item.productName,
    //                 sku: item.sku,
    //                 salesPrice: item.salesPrice,
    //                 imageURL: item.imageURL
    //             });
    //             return acc;
    //         }, {});
    //         console.log('Processed groupedWishlists:', groupedWishlists);
    //         // Convert grouped data to an array for iteration
    //         this.wishlistData = Object.keys(groupedWishlists).map(key => ({
    //             wishlistId: key,
    //             wishlistName: groupedWishlists[key].wishlistName,
    //             products: groupedWishlists[key].products,
    //             isActive: false // Default inactive state for tabs
    //         }));
    //         console.log('Processed wishlistData:', this.wishlistData);
    //         // Set the first tab as active by default
    //         if (this.wishlistData.length > 0) {
    //             this.activeTabId = this.wishlistData[0].wishlistId;
    //             this.updateActiveTab(this.activeTabId);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching wishlists:', error);
    //     } finally {
    //         this.isLoading = false;
    //     }
    // }

    // handleTabChange(event) {
    //     const selectedTabId = event.target.value;
    //     this.activeTabId = selectedTabId;
    //     this.updateActiveTab(selectedTabId);
    // }

    // updateActiveTab(activeTabId) {
    //     // Update the isActive property for each wishlist
    //     this.wishlistData = this.wishlistData.map(wishlist => ({
    //         ...wishlist,
    //         isActive: wishlist.wishlistId === activeTabId
    //     }));
    // }
}
