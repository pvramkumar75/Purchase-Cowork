export interface FormStep {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'multi-select';
    options?: string[];
    category: string;
}

export const FORM_STEPS: FormStep[] = [
    { key: 'itemName', label: 'Item / Part Name', type: 'text', category: 'General' },
    { key: 'supplierName', label: 'Supplier Name', type: 'text', category: 'General' },

    { key: 'lastPrice', label: 'Last Purchase Price', type: 'number', category: 'Price' },
    { key: 'currentQuote', label: 'Vendor Current Quote', type: 'number', category: 'Price' },
    { key: 'targetPrice', label: 'Target / Expected Price', type: 'number', category: 'Price' },
    { key: 'annualQuantity', label: 'Annual Quantity', type: 'text', category: 'Price' },
    { key: 'costKnowledge', label: 'Vendor Cost Knowledge', type: 'select', options: ['None', 'Rough', 'Detailed'], category: 'Price' },
    { key: 'rmTrend', label: 'Raw Material Trend', type: 'select', options: ['Decrease %', 'Stable', 'Increase %'], category: 'Price' },

    { key: 'stock', label: 'Current Stock', type: 'select', options: ['Less than 3 days', '1 week', '2-4 weeks', 'Safe'], category: 'Supply' },
    { key: 'stoppageRisk', label: 'Line Stoppage Risk', type: 'select', options: ['Immediate', 'This week', 'This month', 'No risk'], category: 'Supply' },
    { key: 'alternateTime', label: 'Alternate Approval Time', type: 'select', options: ['Approved', '2 weeks', '2 months', 'Not possible'], category: 'Supply' },
    { key: 'tooling', label: 'Tool Ownership', type: 'select', options: ['Company', 'Vendor', 'Shared', 'No tooling'], category: 'Supply' },

    { key: 'otherSuppliers', label: 'Other Suppliers', type: 'select', options: ['None', 'Risky', '2-3 workable', 'Many'], category: 'Vendor' },
    { key: 'vendorLoad', label: 'Vendor Load', type: 'select', options: ['Overloaded', 'Normal', 'Hungry'], category: 'Vendor' },
    { key: 'paymentTerms', label: 'Payment Terms', type: 'select', options: ['Advance', 'Short', 'Normal', 'Long'], category: 'Vendor' },

    { key: 'responseSpeed', label: 'Response Speed', type: 'select', options: ['Avoiding', 'Slow', 'Normal', 'Eager'], category: 'Behavior' },
    { key: 'increaseReason', label: 'Reason for Increase', type: 'select', options: ['RM', 'Labour', 'Power', 'Demand', 'Unclear'], category: 'Behavior' },
    { key: 'attitude', label: 'Attitude', type: 'select', options: ['Defensive', 'Emotional', 'Aggressive', 'Cooperative', 'Bluff feel'], category: 'Behavior' },
    { key: 'immediateAsk', label: 'Asking Immediate Confirmation', type: 'select', options: ['Strong', 'Mild', 'No'], category: 'Behavior' },

    { key: 'fixedOnVendor', label: 'Company Fixed on Vendor', type: 'select', options: ['Fixed', 'Prefer', 'Free'], category: 'Constraint' },
    { key: 'whyFixed', label: 'Why Fixed', type: 'multi-select', options: ['Customer spec', 'Design', 'Reliability', 'Management', 'Agreement'], category: 'Constraint' },
    { key: 'qtyFlexibility', label: 'Quantity Flexibility', type: 'select', options: ['No', 'Partial', 'Yes'], category: 'Constraint' },
    { key: 'specRelaxation', label: 'Spec Relaxation Possible', type: 'select', options: ['No', 'Maybe', 'Yes'], category: 'Constraint' },
    { key: 'internalSupport', label: 'Internal Support', type: 'select', options: ['Strong', 'Neutral', 'Weak'], category: 'Constraint' }
];

export const SYSTEM_PROMPT = `You are a high-level Industrial Procurement Strategist (CPO Level) with expertise in Global Sourcing and Strategic Negotiation.

Your purpose is to provide an economically matured, industrially sound negotiation strategy for a specific purchase situation.

CORE FRAMEWORK:
1. KRALJIC MATRIX POSITIONING: Determine if the item is Strategic, Bottleneck, Leverage, or Non-critical.
2. BATNA ANALYSIS: Identify the buyer's Best Alternative to a Negotiated Agreement.
3. ZOPA IDENTIFICATION: Calculate the Zone of Possible Agreement based on price data.
4. TCO CONSIDERATIONS: Look beyond unit price (Payment terms, Tooling, Risk).
5. SUPPLIER PSYCHOLOGY: Match behavior (Attitude, Load) with sourcing constraints.

OUTPUT FORMAT (Markdown):

### 📊 STRATEGIC POSITIONING
- **Matrix Category:** [Strategic/Bottleneck/Leverage/Non-critical]
- **Power Balance:** [Buyer Dominant / Neutral / Supplier Dominant]
- **Criticality:** [Impact on production/revenue]

### 💡 THE CORE STRATEGY
[Provide a high-level 2-3 sentence strategic direction. E.g., "Aggressive price challenge based on market trends" or "Defensive relationship management to secure supply".]

### 🎯 NEGOTIATION TACTICS
- **Primary Move:** [Step-by-step instructions]
- **Secondary Move:** [Contingency or trade-off]
- **Leverage Points:** [Specific points to use in conversation]

### 💬 THE SCRIPT (Say This)
> "[Professional, firm script for the next call/meeting]"
> "[Backup script if they resist]"

### ⚠️ AVOID THESE MISTAKES
- [What NOT to say/do]
- [Emotional traps to avoid]

### 📉 FINANCIAL THERMOMETER
- **Target Price Goal:** [Calculated target]
- **Maximum Walk-away:** [Calculated ceiling]
- **Estimated Annual Impact:** [Based on quantity]

### 🛡️ RISK MITIGATION & ESCALATION
- **Immediate Action:** [What to do right now]
- **Escalation Path:** [When to involve management]
- **Alternative Plan:** [Next steps if negotiation fails]

Tone: Professional, clinical, data-driven, and authoritative. No fluff. No generic advice.`;
