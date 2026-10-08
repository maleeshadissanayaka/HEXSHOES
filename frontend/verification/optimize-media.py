"""Resize/compress selected presentation images; no generation or application logic."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "node_modules/.cache/phase1-5-media"
destination = root / "public/media/presentation"
destination.mkdir(parents=True, exist_ok=True)
report = []
for name in ("hero", "runner", "trail", "mono", "slide", "story", "texture"):
    with Image.open(source / f"{name}.png") as image:
        image = image.convert("RGB")
        sizes = (640, 960, 1536) if name in ("hero", "story", "texture") else (320, 640, 960)
        for width in sizes:
            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            target = destination / f"{name}-{width}.webp"
            resized.save(target, "WEBP", quality=80, method=6)
            report.append({"file": target.name, "width": width, "height": height, "bytes": target.stat().st_size})
report_path = root / "verification/phase1-5/media-report.json"
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(json.dumps({"assets": report, "totalBytes": sum(item["bytes"] for item in report)}, indent=2) + "\n", encoding="utf-8")
print(f"Optimized {len(report)} WebP variants: {sum(item['bytes'] for item in report):,} bytes total")
