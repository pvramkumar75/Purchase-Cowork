'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FormData {
  itemName: string;
  supplierName: string;
  lastPrice: string;
  currentQuote: string;
  targetPrice: string;
  annualQuantity: string;
  costKnowledge: string;
  rmTrend: string;
  stock: string;
  stoppageRisk: string;
  alternateTime: string;
  tooling: string;
  otherSuppliers: string;
  vendorLoad: string;
  paymentTerms: string;
  responseSpeed: string;
  increaseReason: string;
  attitude: string;
  immediateAsk: string;
  fixedOnVendor: string;
  whyFixed: string[];
  qtyFlexibility: string;
  specRelaxation: string;
  internalSupport: string;
}

const initialForm: FormData = {
  itemName: '',
  supplierName: '',
  lastPrice: '',
  currentQuote: '',
  targetPrice: '',
  annualQuantity: '',
  costKnowledge: 'Rough',
  rmTrend: 'Stable',
  stock: '2-4 weeks',
  stoppageRisk: 'No risk',
  alternateTime: 'Approved',
  tooling: 'Company',
  otherSuppliers: '2-3 workable',
  vendorLoad: 'Normal',
  paymentTerms: 'Normal',
  responseSpeed: 'Normal',
  increaseReason: 'RM',
  attitude: 'Cooperative',
  immediateAsk: 'No',
  fixedOnVendor: 'Prefer',
  whyFixed: ['Reliability'],
  qtyFlexibility: 'Partial',
  specRelaxation: 'Maybe',
  internalSupport: 'Neutral'
};

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

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dealpilot_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }

    // Auto-save form draft
    const draft = localStorage.getItem('dealpilot_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Ensure whyFixed is an array (backward compatibility)
        if (!Array.isArray(parsed.whyFixed)) {
          parsed.whyFixed = [parsed.whyFixed];
        }
        setFormData(parsed);
      } catch (e) { }
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem('dealpilot_draft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiChange = (name: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[name] as string[];
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  };

  const handleNegotiate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Convert whyFixed array to comma-separated string for prompt
      const submissionData = {
        ...formData,
        whyFixed: formData.whyFixed.join(', ')
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

        // Save to history
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
      // Wait for re-render before scrolling
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const downloadPDF = async () => {
    if (!resultRef.current) return;

    const canvas = await html2canvas(resultRef.current, {
      backgroundColor: '#0d1117',
      scale: 2
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Header for PDF
    pdf.setFillColor(13, 17, 23);
    pdf.rect(0, 0, 210, 20, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text(`DealPilot Strategy Report - ${formData.itemName || 'Item'}`, 10, 13);
    pdf.setFontSize(10);
    pdf.text(`Supplier: ${formData.supplierName || 'N/A'}`, 10, 18);

    pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight);
    pdf.save(`DealPilot_Report_${formData.itemName || 'Negotiation'}.pdf`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const parseResult = (text: string) => {
    const sections = [
      'NEGOTIATION MODE:',
      'POSITION:',
      'SUPPLIER INTENT:',
      'NEXT MOVE:',
      'SAY THIS:',
      'AVOID THIS:',
      'CONCESSION LIMIT:',
      'ESCALATION PLAN:'
    ];

    const resultPanels: { title: string; content: string }[] = [];

    let currentText = text;
    for (let i = 0; i < sections.length; i++) {
      const currentSection = sections[i];
      const nextSection = sections[i + 1];

      const startIndex = currentText.indexOf(currentSection);
      if (startIndex === -1) continue;

      const contentStart = startIndex + currentSection.length;
      let contentEnd = nextSection ? currentText.indexOf(nextSection) : currentText.length;

      if (contentEnd === -1) contentEnd = currentText.length;

      let content = currentText.substring(contentStart, contentEnd).trim();
      resultPanels.push({ title: currentSection.replace(':', ''), content });
    }

    return resultPanels;
  };

  const loadFromHistory = (item: HistoryItem) => {
    setFormData(item.data);
    setResult(item.result);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="container">
      <header>
        <div className="logo-container">
          <div className="logo-icon">DP</div>
          <h1>DealPilot</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Back to Form' : 'History'}
        </button>
      </header>

      {showHistory ? (
        <div className="card fade-in">
          <h2 className="section-title">Recent Negotiations</h2>
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No history yet.</p>
          ) : (
            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
                  <div style={{ fontWeight: 'bold' }}>{item.data.itemName || 'Item'} @ {item.data.supplierName || 'Supplier'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date} • {item.data.currentQuote} vs {item.data.lastPrice}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="fade-in">
          {/* General Info */}
          <div className="card">
            <h2 className="section-title">General Information</h2>
            <div className="grid">
              <div className="form-group">
                <label>Item / Part Name</label>
                <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g. Copper Wire 0.5mm" />
              </div>
              <div className="form-group">
                <label>Supplier Name</label>
                <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} placeholder="e.g. Acme Polymers" />
              </div>
            </div>
          </div>

          {/* Section 1: PRICE SITUATION */}
          <div className="card">
            <h2 className="section-title">Price Situation</h2>
            <div className="grid">
              <div className="form-group">
                <label>Last Purchase Price</label>
                <input type="number" name="lastPrice" value={formData.lastPrice} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Vendor Current Quote</label>
                <input type="number" name="currentQuote" value={formData.currentQuote} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Target / Expected Price</label>
                <input type="number" name="targetPrice" value={formData.targetPrice} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Annual Quantity</label>
                <input type="text" name="annualQuantity" value={formData.annualQuantity} onChange={handleChange} placeholder="e.g. 50,000" />
              </div>
              <div className="form-group">
                <label>Vendor Cost Knowledge</label>
                <select name="costKnowledge" value={formData.costKnowledge} onChange={handleChange}>
                  <option>None</option>
                  <option>Rough</option>
                  <option>Detailed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Raw Material Trend</label>
                <select name="rmTrend" value={formData.rmTrend} onChange={handleChange}>
                  <option>Decrease %</option>
                  <option>Stable</option>
                  <option>Increase %</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: SUPPLY PRESSURE */}
          <div className="card">
            <h2 className="section-title">Supply Pressure</h2>
            <div className="grid">
              <div className="form-group">
                <label>Current Stock</label>
                <select name="stock" value={formData.stock} onChange={handleChange}>
                  <option>Less than 3 days</option>
                  <option>1 week</option>
                  <option>2-4 weeks</option>
                  <option>Safe</option>
                </select>
              </div>
              <div className="form-group">
                <label>Line Stoppage Risk</label>
                <select name="stoppageRisk" value={formData.stoppageRisk} onChange={handleChange}>
                  <option>Immediate</option>
                  <option>This week</option>
                  <option>This month</option>
                  <option>No risk</option>
                </select>
              </div>
              <div className="form-group">
                <label>Alternate Approval Time</label>
                <select name="alternateTime" value={formData.alternateTime} onChange={handleChange}>
                  <option>Approved</option>
                  <option>2 weeks</option>
                  <option>2 months</option>
                  <option>Not possible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tool Ownership</label>
                <select name="tooling" value={formData.tooling} onChange={handleChange}>
                  <option>Company</option>
                  <option>Vendor</option>
                  <option>Shared</option>
                  <option>No tooling</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: VENDOR STRENGTH */}
          <div className="card">
            <h2 className="section-title">Vendor Strength</h2>
            <div className="grid">
              <div className="form-group">
                <label>Other Suppliers</label>
                <select name="otherSuppliers" value={formData.otherSuppliers} onChange={handleChange}>
                  <option>None</option>
                  <option>Risky</option>
                  <option>2-3 workable</option>
                  <option>Many</option>
                </select>
              </div>
              <div className="form-group">
                <label>Vendor Load</label>
                <select name="vendorLoad" value={formData.vendorLoad} onChange={handleChange}>
                  <option>Overloaded</option>
                  <option>Normal</option>
                  <option>Hungry</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Terms</label>
                <select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange}>
                  <option>Advance</option>
                  <option>Short</option>
                  <option>Normal</option>
                  <option>Long</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: VENDOR BEHAVIOR */}
          <div className="card">
            <h2 className="section-title">Vendor Behavior</h2>
            <div className="grid">
              <div className="form-group">
                <label>Response Speed</label>
                <select name="responseSpeed" value={formData.responseSpeed} onChange={handleChange}>
                  <option>Avoiding</option>
                  <option>Slow</option>
                  <option>Normal</option>
                  <option>Eager</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reason for Increase</label>
                <select name="increaseReason" value={formData.increaseReason} onChange={handleChange}>
                  <option>RM</option>
                  <option>Labour</option>
                  <option>Power</option>
                  <option>Demand</option>
                  <option>Unclear</option>
                </select>
              </div>
              <div className="form-group">
                <label>Attitude</label>
                <select name="attitude" value={formData.attitude} onChange={handleChange}>
                  <option>Defensive</option>
                  <option>Emotional</option>
                  <option>Aggressive</option>
                  <option>Cooperative</option>
                  <option>Bluff feel</option>
                </select>
              </div>
              <div className="form-group">
                <label>Asking Immediate Confirmation</label>
                <select name="immediateAsk" value={formData.immediateAsk} onChange={handleChange}>
                  <option>Strong</option>
                  <option>Mild</option>
                  <option>No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: SOURCING CONSTRAINT */}
          <div className="card">
            <h2 className="section-title">Sourcing Constraint</h2>
            <div className="grid">
              <div className="form-group">
                <label>Company Fixed on Vendor</label>
                <select name="fixedOnVendor" value={formData.fixedOnVendor} onChange={handleChange}>
                  <option>Fixed</option>
                  <option>Prefer</option>
                  <option>Free</option>
                </select>
              </div>
              <div className="form-group">
                <label>Why Fixed (Select Multiple)</label>
                <div className="multi-select">
                  {['Customer spec', 'Design', 'Reliability', 'Management', 'Agreement'].map(option => (
                    <label key={option} className="checkbox-group">
                      <input
                        type="checkbox"
                        checked={formData.whyFixed.includes(option)}
                        onChange={() => handleMultiChange('whyFixed', option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Quantity Flexibility</label>
                <select name="qtyFlexibility" value={formData.qtyFlexibility} onChange={handleChange}>
                  <option>No</option>
                  <option>Partial</option>
                  <option>Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Spec Relaxation Possible</label>
                <select name="specRelaxation" value={formData.specRelaxation} onChange={handleChange}>
                  <option>No</option>
                  <option>Maybe</option>
                  <option>Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Internal Support</label>
                <select name="internalSupport" value={formData.internalSupport} onChange={handleChange}>
                  <option>Strong</option>
                  <option>Neutral</option>
                  <option>Weak</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleNegotiate}
              disabled={loading || !formData.currentQuote}
            >
              {loading ? (
                <><span className="spinner"></span> Generating Guidance...</>
              ) : (
                'Get Negotiation Guidance'
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="card fade-in" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
          {error}
        </div>
      )}

      {result && !showHistory && (
        <div className="fade-in" id="result-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Strategic Guidance</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-download" onClick={downloadPDF} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                Download PDF
              </button>
              <button className="btn btn-secondary" onClick={handleNegotiate} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                Re-ask with Updated Quote
              </button>
            </div>
          </div>

          <div className="response-grid" ref={resultRef}>
            {parseResult(result).map((panel, idx) => (
              <div key={idx} className={`panel ${panel.title === 'SAY THIS' ? 'panel-say-this' : panel.title === 'AVOID THIS' ? 'panel-avoid' : ''}`}>
                <div className="panel-header">{panel.title}</div>
                <div className="panel-content">{panel.content}</div>
                {panel.title === 'SAY THIS' && (
                  <div className="copy-btn" onClick={() => copyToClipboard(panel.content)}>
                    Copy
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', paddingBottom: '2rem' }}>
        DealPilot Procurement Assistant • Industrial Grade Precision
      </footer>
    </main>
  );
}
