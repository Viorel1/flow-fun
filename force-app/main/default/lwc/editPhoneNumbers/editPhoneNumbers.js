import { LightningElement, api, track } from 'lwc';

export default class EditPhoneNumbers extends LightningElement {
    @api accountId;
    @api phoneFields = ['Phone', 'Fax', 'MobilePhone', 'OtherPhone', 'HomePhone'];
    @track phoneNumbers = [];

    connectedCallback() {
        // Load phone numbers for the given account ID
        this.loadPhoneNumbers();
    }

    loadPhoneNumbers() {
        // Query the account record and load phone number fields
        let phoneNumbers = [];
        let fields = this.phoneFields.join(', ');
        let query = `SELECT ${fields} FROM Account WHERE Id = '${this.accountId}'`;
        let action = { apiName: 'Account', query: query };
        this.dispatchEvent(new CustomEvent('lookup', { detail: action }));

        // Parse the phone numbers and store in an array
        let accountRecord = this.record;
        if (accountRecord) {
            for (let field of this.phoneFields) {
                let value = accountRecord[field];
                if (value) {
                    let phoneNumber = { id: field, label: field, value: value };
                    phoneNumbers.push(phoneNumber);
                }
            }
            this.phoneNumbers = phoneNumbers;
        }
    }

    handleInputChange(event) {
        // Validate the phone number format and check for duplicates
        let input = event.target;
        let phoneNumber = this.phoneNumbers.find(p => p.id === input.label);
        if (!phoneNumber) return;

        let isValid = this.validatePhoneNumber(input.value);
        let isDuplicate = this.phoneNumbers.some(p => p.id !== input.label && p.value === input.value);
        input.setCustomValidity(isDuplicate ? 'Duplicate phone number' : isValid ? '' : 'Invalid phone number format');
        input.reportValidity();

        if (isValid && !isDuplicate) {
            phoneNumber.value = input.value;
        }
    }

    handleSave() {
        // Save phone numbers to the account record
        let fields = [];
        for (let phoneNumber of this.phoneNumbers) {
            fields.push({ fieldApiName: phoneNumber.id, value: phoneNumber.value });
        }
        let recordInput = { fields: fields, apiName: 'Account', Id: this.accountId };
        this.dispatchEvent(new CustomEvent('save', { detail: recordInput }));
    }

    validatePhoneNumber(phoneNumber) {
        // Validate the phone number format
        let pattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;
        return pattern.test(phoneNumber);
    }
}
