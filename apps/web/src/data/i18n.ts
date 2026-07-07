const translations: Record<string, Record<string, string>> = {
  // Onboarding
  'arthai.greeting': {
    en: "Namaste! I'm Arth AI — your personal AI Wealth Advisor inside IDBI Bank. I'll analyze your cash flows, run suitability checks, and craft a tailored wealth plan.",
    hi: "नमस्ते! मैं दिशा हूँ — IDBI बैंक में आपकी निजी AI वेल्थ एडवाइजर। मैं आपके कैश फ्लो का विश्लेषण करूँगी और एक उपयुक्त वेल्थ प्लान तैयार करूँगी।",
    ta: "வணக்கம்! நான் திசா — IDBI வங்கியில் உங்கள் தனிப்பட்ட AI செல்வ வழிகாட்டி. உங்கள் பணப்புழக்கத்தை பகுப்பாய்வு செய்து சிறந்த திட்டத்தை உருவாக்குவேன்."
  },
  'ai.disclosure': {
    en: "Arth AI runs deterministic business rules (SEBI guidelines). No hallucinated advice. Human advisors available 24/7.",
    hi: "दिशा SEBI दिशा-निर्देशों पर आधारित नियमावली का पालन करती है। कोई मनगढ़ंत सलाह नहीं। मानव सलाहकार 24/7 उपलब्ध हैं।",
    ta: "திசா SEBI வழிகாட்டுதல்களின்படி செயல்படுகிறது. கற்பனையான ஆலோசனைகள் இல்லை. மனித ஆலோசகர்கள் எப்போதும் உள்ளனர்."
  },
  'btn.letsBegin': { en: "Begin Risk Assessment", hi: "जोखिम मूल्यांकन शुरू करें", ta: "இடர் மதிப்பீட்டைத் தொடங்குங்கள்" },
  'btn.continue': { en: "Confirm & View Dashboard", hi: "पुष्टि करें और डैशबोर्ड देखें", ta: "உறுதிசெய்து டாஷ்போர்டைப் பார்க்கவும்" },
  'btn.seePlan': { en: "View Recommended Plan", hi: "अनुशंसित योजना देखें", ta: "பரிந்துரைக்கப்பட்ட திட்டத்தைப் பார்க்கவும்" },
  'btn.talkToArthAi': { en: "Ask Arth AI", hi: "Arth AI से पूछें", ta: "Arth AI இடம் கேளுங்கள்" },
  'btn.setupPlan': { en: "Lock In Allocation Plan", hi: "आवंटन योजना लॉक करें", ta: "ஒதுக்கீட்டு திட்டத்தைப் பூட்டுங்கள்" },
  'btn.retakeRisk': { en: "Retake Risk Assessment", hi: "जोखिम मूल्यांकन पुनः करें", ta: "இடர் மதிப்பீட்டை மீண்டும் எடுக்கவும்" },
  'btn.connectHuman': { en: "Schedule Human Advisor", hi: "मानव सलाहकार शेड्यूल करें", ta: "மனித ஆலோசகரை முன்பதிவு செய்" },
  'btn.restart': { en: "↺ Reset Demo", hi: "↺ डेमो रीसेट", ta: "↺ டெமோ மீட்டமை" },
  
  // Tabs
  'tab.home': { en: "Wealth Hub", hi: "वेल्थ हब", ta: "செல்வ மையம்" },
  'tab.arthai': { en: "Arth AI", hi: "Arth AI", ta: "Arth AI" },
  'tab.plan': { en: "Portfolio Plan", hi: "पोर्टफोलियो प्लान", ta: "போர்ட்ஃபோலியோ திட்டம்" },
  'tab.activity': { en: "Audit Trail", hi: "ऑडिट ट्रेल", ta: "தணிக்கை பாதை" },
  
  // Home
  'home.greeting': { en: "Welcome back", hi: "वापसी पर स्वागत है", ta: "மீண்டும் வருக" },
  'home.netPosition': { en: "Total Wealth Portfolio", hi: "कुल पोर्टफोलियो मूल्य", ta: "மொத்த போர்ட்ஃபோலியோ மதிப்பு" },
  'home.thisMonth': { en: "vs last month", hi: "पिछले महीने की तुलना में", ta: "கடந்த மாதத்துடன் ஒப்பிடும்போது" },
  'home.spendingInsights': { en: "Monthly Cash Flow Analysis", hi: "मासिक कैश फ्लो विश्लेषण", ta: "மாதாந்திர பணப்புழக்க பகுப்பாய்வு" },
  'home.investable': { en: "Calculated Investable Surplus", hi: "गणित निवेश योग्य अधिशेष", ta: "கணக்கிடப்பட்ட முதலீட்டு உபரி" },
  'home.investableSubline': { en: "Auto-deducted ₹12,000 for emergency buffer.", hi: "आपातकालीन बफ़र के लिए ₹12,000 स्वतः काटे गए।", ta: "அவசர நிதிக்கு ₹12,000 தானாக கழிக்கப்பட்டது." },
  'home.goals': { en: "Financial Goals Tracking", hi: "वित्तीय लक्ष्य ट्रैकिंग", ta: "நிதி இலக்குகள் கண்காணிப்பு" },
  'home.in': { en: "Total Income", hi: "कुल आय", ta: "மொத்த வருமானம்" },
  'home.out': { en: "Total Outflow", hi: "कुल व्यय", ta: "மொத்த செலவு" },
  'home.healthScore': { en: "Financial Health Score", hi: "वित्तीय स्वास्थ्य स्कोर", ta: "நிதி ஆரோக்கிய மதிப்பெண்" },
  'home.discretionary': { en: "Discretionary Spend", hi: "विवेकधीन खर्च", ta: "விருப்பமான செலவு" },
  
  // Risk profiling
  'risk.title': { en: "Regulatory Risk Profiler (SEBI Compliant)", hi: "नियामक जोखिम प्रोफ़ाइलर", ta: "ஒழுங்குமுறை இடர் சுயவிவரம்" },
  'risk.result': { en: "Assessed Risk Profile", hi: "मूल्यांकित जोखिम प्रोफ़ाइल", ta: "மதிப்பிடப்பட்ட இடர் சுயவிவரம்" },
  'risk.consent': { en: "I confirm this accurately reflects my risk appetite", hi: "मैं पुष्टि करता/करती हूँ कि यह मेरी जोखिम क्षमता को दर्शाता है", ta: "இது என் இடர் சகிப்புத்தன்மையை துல்லியமாக பிரதிபலிக்கிறது" },
  'risk.Conservative': { en: "Conservative", hi: "रूढ़िवादी", ta: "பழமைவாத" },
  'risk.Moderate': { en: "Moderate", hi: "मध्यम", ta: "மிதமான" },
  'risk.Aggressive': { en: "Aggressive", hi: "आक्रामक", ta: "தீவிர" },
  'risk.explainConservative': {
    en: "Capital preservation is your top priority. Recommended asset mix: 85% Fixed Income/Debt & Liquid, 15% Conservative Hybrid.",
    hi: "पूंजी सुरक्षा आपकी सर्वोच्च प्राथमिकता है। अनुशंसित मिश्रण: 85% फिक्स्ड इनकम और 15% हाइब्रिड।",
    ta: "மூலதன பாதுகாப்பு உங்கள் முதன்மை இலக்கு. பரிந்துரைக்கப்பட்ட கலவை: 85% கடன் மற்றும் 15% சமநிலை நிதி."
  },
  'risk.explainModerate': {
    en: "Balanced growth with controlled volatility. Recommended asset mix: 40% Hybrid, 30% Debt/Liquid, 30% Equity.",
    hi: "नियंत्रित अस्थिरता के साथ संतुलित विकास। अनुशंसित मिश्रण: 40% हाइब्रिड, 30% डेट, 30% इक्विटी।",
    ta: "கட்டுப்படுத்தப்பட்ட ஏற்ற இறக்கத்துடன் கூடிய வளர்ச்சி. பரிந்துரைக்கப்பட்ட கலவை: 40% சமநிலை, 30% கடன், 30% பங்கு."
  },
  'risk.explainAggressive': {
    en: "Maximum long-term wealth compounding. Recommended asset mix: 65% Flexi/Index Equity, 25% Hybrid, 10% Liquid.",
    hi: "अधिकतम दीर्घकालिक संपत्ति निर्माण। अनुशंसित मिश्रण: 65% इक्विटी, 25% हाइब्रिड, 10% लिक्विड।",
    ta: "அதிகபட்ச நீண்ட கால செல்வ உருவாக்கம். பரிந்துரைக்கப்பட்ட கலவை: 65% பங்கு, 25% சமநிலை, 10% திரவம்."
  },

  // Risk questions
  'rq.1': { en: "What's your current age group?", hi: "आपकी आयु वर्ग क्या है?", ta: "உங்கள் வயது குழு என்ன?" },
  'rq.2': { en: "Primary source of income stability?", hi: "आय की स्थिरता का प्राथमिक स्रोत?", ta: "வருமானத்தின் முதன்மை ஸ்திரத்தன்மை?" },
  'rq.3': { en: "Primary financial horizon objective?", hi: "प्राथमिक वित्तीय उद्देश्य?", ta: "முதன்மை நிதி நோக்கம்?" },
  'rq.4': { en: "Target investment holding period?", hi: "लक्ष्य निवेश अवधि?", ta: "முதலீட்டு காலம்?" },
  'rq.5': { en: "If your portfolio dropped 20% in a crash, you would:", hi: "यदि बाज़ार 20% गिर जाए, तो आप:", ta: "சந்தை 20% சரிந்தால் நீங்கள்:" },
  'rq.6': { en: "Prior capital markets experience?", hi: "पूर्व निवेश अनुभव?", ta: "முந்தைய முதலீட்டு அனுபவம்?" },

  // Risk answer chips
  'ra.under30': { en: "Under 30 Yrs", hi: "30 वर्ष से कम", ta: "30 வயதிற்குட்பட்டோர்" },
  'ra.30-45': { en: "30–45 Yrs", hi: "30–45 वर्ष", ta: "30–45 வயது" },
  'ra.45-60': { en: "45–60 Yrs", hi: "45–60 वर्ष", ta: "45–60 வயது" },
  'ra.60+': { en: "60+ Yrs", hi: "60+ वर्ष", ta: "60+ வயது" },
  'ra.stable': { en: "Stable Salaried", hi: "स्थिर वेतनभोगी", ta: "நிலையான சம்பளம்" },
  'ra.variable': { en: "Variable Business", hi: "व्यापार / परिवर्तनशील", ta: "வியாபாரம் / மாறுபடும்" },
  'ra.irregular': { en: "Freelance / Irregular", hi: "अनियमित", ta: "ஒழுங்கற்ற வருமானம்" },
  'ra.grow': { en: "Wealth Compounding", hi: "धन वृद्धि", ta: "செல்வ வளர்ச்சி" },
  'ra.retire': { en: "Retirement Planning", hi: "सेवानिवृत्ति", ta: "ஓய்வூதியத் திட்டம்" },
  'ra.child': { en: "Child Education", hi: "बच्चे की शिक्षा", ta: "குழந்தை கல்வி" },
  'ra.home': { en: "Home Purchase", hi: "घर की खरीदारी", ta: "வீடு வாங்குதல்" },
  'ra.safety': { en: "Capital Preservation", hi: "पूंजी सुरक्षा", ta: "மூலதன பாதுகாப்பு" },
  'ra.lt1': { en: "< 1 Year (Short)", hi: "< 1 वर्ष", ta: "< 1 ஆண்டு" },
  'ra.1-3': { en: "1–3 Years (Medium)", hi: "1–3 वर्ष", ta: "1–3 ஆண்டுகள்" },
  'ra.3-7': { en: "3–7 Years (Long)", hi: "3–7 वर्ष", ta: "3–7 ஆண்டுகள்" },
  'ra.7+': { en: "7+ Years (Ultra Long)", hi: "7+ वर्ष", ta: "7+ ஆண்டுகள்" },
  'ra.sellAll': { en: "Panic & Exit All", hi: "घबराकर बेचें", ta: "பயந்து விற்கவும்" },
  'ra.sellSome': { en: "Reduce Exposure", hi: "कुछ जोखिम कम करें", ta: "சிலவற்றை விற்கவும்" },
  'ra.hold': { en: "Hold Steadfast", hi: "बने रहें", ta: "பொறுமையாக இருக்கவும்" },
  'ra.investMore': { en: "Buy the Dip", hi: "और निवेश करें", ta: "மேலும் முதலீடு செய்ய" },
  'ra.new': { en: "Beginner", hi: "शुरुआती", ta: "தொடக்க நிலை" },
  'ra.some': { en: "Intermediate (FDs/MFs)", hi: "मध्यम अनुभव", ta: "மிதமான அனுபவம்" },
  'ra.experienced': { en: "Advanced (Stocks/FNO)", hi: "अनुभवी", ta: "அனுபவமுள்ளவர்" },

  // Plan
  'plan.header': { en: "Tailored Asset Allocation Plan", hi: "अनुकूलित परिसंपत्ति आवंटन योजना", ta: "தனிப்பயனாக்கப்பட்ட ஒதுக்கீட்டு திட்டம்" },
  'plan.profile': { en: "Investor Profile", hi: "प्रोफ़ाइल", ta: "சுயவிவரம்" },
  'plan.surplus': { en: "Monthly Surplus", hi: "मासिक अधिशेष", ta: "மாதாந்திர உபரி" },
  'plan.suitable': { en: "SEBI Compliant — Fully Suitable", hi: "SEBI अनुपालन — पूर्णतः उपयुक्त", ta: "SEBI இணக்கம் — முற்றிலும் பொருத்தமானது" },
  'plan.caution': { en: "Capped Allocation — Risk Caution", hi: "सीमित आवंटन — सावधानी", ta: "வரையறுக்கப்பட்ட ஒதுக்கீடு — எச்சரிக்கை" },
  'plan.notSuitable': { en: "Excluded — Mismatches Risk Rating", hi: "बाहर — जोखिम मेल नहीं खाता", ta: "விலக்கப்பட்டது — இடர் பொருந்தவில்லை" },
  'plan.allocation': { en: "Recommended Product Basket", hi: "अनुशंसित उत्पाद बास्केट", ta: "பரிந்துரைக்கப்பட்ட தயாரிப்புகள்" },
  'plan.whyThis': { en: "Explain Algorithmic Rationale", hi: "अल्गोरिदम तर्क देखें", ta: "காரணத்தை விளக்குக" },
  'plan.advisory': { en: "Advisory Mode: Rule-Based Deterministic Matching Engine", hi: "सलाहकार मोड: नियम-आधारित इंजन", ta: "ஆலோசனை முறை: விதிகள் அடிப்படையிலான இயந்திரம்" },
  'plan.execution': { en: "Execution Mode: User Initiated Direct Order Placement", hi: "कार्यान्वयन मोड: उपयोगकर्ता द्वारा आदेश", ta: "செயல்படுத்தல் முறை: பயனர் நேரடி ஆணை" },
  'plan.goalView': { en: "Retirement Target Mapping", hi: "सेवानिवृत्ति लक्ष्य मैपिंग", ta: "ஓய்வூதிய இலக்கு வரைபடம்" },
  'plan.consent': { en: "I authorize IDBI Arth AI to log this allocation intent into my auditable compliance trail.", hi: "मैं इस योजना को मेरे ऑडिट ट्रेल में लॉग करने के लिए अधिकृत करता/करती हूँ।", ta: "இந்த திட்டத்தை எனது தணிக்கைப் பாதையில் பதிவு செய்ய அங்கீகரிக்கிறேன்." },

  // Arth AI chat
  'arthai.compliance': { en: "IDBI AI Core v2.4 · RBI & SEBI Sandbox Verified", hi: "IDBI AI कोर v2.4 · सत्यापन किया गया", ta: "IDBI AI கோர் v2.4 · சரிபார்க்கப்பட்டது" },
  'arthai.humanLink': { en: "Book Priority Appointment with IDBI Wealth Expert", hi: "IDBI वेल्थ विशेषज्ञ से मिलें", ta: "IDBI நிபுணருடன் சந்திப்பை முன்பதிவு செய்ய" },
  'arthai.typePlaceholder': { en: "Ask Arth AI about tax, SIPs, returns, risk...", hi: "Arth AI से कर, SIP, रिटर्न के बारे में पूछें...", ta: "வரி, SIP, வருமானம் பற்றி Arth AI இடம் கேளுங்கள்..." },

  // Suggested prompts
  'prompt.investSurplus': { en: "How should I allocate my ₹28,000 surplus?", hi: "मेरे ₹28,000 अधिशेष को कैसे आवंटित करें?", ta: "எனது ₹28,000 உபரியை எவ்வாறு ஒதுக்குவது?" },
  'prompt.retirement': { en: "Show retirement gap & SIP target", hi: "सेवानिवृत्ति अंतर और एसआईपी लक्ष्य दिखाएं", ta: "ஓய்வூதிய இடைவெளி மற்றும் SIP இலக்கைக் காட்டு" },
  'prompt.explainMF': { en: "Explain Mutual Funds vs Fixed Deposits", hi: "म्यूचुअल फंड बनाम फिक्स्ड डिपॉजिट समझें", ta: "பரஸ்பர நிதி vs நிலையான டெபாசிட் விளக்குக" },
  'prompt.marketTiming': { en: "Should I start SIP now or wait?", hi: "क्या मुझे अभी SIP शुरू करनी चाहिए?", ta: "நான் இப்போது SIP தொடங்க வேண்டுமா?" },
  'prompt.lowRisk': { en: "Show IDBI guaranteed return products", hi: "IDBI गारंटीकृत रिटर्न उत्पाद दिखाएं", ta: "IDBI உத்தரவாத வருமான தயாரிப்புகளைக் காட்டு" },

  // Activity
  'activity.title': { en: "Regulatory Compliance Audit Log", hi: "नियामक अनुपालन ऑडिट लॉग", ta: "ஒழுங்குமுறை இணக்க தணிக்கை பாதை" },
  'activity.compliance': { en: "SEBI & RBI Compliance Matrix", hi: "अनुपालन मैट्रिक्स", ta: "இணக்க அணிவரிசை" },
  'activity.riskDone': { en: "Risk Profiling Verified", hi: "जोखिम प्रोफ़ाइल सत्यापित", ta: "இடர் சுயவிவரம் சரிபார்க்கப்பட்டது" },
  'activity.consentDone': { en: "Digital Consent Signed", hi: "डिजिटल सहमति हस्ताक्षरित", ta: "டிஜிட்டல் ஒப்புதல் கையொப்பமிடப்பட்டது" },
  'activity.suitability': { en: "Suitability Engine Active", hi: "उपयुक्तता इंजन सक्रिय", ta: "பொருத்த இயந்திரம் செயலில் உள்ளது" },
  'activity.disclosures': { en: "Mandatory Disclosures Rendered", hi: "अनिवार्य प्रकटीकरण प्रदर्शित", ta: "கட்டாய வெளிப்படுத்தல்கள் காட்டப்பட்டன" },
  'activity.auditTrail': { en: "Immutable Cryptographic Hash Trail", hi: "ऑडिट ट्रेल सुरक्षित", ta: "மாற்ற முடியாத தணிக்கைப் பாதை" },
  'activity.humanLoop': { en: "Human Advisor Override Available", hi: "मानव सलाहकार विकल्प उपलब्ध", ta: "மனித ஆலோசகர் விருப்பம் உள்ளது" },

  // Profile
  'profile.title': { en: "IDBI Customer & Wealth Profile", hi: "IDBI ग्राहक और संपत्ति प्रोफ़ाइल", ta: "IDBI வாடிக்கையாளர் சுயவிவரம்" },
  'profile.aiDisclosure': {
    en: "Arth AI Wealth Advisor operates within the strict guidelines of SEBI Investment Adviser Regulations. It delivers objective, deterministic recommendations derived directly from customer cash flows and validated risk assessments. No algorithmic biases or non-compliant product pushing are permitted.",
    hi: "दिशा वेल्थ एडवाइजर SEBI के सख्त दिशा-निर्देशों के तहत काम करता है। यह वस्तुनिष्ठ और नियम-आधारित सिफारिशें प्रदान करता है।",
    ta: "திசா வெல்த் அட்வைசர் SEBI இன் கடுமையான வழிகாட்டுதல்களின் கீழ் செயல்படுகிறது. இது புறநிலை மற்றும் விதிகள் அடிப்படையிலான பரிந்துரைகளை வழங்குகிறது."
  },
  'profile.language': { en: "Interface Language", hi: "इंटरफ़ेस भाषा", ta: "இடைமுக மொழி" },

  // General
  'general.disclosure': {
    en: "Disclaimers: Investment products are subject to market risks. Past performance is no guarantee of future returns. IDBI Bank acts as an advisory portal and does not execute transactions directly without customer consent.",
    hi: "अस्वीकरण: निवेश उत्पाद बाज़ार जोखिमों के अधीन हैं। पिछला प्रदर्शन भविष्य के रिटर्न की गारंटी नहीं है।",
    ta: "மறுப்பு: முதலீட்டு தயாரிப்புகள் சந்தை அபாயங்களுக்கு உட்பட்டவை. முந்தைய செயல்பாடு எதிர்கால வருமானத்திற்கு உத்தரவாதமல்ல."
  },
  'humanConfirm': {
    en: "Priority appointment booked! An IDBI Certified Wealth Manager will call you within 2 hours.",
    hi: "सफलतापूर्वक अपॉइंटमेंट बुक किया गया! IDBI वेल्थ मैनेजर जल्द ही कॉल करेगा।",
    ta: "முன்னுரிமை சந்திப்பு பதிவு செய்யப்பட்டது! IDBI மேலாளர் விரைவில் தொடர்பு கொள்வார்."
  },

  // Goal names
  'goal.Retirement': { en: "Retirement Corpus (₹3 Cr)", hi: "सेवानिवृत्ति कोष (₹3 करोड़)", ta: "ஓய்வூதிய நிதி (₹3 கோடி)" },
  'goal.Emergency Fund': { en: "6-Mo Emergency Buffer", hi: "6 महीने का आपातकालीन बफ़र", ta: "6 மாத அவசர நிதி" },
  'goal.Home Down Payment': { en: "Home Down Payment (₹15L)", hi: "घर डाउन पेमेंट (₹15 लाख)", ta: "வீடு முன்பணம் (₹15 லட்சம்)" },

  // Statuses
  'status.Behind': { en: "Gap Identified", hi: "अंतर मिला", ta: "இடைவெளி கண்டறியப்பட்டது" },
  'status.Building': { en: "In Progress", hi: "प्रगति में", ta: "செயல்பாட்டில் உள்ளது" },
  'status.On track': { en: "On Track", hi: "सही राह पर", ta: "சரியான பாதையில்" },

  // Categories
  'cat.Rent': { en: "Housing & Rent", hi: "किराया और आवास", ta: "வீட்டு வாடகை" },
  'cat.Groceries': { en: "Groceries & Supplies", hi: "किराना सामान", ta: "மளிகைப் பொருட்கள்" },
  'cat.Dining': { en: "Dining & Food Delivery", hi: "भोजन और ज़ोमैटो", ta: "உணவகம் மற்றும் உணவு" },
  'cat.Transport': { en: "Transport & Fuel", hi: "यात्रा और ईंधन", ta: "போக்குவரத்து & எரியaccess" },
  'cat.Shopping': { en: "Shopping & E-Commerce", hi: "खरीदारी", ta: "ஷாப்பிங்" },
  'cat.Bills': { en: "Utilities & Bills", hi: "उपयोगिता और बिल", ta: "பயன்பாட்டு கட்டணங்கள்" },
  'cat.Subscriptions': { en: "Digital Subscriptions", hi: "डिजिटल सदस्यता", ta: "டிஜிட்டல் சந்தாக்கள்" },
  'cat.Misc': { en: "Healthcare & Misc", hi: "स्वास्थ्य और विविध", ta: "சுகாதாரம் & இதர" },
};

export function t(key: string, lang: string): string {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
}

export default translations;
