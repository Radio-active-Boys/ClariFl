require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const PREMIUM_AMOUNT = 99;          // ₹99
const PREMIUM_AMOUNT_PAISE = PREMIUM_AMOUNT * 100;  // Razorpay expects paise

app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Razorpay ────────────────────────────────────────────────────────────────
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_LIVE_KEY_ID,
  key_secret: process.env.RAZORPAY_LIVE_KEY_SECRET,
});

// ─── User Storage ────────────────────────────────────────────────────────────
const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { return {}; }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ─── Email Transporter ───────────────────────────────────────────────────────
const smtpConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
} : {
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 25,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
  tls: {
    rejectUnauthorized: false
  }
};

const transporter = nodemailer.createTransport(smtpConfig);

// ─── Auth Routes ─────────────────────────────────────────────────────────────

// POST /api/register — register or re-send verification
app.post('/api/register', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email required' });

  const users = readUsers();

  // Already verified — just return user
  if (users[email] && users[email].verified) {
    const { name: n, tier, verified } = users[email];
    return res.json({ success: true, user: { name: n, email, tier, verified }, alreadyVerified: true });
  }

  const token = crypto.randomBytes(32).toString('hex');
  users[email] = {
    name,
    email,
    tier: users[email]?.tier || 'free',
    verified: false,
    verificationToken: token,
    createdAt: users[email]?.createdAt || new Date().toISOString(),
  };
  writeUsers(users);

  // Respond immediately — don't block on email
  res.json({ success: true, message: 'Verification email sent', user: { name, email, tier: users[email].tier, verified: false } });

  // Send email in background
  const verifyUrl = `http://localhost:${PORT}/api/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  transporter.sendMail({
    from: `"ClariFi" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your ClariFi account',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:16px">
        <div style="text-align:center;margin-bottom:24px">
          <span style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#4F46E5,#06B6D4);-webkit-background-clip:text;color:transparent">ClariFi</span>
        </div>
        <h2 style="color:#111827;font-size:20px">Welcome, ${name}!</h2>
        <p style="color:#6B7280">Click the button below to verify your email address and activate your ClariFi account.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${verifyUrl}" style="background:linear-gradient(135deg,#4F46E5,#06B6D4);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px">
            Verify My Email
          </a>
        </div>
        <p style="color:#9CA3AF;font-size:12px;text-align:center">This link expires in 24 hours. If you didn't sign up for ClariFi, ignore this email.</p>
      </div>
    `,
  }).then(() => {
    console.log(`Verification email sent to ${email}`);
  }).catch((err) => {
    console.error(`Email to ${email} failed:`, err.message);
  });
});

// GET /api/verify-email — called from email link
app.get('/api/verify-email', (req, res) => {
  const { token, email } = req.query;
  const users = readUsers();

  if (!users[email] || users[email].verificationToken !== token) {
    return res.status(400).send(`
      <html><body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f9fafb">
        <div style="text-align:center;padding:32px;background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
          <div style="font-size:48px;margin-bottom:16px">❌</div>
          <h2 style="color:#EF4444">Invalid or expired link</h2>
          <p style="color:#6B7280">Please request a new verification email from ClariFi.</p>
        </div>
      </body></html>
    `);
  }

  users[email].verified = true;
  users[email].verificationToken = null;
  writeUsers(users);

  res.send(`
    <html><body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f9fafb">
      <div style="text-align:center;padding:32px;background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="font-size:48px;margin-bottom:16px">✅</div>
        <h2 style="color:#10B981">Email Verified!</h2>
        <p style="color:#6B7280">Your ClariFi account is now active. You can close this tab and return to the app.</p>
        <p style="margin-top:16px;font-weight:600;background:linear-gradient(135deg,#4F46E5,#06B6D4);-webkit-background-clip:text;color:transparent;font-size:20px">ClariFi</p>
      </div>
    </body></html>
  `);
});

// GET /api/user/:email — fetch user info
app.get('/api/user/:email', (req, res) => {
  const users = readUsers();
  const user = users[decodeURIComponent(req.params.email)];
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  const { name, email, tier, verified, payment } = user;
  res.json({ success: true, user: { name, email, tier, verified, payment: payment || false } });
});



// ─── AI Routes ───────────────────────────────────────────────────────────────

function extractJSON(text) {
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[0]);
}

app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { income, liabilities, savings, schoolType, universityType, context, childAge, childName } = req.body;

    const surplus = Number(income) - Number(liabilities || 0) - Number(savings);

    const prompt = `You are ClariFi, an expert AI financial advisor specializing in Indian education planning. Analyze the following financial profile and generate a comprehensive education financial roadmap.

FINANCIAL PROFILE:
- Monthly Net Income: ₹${Number(income).toLocaleString('en-IN')}
- Monthly Liabilities/EMIs: ₹${Number(liabilities || 0).toLocaleString('en-IN')}
- Monthly Savings: ₹${Number(savings).toLocaleString('en-IN')}
- Monthly Surplus: ₹${surplus.toLocaleString('en-IN')}

CHILD DETAILS:
- Child's Name: ${childName}
- Child's Current Age: ${childAge} years old
- School Type: ${schoolType}
- University Type: ${universityType}

FAMILY CONTEXT:
${context || 'No additional context provided.'}

Based on this information, create a detailed, actionable financial roadmap. Consider:
1. Current education inflation in India (school fees: ~10-12% per year, higher education: ~8-10% per year)
2. Typical costs for the selected school and university types in India
3. Investment options available to Indian parents (PPF, SIP/Mutual Funds, NPS, FD, SSY, ELSS)
4. The child's current age and years remaining until each education milestone
5. The family's actual financial capacity and realistic recommendations

IMPORTANT: Return ONLY a valid JSON object with NO markdown formatting, NO code blocks, NO extra text. Just the raw JSON.

The JSON must have these exact keys:
{
  "healthScore": <number 1-100 representing overall financial health for education goal>,
  "healthLabel": <"Excellent" | "Good" | "Fair" | "Needs Attention">,
  "summary": <string: 2-3 sentence overview of the financial situation and education readiness>,
  "monthlyBreakdown": {
    "income": <number>,
    "liabilities": <number>,
    "currentSavings": <number>,
    "surplus": <number>,
    "recommendedEducationInvestment": <number: realistic monthly amount to invest for education>
  },
  "educationCosts": {
    "school": {
      "type": <string: school type>,
      "currentAnnualCost": <number: estimated current annual cost in INR>,
      "yearsRemaining": <number: years until child finishes school at 18>,
      "totalCost": <number: inflation-adjusted total school cost>
    },
    "university": {
      "type": <string: university type>,
      "estimatedAnnualCost": <number: estimated annual cost at time of admission in INR>,
      "duration": <number: typically 4 years>,
      "totalCost": <number: total university cost>,
      "childAgeAtStart": 18
    },
    "totalEducationCost": <number: combined total>
  },
  "projections": {
    "currentSavingsProjectionAtUniversity": <number: what current savings rate will grow to by university age>,
    "fundingGap": <number: difference between total cost and projected savings>,
    "gapCoverable": <boolean: whether the gap is manageable with recommended investment>
  },
  "milestones": [
    {
      "year": <number: calendar year>,
      "childAge": <number>,
      "milestone": <string: what happens>,
      "targetAmount": <number: savings target for this milestone>,
      "action": <string: what to do>,
      "type": <"savings" | "investment" | "education" | "critical">
    }
  ],
  "investmentStrategy": [
    {
      "instrument": <string: investment name>,
      "monthlyAmount": <number>,
      "expectedReturn": <string: e.g., "12-15% p.a.">,
      "rationale": <string: why this instrument>
    }
  ],
  "risks": [<string: risk 1>, <string: risk 2>, <string: risk 3>],
  "nextSteps": [<string: action 1>, <string: action 2>, <string: action 3>],
  "motivationalMessage": <string: inspiring, personalized message for the parent>
}

Generate at least 5-7 milestones spanning from now until university completion. Make all numbers realistic for Indian context in 2024-2025.`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });

    let textContent = '';
    for (const block of response.content) {
      if (block.type === 'text') textContent += block.text;
    }

    const data = extractJSON(textContent);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/analyze-expense', async (req, res) => {
  try {
    const { expenseName, expenseAmount, financialData, roadmapData } = req.body;

    const monthlyEducationInvestment = roadmapData?.monthlyBreakdown?.recommendedEducationInvestment || 0;
    const annualEducationSavings = monthlyEducationInvestment * 12;
    const fundingGap = roadmapData?.projections?.fundingGap || 0;
    const totalEducationCost = roadmapData?.educationCosts?.totalEducationCost || 0;

    const prompt = `You are ClariFi, an expert AI financial advisor. Analyze the impact of a major expense on this family's education savings plan.

EXPENSE BEING CONSIDERED:
- Expense Name: ${expenseName}
- Expense Amount: ₹${Number(expenseAmount).toLocaleString('en-IN')}

CURRENT FINANCIAL PROFILE:
- Monthly Net Income: ₹${Number(financialData.income).toLocaleString('en-IN')}
- Monthly Liabilities: ₹${Number(financialData.liabilities || 0).toLocaleString('en-IN')}
- Monthly Savings: ₹${Number(financialData.savings).toLocaleString('en-IN')}

EDUCATION ROADMAP CONTEXT:
- Recommended Monthly Education Investment: ₹${monthlyEducationInvestment.toLocaleString('en-IN')}
- Annual Education Savings Target: ₹${annualEducationSavings.toLocaleString('en-IN')}
- Total Education Funding Gap: ₹${fundingGap.toLocaleString('en-IN')}
- Total Education Cost: ₹${totalEducationCost.toLocaleString('en-IN')}

Analyze whether this expense is wise given the education financial goals. Be empathetic but honest. Consider Indian consumer context.

IMPORTANT: Return ONLY a valid JSON object with NO markdown formatting, NO code blocks, NO extra text.

{
  "verdict": <"proceed" | "caution" | "avoid">,
  "verdictLabel": <string: e.g., "Go Ahead!", "Think Twice", "Strongly Reconsider">,
  "verdictColor": <"green" | "yellow" | "red">,
  "impactScore": <number 1-10: severity of impact, 1=minimal, 10=devastating>,
  "immediateImpact": <string: what happens immediately to the education savings plan>,
  "goalDelay": <number: estimated months of delay to education goal>,
  "goalDelayText": <string: human readable e.g., "2 months" or "No delay">,
  "savingsSetback": <number: total amount of education corpus lost considering opportunity cost>,
  "percentOfAnnualSavings": <number: what % of annual education savings this expense represents>,
  "alternatives": [
    {
      "option": <string: alternative approach>,
      "saving": <number: how much this alternative saves>,
      "tradeoff": <string: what you give up>
    }
  ],
  "smarterApproach": <string: the recommended way to handle this if they must spend>,
  "emotionalContext": <string: empathetic acknowledgment of why they want this>,
  "recommendation": <string: clear, actionable recommendation>,
  "silverLining": <string: positive spin or encouraging message>
}`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    let textContent = '';
    for (const block of response.content) {
      if (block.type === 'text') textContent += block.text;
    }

    const data = extractJSON(textContent);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error analyzing expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/upgrade — mark user as premium (call after payment success)
app.post('/api/upgrade', (req, res) => {
  const { email } = req.body;
  const users = readUsers();
  if (!users[email]) return res.status(404).json({ success: false, error: 'User not found' });
  users[email].tier = 'premium';
  writeUsers(users);
  res.json({ success: true, user: { name: users[email].name, email, tier: 'premium', verified: users[email].verified } });
});

// ─── Payment Routes ──────────────────────────────────────────────────────────



// POST /api/create-order — create a Razorpay order for premium upgrade
app.post('/api/create-order', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    const users = readUsers();
    if (!users[email]) return res.status(404).json({ success: false, error: 'User not found' });

    // Already paid — no need to create another order
    if (users[email].payment) {
      return res.json({ success: false, error: 'Already a premium user' });
    }

    const order = await razorpay.orders.create({
      amount: PREMIUM_AMOUNT_PAISE,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { email, purpose: 'ClariFi Premium Upgrade' },
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_LIVE_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/verify-payment — verify Razorpay signature and mark user as paid
app.post('/api/verify-payment', (req, res) => {
  try {
    const { email, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!email || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing required payment fields' });
    }

    // Verify signature: HMAC SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_LIVE_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Signature valid — mark user as paid
    const users = readUsers();
    if (!users[email]) return res.status(404).json({ success: false, error: 'User not found' });

    users[email].payment = true;
    users[email].tier = 'premium';
    users[email].paymentId = razorpay_payment_id;
    users[email].paidAt = new Date().toISOString();
    writeUsers(users);

    const { name, tier, verified, payment } = users[email];
    res.json({
      success: true,
      message: 'Payment verified successfully',
      user: { name, email, tier, verified, payment },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`ClariFi backend running on http://localhost:${PORT}`);
});

// Catch-all route for React client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
