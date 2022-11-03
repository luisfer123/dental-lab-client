import { Address } from "./Address";
import { Phone } from "./Phone";

export class User {
    id: number | null = null;
    username: string = '';
    email: string = '';
    firstName: string = '';
    middleName: string = '';
    lastName: string = '';
    secondLastName: string = '';
    profilePicture: string = '';
    addresses: Array<Address> = new Array();
    phones: Array<Phone> = new Array();

    static fromData(userData: User): User {
        const user: User = new User();

        user.id = userData.id;
        user.username = userData.username;
        user.email = userData.email;
        user.firstName = userData.firstName;
        user.middleName = userData.middleName;
        user.lastName = userData.lastName;
        user.secondLastName = userData.secondLastName;
        user.profilePicture = userData.profilePicture;

        userData.addresses.forEach(address =>
             user.addresses.push(Address.fromData(address)));

        userData.phones.forEach(phone =>
            user.phones.push(Phone.fromData(phone)));

        return user;
    }

}