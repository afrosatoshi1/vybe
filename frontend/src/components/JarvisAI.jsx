import { useState, useEffect, useRef, useCallback } from 'react'
import { BASE, BASE_LIGHT, BASE_DARK, SHADOW_D, neu } from '../design.js'
import { NeuBtn } from './UI.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ── Context tracker — every user action flows through here ────────
export const jarvisContext = {
  screen: 'home',
  bpm: 120,
  activePattern: null,
  genre: null,
  mood: null,
  recentActions: [],
  xp: 0,
  level: 'Sound Rookie',
  beatSteps: 0,
  djMixing: false,
  timeOnScreen: {},
  preferences: {},

  update(patch) {
    Object.assign(this, patch)
    this.recentActions = [...(this.recentActions || []).slice(-9), `${Date.now()}:${patch.action||''}`]
  },

  getSummary() {
    return `User is on: ${this.screen}. Mood: ${this.mood}. BPM: ${this.bpm}. Level: ${this.level} (${this.xp} XP). Recent: ${this.recentActions.slice(-4).join(', ')}. Genre preference: ${this.genre || 'not set'}. Beat complexity: ${this.beatSteps} active steps.`
  }
}

// ── AI call via backend ───────────────────────────────────────────
async function askJarvis(messages) {
  try {
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        context: jarvisContext.getSummary(),
      }),
    })
    const data = await res.json()
    return data.reply || '...'
  } catch {
    return "I'm connecting... try again in a sec 🔄"
  }
}

// ── Proactive tip generator ───────────────────────────────────────
const PROACTIVE_PROMPTS = {
  beat: [
    "Analyze my beat and tell me what's missing",
    "What genre does my current pattern sound like?",
    "How can I make this more interesting?",
  ],
  mix: [
    "Suggest a smooth transition for what I'm doing",
    "What FX should I add right now?",
    "How do I blend these two genres better?",
  ],
  discover: [
    "Based on my mood, what should I listen to?",
    "Suggest an artist similar to what I've been exploring",
  ],
  home: [
    "What should I work on to level up fastest?",
    "Give me a music challenge for today",
    "What feature should I try next?",
  ],
}

