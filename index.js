const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const express = require('express');
const app = express();

// Render ko jagaye rakhne ke liye chhota server
app.get('/', (req, res) => res.send('International Hotel Bot is Alive!'));
app.listen(process.env.PORT || 3000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ 
        auth: state, 
        browser: Browsers.macOS('Desktop'),
        printQRInTerminal: true 
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        const from = msg.key.remoteJid;

        // MULTI-LANGUAGE MANAGER LOGIC (Hindi, Bangla, Korean, English)
        if (text.includes("price") || text.includes("rate") || text.includes("dam") || text.includes("mulya") || text.includes("gyeog")) {
            const reply = "🏨 *Hotel Rates:*\n" +
                          "🇮🇳 (Hindi): ₹2000 se shuru\n" +
                          "🇧🇩 (Bengali): ₹2000 theke shuru\n" +
                          "🇰🇷 (Korean): ₩32,000 부터\n" +
                          "🇺🇸 (English): Starting from ₹2000";
            await sock.sendMessage(from, { text: reply });
        } 
        else if (text.includes("location") || text.includes("thikana") || text.includes("wi-chi")) {
            await sock.sendMessage(from, { text: "📍 Location: Gangtok, Sikkim.\n(Bangla): Gangtok e obosthito.\n(Korean): 위치는 강토크입니다." });
        }
        else if (text.includes("book")) {
            await sock.sendMessage(from, { text: "📝 *Booking Enquiry:*\nPlease send your Name and Date." });
        }
        else {
            await sock.sendMessage(from, { text: "Namaste! 🙏\nRoom Rates? Type *'Price'*\nLocation? Type *'Location'*" });
        }
    });

    sock.ev.on("connection.update", (s) => {
        if (s.qr) qrcode.generate(s.qr, { small: true });
        if (s.connection === "open") console.log("GLOBAL MANAGER READY!");
    });
}
startBot();
      
