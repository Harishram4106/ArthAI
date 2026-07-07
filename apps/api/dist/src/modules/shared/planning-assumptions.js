"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANNING_ASSUMPTIONS = void 0;
exports.getCagrForProfile = getCagrForProfile;
exports.PLANNING_ASSUMPTIONS = {
    cagr: {
        Conservative: 0.08,
        Moderate: 0.12,
        Aggressive: 0.14
    },
    defaultCagr: 0.12,
    inflation: 0.06
};
function getCagrForProfile(profile) {
    if (!profile)
        return exports.PLANNING_ASSUMPTIONS.defaultCagr;
    return exports.PLANNING_ASSUMPTIONS.cagr[profile] || exports.PLANNING_ASSUMPTIONS.defaultCagr;
}
