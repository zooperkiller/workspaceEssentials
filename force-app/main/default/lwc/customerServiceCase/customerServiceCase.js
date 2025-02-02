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

  @track cases = [];
  @track error;
  @track currentPage = 1;
  @track totalRecords = 0;
  @track pageSize = 5; // Number of records per page
  @track totalPages = 0;
  @track paginatedCases = [];

  @wire(getCases,{})
  wiredCases({ error, data }) {
      if (data) {
          this.cases = data;
          this.totalRecords = data.length;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          this.updatePaginatedCases();
      } else if (error) {
          this.error = error;
          this.cases = undefined;
      }
  }

  updatePaginatedCases() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.paginatedCases = this.cases.slice(startIndex, endIndex);
  }

  handlePrevious() {
      if (this.currentPage > 1) {
          this.currentPage--;
          this.updatePaginatedCases();
      }
  }

  handleNext() {
      if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.updatePaginatedCases();
      }
  }

  get isPreviousDisabled() {
      return this.currentPage === 1 ? 'disabled-button' : '';
  }

  get isNextDisabled() {
      return this.currentPage === this.totalPages ? 'disabled-button' : '';
  }
}