#!/bin/bash
# Gato Uninstallation Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Sad cat ASCII art
SAD_CAT='
     /\_/\  
    ( ;_; ) 
     > ^ <  
   Goodbye...
'

echo -e "${PURPLE}${SAD_CAT}${NC}"
echo -e "${BLUE}🐱 Gato Uninstallation 🐱${NC}"
echo -e "${YELLOW}Are you sure you want to remove Gato? (y/N):${NC}"

read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🐱 Phew! Gato stays! Meow! 🐱${NC}"
    exit 0
fi

LOCAL_BIN="$HOME/.local/bin"
GATO_BIN="$LOCAL_BIN/gato"
CONFIG_DIR="$HOME/.gato"

# Remove executable
if [ -f "$GATO_BIN" ]; then
    rm "$GATO_BIN"
    echo -e "${GREEN}✅ Removed Gato executable${NC}"
else
    echo -e "${YELLOW}⚠️  Gato executable not found${NC}"
fi

# Ask about config/MEOW tokens
if [ -d "$CONFIG_DIR" ]; then
    echo -e "${YELLOW}Do you want to remove your MEOW tokens and config? (y/N):${NC}"
    read -r config_response
    if [[ "$config_response" =~ ^[Yy]$ ]]; then
        rm -rf "$CONFIG_DIR"
        echo -e "${GREEN}✅ Removed MEOW tokens and config${NC}"
    else
        echo -e "${BLUE}💰 Keeping your precious MEOW tokens safe!${NC}"
    fi
fi

# Remove desktop shortcut if it exists
if command -v xdg-user-dir &> /dev/null && [ -d "$(xdg-user-dir DESKTOP 2>/dev/null)" ]; then
    DESKTOP_DIR="$(xdg-user-dir DESKTOP)"
    DESKTOP_FILE="$DESKTOP_DIR/Gato.desktop"
    if [ -f "$DESKTOP_FILE" ]; then
        rm "$DESKTOP_FILE"
        echo -e "${GREEN}✅ Removed desktop shortcut${NC}"
    fi
fi

echo -e "${BLUE}🐱 Gato has been uninstalled. Thanks for all the fish... er, MEOW tokens! 🐱${NC}"
echo -e "${YELLOW}💡 Note: PATH modifications in shell config files were left unchanged.${NC}"