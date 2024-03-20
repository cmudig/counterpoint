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

## Triggering Render Updates with a Ticker

Before we describe Counterpoint's animation options, it's important to note that
all updates and animations of attributes require a ticker. You can set up a
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

## Animation Timing Options

TBD

## Waiting for an Animation to Complete

TBD

## Animation API Reference

TBD