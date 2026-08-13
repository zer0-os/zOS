#!/bin/bash
# Gato Demo Script
# Shows off the cat-themed Git wrapper

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "🐱===============================================🐱"
echo "                GATO DEMO                        "
echo "        Cat-themed Git with MEOW Tokens          "
echo "🐱===============================================🐱"
echo -e "${NC}"

# Create a temporary directory for demo
DEMO_DIR=$(mktemp -d)
echo -e "${BLUE}📁 Created demo directory: $DEMO_DIR${NC}"

# Change to demo directory
cd "$DEMO_DIR"

echo -e "\n${YELLOW}🎬 Starting Gato demonstration...${NC}\n"

# Check if gato is installed
if ! command -v gato &> /dev/null; then
    echo -e "${RED}❌ Gato is not installed. Please run the install script first.${NC}"
    exit 1
fi

# Function to pause for dramatic effect
pause() {
    echo -e "${BLUE}Press Enter to continue...${NC}"
    read -r
}

# Demo 1: Show help
echo -e "${GREEN}🐱 Demo 1: Getting help from our feline friend${NC}"
echo -e "${YELLOW}Command: gato help${NC}"
pause
gato help
echo ""

# Demo 2: Initialize a repo
echo -e "${GREEN}🐱 Demo 2: Spawning a new litter (initializing a repo)${NC}"
echo -e "${YELLOW}Command: gato spawn${NC}"
pause
gato spawn
echo ""

# Demo 3: Create a file and hunt for it
echo -e "${GREEN}🐱 Demo 3: Creating a file and hunting for changes${NC}"
echo "Creating a sample file..."
cat > README.md << 'EOF'
# My Cat Project 🐱

This is a demo project created with Gato!

## Features
- Lots of cats
- MEOW tokens
- Purr-fect commits

Meow! 🐾
EOF

echo -e "${YELLOW}Command: gato hunt README.md${NC}"
pause
gato hunt README.md
echo ""

# Demo 4: Pounce on the changes
echo -e "${GREEN}🐱 Demo 4: Pouncing on those changes (committing)${NC}"
echo -e "${YELLOW}Command: gato pounce -m \"Initial commit - let the hunting begin!\"${NC}"
pause
gato pounce -m "Initial commit - let the hunting begin!"
echo ""

# Demo 5: Check MEOW token status
echo -e "${GREEN}🐱 Demo 5: Checking our MEOW token balance${NC}"
echo -e "${YELLOW}Command: gato meow-status${NC}"
pause
gato meow-status
echo ""

# Demo 6: Create a branch
echo -e "${GREEN}🐱 Demo 6: Scratching a new branch${NC}"
echo -e "${YELLOW}Command: gato scratch feature/catnip${NC}"
pause
gato scratch feature/catnip
echo ""

# Demo 7: Prowl to the new branch
echo -e "${GREEN}🐱 Demo 7: Prowling to the new branch${NC}"
echo -e "${YELLOW}Command: gato prowl feature/catnip${NC}"
pause
gato prowl feature/catnip
echo ""

# Demo 8: Make more changes
echo -e "${GREEN}🐱 Demo 8: Adding more feline features${NC}"
cat > catnip.txt << 'EOF'
🌿 CATNIP CONFIGURATION 🌿

Catnip Level: Maximum
Purr Intensity: 11/10
Zoom Factor: Supersonic
Treat Dispenser: Always On

Remember: A day without catnip is like... well, it's still pretty good because you're a cat.
EOF

echo -e "${YELLOW}Command: gato hunt catnip.txt${NC}"
pause
gato hunt catnip.txt

echo -e "${YELLOW}Command: gato pounce -m \"Add catnip configuration for enhanced purring\"${NC}"
pause
gato pounce -m "Add catnip configuration for enhanced purring"
echo ""

# Demo 9: Check memory (log)
echo -e "${GREEN}🐱 Demo 9: Checking our meowmory (commit history)${NC}"
echo -e "${YELLOW}Command: gato meowmory --oneline${NC}"
pause
gato meowmory --oneline
echo ""

# Demo 10: Final status check
echo -e "${GREEN}🐱 Demo 10: Final MEOW token status${NC}"
echo -e "${YELLOW}Command: gato meow-status${NC}"
pause
gato meow-status
echo ""

# Demo complete
echo -e "${PURPLE}"
echo "🎉===============================================🎉"
echo "               DEMO COMPLETE!                    "
echo "     You've earned some serious MEOW tokens!     "
echo "🎉===============================================🎉"
echo -e "${NC}"

echo -e "${GREEN}✨ Demo repository created at: $DEMO_DIR${NC}"
echo -e "${BLUE}💡 You can explore the repo further or clean it up when done.${NC}"
echo -e "${YELLOW}🐱 Thanks for trying Gato! May your commits be purr-fect!${NC}"

# Cleanup option
echo ""
echo -e "${YELLOW}Would you like to clean up the demo directory? (y/N):${NC}"
read -r cleanup_response
if [[ "$cleanup_response" =~ ^[Yy]$ ]]; then
    cd /
    rm -rf "$DEMO_DIR"
    echo -e "${GREEN}🧹 Demo directory cleaned up!${NC}"
else
    echo -e "${BLUE}📁 Demo directory preserved at: $DEMO_DIR${NC}"
fi