---
layout: post
title: 'Example: Canvas Scatterplot'
---

This example illustrates how to use basic marks and attributes to animate the x, y, and color properties of a set of point marks. When you click the Animate button, all points change color, while half the points simultaneously change x-coordinates. When you click the Animate button more than once in succession, the points animate from their current locations.

<canvas style="width: 500px; height: 500px;" id="scatterplot-canvas"></canvas>
<button id="animate-button">Animate</button>

<script type="text/javascript">
import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then((counterpoint) => {
  // canvas setup
  const canvas = document.getElementById("scatterplot-canvas");
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;

  // increments when the user clicks the button
  let colorIdx = 0;

  // initialize the render group with 100 marks
  let markSet = new counterpoint.MarkRenderGroup(
    new Array(100).fill(0).map(
      (_, i) =>
        new counterpoint.Mark(i, {
          x: Math.random() * 500,
          y: Math.random() * 500,
          color: () => (colorIdx % 2 == 0 ? '#9f1239' : '#4338ca')
        })
    )
  );

  // Animate button event handler
  document.getElementById('animate-button').addEventListener('click', () => {
    // when the button is clicked, alternate the color and move half the points' x coordinate
    colorIdx += 1;
    markSet
      .animate('color')
      .filter((m) => m.id % 2 == 0)
      .animateTo('x', (m) => (m.attr('x') + 100) % 500, {
        delay: (m) => m.id * 10,
      });
  });

  // drawing function that will get called by the Ticker every time a redraw is needed
  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.0;
        markSet.stage.forEach((mark) => {
          let x = mark.attr('x');
          let y = mark.attr('y');
          let color = mark.attr('color');
          ctx.fillStyle = color;
          ctx?.beginPath();
          ctx?.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI, false);
          ctx?.fill();
          ctx?.stroke();
          ctx?.closePath();
        });
      }
    }
  }

  let ticker = new counterpoint.Ticker(markSet).onChange(draw);
  draw();
});
</script>

```javascript
import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then((counterpoint) => {
  // canvas setup
  const canvas = document.getElementById("scatterplot-canvas");
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;

  // increments when the user clicks the button
  let colorIdx = 0;

  // initialize the render group with 100 marks
  let markSet = new counterpoint.MarkRenderGroup(
    new Array(100).fill(0).map(
      (_, i) =>
        new counterpoint.Mark(i, {
          x: Math.random() * 500,
          y: Math.random() * 500,
          color: () => (colorIdx % 2 == 0 ? '#9f1239' : '#4338ca')
        })
    )
  );

  // Animate button event handler
  document.getElementById('animate-button').addEventListener('click', () => {
    // when the button is clicked, alternate the color and move half the points' x coordinate
    colorIdx += 1;
    markSet
      .animate('color')
      .filter((m) => m.id % 2 == 0)
      .animateTo('x', (m) => (m.attr('x') + 100) % 500, {
        delay: (m) => m.id * 10,
      });
  });

  // drawing function that will get called by the Ticker every time a redraw is needed
  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.0;
        markSet.stage.forEach((mark) => {
          let x = mark.attr('x');
          let y = mark.attr('y');
          let color = mark.attr('color');
          ctx.fillStyle = color;
          ctx?.beginPath();
          ctx?.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI, false);
          ctx?.fill();
          ctx?.stroke();
          ctx?.closePath();
        });
      }
    }
  }

  let ticker = new counterpoint.Ticker(markSet).onChange(draw);
  draw();
});
```