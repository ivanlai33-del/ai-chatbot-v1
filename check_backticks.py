import os

file_path = 'app/api/chat/route.ts'
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    backticks = content.count('`')
    print(f"Total backticks: {backticks}")
    
    # Check for escaped backticks
    escaped = content.count('\\`')
    print(f"Escaped backticks: {escaped}")
    
    # Effective unescaped backticks should be (backticks - escaped)
    # But wait, a double backslash \\ followed by a backtick would mean the backslash is escaped and the backtick is UNESCAPED.
    # Let's just find the positions.
    
    pos = 0
    while True:
        pos = content.find('`', pos)
        if pos == -1: break
        
        # Check if it's escaped
        if pos > 0 and content[pos-1] == '\\':
            # Check for double backslash
            if pos > 1 and content[pos-2] == '\\':
                 print(f"Unescaped backtick at index {pos} (preceded by double backslash)")
            else:
                 # It is escaped
                 pass
        else:
             print(f"Unescaped backtick at index {pos}")
        pos += 1
else:
    print("File not found.")
