"use client"

import { useState, useEffect } from 'react';

interface SheetEditorProps {
  sheetId: string | undefined;
}

export default function SheetEditor({ sheetId }: SheetEditorProps) {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sheetId) {
      loadSheetData();
    } else {
      setLoading(false);
    }
  }, [sheetId]);

  const loadSheetData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sheets/${sheetId}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Error loading sheet data:', error);
      setData([]); // Reset data on error
    } finally {
      setLoading(false);
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
      }
      return row;
    });
    setData(newData);
  };

  const saveData = async () => {
    setSaving(true);
    try {
      await fetch(`/api/sheets/${sheetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading sheet...</div>;
  if (!sheetId) return <div>Google Sheet ID is not configured.</div>

  const displayData = data.map(row => row.slice(0, 2));

  return (
    <div className="sheet-editor">
      <button 
        onClick={saveData} 
        disabled={saving}
        className="save-btn"
      >
        {saving ? 'Saving...' : 'Save to Google Sheets & MongoDB'}
      </button>
      
      <table className="sheet-table">
        <tbody>
          {displayData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex}>
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    className="cell-input"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 