/**
 * Athimanoharam Fans Show – booking backend (Google Apps Script).
 * Paste this into Extensions → Apps Script of your Google Sheet. See SETUP.md.
 */
const SHEET_NAME = 'Bookings';
const CAPACITY = 300;          // must match config.js
const MAX_PER_BOOKING = 10;
const PRICE = 50;              // AED per ticket
const ORGANIZER_EMAIL = '';    // optional: get an email for every booking
const EVENT_TEXT = 'Athimanoharam Fans Show · 24 December 2026 · MFCWA UAE';

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Timestamp', 'Booking ID', 'Name', 'Phone', 'Email', 'Emirate',
                  'Member ID', 'Tickets', 'Total (AED)', 'Payment Status', 'Checked In', 'Notes']);
    sh.setFrozenRows(1);
    sh.getRange('1:1').setFontWeight('bold').setBackground('#f5c451');
  }
  return sh;
}

function bookedCount_(sh) {
  const n = sh.getLastRow();
  if (n < 2) return 0;
  return sh.getRange(2, 8, n - 1, 1).getValues()
    .reduce((a, r) => a + (Number(r[0]) || 0), 0);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

// Stop spreadsheet formula injection and keep leading "+" on phone numbers
function safe_(v) {
  v = String(v || '').slice(0, 120);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doGet() {
  const b = bookedCount_(getSheet_());
  return json_({ ok: true, booked: b, capacity: CAPACITY, left: Math.max(0, CAPACITY - b) });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const tickets = parseInt(d.tickets, 10);
    if (!d.name || !d.phone || !d.emirate) return json_({ ok: false, error: 'Missing required fields.' });
    if (!(tickets >= 1 && tickets <= MAX_PER_BOOKING)) return json_({ ok: false, error: 'Invalid ticket count.' });

    const sh = getSheet_();
    const booked = bookedCount_(sh);
    if (booked + tickets > CAPACITY) {
      return json_({ ok: false, error: 'Sorry, only ' + Math.max(0, CAPACITY - booked) + ' tickets left.' });
    }

    const id = 'AMF-' + String(sh.getLastRow()).padStart(4, '0') + '-' +
               Math.random().toString(36).slice(2, 5).toUpperCase();
    const total = tickets * PRICE;
    sh.appendRow([new Date(), id, safe_(d.name), safe_(d.phone), safe_(d.email), safe_(d.emirate),
                  safe_(d.member), tickets, total, 'Pending', '', '']);

    const details = 'Booking ID: ' + id + '\nName: ' + d.name + '\nPhone: ' + d.phone +
                    '\nTickets: ' + tickets + '\nTotal: AED ' + total + '\n\n' + EVENT_TEXT;
    try {
      if (d.email) MailApp.sendEmail(String(d.email), 'Your ticket – ' + id,
        'Thank you for booking!\n\n' + details + '\n\nShow this booking ID at the entry.');
      if (ORGANIZER_EMAIL) MailApp.sendEmail(ORGANIZER_EMAIL, 'New booking ' + id, details);
    } catch (mailErr) { /* booking is saved even if email fails */ }

    return json_({ ok: true, id: id, total: total, left: CAPACITY - booked - tickets });
  } catch (err) {
    return json_({ ok: false, error: 'Server error, please try again.' });
  } finally {
    lock.releaseLock();
  }
}
