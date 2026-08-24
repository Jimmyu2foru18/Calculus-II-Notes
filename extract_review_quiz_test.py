import easyocr
import os
import sys

base_dir = r'C:\Users\jimmy\Desktop\Calculus-II-Notes'

folders = [
    "Final Review 1",
    "Final Review 2",
    "Final Review 3",
    "Final Review 4",
    "Quiz 01",
    "Quiz 02",
    "Quiz 03",
    "Quiz 1 Prep",
    "Quiz 2 Prep",
    "Quiz 3 Prep",
    "Quiz Practice",
    "Test 1 Review",
    "Test 1.1",
    "Test 2 Ex Review",
    "Test Reviews"
]

print(f"Initializing OCR...")
reader = easyocr.Reader(['en'], gpu=False)

for folder in folders:
    folder_path = os.path.join(base_dir, folder)
    
    if not os.path.exists(folder_path):
        print(f"Folder {folder} does not exist, skipping...")
        continue
    
    images = sorted([f for f in os.listdir(folder_path) if f.lower().endswith('.png')], key=lambda x: int(os.path.splitext(x)[0]))
    
    if len(images) == 0:
        print(f"No images found in {folder}, skipping...")
        continue
    
    print(f"\nProcessing {folder} ({len(images)} images)...")
    
    notes_content = f"# {folder} Notes\n\n"
    
    for img_file in images:
        img_path = os.path.join(folder_path, img_file)
        print(f"  Processing {img_file}...")
        
        result = reader.readtext(img_path, detail=0, paragraph=True)
        text = '\n'.join(result)
        
        notes_content += f"## {img_file}\n\n{text}\n\n"
    
    notes_path = os.path.join(folder_path, 'notes.md')
    with open(notes_path, 'w', encoding='utf-8') as f:
        f.write(notes_content)
    
    print(f"  Created {notes_path}")

print("\nAll notes.md files created successfully!")
