export interface IUserInfo {
    email: string;
    name: string;
}

export interface IAuthData {
    token: string;
    email: string;
    name: string;
    expires: number;
}
