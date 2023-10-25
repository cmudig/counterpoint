# REGL Dots Example

This example demonstrates how to use REGL to create an accelerated scatter plot capable of rendering 10,000+ points and animating them smoothly. In contrast to the `scatterplot` example, this sample uses **preloadable** animations to perform animations within a shader rather than computing the interpolated position every frame in JavaScript (which requires expensive CPU-GPU data transfer).

## Setup

```bash
cd tests/regl_dots
npm install
npm run dev
```
