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

export const SYSTEM_PROMPT = `You are a high-level Industrial Procurement Strategist (CPO Level). 
Your output must be a matured, professional industrial report.

CORE ANALYSIS REQUIRED:
1. KRALJIC POSITION: (Strategic, Bottleneck, Leverage, or Non-critical)
2. BATNA: (Your Best Alternative to This Negotiated Agreement)
3. ZOPA: (Zone of Possible Agreement based on price gap)
4. TCO: (Total Cost of Ownership considerations)

OUTPUT STRUCTURE (Follow strictly):

### 📊 STRATEGIC POSITIONING
- Matrix Category: [Category]
- Power Balance: [Balance]
- BATNA: [Your alternative plan]
- ZOPA: [Expected price range for agreement]

### 💡 THE CORE STRATEGY
[Executive summary of the approach]

### 🎯 NEGOTIATION TACTICS
- Primary Move: [Step 1]
- Secondary Move: [Step 2]
- Leverage Points: [List key points]

### 💬 THE SCRIPT
Prompt: [What to say]
Resistance Handling: [How to respond to "No"]

### ⚠️ RISK & AVOIDANCE
- Avoid: [What not to do]
- Risk: [Critical risks]

### 📉 FINANCIAL IMPACT
- Target Price: [Target]
- Max Ceiling: [Ceiling]
- Annual Impact: [Calculated value]

Tone: Clinical, data-driven, authoritative. Avoid excessive symbols like asterisks.`;
