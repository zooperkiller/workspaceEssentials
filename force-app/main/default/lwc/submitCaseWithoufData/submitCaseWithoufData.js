import { LightningElement ,track} from 'lwc';
import getCustomerServiceMDT from '@salesforce/apex/LWRCaseReasonDetails.getCustomerServiceMDT'; // Apex method to fetch accounts

export default class SubmitCaseWithoufData extends LightningElement {
   /* @track selectedCaseRecordType = '';
    @track selectedCaseReason = '';
    @track selectedCaseSubReason = '';
  
    // Data structure for dropdown options
    data = {
      'B2B Customer Inquiry': {
        reasons: {
          'Credit Rep': [],
          'Document Request': ['ASN', 'Bill of Lading', 'Invoice', 'Pack Slip', 'PO Acknowledgment'],
          'Freight Charges': [],
          'Licensee': [],
          'Order Status': [],
          'Product Information': ['Availability', 'Parts Breakdown', 'Promotions', 'Specifications', 'Technical Information'],
          'Salesperson': [],
          'Service Center': [],
          'Update Customer Info': [],
        },
      },
      'B2B Order Maintenance': {
        reasons: {
          'Address Change': [],
          'Add To Order': [],
          'Block Removal': [],
          'Cancel Line(s)': [],
          'Cancel Order': [],
          'Change Line Qty or Item': [],
          'Duplicate Order': [],
          'Expedite/Ship Conditions': [],
        },
      },
      'B2B Claim/Return': {
        reasons: {
          'Carrier Claim': [
            'Damage',
            'Delayed Shipment',
            'Mis-Shipment - Wrong Customer',
            'Refused Shipment',
            'Shortage - Lost Shipment',
            'Shortage - Missing Carton(s)',
            'Shortage - Missing Pallet(s)',
          ],
          'DC Picking/Shipping Error': [
            'Missing Items in Box',
            'No valid tracking',
            'Overage - More Items Shipped than Ordered',
            'Wrong Item Shipped',
          ],
          'Defective Return': [],
          'Order Entry Error': ['Duplicate', 'Freight', 'Pricing', 'Wrong Customer', 'Wrong Items', 'Wrong Quantities'],
        },
      },
    };
  
    // Get options for Case Record Type
    get caseRecordTypeOptions() {
      const options = Object.keys(this.data).map((key) => ({ label: key, value: key }));
      console.log('Case Record Type Options:', options);
      return options;
    }
  
    // Get options for Case Reason
    get caseReasonOptions() {
      if (this.selectedCaseRecordType) {
        const options = Object.keys(this.data[this.selectedCaseRecordType].reasons).map((key) => ({ label: key, value: key }));
        console.log('Case Reason Options:', options);
        return options;
      }
      console.log('No Case Record Type selected. Case Reason Options are empty.');
      return [];
    }
  
    // Get options for Case Sub-Reason
    get caseSubReasonOptions() {
      if (this.selectedCaseRecordType && this.selectedCaseReason) {
        const subReasons = this.data[this.selectedCaseRecordType].reasons[this.selectedCaseReason];
        const options = subReasons.map((subReason) => ({ label: subReason, value: subReason }));
        console.log('Case Sub-Reason Options:', options);
        return options;
      }
      console.log('No Case Reason selected. Case Sub-Reason Options are empty.');
      return [];
    }
  
    // Event handler for Case Record Type change
    handleCaseRecordTypeChange(event) {
      this.selectedCaseRecordType = event.target.value;
      this.selectedCaseReason = '';
      this.selectedCaseSubReason = '';
      console.log('Selected Case Record Type:', this.selectedCaseRecordType);
    }
  
    // Event handler for Case Reason change
    handleCaseReasonChange(event) {
      this.selectedCaseReason = event.target.value;
      this.selectedCaseSubReason = '';
      console.log('Selected Case Reason:', this.selectedCaseReason);
    }
*/
    @track showSecond =  true;
    @track caseRecordTypeOptions = [];
    @track caseReasonOptions = [];
    @track caseSubReasonOptions = [];

    selectedCaseRecordType;
    selectedCaseReason;
    selectedCaseSubReason;

    handleClick() {
        getCustomerServiceMDT()
            .then((result) => {
                console.log('Selected Case Reason:', result);
                // Extract unique values for RecordType1, Reason1, and SubReason1
                const recordTypes = new Set();
                const reasons = new Set();
                const subReasons = new Set();

                result.forEach((item) => {
                    if (item.RecordType1__c) {
                        recordTypes.add(item.RecordType1__c);
                    }
                    if (item.Reason1__c) {
                        reasons.add(item.Reason1__c);
                    }
                    if (item.SubReason1__c) {
                        subReasons.add(item.SubReason1__c);
                    }
                });

                // Convert sets to arrays of objects suitable for combobox
                this.caseRecordTypeOptions = Array.from(recordTypes).map((type) => ({
                    label: type,
                    value: type,
                }));

                this.caseReasonOptions = Array.from(reasons).map((reason) => ({
                    label: reason,
                    value: reason,
                }));

                this.caseSubReasonOptions = Array.from(subReasons).map((subReason) => ({
                    label: subReason,
                    value: subReason,
                }));
            })
            .catch((error) => {
                console.error('Error fetching metadata:', error);
            });
    }

    handleCaseRecordTypeChange(event) {
        this.selectedCaseRecordType = event.detail.value;
    }

    handleCaseReasonChange(event) {
        this.selectedCaseReason = event.detail.value;
    }

    handleCaseSubReasonChange(event) {
        this.selectedCaseSubReason = event.detail.value;
    }
}