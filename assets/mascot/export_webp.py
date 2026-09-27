"""Encode Blender's 48 transparent frames; requires Pillow outside the app."""
from pathlib import Path
import tempfile
from PIL import Image

root = Path(__file__).resolve().parents[2]
paths = sorted((Path(tempfile.gettempdir()) / 'cliniq-robot-frames').glob('robot-*.png'))
assert len(paths) == 48, f'Expected 48 frames; found {len(paths)}'
frames = [Image.open(path).convert('RGBA') for path in paths]
assert all(frame.size == (320, 384) for frame in frames)
assert all(frame.getextrema()[3][0] == 0 for frame in frames), 'Transparency missing'
output = root / 'public/mascot'
output.mkdir(parents=True, exist_ok=True)
frames[0].save(output / 'robot-still.webp', quality=90, method=6)
frames[0].save(output / 'robot-wave.webp', save_all=True, append_images=frames[1:],
               duration=[83, 83, 84] * 16, loop=0, quality=82, method=6)
with Image.open(output / 'robot-wave.webp') as animation:
    assert animation.n_frames == 48
    assert animation.info['loop'] == 0
