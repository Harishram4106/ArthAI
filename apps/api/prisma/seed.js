"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Database...');
    // 1. Create Products
    const products = [
        {
            id: 'p1',
            name: 'IDBI Liquid Fund',
            category: 'Debt',
            riskLevel: 1,
            expectedReturn: '6.5% - 7.0% p.a.',
            liquidity: 'Very High (T+1)',
            minInvestment: 500,
            taxSaving: false,
            disclosure: 'Low risk but returns are subject to interest rate movements.',
            tag: 'Emergency Buffer'
        },
        {
            id: 'p2',
            name: 'IDBI Bank Fixed Deposit',
            category: 'Fixed Income',
            riskLevel: 1,
            expectedReturn: '7.25% p.a. Guaranteed',
            liquidity: 'Low (Penalty on premature withdrawal)',
            minInvestment: 10000,
            taxSaving: false,
            disclosure: 'DICGC insured up to ₹5 Lakhs.',
            tag: 'Capital Safety'
        },
        {
            id: 'p3',
            name: 'Sovereign Gold Bond (SGB)',
            category: 'Commodity',
            riskLevel: 2,
            expectedReturn: '2.5% fixed + Gold Price Growth',
            liquidity: 'Low (8 year tenure, tradable on exchange)',
            minInvestment: 7500, // approx 1gm
            taxSaving: false,
            disclosure: 'Capital gains at maturity are tax-free. Backed by Govt of India.',
            tag: 'Inflation Hedge'
        },
        {
            id: 'p4',
            name: 'IDBI Hybrid Equity Fund',
            category: 'Hybrid',
            riskLevel: 2,
            expectedReturn: '10% - 12% p.a.',
            liquidity: 'High (T+3)',
            minInvestment: 1000,
            taxSaving: false,
            disclosure: 'Invests in both equity and debt to balance risk.',
            tag: 'Balanced Growth'
        },
        {
            id: 'p5',
            name: 'IDBI Flexi Cap Fund',
            category: 'Equity',
            riskLevel: 3,
            expectedReturn: '12% - 15% p.a.',
            liquidity: 'High (T+3)',
            minInvestment: 1000,
            taxSaving: false,
            disclosure: 'High volatility in short term. Suitable for 5+ years horizon.',
            tag: 'Wealth Creation'
        },
        {
            id: 'p6',
            name: 'IDBI Equity Advantage Fund (ELSS)',
            category: 'Equity - Tax Saver',
            riskLevel: 3,
            expectedReturn: '12% - 14% p.a.',
            liquidity: 'Locked (3 Years)',
            minInvestment: 500,
            taxSaving: true,
            disclosure: 'Qualifies for Sec 80C deduction. 3-year statutory lock-in applies.',
            tag: 'Tax Saver'
        },
        {
            id: 'p7',
            name: 'IDBI Nifty 50 Index Fund',
            category: 'Equity',
            riskLevel: 3,
            expectedReturn: '11% - 13% p.a.',
            liquidity: 'High (T+3)',
            minInvestment: 500,
            taxSaving: false,
            disclosure: 'Tracks the Nifty 50 index. Subject to market risks.',
            tag: 'Core Equity'
        }
    ];
    for (const p of products) {
        await prisma.productFact.upsert({
            where: { id: p.id },
            update: p,
            create: p,
        });
    }
    // 2. Create Demo User (Aarav Sharma)
    const user = await prisma.user.upsert({
        where: { email: 'aarav@demo.com' },
        update: {},
        create: {
            email: 'aarav@demo.com',
            passwordHash: 'hashed_password_demo', // mock
            profile: {
                create: {
                    name: 'Aarav Sharma',
                    age: 32,
                    city: 'Chennai',
                    occupation: 'IT Professional (Salaried)',
                    language: 'en',
                    accountNo: 'IDBI-8492019482',
                    branch: 'IDBI Bank — Anna Nagar Branch, Chennai',
                }
            }
        }
    });
    // 3. Create Goals for User
    const goals = [
        { name: 'Retirement Corpus', target: 30000000, current: 420000, targetYear: 2054, category: 'Retirement', status: 'Building' },
        { name: 'Emergency Fund', target: 500000, current: 150000, targetYear: 2027, category: 'Safety', status: 'Behind' },
        { name: 'Child Education', target: 5000000, current: 300000, targetYear: 2040, category: 'Education', status: 'On track' },
    ];
    await prisma.goal.deleteMany({ where: { userId: user.id } }); // reset
    for (const g of goals) {
        await prisma.goal.create({
            data: { ...g, userId: user.id }
        });
    }
    // 4. Create Transactions for User
    // Generate basic seed transactions for the past 2 months
    await prisma.transaction.deleteMany({ where: { userId: user.id } }); // reset
    const txns = [];
    const months = ['2026-05', '2026-06'];
    for (const month of months) {
        txns.push({ userId: user.id, date: new Date(`${month}-01`), description: 'Salary Credit — TechCorp Global', category: 'Income', amount: 95000, type: 'credit', isDiscretionary: false });
        txns.push({ userId: user.id, date: new Date(`${month}-03`), description: 'Rent Transfer — Landlord Housing', category: 'Rent', amount: 25000, type: 'debit', isDiscretionary: false });
        // Groceries
        txns.push({ userId: user.id, date: new Date(`${month}-04`), description: 'BigBasket Organic', category: 'Groceries', amount: 3500, type: 'debit', isDiscretionary: false });
        txns.push({ userId: user.id, date: new Date(`${month}-10`), description: 'DMart Superstore', category: 'Groceries', amount: 3800, type: 'debit', isDiscretionary: false });
        txns.push({ userId: user.id, date: new Date(`${month}-17`), description: 'Fresh Vegetable Market', category: 'Groceries', amount: 3200, type: 'debit', isDiscretionary: false });
        txns.push({ userId: user.id, date: new Date(`${month}-24`), description: 'Reliance Fresh Supermarket', category: 'Groceries', amount: 3500, type: 'debit', isDiscretionary: false });
        // Dining
        txns.push({ userId: user.id, date: new Date(`${month}-06`), description: 'Zomato Gourmet', category: 'Dining', amount: 1800, type: 'debit', isDiscretionary: true });
        txns.push({ userId: user.id, date: new Date(`${month}-13`), description: 'Café Coffee Day', category: 'Dining', amount: 1200, type: 'debit', isDiscretionary: true });
        txns.push({ userId: user.id, date: new Date(`${month}-20`), description: 'Swiggy Instamart Dining', category: 'Dining', amount: 1500, type: 'debit', isDiscretionary: true });
        txns.push({ userId: user.id, date: new Date(`${month}-27`), description: 'Barbeque Nation', category: 'Dining', amount: 1500, type: 'debit', isDiscretionary: true });
        // Bills
        txns.push({ userId: user.id, date: new Date(`${month}-05`), description: 'Electricity Bill — TANGEDCO', category: 'Bills', amount: 2200, type: 'debit', isDiscretionary: false });
        txns.push({ userId: user.id, date: new Date(`${month}-08`), description: 'Mobile Postpaid — Jio Fiber', category: 'Bills', amount: 799, type: 'debit', isDiscretionary: false });
        txns.push({ userId: user.id, date: new Date(`${month}-10`), description: 'Broadband Fiber — ACT', category: 'Bills', amount: 1100, type: 'debit', isDiscretionary: false });
        txns.push({ userId: user.id, date: new Date(`${month}-15`), description: 'Water & Maintenance Utility', category: 'Bills', amount: 1401, type: 'debit', isDiscretionary: false });
        // Subscriptions
        txns.push({ userId: user.id, date: new Date(`${month}-01`), description: 'Netflix Premium 4K', category: 'Subscriptions', amount: 649, type: 'debit', isDiscretionary: true });
    }
    await prisma.transaction.createMany({
        data: txns
    });
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
