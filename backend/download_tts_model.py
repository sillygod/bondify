#!/usr/bin/env python3
"""
Download Piper TTS model for English.

This script downloads the recommended Piper model for English text-to-speech.
Run this before starting the server if you want to use the TTS feature.
"""

import os
import urllib.request
import sys
from pathlib import Path

# Model configuration - using Hugging Face
MODEL_NAME = "en_US-amy-medium"
MODEL_BASE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium"

# Destination directory (relative to this script)
SCRIPT_DIR = Path(__file__).parent
MODELS_DIR = SCRIPT_DIR / "models"


def download_file(url: str, dest_path: Path) -> bool:
    """Download a file with progress indicator."""
    print(f"Downloading: {url}")
    print(f"       To: {dest_path}")
    
    try:
        def progress_hook(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                percent = min(100, downloaded * 100 / total_size)
                sys.stdout.write(f"\r  Progress: {percent:.1f}%")
                sys.stdout.flush()
        
        urllib.request.urlretrieve(url, dest_path, reporthook=progress_hook)
        print()  # New line after progress
        return True
    except Exception as e:
        print(f"\nError downloading: {e}")
        return False


def main():
    print("=" * 60)
    print("Piper TTS Model Downloader")
    print("=" * 60)
    
    # Create models directory
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nModels directory: {MODELS_DIR.absolute()}")
    
    # Files to download (Hugging Face structure)
    files = [
        f"{MODEL_NAME}.onnx",
        f"{MODEL_NAME}.onnx.json",
    ]
    
    success = True
    for filename in files:
        dest_path = MODELS_DIR / filename
        
        if dest_path.exists():
            print(f"\n✓ Already exists: {filename}")
            continue
        
        url = f"{MODEL_BASE_URL}/{filename}"
        print(f"\nDownloading {filename}...")
        
        if not download_file(url, dest_path):
            success = False
            break
        
        print(f"✓ Downloaded: {filename}")
    
    print("\n" + "=" * 60)
    if success:
        print("✓ All files downloaded successfully!")
        print(f"\nModel location: {MODELS_DIR.absolute()}")
        print("\nYou can now start the server with TTS support.")
    else:
        print("✗ Some files failed to download.")
        print("  Please check your internet connection and try again.")
    print("=" * 60)
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
