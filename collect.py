import os

output_file = 'project_code_full.txt'
ignore_dirs = {'node_modules', 'dist', 'build', '.git', 'img', 'public'}
ignore_files = {'package-lock.json', 'yarn.lock', '.DS_Store', output_file, '.env'}
extensions = {'.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md'}

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        # Фильтрация папок
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            if file in ignore_files:
                continue
            
            ext = os.path.splitext(file)[1]
            if ext in extensions or file.endswith('.config.js'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        outfile.write(f"\n\n{'='*50}\nFILE: {path}\n{'='*50}\n")
                        outfile.write(content)
                        print(f"Added: {path}")
                except Exception as e:
                    print(f"Error reading {path}: {e}")