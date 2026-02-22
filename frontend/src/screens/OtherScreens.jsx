import { useState, useEffect, useRef } from 'react'
import { BASE, BASE_LIGHT, BASE_DARK, SHADOW_D, SHADOW_L, neu, TRACKS, BADGES_LIST, getLevel } from '../design.js'
import { NeuCard, NeuBtn, BackBtn, TabBar, XPBar } from '../components/UI.jsx'
import { jarvisContext } from '../components/JarvisAI.jsx'
import AE from '../lib/audio.js'
import { saveBeat, deleteBeat } from '../lib/supabase.js'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const PRESETS_CREATE = {
  'AFROBEATS': [[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],[1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1],[0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0],[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]],
  'TRAP':      [[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],[0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],[0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]],
  'HOUSE':     [[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0],[0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0]],
  'AMAPIANO':  [[1,0,0,0,1,0,0,1,1,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0],[1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1],[0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1],[1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,1],[0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0],[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]],
}

const EMPTY = () => Array(8).fill(null).map(() => Array(16).fill(false))

const MOOD_Q = {
  hype:  'energetic workout hype',
  happy: 'feel good vibes summer',
  chill: 'lofi chill relax',
  sad:   'emotional sad indie',
  focus: 'focus study instrumental',
  lit:   'party dance hits',
}

const MOOD_COLORS = {
  hype:  { emoji: '⚡', label: 'HYPE',  color: '#FF6B35' },
  happy: { emoji: '🌊', label: 'HAPPY', color: '#00D4FF' },
  chill: { emoji: '🌙', label: 'CHILL', color: '#A78BFA' },
  sad:   { emoji: '💧', label: 'SAD',   color: '#60A5FA' },
  focus: { emoji: '🎯', label: 'FOCUS', color: '#34D399' },
  lit:   { emoji: '🔥', label: 'LIT',   color: '#F472B6' },
}

