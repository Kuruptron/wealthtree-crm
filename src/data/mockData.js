export const clients = [
  { id: 1, name: 'Rajesh Kumar', pan: 'ABCPK1234D', email: 'rajesh.k@email.com', phone: '9876543210', dob: '1975-03-15', city: 'Mumbai', aum: 4500000, status: 'Active', lastContact: '2026-05-20', returns: 12.4, riskProfile: 'Moderate', family: 'Kumar Family', sip: 50000, folios: 8 },
  { id: 2, name: 'Priya Sharma', pan: 'BCDPS5678E', email: 'priya.s@email.com', phone: '9765432109', dob: '1982-07-22', city: 'Bangalore', aum: 7850000, status: 'Active', lastContact: '2026-05-18', returns: 8.7, riskProfile: 'Conservative', family: 'Sharma Family', sip: 75000, folios: 12 },
  { id: 3, name: 'Amit Patel', pan: 'CDEAP9012F', email: 'amit.p@email.com', phone: '9654321098', dob: '1968-11-05', city: 'Ahmedabad', aum: 12500000, status: 'Active', lastContact: '2026-05-22', returns: 15.2, riskProfile: 'Aggressive', family: 'Patel Family', sip: 120000, folios: 18 },
  { id: 4, name: 'Sneha Reddy', pan: 'DEFSR3456G', email: 'sneha.r@email.com', phone: '9543210987', dob: '1990-02-14', city: 'Hyderabad', aum: 5675000, status: 'Review', lastContact: '2026-05-15', returns: 6.3, riskProfile: 'Moderate', family: 'Reddy Family', sip: 30000, folios: 6 },
  { id: 5, name: 'Vikram Singh', pan: 'EFGVS7890H', email: 'vikram.s@email.com', phone: '9432109876', dob: '1971-09-28', city: 'Delhi', aum: 9200000, status: 'Active', lastContact: '2026-05-21', returns: 10.8, riskProfile: 'Moderate', family: 'Singh Family', sip: 90000, folios: 14 },
  { id: 6, name: 'Meera Nair', pan: 'FGHMN2345I', email: 'meera.n@email.com', phone: '9321098765', dob: '1985-06-10', city: 'Kochi', aum: 3200000, status: 'Active', lastContact: '2026-05-19', returns: 9.1, riskProfile: 'Conservative', family: 'Nair Family', sip: 25000, folios: 5 },
];

export const interactions = [
  { id: 1, clientId: 1, clientName: 'Rajesh Kumar', type: 'Meeting', date: '2026-05-20', summary: 'Quarterly portfolio review. Client happy with returns. Discussed adding ₹5L to HDFC Flexi Cap.', tags: ['review', 'portfolio'], loggedBy: 'Sachin' },
  { id: 2, clientId: 2, clientName: 'Priya Sharma', type: 'Call', date: '2026-05-18', summary: 'Called to check on SIP mandate renewal. Upcoming SIP of ₹25k needs NACH re-registration.', tags: ['sip', 'mandate'], loggedBy: 'Sachin' },
  { id: 3, clientId: 1, clientName: 'Rajesh Kumar', type: 'AMC Meeting', date: '2026-05-10', summary: 'Met HDFC AMC RM. Discussed fund performance and manager outlook on IT sector.', tags: ['amc', 'hdfc'], loggedBy: 'Sachin' },
  { id: 4, clientId: 3, clientName: 'Amit Patel', type: 'Meeting', date: '2026-05-22', summary: 'Annual review. Client wants to increase equity exposure ahead of anticipated rate cuts. Recommended adding to Parag Parikh Flexi Cap.', tags: ['review', 'equity'], loggedBy: 'Sachin' },
  { id: 5, clientId: 4, clientName: 'Sneha Reddy', type: 'Email', date: '2026-05-15', summary: 'Sent portfolio statement and XIRR summary for FY25. Client asked about debt fund options for 1-year horizon.', tags: ['statement', 'debt'], loggedBy: 'Sachin' },
  { id: 6, clientId: 5, clientName: 'Vikram Singh', type: 'Call', date: '2026-05-21', summary: 'Discussed tariff impact on US-exposed funds. Client nervous about global exposure. Reassured on domestic-focused allocation.', tags: ['macro', 'global'], loggedBy: 'Sachin' },
];

