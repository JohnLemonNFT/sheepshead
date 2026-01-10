#!/bin/bash

# =============================================================================
# RALPH - Autonomous Claude Code Agent Loop
# =============================================================================
# Adapted from https://github.com/snarktank/ralph for Claude Code
#
# Repeatedly invokes Claude Code to implement user stories from a PRD until
# all requirements are complete. Each iteration gets fresh context but
# maintains memory through git history, progress.txt, and prd.json.
#
# Usage: ./scripts/ralph/ralph.sh [max_iterations]
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
PROMPT_FILE="$SCRIPT_DIR/prompt.md"
ARCHIVE_DIR="$SCRIPT_DIR/archive"

# Default max iterations (can be overridden by command line arg)
MAX_ITERATIONS=${1:-10}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  RALPH - Autonomous Development Loop  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check prerequisites
if ! command -v claude &> /dev/null; then
    echo -e "${RED}Error: Claude Code CLI not found. Install with: npm install -g @anthropic-ai/claude-code${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq not found. Install with: brew install jq${NC}"
    exit 1
fi

if [ ! -f "$PRD_FILE" ]; then
    echo -e "${RED}Error: PRD file not found at $PRD_FILE${NC}"
    echo -e "${YELLOW}Create a prd.json with your user stories first.${NC}"
    exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
    echo -e "${RED}Error: Prompt file not found at $PROMPT_FILE${NC}"
    exit 1
fi

# Initialize progress file if it doesn't exist
if [ ! -f "$PROGRESS_FILE" ]; then
    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "" >> "$PROGRESS_FILE"
    echo "## Codebase Patterns" >> "$PROGRESS_FILE"
    echo "(Patterns discovered during development will be added here)" >> "$PROGRESS_FILE"
    echo "" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
    echo "" >> "$PROGRESS_FILE"
fi

# Check for branch changes and archive if needed
CURRENT_BRANCH=$(git -C "$PROJECT_ROOT" branch --show-current 2>/dev/null || echo "unknown")
STORED_BRANCH=$(jq -r '.branch // empty' "$PRD_FILE" 2>/dev/null || echo "")

if [ -n "$STORED_BRANCH" ] && [ "$STORED_BRANCH" != "$CURRENT_BRANCH" ]; then
    echo -e "${YELLOW}Branch changed from '$STORED_BRANCH' to '$CURRENT_BRANCH'. Archiving previous run...${NC}"
    mkdir -p "$ARCHIVE_DIR"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    ARCHIVE_NAME="${STORED_BRANCH}_${TIMESTAMP}"
    mkdir -p "$ARCHIVE_DIR/$ARCHIVE_NAME"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_DIR/$ARCHIVE_NAME/"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_DIR/$ARCHIVE_NAME/"
    # Reset progress for new branch
    echo "# Ralph Progress Log - Branch: $CURRENT_BRANCH" > "$PROGRESS_FILE"
    echo "" >> "$PROGRESS_FILE"
fi

# Log start
echo "" >> "$PROGRESS_FILE"
echo "## Session Started: $(date '+%Y-%m-%d %H:%M:%S')" >> "$PROGRESS_FILE"
echo "Max iterations: $MAX_ITERATIONS" >> "$PROGRESS_FILE"
echo "" >> "$PROGRESS_FILE"

echo -e "${GREEN}Starting Ralph with max $MAX_ITERATIONS iterations${NC}"
echo -e "PRD: $PRD_FILE"
echo -e "Progress: $PROGRESS_FILE"
echo ""

# Main loop
for ((i=1; i<=MAX_ITERATIONS; i++)); do
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Iteration $i of $MAX_ITERATIONS${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Check if all stories are complete before running
    INCOMPLETE=$(jq '[.stories[] | select(.status != "complete")] | length' "$PRD_FILE" 2>/dev/null || echo "0")
    if [ "$INCOMPLETE" -eq 0 ]; then
        echo -e "${GREEN}All stories complete! Exiting successfully.${NC}"
        echo "" >> "$PROGRESS_FILE"
        echo "## Session Complete: $(date '+%Y-%m-%d %H:%M:%S')" >> "$PROGRESS_FILE"
        echo "All stories implemented successfully!" >> "$PROGRESS_FILE"
        exit 0
    fi

    echo -e "${YELLOW}$INCOMPLETE stories remaining...${NC}"
    echo ""

    # Run Claude Code with the prompt
    # Using --print to run non-interactively and capture output
    OUTPUT=$(cat "$PROMPT_FILE" | claude --print --dangerously-skip-permissions 2>&1) || true

    # Check for completion signal
    if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  Ralph completed all stories!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo "" >> "$PROGRESS_FILE"
        echo "## Session Complete: $(date '+%Y-%m-%d %H:%M:%S')" >> "$PROGRESS_FILE"
        echo "All stories implemented successfully!" >> "$PROGRESS_FILE"
        exit 0
    fi

    # Brief pause between iterations
    if [ $i -lt $MAX_ITERATIONS ]; then
        echo ""
        echo -e "${YELLOW}Pausing before next iteration...${NC}"
        sleep 2
    fi
done

echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}  Max iterations reached without completion${NC}"
echo -e "${RED}========================================${NC}"
echo -e "Check $PROGRESS_FILE for details."
echo "" >> "$PROGRESS_FILE"
echo "## Session Ended: $(date '+%Y-%m-%d %H:%M:%S')" >> "$PROGRESS_FILE"
echo "Max iterations reached. Manual intervention may be needed." >> "$PROGRESS_FILE"
exit 1
