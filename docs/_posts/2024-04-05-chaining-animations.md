---
layout: post
title: 'Example: Chaining Animations'
---

In this example, an animation is triggered after the successful completion of another animation. If the animation is canceled by the start of a different animation, the second animation will not run.

Click the button below to start pulsating the circles from a random position. Click the button again to stop the current sequence and restart from a different random position.

<canvas style="width: 500px; height: 500px;" id="dot-canvas"></canvas>
<button id="animate-button">Pulse</button>
<button id="stop-button">Stop</button>

<script type="text/javascript">
import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then((counterpoint) => {

  // canvas setup
  const canvas = document.getElementById("dot-canvas");
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;

  const baseRadius = 25;
  const pulseRadius = 15;

  // initialize the render group with 100 marks
  let markSet = new counterpoint.MarkRenderGroup(
    new Array(100).fill(0).map(
      (_, i) =>
        new counterpoint.Mark(i, {
          x: (i % 10) * baseRadius * 2 + baseRadius,
          y: Math.floor(i / 10) * baseRadius * 2 + baseRadius,
          color: `hsl(${i / 100 * 360}, 60%, 70%)`,
          radius: baseRadius
        })
    )
  );

  let pulseIndex = 0;
  // Animate button event handler
  document.getElementById('animate-button').addEventListener('click', () => {
    markSet.get(pulseIndex).animateTo('radius', baseRadius, { duration: 500 });
    pulseIndex = Math.floor(Math.random() * 100);
    pulse();
  });

  document.getElementById('stop-button').addEventListener('click', () => {
    markSet.animateTo('radius', baseRadius, { duration: 500 });
  });

  async function pulse() {
    // calling wait() on an attribute returns a Promise that resolves when the
    // animations on that attribute finish, and rejects when any animation on
    // that attribute is canceled
    try {
      await markSet.get(pulseIndex)
      .animateTo('radius', pulseRadius, { duration: 200 })
      .wait('radius');
      markSet.get(pulseIndex).animateTo('radius', baseRadius, { duration: 600 });
      pulseIndex = (pulseIndex + 1) % 100;
      pulse();
    } catch (e) {}
  }

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
          let radius = mark.attr('radius');
          ctx.fillStyle = color;
          ctx?.beginPath();
          ctx?.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI, false);
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
  const canvas = document.getElementById("dot-canvas");
  canvas.width = canvas.offsetWidth * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;

  const baseRadius = 25;
  const pulseRadius = 15;

  // initialize the render group with 100 marks
  let markSet = new counterpoint.MarkRenderGroup(
    new Array(100).fill(0).map(
      (_, i) =>
        new counterpoint.Mark(i, {
          x: (i % 10) * baseRadius * 2 + baseRadius,
          y: Math.floor(i / 10) * baseRadius * 2 + baseRadius,
          color: `hsl(${i / 100 * 360}, 60%, 70%)`,
          radius: baseRadius
        })
    )
  );

  let pulseIndex = 0;
  // Animate button event handler
  document.getElementById('animate-button').addEventListener('click', () => {
    markSet.get(pulseIndex).animateTo('radius', baseRadius, { duration: 500 });
    pulseIndex = Math.floor(Math.random() * 100);
    pulse();
  });

  document.getElementById('stop-button').addEventListener('click', () => {
    markSet.animateTo('radius', baseRadius, { duration: 500 });
  });

  async function pulse() {
    // calling wait() on an attribute returns a Promise that resolves when the
    // animations on that attribute finish, and rejects when any animation on
    // that attribute is canceled
    try {
      await markSet.get(pulseIndex)
      .animateTo('radius', pulseRadius, { duration: 200 })
      .wait('radius');
      markSet.get(pulseIndex).animateTo('radius', baseRadius, { duration: 600 });
      pulseIndex = (pulseIndex + 1) % 100;
      pulse();
    } catch (e) {}
  }

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
          let radius = mark.attr('radius');
          ctx.fillStyle = color;
          ctx?.beginPath();
          ctx?.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI, false);
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