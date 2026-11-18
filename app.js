(function () {
  const E = window.EVENT;
  const $ = (id) => document.getElementById(id);
  const demo = !E.scriptUrl;
  const form = $("form");
  const F = form.elements;

  // Fill all [data-f] fields from config
  document.querySelectorAll("[data-f]").forEach((el) => { el.textContent = E[el.dataset.f]; });
  $("map-link").href = E.mapLink;
  $("contacts").innerHTML = E.contacts.map((n) => `<a href="tel:${n}">${n}</a>`).join(" ");
  if (demo && E.bookingOpen) $("demo-banner").hidden = false;

  // Booking starting soon mode
  if (!E.bookingOpen) {
    $("badge").textContent = "BOOKING STARTING SOON";
    $("badge").classList.add("soon-badge");
    $("hero-book").textContent = "Booking Starting Soon";
    $("nav-book").textContent = "Coming Soon";
    $("soon").hidden = false;
    form.hidden = true;
    $("soon-contacts").innerHTML = E.contacts.map((n) => `<a href="tel:${n}">📞 ${n}</a>`).join("");
  }

  // Background video + sound toggle
  const vid = $("bgvideo"), sb = $("sound-btn");
  const tryPlay = () => vid.play().catch(() => {});
  tryPlay();
  ["pointerdown", "touchstart", "scroll", "keydown"].forEach((ev) =>
    window.addEventListener(ev, () => { if (vid.paused) tryPlay(); }, { once: true, passive: true }));
  const songs = $("songs-video");
  songs.addEventListener("play", () => { vid.pause(); });
  songs.addEventListener("pause", tryPlay);
  sb.addEventListener("click", () => {
    vid.muted = !vid.muted;
    if (!vid.muted) { vid.volume = 0.7; vid.play().catch(() => {}); }
    sb.innerHTML = vid.muted ? "🔇 <span>Sound</span>" : "🔊 <span>Sound on</span>";
    sb.setAttribute("aria-label", vid.muted ? "Turn sound on" : "Turn sound off");
  });

  // Countdown
  const target = new Date(E.dateISO).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  function countdown() {
    const d = Math.max(0, target - Date.now()) / 1000;
    $("cd-d").textContent = pad(Math.floor(d / 86400));
    $("cd-h").textContent = pad(Math.floor((d % 86400) / 3600));
    $("cd-m").textContent = pad(Math.floor((d % 3600) / 60));
    $("cd-s").textContent = pad(Math.floor(d % 60));
  }
  countdown(); setInterval(countdown, 1000);

  // Seats left
  let left = E.capacity;
  function showSeats() {
    if (!E.bookingOpen) { $("seats-left").textContent = "⏳ Online booking opens soon"; return; }
    $("seats-left").textContent = left > 0 ? `🔥 Only ${left} seats left` : "Sold out — thank you!";
    F.tickets.max = Math.max(1, Math.min(E.maxPerBooking, left));
    $("submit").disabled = left <= 0;
  }
  function demoList() {
    try { return JSON.parse(localStorage.getItem("amf-bookings") || "[]"); } catch (e) { return []; }
  }
  async function loadSeats() {
    try {
      if (demo) {
        left = Math.max(0, E.capacity - demoList().reduce((a, b) => a + b.tickets, 0));
      } else {
        const j = await (await fetch(E.scriptUrl)).json();
        if (j.ok) left = j.left;
      }
    } catch (e) { /* keep default */ }
    showSeats();
  }
  loadSeats();

  // Total
  const fmt = (n) => `${E.currency} ${n}`;
  function updateTotal() { $("total").textContent = fmt((parseInt(F.tickets.value) || 0) * E.price); }
  F.tickets.addEventListener("input", updateTotal); updateTotal();

  function validate(d) {
    if (d.name.length < 2) return "Please enter your full name.";
    if (!/^\+?[0-9\s-]{8,16}$/.test(d.phone)) return "Please enter a valid mobile number.";
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return "Please enter a valid email.";
    if (!d.emirate) return "Please select your emirate.";
    if (!(d.tickets >= 1 && d.tickets <= E.maxPerBooking)) return `Tickets must be between 1 and ${E.maxPerBooking}.`;
    if (d.tickets > left) return `Only ${left} tickets left.`;
    return "";
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const d = {
      name: F.name.value.trim(),
      phone: F.phone.value.trim(),
      email: F.email.value.trim(),
      emirate: F.emirate.value,
      tickets: parseInt(F.tickets.value, 10),
      member: F.member.value.trim()
    };
    const err = validate(d);
    $("error").textContent = err;
    if (err) return;

    const btn = $("submit");
    btn.disabled = true; btn.textContent = "Booking…";
    try {
      let res;
      if (demo) {
        res = { ok: true, id: "AMF-" + Date.now().toString(36).toUpperCase().slice(-6), total: d.tickets * E.price };
        const list = demoList();
        list.push({ ...d, id: res.id, at: new Date().toISOString() });
        localStorage.setItem("amf-bookings", JSON.stringify(list));
      } else {
        // text/plain body avoids a CORS preflight with Google Apps Script
        res = await (await fetch(E.scriptUrl, { method: "POST", body: JSON.stringify(d) })).json();
      }
      if (!res.ok) throw new Error(res.error || "Booking failed");
      showTicket(d, res, false);
      loadSeats();
    } catch (e) {
      $("error").textContent = e.message || "Network error. Please try again.";
    } finally {
      btn.disabled = left <= 0; btn.textContent = "Confirm Booking";
    }
  });

  // Ticket
  let current = null;
  function showTicket(d, res, sample, instant) {
    current = { d, res };
    const total = res.total ?? d.tickets * E.price;
    $("t-name").textContent = d.name;
    $("t-id").textContent = $("t-id2").textContent = res.id;
    $("t-count").textContent = d.tickets;
    $("t-total").textContent = fmt(total);
    $("t-sample").hidden = !sample;
    $("qr").innerHTML = "";
    if (window.QRCode) {
      new QRCode($("qr"), { text: `${res.id}|${d.name}|${d.tickets}|${d.phone}`, width: 208, height: 208, correctLevel: QRCode.CorrectLevel.M });
    }
    const msg = `Hi MFCWA UAE, I booked ${E.title} ${E.subtitle} tickets.\n` +
      `Booking ID: ${res.id}\nName: ${d.name}\nPhone: ${d.phone}\nTickets: ${d.tickets}\nTotal: ${fmt(total)}`;
    $("wa-btn").href = `https://wa.me/${E.whatsapp}?text=${encodeURIComponent(msg)}`;
    $("wa-btn").hidden = sample;
    $("again").textContent = !E.bookingOpen ? "Back" : sample ? "Book Real Tickets" : "Book Again";
    form.hidden = true; $("soon").hidden = true;
    $("ticket-wrap").hidden = false;
    $("book").scrollIntoView({ behavior: instant ? "auto" : "smooth" });
  }

  // Sample ticket
  const SAMPLE = {
    d: { name: "Rahul Nair", phone: "0500000000", tickets: 2 },
    res: { id: "AMF-0001-DEMO", total: 2 * E.price }
  };
  document.querySelectorAll("[data-sample]").forEach((b) =>
    b.addEventListener("click", () => showTicket(SAMPLE.d, SAMPLE.res, true)));
  if (location.hash === "#sample") window.addEventListener("load", () => showTicket(SAMPLE.d, SAMPLE.res, true, true));

  $("again").addEventListener("click", () => {
    form.reset(); updateTotal();
    $("ticket-wrap").hidden = true;
    if (E.bookingOpen) form.hidden = false; else $("soon").hidden = false;
    $("book").scrollIntoView({ behavior: "smooth" });
  });

  // Download ticket as PNG (falls back to print)
  $("dl-btn").addEventListener("click", async () => {
    try {
      if (!window.html2canvas) throw 0;
      const canvas = await html2canvas($("ticket"), { scale: 2, backgroundColor: null, useCORS: true });
      const a = document.createElement("a");
      a.download = `Athimanoharam-Ticket-${current ? current.res.id : "ticket"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (e) {
      window.print();
    }
  });

  // Gallery lightbox
  const lb = $("lightbox");
  document.querySelectorAll(".g-item").forEach((g) => g.addEventListener("click", () => {
    lb.querySelector("img").src = g.dataset.full; lb.hidden = false;
  }));
  lb.addEventListener("click", () => { lb.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.hidden = true; });

  // 3D tilt on posters
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }
})();
