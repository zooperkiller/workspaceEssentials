import { LightningElement, wire, track } from 'lwc';
import { getPicklistValuesByRecordType, getObjectInfo } from 'lightning/uiObjectInfoApi';
import CASE_OBJECT from '@salesforce/schema/Case';
import EXCLUDED_CASE_REASONS from '@salesforce/label/c.LWRExcludeCaseReason';

export default class CaseCreation extends LightningElement {
    @track recordIdMap = {};
    @track caseRecordTypeOptions = [];
    @track selectedCaseRecordType = '';
    @track selectedCaseRecordTypeName = '';
    @track caseReasonOptions = []; 
    @track caseSubReasonOptions = []; 
    @track isCaseSubReasonDisabled = true;
    @track isCaseReasonDisabled = true;
    dependentPicklist;
    @track selectedCaseSubReason;
    masterRecordTypeId = '';
    @track isLoading = true;
    
    excludedCaseReasons = EXCLUDED_CASE_REASONS.split(',').map(item => item.trim());

    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
    objectInfo({ error, data }) {
        if (data) {
            console.log('@@data:', data);
            const recordTypeInfos = data.recordTypeInfos;
            console.log('@@recordTypeInfos:', recordTypeInfos);

            // Fixed order for record types
            const recordTypeMap = {
                'B2B Claim/Return': 'Problem with my Order',
                'B2B Customer Inquiry': 'Question about my Order'
                
            };

            this.caseRecordTypeOptions = [];

            Object.keys(recordTypeMap).forEach(recordName => {
                if (recordTypeInfos) {
                    const recordInfo = Object.values(recordTypeInfos).find(info => info.name === recordName);
                    if (recordInfo) {
                        this.recordIdMap[recordName] = recordInfo.recordTypeId;
                        this.caseRecordTypeOptions.push({ label: recordTypeMap[recordName], value: recordInfo.recordTypeId });
                    }
                }
            });

            // Handle master record type
            const masterRecordType = Object.values(recordTypeInfos).find(info => info.name === 'Master');
            if (masterRecordType) {
                this.masterRecordTypeId = masterRecordType.recordTypeId;
            }

            console.log('@@recordIdMap:', this.recordIdMap);
            console.log('@@masterRecordTypeId:', this.masterRecordTypeId);
            this.isLoading = false;
        } else if (error) {
            console.error('Error fetching object info:', error);
            this.isLoading = false;
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

            this.caseReasonOptions = optionsValue; 
            this.caseSubReasonOptions = []; 
            this.isCaseSubReasonDisabled = true;
            this.isCaseReasonDisabled = false;

            if (data.picklistFieldValues["Case_Sub_Reason__c"] && data.picklistFieldValues["Case_Sub_Reason__c"].values.length > 0) {
                this.dependentPicklist = data.picklistFieldValues["Case_Sub_Reason__c"];
            }

            setTimeout(() => {
                this.isLoading = false;
            }, 300); // Adding delay for UI responsiveness
        
        } else if (error) {
            console.error('Error fetching picklist values:', error);
            this.isLoading = false;
        }
    }

    fetchDependentValue(event) {
        this.caseSubReasonOptions = [];
        const selectedVal = event.target.value;
        console.error('selectedVal:', selectedVal);
        
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
        this.selectedCaseRecordTypeName = Object.keys(this.recordIdMap).find(
            key => this.recordIdMap[key] === this.selectedCaseRecordType
        ) || '';
        this.isLoading = true;
        this.isCaseReasonDisabled = false;
        console.log('@@selectedCaseRecordType:', this.selectedCaseRecordType);
        console.log('@@ Selected Record Type Name:', this.selectedCaseRecordTypeName);
    }

    handleCaseSubReasonChange(event) {
        this.selectedCaseSubReason = event.detail.value;
        console.log('@@-selectedCaseSubReason:', this.selectedCaseSubReason);
    }
}
