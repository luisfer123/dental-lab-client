import { Pipe, PipeTransform } from '@angular/core';
import { PhoneType } from '../_model/PhoneType';

@Pipe({
  name: 'phoneType'
})
export class PhoneTypePipe implements PipeTransform {

  transform(value: PhoneType): string {

    switch(value) {
      case PhoneType.CELLPHONE:
        return 'Celular';
      case PhoneType.HOME:
        return 'Casa';
      case PhoneType.OFFICE:
        return 'Oficina';
      case PhoneType.DENTIST_OFFICE:
        return 'Consultorio dental';
      case PhoneType.LABORATORY:
        return 'Laboratorio';
    }
  }

}
