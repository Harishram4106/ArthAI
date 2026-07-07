"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Global Prisma instance
exports.prisma = new client_1.PrismaClient({ log: ['error'] });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ArthAI API is running' });
});
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const transactions_routes_1 = __importDefault(require("./modules/transactions/transactions.routes"));
const risk_routes_1 = __importDefault(require("./modules/risk/risk.routes"));
const goals_routes_1 = __importDefault(require("./modules/goals/goals.routes"));
const recommendations_routes_1 = __importDefault(require("./modules/recommendations/recommendations.routes"));
const audit_routes_1 = __importDefault(require("./modules/audit/audit.routes"));
const advisory_routes_1 = __importDefault(require("./modules/advisory/advisory.routes"));
const appointments_routes_1 = __importDefault(require("./modules/appointments/appointments.routes"));
const simulator_routes_1 = __importDefault(require("./modules/simulator/simulator.routes"));
const reports_routes_1 = __importDefault(require("./modules/reports/reports.routes"));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/transactions', transactions_routes_1.default);
app.use('/api/risk', risk_routes_1.default);
app.use('/api/goals', goals_routes_1.default);
app.use('/api/recommendations', recommendations_routes_1.default);
app.use('/api/audit', audit_routes_1.default);
app.use('/api/advisory', advisory_routes_1.default);
app.use('/api/appointments', appointments_routes_1.default);
app.use('/api/simulator', simulator_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.listen(port, () => {
    console.log(`ArthAI Backend running at http://localhost:${port}`);
});
