import { LightningElement,api,track,wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValuesByRecordType  } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import CASE_OBJECT from '@salesforce/schema/Case';
import BRAND_FIELD from '@salesforce/schema/Case.Brand__c'; // Replace with actual field API name if it's custom

import getAccounts from '@salesforce/apex/LWRCaseReasonDetails.getAccounts'; // Apex method to fetch accounts

export default class SubmitCustomerServiceCase extends LightningElement {

  closeModal() {
    const closeEvent = new CustomEvent('closemodal');
    this.dispatchEvent(closeEvent);
  }


    searchQuery = ''; // To store search query
    @track accountOptions = []; // To store dropdown options for accounts
    selectedAccountId = ''; // To store selected account ID

     // Handle changes to the search input
     handleSearchChange(event) {
        this.searchQuery = event.target.value;
        console.log('@@',this.searchQuery);
        console.log('@@1',this.searchQuery.length);
        if (this.searchQuery.length > 2) {
            console.log('@@3',this.searchQuery);
            this.searchAccounts(); // Trigger search when query length is more than 2 characters
        } else {
            this.accountOptions = []; // Clear options if search query is short
        }
    }

    // Fetch accounts based on search query
    searchAccounts() {
        getAccounts({ query: this.searchQuery })  // Call Apex to fetch matching accounts
            .then((result) => {
                console.log('@@4',result);
                if (result.length > 0) {
                    this.accountOptions = result.map(account => ({
                        label: account.Name,
                        value: account.Id
                    }));
                } else {
                    this.accountOptions = []; // Clear dropdown if no results
                }
            })
            .catch((error) => {
                console.log('Error fetching accounts', error);
                this.accountOptions = []; // Handle error by clearing options
            });
    }

    handleAccountSelection(event) {
        this.selectedAccountId = event.detail.value; // Set selected account ID
        console.log('@@5',this.selectedAccountId);
    }


    @track recordIdMap = {}; // To store the recordTypeId based on name
    @track recordTypeOptions = []; // Store the record type options for combobox
    controllingPicklist = []; // Store picklist options for Case Reason
    dependentPicklist = {}; // Store dependent picklist options for Case Sub Reason
    finalDependentVal = []; // Final dependent picklist values for Case Sub Reason

    @track selectedRecordType = ''; // Track selected record type
    @track brandOptions = []; // Store options for the BRAND combobox
    @track selectedBrand = ''; // Track the selected brand

    // Track if Case Reason and Case Sub Reason should be enabled or disabled
    @track caseReasonDisabled = true;
    @track caseSubReasonDisabled = true;
    @track showCaseSubReason = false; // Track if Case Sub Reason should be displayed

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

    // Wire to fetch Case Reason and Case Sub Reason picklist values based on selected recordTypeId
    @wire(getPicklistValuesByRecordType, { 
        objectApiName: CASE_OBJECT,
        recordTypeId: '$selectedRecordType' // Dynamically bind the selectedRecordType
    })
    fetchPicklist({ error, data }) {
        if (data && data.picklistFieldValues) {
            let optionsValue = [];
            data.picklistFieldValues["Case_Reason__c"].values.forEach(optionData => {
                if (optionData.value !== "--None--") { // Remove None value from Case Reason
                    optionsValue.push({ label: optionData.label, value: optionData.value });
                }
            });

            this.controllingPicklist = optionsValue; // Set controlling picklist values

            // Reset dependent picklist values and hide Case Sub Reason until valid data is available
            this.finalDependentVal = [];
            this.caseSubReasonDisabled = true; // Case Sub Reason should be disabled initially
            this.showCaseSubReason = false; // Hide Case Sub Reason field initially

            // Check if there are dependent picklist values for Case Sub Reason
            if (data.picklistFieldValues["Case_Sub_Reason__c"] && data.picklistFieldValues["Case_Sub_Reason__c"].values.length > 0) {
                this.dependentPicklist = data.picklistFieldValues["Case_Sub_Reason__c"]; // Save the dependent picklist
                this.dependentPicklist.values.forEach(depVal => {
                    this.finalDependentVal.push({
                        label: depVal.label,
                        value: depVal.value
                    });
                });
                this.showCaseSubReason = true; // Show Case Sub Reason if dependent values are present
            }
            
            this.caseReasonDisabled = false; // Enable Case Reason once the values are fetched
        } else if (error) {
            console.log('Error fetching picklist values:', error);
        }
    }

    // Handle record type change in the dropdown
    handleRecordTypeChange(event) {
        // Get selected record type ID from the dropdown (value of the combobox)
        this.selectedRecordType = event.target.value;

        // Clear all values in case reason and case sub reason
        this.controllingPicklist = []; // Clear controlling picklist
        this.finalDependentVal = []; // Clear dependent picklist values
        this.caseReasonDisabled = true; // Disable Case Reason until data is fetched
        this.caseSubReasonDisabled = true; // Disable Case Sub Reason until data is fetched
        this.showCaseSubReason = false; // Hide Case Sub Reason initially
    }

    // Handle dependent picklist values based on controlling picklist selection
    fetchDependentValue(event) {
        this.finalDependentVal = []; // Clear Case Sub Reason options
        const selectedVal = event.target.value;

        // Ensure dependentPicklist and controllerValues are defined before using forEach
        if (this.dependentPicklist && this.dependentPicklist.controllerValues && selectedVal) {
            let controllerValues = this.dependentPicklist.controllerValues;

            // Loop through the dependent values and filter them based on the controllerValues
            this.dependentPicklist.values.forEach(depVal => {
                depVal.validFor.forEach(depKey => {
                    if (depKey === controllerValues[selectedVal]) {
                        this.caseSubReasonDisabled = false; // Enable Case Sub Reason if a valid selection is made
                        this.finalDependentVal.push({ label: depVal.label, value: depVal.value });
                    }
                });
            });

            // If no matching dependent values, keep Case Sub Reason disabled
            if (this.finalDependentVal.length === 0) {
                this.caseSubReasonDisabled = true;
            }
        } else {
            // Case Reason does not have any dependent values, disable Case Sub Reason
            this.caseSubReasonDisabled = true;
        }
    }
}