// ── JARVIS Component ──────────────────────────────────────────────
export default function JarvisAI({ accentColor, screen, userName }) {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [proactiveTip, setTip]    = useState('')
  const [showTip, setShowTip]     = useState(false)
  const [isTyping, setIsTyping]   = useState(false)
  const [pulseOrb, setPulseOrb]   = useState(false)
  const messagesEndRef = useRef(null)
  const tipTimer = useRef(null)
  const pulseTimer = useRef(null)

  // Greet on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = `Hey ${userName || 'producer'}! I'm JARVIS — your personal AI music co-pilot. I'm watching what you do and I'm here to make you sound better. What do you need?`
      setMessages([{ role: 'assistant', content: greeting }])
    }
  }, [open])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Proactive tips — fire every 45s based on current screen
  useEffect(() => {
    clearInterval(tipTimer.current)
    tipTimer.current = setInterval(async () => {
      const prompts = PROACTIVE_PROMPTS[screen] || PROACTIVE_PROMPTS.home
      const prompt  = prompts[Math.floor(Math.random() * prompts.length)]
      const tip = await askJarvis([{
        role: 'user',
        content: `${jarvisContext.getSummary()} — Give me one super quick (1 sentence max) unsolicited tip based on what I'm doing. Be like JARVIS from Iron Man.`,
      }])
      setTip(tip)
      setShowTip(true)
      setPulseOrb(true)
      setTimeout(() => setShowTip(false), 8000)
      setTimeout(() => setPulseOrb(false), 3000)
    }, 45000)
    return () => clearInterval(tipTimer.current)
  }, [screen])

  // Orb breathe pulse
  useEffect(() => {
    pulseTimer.current = setInterval(() => setPulseOrb(p => !p), 3000)
    return () => clearInterval(pulseTimer.current)
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMsgs = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMsgs)
    setLoading(true)
    setIsTyping(true)

    const reply = await askJarvis(newMsgs)
    setIsTyping(false)
    setLoading(false)
    setMessages([...newMsgs, { role: 'assistant', content: reply }])
  }, [input, loading, messages])

  const quickAsk = async (prompt) => {
    const newMsgs = [...messages, { role: 'user', content: prompt }]
    setMessages(newMsgs)
    setLoading(true)
    setIsTyping(true)
    const reply = await askJarvis(newMsgs)
    setIsTyping(false)
    setLoading(false)
    setMessages([...newMsgs, { role: 'assistant', content: reply }])
  }

  const prompts = PROACTIVE_PROMPTS[screen] || PROACTIVE_PROMPTS.home

  return (
    <>
      {/* Proactive tip bubble */}
      {showTip && !open && (
        <div onClick={() => setOpen(true)} style={{
          position: 'fixed', bottom: 100, right: 20, zIndex: 999,
          maxWidth: 260, padding: '12px 16px', borderRadius: 16,
          background: BASE_LIGHT, border: `1px solid ${accentColor}55`,
          boxShadow: `8px 8px 20px ${SHADOW_D}, 0 0 20px ${accentColor}33`,
          color: '#ffffffcc', fontSize: 12, lineHeight: 1.5, cursor: 'pointer',
          animation: 'slideIn 0.4s ease',
        }}>
          <span style={{ color: accentColor, fontFamily:"'Orbitron',monospace", fontSize:9, display:'block', marginBottom:4 }}>🤖 JARVIS</span>
          {proactiveTip}
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 84, right: 16, zIndex: 998,
          width: 320, height: 440,
          background: BASE_LIGHT,
          borderRadius: 20,
          border: `1px solid ${accentColor}33`,
          boxShadow: `8px 8px 24px ${SHADOW_D}, 0 0 40px ${accentColor}22`,
          display: 'flex', flexDirection: 'column',
          animation: 'fadeUp 0.3s ease',
        }}>
          {/* Header */}
          <div style={{ padding:'14px 16px', borderBottom:`1px solid ${accentColor}22`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:BASE_DARK, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 12px ${accentColor}`, fontSize:16 }}>🤖</div>
              <div>
                <div style={{ color:accentColor, fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700 }}>JARVIS</div>
                <div style={{ color:'#ffffff44', fontSize:9, fontFamily:"'Orbitron',monospace" }}>AI CO-PILOT · ONLINE</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color:'#ffffff44', background:'none', border:'none', fontSize:18, cursor:'pointer' }}>×</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:'85%', padding:'8px 12px', borderRadius:12, fontSize:12, lineHeight:1.5,
                  background: m.role === 'user' ? `${accentColor}22` : BASE_DARK,
                  color: m.role === 'user' ? accentColor : '#ffffffcc',
                  border: `1px solid ${m.role === 'user' ? accentColor+'44' : '#ffffff10'}`,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display:'flex', gap:6, alignItems:'center', padding:'4px 12px' }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:accentColor, animation:`pulse 1s ${i*0.2}s infinite` }}/>)}
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Quick prompts */}
          <div style={{ padding:'0 12px 8px', display:'flex', flexWrap:'wrap', gap:6 }}>
            {prompts.slice(0,2).map(p => (
              <button key={p} onClick={() => quickAsk(p)}
                style={{ padding:'4px 10px', borderRadius:8, fontSize:9, cursor:'pointer', background:BASE_DARK, border:`1px solid ${accentColor}33`, color:accentColor, fontFamily:"'Orbitron',monospace", letterSpacing:'0.05em' }}>
                {p.slice(0,28)}…
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'8px 12px 14px', display:'flex', gap:8 }}>
            <div style={{ flex:1, background:BASE_DARK, borderRadius:10, boxShadow:`inset 3px 3px 8px ${SHADOW_D}` }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask JARVIS anything..."
                style={{ width:'100%', background:'transparent', border:'none', outline:'none', padding:'8px 12px', color:'#fff', caretColor:accentColor, fontSize:12 }}/>
            </div>
            <NeuBtn small color={accentColor} onClick={sendMessage} disabled={loading}>→</NeuBtn>
          </div>
        </div>
      )}

      {/* Floating orb */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 999,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: BASE_LIGHT,
          boxShadow: pulseOrb
            ? `6px 6px 16px ${SHADOW_D}, -4px -4px 12px ${SHADOW_L}, 0 0 30px ${accentColor}88`
            : `6px 6px 16px ${SHADOW_D}, -4px -4px 12px ${SHADOW_L}, 0 0 16px ${accentColor}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, transition: 'box-shadow 1.5s ease',
        }}>
        {open ? '×' : '🤖'}
      </button>
    </>
  )
}
