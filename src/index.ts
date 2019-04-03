import {parse} from 'what-the-diff'
import {MarkerIndex} from 'superstring'
import { GitProcess } from 'dugite'

export default async function translateLines(lines, repositoryPath, fileName, commitSha) {
  const diff = await getDiff(repositoryPath, fileName, commitSha)
  return translateLinesGivenDiff(lines, diff)
}

export async function getDiff(respositoryPath, fileName, commitSha) {
  const result = await GitProcess.exec([ 'diff', commitSha, '--', fileName], respositoryPath)
  if (result.exitCode === 0) {
    return result.stdout
  } else {
    throw new Error(result.stderr)
  }
}


const isCtx = (line: string) => line[0] === ' '
const isAdd = (line: string) => line[0] === '+'
const isDel = (line: string) => line[0] === '-'


export function translateLinesGivenDiff(lines: number[], diffInput) {
  let diff
  if (diffInput.constructor === String) {
    diff = parse(diffInput)[0]
  } else if (diffInput.hunks) {
    diff = diffInput
  } else {
    throw new Error('Invalid diff input')
  }

  const index = new MarkerIndex()

  // insert markers corresponding to original line positions
  lines.forEach((row, i) => {
    index.insert(i, {row, column: 0}, {row: row + 1, column: 0})
    // "exclusive" means that splices at the beginning/end are considered outside
    // splices at the beginning move the marker's start position
    // splices at the end will not move the marker's end position
    index.setExclusive(i, true)
  })

  let delta = 0
  const invalidatedMarkers = new Set()

  diff && diff.hunks.forEach(hunk => {

    let row = hunk.oldStartLine + delta
    hunk.lines.forEach(line => {
      let invalidated

      if (isDel(line)) {
        invalidated = index.splice({row, column: 0}, {row: 1, column: 0}, {row: 0, column: 0})
        delta--
      } else if (isAdd(line)) {
        invalidated = index.splice({row, column: 0}, {row: 0, column: 0}, {row: 1, column: 0})
        delta++
        row++
      } else if (isCtx(line)) {
        row++
      }

      invalidated && invalidated.surround.forEach(value => invalidatedMarkers.add(value))
    })
  })

  const newPositions = index.dump()

  const translations = new Map()
  lines.forEach((row, i) => {
    translations.set(row, {
      newPosition: newPositions[i].start.row,
      invalidated: invalidatedMarkers.has(i)
    })
  })

  return translations
}

export function diffPositionToFilePosition(positions: number[], diffInput) {
  let diff
  if (diffInput.constructor === String) {
    diff = parse(diffInput)[0]
  } else if (diffInput.hunks) {
    diff = diffInput
  } else {
    throw new Error('Invalid diff input')
  }

  // Create set for constant lookup time
  const positionSet = new Set(positions)

  const diffToFilePosition = new Map()

  let diffPositionCounter = 0
  diff.hunks.forEach(hunk => {
    // count header line
    diffPositionCounter++

    let filePositionCounter = hunk.newStartLine
    hunk.lines.forEach((line, index) => {
      if (isAdd(line) || isCtx(line)) {
        if (index === 0) {
          // don't increment since this is hunk.newStartLine
        } else {
          filePositionCounter++
        }
      }

      if (positionSet.has(diffPositionCounter)) {
        diffToFilePosition.set(diffPositionCounter, filePositionCounter)
      }

      diffPositionCounter++
    })

  })

  return diffToFilePosition
}
