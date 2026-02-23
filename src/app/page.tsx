'use client';

import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FORM_STEPS, DEFINITIONS } from '@/lib/config';

interface FormData {
  [key: string]: any;
}

const initialForm: FormData = FORM_STEPS.reduce((acc, step) => {
  acc[step.key] = step.type === 'multi-select' ? [] : (step.options?.[0] || '');
  return acc;
}, {} as FormData);

interface HistoryItem {
  id: string;
  date: string;
  data: FormData;
  result: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_SUGGESTIONS = [
  'What if they refuse to budge on price?',
  'How can I use payment terms as leverage?',
  'Write a stronger follow-up email',
  'What is my walk-away point?',
  'Suggest a counter-offer strategy',
  'How to handle their RM cost excuse?'
];

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Follow-up chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Market Intelligence state
  const [marketIntel, setMarketIntel] = useState<string | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const marketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dealpilot_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiChange = (name: string, value: string) => {
    setFormData(prev => {
      const currentValues = Array.isArray(prev[name]) ? prev[name] : [];
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter((v: string) => v !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  };

  const calculateMetrics = () => {
    const lastPrice = parseFloat(formData.lastPrice) || 0;
    const currentQuote = parseFloat(formData.currentQuote) || 0;
    const annualQty = parseFloat(formData.annualQuantity?.toString().replace(/,/g, '')) || 0;
    const diff = currentQuote - lastPrice;
    const pctChange = lastPrice > 0 ? (diff / lastPrice) * 100 : 0;
    const annualImpact = diff * annualQty;
    return { diff, pctChange, annualImpact };
  };

  const handleNegotiate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const submissionData = {
        ...formData,
        whyFixed: Array.isArray(formData.whyFixed) ? formData.whyFixed.join(', ') : formData.whyFixed
      };

      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          data: { ...formData },
          result: data.result
        };
        const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem('dealpilot_history', JSON.stringify(updatedHistory));
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  // Market Intelligence handler
  const handleMarketIntel = async () => {
    if (!formData.itemName && !formData.purchaseCategory) {
      setError('Please enter at least the Item Name and Category to get market intelligence.');
      return;
    }
    setMarketLoading(true);
    setMarketIntel(null);
    setError(null);

    try {
      const response = await fetch('/api/market-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMarketIntel(data.result);
      }
    } catch (err) {
      setError('Failed to fetch market intelligence. Please try again.');
    } finally {
      setMarketLoading(false);
      setTimeout(() => {
        document.getElementById('market-intel-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  // Follow-up chat handler
  const handleChatSend = async (overrideMessage?: string) => {
    const message = overrideMessage || chatInput.trim();
    if (!message || chatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: message };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    // Build conversation history including the original strategy as the first assistant message
    const apiMessages = [
      { role: 'assistant', content: result || '' },
      ...updatedMessages
    ];

    try {
      const response = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          negotiationContext: formData
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that. Please try again.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const downloadPDF = async () => {
    if (!resultRef.current) return;

    const canvas = await html2canvas(resultRef.current, {
      backgroundColor: '#0a0e14',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8; // mm margin on each side
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    // Calculate how tall the full image would be when scaled to usable width
    const imgScaledHeight = (canvas.height * usableWidth) / canvas.width;

    // If it fits on one page, just add it
    if (imgScaledHeight <= usableHeight) {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgScaledHeight);
    } else {
      // Multi-page: slice the canvas into page-sized chunks
      const scaleFactor = canvas.width / usableWidth; // px per mm
      const sliceHeightPx = Math.floor(usableHeight * scaleFactor); // height of each slice in canvas pixels
      let yOffset = 0;
      let pageIndex = 0;

      while (yOffset < canvas.height) {
        const remainingHeight = canvas.height - yOffset;
        const currentSliceHeight = Math.min(sliceHeightPx, remainingHeight);

        // Create a temporary canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = currentSliceHeight;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) break;

        // Draw the slice from the full canvas
        ctx.drawImage(
          canvas,
          0, yOffset, canvas.width, currentSliceHeight,  // source
          0, 0, canvas.width, currentSliceHeight           // destination
        );

        const sliceImgData = sliceCanvas.toDataURL('image/png');
        const sliceScaledHeight = (currentSliceHeight * usableWidth) / canvas.width;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(sliceImgData, 'PNG', margin, margin, usableWidth, sliceScaledHeight);

        yOffset += currentSliceHeight;
        pageIndex++;
      }
    }

    // Add footer on the last page
    const lastPageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text('DealPilot Industrial v1.2.0 • Confidential', pageWidth / 2, lastPageHeight - 5, { align: 'center' });

    pdf.save(`DealPilot_Strategy_${formData.itemName || 'Report'}.pdf`);
  };

  const extractEmailFromResult = (text: string): string | null => {
    const emailMatch = text.match(/Subject:[\s\S]*?(?=###|$)/);
    if (emailMatch) return emailMatch[0].replace(/\*\*/g, '').trim();
    return null;
  };

  const copyEmail = () => {
    if (!result) return;
    const email = extractEmailFromResult(result);
    if (email) {
      navigator.clipboard.writeText(email);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const renderContent = (text: string) => {
    const cleanText = text.replace(/\*\*/g, '');
    return cleanText.split('\n').map((line, i) => {
      const t = line.trim();
      if (!t) return <div key={i} style={{ height: '0.4rem' }} />;

      // Bullet points with labels
      if (t.startsWith('- ') || t.startsWith('* ')) {
        const parts = t.substring(2).split(':');
        const label = parts[0];
        const content = parts.slice(1).join(':');
        return (
          <div key={i} style={{ display: 'flex', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--accent-color)', marginRight: '0.6rem', flexShrink: 0 }}>•</span>
            <div>
              {content ? (
                <>
                  <span style={{ fontWeight: '600', color: 'var(--text-bright)' }}>{label}:</span>
                  <span style={{ color: 'var(--text-main)' }}>{content}</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-main)' }}>{label}</span>
              )}
            </div>
          </div>
        );
      }

      // Numbered steps
      if (/^\d+\./.test(t)) {
        const parts = t.split(':');
        const label = parts[0];
        const content = parts.slice(1).join(':');
        return (
          <div key={i} style={{ display: 'flex', marginBottom: '0.6rem', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--accent-color)', marginRight: '0.6rem', fontWeight: '700', flexShrink: 0 }}>{label.match(/^\d+/)?.[0]}.</span>
            <div>
              <span style={{ fontWeight: '600', color: 'var(--text-bright)' }}>{label.replace(/^\d+\.\s*/, '')}:</span>
              <span style={{ color: 'var(--text-main)' }}>{content}</span>
            </div>
          </div>
        );
      }

      // Email lines
      if (t.startsWith('Subject:') || t.startsWith('Dear') || t.startsWith('Best regards') || t.startsWith('Looking forward')) {
        return <div key={i} className="email-line" style={{ color: 'var(--text-main)', marginBottom: '0.3rem' }}>{t}</div>;
      }

      return <div key={i} style={{ marginBottom: '0.6rem', color: 'var(--text-main)' }}>{t}</div>;
    });
  };

  const categories = Array.from(new Set(FORM_STEPS.filter(s => !s.condition || s.condition(formData)).map(s => s.category)));
  const metrics = calculateMetrics();

  return (
    <main className="container">
      {/* ─── HEADER ─── */}
      <header>
        <div className="logo-container">
          <div className="logo-icon">DP</div>
          <div>
            <h1 style={{ fontSize: '1.2rem', letterSpacing: '0.04rem' }}>DEALPILOT <span style={{ color: 'var(--accent-color)', fontWeight: '400' }}>INDUSTRIAL</span></h1>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1rem' }}>Procurement Strategy Engine • v1.2.0</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }} onClick={() => setShowGlossary(!showGlossary)}>
            {showGlossary ? '✕ CLOSE' : '📖 GLOSSARY'}
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }} onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? '← BACK' : '📁 HISTORY'}
          </button>
        </div>
      </header>

      {/* ─── GLOSSARY ─── */}
      {showGlossary && (
        <div className="card fade-in" style={{ border: '1px solid rgba(96, 165, 250, 0.2)', background: 'rgba(96, 165, 250, 0.03)' }}>
          <h2 className="section-title">📖 Procurement Terms — Simple Explanations</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {Object.entries(DEFINITIONS).map(([key, value]) => (
              <div key={key} className="knowledge-card">
                <h4>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h4>
                <p>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── KNOWLEDGE HUB (compact) ─── */}
      {!showHistory && !showGlossary && (
        <div className="card fade-in" style={{ border: '1px solid rgba(96, 165, 250, 0.15)', background: 'rgba(96, 165, 250, 0.03)' }}>
          <h2 className="section-title" style={{ fontSize: '0.7rem' }}>💡 QUICK REFERENCE</h2>
          <div className="grid knowledge-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="knowledge-card">
              <h4>POWER BALANCE</h4>
              <p>{DEFINITIONS.powerBalance}</p>
            </div>
            <div className="knowledge-card">
              <h4>BATNA (Plan B)</h4>
              <p>{DEFINITIONS.batna}</p>
            </div>
            <div className="knowledge-card">
              <h4>ZOPA (Deal Zone)</h4>
              <p>{DEFINITIONS.zopa}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── LIVE ANALYTICS ─── */}
      {!showHistory && (
        <div className="card fade-in">
          <h2 className="section-title" style={{ fontSize: '0.7rem' }}>📊 LIVE PRICE ANALYSIS</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="metric-box">
              <label>Price Difference</label>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: metrics.diff > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                {metrics.diff > 0 ? '+' : ''}{metrics.diff.toLocaleString()}
              </div>
            </div>
            <div className="metric-box">
              <label>% Change</label>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: metrics.pctChange > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                {metrics.pctChange > 0 ? '+' : ''}{metrics.pctChange.toFixed(1)}%
              </div>
            </div>
            <div className="metric-box">
              <label>Annual Cost Impact</label>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: metrics.annualImpact > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                {metrics.annualImpact > 0 ? '+' : ''}{Math.abs(metrics.annualImpact).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HISTORY ─── */}
      {showHistory ? (
        <div className="card fade-in">
          <h2 className="section-title">📁 Past Negotiations</h2>
          {history.length === 0 ? <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>No records yet. Complete a negotiation to see it here.</p> : (
            <div>
              {history.map(item => (
                <div key={item.id} className="history-item" onClick={() => { setFormData(item.data); setResult(item.result); setShowHistory(false); }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-bright)' }}>{item.data.itemName || 'Unnamed'} → {item.data.supplierName || 'Unknown'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.date} • {item.data.purchaseCategory || ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (

        /* ─── INPUT FORM ─── */
        <div className="fade-in">
          {categories.map(cat => (
            <div key={cat} className="card slide-up">
              <h2 className="section-title">{cat}</h2>
              <div className="grid">
                {FORM_STEPS.filter(s => s.category === cat && (!s.condition || s.condition(formData))).map(step => (
                  <div key={step.key} className="form-group">
                    <label>{step.label}</label>
                    {step.type === 'select' ? (
                      <select name={step.key} value={formData[step.key]} onChange={handleChange}>
                        {step.options?.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : step.type === 'multi-select' ? (
                      <div className="multi-select">
                        {step.options?.map(opt => (
                          <label key={opt} className="checkbox-group">
                            <input type="checkbox" checked={formData[step.key]?.includes(opt)} onChange={() => handleMultiChange(step.key, opt)} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input type={step.type} name={step.key} value={formData[step.key]} onChange={handleChange} placeholder={`Enter ${step.label.toLowerCase()}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={handleNegotiate}
              disabled={loading || !formData.currentQuote}
              style={{ height: '3.25rem', fontSize: '1rem', borderRadius: '10px', flex: '1 1 55%' }}
            >
              {loading ? <><span className="spinner"></span> ANALYZING...</> : '🚀 GENERATE STRATEGY'}
            </button>
            <button
              className="btn"
              onClick={handleMarketIntel}
              disabled={marketLoading || (!formData.itemName && !formData.purchaseCategory)}
              style={{ height: '3.25rem', fontSize: '0.9rem', borderRadius: '10px', flex: '1 1 35%', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)' }}
            >
              {marketLoading ? <><span className="spinner"></span> RESEARCHING...</> : '🔎 MARKET INTELLIGENCE'}
            </button>
          </div>
        </div>
      )}

      {/* ─── ERROR ─── */}
      {error && <div className="card fade-in" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)', background: 'var(--danger-bg)' }}>{error}</div>}

      {/* ─── RESULTS ─── */}
      {result && !showHistory && (
        <div className="slide-up" id="result-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>📋 YOUR NEGOTIATION STRATEGY</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {extractEmailFromResult(result) && (
                <button className="btn btn-copy" onClick={copyEmail}>
                  {copySuccess ? '✓ COPIED!' : '📋 COPY EMAIL'}
                </button>
              )}
              <button className="btn btn-download" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }} onClick={downloadPDF}>DOWNLOAD PDF</button>
            </div>
          </div>

          <div className="card" ref={resultRef} style={{ padding: '2rem', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
            {/* Report Header */}
            <div style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1.25rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--accent-color)', marginBottom: '0.25rem' }}>{formData.itemName || 'Untitled'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Supplier: {formData.supplierName || '—'} • Category: {formData.purchaseCategory || '—'} • {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Report Body */}
            <div style={{ fontSize: '0.92rem', lineHeight: '1.65', color: 'var(--text-main)' }}>
              {result.split('###').map((section, i) => {
                if (i === 0) return null;
                const lines = section.split('\n');
                const title = lines[0].trim();
                const body = lines.slice(1).join('\n').trim();
                const isEmail = title.includes('EMAIL');

                return (
                  <div key={i} className="report-section">
                    <h4 className="report-section-title">{title}</h4>
                    {isEmail ? (
                      <div className="email-block">
                        {renderContent(body)}
                      </div>
                    ) : (
                      <div style={{ paddingLeft: '0.25rem' }}>
                        {renderContent(body)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── MARKET INTELLIGENCE ─── */}
      {marketIntel && !showHistory && (
        <div className="slide-up" id="market-intel-section" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>🔎 MARKET INTELLIGENCE REPORT</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.6rem', padding: '0.25rem 0.6rem', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', color: 'var(--warning-color)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04rem' }}>
                ⚠ Indicative Data — Verify Before Use
              </span>
            </div>
          </div>

          <div className="card" ref={marketRef} style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            {/* Report Header */}
            <div style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '1.25rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#8b5cf6', marginBottom: '0.25rem' }}>
                {formData.itemName || formData.purchaseCategory || 'Market Analysis'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Category: {formData.purchaseCategory || '—'} • Generated: {new Date().toLocaleDateString()} • AI-Assisted Research
              </p>
            </div>

            {/* Report Body */}
            <div style={{ fontSize: '0.92rem', lineHeight: '1.65', color: 'var(--text-main)' }}>
              {marketIntel.split('###').map((section, i) => {
                if (i === 0) return null;
                const lines = section.split('\n');
                const title = lines[0].trim();
                const body = lines.slice(1).join('\n').trim();
                const isDisclaimer = title.includes('DISCLAIMER');

                return (
                  <div key={i} className="report-section">
                    <h4 className="report-section-title" style={{ color: isDisclaimer ? 'var(--warning-color)' : 'var(--accent-color)', borderColor: isDisclaimer ? 'rgba(251, 191, 36, 0.3)' : 'var(--border-color)' }}>{title}</h4>
                    <div style={isDisclaimer ? { padding: '1rem', background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.15)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--warning-color)' } : { paddingLeft: '0.25rem' }}>
                      {renderContent(body)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── FOLLOW-UP CHAT ─── */}
      {(result || marketIntel) && !showHistory && (
        <div className="slide-up" style={{ marginTop: '1.5rem' }}>
          {!showChat ? (
            <button
              className="btn btn-secondary"
              onClick={() => setShowChat(true)}
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem', borderRadius: '10px' }}
            >
              💬 Ask More — Continue This Conversation
            </button>
          ) : (
            <div className="chat-container">
              <div className="chat-header">
                <h4>💬 Follow-Up Chat — {formData.itemName || 'Negotiation'}</h4>
                <button
                  className="chat-suggestion-btn"
                  onClick={() => { setShowChat(false); setChatMessages([]); }}
                  style={{ fontSize: '0.65rem' }}
                >
                  ✕ Close
                </button>
              </div>

              {/* Suggestion pills */}
              {chatMessages.length === 0 && (
                <div className="chat-suggestions">
                  {CHAT_SUGGESTIONS.map((s, i) => (
                    <button key={i} className="chat-suggestion-btn" onClick={() => handleChatSend(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Messages */}
              <div className="chat-messages">
                {chatMessages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem' }}>
                    Ask any follow-up question about this negotiation. I remember all the details.
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-typing">
                    <span></span><span></span><span></span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input bar */}
              <div className="chat-input-bar">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask a follow-up question..."
                  disabled={chatLoading}
                />
                <button onClick={() => handleChatSend()} disabled={chatLoading || !chatInput.trim()}>SEND</button>
              </div>
            </div>
          )}
        </div>
      )}

      <footer>
        DEALPILOT INDUSTRIAL v1.2.0 • PROCUREMENT STRATEGY ENGINE • CONFIDENTIAL
      </footer>
    </main>
  );
}
