# Google Sheets Integration Guide for Obrive Contact Form

This guide shows you how to connect your **Obrive Contact Form** directly to a **Google Sheet** so every customer inquiry is automatically recorded in real time.

---

## Step 1: Create a New Google Sheet

1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name your spreadsheet: **Obrive Customer Inquiries**.
3. (Optional) In Row 1, add these column headers:
   | A | B | C | D | E | F | G | H |
   |---|---|---|---|---|---|---|---|
   | **Timestamp** | **Full Name** | **Work Email** | **Company** | **Country** | **Service Required** | **Estimated Budget** | **Project Brief** |

> *Note: If you leave the sheet blank, the script will automatically create these headers formatted with Obrive mint `#B5EFE2`!*

---

## Step 2: Open Google Apps Script

1. In your Google Sheet, click **Extensions** in the top menu bar.
2. Select **Apps Script**.
3. Delete any default code inside the editor (`myFunction() { ... }`).
4. Paste the following production-ready script:

```javascript
/**
 * Obrive Customer Enquiries - Google Apps Script Webhook
 * Receives customer inquiries from website form and appends to sheet.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Prevent concurrent write race conditions

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();

    // Auto-create and style header row if sheet is fresh
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Full Name",
        "Work Email",
        "Company",
        "Country",
        "Service Required",
        "Estimated Budget",
        "Project Brief"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#B5EFE2");
      headerRange.setFontColor("#074139");
      headerRange.setFontFamily("Arial");
      sheet.setFrozenRows(1);
    }

    // Parse incoming payload (supports JSON or Form urlencoded)
    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    // Format new row
    var newRow = [
      data.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.name || "",
      data.email || "",
      data.company || "",
      data.country || "",
      data.service || "",
      data.budget || "",
      data.brief || ""
    ];

    sheet.appendRow(newRow);

    return ContentService
      .createTextOutput(JSON.stringify({ result: "success", row: newRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "Obrive Google Sheets Webhook is active" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Step 3: Deploy as Web App

1. In the top right corner of the Apps Script editor, click the blue **Deploy** button.
2. Select **New deployment**.
3. Next to "Select type", click the **Gear icon ⚙** and choose **Web app**.
4. Configure these fields:
   - **Description**: `Obrive Website Form Webhook`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(Crucial: This allows your website frontend to submit customer data without requiring customer login!)*
5. Click **Deploy**.
6. Review permissions if prompted by Google:
   - Click *Advanced* -> *Go to Obrive (unsafe)* -> *Allow*.
7. Copy the generated **Web app URL** (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).

---

## Step 4: Add Web App URL to your Code

You have two easy ways to set your URL:

### Option A: Via `.env` (Recommended)
Create or edit `.env` in the root folder:
```env
VITE_GOOGLE_SHEET_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

### Option B: Directly in `src/main.js`
In line 116 of [`src/main.js`](file:///home/yash/Documents/antigravity/kind-franklin/src/main.js#L116):
```javascript
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

---

## Testing Your Integration
1. Open your website on `http://localhost:5173/`.
2. Scroll to the **Contact Form** section.
3. Fill in test customer details and click **Send project enquiry**.
4. Check your Google Sheet — the new customer row will appear immediately!
5. In addition, all submissions are also saved in browser `localStorage` as a fail-safe backup.
