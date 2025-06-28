// import mongoose from 'mongoose';

// const SheetSchema = new mongoose.Schema({
//   sheetId: String,
//   range: String,
//   data: [[String]], // 2D array for sheet data
//   lastUpdated: { type: Date, default: Date.now }
// });

// export default mongoose.models.Sheet || mongoose.model('Sheet', SheetSchema);

import mongoose from 'mongoose';

const SheetSchema = new mongoose.Schema({
  sheetId: {
    type: String,
    required: true,
    unique: true
  },
  range: {
    type: String,
    default: 'A1:Z1000'
  },
  data: {
    type: [[String]], // 2D array for sheet data
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Export the model, but check if it already exists to avoid re-compilation errors
export default mongoose.models.Sheet || mongoose.model('Sheet', SheetSchema);