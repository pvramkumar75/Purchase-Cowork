import { SYSTEM_PROMPT } from './config';

export async function getNegotiationGuidance(data: any) {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    // Pre-calculations for industrial maturity
    const lastPrice = parseFloat(data.lastPrice) || 0;
    const currentQuote = parseFloat(data.currentQuote) || 0;
    const targetPrice = parseFloat(data.targetPrice) || 0;
    const annualQty = parseFloat(data.annualQuantity?.replace(/,/g, '')) || 0;

    const priceIncrease = lastPrice > 0 ? ((currentQuote - lastPrice) / lastPrice) * 100 : 0;
    const gapToTarget = currentQuote > 0 ? ((currentQuote - targetPrice) / currentQuote) * 100 : 0;
    const annualImpact = (currentQuote - lastPrice) * annualQty;

    const userPrompt = `INDUSTRIAL NEGOTIATION DATA:
- Item: ${data.itemName || 'N/A'}
- Supplier: ${data.supplierName || 'N/A'}

--- FINANCIAL DASHBOARD ---
- Last Price: ${lastPrice}
- Current Quote: ${currentQuote} (${priceIncrease.toFixed(2)}% change)
- Target Price: ${targetPrice} (${gapToTarget.toFixed(2)}% gap)
- Annual Quantity: ${annualQty}
- Projected Annual Cost Impact: ${annualImpact.toFixed(2)}
- Vendor Cost Knowledge: ${data.costKnowledge}
- RM Trend: ${data.rmTrend}

--- SUPPLY RISK & LEVERAGE ---
- Current Stock: ${data.stock}
- Line Stoppage Risk: ${data.stoppageRisk}
- Alternate Approval Time: ${data.alternateTime}
- Tool Ownership: ${data.tooling}
- Market Competition: ${data.otherSuppliers}
- Vendor Capacity Load: ${data.vendorLoad}
- Payment Terms: ${data.paymentTerms}

--- BEHAVIORAL SIGNALS ---
- Response Speed: ${data.responseSpeed}
- Declared Reason for Increase: ${data.increaseReason}
- Vendor Attitude: ${data.attitude}
- Pressure Level: ${data.immediateAsk}

--- INTERNAL CONSTRAINTS ---
- Sourcing Freedom: ${data.fixedOnVendor} (Reason: ${data.whyFixed})
- Quantity Flexibility: ${data.qtyFlexibility}
- Specification Relaxation: ${data.specRelaxation}
- Internal Stakeholder Support: ${data.internalSupport}

Please analyze this data and provide a professional procurement strategy.`;

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
