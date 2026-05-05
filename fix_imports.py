
import os
import re

roots = [
    "apps/server/src",
    "packages/agents/src",
    "packages/core/src",
    "packages/db/src",
    "packages/surface-atlas/src",
    "packages/surface-conductor/src",
    "packages/surface-forge/src",
    "packages/surface-playable/src",
    "packages/surface-reel/src",
    "packages/surface-scribe/src",
]

# More robust pattern to match relative imports
# Matches 'from "./..."' and 'import "./..."'
pattern = re.compile(r'(\b(?:from|import)\s+["\'])(\.\.?/[^"\']*)(["\'])')

modified_count = 0

for root_dir in roots:
    if not os.path.exists(root_dir):
        print(f"Directory not found: {root_dir}")
        continue
        
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".ts") or file.endswith(".tsx"):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r') as f:
                    try:
                        content = f.read()
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")
                        continue
                        
                def replace_func(match):
                    prefix = match.group(1)
                    path = match.group(2)
                    suffix = match.group(3)
                    
                    # Check if it already has an extension
                    if re.search(r'\.[a-z0-9]{1,4}$', path):
                        return match.group(0)
                        
                    return f"{prefix}{path}.js{suffix}"
                    
                new_content = pattern.sub(replace_func, content)
                
                if new_content != content:
                    with open(file_path, 'w') as f:
                        f.write(new_content)
                    modified_count += 1
                    print(f"Modified {file_path}")

print(f"\nTotal modified files: {modified_count}")
