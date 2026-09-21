import { Leaf, Users, ScaleIcon } from "lucide-react";

export const PILLAR_META = {
    environmental: {
        label: "Environmental",
        bar: "bg-[var(--color-environmental)]",
        dot: "bg-[var(--color-environmental)]",
        icon: Leaf,
        iconColor: "text-[var(--color-environmental)]",
    },
    social: {
        label: "Social",
        bar: "bg-[var(--color-social)]",
        dot: "bg-[var(--color-social)]",
        icon: Users,
        iconColor: "text-[var(--color-social)]",
    },
    governance: {
        label: "Governance",
        bar: "bg-[var(--color-governance)]",
        dot: "bg-[var(--color-governance)]",
        icon: ScaleIcon,
        iconColor: "text-[var(--color-governance)]",
    },
};

export const CATEGORY_TONE = {
    Low: {
        text: "text-[var(--color-ochre-dark)]",
        ring: "ring-[var(--color-ochre-dark)]/25",
        bg: "bg-[var(--color-ochre-light)]",
    },
    Medium: {
        text: "text-[var(--color-ochre)]",
        ring: "ring-[var(--color-ochre)]/25",
        bg: "bg-[var(--color-ochre-light)]",
    },
    High: {
        text: "text-[var(--color-environmental)]",
        ring: "ring-[var(--color-environmental)]/25",
        bg: "bg-[var(--color-environmental-light)]",
    },
};
