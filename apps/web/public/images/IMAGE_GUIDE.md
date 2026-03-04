# Box Box: Pit Wall Tactics — Image Asset Guide

## Folder Structure

```
public/images/
├── cards/          18 card illustrations (400×560px, .webp)
├── circuits/       6 circuit banners (800×400px, .webp)
└── teams/          6 team badges/banners (400×400px or 800×200px, .webp)
```

**Formats**: .webp preferred. Also supports .png or .jpg (update filenames in `src/lib/images.ts`).

The app falls back to CSS gradients when images are missing, so you can add them incrementally.

---

## Card Images (18)

**Style**: Dramatic F1-themed illustrated art. Dark/moody palette. Each image fills the top half of a trading card. Think: *Gwent* or *Legends of Runeterra* card art style but F1-themed.

| Filename | Card Name | AI Prompt |
|----------|-----------|-----------|
| `push-hard.webp` | Push Hard | "Dramatic F1 car from behind pushing hard through a corner, tire smoke, sparks flying, aggressive driving, dark moody lighting, digital art, TCG card illustration style" |
| `box-box.webp` | Box Box | "F1 pit stop action scene, mechanics rushing to change tires, dramatic overhead view, tire guns sparking, blue and orange pit lane lights, digital art, TCG card style" |
| `conserve-tires.webp` | Conserve Tires | "Close-up of a worn F1 tire with heat haze, car cruising smoothly on a gentle curve, calm controlled driving, cool blue-green tones, digital art, TCG card style" |
| `fuel-save.webp` | Fuel Save | "F1 car dashboard showing fuel gauges and telemetry, driver in cockpit with visor reflection, ambient blue-green glow, digital art, TCG card illustration" |
| `overtake.webp` | Overtake | "Two F1 cars side by side at high speed through a corner, sparks and motion blur, aggressive wheel-to-wheel racing, dramatic wide angle, digital art, TCG card style" |
| `defend-position.webp` | Defend Position | "F1 car blocking the racing line seen from behind, mirrors showing pursuing car, defensive driving formation, dark dramatic lighting, digital art, TCG card style" |
| `wet-setup.webp` | Wet Setup | "F1 car with rain tires creating rooster tail spray on a wet track, dramatic rain drops, moody storm clouds, blue and teal tones, digital art, TCG card style" |
| `dry-setup.webp` | Dry Setup | "F1 car on a sun-baked dry track, heat shimmers, perfect racing line, clear skies, warm amber and red tones, clean aerodynamic shot, digital art, TCG card style" |
| `undercut.webp` | Undercut | "F1 car exiting pit lane at speed onto an empty track, fresh tires glowing, strategic pit timing, dramatic side angle, teal and orange lighting, digital art, TCG card style" |
| `overcut.webp` | Overcut | "F1 car on worn tires pushing hard to stay ahead, track position battle, aggressive stance, tire degradation visible, orange and dark tones, digital art, TCG card style" |
| `drs-attack.webp` | DRS Attack | "Rear view of F1 car with DRS open wing on a long straight, car ahead being hunted down, speed lines, dramatic perspective, digital art, TCG card style" |
| `slipstream.webp` | Slipstream | "F1 car tucked closely behind another down a straight, turbulent air visualization, drafting formation, dynamic motion, blue and white streaks, digital art, TCG card style" |
| `engine-mode.webp` | Engine Mode | "F1 car engine glowing hot through the bodywork, power unit visualization with energy pulses, dramatic close-up of the rear, orange and red energy, digital art, TCG card style" |
| `battery-deploy.webp` | Battery Deploy | "F1 hybrid power unit deploying energy, electric blue lightning crackling around the car, ERS visualization, futuristic energy trails, digital art, TCG card style" |
| `track-position.webp` | Track Position | "Aerial view of F1 cars spread across a track, strategic positioning through corners, racing line visible, mini-map feel, dark atmospheric, digital art, TCG card style" |
| `gap-management.webp` | Gap Management | "F1 timing board showing gaps between cars with a driver focused in cockpit, data overlay, calculated precision, green and white digital readouts, digital art, TCG card style" |
| `late-brake.webp` | Late Brake | "F1 car braking hard into a tight corner, glowing brake discs, tire lockup smoke, dramatic front angle, red-hot brake glow, digital art, TCG card style" |
| `alternate-strategy.webp` | Alternate Strategy | "F1 pit wall strategist screens showing different tire strategy options, data charts, team principal thinking, multiple monitor displays, digital art, TCG card style" |

