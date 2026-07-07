export const PLANNING_ASSUMPTIONS = {
    cagr: {
        Conservative: 0.08,
        Moderate: 0.12,
        Aggressive: 0.14
    },
    defaultCagr: 0.12,
    inflation: 0.06
};

export function getCagrForProfile(profile: string | null | undefined): number {
    if (!profile) return PLANNING_ASSUMPTIONS.defaultCagr;
    return PLANNING_ASSUMPTIONS.cagr[profile as keyof typeof PLANNING_ASSUMPTIONS.cagr] || PLANNING_ASSUMPTIONS.defaultCagr;
}
