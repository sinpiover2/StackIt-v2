// Self-hosted Tower of Hanoi variant for classroom use
// Cleaned up: no Solve/Log/Min Moves; win on middle OR right; title locked to "Stack It!".

let el, g, ratio, my = {}

function init(mode) {
  let version = '0.936'

  // 🔒 Protect page title
  document.title = "Stack It!"
  setTimeout(() => { document.title = "Stack It!" }, 500)

  this.mode = typeof mode !== 'undefined' ? mode : 'asc'

  let w = 510, h = 320

  my.clrs = [["PaleGreen", '#98FB98'], ["SpringGreen", '#00FF7F'], ["Thistle", '#D8BFD8'],
    ["Yellow", '#FFFF00'], ["Gold", '#FFD700'], ["Pink", '#FFC0CB'], ["LightSalmon", '#FFA07A'],
    ["Lime", '#00FF00'], ["DarkSeaGreen", '#8FBC8F'], ["Orange", '#FFA500'], ["Khaki", '#F0E68C'],
    ["Violet", '#EE82EE'], ["Teal", '#008080'], ["LightBlue", '#ADD8E6'], ["SkyBlue", '#87CEEB'],
    ["Blue", '#0000FF'], ["Navy", '#000080'], ["Purple", '#800080'], ["Wheat", '#F5DEB3'],
    ["Tan", '#D2B48C'], ["AntiqueWhite", ["SlateBlue", '#6A5ACD'], '#FAEBD7'],
    ["Aquamarine", '#7FFFD4'], ["Silver", '#C0C0C0']]

  my.startX = 50
  my.startY = 200
  my.diskHt = 17
  my.poleX = 90
  my.poleDist = 160
  my.poleY = 240

  my.drag = { type: 'block', q: false, n: 0, hold: { x: 0, y: 0 } }
  my.moves = []

  let s = ''
  s += `<div style="position:relative; width:${w}px; height:${h}px; margin:auto; display:block; 
         border:1px solid var(--shade); border-radius:10px; box-shadow:5px 5px 10px var(--shade);">`

  // Top controls
  s += '<div id="btns0" style="position:absolute; left:5px; top:3px;">'
  s += '<span style="font:20px Arial; text-align:center;">Disks: </span>'
  s += wrap({ id:'num', tag:'out', style:'width:35px;' }, '3')
  s += '<button id="dnBtn" style="margin:0 0 0 2px; font-size:16px;" class="btn" onclick="numDn()">&#x25BC;</button>'
  s += '<button id="upBtn" style="margin:0; font-size:16px;" class="btn" onclick="numUp()">&#x25B2;</button>'
  s += '<span id="moves" style="text-align:center; margin-left:15px; font:bold 20px Arial; color:blue;">Moves: 0</span>'
  s += '<button style="margin-left:20px;" class="btn" onclick="gameNew()">Restart</button>'
  s += '</div>'

  // Disk area & success banner
  s += '<div id="disks" style="position:absolute; left:0; top:0;"></div>'
  s += `<div id="success" style="position:absolute; left:0; top:40px; width:${w}px; 
         font:bold 36px Arial; text-align:center; color:gold;"></div>`

  // Canvas
  s += `<canvas id="canvasId" width="${w}" height="${h}" style="z-index:2;"></canvas>`

  // Copyright
  s += wrap({cls:'copyrt', style:'left:5px; bottom:3px'}, '&copy; 2025 Rod Pierce v' + version)

  s += '</div>'
  docInsert(s)

  el = document.getElementById('canvasId')
  ratio = 2
  el.width = w * ratio
  el.height = h * ratio
  el.style.width = w + 'px'
  el.style.height = h + 'px'
  g = el.getContext('2d')
  g.setTransform(ratio, 0, 0, ratio, 0, 0)

  my.poles = []
  this.moveN = 0
  my.diskTot = 3

  gameNew()

  el.addEventListener('mousedown', mouseDown, false)
  el.addEventListener('touchstart', touchStart, false)
  el.addEventListener('mousemove', doPointer, false)
}

