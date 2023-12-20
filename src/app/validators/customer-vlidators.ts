import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class CustomerVlidators {

  //whitespace validator
  static notOnlyWhitespace(control: FormControl): ValidationErrors {

    if ((control.value != null) && (control.value.strim().length === 0)) {
      return {'notOnlyWhitespace': true};
    } else {
      return {'notOnlyWhitespace': false};
    }
  }

}
