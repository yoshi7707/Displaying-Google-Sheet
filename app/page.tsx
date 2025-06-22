import SheetEditor from './components/SheetEditor';

export default function Home() {
  const sheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;

  return (
    <div className="container">
      <h1>Google Sheets Editor</h1>
      <SheetEditor sheetId={sheetId} />
    </div>
  );
}