export const knowledgeEntries = [
  { id: 1, title: 'The Psychology of Money', type: 'Book', author: 'Morgan Housel', date: '2026-04-10', tags: ['behavioural-finance', 'investing'], summary: 'Wealth is not about intelligence, it\'s about behaviour. Time in market, compounding, and not interrupting unnecessarily are the biggest alpha generators.', highlights: ['Saving is the gap between ego and income', 'Getting wealthy and staying wealthy are different skills', 'Room for error is the most underappreciated concept in finance'] },
  { id: 2, title: 'RBI MPC April 2026 — Rate Cut Impact on Debt Funds', type: 'Research', author: 'Internal', date: '2026-04-10', tags: ['rbi', 'debt', 'rates'], summary: 'RBI cut repo rate by 25bps to 6.0%. Duration funds will benefit. Recommended increasing allocation to medium-duration and gilt funds in client portfolios with 2+ year horizon.', highlights: [] },
  { id: 3, title: 'Tariffs & Emerging Markets — How to Think About It', type: 'Article', author: 'ET Markets', date: '2026-04-06', tags: ['macro', 'emerging-markets', 'tariffs'], summary: 'US tariff escalation creates short-term volatility but India is better positioned than peers due to domestic consumption story and low direct export exposure to US.', highlights: ['India exports to US = ~2% of GDP', 'IT sector most vulnerable', 'Domestic consumption theme still intact'] },
  { id: 4, title: 'Parag Parikh Flexicap Fund — Manager Interaction', type: 'AMC Note', author: 'Internal', date: '2026-03-20', tags: ['ppfas', 'flexi-cap', 'amc'], summary: 'Interaction with Rajeev Thakkar. Confident on long-term India story. Cautious on valuations, sitting on 15% cash. Will deploy on corrections. Comfortable recommending.', highlights: [] },
];

export const introspectionLogs = [
  { id: 1, title: 'RBI Rate Cut — April 2026', date: '2026-04-09', event: 'MPC Meeting', mood: 'Cautiously Optimistic', body: 'RBI cut rates as expected. We had positioned client debt portfolios correctly — the gilt and duration funds will see MTM gains. The question now is: does this signal the beginning of a rate cycle or a one-off? Our read is that there\'s room for 2 more cuts in FY27. Long duration remains a hold.', tags: ['rbi', 'rates', 'debt'] },
  { id: 2, title: 'US Tariff Escalation — Market Reaction', date: '2026-04-04', event: 'Macro Shock', mood: 'Cautious', body: 'Markets sold off 3-4% intraday. Our client calls spiked. We did not sell anything. The sell-off is an overreaction to a policy that India is largely insulated from. We communicated this clearly to all clients. Clients who panicked in March 2020 are the same ones calling today. The playbook is the same: don\'t interrupt compounding.', tags: ['tariffs', 'equity', 'volatility'] },
  { id: 3, title: 'Reflecting on FY25 — What We Got Right and Wrong', date: '2026-04-01', event: 'Year End Review', mood: 'Reflective', body: 'What we got right: staying overweight domestic consumption, underweighting IT early. What we got wrong: moved out of small cap too early, left 4-5% on the table. Lesson: our macro framework is solid but we need to hold positions longer before rebalancing.', tags: ['fy25', 'review', 'learnings'] },
];

