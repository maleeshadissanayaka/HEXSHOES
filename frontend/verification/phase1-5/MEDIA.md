# Phase 1.5 presentation media

Seven original photographic concept compositions were generated with the built-in image-generation tool. No API key, external stock-photo integration, or runtime generation service is used. These images do not document real products, inventory, performance, or a real campaign. Visible presentation labels and image alternative text identify their purpose.

The final application assets are the 21 WebP files in `frontend/public/media/presentation/`. `src/data/presentationMedia.ts` keeps the media separate from future catalog records. Categories, product cards, and the mock visual-search panel reuse the four footwear studies with different crops. The physical mesh study supports the philosophy and technology sections.

| Concept   | Final filenames                                             | Use                                         |
| --------- | ----------------------------------------------------------- | ------------------------------------------- |
| Hero      | `hero-640.webp`, `hero-960.webp`, `hero-1536.webp`          | Cinematic performance hero                  |
| Runner    | `runner-320.webp`, `runner-640.webp`, `runner-960.webp`     | RUN, HX-01, static query/style preview      |
| Trail     | `trail-320.webp`, `trail-640.webp`, `trail-960.webp`        | TRAIL, HX-02, static style preview          |
| Lifestyle | `mono-320.webp`, `mono-640.webp`, `mono-960.webp`           | LIFESTYLE, HX-04, static style preview      |
| Slides    | `slide-320.webp`, `slide-640.webp`, `slide-960.webp`        | SLIDES, HX-03                               |
| Story     | `story-640.webp`, `story-960.webp`, `story-1536.webp`       | Brand-story editorial composition           |
| Material  | `texture-640.webp`, `texture-960.webp`, `texture-1536.webp` | HEX philosophy, visual search, intelligence |

Optimization uses installed Pillow with Lanczos resizing and WebP quality 80, method 6. All variants total 1,569,416 bytes; browsers download selected variants rather than the whole set. The desktop hero is 187,376 bytes; the 640px hero is 41,904 bytes. `media-report.json` records every output's dimensions and byte size. `verification/optimize-media.py` can regenerate outputs from the copied source PNGs in ignored `node_modules/.cache/phase1-5-media/`. The application depends only on the final WebP files, not that cache or the generation tool's source directory.

The hero is eager/high-priority. Below-fold images are lazy, async-decoded, and use responsive `srcset`/`sizes` plus explicit intrinsic dimensions. Crop/framing and tonal treatments use CSS. There are no large original PNGs in the public assets, remote media requests, video files, or animation dependencies.

## Final generation prompts

### Hero

Use case: ads-marketing. Asset type: wide cinematic website hero image, landscape 3:2. Create a premium photorealistic footwear campaign concept, NO text or logos. One original charcoal-black performance running shoe suspended at a dramatic three-quarter angle on the RIGHT two thirds of the composition, toe angled upper-right and heel lower-left, tangible knitted technical upper, sculpted black sole with small restrained cobalt blue heel insert, no existing brand marks. The left third is nearly black negative space for large website typography. Rich directional silver rim lighting shows tactile mesh, sole grooves, stitching. Background deep black #050505, cool black wet concrete surface, subtle diffuse ambient light, photographic diagonal movement trails with a faint blurred second exposure behind the shoe. Strong depth shadow, hard editorial shadows, soft grain, ultra high-end fashion photography, realistic proportions, original speculative product only. Full-bleed composition with large shoe, no borders, no UI, no text, no watermarks, no futuristic HUD, no neon, no warm tones.

### Runner

Use case: product-mockup. Asset type: square premium footwear editorial image used both in a campaign tile and a concept product card. Photorealistic original unbranded black technical running shoe, side three-quarter view with toe to the right, shoe fully inside frame centered occupying 75 percent width, resting on cool silver-gray polished concrete. Charcoal knitted mesh, sculpted matte-black foam sole, tiny cobalt blue heel detail. Background cool light gray, architectural diagonal shaft of light from upper left, strong clean soft shadow on surface, shallow depth of field, rich tactile details, luxury performance footwear studio photography. All surfaces neutral cool tones, not cream. Generous space above and below shoe for cropping. No text, no logos, no existing brand marks, no watermark. Original speculative design, not an official product.

### Trail

Use case: product-mockup. Asset type: square premium outdoor footwear editorial image for campaign tile and concept product card. One original unbranded dark olive-gray trail running shoe, realistic side three-quarter view toe pointing right, shoe fully inside frame centered occupying 75 percent width, deep textured technical upper, rugged graphite outsole. On a dark slate rock pedestal with fine gravel, cool foggy neutral gray background and soft out-of-focus mountain atmosphere. Strong raking daylight, high-end adventure fashion photography, tactile rubber and mesh, beautiful restrained olive-gray against stone gray, no warm yellow. Generous crop space above and below shoe. No text, no logos, no brand marks, no watermark. Original speculative design.

### Lifestyle

Use case: product-mockup. Asset type: square luxury lifestyle sneaker editorial image for campaign tile and concept product card. One original unbranded minimalist pure-white leather sneaker with architectural white sole, side three-quarter view toe pointing right, shoe fully inside frame centered occupying 75 percent width, on cool-gray brutalist concrete step, crisp afternoon diagonal shadow, subtle matte leather texture and refined tonal stitching. Background light gray concrete with gentle architectural shadow, luxury minimalist fashion commerce photography. Colors pure white and silver gray, no beige or cream. Generous crop space above and below. No text, no logos, no existing brand marks, no watermark. Original speculative design.

### Slides

Use case: product-mockup. Asset type: square luxury footwear editorial image for campaign tile and concept product card. One pair of original unbranded sculptural black rubber slides, one slide foreground at diagonal three-quarter angle toe right, second behind, clean matte black molded footbeds and rounded strap, minimal refined form. On cool light-gray architectural stone platform with strong directional sunlight and rich shadow, pure white backdrop with soft diagonal shadows. Premium fashion commerce studio photography, highly tactile, realistic rubber texture, original design. Generous crop space top and bottom. No text, logos, brand marks, watermark, beige, cream.

### Story

Use case: photorealistic-natural. Asset type: wide landscape editorial footwear brand story image. Cropped anonymous athlete's lower legs only in black track pants and original unbranded black technical running footwear, captured mid-stride on dark wet concrete in a modern brutalist city walkway. Cinematic monochrome black and silver palette, low camera angle, powerful directional hard light from right, reflective dark ground, subtle natural motion blur at far leg, exquisitely sharp foreground mesh sneaker, real sense of movement and depth, architectural shadows. No faces, no text, no logos or brand marks, no watermark, no blue neon, no HUD. Premium fashion campaign concept, not documentary or official product photography.

### Material

Use case: product-mockup. Asset type: wide landscape macro material photograph for footwear brand philosophy and technology editorial section. Ultra close crop of physical black knitted technical footwear mesh, sculpted charcoal sole edge and meticulous woven stitching, textile fibers visible, one fine restrained cobalt blue stitch running diagonally across the surface. Dramatic raking silver light and soft black shadows, tactile luxurious performance material, high-end macro product photography, shallow depth of field, original abstract physical material composition. Dark #050505 and cool silvery grays, no warm colors. No text, no logos, no charts, no digital interfaces, no circuitry, no futuristic HUD, no watermarks.

## Remaining limitations

Real product photography and a validated catalog will eventually replace these speculative studies. Generated scenes may contain small material or geometry inconsistencies and do not establish product specifications. The visual-search thumbnails illustrate a layout only and never claim a computed ranking. External fonts still require Google Fonts connectivity, with system fallbacks available.
