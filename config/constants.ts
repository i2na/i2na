const INFO = {
    name: {
        first: "Yena",
        last: "Lee",
        short: "YENA",
    },
    location: "Seoul, KR",
    email: "yena@moss.land",
    github: "https://github.com/i2na",
    instagram: "https://www.instagram.com/2ye._na",
} as const;

export const NAV = {
    logo: {
        part1: INFO.name.first,
        part2: `.${INFO.name.last}`,
    },
    sections: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#blog" },
        { label: "Contact", href: "#contact" },
    ],
    github: {
        label: "GitHub",
        url: INFO.github,
    },
} as const;

export const HERO = {
    content1: INFO.name.short,
    content2: {
        part1: "Digital Twin",
        part2: "3D Visualization",
    },
} as const;

export const ABOUT = {
    label: "// WHO I AM",
    content: [
        { type: "plain", text: "Building " },
        { type: "code", text: "Digital Twin" },
        { type: "plain", text: " solutions with " },
        { type: "code", text: "3D Visualization" },
        { type: "plain", text: " and " },
        { type: "code", text: "BIM Integration" },
        {
            type: "plain",
            text: ". Working with ",
        },
        { type: "code", text: "Autodesk APS" },
        { type: "plain", text: ", " },
        { type: "code", text: "Three.js" },
        { type: "plain", text: ", and " },
        { type: "code", text: "WebGPU" },
        {
            type: "plain",
            text: " to connect reality and virtual space in real-time. ",
        },
        { type: "highlight", text: "Simple" },
        { type: "plain", text: " and " },
        { type: "highlight", text: "clear" },
        {
            type: "plain",
            text: " in approach. Few words, but ",
        },
        { type: "underline", text: "strong structure" },
        {
            type: "plain",
            text: ". I build things that ",
        },
        { type: "underline", text: "stay steady" },
        { type: "plain", text: " and " },
        { type: "underline", text: "work well together" },
        { type: "plain", text: "." },
    ],
} as const;

export const BLOG = {
    label: "{ INSIGHTS }",
    content: "Simple words, clear ideas.",
} as const;

export const TECH_STACK = {
    label: "{ TECH STACK }",
    contents: [
        "JavaScript",
        "TypeScript",
        "Python",
        "React",
        "Next.js",
        "Node.js",
        "MongoDB",
        "Zustand",
        "Tailwind CSS",
        "SCSS",
        "Three.js",
        "Autodesk APS",
        "WebGPU",
        "Docker",
        "Cloudflare",
    ],
} as const;

export const FOOTER = {
    content: {
        part1: "Made to Stay",
        part2: "Made to Connect.",
    },
    location: INFO.location,
    name: `${INFO.name.first}.${INFO.name.last}`,
    social: [
        { icon: "Github", url: INFO.github },
        { icon: "Instagram", url: INFO.instagram },
        { icon: "Mail", url: `mailto:${INFO.email}` },
    ],
} as const;
