# 9S

## Project Summary

9S is a browser-based 9-slice authoring tool for turning a single frame image into reusable interface assets. It lets you define slice boundaries visually, preview scaling behavior, and export both image slices and CSS implementations for production use.

## Why This Exists

Interface frames often start as bespoke artwork and end up needing to behave like a flexible system. That handoff is usually slow and error-prone.

9S explores a faster bridge between visual asset creation and interface implementation. The core idea is simple: make the slicing, previewing, and export workflow direct, visual, and immediate.

## Key Ideas or Features

- Drag slice handles directly on the canvas.
- Preview how frames scale at different dimensions before export.
- Export both `border-image` and CSS Grid approaches.
- Package the full result as a ZIP with source art plus generated slices.
- Support drag-and-drop uploads and keyboard fine-tuning.
- Keep the entire workflow browser-based with no backend dependency.

## How It Works (High Level)

1. Load a PNG frame into the editor.
2. Adjust horizontal and vertical insets to define the nine regions.
3. Preview the frame at different sizes to validate edge and corner behavior.
4. Generate CSS plus sliced PNG assets from the same source.
5. Download the packaged output for use in game, app, or web interfaces.

## Demo / Screenshots

![9S workspace](public/fullscreen_1.png)

![9S editor](public/fullscreen_2.png)

| 200 x 200 | 800 x 600 |
|:---:|:---:|
| ![Small preview](public/200_200_live_preview.png) | ![Large preview](public/800_600_live_preview.png) |

## Getting Started

### Requirements

- Node.js 18+
- npm

### Run Locally

```bash
git clone https://github.com/newjordan/9S.git
cd 9S
npm install
npm run dev
```

Open `http://localhost:5173`.

## Future Experiments

- Add preset export targets for game UI frameworks and design systems.
- Support batch slicing for frame libraries.
- Expand output formats for additional layout engines.
- Explore prompt-assisted generation of decorative frame variations.
