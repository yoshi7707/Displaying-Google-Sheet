import SheetEditor from '../components/SheetEditor';

export default function Home() {
  const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
  
  // Debug logging
  console.log('Environment variables check:');
  console.log('NEXT_PUBLIC_GOOGLE_SHEET_ID:', sheetId);
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));

  return (
    <div className="container">
      <h1>Google Sheets Editor</h1>
      <SheetEditor sheetId={sheetId} />
    </div>
  );
}