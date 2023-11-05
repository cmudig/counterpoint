# Canvas Animation Library

This is a library to help people develop beautiful large-scale animated data visualizations using HTML5 Canvas and WebGL.

## Installation and Usage

Production install instructions TBD. You can use a static ESM version of the library in vanilla JS like so:

```javascript
import { Mark, Attribute } from 'https://cdn.jsdelivr.net/gh/venkatesh-sivaraman/canvas-animation@main/canvas-animation/dist/canvas-animation.es.js';
```

## Dev Installation

Clone the repository, then from within the repo directory run:

```bash
cd canvas-animation
npm install
npm run dev
```

This watches the library contents and rebuilds automatically to the `canvas-animation/dist` directory.

You can run the examples by going into their respective directories, running `npm install`, then `npm run dev`.

## Documentation Build

If not installed, install [Ruby and Jekyll](https://jekyllrb.com/docs/installation/). Then `cd` into the `docs` directory and run:

```bash
bundle install
bundle exec jekyll serve
```
