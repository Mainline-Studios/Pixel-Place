#!/bin/bash

echo "🔥 Firebase Setup Helper"
echo "========================"
echo ""
echo "This script will help you set up Firebase for Pixel Place."
echo ""
echo "STEP 1: Go to Firebase Console"
echo "  → https://console.firebase.google.com/"
echo "  → Sign in and enter any verification codes"
echo ""
echo "STEP 2: Select/Create Project"
echo "  → Look for: pixel-place-823b1"
echo "  → Or create a new project with that name"
echo ""
echo "STEP 3: Enable Firestore"
echo "  → Go to 'Firestore Database'"
echo "  → Click 'Create Database'"
echo "  → Choose location and enable"
echo ""
echo "STEP 4: Get Service Account Key"
echo "  → Go to Project Settings → Service Accounts"
echo "  → Click 'Generate New Private Key'"
echo "  → Download the JSON file"
echo ""
echo "STEP 5: Configure"
echo ""
read -p "Do you have the service account JSON file? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Option 1: Save as file (recommended)"
    echo "  → Save the JSON file as: firebase-service-account.json"
    echo "  → Place it in the project root directory"
    echo ""
    echo "Option 2: Use environment variable"
    echo "  → Copy the entire JSON content"
    echo "  → Create .env.local file"
    echo "  → Add: FIREBASE_SERVICE_ACCOUNT=<paste JSON here>"
    echo ""
    read -p "Enter path to JSON file (or press Enter to skip): " json_path
    
    if [ ! -z "$json_path" ] && [ -f "$json_path" ]; then
        # Copy to project root
        cp "$json_path" "./firebase-service-account.json"
        echo "✅ File copied to project root"
        echo ""
        echo "Creating .env.local with GOOGLE_APPLICATION_CREDENTIALS..."
        echo "GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json" > .env.local
        echo "✅ Configuration complete!"
        echo ""
        echo "Now restart your server: npm run dev"
    else
        echo ""
        echo "Please manually:"
        echo "1. Save the JSON file as 'firebase-service-account.json' in project root"
        echo "2. Create .env.local with: GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json"
    fi
else
    echo ""
    echo "Please follow the steps above to get your Firebase credentials."
    echo "Then run this script again or manually configure .env.local"
fi
