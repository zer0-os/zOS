#!/bin/bash
# Gato Installation Script
# Installs the cat-themed Git wrapper

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Cat ASCII art for installer
CAT_INSTALLER='
     /\_/\  
    ( ^.^ ) 
     > ^ <  
   Installing...
'

echo -e "${PURPLE}${CAT_INSTALLER}${NC}"
echo -e "${BLUE}🐱 Welcome to Gato Installation! 🐱${NC}"
echo -e "${YELLOW}Preparing to install your new cat-themed Git wrapper...${NC}"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed.${NC}"
    echo -e "${YELLOW}Please install Python 3 and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python 3 found!${NC}"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
GATO_SCRIPT="$PROJECT_DIR/src/gato.py"

# Check if gato.py exists
if [ ! -f "$GATO_SCRIPT" ]; then
    echo -e "${RED}❌ Gato script not found at: $GATO_SCRIPT${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Gato script found!${NC}"

# Create ~/.local/bin if it doesn't exist
LOCAL_BIN="$HOME/.local/bin"
mkdir -p "$LOCAL_BIN"

# Copy gato script to local bin
echo -e "${YELLOW}📦 Installing Gato to $LOCAL_BIN...${NC}"
cp "$GATO_SCRIPT" "$LOCAL_BIN/gato"
chmod +x "$LOCAL_BIN/gato"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$LOCAL_BIN:"* ]]; then
    echo -e "${YELLOW}⚠️  $LOCAL_BIN is not in your PATH${NC}"
    echo -e "${BLUE}Adding to your shell configuration...${NC}"
    
    # Determine which shell config file to use
    if [ -n "$ZSH_VERSION" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        if [ -f "$HOME/.bashrc" ]; then
            SHELL_CONFIG="$HOME/.bashrc"
        else
            SHELL_CONFIG="$HOME/.bash_profile"
        fi
    else
        SHELL_CONFIG="$HOME/.profile"
    fi
    
    # Add to PATH if not already there
    if ! grep -q "export PATH.*$LOCAL_BIN" "$SHELL_CONFIG" 2>/dev/null; then
        echo "" >> "$SHELL_CONFIG"
        echo "# Added by Gato installer" >> "$SHELL_CONFIG"
        echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$SHELL_CONFIG"
        echo -e "${GREEN}✅ Added $LOCAL_BIN to PATH in $SHELL_CONFIG${NC}"
    fi
fi

# Create desktop shortcut (optional)
if command -v xdg-user-dir &> /dev/null && [ -d "$(xdg-user-dir DESKTOP 2>/dev/null)" ]; then
    DESKTOP_DIR="$(xdg-user-dir DESKTOP)"
    DESKTOP_FILE="$DESKTOP_DIR/Gato.desktop"
    
    echo -e "${YELLOW}🖥️  Creating desktop shortcut...${NC}"
    cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Gato
Comment=Cat-themed Git wrapper with MEOW tokens
Exec=x-terminal-emulator -e gato help
Icon=applications-games
Terminal=true
Categories=Development;
EOF
    chmod +x "$DESKTOP_FILE"
    echo -e "${GREEN}✅ Desktop shortcut created!${NC}"
fi

# Test installation
echo -e "${YELLOW}🧪 Testing installation...${NC}"
if "$LOCAL_BIN/gato" help &>/dev/null; then
    echo -e "${GREEN}✅ Installation successful!${NC}"
else
    echo -e "${RED}❌ Installation test failed${NC}"
    exit 1
fi

# Success message with cat art
SUCCESS_CAT='
     /\_/\  
    ( ^o^ ) 
     > ^ <  
   SUCCESS!
'

echo -e "${GREEN}${SUCCESS_CAT}${NC}"
echo -e "${BLUE}🎉 Gato has been successfully installed! 🎉${NC}"
echo -e "${YELLOW}Start using it with:${NC}"
echo -e "${PURPLE}  gato help           ${NC}# Show help"
echo -e "${PURPLE}  gato spawn          ${NC}# Initialize a repo"
echo -e "${PURPLE}  gato hunt .         ${NC}# Add files"
echo -e "${PURPLE}  gato pounce -m \"meow\"${NC}# Commit changes"
echo -e "${PURPLE}  gato meow-status    ${NC}# Check MEOW tokens"
echo ""
echo -e "${BLUE}🐱 May your commits be purr-fect! 🐱${NC}"
echo -e "${YELLOW}💡 Tip: You may need to restart your terminal or run 'source ~/.bashrc' (or ~/.zshrc) to use gato immediately.${NC}"