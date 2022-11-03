import { PhoneType } from "./PhoneType";

export class Phone {
    id: number | null = null;
    phoneNumber: number | null = null;
    phoneType: PhoneType | null = null;

    static fromData(data: Phone): Phone {
        const phone: Phone = new Phone();

        phone.id = data.id;
        phone.phoneNumber = data.phoneNumber;
        phone.phoneType = <PhoneType> data.phoneType;

        return phone;
    }
}