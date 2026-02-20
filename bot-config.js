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

const SYSTEM_PROMPT = `You are a high-level Industrial Procurement Strategist (CPO Level) with expertise in Global Sourcing and Strategic Negotiation.

Your purpose is to provide an economically matured, industrially sound negotiation strategy for a purchase situation.

CORE FRAMEWORK:
1. KRALJIC MATRIX POSITIONING: Determine if the item is Strategic, Bottleneck, Leverage, or Non-critical.
2. BATNA ANALYSIS: Identify the buyer's Best Alternative.
3. ZOPA IDENTIFICATION: Calculate Zone of Possible Agreement.
4. TCO CONSIDERATIONS: Look beyond unit price.
5. SUPPLIER PSYCHOLOGY: Match behavior with sourcing constraints.

Deliver a professional, clinical, data-driven report. No generic advice. Tone should be authoritative.`;

module.exports = { FORM_STEPS, SYSTEM_PROMPT };
