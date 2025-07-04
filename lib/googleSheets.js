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
    key: key.replace(/\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

export async function getSheetData(sheetId) {
  try {
    console.log('Getting sheet data for ID:', sheetId);
    
    const serviceAccountAuth = createAuth();
    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    
    await doc.loadInfo();
    console.log('Sheet loaded:', doc.title);
    
    const sheet = doc.sheetsByIndex[0];
    console.log('Working with sheet:', sheet.title);
    
    // Load all cells in the sheet to get complete data
    await sheet.loadCells();
    
    const data = [];
    // Read all rows
    for (let rowIndex = 0; rowIndex < sheet.rowCount; rowIndex++) {
      const rowData = [];
      let hasDataInRow = false;
      for (let colIndex = 0; colIndex < sheet.columnCount; colIndex++) {
        const cell = sheet.getCell(rowIndex, colIndex);
        const value = cell.value || '';
        rowData.push(String(value));
        if (value) {
          hasDataInRow = true;
        }
      }
      
      // Only add the row to the results if it actually contains data
      if (hasDataInRow) {
        data.push(rowData);
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

    // Define the starting row for updates. 6 is the 7th row.
    const startRow = 6; 
    const numRows = data.length;
    const numCols = data[0].length;

    // Load only the range of cells that needs to be updated
    await sheet.loadCells({ 
      startRowIndex: startRow, 
      endRowIndex: startRow + numRows, 
      startColumnIndex: 0, 
      endColumnIndex: numCols 
    });

    // Update each cell individually
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        // Offset by startRow to write to the correct location
        const cell = sheet.getCell(startRow + i, j);
        const value = data[i][j];
        if (value !== null && value !== '' && !isNaN(value)) {
          cell.value = Number(value);
        } else {
          cell.value = value;
        }
      }
    }

    // Save the changes
    await sheet.saveUpdatedCells();

    console.log('Sheet updated successfully');

  } catch (error) {
    console.error('Error updating sheet data:', error);
    throw new Error(`Failed to update sheet data: ${error.message}`);
  }
}
