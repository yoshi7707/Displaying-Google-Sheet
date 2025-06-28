"use client";

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

  return (
    <div className="sheet-editor">
      <button 
        onClick={saveData} 
        disabled={saving}
        className="save-btn"
      >
        {saving ? 'Saving...' : '入力が終わったらここをクリック'}
      </button>
      
      <table className="sheet-table">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                // Columns 2, 5, 8, 11, 14, 17 should be wider (0-indexed: 1, 4, 7, 10, 13, 16)
                const wideColumns = [1, 4, 7, 10, 13, 16];
                const widerColumns = [2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18];
                const isWide = wideColumns.includes(colIndex);
                const isWider = widerColumns.includes(colIndex);

                let width = '30px';
                if (isWide) {
                  width = '3000px';
                } else if (isWider) {
                  width = '1000px';
                }

                const style: React.CSSProperties = { width };
                if (rowIndex >= 2 && rowIndex <= 2) {
                  style.fontSize = '14px';
                } else {
                  style.fontSize = '16px';
                }

                return (
                  <td
                    key={colIndex}
                    style={style}
                  >
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="cell-input"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 