export type TExperience = {
    organization: string;
    role: string;
    period: string;
    url: string;
};

export type TProfileLinks = {
    github: string;
    githubShort: string;
    mail: string;
    instagram: string;
    instagramShort: string;
};

export type TProfile = {
    name: string;
    subtitle: string;
    introLines: [string, string];
    educationSummary: string;
    workSummary: string;
    aboutKeywordLine: string;
    atGlanceDetailLines: [string, string];
    experiences: TExperience[];
    links: TProfileLinks;
    skills: string[];
};

export const PROFILE: TProfile = {
    name: "YENA",
    subtitle: "Identity Card",
    introLines: [
        "I build digital twins that turn real-world complexity into clear 3D experiences.",
        "At Mossland, I create software that helps teams decide faster and operate smarter.",
    ],
    educationSummary: "University of Seoul (2020-2025) · ECE B.S.",
    workSummary: "Mossland · Software Engineer · Digital Twin Group",
    aboutKeywordLine: "Digital Twin · 3D Graphics · Frontend Engineering",
    atGlanceDetailLines: [
        "Building interfaces for complex real-world systems.",
        "Realtime rendering and product-focused delivery.",
    ],
    experiences: [
        {
            organization: "University of Seoul",
            role: "B.S. in Electrical and Computer Engineering",
            period: "2020-2025",
            url: "https://uos.ac.kr",
        },
        {
            organization: "QUIPU, University of Seoul Computer Club",
            role: "Former President and Frontend Developer",
            period: "2022-2025",
            url: "https://quipu.uos.ac.kr",
        },
        {
            organization: "Mossland",
            role: "Software Engineer, Digital Twin Group",
            period: "2025-Present",
            url: "https://moss.land",
        },
    ],
    links: {
        github: "https://github.com/i2na",
        githubShort: "github.com/i2na",
        mail: "mailto:yena@moss.land",
        instagram: "https://www.instagram.com/2ye._na",
        instagramShort: "instagram.com/2ye._na",
    },
    skills: [
        "Three.js",
        "WebGPU",
        "React",
        "Next.js",
        "TypeScript",
        "MongoDB",
        "Docker",
        "Nginx",
        "Cloudflare",
    ],
};
