// import dbConnect from '../../../lib/mongodb';
// import Sheet from '../../../models/Sheet';
// import { getSheetData, updateSheetData } from '../../../lib/googleSheets';

// export default async function handler(req, res) {
//   const { id } = req.query;
//   await dbConnect();

//   if (req.method === 'GET') {
//     try {
//       // Get data from Google Sheets
//       const sheetData = await getSheetData(id);
      
//       // Store/update in MongoDB
//       await Sheet.findOneAndUpdate(
//         { sheetId: id },
//         { 
//           sheetId: id,
//           data: sheetData,
//           lastUpdated: new Date()
//         },
//         { upsert: true }
//       );
      
//       res.status(200).json({ data: sheetData });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }

//   if (req.method === 'PUT') {
//     try {
//       const { data } = req.body;
      
//       // Update Google Sheets
//       await updateSheetData(id, data);
      
//       // Update MongoDB
//       await Sheet.findOneAndUpdate(
//         { sheetId: id },
//         { 
//           data: data,
//           lastUpdated: new Date()
//         }
//       );
      
//       res.status(200).json({ success: true });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// }

import dbConnect from '@/lib/mongodb';
import Sheet from '@/models/Sheet';
import { getSheetData, updateSheetData } from '@/lib/googleSheets';

// GET handler
export async function GET(request, { params }) {
  try {
    console.log('GET request for sheet ID:', params.id);
    
    // Check environment variables
    console.log('Environment check:');
    console.log('GOOGLE_SHEETS_CLIENT_EMAIL:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? 'Set' : 'Missing');
    console.log('GOOGLE_SHEETS_PRIVATE_KEY:', process.env.GOOGLE_SHEETS_PRIVATE_KEY ? 'Set (length: ' + process.env.GOOGLE_SHEETS_PRIVATE_KEY.length + ')' : 'Missing');
    
    await dbConnect();

    // Get data from Google Sheets
    const sheetData = await getSheetData(params.id);
    console.log('Sheet data retrieved:', sheetData?.length, 'rows');
    
    // Store/update in MongoDB
    await Sheet.findOneAndUpdate(
      { sheetId: params.id },
      { 
        sheetId: params.id,
        data: sheetData,
        lastUpdated: new Date()
      },
      { upsert: true }
    );
    
    return Response.json({ 
      success: true,
      data: sheetData,
      message: `Retrieved ${sheetData?.length || 0} rows`
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// PUT handler
export async function PUT(request, { params }) {
  try {
    console.log('PUT request for sheet ID:', params.id);
    
    const body = await request.json();
    const { data } = body;
    
    if (!data) {
      return Response.json({ 
        success: false,
        error: 'No data provided' 
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Update Google Sheets
    await updateSheetData(params.id, data);
    
    // Update MongoDB
    await Sheet.findOneAndUpdate(
      { sheetId: params.id },
      { 
        data: data,
        lastUpdated: new Date()
      }
    );
    
    return Response.json({ 
      success: true,
      message: 'Data updated successfully'
    });
    
  } catch (error) {
    console.error('API PUT Error:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}