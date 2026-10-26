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
    "Corin the Patient", "Lyra the Sudden", "Gideon the Wide", "Seraph the Warm",
    "Onyx the Hollow", "Tess the Coiled", "Bram the Endless", "Yuki Softmaw"
  ];
  const randomRoles = ["Predator", "Prey", "Switch", "Other"];
  const randomEntrances = ["Oral", "Anal", "Unbirth", "Tail", "Other"];
  const randomDangers = ["Low", "Moderate", "High", "Extreme", "Catastrophic"];

  const STORAGE_KEY = "dpr-vore-id-v1";

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
    if (!photoPreview.src || photoPreview.hidden) return;
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
    fields.photoZoom.value = 100;
    fields.photoX.value = 0;
    fields.photoY.value = 0;
    applyPhotoTransform();
    saveState();
  });

  bellyInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bellyObjectUrl) URL.revokeObjectURL(bellyObjectUrl);
    bellyObjectUrl = URL.createObjectURL(file);
    bellyPreview.src = bellyObjectUrl;
    bellyPreview.hidden = false;
    bellyPlaceholder.hidden = true;
    saveState();
  });

  ["photoZoom", "photoX", "photoY"].forEach((key) => {
    fields[key].addEventListener("input", () => {
      applyPhotoTransform();
      saveState();
    });
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

    onWatchStamp.hidden = !fields.onWatch.checked;

    const theme = fields.theme.value;
    card.dataset.theme = theme === "custom" ? "custom" : theme;
    customColors.hidden = theme !== "custom";

    if (theme === "custom") {
      card.style.setProperty("--card-bg", fields.colorPrimary.value);
      card.style.setProperty("--card-text", fields.colorText.value);
      card.style.setProperty("--card-muted", fields.colorText.value + "99");
      card.style.setProperty("--card-border", fields.colorAccent.value + "55");
      const headers = card.querySelectorAll(".card-header, .back-header");
      headers.forEach((h) => {
        h.style.background = `linear-gradient(135deg, ${fields.colorPrimary.value} 0%, ${fields.colorAccent.value} 100%)`;
      });
    } else {
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
    el.addEventListener("input", () => {
      updatePreview();
      saveState();
    });
    el.addEventListener("change", () => {
      updatePreview();
      saveState();
    });
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

    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 1 + Math.floor(Math.random() * 5));
    fields.expiration.value = exp.toISOString().slice(0, 10);

    fields.totalSwallowed.value = Math.floor(Math.random() * 40);
    fields.totalDigested.value = Math.floor(Math.random() * Math.max(1, Number(fields.totalSwallowed.value)));
    fields.safetyBlurb.value = 1 + Math.floor(Math.random() * 4);

    const themes = ["white", "midnight", "blood", "slate"];
    fields.theme.value = themes[Math.floor(Math.random() * themes.length)];

    updatePreview();
    saveState();
  }

  $("#btn-randomize").addEventListener("click", randomize);

  // ===== Download (robust) =====
  async function captureSide(side) {
    const originalSide = card.dataset.side;
    const originalTransform = card.style.transform;
    const originalTransition = card.style.transition;

    card.style.transition = "none";
    card.dataset.side = side;
    card.style.transform = side === "back" ? "rotateY(180deg)" : "rotateY(0deg)";

    void card.offsetWidth;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const faces = card.querySelectorAll(".card-face");
    const prevStyles = [];
    faces.forEach((face, i) => {
      prevStyles[i] = {
        transform: face.style.transform,
        backface: face.style.backfaceVisibility,
        position: face.style.position,
        visibility: face.style.visibility,
      };
      if (face.classList.contains(side === "front" ? "card-front" : "card-back")) {
        face.style.transform = "none";
        face.style.backfaceVisibility = "visible";
        face.style.position = "relative";
        face.style.visibility = "visible";
      } else {
        face.style.visibility = "hidden";
        face.style.position = "absolute";
      }
    });

    card.style.transform = "none";

    await new Promise((r) => requestAnimationFrame(r));

    let canvas;
    try {
      canvas = await html2canvas(card, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });
    } finally {
      faces.forEach((face, i) => {
        face.style.transform = prevStyles[i].transform;
        face.style.backfaceVisibility = prevStyles[i].backface;
        face.style.position = prevStyles[i].position;
        face.style.visibility = prevStyles[i].visibility;
      });
      card.dataset.side = originalSide;
      card.style.transform = originalTransform;
      card.style.transition = originalTransition;
    }

    return canvas;
  }

  function triggerDownload(canvas, filename) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function makeFilename(side) {
    const namePart = (fields.name.value.trim() || "vore-id")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "vore-id";
    return `dpr-id-${namePart}-${side}.png`;
  }

  async function downloadSide(side) {
    const btnMap = {
      front: $("#btn-download-front"),
      back: $("#btn-download-back"),
      both: $("#btn-download"),
    };
    const btn = btnMap[side] || $("#btn-download");
    const original = btn.textContent;
    btn.textContent = "…";
    btn.disabled = true;

    try {
      if (side === "both") {
        const frontCanvas = await captureSide("front");
        triggerDownload(frontCanvas, makeFilename("front"));
        await new Promise((r) => setTimeout(r, 350));
        const backCanvas = await captureSide("back");
        triggerDownload(backCanvas, makeFilename("back"));
      } else {
        const canvas = await captureSide(side);
        triggerDownload(canvas, makeFilename(side));
      }
    } catch (err) {
      console.error(err);
      alert("Could not render the card. Try a different browser or disable extensions that block canvas.");
    } finally {
      btn.textContent = original;
      btn.disabled = false;
    }
  }

  $("#btn-download-front").addEventListener("click", () => downloadSide("front"));
  $("#btn-download-back").addEventListener("click", () => downloadSide("back"));
  $("#btn-download").addEventListener("click", () => downloadSide("both"));

  // ===== localStorage =====
  function saveState() {
    const state = {
      theme: fields.theme.value,
      name: fields.name.value,
      role: fields.role.value,
      entrance: fields.entrance.value,
      appetite: fields.appetite.value,
      danger: fields.danger.value,
      onWatch: fields.onWatch.checked,
      idNumber: fields.idNumber.value,
      expiration: fields.expiration.value,
      totalSwallowed: fields.totalSwallowed.value,
      totalDigested: fields.totalDigested.value,
      safetyBlurb: fields.safetyBlurb.value,
      photoZoom: fields.photoZoom.value,
      photoX: fields.photoX.value,
      photoY: fields.photoY.value,
      colorPrimary: fields.colorPrimary.value,
      colorAccent: fields.colorAccent.value,
      colorText: fields.colorText.value,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const state = JSON.parse(raw);
      if (state.theme) fields.theme.value = state.theme;
      if (state.name != null) fields.name.value = state.name;
      if (state.role) fields.role.value = state.role;
      if (state.entrance) fields.entrance.value = state.entrance;
      if (state.appetite) fields.appetite.value = state.appetite;
      if (state.danger) fields.danger.value = state.danger;
      if (state.onWatch != null) fields.onWatch.checked = !!state.onWatch;
      if (state.idNumber != null) fields.idNumber.value = state.idNumber;
      if (state.expiration) fields.expiration.value = state.expiration;
      if (state.totalSwallowed != null) fields.totalSwallowed.value = state.totalSwallowed;
      if (state.totalDigested != null) fields.totalDigested.value = state.totalDigested;
      if (state.safetyBlurb) fields.safetyBlurb.value = state.safetyBlurb;
      if (state.photoZoom) fields.photoZoom.value = state.photoZoom;
      if (state.photoX) fields.photoX.value = state.photoX;
      if (state.photoY) fields.photoY.value = state.photoY;
      if (state.colorPrimary) fields.colorPrimary.value = state.colorPrimary;
      if (state.colorAccent) fields.colorAccent.value = state.colorAccent;
      if (state.colorText) fields.colorText.value = state.colorText;
      return true;
    } catch (_) {
      return false;
    }
  }

  // ===== Init =====
  const hadSaved = loadState();

  if (!hadSaved) {
    const defaultExp = new Date();
    defaultExp.setFullYear(defaultExp.getFullYear() + 2);
    fields.expiration.value = defaultExp.toISOString().slice(0, 10);
    fields.idNumber.placeholder = generateId();
  }

  updatePreview();
  applyPhotoTransform();
})();
