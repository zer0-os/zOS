#!/usr/bin/env bash

# Check if app path is provided
if [ -z "$1" ]
then
  echo "No app path provided. Usage: ./validate-macos-signing.sh /path/to/your/app.app"
  exit 1
fi

APP_PATH=$1
EXPECTED_TEAM_ID="R69LH6W94B"

# Verify the code signing
echo "Verifying code signing..."
SIGNING_INFO=$(codesign -dvvv $APP_PATH 2>&1)

# Check if the Team ID is correct
if echo "$SIGNING_INFO" | grep -q "$EXPECTED_TEAM_ID"; then
  echo "App is signed with the correct Team ID."
else
  echo "App is not signed with the correct Team ID."
  exit 1
fi

# Check the notarization status
echo "Checking notarization status..."
NOTARIZATION_INFO=$(spctl --assess --verbose $APP_PATH 2>&1)

# Check if the app is notarized
if echo "$NOTARIZATION_INFO" | grep -q "source=Notarized Developer ID"; then
  echo "App is notarized."
else
  echo "App is not notarized."
  exit 1
fi