/* ═══════════════════════════════════════════════════════════════
   CREATE WORLD
═══════════════════════════════════════════════════════════════ */
export function CreateWorld({ onBack, accentColor, onXP, onBadge, userId }) {
  const [tab, setTab]           = useState('beat')
  const [grid, setGrid]         = useState(EMPTY())
  const [playing, setPlaying]   = useState(false)
  const [activeStep, setStep]   = useState(-1)
  const [bpm, setBpm]           = useState(120)
  const [volumes, setVols]      = useState(Array(8).fill(80))
  const [muted, setMuted]       = useState(Array(8).fill(false))
  const [aiMsg, setAiMsg]       = useState('')
  const [aiLoading, setAiLoad]  = useState(false)
  const [aiChat, setChat]       = useState([])
  const [aiInput, setAiIn]      = useState('')
  const [firstPlay, setFP]      = useState(false)
  const [artist, setArtist]     = useState('')
  const [dna, setDna]           = useState(null)
  const [dnaLoad, setDnaLoad]   = useState(false)
  const [recState, setRecState] = useState('idle')
  const [recTime, setRecTime]   = useState(0)
  const [recUrl, setRecUrl]     = useState(null)
  const [waveData, setWave]     = useState(Array(20).fill(0))
  const [beatName, setBeatName] = useState('')
  const [saving, setSaving]     = useState(false)

  const mediaRec  = useRef(null)
  const recTimer  = useRef(null)
  const waveAF    = useRef(null)
  const gridRef   = useRef(grid)
  gridRef.current = grid

  const lb = { color: '#ffffff33', fontFamily: "'Orbitron',monospace", fontSize: 8, letterSpacing: '0.2em', marginBottom: 8 }

  const toggleCell = (ti, si) => {
    setGrid(prev => {
      const n = prev.map(r => [...r])
      n[ti][si] = !n[ti][si]
      jarvisContext.update({ beatSteps: n.flat().filter(Boolean).length, action: 'toggle' })
      return n
    })
  }

  const applyPreset = name => {
    const p = PRESETS_CREATE[name]
    if (!p) return
    AE.stop(); setPlaying(false); setStep(-1)
    setGrid(p.map(r => [...r]))
  }

  const handlePlay = () => {
    AE.init(); AE.bpm = bpm
    AE.volumes = volumes.map(v => v / 100)
    AE.muted   = muted
    if (playing) { AE.stop(); setPlaying(false); setStep(-1) }
    else {
      AE.start(() => gridRef.current, s => setStep(s))
      setPlaying(true)
      if (!firstPlay) { setFP(true); onXP(50); onBadge('first_beat') }
    }
  }

  const clear = () => { AE.stop(); setPlaying(false); setStep(-1); setGrid(EMPTY()) }

  const getAITip = async () => {
    setAiLoad(true)
    try {
      const active = TRACKS.map((t, i) => ({
        track: t.name,
        steps: grid[i].map((v, j) => v ? j + 1 : null).filter(Boolean),
      }))
      const res = await fetch(`${API}/ai/beat-tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bpm, pattern: active, context: jarvisContext.getSummary() }),
      })
      const d = await res.json()
      setAiMsg(d.reply || '...')
    } catch { setAiMsg('AI connecting... try again') }
    setAiLoad(false)
  }

  const sendChat = async () => {
    if (!aiInput.trim()) return
    const msg = aiInput.trim(); setAiIn('')
    const nc = [...aiChat, { role: 'user', content: msg }]; setChat(nc)
    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nc, context: jarvisContext.getSummary() }),
      })
      const d = await res.json()
      setChat([...nc, { role: 'assistant', content: d.reply || '...' }])
    } catch {
      setChat([...nc, { role: 'assistant', content: 'AI connecting...' }])
    }
  }

  const analyzeArtist = async () => {
    if (!artist.trim()) return
    setDnaLoad(true); setDna(null)
    try {
      const res = await fetch(`${API}/ai/artist-dna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist, context: jarvisContext.getSummary() }),
      })
      const d = await res.json()
      setDna(d); onXP(100); onBadge('dna_unlocked')
    } catch { setDna({ error: true }) }
    setDnaLoad(false)
  }

  const applyDNA = () => {
    if (!dna || dna.error) return
    const bMatch = dna.bpmRange?.match(/\d+/)
    if (bMatch) { const b = Math.min(180, Math.max(60, parseInt(bMatch[0]))); setBpm(b); AE.bpm = b }
    setGrid(PRESETS_CREATE.AFROBEATS.map(r => [...r]))
    setAiMsg(`🧬 ${artist} DNA applied!`); setTab('beat')
  }

  const handleSaveBeat = async () => {
    if (!userId || saving) return
    setSaving(true)
    try {
      const name = beatName.trim() || `Beat ${new Date().toLocaleDateString()}`
      await saveBeat(userId, { name, bpm, grid, genre: 'Custom' })
      setBeatName(''); setAiMsg(`✓ "${name}" saved!`)
    } catch (e) { setAiMsg('Save failed: ' + e.message) }
    setSaving(false)
  }

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = e => chunks.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setRecUrl(URL.createObjectURL(blob))
        setRecState('recorded'); onXP(30); onBadge('voice_rec')
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start(); mediaRec.current = mr; setRecState('recording'); setRecTime(0)
      recTimer.current = setInterval(() => setRecTime(t => t + 1), 1000)
      const ac2 = new (window.AudioContext || window.webkitAudioContext)()
      const src = ac2.createMediaStreamSource(stream)
      const an = ac2.createAnalyser(); an.fftSize = 64; src.connect(an)
      const tick = () => {
        const d = new Uint8Array(an.frequencyBinCount)
        an.getByteTimeDomainData(d)
        setWave(Array.from(d).slice(0, 20).map(v => (v - 128) / 128))
        waveAF.current = requestAnimationFrame(tick)
      }
      tick()
    } catch { setAiMsg('Mic access denied.') }
  }

  const stopRec = () => {
    mediaRec.current?.stop()
    clearInterval(recTimer.current)
    cancelAnimationFrame(waveAF.current)
  }

  const deleteRec = () => {
    setRecState('idle')
    if (recUrl) URL.revokeObjectURL(recUrl)
    setRecUrl(null); setWave(Array(20).fill(0)); setRecTime(0)
  }

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', paddingBottom: 80, background: BASE, fontFamily: "'Exo 2',sans-serif" }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 0' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <BackBtn onBack={() => { AE.stop(); onBack() }} color={accentColor} />
          <span style={{ color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.15em' }}>CREATE WORLD</span>
          <div style={{ width: 50 }} />
        </div>

        <TabBar tabs={[['beat', '🥁 BEAT'], ['dna', '🧬 ARTIST DNA'], ['voice', '🎤 VOICE']]} active={tab} onSelect={setTab} color={accentColor} />

        {tab === 'beat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <NeuCard color={accentColor} style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <p style={lb}>BPM</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <NeuBtn small round color={accentColor} onClick={() => setBpm(b => Math.max(60, b - 5))}>−</NeuBtn>
                    <span style={{ color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, width: 48, textAlign: 'center' }}>{bpm}</span>
                    <NeuBtn small round color={accentColor} onClick={() => setBpm(b => Math.min(200, b + 5))}>+</NeuBtn>
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <NeuBtn color={playing ? '#FF4444' : accentColor} onClick={handlePlay} small>{playing ? '■ STOP' : '▶ PLAY'}</NeuBtn>
                  <NeuBtn color="#ffffff44" onClick={clear} small>CLR</NeuBtn>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <p style={lb}>PRESETS</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {Object.keys(PRESETS_CREATE).map(p => (
                    <NeuBtn key={p} small color={accentColor} onClick={() => applyPreset(p)}>{p}</NeuBtn>
                  ))}
                </div>
              </div>
            </NeuCard>

            <NeuCard color={accentColor} style={{ padding: 16 }}>
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8, marginLeft: 64 }}>
                  {[...Array(16)].map((_, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', color: activeStep === i ? accentColor : '#ffffff22', fontFamily: "'Orbitron',monospace", fontSize: 7, fontWeight: 700, minWidth: 16 }}>
                      {i % 4 === 0 ? i / 4 + 1 : '·'}
                    </div>
                  ))}
                </div>
                {TRACKS.map((tk, ti) => (
                  <div key={tk.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 56, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => setMuted(m => { const n = [...m]; n[ti] = !n[ti]; return n })}
                        style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', background: muted[ti] ? BASE_DARK : tk.color, boxShadow: muted[ti] ? '' : neu(false, tk.color) }} />
                      <span style={{ color: muted[ti] ? '#ffffff22' : tk.color, fontFamily: "'Orbitron',monospace", fontSize: 7 }}>{tk.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2, flex: 1 }}>
                      {grid[ti].map((on, si) => {
                        const isA = activeStep === si && playing
                        const isB = si % 4 === 0
                        return (
                          <button key={si} onClick={() => toggleCell(ti, si)}
                            style={{ flex: 1, minWidth: 16, height: 24, borderRadius: 3, cursor: 'pointer', border: 'none', transition: 'all 0.07s', background: on ? (isA ? tk.color : `${tk.color}99`) : (isB ? '#ffffff0a' : '#ffffff05'), boxShadow: on && isA ? `0 0 10px ${tk.color}` : '', transform: isA && on ? 'scale(1.1)' : 'scale(1)' }} />
                        )
                      })}
                    </div>
                    <div style={{ width: 36, flexShrink: 0 }}>
                      <input type="range" min={0} max={100} value={volumes[ti]}
                        onChange={e => setVols(v => { const n = [...v]; n[ti] = +e.target.value; return n })}
                        style={{ width: '100%', accentColor: tk.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>

            <NeuCard color={accentColor} style={{ padding: 16 }}>
              <p style={lb}>SAVE BEAT</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: BASE_DARK, borderRadius: 10, boxShadow: `inset 3px 3px 8px ${SHADOW_D}` }}>
                  <input value={beatName} onChange={e => setBeatName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveBeat()}
                    placeholder="Name your beat..."
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '10px 14px', color: '#fff', caretColor: accentColor, fontSize: 13 }} />
                </div>
                <NeuBtn small color={accentColor} onClick={handleSaveBeat} disabled={saving}>{saving ? '...' : '💾 SAVE'}</NeuBtn>
              </div>
              {aiMsg && <p style={{ marginTop: 10, color: '#ffffffcc', fontSize: 12 }}>{aiMsg}</p>}
            </NeuCard>

            <NeuCard color={accentColor} style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 9 }}>🤖 AI PRODUCER</span>
                <NeuBtn small color={accentColor} onClick={getAITip} disabled={aiLoading}>{aiLoading ? 'THINKING...' : 'ANALYZE BEAT'}</NeuBtn>
              </div>
              <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {aiChat.slice(-6).map((m, i) => (
                  <div key={i} style={{ padding: '8px 12px', borderRadius: 10, background: m.role === 'user' ? `${accentColor}18` : BASE_DARK, color: m.role === 'user' ? accentColor : '#ffffffcc', fontSize: 12, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                    {m.content}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: BASE_DARK, borderRadius: 10, boxShadow: `inset 3px 3px 8px ${SHADOW_D}` }}>
                  <input value={aiInput} onChange={e => setAiIn(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Ask your AI producer..."
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '10px 14px', color: '#fff', caretColor: accentColor, fontSize: 12 }} />
                </div>
                <NeuBtn small color={accentColor} onClick={sendChat}>→</NeuBtn>
              </div>
            </NeuCard>
          </div>
        )}

        {tab === 'dna' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <NeuCard color={accentColor} style={{ padding: 20 }}>
              <p style={{ color: '#ffffff66', fontSize: 13, marginBottom: 16 }}>Enter any artist — AI decodes their full musical DNA so you can create in their style.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: BASE_DARK, borderRadius: 10, boxShadow: `inset 3px 3px 8px ${SHADOW_D}` }}>
                  <input value={artist} onChange={e => setArtist(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && analyzeArtist()}
                    placeholder="Burna Boy, Drake, SZA, Rema..."
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '12px 16px', color: '#fff', caretColor: accentColor, fontSize: 13 }} />
                </div>
                <NeuBtn color={accentColor} onClick={analyzeArtist} disabled={dnaLoad || !artist.trim()}>{dnaLoad ? 'SCANNING...' : 'ANALYZE'}</NeuBtn>
              </div>
            </NeuCard>
            {dnaLoad && (
              <NeuCard color={accentColor} style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 36, animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>🧬</div>
                <p style={{ color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 10, marginTop: 12 }}>DECODING DNA...</p>
              </NeuCard>
            )}
            {dna && !dna.error && (
              <NeuCard color={dna.colorHex || accentColor} style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ color: dna.colorHex || accentColor, fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, margin: 0 }}>🧬 {artist.toUpperCase()}</h3>
                  <NeuBtn small color={dna.colorHex || accentColor} onClick={applyDNA}>APPLY TO BEAT</NeuBtn>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[['BPM RANGE', dna.bpmRange], ['KEYS', dna.keySignatures?.join(', ')]].map(([l, v]) => (
                    <div key={l} style={{ padding: 12, borderRadius: 12, background: BASE_DARK, boxShadow: `inset 3px 3px 8px ${SHADOW_D}` }}>
                      <p style={{ ...lb, marginBottom: 4 }}>{l}</p>
                      <p style={{ color: dna.colorHex || accentColor, fontSize: 13, fontWeight: 600, margin: 0 }}>{v}</p>
                    </div>
                  ))}
                </div>
                {dna.coreInstruments && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={lb}>CORE INSTRUMENTS</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {dna.coreInstruments.map(i => <span key={i} style={{ padding: '4px 10px', borderRadius: 8, background: BASE_DARK, color: dna.colorHex || accentColor, fontSize: 11 }}>{i}</span>)}
                    </div>
                  </div>
                )}
                {dna.tipToCreate && (
                  <div style={{ padding: 14, borderRadius: 12, background: `${dna.colorHex || accentColor}15`, border: `1px solid ${dna.colorHex || accentColor}30` }}>
                    <p style={{ ...lb, marginBottom: 6 }}>💡 PRO TIP</p>
                    <p style={{ color: '#ffffffcc', fontSize: 13, margin: 0 }}>{dna.tipToCreate}</p>
                  </div>
                )}
              </NeuCard>
            )}
            {dna?.error && (
              <NeuCard color="#FF4444" style={{ padding: 16, textAlign: 'center' }}>
                <p style={{ color: '#FF4444', fontFamily: "'Orbitron',monospace", fontSize: 10, margin: 0 }}>TRY A MORE SPECIFIC ARTIST NAME</p>
              </NeuCard>
            )}
          </div>
        )}

        {tab === 'voice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <NeuCard color="#F472B6" style={{ padding: 24 }}>
              <p style={{ ...lb, marginBottom: 16 }}>VOICE RECORDER</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 20, height: 64 }}>
                {waveData.map((v, i) => (
                  <div key={i} style={{ width: 6, borderRadius: 3, height: Math.max(4, Math.abs(v) * 60 + (recState === 'idle' ? 2 : 0)), background: recState === 'recording' ? (i % 2 === 0 ? '#F472B6' : '#A78BFA') : recState === 'recorded' ? (i % 3 === 0 ? '#F472B6' : '#A78BFA55') : '#ffffff15', transition: 'height 0.05s' }} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 32, fontWeight: 900, color: recState === 'recording' ? '#F472B6' : '#ffffff44', textShadow: recState === 'recording' ? '0 0 20px #F472B6' : 'none' }}>
                  {fmtTime(recTime)}
                </span>
              </div>
              {recState === 'idle' && <div style={{ display: 'flex', justifyContent: 'center' }}><NeuBtn color="#F472B6" onClick={startRec}>🎤 START RECORDING</NeuBtn></div>}
              {recState === 'recording' && <div style={{ display: 'flex', justifyContent: 'center' }}><NeuBtn color="#FF4444" onClick={stopRec}>■ STOP</NeuBtn></div>}
              {recState === 'recorded' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <audio src={recUrl} controls style={{ width: '100%', borderRadius: 10 }} />
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <NeuBtn small color="#F472B6" onClick={startRec}>🔄 RE-RECORD</NeuBtn>
                    <NeuBtn small color="#FF4444" onClick={deleteRec}>🗑 DELETE</NeuBtn>
                    {recUrl && <a href={recUrl} download="vybe_voice.webm"><NeuBtn small color="#34D399">⬇ SAVE</NeuBtn></a>}
                  </div>
                </div>
              )}
            </NeuCard>
            <NeuCard color="#F472B6" style={{ padding: 16 }}>
              {['Stay close to mic for warmth', 'Record in a quiet room for clarity', 'Hum a melody to layer over your beat', 'Rap, sing, or make ad-libs — all valid!'].map(t => (
                <div key={t} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#F472B6', flexShrink: 0, marginTop: 2 }}>◆</span>
                  <p style={{ color: '#ffffff88', fontSize: 12, margin: 0 }}>{t}</p>
                </div>
              ))}
            </NeuCard>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DISCOVER WORLD