export const sops = [
  {
    id: 1, title: 'New Client Onboarding', category: 'Onboarding', lastUpdated: '2026-03-15',
    steps: [
      { id: 1, text: 'Collect PAN, Aadhaar, cancelled cheque', done: false },
      { id: 2, text: 'Complete KYC via CAMS Online / KFintech', done: false },
      { id: 3, text: 'Complete risk profiling questionnaire', done: false },
      { id: 4, text: 'Register on BSE Star MF / MFU platform', done: false },
      { id: 5, text: 'Setup NACH mandate for SIP', done: false },
      { id: 6, text: 'Create client profile in Wealthtree CRM', done: false },
      { id: 7, text: 'Send welcome email with portal access', done: false },
      { id: 8, text: 'Schedule first portfolio review (3 months)', done: false },
    ]
  },
  {
    id: 2, title: 'Quarterly Portfolio Review', category: 'Review', lastUpdated: '2026-02-10',
    steps: [
      { id: 1, text: 'Pull portfolio report from CAMS/KFintech', done: false },
      { id: 2, text: 'Calculate XIRR and compare vs benchmark', done: false },
      { id: 3, text: 'Identify underperforming schemes (>6 months)', done: false },
      { id: 4, text: 'Prepare rebalancing recommendations if needed', done: false },
      { id: 5, text: 'Schedule meeting / call with client', done: false },
      { id: 6, text: 'Present review and get client sign-off', done: false },
      { id: 7, text: 'Execute any changes via BSE Star MF', done: false },
      { id: 8, text: 'Log interaction in CRM', done: false },
    ]
  },
  {
    id: 3, title: 'SIP Setup', category: 'Transactions', lastUpdated: '2026-01-20',
    steps: [
      { id: 1, text: 'Confirm fund selection with client', done: false },
      { id: 2, text: 'Verify NACH mandate is active and limit sufficient', done: false },
      { id: 3, text: 'Place SIP order on BSE Star MF / MFU', done: false },
      { id: 4, text: 'Confirm first installment date with client', done: false },
      { id: 5, text: 'Update CRM with SIP details', done: false },
      { id: 6, text: 'Set reminder for first installment verification', done: false },
    ]
  },
];

export const tasks = [
  { id: 1, title: 'Quarterly portfolio review', clientId: 1, client: 'Rajesh Kumar', priority: 'High', due: '2026-05-25', status: 'Pending', type: 'Review' },
  { id: 2, title: 'KYC renewal — documents expire Jun 2026', clientId: 2, client: 'Priya Sharma', priority: 'High', due: '2026-05-28', status: 'In Progress', type: 'Compliance' },
  { id: 3, title: 'Rebalancing recommendation', clientId: 3, client: 'Amit Patel', priority: 'High', due: '2026-05-24', status: 'Pending', type: 'Advisory' },
  { id: 4, title: 'Tax planning consultation FY27', clientId: 4, client: 'Sneha Reddy', priority: 'Low', due: '2026-06-01', status: 'Scheduled', type: 'Advisory' },
  { id: 5, title: 'NACH mandate renewal', clientId: 2, client: 'Priya Sharma', priority: 'Medium', due: '2026-05-30', status: 'Pending', type: 'Operations' },
  { id: 6, title: 'Annual review call', clientId: 5, client: 'Vikram Singh', priority: 'Medium', due: '2026-06-05', status: 'Scheduled', type: 'Review' },
];

export const macroIndicators = [
  { label: 'Repo Rate', value: '6.00%', change: -0.25, unit: '', category: 'RBI' },
  { label: 'CPI Inflation', value: '4.2%', change: -0.3, unit: '', category: 'RBI' },
  { label: '10Y G-Sec', value: '6.82%', change: -0.08, unit: '', category: 'Rates' },
  { label: 'USD/INR', value: '83.45', change: 0.12, unit: '', category: 'Currency' },
  { label: 'India VIX', value: '14.2', change: -1.8, unit: '', category: 'Equity' },
  { label: 'FII Flow (MTD)', value: '+₹8,420Cr', change: null, unit: '', category: 'Flows' },
  { label: 'DII Flow (MTD)', value: '+₹12,310Cr', change: null, unit: '', category: 'Flows' },
  { label: 'Gold (MCX)', value: '₹71,450', change: 0.8, unit: '/10g', category: 'Commodity' },
];
