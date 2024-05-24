# REGL Dots Example

This example demonstrates how to use REGL to create an accelerated scatter plot capable of rendering 10,000+ points and animating them smoothly. In contrast to the `scatterplot` example, this sample uses **preloadable** animations to perform animations within a shader rather than computing the interpolated position every frame in JavaScript (which requires expensive CPU-GPU data transfer).

## Setup

To run this example locally, first install the local Counterpoint version:

```bash
cd counterpoint && npm install && cd ..
```

Then install example dependencies and start the dev server:

```bash
cd examples/regl_dots
npm install
npm run dev
```
