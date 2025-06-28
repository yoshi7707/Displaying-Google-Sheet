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
    console.log('Sheet dimensions:', sheet.rowCount, 'rows x', sheet.columnCount, 'columns');
    
    // Load all cells based on the sheet's dimensions to ensure all data is fetched.
    // This is more reliable than getRows() if the header row is not perfect.
    const maxCol = sheet.columnCount;
    const maxRow = sheet.rowCount;

    const getColumnLetter = (colIndex) => {
      let result = '';
      while (colIndex >= 0) {
        result = String.fromCharCode(65 + (colIndex % 26)) + result;
        colIndex = Math.floor(colIndex / 26) - 1;
      }
      return result;
    };

    const rangeToLoad = `A1:${getColumnLetter(maxCol - 1)}${maxRow}`;
    console.log('Loading cells with range:', rangeToLoad);
    
    await sheet.loadCells(rangeToLoad);
    
    const data = [];
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
      }
    }
    
    console.log('Processed data:', data.length, 'rows x', data[0]?.length || 0, 'columns');
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
      // Load the sheet with the required cell range
      const numRows = data.length;
      const numCols = data[0].length;
      await sheet.loadCells({ startRowIndex: 0, endRowIndex: numRows, startColumnIndex: 0, endColumnIndex: numCols });

      // Update each cell individually
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          const cell = sheet.getCell(i, j);
          cell.value = data[i][j];
        }
      }

      // Save the changes
      await sheet.saveUpdatedCells();
    }
    
    console.log('Sheet updated successfully');
    
  } catch (error) {
    console.error('Error updating sheet data:', error);
    throw new Error(`Failed to update sheet data: ${error.message}`);
  }
}