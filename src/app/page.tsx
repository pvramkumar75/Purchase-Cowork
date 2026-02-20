'use client';

import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FORM_STEPS } from '@/lib/config';

interface FormData {
  [key: string]: any;
}

const initialForm: FormData = FORM_STEPS.reduce((acc, step) => {
  acc[step.key] = step.type === 'multi-select' ? (step.options?.[0] ? [step.options[0]] : []) : (step.options?.[0] || '');
  return acc;
}, {} as FormData);

interface HistoryItem {
  id: string;
  date: string;
  data: FormData;
  result: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dealpilot_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) { }
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
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const downloadPDF = async () => {
    if (!resultRef.current) return;
    const canvas = await html2canvas(resultRef.current, { backgroundColor: '#0d1117', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`DealPilot_Report_${formData.itemName || 'Negotiation'}.pdf`);
  };

  // Group steps by category
  const renderMaturedContent = (text: string) => {
    // Remove all double asterisks (markdown bold) and clean up
    const cleanText = text.replace(/\*\*/g, '');

    return cleanText.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={i} style={{ height: '0.5rem' }} />;

      // Handle professional bullet points
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const [label, ...content] = trimmedLine.substring(2).split(':');
        return (
          <div key={i} style={{ display: 'flex', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--accent-color)', marginRight: '0.75rem' }}>•</span>
            <div>
              {content.length > 0 ? (
                <>
                  <span style={{ fontWeight: '600', color: '#f0f6fc' }}>{label}:</span>
                  <span style={{ color: 'var(--text-main)' }}> {content.join(':')}</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-main)' }}>{label}</span>
              )}
            </div>
          </div>
        );
      }

      // Handle Script/Quote sections
      if (trimmedLine.startsWith('Prompt:') || trimmedLine.startsWith('Resistance Handling:')) {
        const [label, ...content] = trimmedLine.split(':');
        return (
          <div key={i} className="script-box" style={{ background: 'rgba(88, 166, 255, 0.05)', padding: '1rem', borderLeft: '3px solid var(--accent-color)', marginBottom: '1rem', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-color)', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</div>
            <div style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>"{content.join(':').trim()}"</div>
          </div>
        );
      }

      return <div key={i} style={{ marginBottom: '0.75rem', color: 'var(--text-main)' }}>{trimmedLine}</div>;
    });
  };

  const categories = Array.from(new Set(FORM_STEPS.map(s => s.category)));
  const metrics = calculateMetrics();

  return (
    <main className="container">
      <header>
        <div className="logo-container">
          <div className="logo-icon" style={{ borderRadius: '50%', background: 'linear-gradient(135deg, #58a6ff 0%, #1f6feb 100%)' }}>DP</div>
          <div>
            <h1 style={{ fontSize: '1.25rem', letterSpacing: '0.05rem', fontWeight: '700' }}>DEALPILOT <span style={{ color: 'var(--accent-color)', fontWeight: '300' }}>INDUSTRIAL</span></h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1rem' }}>Sourcing Authority • v1.1.0</p>
          </div>
        </div>
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'ACTIVE WORKSPACE' : 'STRATEGY ARCHIVES'}
        </button>
      </header>

      {!showHistory && (
        <div className="card fade-in" style={{ background: 'linear-gradient(180deg, #1c2128 0%, #161b22 100%)', border: '1px solid var(--accent-secondary)' }}>
          <h2 className="section-title" style={{ color: 'var(--accent-secondary)' }}>Live Analytics</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="metric-box">
              <label>Price Delta</label>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: metrics.diff > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                {metrics.diff > 0 ? '+' : ''}{metrics.diff.toLocaleString()}
              </div>
            </div>
            <div className="metric-box">
              <label>% Change</label>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: metrics.pctChange > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                {metrics.pctChange > 0 ? '+' : ''}{metrics.pctChange.toFixed(2)}%
              </div>
            </div>
            <div className="metric-box">
              <label>Annual Impact</label>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: metrics.annualImpact > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                {metrics.annualImpact > 0 ? '−' : '+'}{Math.abs(metrics.annualImpact).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory ? (
        <div className="card fade-in">
          <h2 className="section-title">Negotiation Archives</h2>
          {history.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No records found.</p> : (
            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-item" onClick={() => { setFormData(item.data); setResult(item.result); setShowHistory(false); }}>
                  <div style={{ fontWeight: 'bold' }}>{item.data.itemName} | {item.data.supplierName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="fade-in">
          {categories.map(cat => (
            <div key={cat} className="card">
              <h2 className="section-title">{cat} Parameters</h2>
              <div className="grid">
                {FORM_STEPS.filter(s => s.category === cat).map(step => (
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
                      <input type={step.type} name={step.key} value={formData[step.key]} onChange={handleChange} placeholder={step.label} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button className="btn btn-primary" onClick={handleNegotiate} disabled={loading || !formData.currentQuote} style={{ height: '3.5rem', fontSize: '1.1rem', marginBottom: '2rem' }}>
            {loading ? <><span className="spinner"></span> ANALYZING MARKET DATA...</> : 'GENERATE STRATEGIC REPORT'}
          </button>
        </div>
      )}

      {error && <div className="card fade-in" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>{error}</div>}

      {result && !showHistory && (
        <div className="fade-in" id="result-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>STRATEGIC ADVISORY</h2>
            <button className="btn btn-download" onClick={downloadPDF}>DOWNLOAD PDF REPORT</button>
          </div>

          <div className="card" ref={resultRef} style={{ padding: '2rem', border: '1px solid var(--accent-color)' }}>
            <div style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-color)' }}>{formData.itemName}</h3>
              <p style={{ color: 'var(--text-muted)' }}>Supplier: {formData.supplierName} | Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="markdown-content" style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
              {result.split('###').map((section, i) => i === 0 ? null : (
                <div key={i} style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--accent-color)', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', letterSpacing: '0.05rem' }}>
                    {section.split('\n')[0].trim()}
                  </h4>
                  <div style={{ paddingLeft: '0.5rem' }}>
                    {renderMaturedContent(section.split('\n').slice(1).join('\n').trim())}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', paddingBottom: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        DEALPILOT INDUSTRIAL v2.0 • STRATEGIC SOURCING ADVISORY • HIGH CONFIDENTIALITY
      </footer>
    </main>
  );
}
