import os
import imageio_ffmpeg
import subprocess

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
directory = 'public/audio'
for filename in os.listdir(directory):
    if filename.endswith('.m4a'):
        in_file = os.path.join(directory, filename)
        out_file = os.path.join(directory, filename.replace('.m4a', '.mp3'))
        cmd = [ffmpeg_exe, "-y", "-i", in_file, "-vn", "-ar", "44100", "-ac", "2", "-b:a", "128k", out_file]
        print(f"Converting {in_file} to {out_file}...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error converting {in_file}: {result.stderr}")
