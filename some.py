import os

def count_lines_in_folder(folder_path, extensions=None):
    total_lines = 0
    for root, _, files in os.walk(folder_path):
        for file in files:
            if extensions is None or any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = sum(1 for _ in f)
                        total_lines += lines
                except Exception as e:
                    print(f"Could not read {file_path}: {e}")
    return total_lines

# Example usage
folder = "./frontend/src/"
print(f"Total lines: {count_lines_in_folder(folder)}")