![image from "what's my line" tv show](./img/whats-my-line.jpg)

`whats-my-line` is a handy library for displaying GitHub comments within a text editor. It handles calculations to go from diff position (returned from the GitHub API), to file location. It can also calculate adjustments to these locations based on local working directory changes.

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

If we feed the diff positions along with the diff to `diffPositionToFilePosition` then we get a map of those diff positions to the corresponding file positions.

```js
import {diffPositionToFilePosition} from 'whats-my-line';

const diffPositions = [1, 4, 5]
const translations = diffPositionToFilePosition(diffPositions, fileDiffString)

/*
translations = Map {
    1 => 15,   💬 comment 1
    4 => 17,   💬 comment 2
    5 => 18    💬 comment 3
}
*/
```

### translateLinesGivenDiff

If we're in an editor and the version of `file.txt` on disk is different than the version on GitHub that we pulled comment positions from, there is more work to be done. This can happen if the user has made changes locally since last pushing/pulling from their GitHub remote.

Say the user deleted the first 10 lines of the file, and also deleted the line that says "eighteen" on it. The comments would shift up 10 lines, and the line that the third comment was on would be invalidated. Let's use `translateLinesGivenDiff` to give us the new lines and the relevant invalidation information.

The diff for these working directory changes would look like this:

```
diff --git a/file.txt b/file.txt
index 31b14db..0f7ce30 100644
--- a/file.txt
+++ b/file.txt
@@ -1,13 +1,3 @@
-1
-2
-3
-4
-5
-6
-7
-8
-9
-10
 11
 12
 13
@@ -15,7 +5,6 @@
 15
 16
 17
-eighteen
 19
 20
 21
```

```js

import {translateLinesGivenDiff} from 'whats-my-line';

const translations = translateLinesGivenDiff([15,17,18], diffString)

/*
translations = Map {
  15 => { newPosition: 5, invalidated: false },   💬 comment 1
  17 => { newPosition: 7, invalidated: false },   💬 comment 2
  18 => { newPosition: 8, invalidated: true }     💬 comment 3 (corresponding line was removed)
}
*/
```

### Diff input format

Diff inputs may be diff strings directly from Git, or [`what-the-diff`](https://github.com/kuychaco/what-the-diff/) output.
