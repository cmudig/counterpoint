---
layout: post
title: 'Example: VIS Citations'
---

In the below chart, each point represents an IEEE VIS paper published between 1990 and 2022. Lighter colors represent more recent publications, and larger bubbles indicate more highly cited papers. Select a point to connect it to its immediate references and highlight papers that have been "influenced" by that paper (e.g. papers for whom the selected paper is in their citation ancestry).

<div id="citation-chart-container"></div>

<script type="module"> 
  import CitationsChart from "/counterpoint/assets/citations/citations_vis.js";
  new MutationObserver(() => {
    let root = document.getElementById('citation-chart-container');
      if (!!root) {
        for (let child of root.childNodes) child.remove();
      new CitationsChart({
        target: root
      });
      }
  })
  .observe(document.body, { childList: true })
  new CitationsChart({
    target: document.getElementById('citation-chart-container')
  });
</script>
<link rel="stylesheet" href="/counterpoint/assets/citations/style.css">

