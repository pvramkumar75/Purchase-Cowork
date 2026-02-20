import { SYSTEM_PROMPT } from './config';

export async function getNegotiationGuidance(data: any) {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // Pre-calculations
    const lastPrice = parseFloat(data.lastPrice) || 0;
    const currentQuote = parseFloat(data.currentQuote) || 0;
    const targetPrice = parseFloat(data.targetPrice) || 0;
    const annualQty = parseFloat(data.annualQuantity?.toString().replace(/,/g, '')) || 0;

    const priceChange = lastPrice > 0 ? ((currentQuote - lastPrice) / lastPrice) * 100 : 0;
    const gapToTarget = currentQuote > 0 ? ((currentQuote - targetPrice) / currentQuote) * 100 : 0;
    const annualImpact = (currentQuote - lastPrice) * annualQty;

    const userPrompt = `NEGOTIATION DATA:

--- WHAT IS BEING PURCHASED ---
- Category: ${data.purchaseCategory || 'N/A'}
- Item Name: ${data.itemName || 'N/A'}
- Supplier: ${data.supplierName || 'N/A'}
${data.polymerGrade ? `- Polymer Grade: ${data.polymerGrade}` : ''}
${data.lmeRate ? `- LME / Copper Market Rate: ${data.lmeRate}` : ''}
${data.efficiencyClass ? `- Motor Efficiency Class: ${data.efficiencyClass}` : ''}

--- THE NUMBERS ---
- Last Price Paid: ${lastPrice}
- Supplier's Current Quote: ${currentQuote} (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}% change)
- Our Target Price: ${targetPrice} (${gapToTarget.toFixed(1)}% gap from quote)
- Annual Usage: ${annualQty}
- Annual Cost Impact If We Accept: ${annualImpact > 0 ? '+' : ''}${annualImpact.toFixed(0)}
- How well do we know their cost: ${data.costKnowledge}
- Market price trend: ${data.rmTrend}

--- SUPPLY SITUATION ---
- Stock on hand: ${data.stock}
- Risk if they don't deliver: ${data.stoppageRisk}
- How fast can we switch: ${data.alternateTime}
- Who owns the tooling: ${data.tooling}

--- OUR LEVERAGE ---
- Other suppliers available: ${data.otherSuppliers}
- Is supplier busy or hungry: ${data.vendorLoad}
- Payment terms we are offering: ${data.paymentTerms}

--- SUPPLIER'S BEHAVIOR ---
- How fast are they responding: ${data.responseSpeed}
- Their stated reason for price increase: ${data.increaseReason}
- Their attitude: ${data.attitude}
- Pressure for quick decision: ${data.immediateAsk}

--- OUR CONSTRAINTS ---
- Are we locked into this supplier: ${data.fixedOnVendor} (Reason: ${data.whyFixed})
- Can we shift volume to others: ${data.qtyFlexibility}
- Can we change the specification: ${data.specRelaxation}
- Does management support changing: ${data.internalSupport}

Please provide a complete strategy in simple English with specific numbers.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.15
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to call DeepSeek API');
    }

    const aiResult = await response.json();
    return aiResult.choices[0].message.content;
}
