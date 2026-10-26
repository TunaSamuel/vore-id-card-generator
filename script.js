(() => {
  "use strict";

  // ===== DOM refs =====
  const $ = (sel) => document.querySelector(sel);
  const card = $("#id-card");
  const photoInput = $("#photo");
  const bellyInput = $("#belly-photo");
  const photoPreview = $("#photo-preview");
  const photoPlaceholder = $("#photo-placeholder");
  const bellyPreview = $("#belly-preview");
  const bellyPlaceholder = $("#belly-placeholder");
  const cropControls = $("#crop-controls");
  const onWatchStamp = $("#on-watch-stamp");
  const customColors = $("#custom-colors");

  // Form fields
  const fields = {
    theme: $("#theme"),
    name: $("#name"),
    role: $("#role"),
    entrance: $("#entrance"),
    appetite: $("#appetite"),
    danger: $("#danger"),
    onWatch: $("#on-watch"),
    idNumber: $("#id-number"),
    expiration: $("#expiration"),
    totalSwallowed: $("#total-swallowed"),
    totalDigested: $("#total-digested"),
    safetyBlurb: $("#safety-blurb"),
    photoZoom: $("#photo-zoom"),
    photoX: $("#photo-x"),
    photoY: $("#photo-y"),
    colorPrimary: $("#color-primary"),
    colorAccent: $("#color-accent"),
    colorText: $("#color-text"),
  };

  // Preview targets
  const preview = {
    name: $("#preview-name"),
    role: $("#preview-role"),
    entrance: $("#preview-entrance"),
    appetite: $("#preview-appetite"),
    danger: $("#preview-danger"),
    id: $("#preview-id"),
    idBack: $("#preview-id-back"),
    exp: $("#preview-exp"),
    swallowed: $("#preview-swallowed"),
    digested: $("#preview-digested"),
    safety: $("#preview-safety"),
  };

  // Appetite meanings (1-5 + 6)
  const appetiteMeanings = {
    1: "1 — Selective",
    2: "2 — Moderate",
    3: "3 — Steady",
    4: "4 — Hungry",
    5: "5 — Ravenous",
    6: "6 — Insatiable",
  };

  // Safety blurb options
  const safetyTexts = {
    1: "This document does not guarantee safe reform. Digestion remains at the sole discretion of the registered predator. Carry and present at your own risk.",
    2: "The Department of Predatory Relations accepts no liability for permanent digestion, acid burns, or loss of personal effects. Predators are advised to confirm consent where applicable.",
    3: "Prey registrants acknowledge that entry into a predator may result in partial or complete digestion. Reform services, if available, are not covered by this registration.",
    4: "By presenting this card the holder waives all claims against the Department, its agents, and any registered predator arising from consumption, digestion, or related activities. Valid only while the holder remains intact.",
  };

  // Random data pools
  const randomNames = [
    "Vorath the Insatiable", "Lira Softgut", "Kael the Gulper", "Nyx Bellybound",
    "Sable the Ravenous", "Thorne Coilgut", "Mira the Swallow", "Drake Abyssmaw",
    "Elara the Elastic", "Riven the Deep", "Ashara Preykeeper", "Vex the Living Stomach",
    "Corin the Patient", "Lyra the Sudden", "Gideon the Wide", "Seraph the Warm"
  ];
  const randomRoles = ["Predator", "Prey", "Switch", "Other"];
  const randomEntrances = ["Oral", "Anal", "Unbirth", "Tail", "Other"];
  const randomDangers = ["Low", "Moderate", "High", "Extreme", "Catastrophic"];

  // ===== Helpers =====
  function generateId() {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `VR-${year}-${rand}`;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
  }

  function updateAppetiteLabel() {
    const v = fields.appetite.value;
    const text = appetiteMeanings[v] || v;
    $("#appetite-label").textContent = `(${text})`;
    preview.appetite.textContent = text;
  }

  // ===== Photo handling =====
  let photoObjectUrl = null;
  let bellyObjectUrl = null;

  function applyPhotoTransform() {
    if (!photoPreview.src) return;
    const zoom = fields.photoZoom.value / 100;
    const x = fields.photoX.value;
    const y = fields.photoY.value;
    photoPreview.style.transform = `scale(${zoom}) translate(${x}%, ${y}%)`;
  }

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
    photoObjectUrl = URL.createObjectURL(file);
    photoPreview.src = photoObjectUrl;
    photoPreview.hidden = false;
    photoPlaceholder.hidden = true;
    cropControls.hidden = false;
    // reset crop
    fields.photoZoom.value = 100;
    fields.photoX.value = 0;
    fields.photoY.value = 0;
    applyPhotoTransform();
  });

  bellyInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bellyObjectUrl) URL.revokeObjectURL(bellyObjectUrl);
    bellyObjectUrl = URL.createObjectURL(file);
    bellyPreview.src = bellyObjectUrl;
    bellyPreview.hidden = false;
    bellyPlaceholder.hidden = true;
  });

  ["photoZoom", "photoX", "photoY"].forEach((key) => {
    fields[key].addEventListener("input", applyPhotoTransform);
  });

  // ===== Live updates =====
  function updatePreview() {
    preview.name.textContent = fields.name.value.trim() || "—";
    preview.role.textContent = fields.role.value;
    preview.entrance.textContent = fields.entrance.value;
    updateAppetiteLabel();
    preview.danger.textContent = fields.danger.value;

    const idVal = fields.idNumber.value.trim() || "VR-2026-XXXXXX";
    preview.id.textContent = idVal;
    preview.idBack.textContent = idVal;

    preview.exp.textContent = formatDate(fields.expiration.value);
    preview.swallowed.textContent = fields.totalSwallowed.value || "0";
    preview.digested.textContent = fields.totalDigested.value || "0";
    preview.safety.textContent = safetyTexts[fields.safetyBlurb.value] || safetyTexts[1];

    // On Watch stamp
    onWatchStamp.hidden = !fields.onWatch.checked;

    // Theme
    const theme = fields.theme.value;
    card.dataset.theme = theme === "custom" ? "custom" : theme;
    customColors.hidden = theme !== "custom";

    if (theme === "custom") {
      // Apply custom colors via CSS variables on the card
      card.style.setProperty("--card-bg", fields.colorPrimary.value);
      card.style.setProperty("--card-text", fields.colorText.value);
      // derive muted from text
      card.style.setProperty("--card-muted", fields.colorText.value + "99");
      card.style.setProperty("--card-border", fields.colorAccent.value + "55");
      // header gradient uses accent
      const headers = card.querySelectorAll(".card-header, .back-header");
      headers.forEach((h) => {
        h.style.background = `linear-gradient(135deg, ${fields.colorPrimary.value} 0%, ${fields.colorAccent.value} 100%)`;
      });
    } else {
      // clear inline custom styles so data-theme CSS takes over
      card.style.removeProperty("--card-bg");
      card.style.removeProperty("--card-text");
      card.style.removeProperty("--card-muted");
      card.style.removeProperty("--card-border");
      const headers = card.querySelectorAll(".card-header, .back-header");
      headers.forEach((h) => {
        h.style.background = "";
      });
    }
  }

  // Bind all form inputs
  Object.values(fields).forEach((el) => {
    if (!el) return;
    el.addEventListener("input", updatePreview);
    el.addEventListener("change", updatePreview);
  });

  // ===== Flip =====
  function flipCard() {
    const side = card.dataset.side === "front" ? "back" : "front";
    card.dataset.side = side;
  }

  $("#btn-flip").addEventListener("click", flipCard);
  card.addEventListener("click", flipCard);

  // ===== Randomize =====
  function randomize() {
    fields.name.value = randomNames[Math.floor(Math.random() * randomNames.length)];
    fields.role.value = randomRoles[Math.floor(Math.random() * randomRoles.length)];
    fields.entrance.value = randomEntrances[Math.floor(Math.random() * randomEntrances.length)];
    fields.appetite.value = 1 + Math.floor(Math.random() * 6);
    fields.danger.value = randomDangers[Math.floor(Math.random() * randomDangers.length)];
    fields.onWatch.checked = Math.random() < 0.25;
    fields.idNumber.value = generateId();

    // future expiration 1-5 years out
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 1 + Math.floor(Math.random() * 5));
    fields.expiration.value = exp.toISOString().slice(0, 10);

    fields.totalSwallowed.value = Math.floor(Math.random() * 40);
    fields.totalDigested.value = Math.floor(Math.random() * Math.max(1, fields.totalSwallowed.value));
    fields.safetyBlurb.value = 1 + Math.floor(Math.random() * 4);

    // random theme (not custom)
    const themes = ["white", "midnight", "blood", "slate"];
    fields.theme.value = themes[Math.floor(Math.random() * themes.length)];

    updatePreview();
  }

  $("#btn-randomize").addEventListener("click", randomize);

  // ===== Download =====
  async function downloadCard() {
    const btn = $("#btn-download");
    const originalText = btn.textContent;
    btn.textContent = "Rendering…";
    btn.disabled = true;

    // Force front side for download? Or current side?
    // We'll download the currently visible side.
    // For a nicer experience we could offer both, but single PNG of current face is fine.

    try {
      // Temporarily remove 3D transform so html2canvas captures cleanly
      const prevTransform = card.style.transform;
      const prevTransition = card.style.transition;
      card.style.transition = "none";
      card.style.transform = card.dataset.side === "back" ? "rotateY(180deg)" : "none";

      // Wait a tick for styles to settle
      await new Promise((r) => requestAnimationFrame(r));

      const canvas = await html2canvas(card, {
        backgroundColor: null,
        scale: 3, // high-res for printing
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      // Restore
      card.style.transform = prevTransform;
      card.style.transition = prevTransition;

      const link = document.createElement("a");
      const namePart = (fields.name.value.trim() || "vore-id").replace(/[^a-z0-9]/gi, "-").toLowerCase();
      const side = card.dataset.side;
      link.download = `dpr-id-${namePart}-${side}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Could not render the card. Try again or use a different browser.");
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  $("#btn-download").addEventListener("click", downloadCard);

  // ===== Init =====
  // Set a sensible default expiration (2 years out)
  const defaultExp = new Date();
  defaultExp.setFullYear(defaultExp.getFullYear() + 2);
  fields.expiration.value = defaultExp.toISOString().slice(0, 10);

  // Placeholder ID
  fields.idNumber.placeholder = generateId();

  updatePreview();
})();
