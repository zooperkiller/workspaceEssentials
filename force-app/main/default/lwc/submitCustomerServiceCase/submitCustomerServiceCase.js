import { LightningElement,api,track,wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import CASE_OBJECT from '@salesforce/schema/Case';
import BRAND_FIELD from '@salesforce/schema/Case.Brand__c'; // Replace with actual field API name if it's custom

import showCustomMetadata from '@salesforce/apex/LWRCaseReasonDetails.showCustomMetadata'; // Apex method to fetch accounts

export default class SubmitCustomerServiceCase extends LightningElement {

  closeModal() {
    const closeEvent = new CustomEvent('closemodal');
    this.dispatchEvent(closeEvent);
  }

    @track recordIdMap = {}; // To store the recordTypeId based on name
    @track recordTypeOptions = []; // Store the record type options for combobox

   

    // Wire to fetch object info for the Case object
    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
    objectInfo({ error, data }) {
        if (data) {
            const recordTypeInfos = data.recordTypeInfos;
            // Clear the options before adding them to avoid duplicates
            this.recordTypeOptions = [];
            
            // Loop through each record type info to find the recordTypeId based on name
            for (const key in recordTypeInfos) {
                const recordInfo = recordTypeInfos[key];
                const recordName = recordInfo.name;

                // Store the recordTypeId based on the record name
                if (recordName) {
                    this.recordIdMap[recordName] = recordInfo.recordTypeId;
                    // Create options for the dropdown
                    this.recordTypeOptions.push({
                        label: recordName,
                        value: recordInfo.recordTypeId
                    });
                }
            }
            console.log('recordTypeOptions:', this.recordTypeOptions);
        } else if (error) {
            console.log('Error fetching object info:', error);
        }
    }

    @track brandOptions = []; // Store options for the BRAND combobox
    @track selectedBrand = ''; // Track the selected brand

    // Wire to fetch BRAND picklist options from the Case object using the Master Record Type
    @wire(getPicklistValues, { 
        recordTypeId: '$recordIdMap.Master', // Use the Master recordTypeId dynamically
        fieldApiName: BRAND_FIELD 
    })
    brandOptionsWire({ error, data }) {
        if (data) {
            console.log('Brand Values:', data);
            this.brandOptions = data.values.map(option => ({
                label: option.label, // Display the label for the picklist options
                value: option.value // Use the value for the option
            }));
        } else if (error) {
            console.log('Error fetching BRAND picklist options:', error);
        }
    }

    handleCaseBrand(event){
        this.selectedBrand = event.target.value;
        console.log('@@-this.selectedBrand', this.selectedBrand);
    }

    /*SHOW CUSTOMER INQUIRY BASED ON CUSTOM METADATA*/ 
    @track caseRecordTypeOptions = [];
    @track caseReasonOptions = [];
    @track caseSubReasonOptions = [];

    @track selectedCaseRecordType;
    @track selectedCaseReason;
    @track selectedCaseSubReason;

    @track selectedOrderNumber;
    @track selectedQuoteNumber;
    @track selectedPONumber;

    @track selectedSubject;
    @track selectedDescription;

    isCaseReasonVisible = false;
    isCaseSubReasonVisible = false;
    isCaseSubReasonDisabled = true;

    metadata = []; // To store the entire MDT data

    @wire(showCustomMetadata,{})
    wiredRecordData({ error, data }) {
        if (data) {
        this.metadata = data;

                // Extract unique record types
                const recordTypes = new Set();
                data.forEach((item) => {
                    if (item.RecordType1__c) {
                        recordTypes.add(item.RecordType1__c);
                    }
                });

                // Populate Record Type combobox options
                this.caseRecordTypeOptions = Array.from(recordTypes).map((type) => ({
                    label: type,
                    value: type,
                }));
        }
        else if (error) {
            console.error('Error fetching metadata:', error);
        }
    }
            

    handleCaseRecordTypeChange(event) {
        this.selectedCaseRecordType = event.detail.value;

        // Filter metadata for the selected Record Type
        const filteredMetadata = this.metadata.filter(
            (item) => item.RecordType1__c === this.selectedCaseRecordType
        );

        // Populate the Case Reason combobox
        const reasons = new Set();
        filteredMetadata.forEach((item) => {
            if (item.Reason1__c) {
                reasons.add(item.Reason1__c);
            }
        });

        this.caseReasonOptions = Array.from(reasons).map((reason) => ({
            label: reason,
            value: reason,
        }));

        // Show the Case Reason combobox
        this.isCaseReasonVisible = true;
        this.isCaseSubReasonVisible = false; // Hide Sub-Reason until a reason is selected
        this.isCaseSubReasonDisabled = true; // Disable Sub-Reason by default
        this.selectedCaseReason = null; // Reset selections
        this.selectedCaseSubReason = null;

        console.log('@@-selectedCaseRecordType',this.selectedCaseRecordType);
    }

    handleCaseReasonChange(event) {
        this.selectedCaseReason = event.detail.value;

        // Filter metadata for the selected Reason
        const filteredMetadata = this.metadata.filter(
            (item) =>
                item.RecordType1__c === this.selectedCaseRecordType &&
                item.Reason1__c === this.selectedCaseReason
        );

        // Populate the Case Sub-Reason combobox
        const subReasons = new Set();
        filteredMetadata.forEach((item) => {
            if (item.SubReason1__c) {
                subReasons.add(item.SubReason1__c);
            }
        });

        this.caseSubReasonOptions = Array.from(subReasons).map((subReason) => ({
            label: subReason,
            value: subReason,
        }));

        // Show or disable the Sub-Reason combobox
        this.isCaseSubReasonVisible = true;
        this.isCaseSubReasonDisabled = subReasons.size === 0; // Disable if no Sub-Reasons exist
        this.selectedCaseSubReason = null; // Reset selection

        console.log('@@-selectedCaseReason',this.selectedCaseReason);
    }

    handleCaseSubReasonChange(event) {
        this.selectedCaseSubReason = event.detail.value;
        console.log('@@-selectedCaseSubReason',this.selectedCaseSubReason);
    }

    handleOrderNumberChange(event){
        this.selectedOrderNumber = event.detail.value;
        console.log('@@-this.selectedOrderNumber',this.selectedOrderNumber);
        
    }
    handleQuoteNumberChange(event){
        this.selectedQuoteNumber = event.detail.value;
        console.log('@@-this.selectedQuoteNumber',this.selectedQuoteNumber);
    }
    handlePONumberChange(event){
        this.selectedPONumber = event.detail.value;
        console.log('@@-this.selectedPONumber',this.selectedPONumber);
    }
    handleSubjectChange(event){
        this.selectedSubject= event.detail.value;
        console.log('@@-this.selectedSubject',this.selectedSubject);
    }
    handleDescriptionChange(event){
        this.selectedDescription= event.detail.value;
        console.log('@@-this.selectedDescription',this.selectedDescription);
    }

    @track finalCaseCreateData;
    handleCreateCaseSubmission(){
        console.log('@@-Inside Submit Button:');
        // Validate required fields first
        if (!this.validateRequiredFields()) return;

        this.finalCaseCreateData =
        {
            caseRecordType : this.selectedCaseRecordType != ''? this.selectedCaseRecordType : '',
            caseReason : this.selectedCaseReason != ''? this.selectedCaseReason : '',
            caseSubReason : this.selectedCaseSubReason != ''? this.selectedCaseSubReason : '',
            orderNumber : this.selectedOrderNumber != ''? this.selectedOrderNumber : '',
            quoteNumber : this.selectedQuoteNumber != ''? this.selectedQuoteNumber : '',
            poNumber : this.selectedPONumber != ''? this.selectedPONumber : '',
            subject : this.selectedSubject != ''? this.selectedSubject : '',
            description : this.selectedDescription != ''? this.selectedDescription : ''
        };
        console.log('@@-this.finalCaseCreateData',this.finalCaseCreateData);
        console.log('@@-this.finalCaseCreateData',JSON.stringify(this.finalCaseCreateData));
        
    }
    
    validateRequiredFields() {
        const allValid = [
            ...this.template.querySelectorAll('lightning-input, lightning-combobox')
        ].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);
    
        return allValid;
    }
}

    //import { getPicklistValuesByRecordType  } from 'lightning/uiObjectInfoApi';
    // Track if Case Reason and Case Sub Reason should be enabled or disabled
    // @track caseReasonDisabled = true;
    // @track caseSubReasonDisabled = true;
    // @track showCaseSubReason = false; // Track if Case Sub Reason should be displayed

    // controllingPicklist = []; // Store picklist options for Case Reason
    // dependentPicklist = {}; // Store dependent picklist options for Case Sub Reason
    // finalDependentVal = []; // Final dependent picklist values for Case Sub Reason
    // @track selectedRecordType = ''; // Track selected record type
    // Wire to fetch Case Reason and Case Sub Reason picklist values based on selected recordTypeId
    // @wire(getPicklistValuesByRecordType, { 
    //     objectApiName: CASE_OBJECT,
    //     recordTypeId: '$selectedRecordType' // Dynamically bind the selectedRecordType
    // })
    // fetchPicklist({ error, data }) {
    //     if (data && data.picklistFieldValues) {
    //         let optionsValue = [];
    //         data.picklistFieldValues["Case_Reason__c"].values.forEach(optionData => {
    //             if (optionData.value !== "--None--") { // Remove None value from Case Reason
    //                 optionsValue.push({ label: optionData.label, value: optionData.value });
    //             }
    //         });

    //         this.controllingPicklist = optionsValue; // Set controlling picklist values

    //         // Reset dependent picklist values and hide Case Sub Reason until valid data is available
    //         this.finalDependentVal = [];
    //         this.caseSubReasonDisabled = true; // Case Sub Reason should be disabled initially
    //         this.showCaseSubReason = false; // Hide Case Sub Reason field initially

    //         // Check if there are dependent picklist values for Case Sub Reason
    //         if (data.picklistFieldValues["Case_Sub_Reason__c"] && data.picklistFieldValues["Case_Sub_Reason__c"].values.length > 0) {
    //             this.dependentPicklist = data.picklistFieldValues["Case_Sub_Reason__c"]; // Save the dependent picklist
    //             this.dependentPicklist.values.forEach(depVal => {
    //                 this.finalDependentVal.push({
    //                     label: depVal.label,
    //                     value: depVal.value
    //                 });
    //             });
    //             this.showCaseSubReason = true; // Show Case Sub Reason if dependent values are present
    //         }
            
    //         this.caseReasonDisabled = false; // Enable Case Reason once the values are fetched
    //     } else if (error) {
    //         console.log('Error fetching picklist values:', error);
    //     }
    // }

    // // Handle record type change in the dropdown
    // handleRecordTypeChange(event) {
    //     // Get selected record type ID from the dropdown (value of the combobox)
    //     this.selectedRecordType = event.target.value;

    //     // Clear all values in case reason and case sub reason
    //     this.controllingPicklist = []; // Clear controlling picklist
    //     this.finalDependentVal = []; // Clear dependent picklist values
    //     this.caseReasonDisabled = true; // Disable Case Reason until data is fetched
    //     this.caseSubReasonDisabled = true; // Disable Case Sub Reason until data is fetched
    //     this.showCaseSubReason = false; // Hide Case Sub Reason initially
    // }

    // // Handle dependent picklist values based on controlling picklist selection
    // fetchDependentValue(event) {
    //     this.finalDependentVal = []; // Clear Case Sub Reason options
    //     const selectedVal = event.target.value;

    //     // Ensure dependentPicklist and controllerValues are defined before using forEach
    //     if (this.dependentPicklist && this.dependentPicklist.controllerValues && selectedVal) {
    //         let controllerValues = this.dependentPicklist.controllerValues;

    //         // Loop through the dependent values and filter them based on the controllerValues
    //         this.dependentPicklist.values.forEach(depVal => {
    //             depVal.validFor.forEach(depKey => {
    //                 if (depKey === controllerValues[selectedVal]) {
    //                     this.caseSubReasonDisabled = false; // Enable Case Sub Reason if a valid selection is made
    //                     this.finalDependentVal.push({ label: depVal.label, value: depVal.value });
    //                 }
    //             });
    //         });

    //         // If no matching dependent values, keep Case Sub Reason disabled
    //         if (this.finalDependentVal.length === 0) {
    //             this.caseSubReasonDisabled = true;
    //         }
    //     } else {
    //         // Case Reason does not have any dependent values, disable Case Sub Reason
    //         this.caseSubReasonDisabled = true;
    //     }
    // }