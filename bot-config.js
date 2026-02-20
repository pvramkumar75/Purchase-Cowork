const FORM_STEPS = [
    { key: 'itemName', label: '📦 Item / Part Name', type: 'text', category: 'General' },
    { key: 'supplierName', label: '🏢 Supplier Name', type: 'text', category: 'General' },

    { key: 'lastPrice', label: '💰 Last Purchase Price', type: 'number', category: 'Price' },
    { key: 'currentQuote', label: '📈 Vendor Current Quote', type: 'number', category: 'Price' },
    { key: 'targetPrice', label: '🎯 Target / Expected Price', type: 'number', category: 'Price' },
    { key: 'annualQuantity', label: '📊 Annual Quantity', type: 'text', category: 'Price' },
    { key: 'costKnowledge', label: '🔍 Vendor Cost Knowledge', type: 'select', options: ['None', 'Rough', 'Detailed'] },
    { key: 'rmTrend', label: '📉 Raw Material Trend', type: 'select', options: ['Decrease %', 'Stable', 'Increase %'] },

    { key: 'stock', label: '📦 Current Stock', type: 'select', options: ['Less than 3 days', '1 week', '2-4 weeks', 'Safe'] },
    { key: 'stoppageRisk', label: '⚠️ Line Stoppage Risk', type: 'select', options: ['Immediate', 'This week', 'This month', 'No risk'] },
    { key: 'alternateTime', label: '⏱️ Alternate Approval Time', type: 'select', options: ['Approved', '2 weeks', '2 months', 'Not possible'] },
    { key: 'tooling', label: '🛠️ Tool Ownership', type: 'select', options: ['Company', 'Vendor', 'Shared', 'No tooling'] },

    { key: 'otherSuppliers', label: '🤝 Market Competition', type: 'select', options: ['None', 'Risky', '2-3 workable', 'Many'] },
    { key: 'vendorLoad', label: '🏭 Vendor Capacity Load', type: 'select', options: ['Overloaded', 'Normal', 'Hungry'] },
    { key: 'paymentTerms', label: '💳 Payment Terms', type: 'select', options: ['Advance', 'Short', 'Normal', 'Long'] },

    { key: 'responseSpeed', label: '⚡ Response Speed', type: 'select', options: ['Avoiding', 'Slow', 'Normal', 'Eager'] },
    { key: 'increaseReason', label: '❓ Reason for Increase', type: 'select', options: ['RM', 'Labour', 'Power', 'Demand', 'Unclear'] },
    { key: 'attitude', label: '🎭 Vendor Attitude', type: 'select', options: ['Defensive', 'Emotional', 'Aggressive', 'Cooperative', 'Bluff feel'] },
    { key: 'immediateAsk', label: '⏰ Pressure Level', type: 'select', options: ['Strong', 'Mild', 'No'] },

    { key: 'fixedOnVendor', label: '🔒 Sourcing Freedom', type: 'select', options: ['Fixed', 'Prefer', 'Free'] },
    { key: 'whyFixed', label: '🧐 Why Fixed', type: 'text' },
    { key: 'qtyFlexibility', label: '🔄 Quantity Flexibility', type: 'select', options: ['No', 'Partial', 'Yes'] },
    { key: 'specRelaxation', label: '⚙️ Spec Relaxation Possible', type: 'select', options: ['No', 'Maybe', 'Yes'] },
    { key: 'internalSupport', label: '📣 Internal Support', type: 'select', options: ['Strong', 'Neutral', 'Weak'] }
];

const SYSTEM_PROMPT = `You are a high-level Industrial Procurement Strategist (CPO Level). 
Your output must be a matured, professional industrial report.

CORE ANALYSIS REQUIRED:
1. KRALJIC POSITION: (Strategic, Bottleneck, Leverage, or Non-critical)
2. BATNA: (Your Best Alternative to This Negotiated Agreement)
3. ZOPA: (Zone of Possible Agreement based on price gap)
4. TCO: (Total Cost of Ownership considerations)

OUTPUT STRUCTURE:
- Position: [Kraljic Matrix Category]
- BATNA: [Your alternative plan]
- ZOPA: [Expected price range]
- Core Strategy: [Summary]
- Script: [What to say]
- Concession Limit: [Ceiling]

Tone: Clinical, data-driven, authoritative. Avoid excessive asterisks.`;

module.exports = { FORM_STEPS, SYSTEM_PROMPT };
