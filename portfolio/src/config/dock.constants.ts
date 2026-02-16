import { PROFILE } from "./profile.constants";

export type TDockItem = {
    label: string;
    href: string;
    external?: boolean;
};

export const DOCK_ITEMS: TDockItem[] = [
    {
        label: "GitHub",
        href: PROFILE.links.github,
        external: true,
    },
    {
        label: "Mail",
        href: PROFILE.links.mail,
    },
    {
        label: "Instagram",
        href: PROFILE.links.instagram,
        external: true,
    },
];
