# noqa: INP001
"""Custom Hatch build hook for building Bondify frontend.

This hook runs npm install and npm build during the wheel build process
to bundle the frontend assets into the package.
"""

import os
import shutil
import subprocess
from sys import stderr

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


class CustomBuildHook(BuildHookInterface):
    """Build hook that compiles the frontend before packaging."""

    def initialize(self, version, build_data):
        """Run npm build before creating the wheel."""
        super().initialize(version, build_data)
        
        # Check if we should skip frontend build
        if os.environ.get("BONDIFY_SKIP_FRONTEND_BUILD", "").lower() == "true":
            stderr.write(">>> Skipping frontend build (BONDIFY_SKIP_FRONTEND_BUILD=true)\n")
            return
        
        stderr.write(">>> Building Bondify frontend\n")
        
        npm = shutil.which("npm")
        if npm is None:
            stderr.write("WARNING: npm not found, skipping frontend build\n")
            stderr.write("         Install Node.js to build frontend assets\n")
            return
        
        # Install dependencies
        stderr.write("### npm install\n")
        result = subprocess.run([npm, "install"], capture_output=True, text=True)
        if result.returncode != 0:
            stderr.write(f"npm install failed: {result.stderr}\n")
            raise RuntimeError("npm install failed")
        
        # Build frontend
        stderr.write("### npm run build\n")
        os.environ["VITE_API_BASE_URL"] = ""  # Use relative URLs for bundled version
        result = subprocess.run([npm, "run", "build"], capture_output=True, text=True)
        if result.returncode != 0:
            stderr.write(f"npm build failed: {result.stderr}\n")
            raise RuntimeError("npm build failed")
        
        stderr.write(">>> Frontend build completed!\n")