function getNum() { return my.diskTot }
function numDn() { let num = getNum(); if (num > 3) { num--; chgNumPts(num) } }
function numUp()  { let num = getNum(); if (num < 8) { num++; chgNumPts(num) } }
function chgNumPts(n) { document.getElementById('num').innerHTML = n; my.diskTot = n; gameNew() }

function drawPoles() {
  for (let i = 0; i < my.poles.length; i++) drawPole(my.poleX + i * my.poleDist, my.poleY)
}
function drawPole(x, y) {
  let wd = 150, ht = 145
  g.lineWidth = 1; g.strokeStyle = 'blue'; g.fillStyle = '#d43'
  g.beginPath()
  g.roundRect(x - 3, y - ht, 6, ht, 6, 3)
  g.roundRect(x - wd/2, y - 3, wd, 8, 4)
  g.closePath(); g.stroke(); g.fill()
}

function gameNew() {
  moveNChg(0)
  stopAnim()

  // setup poles: pole 0 has all disks
  let p0 = []
  for (let i = my.diskTot - 1; i >= 0; i--) p0.push(i)
  my.poles = [p0, [], []]

  disksMake(); disksPlace()

  g.clearRect(0, 0, g.canvas.width, g.canvas.height)
  drawPoles(); successTest()

  my.log = ''
  my.logStt = performance.now()
}

function disksMake() {
  let div = document.getElementById('disks')
  while (div.firstChild) div.removeChild(div.firstChild)
  my.disks = []
  for (let i = 0; i < my.diskTot; i++) {
    let disk = new Disk(0, 0, i)
    div.appendChild(disk.div)
    my.disks.push(disk)
  }
  disksToPoles()
}
function disksPlace(fastQ = true) {
  for (let i = 0; i < my.disks.length; i++) {
    let disk = my.disks[i]
    disk.x = my.poleX + my.poleDist * disk.pole - disk.wd / 2
    disk.y = my.poleY - disk.polePos * my.diskHt - disk.ht / 5
    disk.moveMe(fastQ)
  }
}
function disksToPoles() {
  my.poles = [[], [], []]
  for (let i = my.disks.length - 1; i >= 0; i--) {
    let disk = my.disks[i]
    my.poles[disk.pole].unshift(i)
    disk.polePos = my.poles[disk.pole].length
  }
}

function touchStart(evt) {
  let touch = evt.targetTouches[0]
  evt.clientX = touch.clientX; evt.clientY = touch.clientY; evt.touchQ = true
  mouseDown(evt)
}
function touchMove(evt) {
  let touch = evt.targetTouches[0]
  evt.clientX = touch.clientX; evt.clientY = touch.clientY; evt.touchQ = true
  mouseMove(evt); evt.preventDefault()
}
function touchEnd(evt) {
  el.addEventListener('touchstart', touchStart, false)
  window.removeEventListener('touchend', touchEnd, false)
  if (my.drag.q) {
    my.drag.q = false
    my.disks[my.drag.n].hiliteQ = false
    doDrop(my.drag.n); my.drag.n = -1
    window.removeEventListener('touchmove', touchMove, false)
  }
}

function doPointer(e) {
  let bRect = el.getBoundingClientRect()
  let mouseX = (e.clientX - bRect.left) * (el.width / ratio / bRect.width)
  let mouseY = (e.clientY - bRect.top) * (el.height / ratio / bRect.height)
  let inQ = false
  for (let i = 0; i < my.disks.length; i++) {
    let disk = my.disks[i]
    if (hitTest(disk, mouseX, mouseY)) if (topDiskQ(i)) inQ = true
  }
  document.body.style.cursor = inQ ? 'pointer' : 'default'
}

