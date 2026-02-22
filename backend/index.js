import express  from 'express'
import cors     from 'cors'
import Groq     from 'groq-sdk'

const app  = express()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}))
app.use(express.json())

// ── JARVIS System Prompt ──────────────────────────────────────────
const JARVIS_SYSTEM = `You are JARVIS — VYBE's AI music co-pilot, inspired by Iron Man's AI assistant. You are:
- A world-class music producer, DJ, and creative collaborator
- Always aware of what the user is doing in the app (context is provided)
- Proactive, punchy, and inspiring — like having a genius music mentor in your ear
- Specific and actionable — never vague
- Brief unless asked for detail (max 3-4 sentences by default)
- You use music terminology naturally and correctly
- You speak with confidence and energy
Keep responses concise and impactful. Be like Tony Stark's AI — smart, fast, always helpful.`

// ── Helper: call Groq ─────────────────────────────────────────────
async function callGroq(messages, system = JARVIS_SYSTEM, maxTokens = 400) {
  const completion = await groq.chat.completions.create({
    model:       'llama3-70b-8192',
    max_tokens:  maxTokens,
    messages: [
      { role: 'system', content: system },
      ...messages,
    ],
  })
  return completion.choices[0]?.message?.content || '...'
}

// ── Routes ────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => res.json({ status: 'VYBE Backend Online', version: '1.0.0' }))

// General AI chat (JARVIS)
app.post('/ai/chat', async (req, res) => {
  try {
    const { messages, context } = req.body
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages required' })

    const systemWithCtx = context
      ? `${JARVIS_SYSTEM}\n\nCURRENT USER CONTEXT: ${context}`
      : JARVIS_SYSTEM

    const reply = await callGroq(messages, systemWithCtx)
    res.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ reply: 'JARVIS is processing... try again in a moment.' })
  }
})

// Beat analysis tip
app.post('/ai/beat-tip', async (req, res) => {
  try {
    const { bpm, pattern, context } = req.body
    const systemWithCtx = context
      ? `${JARVIS_SYSTEM}\n\nUSER CONTEXT: ${context}`
      : JARVIS_SYSTEM

    const reply = await callGroq([{
      role: 'user',
      content: `I'm making a beat at ${bpm} BPM. Current pattern: ${JSON.stringify(pattern)}. Give me 2-3 specific, actionable suggestions to make it hit harder. Be specific about which tracks and step numbers.`,
    }], systemWithCtx)

    res.json({ reply })
  } catch (err) {
    console.error('Beat tip error:', err)
    res.status(500).json({ reply: 'Analyzing your beat... try again.' })
  }
})

// Artist DNA analysis
app.post('/ai/artist-dna', async (req, res) => {
  try {
    const { artist, context } = req.body
    if (!artist) return res.status(400).json({ error: 'artist required' })

    const reply = await callGroq([{
      role: 'user',
      content: `Analyze the complete musical DNA of "${artist}". Return ONLY valid JSON (no markdown, no explanation):
{
  "bpmRange": "e.g. 90-110 BPM",
  "keySignatures": ["e.g. Dm", "Am"],
  "coreInstruments": ["e.g. 808 bass", "trap hi-hats", "melodic synths"],
  "signatureElements": ["e.g. melodic autotune", "ad-libs", "heavy 808s"],
  "vibes": ["e.g. street anthem", "dark melodic"],
  "songStructure": "Intro (8 bars) → Verse (16 bars) → Hook (8 bars) → ...",
  "influencedBy": ["Artist1", "Artist2"],
  "tipToCreate": "One specific, actionable tip to sound like this artist",
  "colorHex": "#hexcolor that represents their musical energy"
}`
    }], 'You are a music analyst AI. Return ONLY valid JSON. No markdown. No explanation.', 600)

    try {
      const cleaned = reply.replace(/```json|```/g, '').trim()
      const parsed  = JSON.parse(cleaned)
      res.json(parsed)
    } catch {
      res.status(500).json({ error: true, raw: reply })
    }
  } catch (err) {
    console.error('DNA error:', err)
    res.status(500).json({ error: true })
  }
})

// AI Song Arrangement
app.post('/ai/arrange', async (req, res) => {
  try {
    const { currentArrangement, bpm, patterns, context } = req.body

    const reply = await callGroq([{
      role: 'user',
      content: `I'm arranging a song at ${bpm} BPM. I have patterns: ${patterns.join(', ')}. Current arrangement: ${currentArrangement || 'empty'}.

Suggest a professional song arrangement for a full song (32-48 bars). Return JSON with an "arrangement" array and a "reply" string:
{
  "reply": "2-3 sentence explanation of your arrangement choice",
  "arrangement": [
    { "bar": 0, "pattern": "A", "section": "INTRO" },
    { "bar": 4, "pattern": "B", "section": "VERSE 1" },
    ...
  ]
}
Make it feel like a real song with intro, verse, pre-chorus, chorus, bridge, outro. Be specific about bar numbers.`,
    }], JARVIS_SYSTEM, 800)

    try {
      const cleaned = reply.replace(/```json|```/g, '').trim()
      const parsed  = JSON.parse(cleaned)
      res.json(parsed)
    } catch {
      res.json({ reply: reply, arrangement: null })
    }
  } catch (err) {
    console.error('Arrange error:', err)
    res.status(500).json({ reply: 'Arrangement AI offline. Try again.', arrangement: null })
  }
})

// Proactive JARVIS tip based on user context
app.post('/ai/proactive', async (req, res) => {
  try {
    const { context } = req.body

    const reply = await callGroq([{
      role: 'user',
      content: `${context} — Give me ONE super quick (1 sentence) unsolicited tip based on what I'm doing right now. Be like JARVIS — direct, smart, specific.`,
    }], JARVIS_SYSTEM, 100)

    res.json({ reply })
  } catch (err) {
    res.status(500).json({ reply: '...' })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`🎵 VYBE Backend running on port ${PORT}`))
