const API_KEY = "AQ.Ab8RN6I0B7yDicaB-aSx7fZA9K6sng6yqx4vtn9Tj72Fd9_XDQ";

// Konfigurasi Kepribadian Assistant X
const SYSTEM_PROMPT = `
Kamu adalah 'Assistant X' (biasa dipanggil 'X'), asisten AI yang dibuat dan dikembangkan oleh Pstar7.

Karakteristik & Kepribadian:
- Identitas: Nama lengkapmu adalah Assistant X, panggil dirimu 'X'. Pembuat/ownermu adalah Pstar7. Jika ditanya tentang asal-usul atau pembuatmu, selalu sebut Pstar7 dengan santai dan jelas.
- Sifat: Enjoy, ramah, kalem, tidak gegabah, serta tidak keras kepala (terbuka menerima koreksi dan masukan pengguna).
- Gaya Bicara: Santai, luwes, tidak kaku, menggunakan bahasa Indonesia kasual yang natural dan enak diajak ngobrol.
- Kemampuan Coding: Sangat solutif dan asyik diajak coding maupun diskusi teknis. Berikan penjelasan yang jelas, to-the-point, dan sertakan kode yang rapi saat membahas pemrograman.
- Sikap: Selalu suportif dan tenang saat membantu mencari solusi atau memecahkan error.
`;

llet currentModel = "gemini-3.8-flash";
let chatHistory = [];

// Elemen DOM
const messagesArea = document.getElementById("messagesArea");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const modelModal = document.getElementById("modelModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const activeModelLabel = document.getElementById("activeModelLabel");
const modelCards = document.querySelectorAll(".model-card");

// Kontrol Modal
openModalBtn.addEventListener("click", () => {
  modelModal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
  modelModal.style.display = "none";
});

modelModal.addEventListener("click", (e) => {
  if (e.target === modelModal) modelModal.style.display = "none";
});

// Pilihan Model
modelCards.forEach((card) => {
  card.addEventListener("click", () => {
    currentModel = card.dataset.model;
    activeModelLabel.innerText = card.dataset.label;

    modelCards.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");

    modelModal.style.display = "none";
  });
});

// Kirim Pesan via Enter
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Render bubble user
  appendBubble(text, "user");
  userInput.value = "";
  sendBtn.disabled = true;

  chatHistory.push({ role: "user", parts: [{ text: text }] });

  // Render bubble loading AI
  const loadingBubble = appendBubble("Sedang mengetik...", "ai");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: chatHistory,
        generationConfig: { temperature: 0.7 }
      })
    });

    const data = await response.json();

    if (response.ok) {
      const aiReply = data.candidates[0].content.parts[0].text;
      loadingBubble.innerText = aiReply;
      chatHistory.push({ role: "model", parts: [{ text: aiReply }] });
    } else {
      loadingBubble.innerText = `Error (${response.status}): ${data.error?.message || "Gagal memproses"}`;
    }
  } catch (err) {
    loadingBubble.innerText = "Koneksi terputus. Silakan coba lagi.";
  } finally {
    sendBtn.disabled = false;
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }
}

function appendBubble(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${sender}`;
  bubble.innerText = text;
  messagesArea.appendChild(bubble);
  messagesArea.scrollTop = messagesArea.scrollHeight;
  return bubble;
}