function mouseDown(evt) {
  let bRect = el.getBoundingClientRect()
  let mouseX = (evt.clientX - bRect.left) * (el.width / ratio / bRect.width)
  let mouseY = (evt.clientY - bRect.top) * (el.height / ratio / bRect.height)

  for (let i = 0; i < my.disks.length; i++) {
    let shape = my.disks[i]
    if (hitTest(shape, mouseX, mouseY) && topDiskQ(i)) {
      my.dragStt = performance.now()
      my.drag.q = true
      my.drag.hold = { x: mouseX - shape.x, y: mouseY - shape.y }
      my.drag.n = i
      my.disks[my.drag.n].hilite(true)
    }
  }

  if (my.drag.q) {
    if (evt.touchQ) window.addEventListener('touchmove', touchMove, false)
    else window.addEventListener('mousemove', mouseMove, false)
  }
  if (evt.touchQ) {
    el.removeEventListener('touchstart', touchStart, false)
    window.addEventListener('touchend', touchEnd, false)
  } else {
    el.removeEventListener('mousedown', mouseDown, false)
    window.addEventListener('mouseup', mouseUp, false)
  }

  if (evt.preventDefault) evt.preventDefault()
  else if (evt.returnValue) evt.returnValue = false
  return false
}
function mouseUp(evt) {
  el.addEventListener('mousedown', mouseDown, false)
  window.removeEventListener('mouseup', mouseUp, false)
  if (my.drag.q) {
    my.drag.q = false
    my.disks[my.drag.n].hiliteQ = false
    doDrop(my.drag.n); my.drag.n = -1
    window.removeEventListener('mousemove', mouseMove, false)
  }
}
function mouseMove(evt) {
  if (my.drag.n < 0) return
  let bRect = el.getBoundingClientRect()
  let mouseX = (evt.clientX - bRect.left) * (el.width / ratio / bRect.width)
  let mouseY = (evt.clientY - bRect.top) * (el.height / ratio / bRect.height)
  let posX = mouseX - my.drag.hold.x
  let posY = mouseY - my.drag.hold.y
  my.disks[my.drag.n].x = posX
  my.disks[my.drag.n].y = posY
  my.disks[my.drag.n].moveMe(true)
}

function topDiskQ(n) {
  for (let i = 0; i < my.poles.length; i++) {
    let pole = my.poles[i]
    if (pole.length > 0) if (n == pole[0]) return true
  }
  return false
}
function hitTest(shape, mx, my) {
  if (mx < shape.x || my < shape.y) return false
  if (mx > shape.x + shape.wd || my > shape.y + shape.ht) return false
  return true
}

function doDrop(dropNo) {
  let disk = my.disks[dropNo]
  disk.hilite(false)

  let p = Math.round((disk.x - my.poleX) / my.poleDist)
  p = Math.max(0, Math.min(p, 2))
  if (p != disk.pole) {
    let okQ = false
    let pole = my.poles[p]
    if (pole.length == 0) okQ = true
    else { let top = pole[0]; if (dropNo < top) okQ = true }

    if (okQ) {
      my.log += parseInt(my.dragStt - my.logStt) / 1000 + ', ' + parseInt(performance.now() - my.logStt) / 1000 + ', ' + disk.n + ', ' + disk.pole + ', ' + p + '\\n'
      moveNChg(1)
      disk.pole = p
    }
  }

  disksToPoles(); disksPlace(); successTest()
}

function successTest() {
  document.getElementById('success').innerHTML = ''
  if (isSuccess()) successDo()
}

// UPDATED: win on middle (1) OR right (2) pole
function isSuccess() {
  function successOn(idx) {
    const p = my.poles[idx]
    if (p.length !== my.diskTot) return false
    for (let i = 0; i < my.diskTot; i++) if (p[i] !== i) return false
    return true
  }
  return successOn(1) || successOn(2)
}

// UPDATED: message text
function successDo() {
  document.getElementById('success').innerHTML = 'Good Job!'
  my.log += parseInt(performance.now() - my.logStt) / 1000 + ', ' + 'Success!' + '\\n'
}

function moveNChg(n) {
  if (n == 1) this.moveN++
  else this.moveN = 0
  document.getElementById('moves').innerHTML = 'Moves: ' + this.moveN
}

