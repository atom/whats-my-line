`whats-my-line` is a library for displaying GitHub comments within a text editor. It handles calculations to go from diff position (returned from the GitHub API), to file location. And also calculates adjustments based on working directory changes compared to the tip of the PR branch.

## Installation

whats-my-line is available via npm

    npm install whats-my-line


## Usage

### diffPositionToFilePosition

Say we have three GitHub comments made on the following diff:

```
    diff --git a/file.txt b/file.txt
    index 190423f..9e921c3 100644
    --- a/file.txt
    +++ b/file.txt
    @@ -15,7 +15,7 @@
     15        💬 comment 1
     16
     17
    -18        💬 comment 2
    +eighteen  💬 comment 3
     19
     20
     21
```

` 15` is the first line of the diff and it corresponds to a context line at line 15 in `file.txt` (as indicated by the header `@@ -15,7 +15,7 @@`). `-18` the 4th line of the diff and corresponds to the 17th line of the file (since the 18th line was removed). `+eighteen` is the 5th line in the diff, and corresponds to new text at the 18th line of the file.

If we feed the diff positions to `diffPositionToFilePosition` then we get a map of those diff positions to the corresponding file positions.

```js
import {diffPositionToFilePosition} from 'whats-my-line';

const diffPositions = [1, 4, 5]
const translations = diffPositionToFilePosition(diffPositions, fileDiffString)

/*
translations = Map { 1 => 15, 4 => 17, 5 => 18 }
}
*/
```

### translateLinesGivenDiff


### Diff input format

Diff inputs may be diff strings directly from Git, or [`what-the-diff`](https://github.com/kuychaco/what-the-diff/) output.
