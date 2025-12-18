#!/usr/bin/env python3
"""
Script to replace deprecated Tailwind CSS v4 class names in .tsx files
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Define the replacements
REPLACEMENTS = {
    "flex-shrink-0": "shrink-0",
    "break-words": "break-word",
    "min-w-[200px]": "min-w-50",
    "min-h-[100px]": "min-h-25",
}

def escape_special_chars(s: str) -> str:
    """Escape special regex characters in a string"""
    return re.escape(s)

def replace_in_file(file_path: Path) -> Dict[str, int]:
    """
    Replace deprecated class names in a single file.
    Returns a dict with replacement counts for each class.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return {k: 0 for k in REPLACEMENTS}
    
    original_content = content
    replacement_counts = {}
    
    for old_class, new_class in REPLACEMENTS.items():
        # Use word boundaries for simple class names, but handle bracketed ones specially
        if '[' in old_class:
            # For bracketed classes like min-w-[200px], just do a simple string replacement
            pattern = escape_special_chars(old_class)
        else:
            # For simple classes, use word boundaries
            pattern = r'\b' + escape_special_chars(old_class) + r'\b'
        
        count = len(re.findall(pattern, content))
        replacement_counts[old_class] = count
        
        if count > 0:
            content = re.sub(pattern, new_class, content)
    
    # Only write if content changed
    if content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return replacement_counts
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
            return {k: 0 for k in REPLACEMENTS}
    
    return replacement_counts

def main():
    workspace_path = Path(r"c:\Users\miche\OneDrive\Documentos\roundKids\RoundKids")
    
    if not workspace_path.exists():
        print(f"Error: Workspace path does not exist: {workspace_path}")
        return
    
    # Find all .tsx files
    tsx_files = list(workspace_path.rglob("*.tsx"))
    print(f"Found {len(tsx_files)} .tsx files")
    print("-" * 60)
    
    total_replacements = {k: 0 for k in REPLACEMENTS}
    modified_files = []
    
    for file_path in tsx_files:
        replacements = replace_in_file(file_path)
        
        # Check if any replacements were made
        if any(replacements.values()):
            modified_files.append((file_path, replacements))
            print(f"Modified: {file_path.relative_to(workspace_path)}")
            for old_class, count in replacements.items():
                if count > 0:
                    print(f"  - {old_class} → {REPLACEMENTS[old_class]}: {count} replacement(s)")
            total_replacements = {k: total_replacements[k] + replacements[k] for k in REPLACEMENTS}
    
    print("\n" + "=" * 60)
    print(f"Summary: {len(modified_files)} files modified")
    print("=" * 60)
    
    for old_class, new_class in REPLACEMENTS.items():
        count = total_replacements[old_class]
        print(f"{old_class} → {new_class}: {count} total replacement(s)")
    
    print("=" * 60)
    print("All replacements completed successfully!")

if __name__ == "__main__":
    main()
