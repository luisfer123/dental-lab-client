import { AddressType } from "./AddressType";

export class Address {
    id: number | null = null;
    number: number = 0;
    innerNumber: string = '';
    street: string = '';
    zipPostcode: string = '';
    city: string = '';
    addressType: AddressType | null = null;
    defaultAddress: boolean = false;

    static fromData(data: Address): Address {
        const address: Address = new Address();

        address.id = data.id;
        address.number = data.number;
        address.innerNumber = data.innerNumber;
        address.street = data.street;
        address.zipPostcode = data.zipPostcode;
        address.city = data.city;
        address.addressType = <AddressType> data.addressType;
        address.defaultAddress = data.defaultAddress;

        return address;
    }
}