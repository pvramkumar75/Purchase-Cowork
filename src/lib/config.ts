export interface FormStep {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'multi-select';
    options?: string[];
    category: string;
    condition?: (data: any) => boolean;
}

export const DEFINITIONS = {
    powerBalance: "Who has more 'say' in the price? If there are many suppliers, the Buyer wins. If only one supplier has the item, the Seller wins.",
    batna: "Your 'Plan B'. If this supplier says No, what is your next best option? (e.g., buying a different material, using a back-up vendor, or delaying the project).",
    zopa: "The 'Deal Zone'. It is the price range between the highest you will pay and the lowest the seller will accept."
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

    // Category Specific Questions
    { key: 'polymerGrade', label: 'Polymer Grade / Type', type: 'text', category: 'General', condition: (d) => d.purchaseCategory === 'Polymers' },
    { key: 'lmeRate', label: 'Current LME / Market Rate for Copper', type: 'number', category: 'Commercial', condition: (d) => d.purchaseCategory?.includes('Copper') },
    { key: 'efficiencyClass', label: 'Efficiency / Frame Class', type: 'text', category: 'General', condition: (d) => d.purchaseCategory === 'Motors' },

    { key: 'itemName', label: 'Item / Material Name', type: 'text', category: 'General' },
    { key: 'supplierName', label: 'Supplier Name', type: 'text', category: 'General' },

    { key: 'lastPrice', label: 'Benchmark Price (Last Paid / Market Rate)', type: 'number', category: 'Commercial' },
    { key: 'currentQuote', label: 'Vendor Current Quote', type: 'number', category: 'Commercial' },
    { key: 'targetPrice', label: 'Target / Baseline Price', type: 'number', category: 'Commercial' },
    { key: 'annualQuantity', label: 'Annual Usage / Consumption Volume', type: 'text', category: 'Commercial' },
    { key: 'costKnowledge', label: 'Should-Cost Knowledge (Our understanding of their cost)', type: 'select', options: ['High Level', 'Detailed Breakdown', 'No Visibility'], category: 'Commercial' },
    { key: 'rmTrend', label: 'Market / Input Cost Trend (Commodity/Labour Trends)', type: 'select', options: ['Decreasing', 'Stable', 'Increasing'], category: 'Commercial' },

    { key: 'stock', label: 'Supply Coverage (Inventory / Lead-time Buffer)', type: 'select', options: ['Critical (<3 days)', 'Low (1 week)', 'Moderate (2-4 weeks)', 'Secure (>1 month)'], category: 'Supply Risk' },
    { key: 'stoppageRisk', label: 'Business Interruption Risk (Impact of non-delivery)', type: 'select', options: ['Total Stoppage', 'Partial Impact', 'Delayed Project', 'Limited Risk'], category: 'Supply Risk' },
    { key: 'alternateTime', label: 'Time to Switch Source (Switching Speed)', type: 'select', options: ['Switchable Today', '2 weeks (Fast)', '2-3 months (Medium)', '6 months+ (Locked)'], category: 'Supply Risk' },
    { key: 'tooling', label: 'Ownership of Specific Assets (IP/Moulds/Software/Hardware)', type: 'select', options: ['Company Owned', 'Vender Owned', 'Jointly Owned', 'No Specific Assets'], category: 'Supply Risk' },

    { key: 'otherSuppliers', label: 'Market Alternates (Qualified Competitors)', type: 'select', options: ['Sole Source', '2-3 Qualified', 'Many Qualified', 'Highly Monopolistic'], category: 'Leverage' },
    { key: 'vendorLoad', label: 'Supplier Capacity Load (How busy are they?)', type: 'select', options: ['Near Capacity', 'Normal Operation', 'Seeking Volume (Hungry)'], category: 'Leverage' },
    { key: 'paymentTerms', label: 'Commercial Terms (Payment Days/Credit)', type: 'select', options: ['Pre-payment', 'Short Terms (<30)', 'Normal Terms (30-60)', 'Extended Terms (>60)'], category: 'Leverage' },

    { key: 'responseSpeed', label: 'Supplier Engagement Speed', type: 'select', options: ['Avoiding / Strategic Delay', 'Slow / Bureaucratic', 'Responsive', 'Very Proactive'], category: 'Behavior' },
    { key: 'increaseReason', label: 'Stated Reason for Increase', type: 'select', options: ['Material / Commodity', 'Labour / Overheads', 'Energy / Logistics', 'Market Shortage', 'No Clear Reason'], category: 'Behavior' },
    { key: 'attitude', label: 'Supplier Communication Style', type: 'select', options: ['Defensive', 'Aggressive', 'Partnership Driven', 'Bluff feel'], category: 'Behavior' },
    { key: 'immediateAsk', label: 'Level of Pressure for Immediate Decision', type: 'select', options: ['Hard Ultimatum', 'Mild Pressure', 'Standard Quote Time'], category: 'Behavior' },

    { key: 'fixedOnVendor', label: 'Technical Lock-in Level', type: 'select', options: ['Totally Locked', 'Prefer this Source', 'Open to Change'], category: 'Constraints' },
    { key: 'whyFixed', label: 'Primary Constraint (Why are we with them?)', type: 'multi-select', options: ['Proprietary IP', 'Customer Specified', 'Past Performance', 'Specialized Geo', 'Framework Agreement'], category: 'Constraints' },
    { key: 'qtyFlexibility', label: 'Our Volume Flexibility (Can we move volume?)', type: 'select', options: ['Strict (No)', 'Partial Shift', 'Full Flexibility (Yes)'], category: 'Constraints' },
    { key: 'specRelaxation', label: 'Specification Flexibility (Can we change requirements?)', type: 'select', options: ['No Flexibility', 'Minor Changes', 'Major Re-spec Possible'], category: 'Constraints' },
    { key: 'internalSupport', label: 'Internal Stakeholder Alignment', type: 'select', options: ['Strong Support to Change', 'Neutral / Cautious', 'Resistant to Change'], category: 'Constraints' }
];

