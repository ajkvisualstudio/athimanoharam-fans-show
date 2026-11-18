// =====================================================================
//  EDIT THIS FILE ONLY — all event details live here.
// =====================================================================
window.EVENT = {
  title: "Athimanoharam",
  subtitle: "Special Fans Show",
  organizer: "MFCWA UAE",
  committee: "Online Committee",

  // Date & time of the show (UAE time, +04:00)
  dateISO: "2026-12-24T21:00:00+04:00",
  dateLabel: "Thursday, 24 December 2026",
  timeLabel: "9:00 PM",

  venue: "Star Galleria Cinemas",
  city: "Deira, Dubai",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Star+Galleria+Cinemas+Deira+Dubai",

  price: 50,              // <-- CHANGE: price per ticket
  currency: "AED",
  capacity: 300,          // <-- CHANGE: total seats (must match apps-script.gs)
  maxPerBooking: 10,

  // Organizer WhatsApp (international format, digits only)
  whatsapp: "971554272255",
  contacts: ["0554272255", "0562602143", "0522847924", "0525810429", "0564087633"],

  paymentNote:
    "Pay at the counter on show day or contact the committee. Show your booking ID / QR at the entry.",

  // false = show "Booking Starting Soon" (form hidden). Change to true to open bookings.
  bookingOpen: false,

  // Paste your Google Apps Script Web App URL here (see SETUP.md).
  // Leave empty = DEMO MODE (bookings saved only in this browser).
  scriptUrl: ""
};
