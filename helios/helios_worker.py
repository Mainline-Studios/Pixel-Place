import argparse, os, subprocess
from pathlib import Path
from PIL import Image
import torch
from diffusers import DiffusionPipeline

parser = argparse.ArgumentParser()
parser.add_argument('--mode', choices=['init','continue'], required=True)
parser.add_argument('--prompt', required=True)
parser.add_argument('--job', required=True)
parser.add_argument('--frames', type=int, default=8)
parser.add_argument('--seed', type=int, default=None)
parser.add_argument('--strength', type=float, default=0.6)
args = parser.parse_args()

job_dir = Path(__file__).resolve().parent / 'artifacts' / args.job
frames_dir = job_dir / 'frames'
job_dir.mkdir(parents=True, exist_ok=True)
frames_dir.mkdir(parents=True, exist_ok=True)

# device and dtype heuristics
if torch.cuda.is_available():
    device = "cuda"
    dtype = torch.bfloat16
elif getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
    device = "mps"
    dtype = torch.float16
else:
    device = "cpu"
    dtype = torch.float32

print(f"device={device} dtype={dtype} loading model...")
# adjust model id if needed
model_id = "BestWishYsh/Helios-Base"
pipe = DiffusionPipeline.from_pretrained(model_id, torch_dtype=dtype)
pipe = pipe.to(device)
pipe.safety_checker = None  # optional: handle moderation in your app


def save_img(img, idx):
    path = frames_dir / f"frame{idx:03d}.png"
    img.save(path)
    print("saved", path)
    return path

start_idx = 0
if args.mode == 'init':
    base_seed = args.seed or int.from_bytes(os.urandom(2), 'big')
    for i in range(args.frames):
        seed = base_seed + i
        gen = torch.Generator(device=device).manual_seed(seed)
        out = pipe(args.prompt, generator=gen).images[0]
        save_img(out, i)
    start_idx = args.frames
else:  # continue uses last frame as init image
    existing = sorted(frames_dir.glob("frame*.png"))
    if not existing:
        print("no existing frames to continue; generating initial frame instead")
        gen = torch.Generator(device=device).manual_seed(args.seed or 0)
        out = pipe(args.prompt, generator=gen).images[0]
        save_img(out, 0)
        start_idx = 1
    else:
        last = Image.open(existing[-1]).convert("RGB")
        base_seed = args.seed or int.from_bytes(os.urandom(2), 'big')
        for i in range(args.frames):
            seed = base_seed + i
            gen = torch.Generator(device=device).manual_seed(seed)
            # many diffusion pipelines support init_image param for img2img-style edits.
            # Strength controls how much the model changes the image (0..1)
            out = pipe(args.prompt, init_image=last, strength=args.strength, generator=gen).images[0]
            save_img(out, len(existing)+i)
        start_idx = len(existing) + args.frames

# assemble video with ffmpeg (8 fps; change as desired)
out_video = job_dir / "out.mp4"
print("stitching video to", out_video)
cmd = [
    "ffmpeg", "-y", "-framerate", "8",
    "-i", str(frames_dir / "frame%03d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", str(out_video)
]
subprocess.run(cmd, check=True)
print("done", out_video)
