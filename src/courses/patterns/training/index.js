// Training content for the patterns course, in display order: F to S, prerequisites first
// within a tier. Add a lesson file, import it, append it here.
import oneJob from './one-job.js'
import boltOn from './bolt-on.js'
import standIn from './stand-in.js'
import theSocket from './the-socket.js'
import partsNotBloodlines from './parts-not-bloodlines.js'
import orderWindow from './order-window.js'
import pieceByPiece from './piece-by-piece.js'
import oneRadio from './one-radio.js'
import foreignPlug from './foreign-plug.js'
import layersOnTheCoat from './layers-on-the-coat.js'
import frontDesk from './front-desk.js'
import pickThePlay from './pick-the-play.js'
import tripwire from './tripwire.js'
import undoButton from './undo-button.js'
import moodOfTheMark from './mood-of-the-mark.js'
import runSheet from './run-sheet.js'
import walkTheVault from './walk-the-vault.js'
import wholeRig from './whole-rig.js'
export { TIERS } from '../../../training/progress.js'
export { TOOLS, TOOL_BY_ID } from './tools/index.js'

export const NODES = [
  oneJob, boltOn, standIn, theSocket, partsNotBloodlines,
  orderWindow, pieceByPiece, oneRadio,
  foreignPlug, layersOnTheCoat, frontDesk,
  pickThePlay, tripwire,
  undoButton, moodOfTheMark,
  runSheet, walkTheVault,
  wholeRig,
]
export const NODE_BY_ID = Object.fromEntries(NODES.map(n => [n.id, n]))
