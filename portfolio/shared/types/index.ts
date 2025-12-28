export type Theme = "dark" | "light";

export interface IMessage {
    role: "user" | "model";
    text: string;
}
