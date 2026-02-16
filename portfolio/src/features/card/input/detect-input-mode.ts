import { INPUT_MODE_MEDIA_QUERY } from "../model/constants";

export function detectTouchInput(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return window.matchMedia(INPUT_MODE_MEDIA_QUERY).matches;
}