/*********/
// Keep solver code but no UI exposes it
function solveIt() {
  gameNew()
  my.moves = []
  hanoi(0, 2, 1, my.diskTot)
  my.frame = 25; my.moveNo = 0; moveNChg(0)
  solveAnim()
}
function stopAnim() { my.moveNo = my.moves.length + 1 }
function solveAnim() {
  if (my.moveNo > my.moves.length) return
  my.frame++
  if (my.frame > 60) {
    my.frame = 0
    let move = my.moves[my.moveNo]
    let poleFr = my.poles[move[0]]
    let diskFr = poleFr[0]
    my.disks[diskFr].pole = move[1]
    disksToPoles(); disksPlace(false)
    my.moveNo++; moveNChg(1)
  }
  if (my.moveNo < my.moves.length) requestAnimationFrame(solveAnim)
}
function hanoi(from, to, buf, nmv) {
  if (nmv > 1) { hanoi(from, buf, to, nmv - 1); my.moves.push([from, to]); hanoi(buf, to, from, nmv - 1) }
  else { my.moves.push([from, to]) }
}

/*************************************************************************************************************/
class Disk {
  constructor(x, y, n) {
    this.x = x; this.y = y; this.n = n
    this.wd = (n + 2) * my.diskHt
    this.ht = my.diskHt
    this.pad = 4
    this.pole = 0
    this.hiliteQ = false
    let ratio = 2

    this.div = document.createElement('div')
    this.div.style.position = 'absolute'
    this.div.style.pointerEvents = 'none'
    this.div.style.transitionDuration = '0s'

    document.getElementById('disks').appendChild(this.div)
    this.elFG = document.createElement('canvas')
    this.elFG.style.position = 'absolute'
    this.div.appendChild(this.elFG)
    let canWd = this.wd + this.pad * 2
    let canHt = this.ht + this.pad * 2
    this.elFG.width = canWd * ratio
    this.elFG.height = canHt * ratio
    this.elFG.style.width = canWd + 'px'
    this.elFG.style.height = canHt + 'px'
    this.elFG.style.zIndex = 2
    this.gFG = this.elFG.getContext('2d')
    this.gFG.setTransform(ratio, 0, 0, ratio, 0, 0)

    this.elBG = document.createElement('canvas')
    this.elBG.style.position = 'absolute'
    this.div.appendChild(this.elBG)
    this.elBG.width = canWd * ratio
    this.elBG.height = canHt * ratio
    this.elBG.style.width = canWd + 'px'
    this.elBG.style.height = canHt + 'px'
    this.elBG.style.zIndex = 1
    this.gBG = this.elBG.getContext('2d')
    this.gBG.setTransform(ratio, 0, 0, ratio, 0, 0)

    this.moveMe(true); this.drawMe()
    return this
  }
  removeMe() {
    this.elFG.parentNode.removeChild(this.elFG)
    this.elBG.parentNode.removeChild(this.elBG)
  }
  moveMe(fastQ = true) {
    this.div.style.transitionDuration = fastQ ? '0s' : '0.8s'
    this.div.style.left = this.x - this.pad + 'px'
    this.div.style.top = this.y - this.pad + 'px'
  }
  drawMe() {
    let g = this.gFG
    g.clearRect(0, 0, g.canvas.width, g.canvas.height)
    g.strokeStyle = this.hiliteQ ? 'rgba(150, 150, 33, 1)' : 'black'
    g.lineWidth = 1
    g.fillStyle = my.clrs[this.n][1]
    g.beginPath()
    g.roundRect(this.pad, this.pad, this.wd, this.ht, 10)
    g.closePath(); g.stroke(); g.fill()
  }
  hilite(onQ) { this.hiliteQ = onQ; this.drawMe() }
}

function hex2rgba(hex, opacity) {
  hex = hex.replace('#', '')
  let r = parseInt(hex.substring(0, 2), 16)
  let g = parseInt(hex.substring(2, 4), 16)
  let b = parseInt(hex.substring(4, 6), 16)
  return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')'
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  this.moveTo(x + r, y)
  this.arcTo(x + w, y, x + w, y + h, r)
  this.arcTo(x + w, y + h, x, y + h, r)
  this.arcTo(x, y + h, x, y, r)
  this.arcTo(x, y, x + w, y, r)
  return this
}

function docInsert(s) {
  let div = document.createElement('div')
  div.innerHTML = s
  let script = document.currentScript
  script.parentElement.insertBefore(div, script)
}

