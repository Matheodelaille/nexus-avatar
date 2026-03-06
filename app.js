// Ta configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCdI7E9GP_aXIfsUHVA40KqK2iy6iMMBeM",
    authDomain: "nexus-avatar-system.firebaseapp.com",
    projectId: "nexus-avatar-system",
    storageBucket: "nexus-avatar-system.firebasestorage.app",
    messagingSenderId: "83235746154",
    appId: "1:83235746154:web:aa1bc5e7fae016a7de3513",
    measurementId: "G-W7M8S90T6X"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// TON DERNIER JETON
const streamlabsToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IjY1Mzk0QzE5MDM4NDgzRjU2N0Q1NDNERkU5M0MxRDE4RDk2MTJGM0JDQUNDQjBFM0Q2NDA1OEIzOUU2QUY0MjNCNEZDNDExNDg1RDUwMzA1MEI4REM5QTExQzEwQTEyQzc2NDY5QTc4QzE4RUJCM0NBQjM3OTU2Q0I3MkUxREQ4NUMwQjQ3NzY2OUFFRDEzNzgwN0MxRjQ0RkJDMzE4MkVGQTYzQjg3MEZEMjRFMDVBMDkzQzBDMEZBN0E0NDlCQzk5NkY3Q0ZBNzFEQkZCNzQyM0M3NUQ3MjU3RkNCODlBMzNDNkM3QTIxQ0MzRDRERjNGRjc0QzQ5RDMiLCJyZWFkX29ubHkiOnRydWUsInByZXZlbnRfbWFzdGVyIjp0cnVlLCJ0d2l0Y2hfaWQiOiI3NDQ0NzU5OTAiLCJ5b3V0dWJlX2lkIjoiVUNUeXgtSUR2eWtNOThXRW13TThwYkZnIn0.mj0eHKL3MaDMwtOpzx2GeNJIEhKSNZDPJ9MZ-aXoqnE";

console.log("DEBUG : Le script app.js est bien chargé !");

// Connexion Socket corrigée (suppression du }); parasite)
const socket = io(`https://sockets.streamlabs.com?token=${streamlabsToken}`, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10
});

const container = document.getElementById('nexus-container');
let speakTimeout;

// Bloc d'écoute "Radar" (Ligne 36 à 54)
socket.on('event', (eventData) => {
    // 1. On affiche ABSOLUMENT TOUT ce qui arrive dans la console
    console.log("📢 FLUX REÇU :", eventData);

    let messageData = null;

    // 2. On cherche le message dans TOUS les recoins possibles
    if (eventData.message && eventData.message[0]) {
        messageData = eventData.message[0];
    } else if (eventData.body && eventData.body.message) {
        messageData = eventData.body;
    }

    // 3. Si on trouve un expéditeur (from), on déclenche NEXUS
    if (messageData && (messageData.from || messageData.name)) {
        const username = messageData.from || messageData.name;
        console.log(`🎯 NEXUS CAPTE ENFIN : ${username}`);
        triggerSpeaking();
        processUserXP(username);
    }
});

function triggerSpeaking() {
    if (!container) return;
    container.classList.add('is-speaking');
    clearTimeout(speakTimeout);
    speakTimeout = setTimeout(() => {
        container.classList.remove('is-speaking');
    }, 3000);
}

async function processUserXP(username) {
    const userRef = db.collection("viewers").doc(username);
    try {
        const doc = await userRef.get();
        let data = doc.exists ? doc.data() : { xp: 0, level: 1 };

        data.xp += 10;
        if (data.xp >= 100) {
            data.xp = 0;
            data.level += 1;
            console.log(`🎉 ${username} passe au niveau ${data.level} !`);
        }

        await userRef.set(data, { merge: true });
        updateXPUI(username, data.xp, data.level);
    } catch (e) {
        console.error("Erreur Firebase :", e);
    }
}

function updateXPUI(username, xp, level) {
    const fill = document.getElementById('xp-bar-fill');
    const text = document.getElementById('xp-text');
    if (fill && text) {
        fill.style.width = xp + "%";
        text.innerHTML = `${username.toUpperCase()} - LVL ${level} (${xp}/100 XP)`;
    }
}

