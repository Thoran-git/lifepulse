import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── YOUR API KEYS ────────────────────────────────────────────────────────────
const GOOGLE_MAPS_KEY = "import.meta.env.VITE_MAPS_KEY"; // ← paste here
const GEMINI_API_KEY  = "import.meta.env.VITE_GEMINI_KEY";       // ← FREE: aistudio.google.com
// ─────────────────────────────────────────────────────────────────────────────

const LANGS = {
  en: {
    flag:"🇬🇧", name:"English",
    tag:"AI · CPR · COACH", title:"LifePulse",
    tagline:"Every Second Counts.",
    sub:"AI voice coaching · Live GPS · Nearest hospitals · 108 auto-call",
    btnEmergency:"🚨  SOMEONE NEEDS HELP",
    btnTrain:"📚  Learn CPR — Practice Mode",
    locating:"📍 Getting your location…",
    locDone:"📍 Location found!",
    locErr:"📍 GPS failed — allow location access",
    hospSearch:"🏥 Searching nearby hospitals…",
    hospDone:"🏥 Hospitals found!",
    calling:"📞 Calling 108…",
    callDone:"📞 108 Called ✓",
    hospTitle:"NEAREST HOSPITALS",
    startCPR:"❤️  Start CPR with AI Guide",
    waiting:"⏳  Setting up — please wait…",
    elapsed:"ELAPSED", cycles:"CYCLES", bpm:"BPM",
    compressions:"COMPRESSIONS",
    breathTitle:"GIVE 2 BREATHS",
    breathDesc:"Tilt head · Lift chin · Seal mouth · 1 sec each",
    stopCPR:"Stop CPR",
    aiCoach:"🤖 AI Coach",
    typing:"typing…",
    placeholder:"Ask anything…",
    send:"Send",
    quick:["Child victim?","I'm tired","Depth?","Keep going!"],
    reportTitle:"CPR Report",
    reportSub:"You did something extraordinary ❤️",
    paraTitle:"Tell Paramedics",
    paraLines:["CPR was performed","Victim unresponsive, not breathing","No AED available"],
    backHome:"← Return Home",
    trainTitle:"Learn CPR",
    trainMode:"TRAINING MODE",
    trainSteps:[
      {icon:"🙌", phase:"Position Yourself",   detail:"Kneel beside victim. Place heel of your dominant hand on center of chest — lower half of sternum."},
      {icon:"🤝", phase:"Hand Placement",       detail:"Place second hand on top, interlace fingers. Keep fingers raised off the chest at all times."},
      {icon:"🧍", phase:"Body Posture",         detail:"Straighten arms completely. Align shoulders directly above your hands. Use your full body weight."},
      {icon:"↕️", phase:"Compression Depth",   detail:"Push down firmly 5–6 cm (2 inches). Allow full chest recoil between each compression."},
      {icon:"💨", phase:"Rescue Breaths",       detail:"After 30 compressions: tilt head back, lift chin, seal mouth, give 2 breaths of 1 second each."},
      {icon:"🔄", phase:"Keep Going",           detail:"Maintain 30:2 rhythm. Switch with another person every 2 minutes if possible. Don't give up."},
    ],
    voiceStart:"Emergency activated. Getting your location and finding nearby hospitals.",
    voiceCPR:"CPR started. Push hard and fast. I am right here guiding you.",
    aiSystem:"You are LifePulse, an expert emergency CPR coach. NEVER repeat the same phrases. Give specific, direct advice based on what is asked. Child victim: use 2 fingers, compress 4cm. Depth question: say 5-6 cm. Tiredness: suggest switching hands, take a breath. Always vary your wording. Stats: {c} compressions, {cy} cycles, {t} elapsed. Max 2 sentences. Be calm and direct.",
  },
  hi: {
    flag:"🇮🇳", name:"हिंदी",
    tag:"AI · CPR · कोच", title:"LifePulse",
    tagline:"हर पल मायने रखता है।",
    sub:"AI वॉयस गाइडेंस · लाइव GPS · नज़दीकी अस्पताल",
    btnEmergency:"🚨  किसी को मदद चाहिए",
    btnTrain:"📚  CPR सीखें — अभ्यास मोड",
    locating:"📍 आपकी लोकेशन मिल रही है…",
    locDone:"📍 लोकेशन मिल गई!",
    locErr:"📍 GPS विफल — अनुमति दें",
    hospSearch:"🏥 नज़दीकी अस्पताल खोज रहे हैं…",
    hospDone:"🏥 अस्पताल मिले!",
    calling:"📞 108 पर कॉल हो रही है…",
    callDone:"📞 108 कॉल हो गई ✓",
    hospTitle:"नज़दीकी अस्पताल",
    startCPR:"❤️  AI गाइड के साथ CPR शुरू करें",
    waiting:"⏳  सेटअप हो रहा है…",
    elapsed:"समय", cycles:"चक्र", bpm:"BPM",
    compressions:"दबाव",
    breathTitle:"2 सांसें दें",
    breathDesc:"सिर पीछे · ठोड़ी उठाएं · मुंह बंद करें · 1 सेकंड",
    stopCPR:"CPR रोकें",
    aiCoach:"🤖 AI कोच",
    typing:"टाइप हो रहा है…",
    placeholder:"कुछ भी पूछें…",
    send:"भेजें",
    quick:["बच्चा है?","थक गया हूं","गहराई?","जारी रखो!"],
    reportTitle:"CPR रिपोर्ट",
    reportSub:"आपने कुछ असाधारण किया ❤️",
    paraTitle:"पैरामेडिक्स को बताएं",
    paraLines:["CPR दिया गया","पीड़ित बेहोश, सांस नहीं","AED उपलब्ध नहीं"],
    backHome:"← होम पर वापस",
    trainTitle:"CPR सीखें",
    trainMode:"प्रशिक्षण मोड",
    trainSteps:[
      {icon:"🙌", phase:"स्थिति लें",       detail:"पीड़ित के पास घुटने टेकें। अरचेती को छाती के बीच में रखें।"},
      {icon:"🤝", phase:"हाथ रखें",         detail:"दूसरा हाथ ऊपर, उंगलियां मिलाएं। उंगलियां छाती से ऊपर रखें।"},
      {icon:"🧍", phase:"शरीर की स्थिति",   detail:"बाहें सीधी रखें। पूरे शरीर का वजन लगाएं।"},
      {icon:"↕️", phase:"दबाव की गहराई",   detail:"5–6 सेमी नीचे दबाएं। हर बार पूरी तरह वापस आने दें।"},
      {icon:"💨", phase:"सांस दें",         detail:"30 दबाव के बाद: सिर पीछे, ठोड़ी उठाएं, 2 सांस दें।"},
      {icon:"🔄", phase:"जारी रखें",        detail:"30:2 लय बनाए रखें। हर 2 मिनट में बदलें।"},
    ],
    voiceStart:"आपातकाल सक्रिय। लोकेशन और अस्पताल खोजे जा रहे हैं।",
    voiceCPR:"CPR शुरू। जोर से और तेज दबाएं।",
    aiSystem:"आप LifePulse हैं, CPR कोच। हिंदी में जवाब दें। दोहराएं नहीं। बच्चे: 2 उंगलियां 4 सेमी। गहराई: 5-6 सेमी। Stats: {c} दबाव, {cy} चक्र, {t}। अधिकतम 2 वाक्य।",
  },
  te: {
    flag:"🇮🇳", name:"తెలుగు",
    tag:"AI · CPR · కోచ్", title:"LifePulse",
    tagline:"ప్రతి క్షణం విలువైనది.",
    sub:"AI వాయిస్ గైడెన్స్ · లైవ్ GPS · సమీప ఆసుపత్రులు",
    btnEmergency:"🚨  ఎవరికైనా సహాయం కావాలి",
    btnTrain:"📚  CPR నేర్చుకోండి",
    locating:"📍 మీ లొకేషన్ వెతుకుతున్నాం…",
    locDone:"📍 లొకేషన్ దొరికింది!",
    locErr:"📍 GPS విఫలమైంది",
    hospSearch:"🏥 సమీప ఆసుపత్రులు వెతుకుతున్నాం…",
    hospDone:"🏥 ఆసుపత్రులు దొరికాయి!",
    calling:"📞 108కి కాల్ చేస్తున్నాం…",
    callDone:"📞 108 కాల్ అయింది ✓",
    hospTitle:"సమీప ఆసుపత్రులు",
    startCPR:"❤️  AI గైడ్‌తో CPR ప్రారంభించండి",
    waiting:"⏳  సెటప్ అవుతోంది…",
    elapsed:"సమయం", cycles:"సైకిల్స్", bpm:"BPM",
    compressions:"కంప్రెషన్లు",
    breathTitle:"2 శ్వాసలు ఇవ్వండి",
    breathDesc:"తల వెనక్కి · గడ్డం పైకి · నోరు మూయండి",
    stopCPR:"CPR ఆపండి",
    aiCoach:"🤖 AI కోచ్",
    typing:"టైప్ అవుతోంది…",
    placeholder:"ఏదైనా అడగండి…",
    send:"పంపు",
    quick:["పిల్లవాడా?","అలసిపోయా","లోతు?","కొనసాగండి!"],
    reportTitle:"CPR నివేదిక",
    reportSub:"మీరు అద్భుతమైన పని చేశారు ❤️",
    paraTitle:"పారామెడిక్స్‌కు చెప్పండి",
    paraLines:["CPR ఇవ్వబడింది","Victim స్పృహలేకుండా","AED అందుబాటులో లేదు"],
    backHome:"← హోమ్‌కు వెళ్ళండి",
    trainTitle:"CPR నేర్చుకోండి",
    trainMode:"శిక్షణ మోడ్",
    trainSteps:[
      {icon:"🙌", phase:"స్థితి తీసుకోండి",   detail:"బాధితుడి పక్కన మోకాళ్ళు వేయండి. అరచేయి ఛాతీ మధ్యలో పెట్టండి."},
      {icon:"🤝", phase:"చేతులు పెట్టండి",     detail:"రెండో చేయి పైన, వేళ్ళు కలపండి."},
      {icon:"🧍", phase:"శరీర భంగిమ",          detail:"చేతులు నిటారుగా. శరీర బరువు వాడండి."},
      {icon:"↕️", phase:"కంప్రెషన్ లోతు",     detail:"5–6 సెం.మీ. నొక్కండి. పూర్తిగా తిరిగి రానివ్వండి."},
      {icon:"💨", phase:"శ్వాసలు ఇవ్వండి",    detail:"30 కంప్రెషన్ల తర్వాత 2 శ్వాసలు ఇవ్వండి."},
      {icon:"🔄", phase:"కొనసాగండి",           detail:"30:2 లయ నిర్వహించండి. 2 నిమిషాలకు మారండి."},
    ],
    voiceStart:"అత్యవసర పరిస్థితి. లొకేషన్ మరియు ఆసుపత్రులు వెతుకుతున్నాం.",
    voiceCPR:"CPR మొదలైంది. గట్టిగా నొక్కండి.",
    aiSystem:"మీరు LifePulse CPR కోచ్. తెలుగులో జవాబు ఇవ్వండి. పునరావృతం చేయవద్దు. Stats: {c} కంప్రెషన్లు, {cy} సైకిల్స్, {t}. గరిష్టంగా 2 వాక్యాలు.",
  },
  ta: {
    flag:"🇮🇳", name:"தமிழ்",
    tag:"AI · CPR · பயிற்சியாளர்", title:"LifePulse",
    tagline:"ஒவ்வொரு நொடியும் முக்கியம்.",
    sub:"AI குரல் வழிகாட்டி · நேரடி GPS · அருகில் மருத்துவமனைகள்",
    btnEmergency:"🚨  யாருக்காவது உதவி தேவை",
    btnTrain:"📚  CPR கற்றுக்கொள்ளுங்கள்",
    locating:"📍 இடம் தேடுகிறோம்…",
    locDone:"📍 இடம் கண்டுபிடிக்கப்பட்டது!",
    locErr:"📍 GPS தோல்வி",
    hospSearch:"🏥 மருத்துவமனைகள் தேடுகிறோம்…",
    hospDone:"🏥 மருத்துவமனைகள் கண்டுபிடிக்கப்பட்டன!",
    calling:"📞 108 அழைக்கிறோம்…",
    callDone:"📞 108 அழைக்கப்பட்டது ✓",
    hospTitle:"அருகில் உள்ள மருத்துவமனைகள்",
    startCPR:"❤️  AI வழிகாட்டியுடன் CPR தொடங்குங்கள்",
    waiting:"⏳  அமைக்கிறோம்…",
    elapsed:"நேரம்", cycles:"சுழற்சிகள்", bpm:"BPM",
    compressions:"அழுத்தங்கள்",
    breathTitle:"2 சுவாசங்கள் கொடுங்கள்",
    breathDesc:"தலையை சாய்யுங்கள் · கன்னம் தூக்குங்கள் · வாயை மூடுங்கள்",
    stopCPR:"CPR நிறுத்துங்கள்",
    aiCoach:"🤖 AI பயிற்சியாளர்",
    typing:"தட்டச்சு…",
    placeholder:"எதையும் கேளுங்கள்…",
    send:"அனுப்பு",
    quick:["குழந்தையா?","சோர்வாக இருக்கேன்","ஆழம்?","தொடரு!"],
    reportTitle:"CPR அறிக்கை",
    reportSub:"நீங்கள் அசாதாரணமான ஒன்று செய்தீர்கள் ❤️",
    paraTitle:"பாராமெடிக்ஸிடம் சொல்லுங்கள்",
    paraLines:["CPR வழங்கப்பட்டது","நோயாளி உணர்வற்று","AED கிடைக்கவில்லை"],
    backHome:"← முகப்புக்கு திரும்பு",
    trainTitle:"CPR கற்றுக்கொள்ளுங்கள்",
    trainMode:"பயிற்சி பயன்முறை",
    trainSteps:[
      {icon:"🙌", phase:"நிலை எடுங்கள்",         detail:"நோயாளியின் அருகில் முழந்தாளிடுங்கள். மார்பின் மையத்தில் உள்ளங்கை வையுங்கள்."},
      {icon:"🤝", phase:"கைகள் வையுங்கள்",       detail:"இரண்டாவது கை மேலே, விரல்களை பின்னுங்கள்."},
      {icon:"🧍", phase:"உடல் நிலை",              detail:"கைகளை நேராக வையுங்கள். முழு உடல் எடையை பயன்படுத்துங்கள்."},
      {icon:"↕️", phase:"அழுத்த ஆழம்",           detail:"5–6 செ.மீ. அழுத்துங்கள். முழுமையாக திரும்ப அனுமதியுங்கள்."},
      {icon:"💨", phase:"சுவாசங்கள் கொடுங்கள்",  detail:"30 அழுத்தங்களுக்கு பிறகு 2 சுவாசங்கள் கொடுங்கள்."},
      {icon:"🔄", phase:"தொடருங்கள்",            detail:"30:2 தாளம் பராமரியுங்கள். 2 நிமிடங்களுக்கு ஒருமுறை மாறுங்கள்."},
    ],
    voiceStart:"அவசரநிலை. இடமும் மருத்துவமனைகளும் தேடப்படுகின்றன.",
    voiceCPR:"CPR தொடங்கியது. வலுவாக அழுத்துங்கள்.",
    aiSystem:"நீங்கள் LifePulse CPR பயிற்சியாளர். தமிழில் பதில் சொல்லுங்கள். திரும்பச் சொல்லாதீர்கள். Stats: {c} அழுத்தங்கள், {cy} சுழற்சிகள், {t}. அதிகபட்சம் 2 வாக்கியங்கள்.",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(s) {
  const m = Math.floor(s / 60), sc = s % 60;
  return `${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`;
}

function doSpeak(text, langKey) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langKey === "hi" ? "hi-IN" : langKey === "te" ? "te-IN" : langKey === "ta" ? "ta-IN" : "en-IN";
  u.rate = 0.9; u.volume = 1;
  window.speechSynthesis.speak(u);
}

function calcDist(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #07080f; }
  ::-webkit-scrollbar { width: 0; }
  @keyframes pulse  { 0%,100%{transform:scale(1)}  50%{transform:scale(1.12)} }
  @keyframes blink  { 0%,100%{opacity:1}           50%{opacity:0.15} }
  @keyframes fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glow   { 0%,100%{box-shadow:0 0 22px rgba(239,68,68,0.35)} 50%{box-shadow:0 0 44px rgba(239,68,68,0.65)} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes breath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  @keyframes slideup{ from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes gpulse { 0%{transform:scale(0.5);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
  .btn { cursor:pointer; border:none; font-family:inherit; transition:transform 0.1s,opacity 0.1s; }
  .btn:active { transform:scale(0.96); }
  .fadein { animation: fadein 0.4s ease both; }
`;

// ── Colours ────────────────────────────────────────────────────────────────────
const R = "#ef4444", G = "#10b981";
const bg = "#07080f", card = "rgba(255,255,255,0.04)", border = "rgba(255,255,255,0.09)";
const text = "#fef2f2", muted = "rgba(254,202,202,0.55)", dim = "rgba(254,202,202,0.28)";
const mono = "'DM Mono',monospace", sans = "'Plus Jakarta Sans',sans-serif";

// ── Small Components ───────────────────────────────────────────────────────────
function Heart({ beat, size = 110 }) {
  return (
    <div style={{ width:size, height:size*0.92, transition:"transform 0.18s cubic-bezier(0.34,1.56,0.64,1)", transform: beat ? "scale(1.13)" : "scale(1)", filter: beat ? "drop-shadow(0 0 24px rgba(239,68,68,0.8))" : "drop-shadow(0 0 10px rgba(239,68,68,0.35))" }}>
      <svg viewBox="0 0 100 92" style={{ width:"100%", height:"100%" }}>
        <defs>
          <radialGradient id="hg" cx="50%" cy="36%" r="58%">
            <stop offset="0%"   stopColor="#fca5a5"/>
            <stop offset="35%"  stopColor="#ef4444"/>
            <stop offset="70%"  stopColor="#b91c1c"/>
            <stop offset="100%" stopColor="#7f1d1d"/>
          </radialGradient>
          <radialGradient id="hs" cx="34%" cy="26%" r="34%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.38)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>
        <path d="M50 88 C18 67,1 48,1 28 C1 13,12 3,26 3 C35 3,43 8,50 18 C57 8,65 3,74 3 C88 3,99 13,99 28 C99 48,82 67,50 88Z" fill="url(#hg)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.5"/>
        <path d="M50 88 C18 67,1 48,1 28 C1 13,12 3,26 3 C35 3,43 8,50 18 C57 8,65 3,74 3 C88 3,99 13,99 28 C99 48,82 67,50 88Z" fill="url(#hs)"/>
        <circle cx="34" cy="20" r="4" fill="rgba(255,255,255,0.28)"/>
      </svg>
    </div>
  );
}

// SVG ECG line — no canvas, no crash
function ECGLine({ active }) {
  const [offset, setOffset] = useState(0);
  const raf = useRef(null);
  const speed = active ? 2.2 : 0.7;

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      setOffset(o => (o + speed) % 220);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(raf.current); };
  }, [active, speed]);

  const ecg = "M0,28 L18,28 L22,18 L27,38 L31,8 L35,28 L50,28 L54,28 L58,15 L63,42 L67,5 L71,28 L90,28 L110,28";

  return (
    <div style={{ width:"100%", height:56, overflow:"hidden", borderRadius:8, background:"rgba(255,255,255,0.015)", position:"relative" }}>
      <svg width="100%" height="56" viewBox="0 0 360 56" preserveAspectRatio="none">
        {/* glow */}
        <use href="#ecgpath" style={{ stroke:`rgba(239,68,68,0.06)`, strokeWidth:10, transform:`translateX(${-offset}px)` }}/>
        <use href="#ecgpath" style={{ stroke:`rgba(239,68,68,0.15)`, strokeWidth:4,  transform:`translateX(${-offset}px)` }}/>
        <use href="#ecgpath" style={{ stroke:`rgba(239,68,68,0.9)`,  strokeWidth:1.6,transform:`translateX(${-offset}px)` }}/>
        {/* second cycle so it wraps smoothly */}
        <use href="#ecgpath" style={{ stroke:`rgba(239,68,68,0.06)`, strokeWidth:10, transform:`translateX(${220-offset}px)` }}/>
        <use href="#ecgpath" style={{ stroke:`rgba(239,68,68,0.15)`, strokeWidth:4,  transform:`translateX(${220-offset}px)` }}/>
        <use href="#ecgpath" style={{ stroke:`rgba(239,68,68,0.9)`,  strokeWidth:1.6,transform:`translateX(${220-offset}px)` }}/>
        <defs>
          <path id="ecgpath" d={ecg} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </defs>
      </svg>
    </div>
  );
}

// ── AI Debrief Component ─────────────────────────────────────────────────────
function AiDebrief({ report, lang }) {
  const [debrief, setDebrief] = useState(null);
  const [loading, setLoading] = useState(false);

  async function getDebrief() {
    setLoading(true);
    try {
      const prompt = `You are a certified CPR instructor giving personalised post-session feedback.

Session data:
- Duration: ${report.duration}
- Total Compressions: ${report.compressions}
- Full Cycles (30:2): ${report.cycles}
- Quality Score: ${report.qualityScore}%
- Average BPM: ${report.avgBpm || "not measured"}

Write exactly 3 short sentences:
1. One specific thing they did well (based on the data)
2. One concrete thing to improve next time
3. One warm encouragement

Be specific to the numbers, not generic. Tone: warm, professional, like a paramedic trainer.`;
      const reply = await callGemini([{ role:"user", text:prompt }]);
      setDebrief(reply);
    } catch(e) {
      setDebrief("You completed a full CPR session — that takes real courage and focus. Next time, aim to keep your BPM between 100-120 for the whole session. Every practice run builds the muscle memory that saves real lives. 💪");
    }
    setLoading(false);
  }

  const R="#ef4444", G="#10b981", card="rgba(255,255,255,0.04)", border="rgba(255,255,255,0.09)";
  const text="#fef2f2", dim="rgba(254,202,202,0.28)", muted="rgba(254,202,202,0.55)";
  const mono="'DM Mono',monospace", sans="'Plus Jakarta Sans',sans-serif";

  return (
    <div style={{ background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.22)", borderRadius:18, padding:"16px 18px", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
        <span style={{ fontSize:18 }}>🤖</span>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:"#a78bfa" }}>AI PERFORMANCE DEBRIEF</div>
          <div style={{ fontSize:10, color:dim }}>Personalised feedback from LifePulse AI</div>
        </div>
      </div>
      {!debrief && !loading && (
        <button onClick={getDebrief} style={{ width:"100%", padding:"12px", background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:12, color:"#c4b5fd", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:sans }}>
          ✨ Get AI Feedback on My Performance
        </button>
      )}
      {loading && (
        <div style={{ textAlign:"center", padding:"14px", color:"#a78bfa", fontSize:13 }}>
          <span style={{ animation:"blink 1s infinite", display:"inline-block" }}>🤖 Analysing your session…</span>
        </div>
      )}
      {debrief && (
        <div style={{ fontSize:13, color:muted, lineHeight:1.8, background:"rgba(99,102,241,0.05)", borderRadius:10, padding:"12px 14px" }}>
          {debrief}
        </div>
      )}
    </div>
  );
}

// ── Google Maps — Live GPS Tracking ──────────────────────────────────────────
let gmLoaded = false; // prevent duplicate script injection

function GMap({ lat, lng, hospitals }) {
  const ref     = useRef(null);
  const mapRef  = useRef(null);   // google.maps.Map
  const uMkr    = useRef(null);   // user marker
  const uCircle = useRef(null);   // accuracy circle
  const hMkrs   = useRef([]);     // hospital markers
  const hLines  = useRef([]);     // polylines
  const built   = useRef(false);

  // ── Place hospital markers & lines ─────────────────────────────────────────
  function placeHospitals(map, hosp, uLat, uLng) {
    hMkrs.current.forEach(m => m.setMap(null));
    hLines.current.forEach(l => l.setMap(null));
    hMkrs.current = []; hLines.current = [];
    hosp.forEach((h, i) => {
      const hLat = h.realLat || (uLat + 0.008*(i+1));
      const hLng = h.realLng || (uLng + 0.012*(i+1));
      const mk = new window.google.maps.Marker({
        map, position: { lat:hLat, lng:hLng }, title: h.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10, fillColor:"#10b981", fillOpacity:1,
          strokeColor:"#fff", strokeWeight:2,
        },
        label: { text:"H", color:"#fff", fontSize:"10px", fontWeight:"800" },
        zIndex: 10 + i,
      });
      const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${hLat},${hLng}&travelmode=driving`;
      const iw = new window.google.maps.InfoWindow({
        content: `<div style="background:#0f172a;color:#e2e8f0;padding:12px 14px;border-radius:10px;font-family:sans-serif;min-width:180px">
          <div style="font-weight:700;color:#10b981;font-size:13px;margin-bottom:4px">🏥 ${h.name}</div>
          <div style="font-size:11px;color:#9ca3af;margin-bottom:8px">${h.addr}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span><span style="color:#ef4444;font-weight:700">${h.dist}</span><span style="color:#9ca3af"> · </span><span style="color:#fbbf24">${h.eta}</span></span>
            <a href="${dirUrl}" target="_blank" style="background:#10b981;color:#fff;padding:5px 10px;border-radius:7px;font-size:11px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:4px">
              ➤ Go
            </a>
          </div>
        </div>`,
      });
      mk.addListener("click", () => iw.open(map, mk));
      const line = new window.google.maps.Polyline({
        map, strokeColor:"#10b981", strokeOpacity:0,
        path:[{lat:uLat,lng:uLng},{lat:hLat,lng:hLng}],
        icons:[{icon:{path:"M 0,-1 0,1",strokeOpacity:0.6,scale:3},offset:"0",repeat:"13px"}],
      });
      hMkrs.current.push(mk);
      hLines.current.push(line);
    });
  }

  // ── Build map once ─────────────────────────────────────────────────────────
  function buildMap() {
    if (!ref.current || built.current || !window.google?.maps) return;
    if (!lat || !lng) return;
    built.current = true;

    const map = new window.google.maps.Map(ref.current, {
      center: { lat, lng }, zoom: 16,
      disableDefaultUI: true, zoomControl: true,
      mapTypeId: "roadmap",
      styles: [
        { elementType:"geometry",             stylers:[{color:"#0a0f1a"}] },
        { elementType:"labels.text.stroke",   stylers:[{color:"#0a0f1a"}] },
        { elementType:"labels.text.fill",     stylers:[{color:"#9ca3af"}] },
        { featureType:"road", elementType:"geometry",           stylers:[{color:"#1e2a3a"}] },
        { featureType:"road", elementType:"labels.text.fill",   stylers:[{color:"#6b7280"}] },
        { featureType:"road.highway", elementType:"geometry",   stylers:[{color:"#243347"}] },
        { featureType:"water", elementType:"geometry",          stylers:[{color:"#050d1a"}] },
        { featureType:"poi",   stylers:[{visibility:"off"}] },
        { featureType:"transit", stylers:[{visibility:"off"}] },
        { featureType:"landscape", elementType:"geometry",      stylers:[{color:"#0d1424"}] },
        { featureType:"administrative", elementType:"labels.text.fill", stylers:[{color:"#6b7280"}] },
      ],
    });
    mapRef.current = map;

    // Pulsing red YOU dot
    uMkr.current = new window.google.maps.Marker({
      map, position:{ lat, lng }, zIndex:999,
      icon:{
        path: window.google.maps.SymbolPath.CIRCLE,
        scale:10, fillColor:"#ef4444", fillOpacity:1,
        strokeColor:"#fff", strokeWeight:2.5,
      },
    });
    uMkr.current.bindPopup?.();

    // Accuracy circle
    uCircle.current = new window.google.maps.Circle({
      map, center:{ lat, lng }, radius:50,
      fillColor:"#ef4444", fillOpacity:0.08,
      strokeColor:"#ef4444", strokeOpacity:0.3, strokeWeight:1,
    });

    if (hospitals?.length) placeHospitals(map, hospitals, lat, lng);
  }

  // ── Load Google Maps script once ───────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById("gm-pulse")) {
      const st = document.createElement("style"); st.id="gm-pulse";
      st.textContent="@keyframes gpulse{0%{transform:scale(0.5);opacity:0.9}100%{transform:scale(2.8);opacity:0}}";
      document.head.appendChild(st);
    }

    // Defer slightly so the map div is in DOM before Google Maps touches it
    const tryBuild = () => setTimeout(() => {
      if (ref.current && window.google?.maps) buildMap();
    }, 100);

    if (window.google?.maps) { tryBuild(); return; }
    if (!gmLoaded) {
      gmLoaded = true;
      window.__gmReady = () => tryBuild();
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&callback=__gmReady&v=weekly&loading=async`;
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    } else {
      const t = setInterval(() => {
        if (window.google?.maps && ref.current) { clearInterval(t); tryBuild(); }
      }, 200);
      return () => clearInterval(t);
    }
    return () => {
      if (mapRef.current) {
        hMkrs.current.forEach(m => { try { m.setMap(null); } catch(e){} });
        hLines.current.forEach(l => { try { l.setMap(null); } catch(e){} });
        mapRef.current = null; built.current = false;
      }
    };
  }, []);

  // ── LIVE GPS — smooth pan + marker move on every coord update ─────────────
  useEffect(() => {
    if (!mapRef.current || !uMkr.current || !lat || !lng) return;
    const pos = { lat, lng };
    uMkr.current.setPosition(pos);
    uCircle.current?.setCenter(pos);
    // Smooth pan — doesn't reset zoom
    mapRef.current.panTo(pos);
  }, [lat, lng]);

  // ── Hospital markers update when data arrives ──────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !hospitals?.length || !lat || !lng) return;
    placeHospitals(mapRef.current, hospitals, lat, lng);
  }, [hospitals]);

  return (
    <div style={{ position:"relative", borderRadius:16, overflow:"hidden", border:`1px solid rgba(239,68,68,0.22)`, boxShadow:"0 4px 28px rgba(0,0,0,0.5)" }}>
      <div ref={ref} style={{ width:"100%", height:300, background:"#0a0f1a" }}/>
      <div style={{ position:"absolute", top:10, left:10, zIndex:10, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", border:`1px solid rgba(239,68,68,0.45)`, borderRadius:8, padding:"5px 12px", display:"flex", alignItems:"center", gap:6, fontSize:10, color:"#fca5a5", fontFamily:mono, fontWeight:600, pointerEvents:"none" }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:R, animation:"blink 0.9s infinite", boxShadow:`0 0 7px ${R}` }}/>
        ● LIVE GPS
      </div>
      {lat && lng && (
        <div style={{ position:"absolute", bottom:10, left:10, zIndex:10, background:"rgba(0,0,0,0.72)", border:`1px solid rgba(255,255,255,0.07)`, borderRadius:7, padding:"4px 10px", fontSize:9, color:"rgba(255,255,255,0.4)", fontFamily:mono, pointerEvents:"none" }}>
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}

// ── Step Row ───────────────────────────────────────────────────────────────────
function StepRow({ icon, label, status }) {
  const isDone   = status === "done";
  const isActive = status === "active";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 16px", borderRadius:14, border:`1px solid ${isDone ? "rgba(16,185,129,0.3)" : isActive ? "rgba(239,68,68,0.3)" : border}`, background: isDone ? "rgba(16,185,129,0.07)" : isActive ? "rgba(239,68,68,0.07)" : card, transition:"all 0.35s" }}>
      <span style={{ fontSize:24 }}>{icon}</span>
      <span style={{ flex:1, fontSize:13.5, fontWeight: isActive ? 700 : 400, color: isDone ? "#6ee7b7" : isActive ? "#fca5a5" : dim }}>{label}</span>
      <span style={{ fontSize:14, color: isDone ? G : isActive ? R : "rgba(255,255,255,0.15)" }}>{isDone ? "✓" : isActive ? "⏳" : "○"}</span>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function LifePulse() {
  const [lang,        setLang]        = useState("en");
  const [screen,      setScreen]      = useState("home");  // home | setup | cpr | report | train | dashboard | offline
  const [showLang,    setShowLang]    = useState(false);
  const [homeChat,    setHomeChat]    = useState(false);
  const [homeMsgs,    setHomeMsgs]    = useState([{role:"assistant", text:"Hi! I'm LifePulse AI 👋 I can answer questions about CPR, cardiac emergencies, or how this app works. What would you like to know?"}]);
  const [homeInput,   setHomeInput]   = useState("");
  const [homeLoading, setHomeLoading] = useState(false);
  const homeChatEnd  = useRef(null);

  // Setup phase: 0=locating 1=hospitals 2=calling 3=ready
  const [phase,       setPhase]       = useState(0);
  const [coords,      setCoords]      = useState(null);
  const [addr,        setAddr]        = useState("");
  const [gpsOk,       setGpsOk]      = useState(false);
  const [gpsErr,      setGpsErr]      = useState(false);
  const [hospitals,   setHospitals]   = useState([]);
  const [hospDone,    setHospDone]    = useState(false);
  const [callDone,    setCallDone]    = useState(false);

  // CPR
  const [cprOn,       setCprOn]       = useState(false);
  const [cprPhase,    setCprPhase]    = useState("place"); // place | active | breath
  const [beat,        setBeat]        = useState(false);
  const [compr,       setCompr]       = useState(0);
  const [cycles,      setCycles]      = useState(0);
  const [elapsed,     setElapsed]     = useState(0);
  const [breath,      setBreath]      = useState(false);
  const [voiceOn,     setVoiceOn]     = useState(true);
  const [accelReady,  setAccelReady]  = useState(false);
  const [accelVal,    setAccelVal]    = useState(0);    // live G-force reading
  const [lastBpm,     setLastBpm]     = useState(0);   // real-time BPM from phone
  const [phoneFlat,   setPhoneFlat]   = useState(false); // is phone flat on chest?

  // AI chat
  const [msgs,        setMsgs]        = useState([]);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [input,       setInput]       = useState("");
  const [showChat,    setShowChat]    = useState(true);

  // Training
  const [tStep,       setTStep]       = useState(0);

  // Report
  const [report,      setReport]      = useState(null);

  // ── Dashboard / History ──────────────────────────────────────────────────
  const [sessions,    setSessions]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("lp_sessions")||"[]"); } catch{ return []; }
  });

  // ── Offline mode ─────────────────────────────────────────────────────────
  const [isOnline,    setIsOnline]    = useState(navigator.onLine);
  const [offlineMsg,  setOfflineMsg]  = useState("");

  // ── AED Locator ───────────────────────────────────────────────────────────
  const [aedList,      setAedList]      = useState([]);
  const [aedLoading,   setAedLoading]   = useState(false);
  const [showAed,      setShowAed]      = useState(false);

  // ── Survival Timer ────────────────────────────────────────────────────────
  const [survivalSecs, setSurvivalSecs] = useState(0);   // seconds since emergency started
  const survivalRef    = useRef(null);

  // ── Compression quality tracking ─────────────────────────────────────────
  const [qualityScore, setQualityScore] = useState(0);
  const [bpmHistory,   setBpmHistory]   = useState([]);   // for sparkline
  const [aiAutoCoach,  setAiAutoCoach]  = useState(true); // auto AI coaching on
  const lastAutoCoach  = useRef(0);                        // timestamp last auto-coach

  const comprRef   = useRef(0);
  const startRef   = useRef(null);
  const breathRef  = useRef(false);
  const watchRef   = useRef(null);
  const addrDone   = useRef(false);
  const metroRef   = useRef(null);  // guide beep only, NOT counter
  const timerRef   = useRef(null);
  const chatEnd    = useRef(null);
  const lastZRef   = useRef(null);
  const lastHitRef = useRef(0);
  const bpmTimes   = useRef([]);    // last 4 compression timestamps for BPM

  const L = LANGS[lang];

  // Online / offline detection
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Keep screen awake during CPR using WakeLock API
  const wakeLock = useRef(null);
  useEffect(() => {
    if (cprOn && "wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then(wl => { wakeLock.current = wl; }).catch(()=>{});
    } else if (wakeLock.current) {
      wakeLock.current.release(); wakeLock.current = null;
    }
  }, [cprOn]);

  // Heartbeat on home/train
  useEffect(() => {
    if (screen !== "home" && screen !== "train") return;
    const id = setInterval(() => { setBeat(true); setTimeout(() => setBeat(false), 200); }, 950);
    return () => clearInterval(id);
  }, [screen]);

  // CPR timer
  useEffect(() => {
    if (!cprOn) return;
    startRef.current = startRef.current || Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-startRef.current)/1000)), 1000);
    return () => clearInterval(timerRef.current);
  }, [cprOn]);

  // ── Accelerometer: detect real compressions from phone on chest ────────────
  useEffect(() => {
    if (!cprOn || cprPhase !== "active") return;

    async function startMotion() {
      // iOS 13+ requires permission
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        try {
          const perm = await DeviceMotionEvent.requestPermission();
          if (perm !== "granted") return;
        } catch(e) { return; }
      }
      setAccelReady(true);
    }

    function handleMotion(e) {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;

      // Detect flat phone (gamma near 0, beta near 0)
      const beta  = e.rotationRate?.beta  ?? 0;
      const gamma = e.rotationRate?.gamma ?? 0;
      setPhoneFlat(Math.abs(gamma) < 25 && Math.abs(beta) < 25);

      // Z-axis jolt detection for compressions
      const z = acc.z ?? 0;
      const total = Math.sqrt((acc.x??0)**2 + (acc.y??0)**2 + z**2);
      setAccelVal(Math.round(total * 10) / 10);

      const now = Date.now();
      const prev = lastZRef.current;
      lastZRef.current = z;

      if (prev === null) return;
      const delta = Math.abs(z - prev);

      // Threshold: significant downward jolt, cooldown 280ms
      if (delta > 5 && now - lastHitRef.current > 280) {
        lastHitRef.current = now;

        // Count compression
        comprRef.current += 1;
        setCompr(comprRef.current);
        setBeat(true);
        setTimeout(() => setBeat(false), 160);

        // Real-time BPM from last 4 hits
        bpmTimes.current = [...bpmTimes.current.slice(-3), now];
        if (bpmTimes.current.length >= 2) {
          const intervals = bpmTimes.current.slice(1).map((t,i) => t - bpmTimes.current[i]);
          const avgMs = intervals.reduce((a,b)=>a+b,0) / intervals.length;
          const bpm = Math.round(60000 / avgMs);
          setLastBpm(bpm);
          // Build BPM history for sparkline (keep last 20)
          setBpmHistory(h => [...h.slice(-19), bpm]);
          // Quality score: perfect = 100-120 BPM = 100pts, else deduct
          const inRange = bpm >= 100 && bpm <= 120;
          setQualityScore(q => Math.min(100, Math.max(0, inRange ? Math.min(100, q + 2) : q - 3)));
          // Auto AI coaching every 30 compressions
          if (aiAutoCoach && comprRef.current > 0 && comprRef.current % 30 === 0 && now - lastAutoCoach.current > 8000) {
            lastAutoCoach.current = now;
            const tip = bpm < 100 ? "Push faster — target 100 to 120 BPM." : bpm > 120 ? "Slow down a little — target 100 to 120 BPM." : "Perfect rhythm! Keep it up — you are doing great!";
            setMsgs(p => [...p, { role:"assistant", text:`🤖 Auto-coach: ${tip}` }]);
            if (voiceOn) doSpeak(tip, lang);
          }
        }

        // Breath check every 30
        if (comprRef.current % 30 === 0 && !breathRef.current) {
          breathRef.current = true;
          setBreath(true);
          if (voiceOn) doSpeak(L.breathTitle, lang);
          setTimeout(() => {
            setBreath(false);
            breathRef.current = false;
            setCycles(c => c + 1);
            if (voiceOn) doSpeak("Good, keep going.", lang);
          }, 4500);
        }
      }
    }

    startMotion();
    window.addEventListener("devicemotion", handleMotion, true);
    return () => {
      window.removeEventListener("devicemotion", handleMotion, true);
      setAccelReady(false);
    };
  }, [cprOn, cprPhase, voiceOn, lang, L]);

  // Guide beep at 110 BPM — audio cue only during active phase
  useEffect(() => {
    if (!cprOn || cprPhase !== "active" || breath) {
      clearInterval(metroRef.current); return;
    }
    // Visual guide beat for rhythm (does NOT count compressions)
    // User should match this rhythm with actual compressions
    return () => clearInterval(metroRef.current);
  }, [cprOn, cprPhase, breath]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  // Fetch hospitals
  async function fetchHospitals(lat, lng) {
    console.log("🏥 Fetching hospitals at:", lat.toFixed(5), lng.toFixed(5));
    const makeEntry = (hLat, hLng, name, addr) => {
      const d = calcDist(lat, lng, hLat, hLng);
      if (d > 15000) return null; // reject anything >15km — definitely wrong country
      return { name, addr, dist: d < 1000 ? `${d} m` : `${(d/1000).toFixed(1)} km`, eta:`~${Math.max(1,Math.round(d/400))} min`, realLat:hLat, realLng:hLng, distM:d };
    };

    // ── Primary: Nominatim nearby search (respects lat/lon, very accurate) ──
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        `q=hospital&format=json&limit=8` +
        `&lat=${lat}&lon=${lng}` +
        `&bounded=1&viewbox=${lng-0.15},${lat+0.15},${lng+0.15},${lat-0.15}`;
      const r = await fetch(url, { headers:{"Accept-Language":"en"} });
      const data = await r.json();
      console.log("Nominatim returned:", data.length, "results");
      const list = data
        .map(p => makeEntry(parseFloat(p.lat), parseFloat(p.lon), p.display_name.split(",")[0], p.display_name.split(",").slice(1,3).join(", ")))
        .filter(Boolean)
        .sort((a,b)=>a.distM-b.distM)
        .slice(0,4);
      if (list.length > 0) {
        console.log("✅ Found via Nominatim:", list.map(h=>h.name));
        setHospitals(list); return;
      }
    } catch(e) { console.warn("Nominatim failed:", e); }

    // ── Fallback: Overpass with strict bbox ──
    try {
      const D = 0.08;
      const bbox = `${lat-D},${lng-D},${lat+D},${lng+D}`;
      const q = `[out:json][timeout:20];(node["amenity"="hospital"](${bbox});way["amenity"="hospital"](${bbox}););out body center 6;`;
      const r = await fetch("https://overpass-api.de/api/interpreter", {
        method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
        body:"data=" + encodeURIComponent(q),
      });
      const data = await r.json();
      console.log("Overpass returned:", data.elements?.length, "elements");
      const list = (data.elements||[])
        .map(e => {
          const hLat = e.lat || e.center?.lat, hLng = e.lon || e.center?.lon;
          if (!hLat||!hLng) return null;
          const name = e.tags?.name || e.tags?.["name:en"] || "Hospital";
          const addr = e.tags?.["addr:street"] || e.tags?.["addr:suburb"] || "Nearby";
          return makeEntry(hLat, hLng, name, addr);
        })
        .filter(Boolean)
        .sort((a,b)=>a.distM-b.distM)
        .slice(0,4);
      if (list.length > 0) { console.log("✅ Found via Overpass:", list.map(h=>h.name)); setHospitals(list); }
      else console.warn("⚠️ No hospitals found in range");
    } catch(e) { console.warn("Overpass failed:", e); }
  }

  async function sendHomeAI(msg) {
    const next = [...homeMsgs, { role:"user", text:msg }];
    setHomeMsgs(next); setHomeLoading(true); setHomeInput("");
    const system = `You are LifePulse AI — a warm, knowledgeable CPR and cardiac emergency assistant built into a life-saving app.
Answer questions about CPR technique, cardiac arrest signs, AED usage, choking, first aid, or how LifePulse works.
Keep answers concise (2-3 sentences max). Be encouraging and clear. Never repeat a previous answer verbatim — always add new information or a different angle.
Current language: ${lang}.`;
    try {
      const reply = await callGemini(next, system);
      setHomeMsgs(p => [...p, { role:"assistant", text:reply }]);
    } catch(e) {
      console.warn("Gemini home AI error:", e);
      const fallbacks = [
        "Push hard and fast — at least 2 inches deep, 100-120 times per minute. Don't stop until help arrives! 💪",
        "Remember: hands-only CPR is effective! Lock your fingers, keep arms straight, and push on the center of the chest.",
        "Call 108 first, then start CPR. Every second matters — survival drops 10% per minute without chest compressions.",
        "Position matters! Place the heel of your hand on the lower half of the breastbone, not the stomach.",
      ];
      const fb = fallbacks[next.length % fallbacks.length];
      setHomeMsgs(p => [...p, { role:"assistant", text:fb }]);
    }
    setHomeLoading(false);
    setTimeout(() => homeChatEnd.current?.scrollIntoView({ behavior:"smooth" }), 100);
  }

  // ── Fetch AED devices from OpenStreetMap Overpass ───────────────────────
  async function fetchAED(lat, lng) {
    setAedLoading(true);
    try {
      const delta = 0.05; // ~5km radius
      const bbox = `${lat-delta},${lng-delta},${lat+delta},${lng+delta}`;
      const query = `[out:json][timeout:10];(node["emergency"="defibrillator"](${bbox}););out body;`;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method:"POST", body:`data=${encodeURIComponent(query)}`
      });
      const d = await res.json();
      const list = (d.elements || []).map(el => {
        const dlat = el.lat, dlng = el.lon;
        const distKm = Math.sqrt(Math.pow((dlat-lat)*111,2)+Math.pow((dlng-lng)*111*Math.cos(lat*Math.PI/180),2));
        return {
          name: el.tags?.name || el.tags?.operator || "AED Device",
          location: el.tags?.["addr:street"] || el.tags?.description || "Public location",
          access: el.tags?.access || "public",
          indoor: el.tags?.indoor === "yes" ? "Indoor" : "Outdoor",
          dist: distKm < 1 ? `${Math.round(distKm*1000)}m` : `${distKm.toFixed(1)}km`,
          distKm,
          lat: dlat, lng: dlng,
        };
      }).filter(a => a.distKm < 5).sort((a,b) => a.distKm - b.distKm).slice(0,6);
      setAedList(list);
    } catch(e) { console.warn("AED fetch failed:", e); setAedList([]); }
    setAedLoading(false);
  }

  function startEmergency() {
    setScreen("setup"); setPhase(0); addrDone.current = false;
    setGpsOk(false); setGpsErr(false); setHospDone(false); setCallDone(false);
    setCoords(null); setAddr(""); setHospitals([]);
    // Start survival countdown timer
    setSurvivalSecs(0);
    clearInterval(survivalRef.current);
    survivalRef.current = setInterval(() => setSurvivalSecs(s => s + 1), 1000);
    if (voiceOn) doSpeak(L.voiceStart, lang);
    if (!navigator.geolocation) { setGpsErr(true); return; }
    watchRef.current = navigator.geolocation.watchPosition(
      async pos => {
        const { latitude:lat, longitude:lng, accuracy } = pos.coords;
        // ALWAYS update coords on every GPS tick → drives live map movement
        setCoords({ lat, lng, accuracy });
        setGpsOk(true);
        if (!addrDone.current) {
          addrDone.current = true;
          setPhase(1);
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const d = await r.json();
            setAddr(d.display_name?.split(",").slice(0,2).join(", ") || "Location found");
          } catch(e) { setAddr("Location found"); }
          await fetchHospitals(lat, lng);
          fetchAED(lat, lng); // fetch AED devices in parallel
          setHospDone(true);
          setPhase(2);
          if (voiceOn) doSpeak(L.calling, lang);
          // ── Actually open the phone dialer with 108 pre-filled ──
          try { window.location.href = "tel:108"; } catch(e) {}
          setTimeout(() => {
            setCallDone(true);
            setPhase(3);
            if (voiceOn) doSpeak(L.callDone, lang);
          }, 2500);
        }
      },
      (err) => { console.warn("GPS error:", err.code, err.message); setGpsErr(true); },
      { enableHighAccuracy:true, maximumAge:0, timeout:15000 }
    );
  }

  function stopWatch() {
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
  }

  function beginCPR() {
    stopWatch();
    setCprOn(true); setCprPhase("place"); setScreen("cpr");
    comprRef.current = 0; setCompr(0); setCycles(0); setElapsed(0); startRef.current = null;
    setBreath(false); breathRef.current = false;
    lastZRef.current = null; lastHitRef.current = 0; bpmTimes.current = [];
    setAccelVal(0); setLastBpm(0); setPhoneFlat(false); setAccelReady(false);
    const welcome = "Place your phone FLAT on the victim's chest now. Once placed, tap 'Start Compressions'. I'll detect each push automatically! ❤️";
    setMsgs([{ role:"assistant", text:welcome }]);
    if (voiceOn) doSpeak("Place the phone flat on the victim's chest, then tap Start Compressions.", lang);
  }

  function activateCPR() {
    setCprPhase("active");
    startRef.current = Date.now();
    if (voiceOn) doSpeak("CPR started. Push hard and fast. I will count every compression.", lang);
  }

  function stopCPR() {
    setCprOn(false); setCprPhase("place");
    clearInterval(metroRef.current);
    clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();
    const rep = {
      id: Date.now(),
      duration: fmt(elapsed),
      compressions: comprRef.current,
      cycles,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      qualityScore: qualityScore,
      avgBpm: bpmHistory.length > 0 ? Math.round(bpmHistory.reduce((a,b)=>a+b,0)/bpmHistory.length) : 0,
    };
    setReport(rep);
    // Persist to history
    setSessions(prev => {
      const updated = [rep, ...prev].slice(0, 20);
      try { localStorage.setItem("lp_sessions", JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    setScreen("report");
  }

  async function sendAI(msg) {
    const next = [...msgs, { role:"user", text:msg }];
    setMsgs(next); setAiLoading(true); setInput("");
    const sys = `You are LifePulse AI — a real-time CPR coach speaking to a bystander ACTIVELY performing CPR right now.
Live stats: ${comprRef.current} compressions done, ${cycles} cycles completed, ${fmt(elapsed)} elapsed, current BPM: ${lastBpm||"unknown"}.
Give short, urgent, action-focused coaching (1-2 sentences max). Be like a paramedic on the phone — calm but direct.
Vary your responses — never repeat the same phrase twice. Language: ${lang}.`;
    try {
      const reply = await callGemini(next, sys);
      setMsgs(p => [...p, { role:"assistant", text:reply }]);
      if (voiceOn) doSpeak(reply, lang);
    } catch(e) {
      const cprTips = [
        "Push down 5-6 cm — lock your elbows and use your body weight!",
        "Great work! Let the chest fully rise between each compression.",
        "Stay at 100-120 pushes per minute — think 'Stayin Alive' rhythm.",
        `${comprRef.current} compressions done — you're doing an incredible job, keep going!`,
        "Paramedics are on the way. Your compressions are keeping blood flowing to the brain!",
      ];
      const fb = cprTips[next.length % cprTips.length];
      setMsgs(p => [...p, { role:"assistant", text:fb }]);
    }
    setAiLoading(false);
  }

  function reset() {
    stopWatch(); window.speechSynthesis?.cancel();
    clearInterval(metroRef.current); clearInterval(timerRef.current);
    setCprOn(false); setCprPhase('place'); setBeat(false); setBreath(false); breathRef.current = false; setAccelVal(0); setLastBpm(0); setPhoneFlat(false); setAccelReady(false); lastZRef.current=null; lastHitRef.current=0; bpmTimes.current=[];
    comprRef.current = 0; startRef.current = null;
    setCompr(0); setCycles(0); setElapsed(0);
    setMsgs([]); setInput([]); setReport(null);
    setQualityScore(0); setBpmHistory([]); lastAutoCoach.current = 0;
    setPhase(0); setGpsOk(false); setGpsErr(false); setHospDone(false); setCallDone(false);
    setCoords(null); setAddr(""); setHospitals([]);
    setSurvivalSecs(0); clearInterval(survivalRef.current);
    setAedList([]); setShowAed(false);
    setScreen("home");
  }


  // Open Google Maps turn-by-turn directions from live location to hospital
  function openDirections(h) {
    if (!h.realLat || !h.realLng) return;
    const dest = `${h.realLat},${h.realLng}`;
    // If we have live coords use them as origin, else let Maps detect
    const origin = coords ? `${coords.lat},${coords.lng}` : "";
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    window.open(url, "_blank");
  }

  const pct = ((comprRef.current % 30) / 30) * 100;

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:bg, fontFamily:sans, color:text, overflowX:"hidden" }}>
      <style>{CSS}</style>

      {/* ── GLOBAL BACKGROUND (all screens) ── */}
      {screen !== "home" && (
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          {/* Subtle aurora — less intense than home */}
          <div style={{ position:"absolute", width:450, height:450, borderRadius:"50%", left:"30%", top:"-20%",
            background:"radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)",
            filter:"blur(70px)", animation:"aurora1 11s ease-in-out infinite" }}/>
          <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", right:"-5%", bottom:"20%",
            background:"radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
            filter:"blur(55px)", animation:"aurora3 14s ease-in-out infinite" }}/>
          {/* Subtle grid */}
          {[...Array(5)].map((_,i) => (
            <div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${i*22+5}%`, width:1,
              background:`linear-gradient(180deg, transparent, rgba(239,68,68,0.025) 40%, rgba(239,68,68,0.025) 60%, transparent)` }}/>
          ))}
          {/* 3 subtle particles */}
          {[{l:"15%",t:"20%",s:3},{l:"75%",t:"60%",s:4},{l:"50%",t:"85%",s:2}].map((p,i)=>(
            <div key={i} style={{ position:"absolute", width:p.s, height:p.s, borderRadius:"50%",
              background:"rgba(239,68,68,0.6)", left:p.l, top:p.t,
              animationName:`float${i}`, animationDuration:`${5+i*2}s`, animationTimingFunction:"ease-in-out",
              animationIterationCount:"infinite", boxShadow:"0 0 8px rgba(239,68,68,0.5)" }}/>
          ))}
        </div>
      )}

      {/* Language overlay */}
      {showLang && (
        <div onClick={() => setShowLang(false)} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:430, background:"#0f1420", borderRadius:"22px 22px 0 0", padding:"26px 20px 36px", animation:"slideup 0.28s ease" }}>
            <div style={{ textAlign:"center", marginBottom:18, fontSize:15, fontWeight:700, color:muted }}>Choose Language</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {Object.entries(LANGS).map(([k,v]) => (
                <button key={k} className="btn" onClick={() => { setLang(k); setShowLang(false); }} style={{ padding:"15px 12px", background: lang===k ? "rgba(239,68,68,0.14)" : card, border:`1.5px solid ${lang===k ? "rgba(239,68,68,0.4)" : border}`, borderRadius:14, display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:24 }}>{v.flag}</span>
                  <span style={{ fontSize:13, fontWeight:700, color: lang===k ? R : text }}>{v.name}</span>
                  {lang===k && <span style={{ marginLeft:"auto", color:R }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ HOME ══ */}
      {screen === "home" && (
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", overflowY:"auto", position:"relative" }}>

          {/* Online/Offline badge */}
          {!isOnline && (
            <div style={{ position:"fixed", top:12, left:"50%", transform:"translateX(-50%)", zIndex:500, background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.4)", borderRadius:20, padding:"5px 14px", fontSize:11, color:"#fbbf24", fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
              ✈️ Offline Mode — Core features available
            </div>
          )}
          {/* ═══ CINEMATIC ANIMATED BACKGROUND ═══ */}
          <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>

            {/* Deep space base gradient */}
            <div style={{ position:"absolute", inset:0,
              background:"radial-gradient(ellipse 80% 60% at 50% -5%, rgba(239,68,68,0.22) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 90%, rgba(16,185,129,0.1) 0%, transparent 50%), radial-gradient(ellipse 40% 30% at 10% 80%, rgba(99,102,241,0.08) 0%, transparent 50%)" }}/>

            {/* Aurora orb 1 — large red */}
            <div style={{ position:"absolute", width:520, height:520, borderRadius:"50%", left:"20%", top:"-15%",
              background:"radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.06) 40%, transparent 70%)",
              filter:"blur(60px)", animation:"aurora1 9s ease-in-out infinite" }}/>

            {/* Aurora orb 2 — medium pink */}
            <div style={{ position:"absolute", width:380, height:380, borderRadius:"50%", right:"-5%", top:"30%",
              background:"radial-gradient(circle, rgba(251,113,133,0.15) 0%, rgba(244,63,94,0.05) 50%, transparent 70%)",
              filter:"blur(50px)", animation:"aurora2 12s ease-in-out infinite" }}/>

            {/* Aurora orb 3 — teal accent */}
            <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", left:"-8%", bottom:"15%",
              background:"radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)",
              filter:"blur(45px)", animation:"aurora3 15s ease-in-out infinite" }}/>

            {/* Aurora orb 4 — indigo deep */}
            <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", right:"10%", bottom:"5%",
              background:"radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
              filter:"blur(40px)", animation:"aurora1 11s ease-in-out infinite reverse" }}/>

            {/* Grid lines — vertical */}
            {[...Array(8)].map((_,i) => (
              <div key={"v"+i} style={{ position:"absolute", top:0, bottom:0, left:`${i*14+3}%`, width:1,
                background:`linear-gradient(180deg, transparent 0%, rgba(239,68,68,${0.03+i%2*0.02}) 30%, rgba(239,68,68,${0.05+i%3*0.02}) 60%, transparent 100%)`,
                opacity: 0.6 }}/>
            ))}
            {/* Grid lines — horizontal */}
            {[...Array(6)].map((_,i) => (
              <div key={"h"+i} style={{ position:"absolute", left:0, right:0, top:`${i*18+5}%`, height:1,
                background:`linear-gradient(90deg, transparent 0%, rgba(239,68,68,${0.03+i%2*0.02}) 30%, rgba(239,68,68,0.04) 70%, transparent 100%)`,
                opacity: 0.5 }}/>
            ))}

            {/* Scan line — slow vertical sweep */}
            <div style={{ position:"absolute", left:0, right:0, height:2,
              background:"linear-gradient(90deg, transparent, rgba(239,68,68,0.25) 30%, rgba(239,68,68,0.5) 50%, rgba(239,68,68,0.25) 70%, transparent)",
              animation:"scan 8s linear infinite", filter:"blur(1px)" }}/>

            {/* Floating particles — varying sizes and speeds */}
            {[
              { size:3, left:"8%",  top:"25%", delay:"0s",   dur:"5s",   glow:8  },
              { size:5, left:"22%", top:"60%", delay:"1.2s", dur:"7s",   glow:12 },
              { size:2, left:"45%", top:"15%", delay:"0.4s", dur:"4.5s", glow:6  },
              { size:4, left:"68%", top:"40%", delay:"2.1s", dur:"6s",   glow:10 },
              { size:6, left:"82%", top:"70%", delay:"0.8s", dur:"8s",   glow:16 },
              { size:3, left:"15%", top:"80%", delay:"3s",   dur:"5.5s", glow:8  },
              { size:2, left:"55%", top:"85%", delay:"1.8s", dur:"4s",   glow:6  },
              { size:4, left:"90%", top:"20%", delay:"0.6s", dur:"6.5s", glow:10 },
              { size:3, left:"35%", top:"50%", delay:"2.5s", dur:"5s",   glow:8  },
              { size:5, left:"75%", top:"10%", delay:"1.5s", dur:"7.5s", glow:14 },
            ].map((p,i) => (
              <div key={i} style={{ position:"absolute", zIndex:1, pointerEvents:"none",
                width:p.size, height:p.size, borderRadius:"50%",
                background: i%3===0 ? "rgba(239,68,68,0.9)" : i%3===1 ? "rgba(252,165,165,0.7)" : "rgba(16,185,129,0.7)",
                left:p.left, top:p.top,
                animationName:`float${i%6}`, animationDuration:p.dur, animationDelay:p.delay,
                animationTimingFunction:"ease-in-out", animationIterationCount:"infinite",
                boxShadow:`0 0 ${p.glow}px ${i%3===0?"rgba(239,68,68,0.8)":i%3===1?"rgba(252,165,165,0.6)":"rgba(16,185,129,0.7)"}` }}/>
            ))}

            {/* DNA helix dots — right side decoration */}
            <div style={{ position:"absolute", right:18, top:"18%", display:"flex", flexDirection:"column", gap:14, opacity:0.35 }}>
              {[...Array(10)].map((_,i) => (
                <div key={i} style={{ display:"flex", gap: Math.abs(4-i)*3+4, alignItems:"center", justifyContent:"center",
                  animation:`helixL ${1.8+i*0.1}s ease-in-out ${i*0.15}s infinite alternate` }}>
                  <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(239,68,68,0.7)", boxShadow:"0 0 6px rgba(239,68,68,0.5)" }}/>
                  <div style={{ height:1, width:12+Math.sin(i)*8, background:"rgba(239,68,68,0.3)" }}/>
                  <div style={{ width:4, height:4, borderRadius:"50%", background:"rgba(16,185,129,0.7)", boxShadow:"0 0 6px rgba(16,185,129,0.5)" }}/>
                </div>
              ))}
            </div>

            {/* Corner glow accents */}
            <div style={{ position:"absolute", top:0, left:0, width:200, height:200,
              background:"radial-gradient(circle at 0% 0%, rgba(239,68,68,0.12) 0%, transparent 70%)" }}/>
            <div style={{ position:"absolute", bottom:0, right:0, width:250, height:250,
              background:"radial-gradient(circle at 100% 100%, rgba(16,185,129,0.1) 0%, transparent 70%)" }}/>

            {/* Noise grain overlay for depth */}
            <div style={{ position:"absolute", inset:0, opacity:0.025,
              backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundRepeat:"repeat", backgroundSize:"128px" }}/>
          </div>

          {/* Floating particles */}
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ position:"fixed", zIndex:0, pointerEvents:"none",
              width: 3+i*2, height: 3+i*2, borderRadius:"50%",
              background:`rgba(239,68,68,${0.15+i*0.05})`,
              left:`${10+i*15}%`, top:`${20+i*12}%`,
              animation:`float${i} ${4+i*1.2}s ease-in-out infinite`,
              boxShadow:`0 0 ${6+i*4}px rgba(239,68,68,0.4)` }}/>
          ))}

          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", padding:"34px 22px 28px" }}>

            {/* Header */}
            <div className="fadein" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, animationDelay:"0s" }}>
              <div>
                <div style={{ fontSize:9, letterSpacing:5, color:R, fontFamily:mono, marginBottom:4, opacity:0.85 }}>{L.tag}</div>
                <div className="shimmer-text" style={{ fontSize:30, fontWeight:800, letterSpacing:-1 }}>{L.title}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn" onClick={() => setShowLang(true)} style={{ background:"rgba(239,68,68,0.09)", border:`1px solid rgba(239,68,68,0.22)`, borderRadius:12, padding:"8px 13px", fontSize:17, color:muted }}>{LANGS[lang].flag} <span style={{ fontSize:9, verticalAlign:"middle" }}>▾</span></button>
                <button className="btn" onClick={() => setVoiceOn(v=>!v)} style={{ background: voiceOn?"rgba(239,68,68,0.1)":card, border:`1px solid ${voiceOn?"rgba(239,68,68,0.3)":border}`, borderRadius:12, padding:"8px 12px", fontSize:15, color:voiceOn?R:dim }}>{voiceOn?"🔊":"🔇"}</button>
              </div>
            </div>

            {/* Hero heart with rings */}
            <div className="fadein" style={{ display:"flex", justifyContent:"center", alignItems:"center", position:"relative", margin:"8px 0 4px", animationDelay:"0.1s" }}>
              {/* Expanding ring burst on beat */}
              {beat && [0,1].map(i=>(
                <div key={"burst"+i} style={{ position:"absolute", width:170+i*40, height:170+i*40, borderRadius:"50%",
                  border:"1.5px solid rgba(239,68,68,0.5)", animation:"ringExpand 0.7s ease-out both",
                  animationDelay:`${i*0.15}s`, pointerEvents:"none" }}/>
              ))}
              {/* Static ambient rings */}
              {[0,1,2,3].map(i=>(
                <div key={i} style={{ position:"absolute", width:155+i*50, height:155+i*50, borderRadius:"50%",
                  border:`${i===0?"1.5px":"1px"} solid rgba(239,68,68,${beat ? 0.38-i*0.08 : 0.06+i*0.01})`,
                  transition:"border-color 0.15s", pointerEvents:"none",
                  boxShadow: beat && i===0 ? "0 0 20px rgba(239,68,68,0.25)" : "none" }}/>
              ))}
              {/* Glow orb */}
              <div style={{ position:"absolute", width:220, height:220, borderRadius:"50%",
                background:"radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.06) 40%, transparent 70%)",
                animation:"glow 2s ease-in-out infinite", filter:"blur(8px)" }}/>
              {/* Rotating dashed ring */}
              <div style={{ position:"absolute", width:185, height:185, borderRadius:"50%",
                border:"1px dashed rgba(239,68,68,0.18)", animation:"spin 18s linear infinite", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", width:210, height:210, borderRadius:"50%",
                border:"1px dashed rgba(16,185,129,0.12)", animation:"spin 25s linear infinite reverse", pointerEvents:"none" }}/>
              {/* Heart */}
              <div style={{ animation:"floatHero 3.5s ease-in-out infinite", zIndex:2 }}>
                <Heart beat={beat} size={125}/>
              </div>
              {/* BPM label */}
              <div style={{ position:"absolute", bottom:-28, left:"50%", transform:"translateX(-50%)",
                fontSize:9, letterSpacing:4, color:"rgba(239,68,68,0.5)", fontFamily:"'DM Mono',monospace",
                whiteSpace:"nowrap", animation:"blink 2s ease-in-out infinite" }}>
                ❤ CARDIAC MONITOR ACTIVE
              </div>
            </div>

            {/* ECG */}
            <div className="fadein" style={{ margin:"12px 0 16px", animationDelay:"0.18s" }}>
              <ECGLine active={false}/>
            </div>

            {/* Tagline */}
            <div className="fadein" style={{ textAlign:"center", marginBottom:20, animationDelay:"0.22s" }}>
              <h1 style={{ fontSize:27, fontWeight:800, marginBottom:8, letterSpacing:-0.5 }}>
                {L.tagline.split(" ").slice(0,-1).join(" ")}{" "}
                <span style={{ background:"linear-gradient(135deg,#ef4444,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{L.tagline.split(" ").slice(-1)}</span>
              </h1>
              <p style={{ color:muted, fontSize:13, lineHeight:1.85 }}>{L.sub}</p>
            </div>

            {/* EMERGENCY BUTTON */}
            <div className="fadein" style={{ animationDelay:"0.28s" }}>
              <button className="btn" onClick={startEmergency} style={{ width:"100%", padding:"22px", background:"linear-gradient(135deg,#ef4444 0%,#dc2626 60%,#991b1b 100%)", borderRadius:20, color:"#fff", fontSize:17, fontWeight:800, marginBottom:10, letterSpacing:0.3,
                boxShadow:"0 0 0 0 rgba(239,68,68,0.4)", animation:"heartPulseBtn 2s ease-in-out infinite" }}>
                {L.btnEmergency}
              </button>
            </div>

            {/* AI Chat + Train buttons */}
            <div className="fadein" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16, animationDelay:"0.33s" }}>
              <button className="btn" onClick={() => setHomeChat(c=>!c)} style={{ padding:"16px 12px", background: homeChat?"rgba(239,68,68,0.14)":card, border:`1.5px solid ${homeChat?"rgba(239,68,68,0.45)":"rgba(239,68,68,0.18)"}`, borderRadius:16, color: homeChat?R:muted, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>🤖</span> AI Chat
              </button>
              <button className="btn" onClick={() => setScreen("train")} style={{ padding:"16px 12px", background:card, border:`1.5px solid rgba(239,68,68,0.14)`, borderRadius:16, color:muted, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>📚</span> Learn CPR
              </button>
            </div>

            {/* Home AI Chatbot — collapsible */}
            {homeChat && (
              <div className="fadein" style={{ background:"rgba(239,68,68,0.04)", border:`1px solid rgba(239,68,68,0.16)`, borderRadius:18, overflow:"hidden", marginBottom:16, animationDelay:"0s" }}>
                <div style={{ padding:"12px 16px", borderBottom:`1px solid rgba(239,68,68,0.1)`, display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:R, animation:"blink 1.2s infinite", boxShadow:`0 0 6px ${R}` }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:R }}>🤖 LifePulse AI</span>
                  <span style={{ marginLeft:"auto", fontSize:11, color:dim }}>Ask anything about CPR</span>
                </div>
                {/* Messages */}
                <div style={{ maxHeight:220, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                  {homeMsgs.map((m,i) => (
                    <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", background:m.role==="user"?"rgba(239,68,68,0.16)":"rgba(255,255,255,0.04)", border:`1px solid rgba(239,68,68,${m.role==="user"?0.28:0.1})`, borderRadius:12, padding:"9px 13px", fontSize:13, color:muted, lineHeight:1.65, maxWidth:"88%", animation:"fadein 0.25s ease" }}>
                      {m.role==="assistant" && <span style={{ marginRight:5 }}>🤖</span>}{m.text}
                    </div>
                  ))}
                  {homeLoading && (
                    <div style={{ alignSelf:"flex-start", background:"rgba(255,255,255,0.04)", border:`1px solid rgba(239,68,68,0.1)`, borderRadius:12, padding:"9px 14px", fontSize:13, color:dim }}>
                      🤖 <span style={{ animation:"blink 0.9s infinite", display:"inline-block" }}>···</span>
                    </div>
                  )}
                  <div ref={homeChatEnd}/>
                </div>
                {/* Quick questions */}
                <div style={{ padding:"0 12px 8px", display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["What is CPR?","When to start CPR?","How deep to compress?","Child CPR?"].map(q=>(
                    <button key={q} className="btn" onClick={() => sendHomeAI(q)} style={{ padding:"5px 11px", background:"rgba(239,68,68,0.07)", border:`1px solid rgba(239,68,68,0.17)`, borderRadius:16, color:dim, fontSize:11.5 }}>{q}</button>
                  ))}
                </div>
                {/* Input */}
                <div style={{ padding:"8px 10px", borderTop:`1px solid rgba(239,68,68,0.1)`, display:"flex", gap:7 }}>
                  <input value={homeInput} onChange={e=>setHomeInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&homeInput.trim()&&sendHomeAI(homeInput.trim())} placeholder="Ask about CPR, cardiac arrest…" style={{ flex:1, padding:"9px 13px", background:"rgba(255,255,255,0.04)", border:`1px solid ${border}`, borderRadius:10, color:text, fontSize:13, outline:"none", fontFamily:sans }}/>
                  <button className="btn" onClick={()=>homeInput.trim()&&sendHomeAI(homeInput.trim())} style={{ padding:"9px 15px", background:`linear-gradient(135deg,${R},#991b1b)`, borderRadius:10, color:"#fff", fontSize:13, fontWeight:600 }}>Send</button>
                </div>
              </div>
            )}

            {/* Stats cards */}
            <div className="fadein" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, animationDelay:"0.4s" }}>
              {[["80%","Arrests outside hospital",R],["10%","Survival lost per min","#f97316"],["3×","Better survival w/ CPR","#a78bfa"]].map(([v,l,c],i)=>(
                <div key={v} style={{ background:card, border, borderRadius:16, padding:"16px 8px", textAlign:"center",
                  boxShadow:`0 4px 20px rgba(0,0,0,0.2)`, animation:`fadeInCard 0.5s ease ${0.45+i*0.08}s both` }}>
                  <div style={{ fontSize:21, fontWeight:800, color:c, marginBottom:5, textShadow:`0 0 16px ${c}55` }}>{v}</div>
                  <div style={{ fontSize:9, color:dim, lineHeight:1.55 }}>{l}</div>
                </div>
              ))}
            </div>

          </div>

          <style>{`
            @keyframes floatHero { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
            @keyframes heartPulseBtn {
              0%  { box-shadow:0 0 0 0 rgba(239,68,68,0.55), 0 8px 32px rgba(153,27,27,0.4); }
              60% { box-shadow:0 0 0 18px rgba(239,68,68,0), 0 8px 32px rgba(153,27,27,0.25); }
              100%{ box-shadow:0 0 0 0 rgba(239,68,68,0), 0 8px 32px rgba(153,27,27,0.4); }
            }
            @keyframes float0{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-18px) scale(1.1)}}
            @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-24px)}}
            @keyframes float2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(10deg)}}
            @keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
            @keyframes float4{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-16px) scale(0.9)}}
            @keyframes float5{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
            @keyframes fadeInCard{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
          `}</style>
        </div>
      )}

      {/* ══ SETUP ══ */}
      {screen === "setup" && (
        <div className="fadein" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", padding:"28px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:22 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:R, animation:"blink 0.8s infinite" }}/>
            <span style={{ fontSize:10, letterSpacing:4, color:R, fontFamily:mono }}>EMERGENCY ACTIVE</span>
          </div>

          {/* Map or loading placeholder */}
          <div style={{ marginBottom:14 }}>
            {coords ? (
              <GMap lat={coords.lat} lng={coords.lng} hospitals={hospitals}/>
            ) : (
              <div style={{ height:260, background:"rgba(239,68,68,0.05)", border:`1px solid rgba(239,68,68,0.14)`, borderRadius:16, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                <div style={{ width:36, height:36, border:`3px solid ${R}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.9s linear infinite" }}/>
                <div style={{ fontSize:13, color:muted }}>{L.locating}</div>
              </div>
            )}
            {addr && <div style={{ marginTop:8, fontSize:11.5, color:dim }}>📍 {addr}</div>}
          </div>

          {/* ── SURVIVAL TIMER ── */}
          {(() => {
            const mins = Math.floor(survivalSecs / 60);
            const secs = survivalSecs % 60;
            // Survival probability: starts 90%, drops ~10% per minute
            const survivalPct = Math.max(5, Math.round(90 - (survivalSecs / 60) * 10));
            const urgent = survivalSecs >= 180; // red after 3 mins
            const critical = survivalSecs >= 360; // critical after 6 mins
            const barColor = critical ? "#ef4444" : urgent ? "#f97316" : "#10b981";
            return (
              <div style={{ marginBottom:14, borderRadius:16,
                background: critical ? "rgba(239,68,68,0.1)" : urgent ? "rgba(249,115,22,0.08)" : "rgba(16,185,129,0.07)",
                border: `1px solid ${critical?"rgba(239,68,68,0.3)":urgent?"rgba(249,115,22,0.25)":"rgba(16,185,129,0.2)"}`,
                padding:"14px 16px" }}>
                {/* Header row */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:barColor, animation:"blink 1s ease-in-out infinite" }}/>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:barColor, fontFamily:"'DM Mono',monospace" }}>
                      SURVIVAL TIMER
                    </span>
                  </div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:700, color:barColor, letterSpacing:2 }}>
                    {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
                  </div>
                </div>
                {/* Survival % bar */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Survival Probability</span>
                    <span style={{ fontSize:13, fontWeight:800, color:barColor }}>{survivalPct}%</span>
                  </div>
                  <div style={{ height:8, borderRadius:4, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:4, width:`${survivalPct}%`,
                      background:`linear-gradient(90deg, ${barColor}, ${critical?"#dc2626":urgent?"#fb923c":"#34d399"})`,
                      transition:"width 1s linear" }}/>
                  </div>
                </div>
                {/* Status message */}
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", textAlign:"center" }}>
                  {critical ? "🚨 CRITICAL — Start CPR immediately!" :
                   urgent   ? "⚠️ Urgent — every second counts!" :
                              "⏱ Time elapsed since emergency started"}
                </div>
              </div>
            );
          })()}

          {/* Steps */}
          <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:16 }}>
            <StepRow icon="📍" label={gpsErr ? L.locErr : gpsOk ? L.locDone : L.locating}       status={gpsErr?"error":gpsOk?"done":"active"}/>
            <StepRow icon="🏥" label={hospDone ? L.hospDone : L.hospSearch}                      status={hospDone?"done":gpsOk&&!hospDone?"active":"idle"}/>
            {/* 108 Call row — tappable manual button if auto-dial fails */}
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
              background: callDone ? "rgba(16,185,129,0.07)" : hospDone ? "rgba(239,68,68,0.08)" : card,
              border: `1px solid ${callDone ? "rgba(16,185,129,0.3)" : hospDone ? "rgba(239,68,68,0.3)" : border}`,
              borderRadius:14, transition:"all 0.3s" }}>
              <div style={{ fontSize:22 }}>📞</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color: callDone ? G : hospDone ? R : dim }}>
                  {callDone ? L.callDone : L.calling}
                </div>
                {!callDone && hospDone && (
                  <div style={{ fontSize:11, color:dim, marginTop:2 }}>Tap button to call if dialer didn't open</div>
                )}
              </div>
              {/* Manual call button — always visible once hospitals found */}
              {hospDone && (
                <a href="tel:108"
                  onClick={() => { setCallDone(true); setPhase(3); }}
                  style={{ textDecoration:"none", padding:"8px 18px",
                    background: callDone ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,#ef4444,#b91c1c)",
                    border: callDone ? "1px solid rgba(16,185,129,0.4)" : "none",
                    borderRadius:10, color:"#fff", fontSize:13, fontWeight:700,
                    boxShadow: callDone ? "none" : "0 0 16px rgba(239,68,68,0.4)" }}>
                  {callDone ? "✓ Called" : "📞 Call 108"}
                </a>
              )}
              {!hospDone && (
                <div style={{ width:18, height:18, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.15)", borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }}/>
              )}
            </div>
          </div>

          {/* Hospital list */}
          {hospitals.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:9.5, color:dim, letterSpacing:2.5, fontFamily:mono, marginBottom:9 }}>{L.hospTitle}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {hospitals.map((h,i) => (
                  <div key={i}
                    onClick={() => openDirections(h)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:card, border:`1px solid rgba(16,185,129,0.18)`, borderRadius:14, cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(16,185,129,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background=card}
                  >
                    {/* Rank badge */}
                    <div style={{ width:28, height:28, borderRadius:8, background:`rgba(16,185,129,0.12)`, border:`1px solid rgba(16,185,129,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:G, flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{h.name}</div>
                      <div style={{ fontSize:10.5, color:dim, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{h.addr}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:G }}>{h.dist}</div>
                      <div style={{ fontSize:10, color:dim }}>{h.eta}</div>
                    </div>
                    {/* Directions arrow */}
                    <div style={{ width:32, height:32, borderRadius:10, background:"rgba(16,185,129,0.12)", border:`1px solid rgba(16,185,129,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12h18M13 6l6 6-6 6"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── AED LOCATOR ── */}
          <div style={{ marginBottom:14 }}>
            <button className="btn" onClick={() => setShowAed(v => !v)}
              style={{ width:"100%", padding:"12px 16px", borderRadius:14,
                background: showAed ? "rgba(251,191,36,0.1)" : "rgba(251,191,36,0.06)",
                border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24",
                fontSize:13, fontWeight:700, display:"flex", alignItems:"center",
                justifyContent:"space-between", gap:8 }}>
              <span>⚡ AED Devices Nearby</span>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                {aedLoading && <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(251,191,36,0.3)", borderTopColor:"#fbbf24", animation:"spin 0.8s linear infinite" }}/>}
                {!aedLoading && <span style={{ background:"rgba(251,191,36,0.2)", borderRadius:8, padding:"2px 8px", fontSize:11 }}>{aedList.length} found</span>}
                <span style={{ fontSize:12 }}>{showAed ? "▲" : "▼"}</span>
              </span>
            </button>

            {showAed && (
              <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:7 }}>
                {aedLoading && (
                  <div style={{ textAlign:"center", padding:"16px", color:"rgba(251,191,36,0.6)", fontSize:13 }}>
                    Searching for AED devices...
                  </div>
                )}
                {!aedLoading && aedList.length === 0 && (
                  <div style={{ textAlign:"center", padding:"16px", background:"rgba(255,255,255,0.03)",
                    borderRadius:12, border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontSize:24, marginBottom:6 }}>⚡</div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>No AED devices found within 5km</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>Focus on CPR — you are the best tool</div>
                  </div>
                )}
                {!aedLoading && aedList.map((aed, i) => (
                  <div key={i}
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${aed.lat},${aed.lng}&travelmode=walking`,"_blank")}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                      background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.2)",
                      borderRadius:12, cursor:"pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(251,191,36,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(251,191,36,0.05)"}>
                    {/* AED icon */}
                    <div style={{ width:38, height:38, borderRadius:10,
                      background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.3)",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                      ⚡
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#fef3c7",
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {aed.name}
                      </div>
                      <div style={{ fontSize:10.5, color:"rgba(251,191,36,0.55)", marginTop:2 }}>
                        {aed.indoor} · {aed.access === "yes" || aed.access === "public" ? "Public access" : aed.access}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:"#fbbf24" }}>{aed.dist}</div>
                      <div style={{ fontSize:10, color:"rgba(251,191,36,0.4)" }}>away</div>
                    </div>
                    {/* Arrow */}
                    <div style={{ width:30, height:30, borderRadius:8,
                      background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.25)",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12h18M13 6l6 6-6 6"/>
                      </svg>
                    </div>
                  </div>
                ))}
                {!aedLoading && aedList.length > 0 && (
                  <div style={{ fontSize:11, color:"rgba(251,191,36,0.4)", textAlign:"center", padding:"4px 0" }}>
                    Tap any AED for walking directions · AED can restart heart rhythm
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="btn" onClick={phase >= 3 ? beginCPR : undefined} style={{ width:"100%", padding:"21px", background: phase>=3 ? "linear-gradient(135deg,#ef4444,#991b1b)" : "rgba(255,255,255,0.04)", border: phase>=3 ? "none" : `1.5px solid ${border}`, borderRadius:18, color:"#fff", fontSize:15, fontWeight:700, opacity: phase>=3 ? 1 : 0.4, cursor: phase>=3 ? "pointer" : "default", marginTop:"auto", boxShadow: phase>=3 ? "0 0 32px rgba(239,68,68,0.4)" : "none", transition:"all 0.4s" }}>
            {phase >= 3 ? L.startCPR : L.waiting}
          </button>
        </div>
      )}

      {/* ══ CPR ══ */}
      {screen === "cpr" && (
        <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", padding:"16px 18px 12px", background:bg }}>

          {/* ── BREATH OVERLAY ── */}
          {breath && (
            <div style={{ position:"fixed", inset:0, zIndex:500, background:"linear-gradient(135deg,rgba(2,6,23,0.97),rgba(7,89,133,0.96))", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:72, marginBottom:20, animation:"breath 2s ease-in-out infinite" }}>💨</div>
              <div style={{ fontSize:30, fontWeight:800, color:"#7dd3fc", marginBottom:12 }}>{L.breathTitle}</div>
              <div style={{ fontSize:14, color:"rgba(186,230,253,0.6)", textAlign:"center", maxWidth:260, lineHeight:1.85 }}>{L.breathDesc}</div>
              <div style={{ marginTop:22, fontSize:12, color:"rgba(186,230,253,0.4)" }}>Auto-resuming in 4 seconds…</div>
            </div>
          )}

          {/* ── PLACE PHONE SCREEN ── */}
          {cprPhase === "place" && !breath && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"0 12px" }}>
              <div style={{ fontSize:9, letterSpacing:4, color:R, fontFamily:mono, marginBottom:16 }}>STEP 1 OF 2</div>
              <div style={{ fontSize:80, marginBottom:20, animation:"floatHero 3s ease-in-out infinite" }}>📱</div>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:12, lineHeight:1.3 }}>Place Phone Flat on<br/><span style={{ color:R }}>Victim's Chest</span></h2>
              <p style={{ fontSize:14, color:muted, lineHeight:1.85, maxWidth:300, marginBottom:28 }}>
                Lay this phone <b style={{color:text}}>face-up and flat</b> on the center of the chest.<br/>
                The motion sensor will count every compression automatically.
              </p>
              {/* Phone orientation indicator */}
              <div style={{ background:"rgba(239,68,68,0.06)", border:`1px solid rgba(239,68,68,0.2)`, borderRadius:16, padding:"14px 22px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:24 }}>{phoneFlat ? "✅" : "⚠️"}</div>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:13, fontWeight:700, color: phoneFlat ? "#6ee7b7" : "#fbbf24" }}>
                    {phoneFlat ? "Phone is flat — ready!" : "Tilt phone flat…"}
                  </div>
                  <div style={{ fontSize:11, color:dim, marginTop:2 }}>
                    Orientation sensor: {phoneFlat ? "✓ detected" : "detecting…"}
                  </div>
                </div>
              </div>
              <button className="btn" onClick={activateCPR} style={{ width:"100%", maxWidth:320, padding:"20px", background:"linear-gradient(135deg,#ef4444,#991b1b)", borderRadius:18, color:"#fff", fontSize:16, fontWeight:800, boxShadow:"0 0 32px rgba(239,68,68,0.45)", animation:"heartPulseBtn 2s ease-in-out infinite" }}>
                ❤️ Start Compressions
              </button>
              <div style={{ marginTop:14, fontSize:11.5, color:dim }}>Phone detects each push via motion sensor</div>
            </div>
          )}

          {/* ── ACTIVE CPR ── */}
          {cprPhase === "active" && !breath && (
            <>
              {/* Top stats bar */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ display:"flex", gap:16 }}>
                  {[[L.elapsed, fmt(elapsed), R],[L.cycles, cycles, text],["BPM", lastBpm > 0 ? lastBpm : "—", lastBpm >= 100 && lastBpm <= 120 ? "#10b981" : lastBpm > 0 ? "#f97316" : dim]].map(([l,v,c])=>(
                    <div key={l}>
                      <div style={{ fontSize:8, color:dim, letterSpacing:2.5, fontFamily:mono }}>{l}</div>
                      <div style={{ fontSize:19, fontWeight:800, fontFamily:mono, color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:7 }}>
                  <button className="btn" onClick={() => setVoiceOn(v=>!v)} style={{ background:voiceOn?"rgba(239,68,68,0.1)":card, border:`1px solid ${voiceOn?"rgba(239,68,68,0.25)":border}`, borderRadius:10, padding:"6px 10px", fontSize:14, color:voiceOn?R:dim }}>{voiceOn?"🔊":"🔇"}</button>
                  <button className="btn" onClick={stopCPR} style={{ background:"rgba(16,185,129,0.08)", border:`1px solid rgba(16,185,129,0.22)`, borderRadius:10, padding:"6px 11px", fontSize:11, fontWeight:600, color:"#6ee7b7" }}>{L.stopCPR}</button>
                </div>
              </div>

              {/* Heart */}
              <div style={{ display:"flex", justifyContent:"center", margin:"2px 0 6px", position:"relative" }}>
                {[0,1].map(i=>(
                  <div key={i} style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:130+i*44, height:130+i*44, borderRadius:"50%", border:`1px solid rgba(239,68,68,${beat?0.35-i*0.12:0.06})`, transition:"border-color 0.12s" }}/>
                ))}
                <Heart beat={beat} size={100}/>
              </div>

              {/* ECG */}
              <div style={{ marginBottom:8 }}><ECGLine active={true}/></div>

              {/* ── LIVE MONITORING PANEL ── */}
              <div style={{ background:"rgba(239,68,68,0.04)", border:`1px solid rgba(239,68,68,0.15)`, borderRadius:14, padding:"10px 14px", marginBottom:8 }}>
                {/* Header row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background: accelReady ? G : "#fbbf24", animation:"blink 1s infinite", boxShadow:`0 0 5px ${accelReady ? G : "#fbbf24"}` }}/>
                    <span style={{ fontSize:10, letterSpacing:2, fontFamily:mono, color: accelReady ? "#6ee7b7" : "#fbbf24" }}>
                      {accelReady ? "MOTION SENSOR LIVE" : "AWAITING SENSOR…"}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:10, fontFamily:mono, color:dim }}>{phoneFlat ? "📱 FLAT ✓" : "📱 tilt"}</span>
                    <button className="btn" onClick={()=>setAiAutoCoach(v=>!v)} style={{ fontSize:9, padding:"2px 8px", background: aiAutoCoach?"rgba(16,185,129,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${aiAutoCoach?"rgba(16,185,129,0.3)":border}`, borderRadius:6, color: aiAutoCoach ? "#6ee7b7" : dim, fontFamily:mono }}>
                      🤖 {aiAutoCoach ? "AUTO ON" : "AUTO OFF"}
                    </button>
                  </div>
                </div>

                {/* Quality Score */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:9, color:dim, fontFamily:mono }}>QUALITY SCORE</span>
                    <span style={{ fontSize:9, fontFamily:mono, fontWeight:700, color: qualityScore>=80?"#6ee7b7":qualityScore>=50?"#fbbf24":"#f97316" }}>{qualityScore}%</span>
                  </div>
                  <div style={{ height:5, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${qualityScore}%`, background: qualityScore>=80?"linear-gradient(90deg,#10b981,#34d399)":qualityScore>=50?"linear-gradient(90deg,#f59e0b,#fbbf24)":"linear-gradient(90deg,#ef4444,#f97316)", borderRadius:3, transition:"width 0.3s", boxShadow:`0 0 6px ${qualityScore>=80?"rgba(16,185,129,0.5)":"rgba(239,68,68,0.5)"}` }}/>
                  </div>
                </div>

                {/* G-force bar */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:9, color:dim, fontFamily:mono }}>G-FORCE</span>
                    <span style={{ fontSize:9, color:R, fontFamily:mono, fontWeight:700 }}>{accelVal} g</span>
                  </div>
                  <div style={{ height:4, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min(100, accelVal * 10)}%`, background:"linear-gradient(90deg,#10b981,#ef4444)", borderRadius:3, transition:"width 0.05s" }}/>
                  </div>
                </div>

                {/* BPM sparkline */}
                {bpmHistory.length > 1 && (
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:9, color:dim, fontFamily:mono, marginBottom:4 }}>BPM HISTORY</div>
                    <svg width="100%" height="28" style={{ overflow:"visible" }}>
                      {bpmHistory.map((b, i) => {
                        const x = (i / (bpmHistory.length - 1)) * 100;
                        const y = 28 - Math.min(28, Math.max(0, ((b - 60) / 100) * 28));
                        const inRange = b >= 100 && b <= 120;
                        return (
                          <g key={i}>
                            {i > 0 && (() => {
                              const px = ((i-1) / (bpmHistory.length - 1)) * 100;
                              const py = 28 - Math.min(28, Math.max(0, ((bpmHistory[i-1] - 60) / 100) * 28));
                              return <line x1={`${px}%`} y1={py} x2={`${x}%`} y2={y} stroke={inRange?"#10b981":"#f97316"} strokeWidth="1.5" strokeOpacity="0.7"/>;
                            })()}
                            <circle cx={`${x}%`} cy={y} r="2" fill={inRange?"#10b981":"#f97316"}/>
                          </g>
                        );
                      })}
                      {/* Target zone band */}
                      <rect x="0" y={28-Math.min(28,((120-60)/100)*28)} width="100%" height={Math.min(28,((120-60)/100)*28)-Math.min(28,((100-60)/100)*28)} fill="rgba(16,185,129,0.07)" rx="2"/>
                    </svg>
                  </div>
                )}

                {/* BPM feedback */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:dim }}>Target: <span style={{ color:"#6ee7b7", fontWeight:700 }}>100–120 BPM</span></span>
                  <span style={{ fontSize:11, fontWeight:700, color: lastBpm >= 100 && lastBpm <= 120 ? "#6ee7b7" : lastBpm > 0 ? "#f97316" : dim }}>
                    {lastBpm > 0 ? (lastBpm >= 100 && lastBpm <= 120 ? "✓ Good rate!" : lastBpm < 100 ? "⚠ Push faster" : "⚠ Slow down") : "Push to start"}
                  </span>
                </div>
              </div>

              {/* Compression counter */}
              <div style={{ background:"rgba(239,68,68,0.06)", border:`1px solid rgba(239,68,68,0.16)`, borderRadius:14, padding:"10px 16px", textAlign:"center", marginBottom:8 }}>
                <div style={{ fontSize:44, fontWeight:800, fontFamily:mono, background:"linear-gradient(135deg,#fca5a5,#ef4444)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>
                  {compr%30===0&&compr>0 ? 30 : compr%30}<span style={{ fontSize:15, WebkitTextFillColor:dim }}> /30</span>
                </div>
                <div style={{ fontSize:9, letterSpacing:3, color:dim, fontFamily:mono, margin:"5px 0 7px" }}>{L.compressions} · TOTAL: {compr}</div>
                <div style={{ height:5, background:"rgba(255,255,255,0.05)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#ef4444,#f97316)", borderRadius:3, transition:"width 0.05s", boxShadow:"0 0 8px rgba(239,68,68,0.5)" }}/>
                </div>
              </div>

              {/* Quick asks */}
              <div style={{ display:"flex", gap:6, marginBottom:7, overflowX:"auto" }}>
                {L.quick.map(q => (
                  <button key={q} className="btn" onClick={() => { setShowChat(true); sendAI(q); }} style={{ flexShrink:0, padding:"5px 11px", background:"rgba(239,68,68,0.07)", border:`1px solid rgba(239,68,68,0.17)`, borderRadius:16, color:muted, fontSize:11.5 }}>{q}</button>
                ))}
              </div>

              {/* AI Chat */}
              <div style={{ background:"rgba(239,68,68,0.03)", border:`1px solid rgba(239,68,68,0.11)`, borderRadius:13, flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>
                <div onClick={() => setShowChat(s=>!s)} style={{ padding:"8px 13px", display:"flex", alignItems:"center", gap:7, cursor:"pointer", borderBottom:showChat?`1px solid rgba(239,68,68,0.1)`:"none" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:R, animation:"blink 1s infinite" }}/>
                  <span style={{ fontSize:12.5, fontWeight:700, color:R }}>{L.aiCoach}</span><span style={{ fontSize:9, background:"rgba(66,133,244,0.15)", border:"1px solid rgba(66,133,244,0.3)", borderRadius:6, padding:"1px 6px", color:"#60a5fa", fontFamily:mono, marginLeft:4 }}>Gemini</span>
                  {aiLoading && <span style={{ fontSize:10.5, color:muted, animation:"blink 1s infinite" }}>{L.typing}</span>}
                  <span style={{ marginLeft:"auto", fontSize:10, color:dim }}>{showChat?"▲":"▼"}</span>
                </div>
                {showChat && (
                  <>
                    <div style={{ flex:1, padding:"9px 12px", display:"flex", flexDirection:"column", gap:6, maxHeight:130, overflowY:"auto" }}>
                      {msgs.map((m,i) => (
                        <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", background:m.role==="user"?"rgba(239,68,68,0.14)":"rgba(239,68,68,0.07)", border:`1px solid rgba(239,68,68,${m.role==="user"?0.24:0.13})`, borderRadius:10, padding:"6px 10px", fontSize:12, color:muted, lineHeight:1.6, maxWidth:"90%" }}>
                          {m.role==="assistant" && "🤖 "}{m.text}
                        </div>
                      ))}
                      {aiLoading && <div style={{ alignSelf:"flex-start", background:"rgba(239,68,68,0.07)", border:`1px solid rgba(239,68,68,0.13)`, borderRadius:10, padding:"6px 12px", fontSize:12, color:dim }}>🤖 ···</div>}
                      <div ref={chatEnd}/>
                    </div>
                    <div style={{ padding:"6px 8px", borderTop:`1px solid rgba(239,68,68,0.09)`, display:"flex", gap:6 }}>
                      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&input.trim()&&sendAI(input.trim())} placeholder={L.placeholder} style={{ flex:1, padding:"7px 11px", background:"rgba(255,255,255,0.04)", border:`1px solid ${border}`, borderRadius:9, color:text, fontSize:12.5, outline:"none", fontFamily:sans }}/>
                      <button className="btn" onClick={()=>input.trim()&&sendAI(input.trim())} style={{ padding:"7px 13px", background:`linear-gradient(135deg,${R},#991b1b)`, borderRadius:9, color:"#fff", fontSize:12.5, fontWeight:600 }}>{L.send}</button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ REPORT ══ */}
      {screen === "report" && report && (
        <div className="fadein" style={{ minHeight:"100vh", padding:"30px 20px 28px", display:"flex", flexDirection:"column", overflowY:"auto" }}>
          <div style={{ fontSize:9, letterSpacing:5, color:G, fontFamily:mono, marginBottom:8 }}>✦ SESSION COMPLETE</div>
          <h2 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>{L.reportTitle}</h2>
          <p style={{ color:dim, fontSize:13, marginBottom:16 }}>{L.reportSub}</p>

          {/* Quality Score Hero */}
          <div style={{ background:`linear-gradient(135deg,rgba(${report.qualityScore>=80?"16,185,129":"239,68,68"},0.12),rgba(0,0,0,0))`, border:`1px solid rgba(${report.qualityScore>=80?"16,185,129":"239,68,68"},0.25)`, borderRadius:20, padding:"20px 22px", marginBottom:14, textAlign:"center" }}>
            <div style={{ fontSize:9, letterSpacing:3, color:report.qualityScore>=80?G:R, fontFamily:mono, marginBottom:6 }}>CPR QUALITY SCORE</div>
            <div style={{ fontSize:64, fontWeight:900, fontFamily:mono, background:`linear-gradient(135deg,${report.qualityScore>=80?"#6ee7b7,#10b981":"#fca5a5,#ef4444"})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>{report.qualityScore}<span style={{ fontSize:24 }}>%</span></div>
            <div style={{ marginTop:10, fontSize:13, color: report.qualityScore>=80?"#6ee7b7":report.qualityScore>=50?"#fbbf24":"#f97316", fontWeight:600 }}>
              {report.qualityScore>=80 ? "🏆 Excellent — Professional Level!" : report.qualityScore>=50 ? "👍 Good effort — Keep practicing!" : "📚 Review technique — Practice more"}
            </div>
            <div style={{ marginTop:6, height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${report.qualityScore}%`, background:report.qualityScore>=80?"linear-gradient(90deg,#10b981,#34d399)":"linear-gradient(90deg,#ef4444,#f97316)", borderRadius:3, transition:"width 1s ease" }}/>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:16 }}>
            {[["⏱️","Duration",report.duration,R],["💪","Compressions",report.compressions,"#f97316"],["🔄","Cycles",report.cycles,"#a78bfa"],["🕐","Ended",report.time,G]].map(([icon,label,val,c])=>(
              <div key={label} style={{ background:card, border, borderRadius:16, padding:"16px 10px", textAlign:"center" }}>
                <div style={{ fontSize:26, marginBottom:7 }}>{icon}</div>
                <div style={{ fontSize:20, fontWeight:800, fontFamily:mono, color:c }}>{val}</div>
                <div style={{ fontSize:10, color:dim, marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background:"rgba(16,185,129,0.06)", border:`1px solid rgba(16,185,129,0.18)`, borderRadius:14, padding:"16px", marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#6ee7b7", marginBottom:10 }}>✅ {L.paraTitle}</div>
            {[`${L.paraLines[0]}: ${report.duration}`, ...L.paraLines.slice(1)].map(t=>(
              <div key={t} style={{ fontSize:12.5, color:muted, marginBottom:6 }}>· {t}</div>
            ))}
          </div>

          {coords && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:9.5, color:dim, letterSpacing:2.5, fontFamily:mono, marginBottom:9 }}>{L.hospTitle}</div>
              <GMap lat={coords.lat} lng={coords.lng} hospitals={hospitals}/>
              <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:7 }}>
                {hospitals.map((h,i)=>(
                  <div key={i}
                    onClick={() => openDirections(h)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:card, border:`1px solid rgba(16,185,129,0.18)`, borderRadius:14, cursor:"pointer", transition:"all 0.2s", marginBottom:1 }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(16,185,129,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background=card}
                  >
                    <div style={{ width:28, height:28, borderRadius:8, background:"rgba(16,185,129,0.12)", border:`1px solid rgba(16,185,129,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:G, flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{h.name}</div>
                      <div style={{ fontSize:10.5, color:dim }}>{h.addr}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0, marginRight:6 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:G }}>{h.dist}</div>
                      <div style={{ fontSize:10, color:dim }}>{h.eta}</div>
                    </div>
                    {/* Directions button */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.25)`, borderRadius:10, padding:"6px 10px", flexShrink:0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                      </svg>
                      <span style={{ fontSize:8, color:G, fontFamily:"'DM Mono',monospace", fontWeight:700 }}>GO</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="btn" onClick={reset} style={{ width:"100%", padding:"20px", background:"linear-gradient(135deg,#ef4444,#991b1b)", borderRadius:16, color:"#fff", fontSize:15, fontWeight:700 }}>{L.backHome}</button>
        </div>
      )}

      {/* ══ TRAINING ══ */}
      {/* ══ DASHBOARD ══ */}
      {screen === "dashboard" && (
        <div className="fadein" style={{ minHeight:"100vh", padding:"28px 18px 32px", overflowY:"auto" }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
            <button className="btn" onClick={() => setScreen("home")} style={{ background:card, border, borderRadius:10, padding:"8px 12px", color:muted, fontSize:14 }}>← Back</button>
            <div>
              <div style={{ fontSize:9, letterSpacing:4, color:G, fontFamily:mono }}>LIFEPULSE</div>
              <div style={{ fontSize:22, fontWeight:800 }}>📊 Dashboard</div>
            </div>
          </div>

          {/* Total stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:18 }}>
            {[
              ["Sessions", sessions.length, "🩺"],
              ["Total Compressions", sessions.reduce((a,s)=>a+(s.compressions||0),0), "💪"],
              ["Avg Quality", sessions.length > 0 ? Math.round(sessions.reduce((a,s)=>a+(s.qualityScore||0),0)/sessions.length) + "%" : "—", "⭐"],
            ].map(([l,v,e]) => (
              <div key={l} style={{ background:card, border, borderRadius:16, padding:"14px 10px", textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:4 }}>{e}</div>
                <div style={{ fontSize:18, fontWeight:800, fontFamily:mono, color:text }}>{v}</div>
                <div style={{ fontSize:9, color:dim, letterSpacing:1, marginTop:2 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Quality trend chart */}
          {sessions.length > 1 && (
            <div style={{ background:card, border, borderRadius:18, padding:"16px 16px 12px", marginBottom:16 }}>
              <div style={{ fontSize:9, color:dim, fontFamily:mono, letterSpacing:2, marginBottom:10 }}>QUALITY SCORE TREND</div>
              <svg width="100%" height="60" style={{ overflow:"visible" }}>
                {sessions.slice().reverse().map((s, i, arr) => {
                  const x = arr.length > 1 ? (i / (arr.length-1)) * 100 : 50;
                  const y = 60 - Math.min(60, ((s.qualityScore||0)/100)*60);
                  const good = (s.qualityScore||0) >= 80;
                  return (
                    <g key={s.id}>
                      {i > 0 && (() => {
                        const px = ((i-1)/(arr.length-1))*100;
                        const py = 60 - Math.min(60,((arr[i-1].qualityScore||0)/100)*60);
                        return <line x1={`${px}%`} y1={py} x2={`${x}%`} y2={y} stroke="#10b981" strokeWidth="2" strokeOpacity="0.5"/>;
                      })()}
                      <circle cx={`${x}%`} cy={y} r="4" fill={good?"#10b981":"#f97316"} stroke={bg} strokeWidth="2"/>
                    </g>
                  );
                })}
              </svg>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                <span style={{ fontSize:9, color:dim, fontFamily:mono }}>OLDEST</span>
                <span style={{ fontSize:9, color:dim, fontFamily:mono }}>LATEST</span>
              </div>
            </div>
          )}

          {/* Session history */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, color:dim, fontFamily:mono, letterSpacing:2, marginBottom:10 }}>SESSION HISTORY</div>
            {sessions.length === 0 ? (
              <div style={{ background:card, border, borderRadius:16, padding:"30px 20px", textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🩺</div>
                <div style={{ fontSize:14, color:muted }}>No sessions yet</div>
                <div style={{ fontSize:12, color:dim, marginTop:6 }}>Complete a CPR session to see your history</div>
              </div>
            ) : sessions.map((s, i) => (
              <div key={s.id||i} style={{ background:card, border:`1px solid ${(s.qualityScore||0)>=80?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.12)"}`, borderRadius:14, padding:"13px 16px", marginBottom:8, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`rgba(${(s.qualityScore||0)>=80?"16,185,129":"239,68,68"},0.1)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                  {(s.qualityScore||0)>=80?"🏆":(s.qualityScore||0)>=50?"👍":"📚"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:text, marginBottom:2 }}>{s.date} · {s.time}</div>
                  <div style={{ fontSize:11, color:dim }}>
                    {s.compressions} compressions · {s.cycles} cycles · {s.duration}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:20, fontWeight:800, fontFamily:mono, color:(s.qualityScore||0)>=80?"#6ee7b7":(s.qualityScore||0)>=50?"#fbbf24":"#f97316" }}>{s.qualityScore||0}%</div>
                  <div style={{ fontSize:9, color:dim, fontFamily:mono }}>QUALITY</div>
                </div>
              </div>
            ))}
          </div>

          {sessions.length > 0 && (
            <button className="btn" onClick={() => { setSessions([]); try{localStorage.removeItem("lp_sessions")}catch(e){} }} style={{ width:"100%", padding:"12px", background:"rgba(239,68,68,0.06)", border:`1px solid rgba(239,68,68,0.18)`, borderRadius:14, color:"#fca5a5", fontSize:13, fontWeight:600 }}>
              🗑 Clear History
            </button>
          )}
        </div>
      )}

      {/* ══ OFFLINE GUIDE ══ */}
      {screen === "offline" && (
        <div className="fadein" style={{ minHeight:"100vh", padding:"28px 18px 32px", overflowY:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <button className="btn" onClick={() => setScreen("home")} style={{ background:card, border, borderRadius:10, padding:"8px 12px", color:muted, fontSize:14 }}>← Back</button>
            <div>
              <div style={{ fontSize:9, letterSpacing:4, color:"#fbbf24", fontFamily:mono }}>WORKS WITHOUT INTERNET</div>
              <div style={{ fontSize:22, fontWeight:800 }}>✈️ Offline CPR Guide</div>
            </div>
          </div>

          {/* Status */}
          <div style={{ background: isOnline?"rgba(16,185,129,0.07)":"rgba(251,191,36,0.07)", border:`1px solid ${isOnline?"rgba(16,185,129,0.25)":"rgba(251,191,36,0.3)"}`, borderRadius:14, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>{isOnline?"📶":"✈️"}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:isOnline?"#6ee7b7":"#fbbf24" }}>{isOnline?"You're online":"You're offline"}</div>
              <div style={{ fontSize:11, color:dim }}>This guide is fully embedded — no internet needed</div>
            </div>
          </div>

          {/* AHA steps — all offline, no external deps */}
          {[
            { step:"01", icon:"🔍", title:"Check Responsiveness", color:"#60a5fa", detail:"Tap shoulders firmly. Shout 'Are you OK?'. If no response, begin CPR immediately." },
            { step:"02", icon:"📞", title:"Call 108 Immediately", color:"#f97316", detail:"Shout for someone to call 108. If alone, call yourself, put on speaker, then start CPR." },
            { step:"03", icon:"🫀", title:"Hand Position", color:"#ef4444", detail:"Place heel of hand on center of chest (lower half of sternum). Other hand on top, fingers interlaced." },
            { step:"04", icon:"💪", title:"Push Hard & Fast", color:"#a78bfa", detail:"Push down 5–6 cm (2–2.4 inches). Full recoil between compressions. Do NOT lean on chest." },
            { step:"05", icon:"⚡", title:"Rate: 100–120 BPM", color:"#10b981", detail:"Push to the beat of 'Stayin Alive' by Bee Gees. Count: 1-and-2-and-3-and... up to 30." },
            { step:"06", icon:"💨", title:"Rescue Breaths (Optional)", color:"#7dd3fc", detail:"Tilt head back, lift chin. Pinch nose, give 2 breaths (1 second each). Chest should rise." },
            { step:"07", icon:"🔁", title:"Continue 30:2 Cycle", color:"#34d399", detail:"30 compressions then 2 breaths = 1 cycle. Continue until ambulance arrives or AED available." },
            { step:"08", icon:"🏥", title:"AED if Available", color:"#fbbf24", detail:"Turn on AED, follow voice prompts. Resume CPR immediately after each shock." },
          ].map(s => (
            <div key={s.step} style={{ background:card, border, borderRadius:16, padding:"14px 16px", marginBottom:10, display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`rgba(${s.color==="#ef4444"?"239,68,68":s.color==="#10b981"?"16,185,129":"99,102,241"},0.12)`, border:`1px solid ${s.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:8, fontFamily:mono, color:s.color, fontWeight:700, letterSpacing:2 }}>STEP {s.step}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:text, marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:12, color:muted, lineHeight:1.7 }}>{s.detail}</div>
              </div>
            </div>
          ))}

          {/* Key numbers */}
          <div style={{ background:"rgba(239,68,68,0.06)", border:`1px solid rgba(239,68,68,0.18)`, borderRadius:16, padding:"16px 18px", marginTop:8 }}>
            <div style={{ fontSize:9, color:R, fontFamily:mono, letterSpacing:3, marginBottom:12 }}>KEY NUMBERS TO REMEMBER</div>
            {[["108","India Emergency Number"],["5–6 cm","Compression Depth"],["100–120","BPM Rate"],["30:2","Compression to Breath Ratio"],["10%","Survival drops per minute without CPR"]].map(([n,l])=>(
              <div key={n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:8, marginBottom:8, borderBottom:`1px solid ${border}` }}>
                <span style={{ fontSize:12, color:muted }}>{l}</span>
                <span style={{ fontSize:16, fontWeight:800, fontFamily:mono, color:R }}>{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "train" && (
        <div className="fadein" style={{ minHeight:"100vh", padding:"24px 20px 28px", display:"flex", flexDirection:"column", overflowY:"auto" }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <button className="btn" onClick={() => setScreen("home")} style={{ background:"rgba(239,68,68,0.07)", border:`1px solid rgba(239,68,68,0.18)`, borderRadius:11, padding:"8px 14px", color:muted, fontSize:13 }}>← Back</button>
            <div>
              <div style={{ fontSize:9, letterSpacing:4, color:R, fontFamily:mono }}>{L.trainMode}</div>
              <div style={{ fontSize:20, fontWeight:800 }}>{L.trainTitle}</div>
            </div>
            <button className="btn" onClick={() => setShowLang(true)} style={{ marginLeft:"auto", background:"rgba(239,68,68,0.07)", border:`1px solid rgba(239,68,68,0.18)`, borderRadius:10, padding:"7px 11px", fontSize:16, color:muted }}>{LANGS[lang].flag}</button>
          </div>

          {/* ── CPR DEMO VIDEO ── */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:9.5, color:R, letterSpacing:3, fontFamily:mono, marginBottom:10 }}>📹 CPR DEMO VIDEO</div>
            <div style={{ borderRadius:18, overflow:"hidden", border:`1px solid rgba(239,68,68,0.22)`, boxShadow:"0 4px 28px rgba(0,0,0,0.45)", position:"relative", background:"#000" }}>
              {/* Official AHA CPR YouTube video — no cookies, embeds cleanly */}
              <iframe
                width="100%"
                height="210"
                src="https://www.youtube.com/embed/cosVBV96E2g?rel=0&modestbranding=1&color=red"
                title="How to Perform CPR"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display:"block" }}
              />
              {/* Label badge */}
              <div style={{ position:"absolute", top:10, left:10, background:"rgba(0,0,0,0.78)", backdropFilter:"blur(6px)", border:`1px solid rgba(239,68,68,0.4)`, borderRadius:7, padding:"4px 10px", display:"flex", alignItems:"center", gap:6, fontSize:9.5, color:"#fca5a5", fontFamily:mono, fontWeight:600, pointerEvents:"none" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:R, animation:"blink 1.2s infinite" }}/>
                OFFICIAL CPR GUIDE
              </div>
            </div>
            <div style={{ marginTop:8, fontSize:11, color:dim, textAlign:"center" }}>
              Source: American Heart Association · Hands-Only CPR
            </div>
          </div>

          {/* Key takeaways */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
            {[["💪","Push Hard","5–6 cm deep"],["⚡","Push Fast","100–120 BPM"],["🔄","30:2 Ratio","Compressions:Breaths"],["📞","Call 108","Before or during"]].map(([icon,title,sub])=>(
              <div key={title} style={{ background:"rgba(239,68,68,0.05)", border:`1px solid rgba(239,68,68,0.14)`, borderRadius:14, padding:"13px 12px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:700, color:text }}>{title}</div>
                  <div style={{ fontSize:10.5, color:dim, marginTop:2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ display:"flex", gap:5, marginBottom:14 }}>
            {L.trainSteps.map((_,i) => (
              <div key={i} onClick={() => setTStep(i)} style={{ flex:1, height:3, borderRadius:2, cursor:"pointer", background: i===tStep ? R : i<tStep ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.07)", transition:"background 0.3s" }}/>
            ))}
          </div>

          {/* Step card */}
          <div style={{ background:card, border, borderRadius:22, padding:"30px 22px 28px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:56, marginBottom:16, animation:"floatHero 3s ease-in-out infinite" }}>{L.trainSteps[tStep].icon}</div>
            <div style={{ fontSize:9, color:R, letterSpacing:4, fontFamily:mono, marginBottom:10 }}>STEP {tStep+1} of {L.trainSteps.length} · {L.trainSteps[tStep].phase.toUpperCase()}</div>
            <p style={{ fontSize:14.5, color:muted, lineHeight:1.9, maxWidth:300 }}>{L.trainSteps[tStep].detail}</p>
          </div>

          {/* Nav buttons */}
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn" onClick={() => setTStep(i=>Math.max(0,i-1))} disabled={tStep===0} style={{ flex:1, padding:"15px", background:card, border, borderRadius:14, color:muted, fontSize:14, opacity:tStep===0?0.25:1 }}>← Prev</button>
            {tStep < L.trainSteps.length-1
              ? <button className="btn" onClick={() => setTStep(i=>i+1)} style={{ flex:2, padding:"15px", background:"linear-gradient(135deg,#ef4444,#991b1b)", borderRadius:14, color:"#fff", fontSize:14, fontWeight:700 }}>Next →</button>
              : <button className="btn" onClick={() => setScreen("home")} style={{ flex:2, padding:"15px", background:"linear-gradient(135deg,#059669,#065f46)", borderRadius:14, color:"#fff", fontSize:14, fontWeight:700 }}>✅ Done — I'm Ready!</button>
            }
          </div>
        </div>
      )}
    </div>
  );
}
