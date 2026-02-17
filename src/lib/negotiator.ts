export const systemPrompt = `You are a senior procurement negotiation strategist with 25+ years industrial sourcing experience.

Your purpose is NOT to teach negotiation theory.
Your purpose is to calculate the economically rational next move in a live supplier negotiation.

Think in terms of leverage, dependency, alternatives, time pressure, switching cost, supplier psychology, bluff probability, and concession sequencing.

Never give motivational advice.
Respond like an experienced purchase head coaching another purchase head privately.

STEP 1 — classify negotiation mode:
Competitive / Controlled / Locked

STEP 2 — diagnose power balance:
Weak / Neutral / Advantage / Dominant

STEP 3 — detect supplier intent:
Bluff / Defensive / Capacity constrained / Opportunistic / Genuine escalation

STEP 4 — choose strategy:
Delay / Probe / Trade / Pressure / Corner / Exit preparation

STEP 5 — generate practical sentences the buyer should say next.
Use short natural business language.

STEP 6 — define concession boundary and risk control.

Output format exactly:

NEGOTIATION MODE:
POSITION:
SUPPLIER INTENT:
NEXT MOVE:
SAY THIS:
AVOID THIS:
CONCESSION LIMIT:
ESCALATION PLAN:

Be concise and practical.`;

export async function getNegotiationGuidance(data: any) {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    const userPrompt = `NEGOTIATION DATA:
- Item Name: ${data.itemName || 'N/A'}
- Supplier Name: ${data.supplierName || 'N/A'}

PRICE SITUATION:
- Last Purchase Price: ${data.lastPrice}
- Current Quote: ${data.currentQuote}
- Target Price: ${data.targetPrice}
- Annual Quantity: ${data.annualQuantity}
- Vendor Cost Knowledge: ${data.costKnowledge}
- RM Trend: ${data.rmTrend}

SUPPLY PRESSURE:
- Current Stock: ${data.stock}
- Line Stoppage Risk: ${data.stoppageRisk}
- Alternate Approval: ${data.alternateTime}
- Tool Ownership: ${data.tooling}

VENDOR STRENGTH:
- Other Suppliers: ${data.otherSuppliers}
- Vendor Load: ${data.vendorLoad}
- Payment Terms: ${data.paymentTerms}

VENDOR BEHAVIOR:
- Response Speed: ${data.responseSpeed}
- Reason for Increase: ${data.increaseReason}
- Attitude: ${data.attitude}
- Immediate Confirmation Ask: ${data.immediateAsk}

SOURCING CONSTRAINT:
- Company Fixed on Vendor: ${data.fixedOnVendor}
- Why Fixed: ${data.whyFixed}
- Quantity Flexibility: ${data.qtyFlexibility}
- Spec Relaxation: ${data.specRelaxation}
- Internal Support: ${data.internalSupport}
`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to call DeepSeek API');
    }

    const aiResult = await response.json();
    return aiResult.choices[0].message.content;
}
