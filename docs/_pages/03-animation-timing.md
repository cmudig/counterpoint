---
layout: post
title: 'Animations, Timing, and Sequencing'
---

The benefit of encoding your data using Counterpoint's `Attribute`s and `Mark`s
is that you can immediately animate updates to data properties with very little
code change. For example, given the following non-animated code:

```javascript
mark.setAttr('x', mark.attr('x') + 100)
```

making this an animation is as easy as changing `setAttr` to `animateTo`. The
rest is customization and control to fit animation within the needs of
your web app, as we describe below.

## Tickers

All updates and animations of attributes require a ticker to be loaded somewhere in your code. You can set up a
`Ticker` with a single line of code somewhere in your script such as:

```javascript
let ticker = new Ticker(advanceables).onChange(draw);
```

Here, `advanceables` represents an object or array of objects that support the
`advance(dt)` method, which includes `Attribute`, `Mark`, and `MarkRenderGroup`.
Every frame, the ticker will call the `advance` method on each object. If any
of them returns `true` (which happens when an attribute was updated or is being
animated), the render state is considered to have changed, and the `onChange` 
callback is called.

> **WARNING: Ticker Inputs**
>
> It's important to make sure that the argument to the `Ticker` contains *all*
> potentially changing attributes. If not, your draw function might not always get
> called when your attributes change.
> 
{: .block-warning }

Note that while the `advance` method is called on every element every frame,
conditioning on the `advance` methods' return values allows us to reduce the
number of times your drawing code is called.

It's a good idea to call `stop()` on the `Ticker` if you no longer need to
update the rendering, otherwise the `Ticker` will continue to tick until the user
navigates away from the page.

You can also use the related class `LazyTicker`, which behaves similarly to
`Ticker` but *stops* whenever all of its advanceables return `false`. You 
opt-in to the ticker on the fly by calling `start()` whenever there is an
animation you need to run, and it will automatically stop when no longer needed.
This can be useful when you have a lot of advanceable objects that may be
expensive to iterate through when not necessary.

## Specified and Momentary States

Counterpoint maintains a conceptual separation between the final value of an
attribute (its *specified* state) and its intermediate value during an animation 
(the *momentary* state). This allows you to read attribute values with or without
assuming an animation is ongoing.

When drawing marks, for instance, you'll probably want to get the momentary state
of each attribute. To do so, simply use the `Mark.attr` method (which wraps 
`Attribute.get`).
```javascript
let currentX = mark.attr('x');
// OR
let currentX = attribute.get();
```
If no animation is present, this momentary state is *equal* to the specified state.

In other cases in your code, you may want to read the final value of an attribute.
For example, let's say we have a `color` attribute that animates between red and
blue when the user clicks a button. In our click handler, we may want to check
whether the attribute is currently set to red or blue. To do so we can use the
`Mark.data` or `Attribute.data` method:
```javascript
if (mark.data('color') == 'red') mark.animateTo('color', 'blue');
else mark.animateTo('color', 'red');
```

