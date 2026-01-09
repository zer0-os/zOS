# 🐱 Gato - Git with Attitude, Tokens, and Outstanding cat-ness!

**Because every developer needs more cats in their workflow!**

```
     /\_/\  
    ( ^.^ ) 
     > ^ <  
    I'm Gato!
```

Gato is a fun, cat-themed wrapper for Git that gamifies your development workflow with MEOW tokens, achievements, and delightful cat sounds. Turn your boring `git commit` into an exciting `gato pounce`!

## 🚀 Features

- **Cat-themed Commands**: All your favorite Git commands, but with feline flair
- **MEOW Token System**: Earn tokens for your development activities
- **Achievement System**: Unlock achievements as you use Gato
- **ASCII Cat Art**: Beautiful cats accompany every command
- **Cat Sounds**: Delightful meows, purrs, and other cat sounds
- **Daily Streaks**: Keep your coding streak alive
- **Gamified Development**: Make Git fun again!

## 📦 Installation

### Quick Install

```bash
# Clone or download the Gato project
cd gato-project
./scripts/install.sh
```

### Manual Installation

```bash
# Copy gato.py to your local bin
cp src/gato.py ~/.local/bin/gato
chmod +x ~/.local/bin/gato

# Add to PATH if needed
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Requirements

- Python 3.6+
- Git (obviously!)
- A love for cats 🐱

## 🎮 Command Reference

| Gato Command | Git Equivalent | Description | MEOW Reward |
|--------------|----------------|-------------|-------------|
| `gato spawn` | `git init` | Start a new litter (repo) | +20 |
| `gato hunt` | `git add` | Hunt for changes | +5 |
| `gato pounce` | `git commit` | Pounce on those changes! | +10 |
| `gato leap` | `git push` | Leap to the remote | +15 |
| `gato fetch` | `git pull` | Fetch the latest | +10 |
| `gato kitten` | `git clone` | Adopt a new kitten | +25 |
| `gato scratch` | `git branch` | Scratch a new branch | +8 |
| `gato cuddle` | `git merge` | Cuddle branches together | +20 |
| `gato hide` | `git stash` | Hide your mess | +5 |
| `gato meowmory` | `git log` | Remember the past | +2 |
| `gato groom` | `git rebase` | Groom your commits | +15 |
| `gato prowl` | `git checkout` | Prowl to another branch | +8 |

### Special Gato Commands

- `gato help` - Show this help menu with cat wisdom
- `gato meow-status` - Check your MEOW token balance and achievements
- `gato purr-request` - Create a pull request (coming soon!)

## 🎯 MEOW Token System

Earn MEOW tokens for your development activities:

- **Pounces (commits)**: +10 MEOW each
- **Approved Purr Requests (PRs)**: +100 MEOW each
- **Sniff Checks (code reviews)**: +25 MEOW each
- **Daily Streak Bonuses**: Keep coding daily for bonus tokens!
- **Achievement Bonuses**: Unlock special achievements for extra rewards

### Achievements

- 🏆 **First Pounce**: Make your first commit (+50 MEOW)
- 🏆 **Century Pouncer**: Make 100 commits (+500 MEOW)
- 🏆 **Week Warrior**: Code for 7 days straight (+200 MEOW)
- 🏆 **Purr Master**: Create 10 pull requests (+300 MEOW)
- 🏆 And many more to discover!

## 📚 Usage Examples

### Starting a New Project

```bash
# Initialize a new repository
gato spawn
```

```
     /\_/\  
    ( o.o ) 
     > ^ <  

🐱 Gato says: mrow!
📝 Running: gato spawn
----------------------------------------
Initialized empty Git repository in /path/to/repo/.git/

🎉 Success! PURR!
💰 Earned 20 MEOW tokens!
```

### Making Your First Commit

```bash
# Add files to staging
gato hunt .

# Commit with a message
gato pounce -m "Initial commit - let the hunting begin!"
```

```
    /\   /\
   (  . .)
    )   (
   (  v  )
    ^^-^^

🐱 Gato says: meow!
📝 Running: gato hunt
----------------------------------------
[Output of git add]

      /\_/\
     ( >_< )
    _)     (_
   (  \_V_/  )
    \__\_/__/

🐱 Gato says: POUNCE!!
📝 Running: gato pounce
----------------------------------------
[main (root-commit) abc1234] Initial commit - let the hunting begin!
 3 files changed, 42 insertions(+)

🎉 Success! MEOW!
💰 Earned 10 MEOW tokens!
🏆 New Achievement: First Pounce!
```

### Checking Your Progress

```bash
gato meow-status
```

```
🐱 MEOW Token Status 🐱
Total MEOW: 85
Pounces: 5 (+10 MEOW each)
Purr Requests: 1 (+100 MEOW each)
Sniff Checks: 2 (+25 MEOW each)
Daily Streak: 3 days
Achievements: 2
```

### Working with Branches

```bash
# Create a new branch
gato scratch feature/catnip-integration

# Switch to the branch
gato prowl feature/catnip-integration

# Make some changes and commit
gato hunt src/catnip.py
gato pounce -m "Add catnip support for enhanced purring"

# Push to remote
gato leap origin feature/catnip-integration
```

### Viewing History

```bash
# See commit history
gato meowmory --oneline -10
```

## 🔧 Configuration

Gato stores its configuration and MEOW tokens in `~/.gato/`:

- `meow_tokens.json` - Your precious MEOW token data
- Configuration files for future features

## 🎨 Customization

### Adding Custom Cat Art

You can extend the `GatoASCII` class in `src/gato.py` to add your own cat ASCII art:

```python
class GatoASCII:
    YOUR_CUSTOM_CAT = """
    Custom cat art here!
    """
```

### Creating New Commands

Add new command mappings in the `command_map` dictionary:

```python
self.command_map = {
    'your_command': ('git_equivalent', ascii_art, meow_reward, 'sound'),
    # ... existing commands
}
```

## 🧪 Testing

Run the included test suite:

```bash
cd tests/
python -m pytest test_gato.py -v
```

## 🤝 Contributing

We welcome contributions from fellow cat lovers! Here's how:

1. Fork the repository
2. Create a feature branch: `gato scratch feature/amazing-feature`
3. Make your changes and test them
4. Commit: `gato pounce -m "Add amazing feature"`
5. Push: `gato leap origin feature/amazing-feature`
6. Submit a purr request (pull request)

### Development Setup

```bash
# Clone the repo
gato kitten https://github.com/your-repo/gato.git
cd gato

# Install in development mode
pip install -e .

# Run tests
python -m pytest
```

## 🐛 Troubleshooting

### Gato Command Not Found

Make sure `~/.local/bin` is in your PATH:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Python Import Errors

Ensure you have Python 3.6+ installed:

```bash
python3 --version
```

### Git Commands Failing

Gato is a wrapper around Git, so make sure Git is installed and configured:

```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🗑️ Uninstallation

If you must say goodbye to your feline friend:

```bash
./scripts/uninstall.sh
```

This will remove Gato but optionally keep your MEOW tokens safe.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- All the cats who inspired this project 🐱
- The Git community for creating such a purrfect version control system
- Coffee and catnip for fueling development

## 🎭 Fun Facts

- Gato is Spanish for "cat" 
- The average house cat spends 70% of its day sleeping - just like developers debugging
- Cats have a righting reflex, just like good Git practices
- A group of cats is called a "clowder" - just like a development team!

---

**Made with 🐱 and ☕ by cat-loving developers**

*May your commits be clean and your MEOW tokens plenty!*

```
     /\_/\  
    ( ^.^ ) 
     > ^ <  
   Happy coding!
```