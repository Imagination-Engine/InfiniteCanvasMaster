#!/bin/bash
set -e

# Run the new-block generator
npx tsx scripts/new-block.ts --surface scribe --id chapter --name Chapter

# Verify directories and files are created
DIR="packages/surface-scribe/src/blocks/chapter"
if [ ! -d "$DIR" ]; then
  echo "Expected directory $DIR to exist"
  exit 1
fi

FILES=("chapterBlock.ts" "chapterBlock.test.ts" "ChapterView.tsx" "ChapterView.test.tsx")
for file in "${FILES[@]}"; do
  if [ ! -f "$DIR/$file" ]; then
    echo "Expected file $DIR/$file to exist"
    exit 1
  fi
done

# Adversarial check: fail if already exists
set +e
npx tsx scripts/new-block.ts --surface scribe --id chapter --name Chapter > /dev/null 2>&1
EXIT_CODE=$?
set -e

if [ $EXIT_CODE -eq 0 ]; then
  echo "Adversarial test failed: CLI did not throw error when block already exists."
  exit 1
fi

# Cleanup
rm -rf packages/surface-scribe

echo "New Block CLI tests passed."
exit 0