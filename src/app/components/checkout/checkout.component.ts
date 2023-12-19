import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { FormService } from 'src/app/services/form.service';

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

  checkoutFormGroup = this.formBuilder.group({
    customer: this.formBuilder.group({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^\S+@\S+\.\S+$/)]]
    }),
    shippingAddress: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: ['']
    }),
    billingAddress: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: ['']
    }),
    creditCard: this.formBuilder.group({
      cardType: [''],
      nameOnCard: [''],
      cardNumber: [''],
      securityCode: [''],
      expirationMonth: [''],
      expirationYear: ['']
    })
  });

  constructor(private formBuilder: FormBuilder,
              private formService: FormService) { }

  ngOnInit(): void {
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);

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

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      const shippingAddressValue = this.checkoutFormGroup.controls.shippingAddress.value;

      // Explicitly cast undefined values to null
      const billingAddressValue: Address = {
        street: shippingAddressValue.street || null,
        city: shippingAddressValue.city || null,
        state: shippingAddressValue.state || null,
        country: shippingAddressValue.country || null,
        zipCode: shippingAddressValue.zipCode || null,
      };

      this.checkoutFormGroup.controls.billingAddress.setValue(billingAddressValue);

      // handle state in Billing Address
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
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
    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("Email: " + this.checkoutFormGroup.get('customer')?.value.email);
    console.log("Shipping Country:" + JSON.stringify(this.checkoutFormGroup.get('shippingAddress')?.value.country));
    console.log("Shipping State:" + JSON.stringify(this.checkoutFormGroup.get('shippingAddress')?.value.state));
  }

}

interface Address {
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
}
