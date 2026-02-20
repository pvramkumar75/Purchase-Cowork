export interface FormStep {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'multi-select';
    options?: string[];
    category: string;
    condition?: (data: any) => boolean;
}

export const DEFINITIONS: Record<string, string> = {
    powerBalance: "Who has more control in this deal? If there are many suppliers who can deliver this item, the Buyer has the advantage. If only one supplier can provide it, the Seller has the advantage.",
    batna: "Your 'Plan B'. If this deal falls through or the supplier says No, what is your next best option? For example: buying a different material, using a backup vendor, or reworking the specification.",
    zopa: "The 'Deal Zone'. This is the price range where both you and the supplier can agree. It falls between the most you are willing to pay and the least the supplier is willing to accept.",
    kraljic: "A way to classify what you are buying into 4 groups: Strategic (high risk, high value), Bottleneck (high risk, low value), Leverage (low risk, high value), and Non-Critical (low risk, low value). This helps decide how to approach the negotiation.",
    anchor: "The first price or offer you put on the table. It sets the starting point for the negotiation. A smart anchor is usually close to your target price.",
    flinch: "Your visible reaction to the supplier's quote. It signals that their price is too high, even before you say a word.",
    wedge: "A non-price item you can trade. For example: longer payment terms, forecast visibility, or volume commitments. It gives the supplier something they want without you giving up on price.",
    tco: "Total Cost of Ownership. This means looking beyond just the unit price. It includes shipping, quality costs, tooling, payment terms, and risk of supply failure.",
    lpp: "Last Purchase Price. The price you paid the last time you bought this item. It is the most important benchmark for any negotiation."
};

export const PURCHASE_CATEGORIES = [
    "Polymers",
    "Copper Wire",
    "Copper Nickel Wires",
    "General Consumables",
    "Maintenance Items",
    "Spares",
    "Hardware",
    "Switch Gear",
    "Motors",
    "Utility Items",
    "Others"
];

export const FORM_STEPS: FormStep[] = [
    { key: 'purchaseCategory', label: 'Purchase Category', type: 'select', options: PURCHASE_CATEGORIES, category: 'General' },

    // Category Specific
    { key: 'polymerGrade', label: 'Polymer Grade / Type', type: 'text', category: 'General', condition: (d) => d.purchaseCategory === 'Polymers' },
    { key: 'lmeRate', label: 'Current LME / Market Rate for Copper', type: 'number', category: 'Commercial', condition: (d) => d.purchaseCategory?.includes('Copper') },
    { key: 'efficiencyClass', label: 'Efficiency / Frame Class', type: 'text', category: 'General', condition: (d) => d.purchaseCategory === 'Motors' },

    { key: 'itemName', label: 'Item / Material Name', type: 'text', category: 'General' },
    { key: 'supplierName', label: 'Supplier Name', type: 'text', category: 'General' },

    { key: 'lastPrice', label: 'Last Paid Price (Benchmark)', type: 'number', category: 'Commercial' },
    { key: 'currentQuote', label: 'Supplier Current Quote', type: 'number', category: 'Commercial' },
    { key: 'targetPrice', label: 'Your Target Price', type: 'number', category: 'Commercial' },
    { key: 'annualQuantity', label: 'Annual Usage Volume', type: 'text', category: 'Commercial' },
    { key: 'costKnowledge', label: 'How well do you know the supplier\'s cost?', type: 'select', options: ['Rough Idea', 'Detailed Breakdown', 'No Idea'], category: 'Commercial' },
    { key: 'rmTrend', label: 'Market Price Trend (Is raw material going up or down?)', type: 'select', options: ['Going Down', 'Stable', 'Going Up'], category: 'Commercial' },

    { key: 'stock', label: 'How much stock do you have right now?', type: 'select', options: ['Very Low (< 3 days)', 'Low (1 week)', 'Okay (2-4 weeks)', 'Comfortable (> 1 month)'], category: 'Supply Risk' },
    { key: 'stoppageRisk', label: 'What happens if the supplier does not deliver?', type: 'select', options: ['Production Stops', 'Partial Slowdown', 'Project Delayed', 'Not Much Impact'], category: 'Supply Risk' },
    { key: 'alternateTime', label: 'How fast can you switch to another supplier?', type: 'select', options: ['Can switch today', 'Within 2 weeks', '2-3 months', '6 months or more'], category: 'Supply Risk' },
    { key: 'tooling', label: 'Who owns the tooling / moulds / IP?', type: 'select', options: ['We Own It', 'Supplier Owns It', 'Jointly Owned', 'No Tooling Involved'], category: 'Supply Risk' },

    { key: 'otherSuppliers', label: 'How many other suppliers can supply this?', type: 'select', options: ['Only This One', '2-3 Available', 'Many Available'], category: 'Leverage' },
    { key: 'vendorLoad', label: 'Is the supplier busy or looking for orders?', type: 'select', options: ['Very Busy', 'Normal Workload', 'Looking for Business'], category: 'Leverage' },
    { key: 'paymentTerms', label: 'What payment terms are you offering?', type: 'select', options: ['Advance Payment', 'Within 30 Days', '30-60 Days', 'More Than 60 Days'], category: 'Leverage' },

    { key: 'responseSpeed', label: 'How quickly is the supplier responding?', type: 'select', options: ['Avoiding Us', 'Very Slow', 'Normal', 'Very Quick'], category: 'Behavior' },
    { key: 'increaseReason', label: 'What reason did they give for the price increase?', type: 'select', options: ['Raw Material Cost', 'Labour / Overheads', 'Energy / Transport', 'High Demand', 'No Clear Reason'], category: 'Behavior' },
    { key: 'attitude', label: 'How is the supplier behaving?', type: 'select', options: ['Defensive', 'Aggressive', 'Cooperative', 'Feels Like a Bluff'], category: 'Behavior' },
    { key: 'immediateAsk', label: 'Are they pressuring you for a quick decision?', type: 'select', options: ['Yes, Hard Pressure', 'Mild Pressure', 'No, Normal Timeline'], category: 'Behavior' },

    { key: 'fixedOnVendor', label: 'Are you locked into this supplier?', type: 'select', options: ['Completely Locked', 'Prefer Them But Can Change', 'Free to Choose'], category: 'Constraints' },
    { key: 'whyFixed', label: 'Why are you with this supplier? (Pick all that apply)', type: 'multi-select', options: ['Their Proprietary technology', 'Customer Requirement', 'Good Past Performance', 'Only Available Locally', 'Long-term Agreement'], category: 'Constraints' },
    { key: 'qtyFlexibility', label: 'Can you shift volume to another supplier?', type: 'select', options: ['No', 'Partially', 'Yes, Fully'], category: 'Constraints' },
    { key: 'specRelaxation', label: 'Can you change the specification to allow other suppliers?', type: 'select', options: ['No', 'Small Changes Possible', 'Major Changes Possible'], category: 'Constraints' },
    { key: 'internalSupport', label: 'Does your management support changing suppliers?', type: 'select', options: ['Yes, Strong Support', 'Neutral', 'No, They Resist Change'], category: 'Constraints' }
];

