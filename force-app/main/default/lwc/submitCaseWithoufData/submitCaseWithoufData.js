import { LightningElement ,track} from 'lwc';
import showCustomMetadata from '@salesforce/apex/LWRCaseReasonDetails.showCustomMetadata'; // Apex method to fetch accounts

export default class SubmitCaseWithoufData extends LightningElement {
   @track selectedCaseRecordType1 = '';
    @track selectedCaseReason1 = '';
    @track selectedCaseSubReason1 = '';
  
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
    get caseRecordTypeOptions1() {
      const options = Object.keys(this.data).map((key) => ({ label: key, value: key }));
      console.log('Case Record Type Options:', options);
      return options;
    }
  
    // Get options for Case Reason
    get caseReasonOptions1() {
      if (this.selectedCaseRecordType1) {
        const options = Object.keys(this.data[this.selectedCaseRecordType1].reasons).map((key) => ({ label: key, value: key }));
        console.log('Case Reason Options:', options);
        return options;
      }
      console.log('No Case Record Type selected. Case Reason Options are empty.');
      return [];
    }
  
    // Get options for Case Sub-Reason
    get caseSubReasonOptions1() {
      if (this.selectedCaseRecordType1 && this.selectedCaseReason1) {
        const subReasons = this.data[this.selectedCaseRecordType1].reasons[this.selectedCaseReason1];
        const options = subReasons.map((subReason) => ({ label: subReason, value: subReason }));
        console.log('Case Sub-Reason Options:', options);
        return options;
      }
      console.log('No Case Reason selected. Case Sub-Reason Options are empty.');
      return [];
    }
  
    // Event handler for Case Record Type change
    handleCaseRecordTypeChange1(event) {
      this.selectedCaseRecordType1 = event.target.value;
      this.selectedCaseReason1 = '';
      this.selectedCaseSubReason1 = '';
      console.log('Selected Case Record Type:', this.selectedCaseRecordType1);
    }
  
    // Event handler for Case Reason change
    handleCaseReasonChange1(event) {
      this.selectedCaseReason1 = event.target.value;
      this.selectedCaseSubReason1 = '';
      console.log('Selected Case Reason:', this.selectedCaseReason1);
    }


    /*SHOW CUSTOMER INQUIRY BASED ON CUSTOM METADATA*/ 
@track showSecond =  true;
@track caseRecordTypeOptions = [];
@track caseReasonOptions = [];
@track caseSubReasonOptions = [];

@track selectedCaseRecordType;
@track selectedCaseReason;
@track selectedCaseSubReason;

isCaseReasonVisible = false;
isCaseSubReasonVisible = false;
isCaseSubReasonDisabled = true;

metadata = []; // To store the entire MDT data

handleClick() {
    showCustomMetadata()
        .then((result) => {
            // Store the metadata for dynamic filtering later
            this.metadata = result;

            // Extract unique record types
            const recordTypes = new Set();
            result.forEach((item) => {
                if (item.RecordType1__c) {
                    recordTypes.add(item.RecordType1__c);
                }
            });

            // Populate Record Type combobox options
            this.caseRecordTypeOptions = Array.from(recordTypes).map((type) => ({
                label: type,
                value: type,
            }));
        })
        .catch((error) => {
            console.error('Error fetching metadata:', error);
        });
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

    console.log('@@-caseREcord',this.selectedCaseRecordType);
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

    console.log('@@-caseReason',this.selectedCaseReason);
}

handleCaseSubReasonChange(event) {
    this.selectedCaseSubReason = event.detail.value;
}
}