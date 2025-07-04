"use client";

import { useState, useEffect } from 'react';
import styles from './SheetEditor.module.css';

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
      // We only want to save the data from the 7th row onwards
      const dataToSave = data.slice(6);
      await fetch(`/api/sheets/${sheetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: dataToSave }),
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
    <div className={styles['sheet-editor']}>
      <button 
        onClick={saveData} 
        disabled={saving}
        className={styles['save-btn']}
      >
        {saving ? 'Saving...' : '入力が終わったらここを押してしてください'}
      </button>
      
      <table className={styles['sheet-table']}>
        <tbody>
          {data.slice(2).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isReadOnly = rowIndex < 4; // Now that we slice, the first 4 rows are the old 3-6
                // Column indices are 0-based
                const narrowColumns = [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18];
                const wideColumns = [1, 4, 7, 10, 13, 16];

                const isNarrow = narrowColumns.includes(colIndex);
                const isWide = wideColumns.includes(colIndex);

                let cellClassName = '';
                if (isNarrow) {
                  cellClassName = styles['narrow-column'];
                } else if (isWide) {
                  cellClassName = styles['wide-column'];
                } 

                return (
                  <td key={colIndex} className={cellClassName}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex + 2, colIndex, e.target.value)} // Add 2 to the index to match the original data
                      className={`${styles['cell-input']} ${isReadOnly ? styles['read-only'] : ''}`}
                      maxLength={isNarrow ? 2 : undefined}
                      readOnly={isReadOnly}
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
 