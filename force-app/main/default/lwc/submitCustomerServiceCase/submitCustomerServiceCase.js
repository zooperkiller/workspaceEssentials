import { LightningElement,api,track,wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValuesByRecordType  } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import CASE_OBJECT from '@salesforce/schema/Case';
import BRAND_FIELD from '@salesforce/schema/Case.Brand__c'; // Replace with actual field API name if it's custom

export default class SubmitCustomerServiceCase extends LightningElement {


    @api caseRelatesOptions = [
    { label: 'Question About My Order', value: 'B2B Customer Inquiry' },
    { label: 'Modify My Order', value: 'B2B Order Maintenance' },
    { label: 'Problem With My Order', value: 'B2B Claim/Return' },
  ];

  @api caseReasonOptions = [
    { label: 'Reason 1', value: 'reason1' },
    { label: 'Reason 2', value: 'reason2' },
  ];

  @api caseSubReasonOptions = [
    { label: 'Sub-Reason 1', value: 'subreason1' },
    { label: 'Sub-Reason 2', value: 'subreason2' },
  ];

  

  closeModal() {
    const closeEvent = new CustomEvent('closemodal');
    this.dispatchEvent(closeEvent);
  }
  @track caseRelatesValue;
  handleCaseRelatesChange(event){
    this.caseRelatesValue = event.detail.value;
    console.log('@@caseRelatesValue',this.caseRelatesValue);
  }

    @track recordIdMap = {}; // To store the recordTypeId based on name
    controllingPicklist = []; // Store picklist options
    dependentPicklist = {}; // Store dependent picklist options
    finalDependentVal = []; // Final dependent picklist values
    showpicklist = false;
    showdependent = false;
    dependentDisabled = true;

    @track selectedRecordType = ''; // Track selected record type

    // This will hold the options for the combobox dropdown (record types)
   @track recordTypeOptions = [];
   @track brandOptions = []; // Store options for the BRAND combobox
   @track selectedBrand = ''; // Track the selected brand

    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
    objectInfo({ error, data }) {
        if (data) {
            // Accessing the recordTypeInfos field from the response
            const recordTypeInfos = data.recordTypeInfos;
            console.log('data', data);
            console.log('recordTypeInfos', recordTypeInfos);

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
            // Log the options to ensure they are populated
            console.log('recordTypeOptions:', this.recordTypeOptions);

        } else if (error) {
            console.log('error', error);
        }
    }

    // Reactive wire for picklist values based on selected recordTypeId
    @wire(getPicklistValuesByRecordType, { 
        objectApiName: CASE_OBJECT,
        recordTypeId: '$selectedRecordType' // Dynamically bind the selectedRecordType
    })
    fetchPicklist({ error, data }) {
        if (data && data.picklistFieldValues) {
            let optionsValue = {};
            optionsValue["label"] = "--None--";
            optionsValue["value"] = "--None--";
            this.controllingPicklist = [optionsValue];

            // Clear dependent picklist values
            this.finalDependentVal = [];
            this.showdependent = false;
            this.dependentDisabled = true;

            data.picklistFieldValues["Case_Reason__c"].values.forEach(optionData => {
                this.controllingPicklist.push({ label: optionData.label, value: optionData.value });
            });

            this.dependentPicklist = data.picklistFieldValues["Case_Sub_Reason__c"];
            this.showpicklist = true;
        } else if (error) {
            console.log('Error fetching picklist values:', error);
        }
    }

    // Wire to fetch BRAND picklist options from the Case object
    @wire(getPicklistValues, { recordTypeId: '$recordIdMap.Master', fieldApiName: BRAND_FIELD })
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
    // Handle record type change in the dropdown
    handleRecordTypeChange(event) {
        // Get selected record type ID from the dropdown (value of the combobox)
        this.selectedRecordType = event.target.value;

         // Clear all values in case reason and case sub reason
        this.controllingPicklist = []; // Clear controlling picklist
        this.finalDependentVal = []; // Clear dependent picklist values
        this.showpicklist = false; // Hide the picklist until data is fetched
        this.showdependent = false; // Hide dependent picklist
        this.dependentDisabled = true; // Disable the dependent picklist
    }

    // Handle dependent picklist values based on controlling picklist selection
    fetchDependentValue(event) {
        this.finalDependentVal = [];
        this.showdependent = false;
        const selectedVal = event.target.value;
        this.finalDependentVal.push({ label: "--None--", value: "--None--" });

        let controllerValues = this.dependentPicklist.controllerValues;
        this.dependentPicklist.values.forEach(depVal => {
            depVal.validFor.forEach(depKey => {
                if (depKey === controllerValues[selectedVal]) {
                    this.dependentDisabled = false;
                    this.showdependent = true;
                    this.finalDependentVal.push({ label: depVal.label, value: depVal.value });
                }
            });
        });
    }
}