// ── VYBE Design System ──────────────────────────────────────────
export const BASE       = '#1a1b2e'
export const BASE_LIGHT = '#232438'
export const BASE_DARK  = '#11121f'
export const SHADOW_D   = '#0d0e1a'
export const SHADOW_L   = '#272840'

export const neu = (pressed = false, color = null) => {
  if (pressed) return `inset 4px 4px 12px ${SHADOW_D}, inset -3px -3px 8px ${SHADOW_L}`
  if (color)   return `6px 6px 16px ${SHADOW_D}, -4px -4px 12px ${SHADOW_L}, 0 0 20px ${color}44`
  return `6px 6px 16px ${SHADOW_D}, -4px -4px 12px ${SHADOW_L}`
}

export const MOODS = [
  { id:'hype',  emoji:'⚡', label:'HYPE',  color:'#FF6B35' },
  { id:'happy', emoji:'🌊', label:'HAPPY', color:'#00D4FF' },
  { id:'chill', emoji:'🌙', label:'CHILL', color:'#A78BFA' },
  { id:'sad',   emoji:'💧', label:'SAD',   color:'#60A5FA' },
  { id:'focus', emoji:'🎯', label:'FOCUS', color:'#34D399' },
  { id:'lit',   emoji:'🔥', label:'LIT',   color:'#F472B6' },
]

export const LEVELS = [
  { name:'Sound Rookie',   min:0,    max:500,      icon:'🎵', color:'#94A3B8' },
  { name:'Beat Maker',     min:500,  max:1500,     icon:'🥁', color:'#34D399' },
  { name:'Producer',       min:1500, max:3500,     icon:'🎹', color:'#00D4FF' },
  { name:'Beat Architect', min:3500, max:7000,     icon:'🎛️', color:'#A78BFA' },
  { name:'LEGEND',         min:7000, max:Infinity, icon:'👑', color:'#FFD700' },
]

export const TRACKS = [
  { id:'kick',  name:'KICK',   color:'#FF6B35' },
  { id:'snare', name:'SNARE',  color:'#F472B6' },
  { id:'hihat', name:'HI-HAT', color:'#00D4FF' },
  { id:'clap',  name:'CLAP',   color:'#A78BFA' },
  { id:'bass',  name:'BASS',   color:'#34D399' },
  { id:'mel',   name:'MELODY', color:'#FFD700' },
  { id:'perc',  name:'PERC',   color:'#FB923C' },
  { id:'cymb',  name:'CYMBAL', color:'#E879F9' },
]

export const BADGES_LIST = [
  { id:'first_beat',     name:'First Beat',     icon:'🎵', desc:'Played your first beat',       xp:50  },
  { id:'dj_entered',     name:'On The Decks',   icon:'🎧', desc:'Entered DJ World',             xp:10  },
  { id:'dna_unlocked',   name:'DNA Hunter',     icon:'🧬', desc:'Analyzed Artist DNA',          xp:100 },
  { id:'voice_rec',      name:'Voice Star',     icon:'🎤', desc:'Recorded your voice',          xp:30  },
  { id:'discoverer',     name:'Discoverer',     icon:'🔍', desc:'Searched for music',           xp:40  },
  { id:'song_arranged',  name:'Song Arranger',  icon:'🎼', desc:'Arranged a full song',         xp:150 },
  { id:'week_streak',    name:'7 Day Streak',   icon:'🔥', desc:'Used VYBE 7 days in a row',    xp:200 },
  { id:'collab',         name:'Collaborator',   icon:'🤝', desc:'Shared a beat',                xp:75  },
]

export const GENRE_TRACKS = {
  'Afrobeats': ['Burna Boy - Last Last','Wizkid - Essence','Tems - Free Mind','Davido - Fall','Rema - Calm Down'],
  'Amapiano':  ['DBN Gogo - Phoyisa','Kabza De Small - Sponono','Tyler ICU - Inhliziyo','Focalistic - Ke Star','MaWhoo - Yebo'],
  'Hip-Hop':   ['Kendrick - Not Like Us','Drake - God\'s Plan','J. Cole - No Role Modelz','Travis - SICKO MODE','21 Savage - Rockstar'],
  'R&B':       ['The Weeknd - Blinding Lights','SZA - Good Days','Frank Ocean - Nights','H.E.R. - Best Part','Bryson - Exchange'],
  'House':     ['Fred Again - Delilah','Chris Lake - Operator','Fisher - Losing It','Dom Dolla - Saving Up','John Summit - La Danza'],
  'Drill':     ['Central Cee - Doja','Pop Smoke - Gatti','Fivio Foreign - Papi','Headie One - Know Better','Unknown T - Homerton B'],
}

export const SECTION_NAMES = ['INTRO','VERSE 1','PRE-CHORUS','CHORUS','VERSE 2','BRIDGE','CHORUS 2','OUTRO']

export const FX_LIST = [
  { id:'reverb',   name:'REVERB',    color:'#00D4FF' },
  { id:'echo',     name:'ECHO',      color:'#A78BFA' },
  { id:'filter',   name:'FILTER',    color:'#F472B6' },
  { id:'flanger',  name:'FLANGER',   color:'#34D399' },
  { id:'phaser',   name:'PHASER',    color:'#FF6B35' },
  { id:'bitcrush', name:'BIT CRUSH', color:'#FFD700' },
  { id:'stutter',  name:'STUTTER',   color:'#FB923C' },
  { id:'vinyl',    name:'VINYL',     color:'#60A5FA' },
]

export const getLevel = xp => LEVELS.find(l => xp >= l.min && xp < l.max) || LEVELS[4]
export const getLvPct = xp => { const l = getLevel(xp); if (l.max === Infinity) return 100; return Math.round(((xp - l.min) / (l.max - l.min)) * 100) }
