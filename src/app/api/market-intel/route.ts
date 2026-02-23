import { NextResponse } from 'next/server';
import { callAI, AIProvider } from '@/lib/ai-provider';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { itemName, purchaseCategory, supplierName, currentQuote, lastPrice, targetPrice, annualQuantity, polymerGrade, lmeRate, efficiencyClass, aiProvider } = body;
        const provider: AIProvider = aiProvider || 'deepseek';

        const systemPrompt = `You are a Senior Procurement Research Analyst with deep knowledge of industrial supply chains, material science, and global supplier databases.

YOUR ABSOLUTE RULES:
1. NEVER make up or fabricate supplier names, phone numbers, or email addresses. If you are not confident about a specific supplier, say "Verify before contacting".
2. ONLY suggest suppliers that are well-known and established in the industry.
3. ALL prices must be marked as "INDICATIVE - verify with live quotes". Never present a price as exact.
4. Always state the basis of your estimate (e.g., "Based on Q4 2024 pricing trends for...").
5. When you are uncertain, say so explicitly. Accuracy is more important than completeness.
6. Write in simple, clear English.

OUTPUT FORMAT (Follow strictly):

### 🔍 TECHNICAL QUESTIONS TO ASK
(List 5-8 important technical questions the buyer should ask the supplier or clarify internally before proceeding. These should be specific to the item category.)

### 🏭 SUGGESTED SUPPLIERS
(List 3-5 well-known, established suppliers for this type of item. For each, provide:)
- Name: [Company Name]
- Specialization: [What they are known for]
- Region: [Where they operate]
- How to find them: [Website or search term - do NOT fabricate URLs]
- Note: [Any important note about this supplier]

⚠️ IMPORTANT: Contact details should be verified by the buyer through official websites or industry directories like IndiaMart, TradeIndia, or Thomas Net.

### 💰 TENTATIVE MARKET PRICE
- Estimated Price Range: [Low - High]
- Basis of Estimate: [Explain what this is based on]
- Key Price Drivers: [What factors affect this price]

### 📊 COST BREAKDOWN (Indicative)
(Provide an approximate percentage breakdown of what makes up the cost:)
- Raw Material: [X%] - [explanation]
- Manufacturing/Processing: [X%] - [explanation]
- Labour: [X%]
- Energy/Utilities: [X%]
- Packaging & Logistics: [X%]
- Supplier Margin: [X%]
- Taxes & Duties: [X%]
Total: 100%

### ✅ SUPPLIER SELECTION CHECKLIST
(List 8-10 specific points the buyer should consider when choosing between suppliers for THIS specific item type)

### ⚠️ ACCURACY DISCLAIMER
This analysis is based on general industry knowledge and publicly available information. All prices, supplier details, and cost breakdowns are INDICATIVE and must be verified with actual supplier quotations. The buyer should cross-check all information before making purchasing decisions.`;

        const userPrompt = `Please provide market intelligence for the following procurement requirement:

- Item: ${itemName || 'Not specified'}
- Category: ${purchaseCategory || 'General'}
- Current Supplier: ${supplierName || 'Not specified'}
- Current Quote: ${currentQuote || 'Not provided'}
- Last Price Paid: ${lastPrice || 'Not provided'}
- Target Price: ${targetPrice || 'Not provided'}
- Annual Volume: ${annualQuantity || 'Not provided'}
${polymerGrade ? `- Polymer Grade: ${polymerGrade}` : ''}
${lmeRate ? `- Current LME/Market Rate: ${lmeRate}` : ''}
${efficiencyClass ? `- Motor Efficiency Class: ${efficiencyClass}` : ''}

Please provide thorough, accurate market intelligence. If you are not sure about something, clearly state that. Do not fabricate any details.`;

        const result = await callAI(provider, [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], 0.1);

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('Market Intel API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
