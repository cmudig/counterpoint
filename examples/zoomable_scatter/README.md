# Zoomable Scatterplot Example

This example demonstrates adding zoom and pan functionalities to a scatterplot using the `Scales` class. In this instance we use a `d3-zoom` object to convert DOM element interactions to transforms, but commented code in `App.svelte` shows how to use vanilla JS event handlers to achieve similar results.

## Setup

To run this example locally, first install the local Counterpoint version:

```bash
cd counterpoint && npm install && cd ..
```

Then install example dependencies and start the dev server:

```bash
cd examples/zoomable_scatter
npm install
npm run dev
```
