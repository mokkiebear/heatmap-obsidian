#!/bin/bash

# Set the output directory
OUTPUT_DIR="./EXAMPLE_VAULT/daily notes"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

for YEAR in 2022 2023 2024
do
    for DAY in {1..20}
    do
        DAY_PADDED=$(printf "%02d" $DAY)
        FILENAME="${OUTPUT_DIR}/${YEAR}-04-${DAY_PADDED}.md"
        {
            echo "---"
            echo "steps: 7136"
            echo "exercise: 23 minutes"
            echo "learning: 30 minutes"
            echo "---"
            echo "## Day No ${DAY} in ${YEAR}"
            echo "Good morning! Today is a beautiful day."
            echo "I'm going to learn something new today."
            echo ""
            echo "I learned about the history of the Roman Empire."
            echo ""
            echo "What do you think about the Roman Empire?"
        } > "$FILENAME"
    done
done