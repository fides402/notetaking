body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
  background: #f3f3f3;
  color: #333;
}

header {
  background: #fff;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.note-creator {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 1rem;
  background: #fff;
  margin: 1rem;
  border-radius: 8px;
}

.note-creator textarea {
  width: 100%;
  height: 100px;
  padding: 0.5rem;
  resize: vertical;
}

.note-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.note {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  word-wrap: break-word;
  position: relative;
}

.note .delete-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
}

.chatbot {
  background: #fff;
  margin: 1rem;
  padding: 1rem;
  border-radius: 8px;
}

.chatbot textarea {
  width: 100%;
  height: 80px;
  margin-top: 0.5rem;
}

#chat-response {
  margin-top: 1rem;
  white-space: pre-wrap;
  background: #f1f1f1;
  padding: 0.5rem;
  border-radius: 6px;
}
