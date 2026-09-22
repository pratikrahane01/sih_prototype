import os
import imageio_ffmpeg
import subprocess

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
for i in range(1, 16):
    in_file = f"public/audio/song_{i}.webm"
    out_file = f"public/audio/song_{i}.mp3"
    if os.path.exists(in_file):
        cmd = [ffmpeg_exe, "-y", "-i", in_file, "-vn", "-ar", "44100", "-ac", "2", "-b:a", "128k", out_file]
        print(f"Converting {in_file} to {out_file}...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error converting {in_file}: {result.stderr}")
