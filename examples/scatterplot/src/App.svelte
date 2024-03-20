<script lang="ts">
  import {
    Attribute,
    ColorSchemePreference,
    Ticker,
    Mark,
    createRenderGroup,
    curveEaseInOut,
    getRenderContext,
  } from 'counterpoint-vis';
  import { onDestroy } from 'svelte';

  let canvas: HTMLCanvasElement;
  let markSet = createRenderGroup(
    new Array(100).fill(0).map(
      (_, i) =>
        new Mark(i, {
          x: new Attribute(Math.random() * 500),
          y: new Attribute(Math.random() * 500),
          color: new Attribute<string>(getColor),
          alpha: new Attribute(1),
        })
    )
  )
    .configure({
      animationDuration: 500,
      animationCurve: curveEaseInOut,
    })
    .configureStaging({
      initialize: (element) => element.setAttr('alpha', 0.0),
      enter: async (element) => element.animateTo('alpha', 1.0).wait('alpha'),
      exit: async (element) => element.animateTo('alpha', 0.0).wait('alpha'),
    })
    .onEvent('click', (m) => {
      if (m.id % 2 == 0) {
        return m
          .animateTo('x', (m.attr('x') + 100) % 500, {
            delay: m.id * 10,
          })
          .wait('x');
      }
    });
  let ticker = new Ticker([markSet, getRenderContext()]).onChange(draw);

  function draw() {
    if (!!canvas) {
      let ctx = canvas.getContext('2d');

      if (!!ctx) {
        ctx.resetTransform();
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        if (
          getRenderContext().colorSchemePreference == ColorSchemePreference.dark
        ) {
          ctx.fillStyle = '#225';
          ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        }
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.0;
        markSet.stage!.forEach((mark) => {
          ctx?.save();
          let x = mark.attr('x');
          let y = mark.attr('y');
          let color = mark.attr('color');
          ctx!.globalAlpha = mark.attr('alpha');
          ctx!.fillStyle = color;
          ctx?.beginPath();
          ctx?.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI, false);
          ctx?.fill();
          ctx?.stroke();
          ctx?.closePath();
          ctx?.restore();
        });
      }
    }
  }

  $: if (!!canvas) {
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    draw();
  }

  onDestroy(() => ticker.stop());

  let colorIdx = 0;

  function getColor(): string {
    return colorIdx % 2 == 0 ? '#9f1239' : '#4338ca';
  }

  function animatePoints() {
    if (!!markSet.getMarkByID('temp_animation'))
      markSet.removeMark(markSet.getMarkByID('temp_animation')!);
    let testMark = markSet.getMarkByID(
      Math.floor(Math.random() * markSet.count())
    )!;
    testMark.adj('temp', [
      testMark.copy(`temp_animation`, {
        color: 'cyan',
        x: Math.random() * 500,
      }),
    ]);

    markSet
      .dispatch('click')!
      .then(() => {
        colorIdx++;
        markSet.animate('color');
      })
      .catch(() => {
        console.log('animation canceled');
      });
    // because we used a lazy ticker, we have to restart it every time we do an animation
    ticker.start();
  }
</script>

<main>
  <canvas style="width: 500px; height: 500px;" bind:this={canvas} />
  <button on:click={animatePoints}>Animate</button>
</main>
