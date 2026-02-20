const DEFINITIONS = {
    powerBalance: "Who has more leverage in the deal? If many suppliers, the Buyer wins. If only one supplier, the Seller wins.",
    batna: "Plan B: What is your next best option if this deal fails?",
    zopa: "Deal Zone: The price range between your ceiling and their floor."
};

const PURCHASE_CATEGORIES = [
    "Polymers", "Copper Wire", "Copper Nickel Wires", "General Consumables",
    "Maintenance Items", "Spares", "Hardware", "Switch Gear",
    "Motors", "Utility Items", "Others"
];

const FORM_STEPS = [
    { key: 'purchaseCategory', label: '📊 Selection Category', type: 'select', options: PURCHASE_CATEGORIES },
    { key: 'itemName', label: '📦 Item / Material Name', type: 'text' },
    { key: 'supplierName', label: '🏢 Supplier Name', type: 'text' },

    { key: 'lastPrice', label: '💰 Benchmark Price (Last Paid / Market Rate)', type: 'number', category: 'Commercial' },
    { key: 'currentQuote', label: '📈 Vendor Current Quote', type: 'number', category: 'Commercial' },
    { key: 'targetPrice', label: '🎯 Target / Baseline Price', type: 'number', category: 'Commercial' },
    { key: 'annualQuantity', label: '📊 Annual Usage / Consumption Volume', type: 'text', category: 'Commercial' },
    { key: 'costKnowledge', label: '🔍 Should-Cost Knowledge', type: 'select', options: ['High Level', 'Detailed Breakdown', 'No Visibility'] },
    { key: 'rmTrend', label: '📈 Market / Input Cost Trend', type: 'select', options: ['Decreasing', 'Stable', 'Increasing'] },

    { key: 'stock', label: '🛡️ Supply Coverage (Inventory / Buffer)', type: 'select', options: ['Critical (<3 days)', 'Low (1 week)', 'Moderate (2-4 weeks)', 'Secure (>1 month)'] },
    { key: 'stoppageRisk', label: '⚠️ Business Interruption Risk', type: 'select', options: ['Total Stoppage', 'Partial Impact', 'Delayed Project', 'Limited Risk'] },
    { key: 'alternateTime', label: '⏱️ Time to Switch Source', type: 'select', options: ['Switchable Today', '2 weeks (Fast)', '2-3 months (Medium)', '6 months+ (Locked)'] },
    { key: 'tooling', label: '🛠️ Ownership of Specific Assets (IP/Moulds)', type: 'select', options: ['Company Owned', 'Vender Owned', 'Jointly Owned', 'No Specific Assets'] },

    { key: 'otherSuppliers', label: '🤝 Market Alternates (Qualified Competitors)', type: 'select', options: ['Sole Source', '2-3 Qualified', 'Many Qualified', 'Highly Monopolistic'] },
    { key: 'vendorLoad', label: '🏭 Supplier Capacity Load', type: 'select', options: ['Near Capacity', 'Normal Operation', 'Seeking Volume (Hungry)'] },
    { key: 'paymentTerms', label: '💳 Commercial Terms (Payment/Credit)', type: 'select', options: ['Pre-payment', 'Short Terms (<30)', 'Normal Terms (30-60)', 'Extended Terms (>60)'] },

    { key: 'responseSpeed', label: '⚡ Supplier Engagement Speed', type: 'select', options: ['Avoiding / Strategic Delay', 'Slow / Bureaucratic', 'Responsive', 'Very Proactive'] },
    { key: 'increaseReason', label: '❓ Stated Reason for Increase', type: 'select', options: ['Material / Commodity', 'Labour / Overheads', 'Energy / Logistics', 'Market Shortage', 'No Clear Reason'] },
    { key: 'attitude', label: '🗣️ Supplier Communication Style', type: 'select', options: ['Defensive', 'Aggressive', 'Partnership Driven', 'Bluff feel'] },
    { key: 'immediateAsk', label: '⏰ Level of Pressure', type: 'select', options: ['Hard Ultimatum', 'Mild Pressure', 'Standard Quote Time'] },

    { key: 'fixedOnVendor', label: '🔒 Technical Lock-in Level', type: 'select', options: ['Totally Locked', 'Prefer this Source', 'Open to Change'] },
    { key: 'whyFixed', label: '🧐 Primary Constraint (Why are we fixed?)', type: 'select', options: ['Proprietary IP', 'Customer Specified', 'Past Performance', 'Specialized Geo', 'Framework Agreement'] },
    { key: 'qtyFlexibility', label: '🔄 Volume Flexibility (Can we move volume?)', type: 'select', options: ['Strict (No)', 'Partial Shift', 'Full Flexibility (Yes)'] },
    { key: 'specRelaxation', label: '🧪 Requirement Flexibility', type: 'select', options: ['No Flexibility', 'Minor Changes', 'Major Re-spec Possible'] },
    { key: 'internalSupport', label: '📣 Internal Stakeholder Alignment', type: 'select', options: ['Strong Support to Change', 'Neutral / Cautious', 'Resistant to Change'] }
];

const SYSTEM_PROMPT = `You are a world-class Industrial Procurement Specialist (CPO Level). 
Your output must be a clinical, high-stakes negotiation playbook. 

CORE ANALYSIS:
1. POSITION: Kraljic Category.
2. POWER BALANCE: Diagnosis of leverage.
3. THE WEDGE: What the supplier needs more than cash.

OUTPUT STRUCTURE:
- Position: [Kraljic Category]
- Strategy: [Summary of the approach]
- The Anchor: [Starting price/target]
- Tactical Move: [Specific move e.g. The Flinch, The Wedge]
- Talk Track: [Objective statement for the call]
- Resistance Handling: [How to handle their excuses]

Tone: Clinical, authoritative, focused on economic gain. Use terms like LPP, TCO, and Rebates.`;

module.exports = { FORM_STEPS, SYSTEM_PROMPT, DEFINITIONS, PURCHASE_CATEGORIES };
