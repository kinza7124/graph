/* ==========================================================================
   DryRun — a tiny step-by-step visualiser used by every problem page.

   Register a dry run for a section id:

     DryRun.register('p2', {
       title:  'BFS flood fill on a 4x5 grid',
       input:  'grid = [[1,1,0],[0,1,0]]',          // shown above the stage
       legend: [['cur','being processed'], ['visited','visited']],
       insight: {                                     // optional "how to think" card
         pattern: 'Flood fill / Connected components',
         idea:   ['...'],  traps: ['...'],  tips: ['...']
       },
       frames() { return [ { note: 'html', views: [...] , final: false } ] }
       // or several inputs:  examples: [{ label, input, frames() {...} }]
     });

   A frame is { note, views, final }. Each view is one of:
     { type:'array', title, values:[], cls:{i:'cur'}|[], pointers:{i:2, j:5}, bars:false, labels:[] }
     { type:'grid',  title, values:[[...]], cls:{'r,c':'cur'}|[[...]], rowLabels:[], colLabels:[], corner:'' }
     { type:'graph', title, nodes:[{id,x,y,label}], edges:[{u,v,w,directed}],
                     nodeCls:{id:'cur'}, edgeCls:{'u-v':'tree'}, badges:{id:'d=4'}, directed:false }
     { type:'list',  title, items:[], kind:'queue'|'stack'|'pq'|'set', cls:{i:'cur'} }
     { type:'vars',  title, vars:{name:value}, changed:['name'] }
     { type:'html',  title, html }
   Any view may set  wide:true  to take a full row.
   State classes: cur visited done sorted path queued bad cmp swap pivot dep dim
                  water land wall fresh rotten   (graph nodes also: c0 c1 c2 c3)
   ========================================================================== */