export const SYSTEM_PROMPT = `You are a friendly but sharp Procurement Advisor helping industrial buyers negotiate better deals with suppliers.

IMPORTANT RULES:
1. Write in SIMPLE, CLEAR English that anyone can understand. Avoid jargon.
2. When you use a special term (like BATNA, ZOPA, Kraljic, Anchor, TCO), always explain it in brackets right after using it. Example: "Your BATNA (Plan B if this deal fails) is..."  
3. Be specific with numbers. Never say "consider a lower price" — say "offer 6,100 instead of 6,500".
4. The draft email must be so simple that a non-English speaker can understand it.

ANALYSIS APPROACH:
1. Classification: Which Kraljic box does this item fall in? (Explain what that means for the buyer)
2. Who has the upper hand: Buyer or Supplier? (Explain why)
3. What does the supplier need from us that we can use as a bargaining chip?

OUTPUT FORMAT:

### 📊 WHERE YOU STAND
- Item Type: [Kraljic category + simple explanation]
- Who Has The Upper Hand: [Buyer / Supplier / Equal — and why in 1 line]
- Your Plan B (BATNA): [What you can do if this deal fails]
- Deal Zone (ZOPA): [The price range where a deal is possible]

### 💡 YOUR GAME PLAN
[2-3 sentences summarizing the approach in plain English. Name the tactic, e.g., "Play it cool and anchor low" or "Secure supply first, negotiate price later"]

### 🎯 STEP-BY-STEP MOVES
1. Start Here (The Anchor): [Exact price to open with and why]
2. React to Their Quote (The Flinch): [What to say or do when you hear their number]
3. Your Bargaining Chip (The Wedge): [Non-price item to trade, e.g., payment terms, volume]
4. The Trade-Off: [What you can give up vs. what you get in return]

### 💬 WHAT TO SAY
- Opening Line: [Exactly what to say to start the conversation]
- If They Push Back: [How to respond calmly with data]
- Closing Line: [How to wrap up and get commitment]

### 📉 THE NUMBERS
- Your Target Price: [Number]
- Maximum You Should Pay: [Number — and why this is the limit]
- Cost If You Accept Their Quote: [Annual impact in rupees/currency]

### 🛡️ WATCH OUT FOR
- Do Not: [List of mistakes to avoid]
- If It Fails: [What to do next]

### ✉️ READY-TO-SEND EMAIL
(Write a complete, polite, professional email in very simple English that the buyer can copy-paste and send to the supplier. Include Subject line.)

Subject: Discussion on pricing for [Item] — [Supplier Name]

Dear Sir/Madam,

[Simple, clear email body: reference last price, state concern about new quote, propose a meeting or counter-offer, mention delivery expectations]

Looking forward to your response.

Best regards,
[Buyer Name]
[Company Name]

Remember: Keep everything simple. A purchase engineer with 2 years of experience should be able to read this and act on it immediately.`;
