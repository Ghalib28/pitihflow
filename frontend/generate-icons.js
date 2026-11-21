// High-fidelity PNG generator for Pitihflow PWA & mobile app icons
// Generates iconic 'P' on crisp white background
import fs from 'fs'
import zlib from 'zlib'

function createPng(size, isMaskable = false) {
  const width = size
  const height = size

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR Chunk
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr.writeUInt8(8, 8)   // 8 bits per sample
  ihdr.writeUInt8(6, 9)   // RGBA
  ihdr.writeUInt8(0, 10)  // compression
  ihdr.writeUInt8(0, 11)  // filter
  ihdr.writeUInt8(0, 12)  // interlace

  const ihdrChunk = createChunk('IHDR', ihdr)

  // IDAT Chunk (Raw scanlines: 1 filter byte (0) + width * 4 bytes RGBA)
  const rowSize = 1 + width * 4
  const rawData = Buffer.alloc(height * rowSize)

  const center = width / 2
  const squircleRadius = width * 0.46

  // Coordinates for Letter 'P'
  // Stem:
  const stemX1 = width * 0.30
  const stemX2 = width * 0.42
  const stemY1 = height * 0.22
  const stemY2 = height * 0.78

  // Loop upper and lower bars:
  const barX1 = width * 0.42
  const barX2 = width * 0.54
  const topBarY1 = height * 0.22
  const topBarY2 = height * 0.34
  const botBarY1 = height * 0.46
  const botBarY2 = height * 0.58

  // Right curved arc of the loop:
  const arcCx = width * 0.54
  const arcCy = height * 0.40
  const arcRout = height * 0.18
  const arcRin = height * 0.06

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize
    rawData[rowOffset] = 0 // Filter: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4

      // White background condition
      let insideBg = true
      if (!isMaskable) {
        // Squircle formula with smooth rounded corners
        const nx = Math.abs(x - center) / squircleRadius
        const ny = Math.abs(y - center) / squircleRadius
        insideBg = (Math.pow(nx, 4) + Math.pow(ny, 4)) <= 1.05
      }

      if (insideBg) {
        // Default: Pure White background
        let r = 255
        let g = 255
        let b = 255
        let a = 255

        // Determine if pixel is inside Letter 'P'
        let inP = false

        // 1. Vertical stem
        if (x >= stemX1 && x <= stemX2 && y >= stemY1 && y <= stemY2) {
          inP = true
        }
        // 2. Top bar of loop
        else if (x >= barX1 && x <= barX2 && y >= topBarY1 && y <= topBarY2) {
          inP = true
        }
        // 3. Bottom bar of loop
        else if (x >= barX1 && x <= barX2 && y >= botBarY1 && y <= botBarY2) {
          inP = true
        }
        // 4. Outer arc of loop
        else if (x >= arcCx) {
          const d = Math.hypot(x - arcCx, y - arcCy)
          if (d <= arcRout && d >= arcRin) {
            inP = true
          }
        }

        if (inP) {
          // Luxury Emerald Green gradient (#00E676 to #00A844)
          const t = Math.max(0, Math.min(1, (y - stemY1) / (stemY2 - stemY1)))
          r = Math.round(0 * (1 - t) + 0 * t)
          g = Math.round(230 * (1 - t) + 168 * t)
          b = Math.round(118 * (1 - t) + 68 * t)
        } else {
          // Subtle soft shadow around the squircle edge for non-maskable icons
          if (!isMaskable) {
            const edgeDist = Math.hypot(x - center, y - center) / (width * 0.5)
            if (edgeDist > 0.94) {
              const shade = Math.round(242 + (1 - edgeDist) * 13)
              r = Math.min(255, shade)
              g = Math.min(255, shade)
              b = Math.min(255, shade)
            }
          }
        }

        rawData[pixelOffset] = r
        rawData[pixelOffset + 1] = g
        rawData[pixelOffset + 2] = b
        rawData[pixelOffset + 3] = a
      } else {
        // Transparent
        rawData[pixelOffset] = 0
        rawData[pixelOffset + 1] = 0
        rawData[pixelOffset + 2] = 0
        rawData[pixelOffset + 3] = 0
      }
    }
  }

  const compressed = zlib.deflateSync(rawData)
  const idatChunk = createChunk('IDAT', compressed)
  const iendChunk = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

function createChunk(type, data) {
  const len = data.length
  const buf = Buffer.alloc(8 + len + 4)
  buf.writeUInt32BE(len, 0)
  buf.write(type, 4, 4, 'ascii')
  data.copy(buf, 8)

  const crc = crc32(buf.subarray(4, 8 + len))
  buf.writeInt32BE(crc, 8 + len)
  return buf
}

// CRC32 implementation
const crcTable = []
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  }
  crcTable[n] = c
}

function crc32(buf) {
  let crc = -1
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff]
  }
  return crc ^ -1
}

// Ensure output directories exist
if (!fs.existsSync('public/icons')) {
  fs.mkdirSync('public/icons', { recursive: true })
}

fs.writeFileSync('public/icons/icon-192x192.png', createPng(192, false))
fs.writeFileSync('public/icons/icon-512x512.png', createPng(512, true))
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, false))

console.log('✓ Pitihflow "P" icons on pure white background generated successfully!')
