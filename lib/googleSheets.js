// import { GoogleSpreadsheet } from 'google-spreadsheet';
// import { JWT } from 'google-auth-library';

// const serviceAccountAuth = new JWT({
//   email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
//   key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
//   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
// });

// export async function getSheetData(sheetId, range = 'A1:Z1000') {
//   const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
//   await doc.loadInfo();
  
//   const sheet = doc.sheetsByIndex[0];
//   await sheet.loadCells(range);
  
//   const rows = [];
//   for (let i = 0; i < sheet.rowCount; i++) {
//     const row = [];
//     for (let j = 0; j < sheet.columnCount; j++) {
//       const cell = sheet.getCell(i, j);
//       row.push(cell.value || '');
//     }
//     rows.push(row);
//   }
  
//   return rows;
// }

// export async function updateSheetData(sheetId, data, range = 'A1') {
//   const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
//   await doc.loadInfo();
  
//   const sheet = doc.sheetsByIndex[0];
//   await sheet.loadCells();
  
//   // Update cells with new data
//   for (let i = 0; i < data.length; i++) {
//     for (let j = 0; j < data[i].length; j++) {
//       const cell = sheet.getCell(i, j);
//       cell.value = data[i][j];
//     }
//   }
  
//   await sheet.saveUpdatedCells();
// }

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Create JWT auth object
const createAuth = () => {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  
  if (!email || !key) {
    throw new Error('Missing Google Sheets credentials');
  }

  return new JWT({
    email: email,
    key: key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

export async function getSheetData(sheetId, range = 'A1:Z1000') {
  try {
    console.log('Getting sheet data for ID:', sheetId);
    
    const serviceAccountAuth = createAuth();
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    await doc.loadInfo();
    console.log('Sheet loaded:', doc.title);
    
    const sheet = doc.sheetsByIndex[0];
    console.log('Working with sheet:', sheet.title);
    
    // Get all rows
    const rows = await sheet.getRows();
    console.log('Found rows:', rows.length);
    
    // Convert to 2D array
    const data = [];
    
    if (sheet.headerValues && sheet.headerValues.length > 0) {
      // Add headers as first row
      data.push(sheet.headerValues);
      
      // Add data rows
      rows.forEach(row => {
        const rowData = sheet.headerValues.map(header => {
          return row.get(header) || '';
        });
        data.push(rowData);
      });
    } else {
      // If no headers, try to get raw cell data
      await sheet.loadCells('A1:Z100'); // Load a reasonable range
      
      const maxRow = Math.min(sheet.rowCount, 100);
      const maxCol = Math.min(sheet.columnCount, 26);
      
      for (let row = 0; row < maxRow; row++) {
        const rowData = [];
        let hasData = false;
        
        for (let col = 0; col < maxCol; col++) {
          const cell = sheet.getCell(row, col);
          const value = cell.value || '';
          rowData.push(String(value));
          if (value) hasData = true;
        }
        
        if (hasData) {
          data.push(rowData);
        } else if (data.length > 0) {
          // Stop if we hit an empty row after finding data
          break;
        }
      }
    }
    
    console.log('Processed data:', data.length, 'rows');
    return data;
    
  } catch (error) {
    console.error('Error getting sheet data:', error);
    throw new Error(`Failed to get sheet data: ${error.message}`);
  }
}

export async function updateSheetData(sheetId, data) {
  try {
    console.log('Updating sheet data for ID:', sheetId);
    
    if (!data || data.length === 0) {
      throw new Error('No data provided for update');
    }
    
    const serviceAccountAuth = createAuth();
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    // Clear existing content
    await sheet.clear();
    
    // If we have data, set it
    if (data.length > 0) {
      // Set headers (first row)
      await sheet.setHeaderRow(data[0]);
      
      // Add data rows (if any)
      if (data.length > 1) {
        const rows = data.slice(1).map(row => {
          const rowObj = {};
          data[0].forEach((header, index) => {
            rowObj[header] = row[index] || '';
          });
          return rowObj;
        });
        
        if (rows.length > 0) {
          await sheet.addRows(rows);
        }
      }
    }
    
    console.log('Sheet updated successfully');
    
  } catch (error) {
    console.error('Error updating sheet data:', error);
    throw new Error(`Failed to update sheet data: ${error.message}`);
  }
}