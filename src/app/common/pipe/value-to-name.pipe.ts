import {Pipe, PipeTransform} from '@angular/core';
/** pipes are user to transform any object it 
 always get input make some transformatins and return output
*/

/**
 *  转换枚举value到name
*/
@Pipe({name: 'valueToName'})
export class ValueToNamePipe implements PipeTransform {
  transform(value: number, enumTypes: any): string {
    return valueToLabel(value, enumTypes);
  }
}

export function valueToLabel(value: number, enumTypes: any) {
  let res = '';
  if (enumTypes) {
    enumTypes.forEach(item => {
      if (item.value === value) {
        res = item.label;
        return false;
      }
    });
  }
  return res;
}
