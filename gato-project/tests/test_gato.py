#!/usr/bin/env python3
"""
Test suite for Gato - Cat-themed Git wrapper
"""

import unittest
import tempfile
import shutil
import os
import json
from pathlib import Path
import sys

# Add the src directory to the path so we can import gato
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from gato import Gato, MEOWToken, GatoASCII

class TestMEOWToken(unittest.TestCase):
    """Test the MEOW token system"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.original_home = os.environ.get('HOME')
        os.environ['HOME'] = self.test_dir
        self.meow_token = MEOWToken()
    
    def tearDown(self):
        """Clean up test environment"""
        if self.original_home:
            os.environ['HOME'] = self.original_home
        else:
            del os.environ['HOME']
        shutil.rmtree(self.test_dir)
    
    def test_initial_token_state(self):
        """Test initial token state"""
        self.assertEqual(self.meow_token.data['total_meow'], 0)
        self.assertEqual(self.meow_token.data['pounces'], 0)
        self.assertEqual(self.meow_token.data['purr_requests'], 0)
        self.assertEqual(self.meow_token.data['sniff_checks'], 0)
        self.assertEqual(self.meow_token.data['daily_streak'], 0)
        self.assertEqual(len(self.meow_token.data['achievements']), 0)
    
    def test_award_meow_tokens(self):
        """Test awarding MEOW tokens"""
        # Award tokens for a pounce (includes first pounce achievement bonus)
        awarded = self.meow_token.award_meow('pounce', 10)
        self.assertEqual(awarded, 10)
        self.assertEqual(self.meow_token.data['total_meow'], 60)  # 10 + 50 achievement bonus
        self.assertEqual(self.meow_token.data['pounces'], 1)
        
        # Award more tokens
        awarded = self.meow_token.award_meow('general', 5)
        self.assertEqual(awarded, 5)
        self.assertEqual(self.meow_token.data['total_meow'], 65)
    
    def test_achievements(self):
        """Test achievement system"""
        # First pounce achievement
        self.meow_token.award_meow('pounce', 10)
        self.assertIn('first_pounce', self.meow_token.data['achievements'])
        # Should have extra tokens from achievement
        self.assertEqual(self.meow_token.data['total_meow'], 60)  # 10 + 50 bonus
    
    def test_persistence(self):
        """Test that tokens persist between sessions"""
        # Award some tokens
        self.meow_token.award_meow('pounce', 10)
        original_total = self.meow_token.data['total_meow']
        
        # Create a new MEOWToken instance (simulating restart)
        new_meow_token = MEOWToken()
        self.assertEqual(new_meow_token.data['total_meow'], original_total)

class TestGatoASCII(unittest.TestCase):
    """Test the ASCII art class"""
    
    def test_ascii_art_exists(self):
        """Test that ASCII art constants exist"""
        ascii_art = GatoASCII()
        self.assertTrue(hasattr(ascii_art, 'CAT_SITTING'))
        self.assertTrue(hasattr(ascii_art, 'CAT_HUNTING'))
        self.assertTrue(hasattr(ascii_art, 'CAT_POUNCING'))
        self.assertTrue(hasattr(ascii_art, 'CAT_LEAPING'))
        
        # Check that they're not empty
        self.assertGreater(len(ascii_art.CAT_SITTING), 0)
        self.assertGreater(len(ascii_art.CAT_HUNTING), 0)

class TestGato(unittest.TestCase):
    """Test the main Gato class"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_dir = tempfile.mkdtemp()
        self.original_home = os.environ.get('HOME')
        os.environ['HOME'] = self.test_dir
        self.gato = Gato()
    
    def tearDown(self):
        """Clean up test environment"""
        if self.original_home:
            os.environ['HOME'] = self.original_home
        else:
            del os.environ['HOME']
        shutil.rmtree(self.test_dir)
    
    def test_command_mapping(self):
        """Test that command mappings exist"""
        expected_commands = [
            'spawn', 'hunt', 'pounce', 'leap', 'fetch', 'kitten',
            'scratch', 'cuddle', 'hide', 'meowmory', 'groom', 'prowl'
        ]
        
        for command in expected_commands:
            self.assertIn(command, self.gato.command_map)
            
            # Check that each mapping has the required components
            git_cmd, ascii_art, reward, sound = self.gato.command_map[command]
            self.assertIsInstance(git_cmd, str)
            self.assertIsInstance(ascii_art, str)
            self.assertIsInstance(reward, int)
            self.assertIsInstance(sound, str)
            self.assertGreater(reward, 0)
    
    def test_meow_token_rewards(self):
        """Test MEOW token reward system"""
        # Test successful command awards tokens
        awarded = self.gato.award_meow_tokens('pounce', True)
        self.assertEqual(awarded, 10)
        
        # Test failed command doesn't award tokens
        awarded = self.gato.award_meow_tokens('pounce', False)
        self.assertEqual(awarded, 0)
        
        # Test unknown command doesn't award tokens
        awarded = self.gato.award_meow_tokens('unknown', True)
        self.assertEqual(awarded, 0)
    
    def test_cat_sounds(self):
        """Test that cat sounds exist"""
        self.assertGreater(len(self.gato.success_sounds), 0)
        self.assertGreater(len(self.gato.error_sounds), 0)
        
        # Test that all sounds are strings
        for sound in self.gato.success_sounds:
            self.assertIsInstance(sound, str)
        for sound in self.gato.error_sounds:
            self.assertIsInstance(sound, str)

class TestGatoIntegration(unittest.TestCase):
    """Integration tests for Gato functionality"""
    
    def setUp(self):
        """Set up test environment with a temporary git repo"""
        self.test_dir = tempfile.mkdtemp()
        self.original_home = os.environ.get('HOME')
        self.original_cwd = os.getcwd()
        
        os.environ['HOME'] = self.test_dir
        os.chdir(self.test_dir)
        self.gato = Gato()
    
    def tearDown(self):
        """Clean up test environment"""
        os.chdir(self.original_cwd)
        if self.original_home:
            os.environ['HOME'] = self.original_home
        else:
            del os.environ['HOME']
        shutil.rmtree(self.test_dir)
    
    def test_help_command(self):
        """Test help command runs without error"""
        # This should not raise an exception
        try:
            # Capture stdout to avoid cluttering test output
            import io
            import sys
            captured_output = io.StringIO()
            sys.stdout = captured_output
            
            self.gato.run(['help'])
            
            # Restore stdout
            sys.stdout = sys.__stdout__
            
            # Check that help output contains expected content
            output = captured_output.getvalue()
            self.assertIn('GATO', output)
            self.assertIn('spawn', output)
            self.assertIn('pounce', output)
            
        except Exception as e:
            self.fail(f"Help command raised an exception: {e}")
    
    def test_meow_status_command(self):
        """Test meow-status command"""
        try:
            import io
            import sys
            captured_output = io.StringIO()
            sys.stdout = captured_output
            
            self.gato.run(['meow-status'])
            
            sys.stdout = sys.__stdout__
            
            output = captured_output.getvalue()
            self.assertIn('MEOW Token Status', output)
            self.assertIn('Total MEOW', output)
            
        except Exception as e:
            self.fail(f"meow-status command raised an exception: {e}")

if __name__ == '__main__':
    # Run all tests
    unittest.main(verbosity=2)