import os
import subprocess
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

# Missing songs
missing = [
    ("ytsearch1:Pyar Hua Iqrar Hua song", "public/audio/song_10"),
    ("ytsearch1:Moi Eti Jajabor Bhupen Hazarika song", "public/audio/song_13"),
    ("ytsearch1:O Bideshi Bandhu Khagen Mahanta song", "public/audio/song_15"),
]

for query, out_base in missing:
    print(f"Downloading {query}...")
    # download best audio
    cmd = ["python", "-m", "yt_dlp", "-f", "bestaudio", query, "-o", f"{out_base}.%(ext)s"]
    subprocess.run(cmd)

    # find the downloaded file
    downloaded_file = None
    for f in os.listdir("public/audio"):
        if f.startswith(os.path.basename(out_base)) and not f.endswith(".mp3"):
            downloaded_file = os.path.join("public/audio", f)
            break
    
    if downloaded_file:
        out_mp3 = f"{out_base}.mp3"
        print(f"Converting {downloaded_file} to {out_mp3}...")
        conv_cmd = [ffmpeg_exe, "-y", "-i", downloaded_file, "-vn", "-ar", "44100", "-ac", "2", "-b:a", "128k", out_mp3]
        subprocess.run(conv_cmd)
        print(f"Done for {out_mp3}")
    else:
        print(f"Failed to find downloaded file for {out_base}")