---

## Circuit Images (6)

**Style**: Atmospheric circuit banner images. Wide landscape format, moody/cinematic. Used as background strips and circuit select cards.

| Filename | Circuit | AI Prompt |
|----------|---------|-----------|
| `monaco.webp` | Monaco Grand Prix | "Monaco Grand Prix circuit aerial view at dusk, yachts in harbor, city lights reflecting, narrow streets, dramatic Mediterranean sunset, cinematic panoramic, digital art" |
| `spa.webp` | Belgian Grand Prix | "Spa-Francorchamps Eau Rouge corner in misty Ardennes forest, dramatic elevation changes, green pine trees, moody fog rolling in, cinematic landscape, digital art" |
| `monza.webp` | Italian Grand Prix | "Monza circuit Temple of Speed, long straight through ancient park, dappled light through trees, historic Italian racing atmosphere, warm golden light, digital art" |
| `silverstone.webp` | British Grand Prix | "Silverstone circuit Maggots-Becketts-Chapel complex, dramatic British sky, fast flowing corners, green English countryside, epic cloud formations, cinematic, digital art" |
| `suzuka.webp` | Japanese Grand Prix | "Suzuka figure-eight circuit at sunset, iconic crossover bridge, cherry blossom trees in background, Japanese mountains, dramatic sky, cinematic landscape, digital art" |
| `interlagos.webp` | Brazilian Grand Prix | "Interlagos circuit overlooking Sao Paulo skyline, dramatic Brazilian sunset, counter-clockwise track winding through hills, vibrant warm colors, cinematic panoramic, digital art" |

---

## Team Images (6)

**Style**: Abstract team identity banners. Bold team colors, racing patterns, geometric or carbon fiber textures. Used as card headers on team select.

| Filename | Team | Color | AI Prompt |
|----------|------|-------|-----------|
| `crimson.webp` | Crimson Racing | #DC2626 | "Abstract racing banner in deep crimson red, carbon fiber texture with flame motifs, aggressive angular geometric patterns, dark to red gradient, F1 team identity style" |
| `azure.webp` | Azure Motorsport | #2563EB | "Abstract racing banner in electric blue, flowing aerodynamic shapes, cool metallic blue gradients, precision engineering feel, clean geometric patterns, F1 team identity style" |
| `emerald.webp` | Emerald Grand Prix | #059669 | "Abstract racing banner in emerald green, nature-meets-technology feel, leaf-like fractal patterns in metallic green, dark forest to bright green gradient, F1 team identity style" |
| `amber.webp` | Amber Autosport | #D97706 | "Abstract racing banner in warm amber-orange, desert sun and heat haze motifs, golden-orange metallic textures, bold angular shapes, F1 team identity style" |
| `violet.webp` | Violet Velocity | #7C3AED | "Abstract racing banner in electric violet-purple, speed streak patterns, neon purple energy trails on dark background, futuristic cyberpunk-racing feel, F1 team identity style" |
| `onyx.webp` | Onyx Engineering | #1F2937 | "Abstract racing banner in dark onyx-charcoal, precision engineering blueprints, subtle silver-grey geometric patterns on near-black, technical sophisticated feel, F1 team identity style" |

---

## Tips for Image Generation

1. **Consistent style**: Use the same AI model and similar seed/settings for all cards to maintain visual consistency
2. **Dark palette**: The game has a dark theme (carbon/metal backgrounds) — images should be moody, not bright
3. **No text in images**: The app overlays text on top, so avoid text/logos in the generated images
4. **Aspect ratios matter**: Cards are 5:7, circuits are 2:1, teams are flexible (2:1 or 1:1)
5. **Test incrementally**: Drop one image in, reload the app to see how it looks, then generate the rest
6. **WebP format**: Convert to .webp for best file size. Most AI generators output .png — use any converter
