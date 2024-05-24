# Dynamic Grid Example

This example demonstrates how to use the `StageManager` class to orchestrate mark entry and exit. When you click on the canvas, a square mark is animated in or out at that position in a grid. The color of the mark is chosen randomly when the mark is first created, allowing you to see that marks are reused if you click twice in the same position (hide, then show again).

## Setup

To run this example locally, first install the local Counterpoint version:

```bash
cd counterpoint && npm install && cd ..
```

Then install example dependencies and start the dev server:

```bash
cd examples/dynamic_grid
npm install
npm run dev
```
