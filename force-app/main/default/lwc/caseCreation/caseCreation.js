import { LightningElement, wire, track } from 'lwc';
import { getPicklistValuesByRecordType, getObjectInfo } from 'lightning/uiObjectInfoApi';
import CASE_OBJECT from '@salesforce/schema/Case';
import EXCLUDED_CASE_REASONS from '@salesforce/label/c.LWRExcludeCaseReason';
export default class CaseCreation extends LightningElement {
    @track recordIdMap = {};
    @track caseRecordTypeOptions = [];
    @track selectedCaseRecordType = '';
    @track caseReasonOptions = []; // Added missing variable
    @track caseSubReasonOptions = []; // Added missing variable
    @track isCaseSubReasonDisabled = true; // Ensure it is initialized
    dependentPicklist; // Store dependent picklist values
    @track selectedCaseSubReason;
   // excludedCaseReasons = ['Order Status', 'Defective Return'];
   excludedCaseReasons = EXCLUDED_CASE_REASONS.split(',').map(item => item.trim());
    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
    objectInfo({ error, data }) {
        if (data) {
            console.log('@@data:', data);            
            const recordTypeInfos = data.recordTypeInfos;
            console.log('@@recordTypeInfos:', recordTypeInfos);
            this.caseRecordTypeOptions = []; 

            for (const key in recordTypeInfos) {
                const recordInfo = recordTypeInfos[key];
                const recordName = recordInfo.name;

                if (recordName) {
                    this.recordIdMap[recordName] = recordInfo.recordTypeId;
                    this.caseRecordTypeOptions.push({ label: recordName, value: recordInfo.recordTypeId });
                }
            }
            console.log('@@recordIdMap:', this.recordIdMap);
        } else if (error) {
            console.error('Error fetching object info:', error);
            console.log('@@error1:', error);
        }
    }

    @wire(getPicklistValuesByRecordType, { 
        objectApiName: CASE_OBJECT,
        recordTypeId: '$selectedCaseRecordType' 
    })
    fetchPicklist({ error, data }) {
        if (data && data.picklistFieldValues) {
            let optionsValue = [];
            data.picklistFieldValues["Case_Reason__c"].values.forEach(optionData => {
                if (!this.excludedCaseReasons.includes(optionData.value)) {
                    optionsValue.push({ label: optionData.label, value: optionData.value });
                }
            });

            this.caseReasonOptions = optionsValue; // Fix: Use correct variable
            this.caseSubReasonOptions = []; // Reset sub-reason picklist
            this.isCaseSubReasonDisabled = true;

            if (data.picklistFieldValues["Case_Sub_Reason__c"] && data.picklistFieldValues["Case_Sub_Reason__c"].values.length > 0) {
                this.dependentPicklist = data.picklistFieldValues["Case_Sub_Reason__c"];
            }
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }

    

    fetchDependentValue(event) {
        this.caseSubReasonOptions = [];
        const selectedVal = event.target.value;

        if (this.dependentPicklist && this.dependentPicklist.controllerValues && selectedVal) {
            let controllerValues = this.dependentPicklist.controllerValues;

            this.dependentPicklist.values.forEach(depVal => {
                depVal.validFor.forEach(depKey => {
                    if (depKey === controllerValues[selectedVal]) {
                        this.isCaseSubReasonDisabled = false;
                        this.caseSubReasonOptions.push({ label: depVal.label, value: depVal.value });
                    }
                });
            });

            if (this.caseSubReasonOptions.length === 0) {
                this.isCaseSubReasonDisabled = true;
            }
        } else {
            this.isCaseSubReasonDisabled = true;
        }
    }

    handleRecordTypeChange(event) {
        this.selectedCaseRecordType = event.target.value;
        console.log('@@selectedCaseRecordType:', this.selectedCaseRecordType);
    }

    handleCaseSubReasonChange(event){
        this.selectedCaseSubReason = event.detail.value;
        console.log('@@-selectedCaseSubReason',this.selectedCaseSubReason);
    }
}