<div>
    <canvas id="momentary-spec-canvas" style="width: 400px; height: 200px; border: 1px solid #999;"></canvas>
    <div><button style="margin-bottom: 32px;" id="momentary-spec-btn">Change Color</button></div>
    <script>
        import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then(({ Mark, Ticker, MarkRenderGroup }) => {
            const canvas = document.getElementById("momentary-spec-canvas");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            let mark = new Mark('mark-id', { color: 'red' });

            function draw() {
                const ctx = canvas.getContext('2d');

                // scaling for 2x devices
                ctx.resetTransform();
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                ctx.fillStyle = mark.attr('color');

                ctx.beginPath();
                ctx.ellipse(200, 100, 20, 20, 0, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();

                ctx.font = "12pt 'Helvetica Neue'";
                ctx.textAlign = 'center';
                ctx.fillStyle = 'black';
                ctx.fillText(`Specified: ${mark.data('color')} Momentary: ${mark.attr('color')}`, 200, 180);
            }

            let ticker = new Ticker(mark).onChange(() => draw());

            document.getElementById('momentary-spec-btn').addEventListener('click', () => {
              if (mark.data('color') == 'red') mark.animateTo('color', 'blue');
              else mark.animateTo('color', 'red');
            });

            draw();
        });
    </script>
</div>

### Choosing the Specified State Value

Each mark and render group provides two animation functions: `animateTo`
and `animate`. 

To specify the final state value directly, use `animateTo`, as follows:
```javascript
mark.animateTo('x', 100);
```
Using the same function, we can also specify that the mark or attribute should 
be assigned a new value function and its value animated to the function's result:
```javascript
mark.animateTo('x', getX);
```

Now, if the final state value will be computed implicitly by the 
attribute's *existing* value function, we can use `animate` without a value 
argument:
```javascript
mark.animate('x');
```

When running animations on an entire render group, we may want to specify a 
different final value per mark. To do so, we can use `MarkRenderGroup.animateTo`
and pass a function as argument:
```javascript
renderGroup.animateTo('x', (mark) => mark.attr('x') + 100);
```

> **TIP: Chaining Animations**
>
> Animation calls on the same object can be chained together. For example,
> `mark.animate('x').animate('y')` animates both the `x` and `y` attributes
> simultaneously.
> 
{: .block-tip }


## Animation Timing Options

We can add arguments to the call to `animate` or `animateTo` to specify the duration,
delay, curve, or custom interpolation behavior.

For example, to animate a mark slowly with a delay and an cubic ease-in-out
easing function:
```javascript
mark.animate('color', {
    duration: 2000, // 2 seconds
    delay: 500, // 0.5 seconds
    curve: curveEaseInOut
});
```

The animation curve can be any function that takes a linear animation progress value
between 0 and 1, and returns a new animation progress value. For example, 
you can use [D3's ease functions](https://d3js.org/d3-ease) directly.

### Custom Interpolators

*Interpolators* in Counterpoint are objects that have a single function,
`interpolate`. This function should take an initial value and
a progress value (between 0 and 1), and produce the momentary value for the
attribute. 

By default, Counterpoint animates numerical attributes using a
continuous numerical interpolator, and string attributes using a color interpolator.
However, you can also define a custom interpolator to support animations on
different data types.

For example, let's say we want to create a typewriter-style animation for text,
in which the existing characters will be deleted one-by-one, followed by adding
the new characters one-by-one:

<div>
    <canvas id="typewriter-canvas" style="width: 300px; height: 300px; border: 1px solid #999;"></canvas>
    <div><button style="margin-bottom: 32px;" id="typewriter-animate">New Fruit!</button></div>
    <script>
        import('https://cdn.jsdelivr.net/npm/counterpoint-vis@latest/dist/counterpoint-vis.es.js').then(({ Mark, Ticker, MarkRenderGroup }) => {
            const canvas = document.getElementById("typewriter-canvas");
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            const fruits = ['apples', 'oranges', 'grapes', 'bananas', 'pineapples'];
            let textMark = new Mark('mark-id', {
                fruit: 'apples',
                text: (m) => `I like ${m.attr('fruit')}`
            });
            
            function draw() {
                const ctx = canvas.getContext('2d');

                // scaling for 2x devices
                ctx.resetTransform();
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

                // Create gradient
                var gradient = ctx.createLinearGradient(0,100,300,200);
                gradient.addColorStop("0","magenta");
                gradient.addColorStop("0.5","purple");
                gradient.addColorStop("1.0","blue");
                // Fill with gradient
                ctx.fillStyle = gradient;

                ctx.font = "24pt 'Helvetica Neue'";
                ctx.textAlign = 'center';
                ctx.fillText(textMark.attr('text'), 150, 150);
            }

            function makeTypewriterInterpolator(finalValue) {
                return { 
                    finalValue,
                    interpolate (initialValue, t) {
                        let initialLength = initialValue.length;
                        let finalLength = finalValue.length;
                        let total = initialLength + finalLength;
                        if (t < initialLength / total)
                            return initialValue.slice(0, initialLength - Math.floor(t * total));
                        else
                            return finalValue.slice(0, Math.floor((t - initialLength / total) * total));
                    }
                };
            }

            let ticker = new Ticker(textMark).onChange(() => draw());

            document.getElementById('typewriter-animate').addEventListener('click', () => {
              textMark.setAttr('fruit', fruits[Math.floor(Math.random() * fruits.length)]);
              textMark.animate('text', { 
                interpolator: makeTypewriterInterpolator(textMark.data('text')),
                duration: 1000
              });
            });

            draw();
        });
    </script>
</div>

We will store the text value in an attribute:
```javascript
let textMark = new Mark('mark-id', {
    text: 'I like apples'
});
```
Then, we define an interpolator object by creating a factory function that creates 
an interpolator given a final value:
```javascript
function makeTypewriterInterpolator(finalValue: string): Interpolator<string> {
    return { 
        finalValue, // store the final value in the returned object for internal bookkeeping
        interpolate (initialValue, t) {
            let initialLength = initialValue.length;
            let finalLength = finalValue.length;
            let total = initialLength + finalLength;
            if (t < initialLength / total)
                return initialValue.slice(0, initialLength - Math.floor(t * total));
            else
                return finalValue.slice(0, Math.floor((t - initialLength / total) * total));
        }
    };
}
```

Finally, we pass the interpolator to the mark in our call to `animate` (note we
do not use `animateTo` because we are using a custom interpolator):
```javascript
textMark.animate('text', {
    interpolator: makeTypewriterInterpolator('I like oranges'),
    duration: 1000
});
```

## Waiting for an Animation to Complete

Animations in Counterpoint run asynchronously, so a call to `animate` or
`animateTo` simply *starts* the animation. To wait until an animation is
completed and then run some code, use the aptly-named `wait` method. This method
returns a `Promise` that resolves when the animation completes, and rejects if 
the animation is canceled by the start of another animation or attribute update.
(If no animation is currently running, the Promise immediately resolves.)

For example, to create a pulse animation:

```javascript
async function pulse() {
    mark.animateTo('radius', 1.2)
    await mark.wait('radius');
    mark.animateTo('radius', 1.0);
}
```

Note that you must specify which attribute name(s) to wait on (either a string 
or an array of strings). If you specify multiple attributes, the Promise resolves
only when all attributes' animations have completed, and rejects if any of them
are canceled.
