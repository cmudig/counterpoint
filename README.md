# Counterpoint: Canvas Animation Library

This is a library to help people develop beautiful large-scale animated data visualizations using HTML5 Canvas and WebGL. [See the docs >](https://dig.cmu.edu/counterpoint)

## Installation and Usage

Install Counterpoint from NPM:

```bash
npm install --save counterpoint-vis
```

You can use a static ESM version of the library in vanilla JS like so:

```javascript
import { Mark, MarkRenderGroup } from 'https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js';
```

## Dev Installation

Clone the repository, then from within the repo directory run:

```bash
cd counterpoint
npm install
npm run dev
```

This watches the library contents and rebuilds automatically to the `counterpoint/dist` directory.

You can run the examples by going into their respective directories, running `npm install`, then `npm run dev`.

## Documentation Build

If not installed, install [Ruby and Jekyll](https://jekyllrb.com/docs/installation/). Then `cd` into the `docs` directory and run:

```bash
bundle install
bundle exec jekyll serve
```
