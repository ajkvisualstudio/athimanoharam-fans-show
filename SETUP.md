# Athimanoharam Fans Show – Setup (all free)

## 1. Edit event details
Open `config.js` and set venue, time, price, capacity, WhatsApp number.

## 2. Make bookings save to Google Sheets (your "full details" admin view)
1. Go to https://sheets.google.com → create a blank sheet named **Athimanoharam Bookings**.
2. Menu **Extensions → Apps Script**. Delete everything, paste the contents of `apps-script.gs`.
   Set `CAPACITY`, `PRICE`, and (optional) `ORGANIZER_EMAIL` at the top. Click **Save**.
3. Click **Deploy → New deployment** → gear icon → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Click **Deploy**, allow the permissions (Advanced → Go to project → Allow).
4. Copy the **Web app URL** (ends in `/exec`) and paste it into `config.js` → `scriptUrl: "..."`.

Every booking now appears as a row: time, booking ID, name, phone, email, emirate,
member ID, tickets, total, payment status, checked-in. Customers who give an email get a
confirmation email automatically. Mark "Paid" / "Checked In" yourself in the sheet.

> If you change the script later: Deploy → Manage deployments → edit → Version: New version.

## 3. Put it online with a free domain
**Option A – Netlify (easiest, 2 minutes)**
1. Go to https://app.netlify.com/drop and sign up free.
2. Drag this whole folder onto the page.
3. Site settings → Change site name → `athimanoharam-mfcwa` →
   your link: **https://athimanoharam-mfcwa.netlify.app**

**Option B – GitHub Pages**: create a public repo, upload these files,
Settings → Pages → Deploy from branch `main` → `https://<username>.github.io/<repo>/`

(A real `.com` costs ~AED 40/year; you can connect one later in Netlify → Domain settings.)

## 4. Test
Open the site, make a test booking, check it appears in the sheet, then delete the test row.

## At the entry gate
Open the sheet on a phone, search (Ctrl+F) the booking ID from the customer's ticket/QR,
and type "Yes" in **Checked In**.

## Opening bookings
The site starts in **"Booking Starting Soon"** mode (form hidden, contact numbers shown).
When you're ready to take bookings, open `config.js` and change `bookingOpen: false` to `bookingOpen: true`.

## Background video
The background plays `assets/bg-video.mp4` (compressed web copy, ~19 MB, muted with a Sound button).
The original `video.mp4` (90 MB) is not used by the site — move it out of this folder before uploading to Netlify.
