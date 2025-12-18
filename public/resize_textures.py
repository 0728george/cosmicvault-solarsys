from PIL import Image
import os

input_dir = 'original_textures/'  # Your high-res folder
output_dir = 'public/textures/'   # Astro public folder

resolutions = {
    'low': (1024, 512),   # Fast load
    'med': (2048, 1024),  # Balanced
    'high': (4096, 2048)  # Ultra zoom (or keep original size)
}

os.makedirs(output_dir + 'low/', exist_ok=True)
os.makedirs(output_dir + 'med/', exist_ok=True)
os.makedirs(output_dir + 'high/', exist_ok=True)

for file in os.listdir(input_dir):
    if file.lower().endswith(('.jpg', '.png')):
        img = Image.open(os.path.join(input_dir, file))
        base_name = os.path.splitext(file)[0]  # e.g., 'earth'
        
        for res_name, size in resolutions.items():
            resized = img.resize(size, Image.LANCZOS)  # High-quality resize
            save_path = os.path.join(output_dir, res_name, f'{base_name}_{res_name}{os.path.splitext(file)[1]}')
            resized.save(save_path, quality=85)  # Compress slightly
            print(f'Saved: {save_path}')