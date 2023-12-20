import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { FormService } from 'src/app/services/form.service';
import { CustomerVlidators } from 'src/app/validators/customer-vlidators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  checkoutFormGroup! : FormGroup;

  constructor(private formBuilder: FormBuilder,
              private formService: FormService) { }

  ngOnInit(): void {
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.pattern(/^\S+@\S+\.\S+$/)]]
      }),
      shippingAddress: this.formBuilder.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['', [Validators.required]],
        zipCode: ['', [Validators.required]]
      }),
      billingAddress: this.formBuilder.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['', [Validators.required]],
        zipCode: ['', [Validators.required]]
      }),
      creditCard: this.formBuilder.group({
        cardType: ['', [Validators.required]],
        nameOnCard: ['', [Validators.required, Validators.minLength(3)]],
        cardNumber: ['', [Validators.required, Validators.pattern('[0-9]{16}')]],
        securityCode: ['', [Validators.required, Validators.pattern('[0-9]{3}')]],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    this.formService.getCreditMonths(startMonth).subscribe(
      data => {
        console.log(`Retrieved credit card months: ` + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )

    this.formService.getCreditYears().subscribe(
      data => {
        console.log(`Retrieved credit card years: ` + JSON.stringify(data));
        this.creditCardYears = data;
      }
    )

    this.formService.getCountries().subscribe(
      data => {
        console.log(`Retrieved Countries: ` + JSON.stringify(data));
        this.countries = data;
      }
    )
  }

  get firstName() {return this.checkoutFormGroup.get('customer.firstName');}
  get lastName() {return this.checkoutFormGroup.get('customer.lastName');}
  get email() {return this.checkoutFormGroup.get('customer.email');}
  get shippingAddressCountry() {return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressStreet() {return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity() {return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState() {return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressZipCode() {return this.checkoutFormGroup.get('shippingAddress.zipCode');}

  get billingAddressCountry() {return this.checkoutFormGroup.get('billingAddress.country');}
  get billingAddressStreet() {return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity() {return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState() {return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressZipCode() {return this.checkoutFormGroup.get('billingAddress.zipCode');}

  get creditCardType() {return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode() {return this.checkoutFormGroup.get('creditCard.securityCode');}


  copyShippingAddressToBillingAddress(event: any) {

    if (event.target.checked) {
      this.checkoutFormGroup?.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      // handle state in Billing Address
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedTear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number = 0;

    if (currentYear === selectedTear) {
      startMonth = new Date().getMonth();
    } else {
      startMonth = 1;
    }

    this.formService.getCreditMonths(startMonth).subscribe(
      data => {
        console.log("REtrieve credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    )
  }

  onSubmit() {

    console.log("Handling the submit button");

    if ( this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("Email: " + this.checkoutFormGroup.get('customer')?.value.email);
    console.log("Shipping Country:" + this.checkoutFormGroup.controls['shippingAddress']?.value.country.name);
    console.log("Shipping State:" + this.checkoutFormGroup.controls['shippingAddress']?.value.state.name);
  }

}