(function () {
    'use strict';

    const registry = {};
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const INF_LIMIT = 1e8;

    const util = {
        clone: v => JSON.parse(JSON.stringify(v, (k, x) => (x === Infinity ? '__INF__' : x)), (k, x) => (x === '__INF__' ? Infinity : x)),
        fmt: v => (v === Infinity || v === -Infinity || (typeof v === 'number' && Math.abs(v) >= INF_LIMIT) ? (v < 0 ? '-∞' : '∞') : v === true ? 'T' : v === false ? 'F' : v),
        range: (a, b) => Array.from({ length: b - a }, (_, i) => a + i),
        grid: (r, c, v) => Array.from({ length: r }, () => Array(c).fill(v)),
        /* place n nodes on a circle — handy default layout */
        circle: (n, r = 120, cx = 160, cy = 150, start = -Math.PI / 2) =>
            Array.from({ length: n }, (_, i) => ({ id: i, x: Math.round(cx + r * Math.cos(start + (2 * Math.PI * i) / n)), y: Math.round(cy + r * Math.sin(start + (2 * Math.PI * i) / n)) })),
        pair: (a, b) => `(${a},${b})`
    };

    /* ---------------------------------------------------------------- renderers */
    function clsOf(cls, key) {
        if (!cls) return '';
        if (Array.isArray(cls)) {
            const k = String(key).split(',');
            return k.length === 2 && Array.isArray(cls[k[0]]) ? (cls[k[0]][k[1]] || '') : (cls[key] || '');
        }
        return cls[key] || '';
    }

    function renderArray(v) {
        const vals = v.values || [];
        const ptrs = {};
        Object.entries(v.pointers || {}).forEach(([name, idx]) => {
            if (idx === null || idx === undefined || idx < 0 || idx >= vals.length) return;
            (ptrs[idx] = ptrs[idx] || []).push(name);
        });
        const maxAbs = v.bars ? Math.max(1, ...vals.map(x => Math.abs(Number(x)) || 0)) : 1;
        let h = `<div class="dr-array">`;
        vals.forEach((x, i) => {
            const c = clsOf(v.cls, i);
            h += `<div class="dr-cellwrap">`;
            h += `<div class="dr-ptr">${(ptrs[i] || []).map(esc).join('<br>')}</div>`;
            if (v.bars) {
                const ht = Math.max(20, Math.round((Math.abs(Number(x)) / maxAbs) * 110));
                h += `<div class="dr-bar-wrap"><div class="dr-bar dr-cell ${c}" style="height:${ht}px;min-width:34px">${esc(util.fmt(x))}</div></div>`;
            } else {
                h += `<div class="dr-cell ${c}">${esc(util.fmt(x))}</div>`;
            }
            if (v.showIndex !== false) h += `<div class="dr-idx">${v.labels ? esc(v.labels[i]) : i}</div>`;
            h += `</div>`;
        });
        if (!vals.length) h += `<span class="dr-empty">empty</span>`;
        return h + `</div>`;
    }

    function renderGrid(v) {
        const rows = v.values || [];
        const hasCol = v.colLabels && v.colLabels.length;
        const hasRow = v.rowLabels && v.rowLabels.length;
        let h = `<div class="dr-table-scroll"><table class="dr-grid">`;
        if (hasCol) {
            h += `<tr>${hasRow ? `<th class="corner">${esc(v.corner || '')}</th>` : ''}`;
            v.colLabels.forEach(l => (h += `<th>${esc(l)}</th>`));
            h += `</tr>`;
        }
        rows.forEach((row, r) => {
            h += `<tr>${hasRow ? `<th>${esc(v.rowLabels[r])}</th>` : ''}`;
            row.forEach((x, c) => {
                const k = Array.isArray(v.cls) ? (v.cls[r] && v.cls[r][c]) || '' : (v.cls && v.cls[`${r},${c}`]) || '';
                h += `<td class="${k}">${x === null || x === undefined ? '' : esc(util.fmt(x))}</td>`;
            });
            h += `</tr>`;
        });
        return h + `</table></div>`;
    }

    let markerSeq = 0;
    function renderGraph(v) {
        const R = 19, pad = 34;
        const nodes = v.nodes || [];
        const byId = {};
        nodes.forEach(n => (byId[n.id] = n));
        const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
        const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
        const W = Math.max(...xs) - minX + pad, H = Math.max(...ys) - minY + pad;
        const mid = 'arr' + (++markerSeq);
        const ec = v.edgeCls || {};
        const colours = { '': '#3a4560', cur: '#ffcf5c', visited: '#3ddc97', tree: '#3ddc97', done: '#3ddc97', path: '#3ddc97', bad: '#ff5c7a', queued: '#b392f0', dim: '#232a3a' };
        let defs = '<defs>';
        Object.entries(colours).forEach(([k, col]) => {
            defs += `<marker id="${mid}-${k || 'base'}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${col}"/></marker>`;
        });
        defs += '</defs>';
        let edges = '', labels = '';
        (v.edges || []).forEach(e => {
            const a = byId[e.u], b = byId[e.v];
            if (!a || !b) return;
            const directed = e.directed !== undefined ? e.directed : !!v.directed;
            let c = ec[`${e.u}-${e.v}`] || (!directed ? ec[`${e.v}-${e.u}`] : '') || e.cls || '';
            const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
            const ux = dx / len, uy = dy / len;
            // curve a bit when the reverse directed edge also exists
            const twin = directed && (v.edges || []).some(f => f.u === e.v && f.v === e.u);
            const x1 = a.x + ux * R, y1 = a.y + uy * R;
            const x2 = b.x - ux * (R + (directed ? 3 : 0)), y2 = b.y - uy * (R + (directed ? 3 : 0));
            const marker = directed ? ` marker-end="url(#${mid}-${colours[c] !== undefined ? (c || 'base') : 'base'})"` : '';
            let lx = (a.x + b.x) / 2, ly = (a.y + b.y) / 2;
            if (twin) {
                const off = 18, cx = lx - uy * off, cy = ly + ux * off;
                edges += `<path class="e ${c}" d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}"${marker}/>`;
                lx = lx - uy * 13; ly = ly + ux * 13;
            } else {
                edges += `<line class="e ${c}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${marker}/>`;
            }
            if (e.w !== undefined && e.w !== null) labels += `<text class="ew" x="${lx - uy * 10}" y="${ly + ux * 10 + 4}" text-anchor="middle">${esc(e.w)}</text>`;
        });
        let ns = '';
        nodes.forEach(n => {
            const c = (v.nodeCls || {})[n.id] || '';
            ns += `<g class="n ${c}"><circle cx="${n.x}" cy="${n.y}" r="${R}"/><text x="${n.x}" y="${n.y}">${esc(n.label !== undefined ? n.label : n.id)}</text></g>`;
            const b = (v.badges || {})[n.id];
            if (b !== undefined && b !== null && b !== '') ns += `<text class="badge" x="${n.x}" y="${n.y - R - 7}">${esc(util.fmt(b))}</text>`;
        });
        const width = Math.min(v.width || W * 1.15, 560);
        return `<svg class="dr-svg" viewBox="${minX} ${minY - 6} ${W} ${H + 6}" width="${width}" style="aspect-ratio:${W}/${H + 6}">${defs}${edges}${labels}${ns}</svg>`;
    }

    function renderList(v) {
        const items = v.items || [];
        const kind = v.kind || 'queue';
        let h = `<div class="dr-list ${kind === 'stack' ? 'stack' : ''}">`;
        if (!items.length) h += `<span class="dr-empty">empty</span>`;
        items.forEach((it, i) => {
            const isHead = kind === 'stack' ? i === items.length - 1 : i === 0;
            h += `<span class="dr-chip ${clsOf(v.cls, i)} ${isHead && kind !== 'set' && v.markHead !== false ? 'head' : ''}">${esc(util.fmt(it))}</span>`;
        });
        h += `</div>`;
        if (items.length && kind !== 'set') {
            const ends = kind === 'stack' ? ['bottom', 'top ↑'] : kind === 'pq' ? ['min (top) ←', ''] : ['front ← pop', 'push → back'];
            if (kind !== 'stack') h += `<div class="dr-list-ends"><span>${ends[0]}</span><span>${ends[1]}</span></div>`;
        }
        return h;
    }

    function renderVars(v) {
        const ch = new Set(v.changed || []);
        let h = `<div class="dr-vars">`;
        Object.entries(v.vars || {}).forEach(([k, x]) => {
            h += `<span class="k">${esc(k)}</span><span class="v ${ch.has(k) ? 'changed' : ''}">${esc(util.fmt(x))}</span>`;
        });
        return h + `</div>`;
    }

    const renderers = { array: renderArray, grid: renderGrid, table: renderGrid, graph: renderGraph, list: renderList, vars: renderVars, html: v => v.html || '' };

    function renderView(v) {
        const fn = renderers[v.type];
        if (!fn) return '';
        const title = v.title ? `<div class="dr-view-title">${esc(v.title)}</div>` : '';
        return `<div class="dr-view ${v.wide ? 'wide' : ''}" ${v.minWidth ? `style="min-width:${v.minWidth}px"` : ''}>${title}${fn(v)}</div>`;
    }

    /* ---------------------------------------------------------------- player */
    function buildPlayer(def) {
        const examples = def.examples || [{ label: '', input: def.input, frames: def.frames }];
        const root = document.createElement('div');
        root.className = 'dryrun';
        root.innerHTML = `
            <div class="dr-head">
                <span class="dr-badge"><i class="fas fa-person-running"></i> Dry run</span>
                <span class="dr-title">${def.title || ''}</span>
                <span style="flex:1"></span>
                <div class="dr-tabs"></div>
                <div class="dr-input" hidden></div>
            </div>
            <div class="dr-stage"></div>
            <div class="dr-note"></div>
            <div class="dr-legend"></div>
            <div class="dr-controls">
                <button class="dr-btn" data-a="first" title="First step (Home)"><i class="fas fa-backward-fast"></i></button>
                <button class="dr-btn" data-a="prev" title="Previous step (←)"><i class="fas fa-chevron-left"></i></button>
                <button class="dr-btn play" data-a="play" title="Play / pause (space)"><i class="fas fa-play"></i> Play</button>
                <button class="dr-btn" data-a="next" title="Next step (→)"><i class="fas fa-chevron-right"></i></button>
                <button class="dr-btn" data-a="last" title="Last step (End)"><i class="fas fa-forward-fast"></i></button>
                <div class="dr-progress"><input type="range" min="0" value="0"><span class="dr-count"></span></div>
                <label class="dr-speed"><i class="fas fa-gauge-high"></i>
                    <select><option value="1800">0.5×</option><option value="1100" selected>1×</option><option value="650">2×</option><option value="300">4×</option></select>
                </label>
            </div>`;

        const $ = s => root.querySelector(s);
        const stage = $('.dr-stage'), note = $('.dr-note'), range = $('input[type=range]'), count = $('.dr-count');
        const playBtn = $('[data-a=play]'), speed = $('select'), input = $('.dr-input'), tabs = $('.dr-tabs');

        if (def.legend && def.legend.length) {
            const sw = { cur: '#ffcf5c', visited: '#4f8cff', done: '#3ddc97', sorted: '#3ddc97', path: '#3ddc97', queued: '#b392f0', bad: '#ff5c7a', cmp: '#4fd6e8', swap: '#ff9f5a', pivot: '#ff5c7a', dep: '#4fd6e8', water: '#17375f', land: '#4f6a2c', fresh: '#ff9f5a', rotten: '#8a6a2a', wall: '#3a4152', c0: '#4fd6e8', c1: '#ff9f5a', c2: '#3ddc97', c3: '#b392f0', tree: '#3ddc97' };
            $('.dr-legend').innerHTML = def.legend.map(([k, label]) => `<span><i style="background:${sw[k] || '#4a5675'}"></i>${esc(label)}</span>`).join('');
        }

        let frames = [], idx = 0, timer = null, ex = 0;

        function load(e) {
            ex = e;
            stop();
            try {
                frames = examples[e].frames.call(def, util) || [];
            } catch (err) {
                console.error('DryRun failed for', def.title, err);
                frames = [{ note: 'Could not build this dry run: ' + esc(err.message), views: [] }];
            }
            const inp = examples[e].input;
            input.hidden = !inp;
            input.textContent = inp || '';
            range.max = Math.max(0, frames.length - 1);
            tabs.querySelectorAll('.dr-tab').forEach((t, i) => t.classList.toggle('on', i === e));
            show(0);
        }

        function show(i) {
            if (!frames.length) return;
            idx = Math.max(0, Math.min(frames.length - 1, i));
            const f = frames[idx];
            stage.innerHTML = (f.views || []).map(renderView).join('');
            note.innerHTML = f.note || '';
            note.classList.toggle('final', !!f.final || idx === frames.length - 1);
            range.value = idx;
            count.textContent = `Step ${idx + 1} / ${frames.length}`;
            $('[data-a=prev]').disabled = $('[data-a=first]').disabled = idx === 0;
            $('[data-a=next]').disabled = $('[data-a=last]').disabled = idx === frames.length - 1;
        }

        function play() {
            if (idx >= frames.length - 1) show(0);
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            const tick = () => {
                if (idx >= frames.length - 1) return stop();
                show(idx + 1);
                timer = setTimeout(tick, +speed.value);
            };
            timer = setTimeout(tick, +speed.value);
        }
        function stop() {
            clearTimeout(timer);
            timer = null;
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        }

        if (examples.length > 1) {
            tabs.innerHTML = examples.map((x, i) => `<button class="dr-tab" data-ex="${i}">${esc(x.label || 'Example ' + (i + 1))}</button>`).join('');
            tabs.addEventListener('click', e => { const b = e.target.closest('.dr-tab'); if (b) load(+b.dataset.ex); });
        }

        root.addEventListener('click', e => {
            const b = e.target.closest('.dr-btn');
            if (!b) return;
            const a = b.dataset.a;
            if (a === 'play') return timer ? stop() : play();
            stop();
            if (a === 'next') show(idx + 1);
            if (a === 'prev') show(idx - 1);
            if (a === 'first') show(0);
            if (a === 'last') show(frames.length - 1);
        });
        range.addEventListener('input', () => { stop(); show(+range.value); });

        root.drKey = e => {
            if (e.key === 'ArrowRight') { stop(); show(idx + 1); return true; }
            if (e.key === 'ArrowLeft') { stop(); show(idx - 1); return true; }
            if (e.key === ' ') { timer ? stop() : play(); return true; }
            if (e.key === 'Home') { stop(); show(0); return true; }
            if (e.key === 'End') { stop(); show(frames.length - 1); return true; }
            return false;
        };
        root.drStop = stop;
        load(0);
        return root;
    }

    function buildInsight(ins) {
        const list = a => (Array.isArray(a) ? `<ul>${a.map(x => `<li>${x}</li>`).join('')}</ul>` : `<p>${a}</p>`);
        const el = document.createElement('div');
        el.className = 'insight';
        el.innerHTML = `
            <div class="insight-head"><i class="fas fa-lightbulb"></i> How to think about it
                ${ins.pattern ? `<span class="pattern">${ins.pattern}</span>` : ''}</div>
            <div class="insight-body">
                ${ins.idea ? `<div class="insight-col idea"><h5><i class="fas fa-bolt"></i> Key idea</h5>${list(ins.idea)}</div>` : ''}
                ${ins.traps ? `<div class="insight-col trap"><h5><i class="fas fa-triangle-exclamation"></i> Common mistakes</h5>${list(ins.traps)}</div>` : ''}
                ${ins.tips ? `<div class="insight-col tip"><h5><i class="fas fa-trophy"></i> Contest tips</h5>${list(ins.tips)}</div>` : ''}
            </div>`;
        return el;
    }

    /* mount into a section: insight after the intro cards, player after the first code window */
    function mount(section) {
        const defs = registry[section.id];
        if (!defs || section.dataset.drMounted) return;
        section.dataset.drMounted = '1';
        defs.forEach(def => {
            const pick = sel => (sel ? section.querySelector(sel) : null);
            if (def.insight) {
                const anchor = pick(def.insightAfter) || section.querySelector(':scope > .complexity-grid') || section.querySelector(':scope > .problem-desc') || section.querySelector(':scope > .tagline');
                const el = buildInsight(def.insight);
                anchor ? anchor.after(el) : section.prepend(el);
            }
            if (def.frames || def.examples) {
                const player = buildPlayer(def);
                // prefer top-level code windows over snippets nested inside note cards
                let windows = section.querySelectorAll(':scope > .code-window');
                if (!windows.length) windows = section.querySelectorAll('.code-window');
                const anchor = pick(def.after) || (def.placeLast ? windows[windows.length - 1] : windows[0]) || section.querySelector('.insight') || section.querySelector('.problem-desc');
                anchor ? anchor.after(player) : section.appendChild(player);
            }
        });
    }

    window.DryRun = {
        util,
        register(id, def) { (registry[id] = registry[id] || []).push(def); },
        has: id => !!registry[id],
        mount,
        ids: () => Object.keys(registry)
    };
})();
