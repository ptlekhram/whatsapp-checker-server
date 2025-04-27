// index.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const express  = require('express');
const cors     = require('cors');
const bodyParser = require('body-parser');
const qrcode   = require('qrcode-terminal');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// WhatsApp Web client with persistent auth
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bulk-sender" })
});

client.on('qr', qr => {
  console.log('Scan this QR in WhatsApp Web:');
  qrcode.generate(qr, { small: true });
});
client.on('ready', () => {
  console.log('WhatsApp Web client is ready!');
});
client.initialize();

// POST /verify  →  expects { numbers: ["919876543210", ...] }
app.post('/verify', async (req, res) => {
  const { numbers } = req.body;
  if (!Array.isArray(numbers)) {
    return res.status(400).json({ error: 'numbers must be an array' });
  }
  const valid = [];
  for (let num of numbers) {
    try {
      const ok = await client.isRegisteredUser(num);
      console.log(`[verify] ${num} → ${ok}`);
      if (ok) valid.push(num);
    } catch (e) {
      console.error(`[verify] error checking ${num}:`, e.message);
    }
  }
  res.json({ valid });
});

const PORT = process.env.PORT || 3000;
// यहाँ हमने host '0.0.0.0' जोड़ दिया है
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
