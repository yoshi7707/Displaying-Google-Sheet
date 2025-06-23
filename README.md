This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Configuration

This application requires certain environment variables to be set to function correctly. These variables are used to authenticate with the Google Sheets API and to specify which sheet to load.

Create a file named `.env.local` in the root of your project and add the following content:

```
GOOGLE_SHEETS_CLIENT_EMAIL=your_google_service_account_email@developer.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n
NEXT_PUBLIC_GOOGLE_SHEET_ID=your_google_sheet_id
```

**Explanation of Variables:**

*   `GOOGLE_SHEETS_CLIENT_EMAIL`: The email address of your Google Cloud service account.
*   `GOOGLE_SHEETS_PRIVATE_KEY`: The private key for your Google Cloud service account. Make sure to replace `\n` with actual newlines if you are copying this from a JSON key file.
*   `NEXT_PUBLIC_GOOGLE_SHEET_ID`: The ID of the Google Sheet you want to edit. The `NEXT_PUBLIC_` prefix is important as it allows Next.js to expose this variable to the browser.

**Important:**
*   Do not commit your `.env.local` file to version control. Add `.env.local` to your `.gitignore` file if it's not already there.
*   You can obtain Google Cloud service account credentials from the [Google Cloud Console](https://console.cloud.google.com/). You will need to enable the Google Sheets API for your project.
*   The Google Sheet ID can be found in the URL of your Google Sheet. For example, in `https://docs.google.com/spreadsheets/d/your_google_sheet_id/edit`, `your_google_sheet_id` is the ID.
