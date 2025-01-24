import { LightningElement,track } from 'lwc';
export default class CustomerServiceCase extends LightningElement {


    @track showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}