═══════════════════════════════════════════════════════════════ */
export function DiscoverWorld({ mood, onBack, accentColor, onXP, onBadge }) {
  const moodObj = MOOD_COLORS[mood] || MOOD_COLORS.happy

  const [tracks, setTracks]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [q, setQ]               = useState('')
  const [playingId, setPId]     = useState(null)
  const [aiRec, setAiRec]       = useState('')
  const [aiLoad, setAiLoad]     = useState(false)
  const [searched, setSearched] = useState(false)
  const audioRef = useRef(null)

  const doSearch = async (query) => {
    setLoading(true)
    try {
      const r = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query || MOOD_Q[mood] || 'top hits')}&limit=12`)
      const d = await r.json()
      setTracks(d.data || [])
      if (!searched) { setSearched(true); onXP?.(40); onBadge?.('discoverer') }
    } catch { }
    setLoading(false)
  }

  useEffect(() => { doSearch() }, [])

  const play = t => {
    if (!t.preview) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playingId === t.id) { setPId(null); return }
    const a = new Audio(t.preview)
    a.play(); audioRef.current = a; setPId(t.id)
    a.onended = () => setPId(null)
  }

  const getAIRec = async () => {
    setAiLoad(true)
    try {
      const list = tracks.slice(0, 5).map(t => `${t.title} by ${t.artist?.name}`).join(', ')
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Mood: ${moodObj.label}. Listening to: ${list}. Recommend what's next. 2 sentences.` }],
          context: jarvisContext.getSummary(),
        }),
      })
      const d = await res.json()
      setAiRec(d.reply || '...')
    } catch { }
    setAiLoad(false)
  }

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', paddingBottom: 80, background: BASE, fontFamily: "'Exo 2',sans-serif" }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <BackBtn onBack={() => { audioRef.current?.pause(); onBack() }} color={accentColor} />
          <span style={{ color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.15em' }}>DISCOVER</span>
          <div style={{ width: 50 }} />
        </div>

        <NeuCard color={moodObj.color} style={{ padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: BASE, boxShadow: neu(false, moodObj.color), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{moodObj.emoji}</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#ffffff33', fontFamily: "'Orbitron',monospace", fontSize: 7, margin: 0 }}>YOUR MOOD</p>
            <p style={{ color: moodObj.color, fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, margin: '4px 0 0' }}>{moodObj.label} PLAYLIST</p>
          </div>
          <NeuBtn small color={moodObj.color} onClick={getAIRec} disabled={aiLoad}>{aiLoad ? '...' : 'AI PICK'}</NeuBtn>
        </NeuCard>

        {aiRec && <NeuCard color={accentColor} style={{ padding: 14, marginBottom: 16 }}><p style={{ color: '#ffffffcc', fontSize: 13, lineHeight: 1.5, margin: 0 }}>🤖 {aiRec}</p></NeuCard>}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, background: BASE_LIGHT, borderRadius: 12, boxShadow: `inset 3px 3px 8px ${SHADOW_D}` }}>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch(q)}
              placeholder="Search artists, tracks, genres..."
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '12px 16px', color: '#fff', caretColor: accentColor, fontSize: 13 }} />
          </div>
          <NeuBtn color={accentColor} onClick={() => doSearch(q)}>SEARCH</NeuBtn>
        </div>

        {loading
          ? <div style={{ textAlign: 'center', padding: 40, color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 10 }}>LOADING...</div>
          : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {tracks.map(t => {
                const isP = playingId === t.id
                return (
                  <NeuCard key={t.id} color={isP ? accentColor : '#ffffff10'}
                    style={{ padding: 12, cursor: 'pointer', transition: 'all 0.2s', boxShadow: isP ? neu(false, accentColor) : neu() }}
                    onClick={() => play(t)}>
                    <div style={{ position: 'relative', marginBottom: 8, borderRadius: 10, overflow: 'hidden' }}>
                      {t.album?.cover_small
                        ? <img src={t.album.cover_small} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', aspectRatio: '1', background: BASE_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎵</div>
                      }
                      {isP && <div style={{ position: 'absolute', inset: 0, background: '#00000066', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 28 }}>⏸</span></div>}
                      {isP && <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: accentColor, animation: 'pulse 1s infinite' }} />}
                    </div>
                    <p style={{ color: isP ? accentColor : '#ffffffcc', fontSize: 12, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</p>
                    <p style={{ color: '#ffffff44', fontSize: 11, margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.artist?.name}</p>
                    {!t.preview && <p style={{ color: '#ffffff22', fontSize: 9, margin: '2px 0 0' }}>no preview</p>}
                  </NeuCard>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE SCREEN
═══════════════════════════════════════════════════════════════ */
export function ProfileScreen({ profile, onBack, accentColor }) {
  const xp     = profile?.xp || 0
  const badges = profile?.badges || []
  const lv     = getLevel(xp)

  const [aiCard, setAiCard] = useState('')
  const [aiLoad, setAiLoad] = useState(false)

  const getAI = async () => {
    setAiLoad(true)
    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Music producer "${profile?.username}" is a ${lv.name} with ${xp} XP and ${badges.length} badges in VYBE. Give them a 2-sentence hype message about their music journey.` }],
          context: jarvisContext.getSummary(),
        }),
      })
      const d = await res.json()
      setAiCard(d.reply || '...')
    } catch { setAiCard('You are legendary. Keep creating.') }
    setAiLoad(false)
  }

  return (
    <div style={{ minHeight: '100vh', overflowY: 'auto', paddingBottom: 80, background: BASE, fontFamily: "'Exo 2',sans-serif" }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 0' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <BackBtn onBack={onBack} color={accentColor} />
          <span style={{ color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.15em' }}>PROFILE</span>
          <div style={{ width: 50 }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: BASE_LIGHT, boxShadow: neu(false, accentColor), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 14px' }}>
            {lv.icon}
          </div>
          <h3 style={{ color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, letterSpacing: '0.12em', textShadow: `0 0 20px ${accentColor}`, margin: 0 }}>
            {(profile?.username || 'PRODUCER').toUpperCase()}
          </h3>
          <p style={{ color: lv.color, fontFamily: "'Orbitron',monospace", fontSize: 10, letterSpacing: '0.2em', margin: '6px 0 0' }}>{lv.name.toUpperCase()}</p>
          <p style={{ color: '#ffffff44', fontSize: 11, margin: '4px 0 0' }}>{profile?.email}</p>
        </div>

        <NeuCard color={accentColor} style={{ padding: 20, marginBottom: 16 }}>
          <XPBar xp={xp} color={accentColor} />
        </NeuCard>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { l: 'TOTAL XP', v: xp,           c: accentColor },
            { l: 'LEVEL',    v: lv.icon,       c: lv.color    },
            { l: 'RANK',     v: lv.name,       c: lv.color, sm: true },
            { l: 'BADGES',   v: badges.length, c: '#FFD700'   },
          ].map(s => (
            <NeuCard key={s.l} color={s.c} style={{ padding: 16, textAlign: 'center' }}>
              <p style={{ color: s.c, fontFamily: "'Orbitron',monospace", fontSize: s.sm ? 12 : 22, fontWeight: 700, margin: 0 }}>{s.v}</p>
              <p style={{ color: '#ffffff33', fontFamily: "'Orbitron',monospace", fontSize: 8, marginTop: 4, marginBottom: 0 }}>{s.l}</p>
            </NeuCard>
          ))}
        </div>

        <NeuCard color={accentColor} style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ color: accentColor, fontFamily: "'Orbitron',monospace", fontSize: 9 }}>🤖 AI ASSESSMENT</span>
            <NeuBtn small color={accentColor} onClick={getAI} disabled={aiLoad}>{aiLoad ? '...' : 'ANALYZE ME'}</NeuBtn>
          </div>
          {aiCard
            ? <p style={{ color: '#ffffffcc', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{aiCard}</p>
            : <p style={{ color: '#ffffff33', fontSize: 12, margin: 0 }}>Let JARVIS assess your music journey.</p>
          }
        </NeuCard>

        <NeuCard color="#FFD700" style={{ padding: 16 }}>
          <p style={{ color: '#ffffff33', fontFamily: "'Orbitron',monospace", fontSize: 8, letterSpacing: '0.2em', marginBottom: 12 }}>BADGES</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BADGES_LIST.map(b => {
              const earned = badges.includes(b.id)
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: earned ? BASE_DARK : BASE_LIGHT, boxShadow: earned ? neu(false, '#FFD700') : neu(), opacity: earned ? 1 : 0.35, transition: 'all 0.3s' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: BASE, boxShadow: earned ? neu(false, '#FFD700') : neu(), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {b.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: earned ? '#FFD700' : '#ffffff55', fontWeight: 600, fontSize: 13, margin: 0 }}>{b.name}</p>
                    <p style={{ color: '#ffffff33', fontSize: 11, margin: '2px 0 0' }}>{b.desc}</p>
                  </div>
                  {earned && <span style={{ color: '#FFD700', fontSize: 18 }}>✓</span>}
                </div>
              )
            })}
          </div>
        </NeuCard>
      </div>
    </div>
  )
}
