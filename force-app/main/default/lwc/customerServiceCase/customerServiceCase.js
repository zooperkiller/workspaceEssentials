import { LightningElement,track ,wire} from 'lwc';
import getCases from '@salesforce/apex/LWRCaseReasonDetails.getCases';

export default class CustomerServiceCase extends LightningElement {


    @track showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  cases = [];
    error;
    showModal = false;

    @wire(getCases)
    wiredCases({ error, data }) {
        if (data) {
          console.log('@@data:',data);
            this.cases = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            console.log('@@error000:',error);
            this.cases = undefined;
        }
    }
}