#!/usr/bin/env python3
"""
Gato - A cat-themed Git wrapper with MEOW token integration
Because every developer needs more cats in their workflow!
"""

import os
import sys
import subprocess
import json
import random
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

class GatoASCII:
    """Collection of cat ASCII art for different commands"""
    
    CAT_SITTING = """
     /\\_/\\  
    ( o.o ) 
     > ^ <  
    """
    
    CAT_HUNTING = """
    /\\   /\\
   (  . .)
    )   (
   (  v  )
    ^^-^^
    """
    
    CAT_POUNCING = """
      /\\_/\\
     ( >_< )
    _)     (_
   (  \\_V_/  )
    \\__\\_/__/
    """
    
    CAT_LEAPING = """
        /\\_/\\
       ( ^.^ )
      _)     (_
     (   \\_/   )
      \\__/|\\__/
         / \\
    """
    
    CAT_SLEEPING = """
     /\\_/\\  
    ( -.- ) 
     > ^ <  
    zzZ..
    """
    
    CAT_GROOMING = """
     /\\_/\\
    ( o_O )
     > \\/ <
    """
    
    CAT_PROWLING = """
       /\\_/\\
      ( o.o )
       > ^ <
    ___) (___ 
    """

class MEOWToken:
    """MEOW token tracking system"""
    
    def __init__(self):
        self.config_dir = Path.home() / '.gato'
        self.config_dir.mkdir(exist_ok=True)
        self.token_file = self.config_dir / 'meow_tokens.json'
        self.load_tokens()
    
    def load_tokens(self):
        """Load MEOW token data from file"""
        if self.token_file.exists():
            with open(self.token_file, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {
                'total_meow': 0,
                'pounces': 0,
                'purr_requests': 0,
                'sniff_checks': 0,
                'daily_streak': 0,
                'last_active': None,
                'achievements': []
            }
        self.save_tokens()
    
    def save_tokens(self):
        """Save MEOW token data to file"""
        with open(self.token_file, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def award_meow(self, action: str, amount: int):
        """Award MEOW tokens for actions"""
        self.data['total_meow'] += amount
        
        # Track specific actions
        if action == 'pounce':
            self.data['pounces'] += 1
        elif action == 'purr_request':
            self.data['purr_requests'] += 1
        elif action == 'sniff_check':
            self.data['sniff_checks'] += 1
        
        # Update daily streak
        today = datetime.now().strftime('%Y-%m-%d')
        if self.data['last_active'] != today:
            if self.data['last_active'] == (datetime.now().replace(day=datetime.now().day-1)).strftime('%Y-%m-%d'):
                self.data['daily_streak'] += 1
            else:
                self.data['daily_streak'] = 1
            self.data['last_active'] = today
        
        self.check_achievements()
        self.save_tokens()
        return amount
    
    def check_achievements(self):
        """Check and award achievements"""
        achievements = []
        
        if self.data['pounces'] >= 1 and 'first_pounce' not in self.data['achievements']:
            achievements.append('first_pounce')
            self.data['total_meow'] += 50
        
        if self.data['pounces'] >= 100 and 'century_pouncer' not in self.data['achievements']:
            achievements.append('century_pouncer')
            self.data['total_meow'] += 500
        
        if self.data['daily_streak'] >= 7 and 'week_warrior' not in self.data['achievements']:
            achievements.append('week_warrior')
            self.data['total_meow'] += 200
        
        if self.data['purr_requests'] >= 10 and 'purr_master' not in self.data['achievements']:
            achievements.append('purr_master')
            self.data['total_meow'] += 300
        
        self.data['achievements'].extend(achievements)
        return achievements
    
    def get_status(self) -> str:
        """Get current MEOW token status"""
        return f"""
🐱 MEOW Token Status 🐱
Total MEOW: {self.data['total_meow']}
Pounces: {self.data['pounces']} (+10 MEOW each)
Purr Requests: {self.data['purr_requests']} (+100 MEOW each)
Sniff Checks: {self.data['sniff_checks']} (+25 MEOW each)
Daily Streak: {self.data['daily_streak']} days
Achievements: {len(self.data['achievements'])}
        """

class Gato:
    """Main Gato class - Git wrapper with cat personality"""
    
    def __init__(self):
        self.meow_token = MEOWToken()
        self.ascii_art = GatoASCII()
        
        # Command mapping: gato_command -> (git_command, ascii_art, meow_reward, sound)
        self.command_map = {
            'spawn': ('init', self.ascii_art.CAT_SITTING, 20, 'mrow'),
            'hunt': ('add', self.ascii_art.CAT_HUNTING, 5, 'meow'),
            'pounce': ('commit', self.ascii_art.CAT_POUNCING, 10, 'POUNCE!'),
            'leap': ('push', self.ascii_art.CAT_LEAPING, 15, 'whoosh'),
            'fetch': ('pull', self.ascii_art.CAT_SITTING, 10, 'purr'),
            'kitten': ('clone', self.ascii_art.CAT_SITTING, 25, 'mew mew'),
            'scratch': ('branch', self.ascii_art.CAT_HUNTING, 8, 'scratch scratch'),
            'cuddle': ('merge', self.ascii_art.CAT_SLEEPING, 20, 'purrrrr'),
            'hide': ('stash', self.ascii_art.CAT_SLEEPING, 5, 'shh'),
            'meowmory': ('log', self.ascii_art.CAT_SITTING, 2, 'meow?'),
            'groom': ('rebase', self.ascii_art.CAT_GROOMING, 15, 'lick lick'),
            'prowl': ('checkout', self.ascii_art.CAT_PROWLING, 8, 'prowl prowl'),
        }
        
        # Cat sounds for different situations
        self.success_sounds = ['purr', 'meow', 'mrow', 'chirp', 'trill']
        self.error_sounds = ['hiss', 'yowl', 'screech', 'growl']
    
    def print_cat_header(self, command: str):
        """Print cat-themed header for commands"""
        if command in self.command_map:
            ascii_art, _, _, sound = self.command_map[command][1:]
            print(f"\n{ascii_art}")
            print(f"🐱 Gato says: {sound}!")
            print(f"📝 Running: gato {command}")
            print("-" * 40)
    
    def execute_git_command(self, gato_command: str, args: List[str]) -> Tuple[bool, str]:
        """Execute the corresponding git command"""
        if gato_command not in self.command_map:
            return False, f"Unknown gato command: {gato_command}"
        
        git_command = self.command_map[gato_command][0]
        cmd = ['git', git_command] + args
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode == 0, result.stdout + result.stderr
        except Exception as e:
            return False, str(e)
    
    def award_meow_tokens(self, command: str, success: bool):
        """Award MEOW tokens based on command and success"""
        if not success:
            return 0
        
        if command not in self.command_map:
            return 0
        
        reward = self.command_map[command][2]
        
        # Determine action type for tracking
        action = 'pounce' if command == 'pounce' else 'general'
        
        awarded = self.meow_token.award_meow(action, reward)
        return awarded
    
    def print_success_message(self, command: str, awarded_meow: int):
        """Print success message with cat sounds"""
        sound = random.choice(self.success_sounds)
        print(f"\n🎉 Success! {sound.upper()}!")
        if awarded_meow > 0:
            print(f"💰 Earned {awarded_meow} MEOW tokens!")
        
        # Check for new achievements
        achievements = self.meow_token.check_achievements()
        if achievements:
            for achievement in achievements:
                print(f"🏆 New Achievement: {achievement.replace('_', ' ').title()}!")
    
    def print_error_message(self, error: str):
        """Print error message with cat sounds"""
        sound = random.choice(self.error_sounds)
        print(f"\n❌ Oops! {sound.upper()}!")
        print(f"Error: {error}")
        print("🐱 This cat needs some help...")
    
    def show_help(self):
        """Show Gato help menu"""
        print("""
🐱 GATO - Git with Attitude, Tokens, and Outstanding cat-ness! 🐱

Cat-themed Git Commands:
  gato spawn      → git init       (Start a new litter)
  gato hunt       → git add        (Hunt for changes)
  gato pounce     → git commit     (Pounce on those changes!)
  gato leap       → git push       (Leap to the remote)
  gato fetch      → git pull       (Fetch the latest)
  gato kitten     → git clone      (Adopt a new kitten)
  gato scratch    → git branch     (Scratch a new branch)
  gato cuddle     → git merge      (Cuddle branches together)
  gato hide       → git stash      (Hide your mess)
  gato meowmory   → git log        (Remember the past)
  gato groom      → git rebase     (Groom your commits)
  gato prowl      → git checkout   (Prowl to another branch)

Special Gato Commands:
  gato meow-status  → Show MEOW token balance
  gato purr-request → Create a pull request (coming soon!)
  gato help         → This help menu

MEOW Token Rewards:
  🐾 Pounces (commits): +10 MEOW
  🏆 Approved Purr Requests: +100 MEOW  
  👃 Sniff Checks (reviews): +25 MEOW
  🌟 Daily streak bonuses and achievements!

Examples:
  gato spawn                    # Initialize a new repo
  gato hunt .                   # Add all files
  gato pounce -m "First hunt!"  # Commit with message
  gato leap                     # Push to remote
  
May your commits be clean and your MEOW tokens plenty! 🐱✨
        """)
    
    def show_meow_status(self):
        """Show MEOW token status"""
        print(self.meow_token.get_status())
    
    def run(self, args: List[str]):
        """Main entry point for Gato"""
        if not args:
            self.show_help()
            return
        
        command = args[0]
        command_args = args[1:]
        
        # Special Gato commands
        if command == 'help':
            self.show_help()
            return
        elif command == 'meow-status':
            self.show_meow_status()
            return
        elif command == 'purr-request':
            print("🚧 Purr Requests coming soon! Stay tuned, fellow cat! 🐱")
            return
        
        # Standard git commands through Gato
        if command in self.command_map:
            self.print_cat_header(command)
            success, output = self.execute_git_command(command, command_args)
            
            if success:
                print(output)
                awarded_meow = self.award_meow_tokens(command, success)
                self.print_success_message(command, awarded_meow)
            else:
                self.print_error_message(output)
        else:
            print(f"🙀 Unknown command: {command}")
            print("Try 'gato help' for available commands!")

def main():
    """Main entry point"""
    gato = Gato()
    gato.run(sys.argv[1:])

if __name__ == '__main__':
    main()