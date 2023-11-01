---
layout: home
---

Canvas Animation makes it easy to create data-driven animations and interactive
graphics in HTML5 Canvas and WebGL. It's ideal for developers who are used to 
working with [D3.js](http://d3js.org/) or other customizable graphics libraries, but 
need more control and design options for animations.

Canvas Animation **is**:

- **Lightweight and fast.** You can animate hundreds to millions of points using
  Canvas Animation.
- **Simple to use.** Canvas Animation's API is beautifully simple, fully typed,
  and uses native JavaScript concepts such as Promises to help you write clean code.
- **Compatible with popular libraries.** Use Canvas Animation in combination with
  [D3](http://d3js.org), [regl](http://regl.party), [Svelte + LayerCake](http://layercake.graphics),
  and more. Let those libraries handle the graphics or the chart logic, we'll
  handle the animations.
  
Canvas Animation **is not**:

- **A replacement for D3 or Vega.** This library makes no assumptions or opinions
  about charts, and doesn't provide any functionality to render chart elements
  such as axes, grids, or legends. (It does, however, offer an animatable
  `Scales` class, which you can use in conjunction with tools like `d3-zoom`.)
- **A graphics library.** Ironically, Canvas Animation doesn't contain any
  rendering code. You bring all the rendering code yourself, which means you can
  make the outputs look exactly as you want!

Ready to get started? Head over to the [quickstart]({% link _pages/01-quickstart.md %}) 
to install and learn the basics.