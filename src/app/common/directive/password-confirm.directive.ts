import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidatorFn} from '@angular/forms';

//  directives are used to add behaviour into dom objects 
//  this directive used to check passwordConfirm value

@Directive({
  selector: '[appPasswordConfirm]',
  providers: [{provide: NG_VALIDATORS, useExisting: PasswordConfirmDirective, multi: true}]
})
export class PasswordConfirmDirective {

  @Input('appPasswordConfirm') password: string;

  // it validate password and also it add behaviuor to show and hide password by calling below method
  validate(control: AbstractControl): { [key: string]: any } | null {
    return this.password ? passwordConfirmValidator(this.password)(control)
      : null;
  }

}
// export type method means you can call this method out of class without any object or class instance
export function passwordConfirmValidator(password: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = password !== control.value;
    return forbidden ? {passwordConfirm: {value: control.value}} : null;
  };
}

