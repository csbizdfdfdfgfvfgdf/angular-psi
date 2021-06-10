export class User {
    userName: string;
    password: string;
}

export class RegisterUser extends User {
    password_confirmation: string;
    email: string;
    userName: string;
    password: string;
}

export class ResetPwd extends RegisterUser{
    token: string;

}

