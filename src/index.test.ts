import { deepEqual } from 'assert'
import { translateLinesGivenDiff, diffPositionToFilePosition } from './index'

import { readFileSync } from 'fs'
const fixture = require('js-yaml').safeLoad(readFileSync(require.resolve('./index.fixture.yaml')))

describe('translateLinesGivenDiff', () => {
  it('translates rows after applying a diff', () => {
    const {diff, positions} = fixture.three_hunk_diff
    const startPositions = positions.map(position => position.before)

    const translations = translateLinesGivenDiff(startPositions, diff)

    positions.forEach(position => {
      const {before, after, invalidated} = position
      deepEqual(translations.get(before), {
        newPosition: after,
        invalidated
      })
    })
  })

  it('handles lines added at the beginning and end of file', () => {
    const {diff, positions} = fixture.added_lines_at_ends
    const startPositions = positions.map(position => position.before)

    const translations = translateLinesGivenDiff(startPositions, diff)

    positions.forEach(position => {
      const {before, after, invalidated} = position
      deepEqual(translations.get(before), {
        newPosition: after,
        invalidated
      })
    })
  })

  it('handles lines deleted at the beginning and end of file', () => {
    const {diff, positions} = fixture.removed_lines_at_ends
    const startPositions = positions.map(position => position.before)

    const translations = translateLinesGivenDiff(startPositions, diff)

    positions.forEach(position => {
      const {before, after, invalidated} = position
      deepEqual(translations.get(before), {
        newPosition: after,
        invalidated
      })
    })
  })
})

describe('diffPositionToFilePosition', () => {
  it('returns a map of the diff to file positions', () => {
    const {diff, positions} = fixture.mid_file_hunks
    const diffPositions = positions.map(position => position.diff)

    const diffToFilePosition = diffPositionToFilePosition(diffPositions, diff)

    positions.forEach(position => {
      const {diff, file} = position
      deepEqual(diffToFilePosition.get(diff), file)
    })
  })
})
