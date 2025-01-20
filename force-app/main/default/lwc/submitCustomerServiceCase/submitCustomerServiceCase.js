import { LightningElement,api,track,wire } from 'lwc';
export default class SubmitCustomerServiceCase extends LightningElement {

    @api caseRelatesOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
  ];

  @api caseReasonOptions = [
    { label: 'Reason 1', value: 'reason1' },
    { label: 'Reason 2', value: 'reason2' },
  ];

  @api caseSubReasonOptions = [
    { label: 'Sub-Reason 1', value: 'subreason1' },
    { label: 'Sub-Reason 2', value: 'subreason2' },
  ];

  @api brandOptions = [
    { label: 'Brand 1', value: 'brand1' },
    { label: 'Brand 2', value: 'brand2' },
  ];

  closeModal() {
    const closeEvent = new CustomEvent('closemodal');
    this.dispatchEvent(closeEvent);
}
}