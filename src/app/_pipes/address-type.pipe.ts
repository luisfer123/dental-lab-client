import { Pipe, PipeTransform } from '@angular/core';
import { AddressType } from '../_model/AddressType';

@Pipe({
  name: 'addressType'
})
export class AddressTypePipe implements PipeTransform {

  transform(value: AddressType): string {

    switch(value) {
      case AddressType.HOME:
        return 'Casa';
      case AddressType.DENTIST_OFFICE:
        return 'Consultorio dental';
      case AddressType.LABORATORY:
        return 'Laboratorio';
      case AddressType.OTHER:
        return 'Otra';
    }
  }

}
