function loadNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  const list = document.getElementById("note-list");
  list.innerHTML = "";

  notes.forEach((note, index) => {
    const div = document.createElement("div");
    div.className = "note";

    const content = document.createElement("p");
    content.textContent = note.text;
    div.appendChild(content);

    if (note.files && note.files.length) {
      note.files.forEach(file => {
        const link = document.createElement("a");
        link.href = file.data;
        link.download = file.name;
        link.textContent = `📎 ${file.name}`;
        link.target = "_blank";
        link.style.display = "block";
        div.appendChild(link);
      });
    }

    list.appendChild(div);
  });
}

function addNote() {
  const text = document.getElementById("note-text").value;
  const fileInput = document.getElementById("note-file");
  const files = fileInput.files;

  const fileData = [];

  const readerPromises = Array.from(files).map(file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        fileData.push({ name: file.name, data: reader.result });
        resolve();
      };
      reader.readAsDataURL(file);
    });
  });

  Promise.all(readerPromises).then(() => {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes.push({ text, files: fileData });
    localStorage.setItem("notes", JSON.stringify(notes));

    document.getElementById("note-text").value = "";
    fileInput.value = "";
    loadNotes();
  });
}

function askAI() {
  const apiKey = document.getElementById("api-key").value.trim();
  const question = document.getElementById("chat-question").value.trim();
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  const allNotes = notes.map(n => n.text).join("\n");

  const prompt = `Queste sono le mie note:\n${allNotes}\nDomanda: ${question}`;

  if (!apiKey || !question) {
    alert("Inserisci sia la domanda che l'API Key.");
    return;
  }

  fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  })
    .then(res => res.json())
    .then(data => {
      const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "Nessuna risposta.";
      document.getElementById("chat-response").textContent = output;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("chat-response").textContent = "Errore nella richiesta.";
    });
}

loadNotes();
