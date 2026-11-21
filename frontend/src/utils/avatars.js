/**
 * Curated Collection of 3D Open-Source Vector Avatars
 * Built with layered gradients, highlights, and ambient occlusion
 * for a crisp, high-end 3D aesthetic on Retina/OLED mobile displays.
 * Completely offline-capable (Zero external network dependencies).
 */

export const AVATARS_3D = [
  {
    id: '3d-sultan',
    name: 'Sultan Executive',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgSultan" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#2a3036"/>
          <stop offset="100%" stop-color="#111417"/>
        </radialGradient>
        <linearGradient id="goldCrown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffe259"/>
          <stop offset="100%" stop-color="#ffa751"/>
        </linearGradient>
        <radialGradient id="skin" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#ffdfba"/>
          <stop offset="80%" stop-color="#e0ac69"/>
          <stop offset="100%" stop-color="#c68642"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bgSultan)"/>
      <!-- 3D Torso -->
      <path d="M22 92 C22 68, 78 68, 78 92 Z" fill="#1e2329"/>
      <path d="M40 70 L50 84 L60 70 Z" fill="#ffffff" opacity="0.9"/>
      <path d="M47 70 L50 92 L53 70 Z" fill="#00FF00"/>
      <!-- 3D Head -->
      <circle cx="50" cy="48" r="24" fill="url(#skin)"/>
      <!-- Hair/Beard shadow -->
      <path d="M28 42 C30 24, 70 24, 72 42 C64 34, 36 34, 28 42 Z" fill="#2d1d14"/>
      <!-- 3D Shades/Glasses -->
      <rect x="33" y="44" width="14" height="9" rx="3" fill="#131517"/>
      <rect x="53" y="44" width="14" height="9" rx="3" fill="#131517"/>
      <line x1="47" y1="48" x2="53" y2="48" stroke="#ffd700" stroke-width="2"/>
      <line x1="35" y1="46" x2="45" y2="51" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>
      <line x1="55" y1="46" x2="65" y2="51" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>
      <!-- Crown -->
      <polygon points="34,26 42,16 50,23 58,16 66,26" fill="url(#goldCrown)"/>
      <circle cx="50" cy="20" r="2.5" fill="#00FF00"/>
    </svg>`
  },
  {
    id: '3d-queen',
    name: 'Royal Empress',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgQueen" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#4a154b"/>
          <stop offset="100%" stop-color="#19061c"/>
        </radialGradient>
        <radialGradient id="skinQ" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#ffe0bd"/>
          <stop offset="100%" stop-color="#d49a6a"/>
        </radialGradient>
        <linearGradient id="hairQ" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2c1b18"/>
          <stop offset="100%" stop-color="#0f0705"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bgQueen)"/>
      <!-- Hair back -->
      <circle cx="50" cy="46" r="28" fill="url(#hairQ)"/>
      <!-- Torso -->
      <path d="M24 94 C24 72, 76 72, 76 94 Z" fill="#ec660d"/>
      <circle cx="50" cy="74" r="6" fill="#ffd700"/>
      <!-- Head -->
      <circle cx="50" cy="48" r="22" fill="url(#skinQ)"/>
      <!-- Hair front -->
      <path d="M28 42 C30 26, 70 26, 72 42 C64 32, 54 38, 50 32 C46 38, 36 32, 28 42 Z" fill="url(#hairQ)"/>
      <!-- Eyes & Lips -->
      <ellipse cx="42" cy="48" rx="2.5" ry="3.5" fill="#131517"/>
      <ellipse cx="58" cy="48" rx="2.5" ry="3.5" fill="#131517"/>
      <circle cx="43" cy="47" r="1" fill="#ffffff"/>
      <circle cx="59" cy="47" r="1" fill="#ffffff"/>
      <path d="M45 59 Q50 63 55 59" stroke="#e83b47" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Tiara -->
      <path d="M38 28 Q50 20 62 28 L50 22 Z" fill="#ffd700"/>
      <circle cx="50" cy="22" r="2" fill="#00FF00"/>
    </svg>`
  },
  {
    id: '3d-innovator',
    name: 'Tech Innovator',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgInnovator" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#0f3443"/>
          <stop offset="100%" stop-color="#131517"/>
        </radialGradient>
        <radialGradient id="skinI" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#fcd5b5"/>
          <stop offset="100%" stop-color="#d1976a"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bgInnovator)"/>
      <!-- Hoodie -->
      <path d="M22 92 C22 66, 78 66, 78 92 Z" fill="#24292e"/>
      <circle cx="50" cy="48" r="23" fill="url(#skinI)"/>
      <!-- Modern Haircut 3D -->
      <path d="M27 40 C28 20, 68 18, 73 35 C65 28, 45 28, 38 34 Z" fill="#4a3728"/>
      <!-- Glasses Minimalist -->
      <circle cx="42" cy="48" r="7" fill="none" stroke="#00FF00" stroke-width="2"/>
      <circle cx="58" cy="48" r="7" fill="none" stroke="#00FF00" stroke-width="2"/>
      <line x1="49" y1="48" x2="51" y2="48" stroke="#00FF00" stroke-width="2"/>
      <!-- Smile -->
      <path d="M46 59 Q50 62 54 59" stroke="#5c3826" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: '3d-cyborg',
    name: 'Cyber Sentinel',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgCyber" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#14213d"/>
          <stop offset="100%" stop-color="#050811"/>
        </radialGradient>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e5e5e5"/>
          <stop offset="50%" stop-color="#9ca3af"/>
          <stop offset="100%" stop-color="#4b5563"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bgCyber)"/>
      <!-- Robotic Body -->
      <path d="M22 92 C24 66, 76 66, 78 92 Z" fill="#1f2937"/>
      <circle cx="50" cy="48" r="23" fill="url(#metal)"/>
      <!-- Cybernetic Visor Glow -->
      <path d="M30 44 Q50 40 70 44 L68 52 Q50 48 32 52 Z" fill="#00FF00" filter="drop-shadow(0 0 4px #00FF00)"/>
      <line x1="34" y1="47" x2="66" y2="47" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Head Plate lines -->
      <line x1="50" y1="25" x2="50" y2="38" stroke="#374151" stroke-width="2"/>
      <circle cx="36" cy="34" r="2" fill="#00e5ff"/>
      <circle cx="64" cy="34" r="2" fill="#00e5ff"/>
    </svg>`
  },
  {
    id: '3d-investor',
    name: 'Wall Street Pro',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgInv" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#1f3b2b"/>
          <stop offset="100%" stop-color="#0b1710"/>
        </radialGradient>
        <radialGradient id="skinW" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#ffdfba"/>
          <stop offset="100%" stop-color="#cb8a49"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bgInv)"/>
      <!-- Suit -->
      <path d="M20 92 C22 66, 78 66, 80 92 Z" fill="#0d1117"/>
      <polygon points="44,68 50,88 56,68" fill="#ffffff"/>
      <polygon points="48,72 50,92 52,72" fill="#ec660d"/>
      <!-- Head -->
      <circle cx="50" cy="47" r="22" fill="url(#skinW)"/>
      <!-- Silver Fox Hair -->
      <path d="M28 40 C30 22, 70 22, 72 40 C66 32, 40 32, 28 40 Z" fill="#9ca3af"/>
      <!-- Eyes & Smirk -->
      <circle cx="43" cy="47" r="2.5" fill="#131517"/>
      <circle cx="57" cy="47" r="2.5" fill="#131517"/>
      <path d="M46 58 Q52 61 56 56" stroke="#4a2e1b" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: '3d-crypto-cat',
    name: 'Golden Fortune Cat',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgCat" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#2d3748"/>
          <stop offset="100%" stop-color="#1a202c"/>
        </radialGradient>
        <radialGradient id="goldFur" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#ffd700"/>
          <stop offset="70%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#bgCat)"/>
      <!-- Ears -->
      <polygon points="30,36 38,16 48,32" fill="#b45309"/>
      <polygon points="33,34 38,20 45,32" fill="#fef0e8"/>
      <polygon points="70,36 62,16 52,32" fill="#b45309"/>
      <polygon points="67,34 62,20 55,32" fill="#fef0e8"/>
      <!-- Head -->
      <circle cx="50" cy="52" r="24" fill="url(#goldFur)"/>
      <!-- Big Eyes -->
      <ellipse cx="41" cy="48" rx="4" ry="6" fill="#131517"/>
      <ellipse cx="59" cy="48" rx="4" ry="6" fill="#131517"/>
      <circle cx="42" cy="46" r="2" fill="#00FF00"/>
      <circle cx="60" cy="46" r="2" fill="#00FF00"/>
      <!-- Nose & Mouth -->
      <polygon points="48,54 52,54 50,56" fill="#ec660d"/>
      <path d="M46 58 Q50 62 54 58" stroke="#131517" stroke-width="1.8" fill="none"/>
      <!-- Coin Medallion -->
      <circle cx="50" cy="78" r="9" fill="#ffd700" stroke="#b45309" stroke-width="1.5"/>
      <text x="50" y="82" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#78350f">Rp</text>
    </svg>`
  }
]