class Can {
  constructor(id, wd, ht, ratio) {
    this.id = id; this.wd = wd; this.ht = ht; this.ratio = ratio
    let el = document.getElementById(id)
    el.width = wd * ratio; el.style.width = wd + 'px'
    el.height = ht * ratio; el.style.height = ht + 'px'
    this.g = el.getContext('2d')
    this.g.setTransform(ratio, 0, 0, ratio, 0, 0)
    this.el = el
    return this
  }
  clear() { this.g.clearRect(0, 0, this.wd, this.ht) }
  mousePos(ev) {
    let bRect = this.el.getBoundingClientRect()
    let mouseX = (ev.clientX - bRect.left) * (this.el.width / this.ratio / bRect.width)
    let mouseY = (ev.clientY - bRect.top) * (this.el.height / this.ratio / bRect.height)
    return [mouseX, mouseY]
  }
}

function wrap({ id = '', cls = '', pos = 'rel', style = '', txt = '', tag = 'div', lbl = '', fn = '', opts = [] }, ...mores) {
  let s = ''
  s += '\n'
  txt += mores.join('')
  s +=
    {
      btn: () => { if (cls.length == 0) cls = 'btn'; return '<button onclick="' + fn + '"' },
      can: () => '<canvas',
      div: () => '<div',
      edit: () => '<textarea onkeyup="' + fn + '" onchange="' + fn + '"',
      inp: () => {
        if (cls.length == 0) cls = 'input'
        let s = ''
        s += lbl.length > 0 ? '<label class="label">' + lbl + ' ' : ''
        s += '<input value="' + txt + '"'
        s += fn.length > 0 ? '  oninput="' + fn + '" onchange="' + fn + '"' : ''
        return s
      },
      out: () => {
        pos = 'dib'
        if (cls.length == 0) cls = 'output'
        let s = ''
        s += lbl.length > 0 ? '<label class="label">' + lbl + ' ' : ''
        s += '<span '
        return s
      },
      rad: () => {
        if (cls.length == 0) cls = 'radio'
        return '<form' + (fn.length > 0 ? (s += ' onclick="' + fn + '"') : '')
      },
      sel: () => {
        if (cls.length == 0) cls = 'select'
        let s = ''
        s += lbl.length > 0 ? '<label class="label">' + lbl + ' ' : ''
        s += '<select '
        s += fn.length > 0 ? '  onchange="' + fn + '"' : ''
        return s
      },
      sld: () => '<input type="range" ' + txt + ' oninput="' + fn + '" onchange="' + fn + '"',
    }[tag]() || ''
  if (id.length > 0) s += ' id="' + id + '"'
  if (cls.length > 0) s += ' class="' + cls + '"'
  if (pos == 'dib') s += ' style="position:relative; display:inline-block;' + style + '"'
  if (pos == 'rel') s += ' style="position:relative; ' + style + '"'
  if (pos == 'abs') s += ' style="position:absolute; ' + style + '"'
  s +=
    {
      btn: () => '>' + txt + '</button>',
      can: () => '></canvas>',
      div: () => ' >' + txt + '</div>',
      edit: () => ' >' + txt + '</textarea>',
      inp: () => '>' + (lbl.length > 0 ? '</label>' : ''),
      out: () => ' >' + txt + '</span>' + (lbl.length > 0 ? '</label>' : ''),
      rad: () => {
        let s = ''
        s += '>\n'
        for (let i = 0; i < opts.length; i++) {
          let chk = ''
          if (i == 0) chk = 'checked'
          s += '<input type="radio" id="r' + i + '" name="typ" style="cursor:pointer;" value="' + opts[i][0] + '" ' + chk + ' />\n'
          s += '<label for="r' + i + '" style="cursor:pointer;">' + opts[i][1] + '</label><br/>\n'
        }
        s += '</form>'
        return s
      },
      sel: () => {
        let s = ''
        s += '>\n'
        for (let i = 0; i < opts.length; i++) {
          let opt = opts[i]
          let idStr = id + i
          let chkStr = opt.descr == txt ? ' selected ' : ''
          s += '<option id="' + idStr + '" value="' + opt.name + '"' + chkStr + '>' + opt.descr + '</option>\n'
        }
        s += '</select>'
        if (lbl.length > 0) s += '</label>'
        return s
      },
      sld: () => '>',
    }[tag]() || ''
  s += '\n'
  return s.trim()
}

init()
