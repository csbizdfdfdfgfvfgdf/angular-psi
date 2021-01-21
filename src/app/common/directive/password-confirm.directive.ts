import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidatorFn} from '@angular/forms';

@Directive({
  selector: '[appPasswordConfirm]',
  providers: [{provide: NG_VALIDATORS, useExisting: PasswordConfirmDirective, multi: true}]
})
export class PasswordConfirmDirective {

  @Input('appPasswordConfirm') password: string;


  validate(control: AbstractControl): { [key: string]: any } | null {
    return this.password ? passwordConfirmValidator(this.password)(control)
      : null;
  }

}

export function passwordConfirmValidator(password: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = password !== control.value;
    return forbidden ? {passwordConfirm: {value: control.value}} : null;
  };
}

