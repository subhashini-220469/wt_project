import sys

def keep_ours(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    out = []
    state = 'NORMAL'  # NORMAL, IN_OURS, IN_THEIRS
    
    for line in lines:
        if line.startswith('<<<<<<<'):
            state = 'IN_OURS'
        elif line.startswith('======='):
            state = 'IN_THEIRS'
        elif line.startswith('>>>>>>>'):
            state = 'NORMAL'
        else:
            if state == 'NORMAL' or state == 'IN_OURS':
                out.append(line)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(out)

if __name__ == '__main__':
    keep_ours('frontend-react/src/App.jsx')
    keep_ours('frontend-react/src/styles/index.css')
    print("Resolved conflicts in App.jsx and index.css by keeping HEAD changes.")
