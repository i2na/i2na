export const profile = {
  name: "YENA",
  email: "yena@atrn.ai",
  channels: [
    { icon: "github", label: "GitHub", href: "https://github.com/i2na", text: "i2na" },
    { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/i2na/", text: "in/i2na" },
    { icon: "instagram", label: "Instagram", href: "https://instagram.com/2ye._na", text: "2ye._na" },
    { icon: "article", label: "Blog", href: "https://blog.yena.io.kr", text: "blog", localized: true },
  ],
};

export const timeline = [
  {
    id: "education",
    kind: "EDUCATION",
    from: "2020.03",
    to: "2026.02",
    color: "cyan",
    title: "University of Seoul",
    lines: ["education.degree"],
  },
  {
    id: "quipu",
    kind: "COMMUNITY",
    from: "2022.09",
    to: "2025.06",
    color: "pink",
    title: "QUIPU",
    lines: ["quipu.role"],
  },
  {
    id: "seoulution",
    kind: "HACKATHON",
    from: "2025.08",
    to: "2025.11",
    color: "amber",
    title: "SEOUL:ution Hackathon",
    lines: ["seoulution.what", "seoulution.role"],
    channels: [
      { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/nexa.seoulution/" },
      { icon: "github", label: "GitHub", href: "https://github.com/Seoul-ution" },
    ],
  },
  {
    id: "aetherion",
    kind: "WORK",
    from: "2025.06",
    color: "blue",
    title: "Aetherion",
    lines: ["role"],
    channels: [
      { icon: "globe", label: "Website", href: "https://atrn.ai/" },
      { icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/aetherion-dt/" },
    ],
  },
  {
    id: "asbg",
    kind: "COMMUNITY",
    from: "2026.09",
    color: "pink",
    title: "ASBG UOS",
    lines: ["asbg.what", "asbg.role"],
    channels: [
      { icon: "instagram", label: "Instagram", href: "https://www.instagram.com/aws.sbg.uos" },
      { icon: "github", label: "GitHub", href: "https://github.com/AWS-Student-Builder-Group-at-UOS" },
    ],
  },
];
