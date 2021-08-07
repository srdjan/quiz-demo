const canvas = document.getElementById('avatar')
const answerButton = document.getElementById('answerButton')
answerButton.addEventListener('click', (event) => {
  event.preventDefault()
  const answer = getAnswer()
  console.log(answer)

  const icon = renderIcon({ // All options are optional
    seed: answer, // seed used to generate icon data, default: random
    color: '#dfe', // to manually specify the icon color, default: random
    bgcolor: '#aaa', // choose a different background color, default: white
    size: 35, // width/height of the icon in blocks, default: 10
    scale: 5 // width/height of each block in pixels, default: 5
  }, canvas)

  document.body.appendChild(icon) // icon is a canvas element
})

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
  'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

const pi = Math.PI
const e = Math.E
const root2 = Math.pow(2, 0.5)

const date = new Date()
const datefull = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).format(date)

const dial1 = document.getElementById('dial1')
dial1.value = datefull.slice(0, 1)

const dial2 = document.getElementById('dial2')
dial2.value = datefull.slice(1, 2)

const dial3 = document.getElementById('dial3')
dial3.value = datefull.slice(3, 4)

const dial4 = document.getElementById('dial4')
dial4.value = datefull.slice(4, 5)

const dial5 = document.getElementById('dial5')
dial5.value = datefull.slice(8, 9)

const dial6 = document.getElementById('dial6')
dial6.value = datefull.slice(9, 10)

const dials = [dial1, dial2, dial3, dial4, dial5, dial6]

// function to generate the long irrational number based on 6 integers from dials
function dialANum (a, b, c) {
  return Math.pow(pi, a) + Math.pow(e, b) + Math.pow(root2, c)
}

// function to return an array of 13 random 2digit numbers
function randPairs (n, pairs) {
  let irradNum = n % 1

  const output = []
  for (let i = 0; i < pairs; i++) {
    const twoDigit = Math.floor(irradNum * 100) // capture the top 2 digits
    output.push(twoDigit)
    irradNum = (irradNum * 100) % 1 // clip off the top two digits and move everything up
  }
  return output
}

function generateHash (a, b, c, d, e, f) {
  // todo:  error if any dial is 0 ?

  const tempAlphabet = alphabet.slice() // make a copy of alphabet
  const pairSet1 = randPairs(dialANum(a, b, c), alphabet.length / 2)
  const pairSet2 = randPairs(dialANum(d, e, f), alphabet.length / 2)
  const pairSet = pairSet1.concat(pairSet2)

  const hash = {}

  let pairIndex = pairSet.length
  while (pairSet.length > 0) {
    pairIndex = pairSet.length
    let rand = pairSet.shift() % pairIndex
    const letter1 = tempAlphabet[rand]
    tempAlphabet.splice(rand, 1) // splice one element starting at rand

    pairIndex = pairSet.length
    rand = pairSet.shift() % pairIndex
    const letter2 = tempAlphabet[rand]
    tempAlphabet.splice(rand, 1) // splice one element starting at rand

    hash[letter1] = letter2
    hash[letter2] = letter1
  }
  return hash
}

function getAnswer () {
  const alphaHash = generateHash(dials[0].value, dials[1].value, dials[2].value,
    dials[3].value, dials[4].value, dials[5].value)

  let answer = ''

  const question = document.getElementById('question').value

  for (let i = 0; i < question.length; i++) {
    if (alphaHash[question[i].toLowerCase()]) {
      answer += alphaHash[question[i].toLowerCase()]
    } else {
      answer += question[i]
    }
  }

  return answer
}

// - avatar
// The random number is a js implementation of the Xorshift PRNG
const randseed = new Array(4) // Xorshift: [x, y, z, w] 32 bit values

function seedrand (seed) {
  randseed.fill(0)

  for (let i = 0; i < seed.length; i++) {
    randseed[i % 4] = ((randseed[i % 4] << 5) - randseed[i % 4]) +
      seed.charCodeAt(i)
  }
}

function rand () {
  // based on Java's String.hashCode(), expanded to 4 32bit values
  const t = randseed[0] ^ (randseed[0] << 11)

  randseed[0] = randseed[1]
  randseed[1] = randseed[2]
  randseed[2] = randseed[3]
  randseed[3] = (randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8))

  return (randseed[3] >>> 0) / ((1 << 31) >>> 0)
}

function createColor () {
  // saturation is the whole color spectrum
  const h = Math.floor(rand() * 360)
  // saturation goes from 40 to 100, it avoids greyish colors
  const s = ((rand() * 60) + 40) + '%'
  // lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
  const l = ((rand() + rand() + rand() + rand()) * 25) + '%'

  return 'hsl(' + h + ',' + s + ',' + l + ')'
}

function createImageData (size) {
  const width = size // Only support square icons for now
  const height = size

  const dataWidth = Math.ceil(width / 2)
  const mirrorWidth = width - dataWidth

  const data = []
  for (let y = 0; y < height; y++) {
    let row = []
    for (let x = 0; x < dataWidth; x++) {
      // this makes foreground and background color to have a 43% (1/2.3) probability
      // spot color has 13% chance
      row[x] = Math.floor(rand() * 2.3)
    }
    const r = row.slice(0, mirrorWidth)
    r.reverse()
    row = row.concat(r)

    for (let i = 0; i < row.length; i++) {
      data.push(row[i])
    }
  }

  return data
}

function buildOpts (opts) {
  const newOpts = {}

  newOpts.seed = opts.seed ||
    Math.floor((Math.random() * Math.pow(10, 16))).toString(16)

  seedrand(newOpts.seed)

  newOpts.size = opts.size || 8
  newOpts.scale = opts.scale || 4
  newOpts.color = opts.color || createColor()
  newOpts.bgcolor = opts.bgcolor || createColor()
  newOpts.spotcolor = opts.spotcolor || createColor()

  return newOpts
}

function renderIcon (opts, canvas) {
  opts = buildOpts(opts || {})
  const imageData = createImageData(opts.size)
  const width = Math.sqrt(imageData.length)

  canvas.width = canvas.height = opts.size * opts.scale

  const cc = canvas.getContext('2d')
  cc.fillStyle = opts.bgcolor
  cc.fillRect(0, 0, canvas.width, canvas.height)
  cc.fillStyle = opts.color

  for (let i = 0; i < imageData.length; i++) {
    // if data is 0, leave the background
    if (imageData[i]) {
      const row = Math.floor(i / width)
      const col = i % width

      // if data is 2, choose spot color, if 1 choose foreground
      cc.fillStyle = (imageData[i] === 1) ? opts.color : opts.spotcolor

      cc.fillRect(col * opts.scale, row * opts.scale, opts.scale, opts.scale)
    }
  }

  return canvas
}