export const SYSTEM_PROMPT = `You are a world-class Industrial Procurement Specialist (CPO Level). 
Your output must be a clinical, high-stakes negotiation playbook. 

CORE ANALYSIS:
1. POSITION: Kraljic (Strategic/Bottleneck/Leverage/Non-critical).
2. POWER BALANCE: Who truly holds the cards based on lead-times, stock, and alternates.
3. THE WEDGE: Identify what the supplier needs more than cash (e.g., capacity utilization, predictability, reference value).

OUTPUT STRUCTURE (Industrial Standard):

### 📊 STRATEGIC POSITIONING
- Matrix Category: [Category]
- Power Balance: [Balance]
- BATNA: [Alternative plan]
- ZOPA: [Zone of possible agreement]

### 💡 THE CORE STRATEGY
[Executive summary of the psychological approach. E.g., "The Reluctant Buyer" or "The Volume Anchor".]

### 🎯 TACTICAL MOVES (The Playbook)
1. THE ANCHOR: [Specific price/starting point to set the baseline]
2. THE FLINCH: [How to react to their quote to signal a limit]
3. THE WEDGE: [What non-price item to ask for or yield to gain leverage]
4. THE TRADE-OFF: [E.g., Price vs Payment Terms vs Forecast Visibility]

### 💬 NEGOTIATION TALK TRACKS
- Opening Statement: [Objective, data-driven lead-in]
- Handling Resistance: [How to bypass their "Standard Cost" or "RM Increase" excuses without confrontation]
- The Close: [How to lock the delivery date and price together]

### 📉 FINANCIAL IMPACT & LIMITS
- Target Price: [Target]
- Max Ceiling: [Ceiling]
- Trade-off Valuations: [Value of payment terms or qty shifts]

### 🛡️ RISK & ALTERNATIVES
- Avoid: [Low-leverage behaviors]
- Next Step: [The "Walk" or the "Sign"]

### ✉️ DRAFT NEGOTIATION EMAIL
(Please provide a ready-to-use email for the supplier in simple, polite, and precise English)
Subject: Regarding our discussion on [Item Name] - [Supplier Name]

Dear [Name],

[Email body summarizing the proposal, price target, and delivery requirements in simple English]

Best regards,
[Name]

Tone: Authoritative, clinical, focused on economic gain and relationship control. Use procurement terminology like LPP, TCO, and Rebates. The email part should be very simple and polite.`;
