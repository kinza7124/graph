/* ==========================================================================
   Algo Prep — site shell
   - grouped sidebar with search + revision progress
   - VS Code (Dark+) style code windows; the code text itself is never edited
   - topic pager, keyboard shortcuts, KaTeX, dry-run mounting
   ========================================================================== */
(function () {
    'use strict';

    const NAV = [
        { title: 'Start Here', items: [['viz-section', 'Graph Simulator (BFS · DFS · Dijkstra)', 'fa-circle-play']] },
        { title: 'Graphs · Traversal', items: [
            ['p1', 'Number of Provinces', 'fa-diagram-project', 547],
            ['p2', 'Number of Islands', 'fa-water', 200],
            ['p3', 'Flood Fill', 'fa-fill-drip', 733],
            ['p4', 'Rotten Oranges', 'fa-lemon', 994],
            ['p5', '01 Matrix', 'fa-border-all', 542],
            ['p6', 'Is Graph Bipartite?', 'fa-circle-half-stroke', 785],
            ['p7', 'Eventual Safe Nodes', 'fa-shield-halved', 802],
            ['p8', 'Course Schedule', 'fa-list-check', 207]] },
        { title: 'Graphs · Shortest Paths', items: [
            ['p9', 'Network Delay Time', 'fa-tower-broadcast', 743],
            ['p10', 'Cheapest Flights within K Stops', 'fa-plane', 787],
            ['p11', 'Word Ladder', 'fa-font', 127],
            ['p12', 'Ways to Arrive at Destination', 'fa-route', 1976],
            ['p13', 'Shortest Path in Binary Matrix', 'fa-table-cells', 1091],
            ['p14', 'City with Smallest # Neighbours', 'fa-city', 1334]] },
        { title: 'Graphs · MST · DSU · SCC', items: [
            ['p15', 'Min Cost to Connect Points (Prim)', 'fa-tree', 1584],
            ['p16', 'Min Cost to Connect Points (Kruskal)', 'fa-people-group', 1584],
            ['p17', 'Make Network Connected (DSU)', 'fa-network-wired', 1319],
            ['p18', 'Strongly Connected Components', 'fa-arrows-spin']] },
        { title: 'Theory & Revision', items: [
            ['p19', 'Graph Revision Sheet', 'fa-note-sticky'],
            ['p20', 'P, NP & Approximation', 'fa-infinity'],
            ['p28', 'Greedy & Local Search', 'fa-mountain-sun'],
            ['p53', 'Formal Loop Correctness', 'fa-microchip'],
            ['p38', 'Exam Recap (Part A)', 'fa-file-invoice']] },
        { title: 'DP · 1D', items: [
            ['dp-intro', 'Dynamic Programming Intro', 'fa-brain'],
            ['p21', 'Climbing Stairs', 'fa-stairs', 70],
            ['p22', 'Frog Jump', 'fa-frog'],
            ['p23', 'Frog Jump with K Jumps', 'fa-frog'],
            ['p24', 'Max Sum of Non-Adjacent', 'fa-house', 198],
            ['p25', 'House Robber II', 'fa-house-circle-exclamation', 213]] },
        { title: 'DP · 2D & Grids', items: [
            ['p26', 'Ninja Training', 'fa-user-ninja'],
            ['p27', 'Unique Paths', 'fa-table-cells-large', 62],
            ['p29', 'Minimum Path Sum', 'fa-shoe-prints', 64]] },
        { title: 'DP · Subsets & Knapsack', items: [
            ['dp-subsequences', 'DP on Subsequences', 'fa-sitemap'],
            ['p30', 'Partition Equal Subset Sum', 'fa-scale-balanced', 416],
            ['p31', '0/1 Knapsack Patterns', 'fa-box-open'],
            ['p36', 'Knapsack Simple Dry Run', 'fa-suitcase'],
            ['p34', 'Investment Case Study', 'fa-chart-line'],
            ['p35', 'R&D Portfolio Optimisation', 'fa-flask'],
            ['p43', 'Course Selection (Knapsack)', 'fa-graduation-cap'],
            ['p39', 'Coin Change II: Total Ways', 'fa-coins', 518],
            ['p41', 'Rod Cutting', 'fa-scissors']] },
        { title: 'DP · Strings & Intervals', items: [
            ['p32', 'Longest Common Subsequence', 'fa-stream', 1143],
            ['p33', 'Shortest Common Supersequence', 'fa-compress', 1092],
            ['p40', 'Edit Distance', 'fa-spell-check', 72],
            ['p42', 'Word Break', 'fa-scissors', 139],
            ['p37', 'Matrix Chain & Strassen', 'fa-table-cells']] },
        { title: 'Divide & Conquer · Sorting', items: [
            ['p44', 'Insertion Sort', 'fa-arrow-right-to-bracket'],
            ['p46', 'Binary Search', 'fa-magnifying-glass'],
            ['p47', 'Merge Sort', 'fa-code-merge'],
            ['p48', 'Quick Sort', 'fa-bolt'],
            ['p54', 'Heap Sort', 'fa-mountain'],
            ['p49', 'Counting Sort', 'fa-list-ol'],
            ['p50', 'Bucket Sort', 'fa-bucket'],
            ['p51', 'Radix Sort', 'fa-layer-group'],
            ['p45', 'Max Subarray (D&C)', 'fa-divide'],
            ['p52', 'Closest Pair of Points', 'fa-circle-dot']] }
    ];

    const ORDER = NAV.flatMap(g => g.items.map(i => i[0]));
    const LABEL = Object.fromEntries(NAV.flatMap(g => g.items.map(i => [i[0], i[1]])));
    const GROUP = Object.fromEntries(NAV.flatMap(g => g.items.map(i => [i[0], g.title])));
    const NO_MATH = new Set(['p34', 'p35', 'p36']); // these pages use $ for money
    const STORE = 'algoprep.done.v1';

    const store = {
        get() { try { return new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch (e) { return new Set(); } },
        set(s) { try { localStorage.setItem(STORE, JSON.stringify([...s])); } catch (e) { /* private mode */ } }
    };
    let done = store.get();
    let current = null;

    /* ---------------------------------------------------------------- shell */
    function buildSidebar() {
        const aside = document.querySelector('.sidebar');
        let h = `
            <div class="brand">
                <div class="brand-mark"><i class="fas fa-code-branch"></i></div>
                <div><div class="brand-title">Algo Prep</div><div class="brand-sub">Graphs · DP · D&amp;C — CP notes</div></div>
            </div>
            <div class="side-search"><i class="fas fa-magnifying-glass"></i><input id="nav-search" type="search" placeholder="Search topics…" autocomplete="off"><kbd>/</kbd></div>
            <div class="side-progress"><span id="prog-text"></span><div class="bar"><span id="prog-bar"></span></div></div>
            <nav class="nav-scroll">`;
        NAV.forEach((g, gi) => {
            h += `<div class="nav-group" data-g="${gi}"><button class="nav-group-title">${g.title}<i class="fas fa-chevron-down chev"></i></button><ul class="nav-list">`;
            g.items.forEach(([id, label, icon, lc]) => {
                h += `<li data-tab="${id}" onclick="showTab('${id}')"><i class="fas ${icon}"></i><span>${label}</span>${lc ? `<span class="num">#${lc}</span>` : ''}<i class="fas fa-check tick"></i></li>`;
            });
            h += `</ul></div>`;
        });
        h += `</nav><div class="side-foot"><kbd>[</kbd> <kbd>]</kbd> prev / next topic &nbsp;·&nbsp; <kbd>←</kbd> <kbd>→</kbd> dry-run steps</div>`;
        aside.innerHTML = h;

        aside.querySelectorAll('.nav-group-title').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('collapsed')));
        const search = aside.querySelector('#nav-search');
        search.addEventListener('input', () => {
            const q = search.value.trim().toLowerCase();
            aside.querySelectorAll('.nav-group').forEach(g => {
                let any = false;
                g.querySelectorAll('li').forEach(li => {
                    const hit = !q || li.textContent.toLowerCase().includes(q) || (document.getElementById(li.dataset.tab) || {}).textContent?.toLowerCase().includes(q);
                    li.classList.toggle('hidden', !hit);
                    any = any || hit;
                });
                g.style.display = any ? '' : 'none';
                if (q) g.classList.remove('collapsed');
            });
        });
        search.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const first = aside.querySelector('.nav-list li:not(.hidden)');
                if (first) showTab(first.dataset.tab);
            }
        });
    }

    function buildMain() {
        const main = document.querySelector('.main-content');
        const page = document.createElement('div');
        page.className = 'page';
        [...main.children].forEach(c => page.appendChild(c));
        const bar = document.createElement('header');
        bar.className = 'topbar';
        bar.innerHTML = `
            <button class="icon-btn menu-btn" id="menu-btn" aria-label="Open menu"><i class="fas fa-bars"></i></button>
            <div class="crumbs" id="crumbs"></div>
            <div class="top-actions">
                <button class="icon-btn" id="prev-btn" title="Previous topic ( [ )"><i class="fas fa-arrow-left"></i></button>
                <button class="icon-btn" id="done-btn" title="Mark this topic as revised"><i class="fas fa-check"></i><span class="lbl">Revised</span></button>
                <button class="icon-btn" id="next-btn" title="Next topic ( ] )"><span class="lbl">Next</span><i class="fas fa-arrow-right"></i></button>
            </div>`;
        main.appendChild(bar);
        main.appendChild(page);
        const pager = document.createElement('div');
        pager.className = 'pager';
        pager.innerHTML = `<button class="prev" id="pg-prev"><small>← Previous</small><span></span></button><button class="next" id="pg-next"><small>Next →</small><span></span></button>`;
        page.appendChild(pager);

        const scrim = document.createElement('div');
        scrim.className = 'scrim';
        document.body.appendChild(scrim);
        scrim.addEventListener('click', () => document.body.classList.remove('nav-open'));
        bar.querySelector('#menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
        bar.querySelector('#prev-btn').addEventListener('click', () => step(-1));
        bar.querySelector('#next-btn').addEventListener('click', () => step(1));
        bar.querySelector('#done-btn').addEventListener('click', toggleDone);
        pager.querySelector('#pg-prev').addEventListener('click', () => step(-1));
        pager.querySelector('#pg-next').addEventListener('click', () => step(1));
    }

    function step(d) {
        const i = ORDER.indexOf(current);
        const j = i + d;
        if (j >= 0 && j < ORDER.length) showTab(ORDER[j]);
    }

    function toggleDone() {
        if (!current) return;
        done.has(current) ? done.delete(current) : done.add(current);
        store.set(done);
        refreshProgress();
    }

    function refreshProgress() {
        document.querySelectorAll('.nav-list li').forEach(li => li.classList.toggle('done', done.has(li.dataset.tab)));
        const n = ORDER.filter(id => done.has(id)).length;
        const t = document.getElementById('prog-text');
        if (t) t.textContent = `Revised ${n} / ${ORDER.length} topics`;
        const b = document.getElementById('prog-bar');
        if (b) b.style.width = (100 * n / ORDER.length) + '%';
        const btn = document.getElementById('done-btn');
        if (btn) btn.classList.toggle('on', done.has(current));
    }

    /* ---------------------------------------------------------------- code windows */
    const CTL = new Set(['if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default', 'goto', 'try', 'catch', 'throw', 'co_return', 'yield', 'in', 'elif', 'pass', 'from', 'import']);
    const PRIM = new Set(['int', 'long', 'short', 'char', 'bool', 'void', 'double', 'float', 'unsigned', 'signed', 'auto', 'const', 'static', 'struct', 'class', 'public', 'private', 'protected', 'inline', 'typename', 'template']);
    const STL = new Set(['vector', 'queue', 'priority_queue', 'deque', 'stack', 'pair', 'map', 'set', 'unordered_map', 'unordered_set', 'multiset', 'string', 'greater', 'less', 'array', 'list', 'tuple', 'Solution', 'DisjointSet', 'DSU', 'Point', 'size_t', 'std', 'Graph']);

    function detectLang(text) {
        const cppish = /[;{}]/.test(text) && /\b(int|void|class|vector|return|bool|long|struct|#include|auto|string)\b/.test(text);
        if (cppish) return 'cpp';
        return 'python'; // pseudocode / python-like notes read best with the python grammar
    }

    function dedent(text) {
        const lines = text.replace(/\t/g, '    ').split('\n');
        const ind = lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length);
        const min = ind.length ? Math.min(...ind) : 0;
        return min ? lines.map(l => l.slice(min)).join('\n') : lines.join('\n');
    }

    /* adds VS Code flavour on top of highlight.js: variables, calls, constants, control keywords */
    function vscodeify(codeEl) {
        codeEl.querySelectorAll('.hljs-keyword').forEach(s => { if (CTL.has(s.textContent.trim())) s.classList.add('ctl'); });
        codeEl.querySelectorAll('.hljs-type, .hljs-built_in').forEach(s => { if (PRIM.has(s.textContent.trim())) { s.className = 'hljs-keyword'; } });
        const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT, {
            acceptNode: n => (n.parentElement.closest('.hljs-comment, .hljs-string, .hljs-meta, .hljs-number, .hljs-title, .hljs-keyword, .hljs-type, .hljs-built_in, .hljs-literal') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
        });
        const texts = [];
        while (walker.nextNode()) texts.push(walker.currentNode);
        texts.forEach(node => {
            const src = node.nodeValue;
            const re = /[A-Za-z_]\w*/g;
            if (!re.test(src)) return;
            re.lastIndex = 0;
            const frag = document.createDocumentFragment();
            let last = 0, m;
            while ((m = re.exec(src))) {
                const w = m[0];
                if (m.index > 0 && /[0-9.]/.test(src[m.index - 1]) && /^[eEfFlLuU]/.test(w)) continue; // 1e9 suffix
                frag.appendChild(document.createTextNode(src.slice(last, m.index)));
                const span = document.createElement('span');
                const after = src.slice(re.lastIndex);
                if (PRIM.has(w)) span.className = 'hljs-keyword';
                else if (CTL.has(w)) span.className = 'hljs-keyword ctl';
                else if (STL.has(w)) span.className = 'vsc-type';
                else if (/^\s*\(/.test(after)) span.className = 'vsc-fn';
                else if (/^[A-Z][A-Z0-9_]+$/.test(w)) span.className = 'vsc-const';
                else span.className = 'vsc-var';
                span.textContent = w;
                frag.appendChild(span);
                last = re.lastIndex;
            }
            frag.appendChild(document.createTextNode(src.slice(last)));
            node.parentNode.replaceChild(frag, node);
        });
    }

    function slug(s) {
        return (s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 32);
    }

    /* file name for the tab: the heading right above the block, else the page title */
    function nearestHeading(pre) {
        const prev = pre.previousElementSibling;
        if (prev && /^H[2-5]$/.test(prev.tagName)) return prev.textContent.trim();
        const sec = pre.closest('section');
        const h1 = sec && sec.querySelector('h1');
        return h1 ? h1.textContent.trim() : '';
    }

    function enhanceCode(root) {
        root.querySelectorAll('pre').forEach((pre, i) => {
            if (pre.closest('.code-window')) return;
            const codeEl = pre.querySelector('code');
            const raw = (codeEl || pre).textContent;
            const text = dedent(raw.replace(/^\n+/, '').replace(/\s+$/, ''));
            const lang = detectLang(text);
            const lines = text.split('\n').length;

            const fresh = document.createElement('code');
            fresh.textContent = text;
            if (window.hljs) {
                try { fresh.innerHTML = hljs.highlight(text, { language: lang, ignoreIllegals: true }).value; } catch (e) { /* keep plain */ }
            }
            fresh.classList.add('hljs', 'language-' + lang);
            vscodeify(fresh);

            const heading = nearestHeading(pre);
            const ext = lang === 'cpp' ? 'cpp' : 'txt';
            const name = (slug(heading) || (lang === 'cpp' ? 'solution' : 'notes')) + '.' + ext;

            const win = document.createElement('div');
            win.className = 'code-window';
            win.innerHTML = `
                <div class="code-titlebar">
                    <div class="code-dots"><span></span><span></span><span></span></div>
                    <div class="code-tab"><span class="lang-ico ${ext === 'cpp' ? '' : 'txt'}">${ext === 'cpp' ? 'C++' : '≡'}</span>${name}</div>
                    <span class="code-spacer"></span>
                    <span class="code-meta">${lines} lines</span>
                    ${lines > 30 ? '<button class="code-btn" data-x="expand" title="Expand"><i class="fas fa-up-right-and-down-left-from-center"></i></button>' : ''}
                    <button class="code-btn" data-x="copy"><i class="far fa-copy"></i> Copy</button>
                </div>
                <div class="code-body"><div class="code-gutter"></div></div>
                <div class="code-statusbar"><span><i class="fas fa-code-branch"></i> main</span><span class="grow"></span><span>Spaces: 4</span><span>UTF-8</span><span>LF</span><span>${lang === 'cpp' ? 'C++' : 'Plain Text'}</span></div>`;
            win.querySelector('.code-gutter').textContent = Array.from({ length: lines }, (_, k) => k + 1).join('\n');

            pre.parentNode.insertBefore(win, pre);
            pre.classList.add('in-window');
            pre.removeAttribute('style');
            pre.innerHTML = '';
            pre.appendChild(fresh);
            win.querySelector('.code-body').appendChild(pre);

            win.querySelector('[data-x=copy]').addEventListener('click', e => copyText(text, e.currentTarget));
            const ex = win.querySelector('[data-x=expand]');
            if (ex) ex.addEventListener('click', () => win.classList.toggle('expanded'));
        });
    }

    function copyText(text, btn) {
        const ok = () => {
            btn.classList.add('ok');
            btn.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = '<i class="far fa-copy"></i> Copy'; }, 1400);
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, () => fallback());
        else fallback();
        function fallback() {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); ok(); } catch (e) { /* ignore */ }
            ta.remove();
        }
    }

    /* ---------------------------------------------------------------- problem statement card */
    function mountProblem(section, id) {
        const P = (window.PROBLEMS || {})[id];
        if (!P || section.dataset.pcMounted) return;
        section.dataset.pcMounted = '1';
        const e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const host = (u => { try { return new URL(u).hostname.replace('www.', ''); } catch (x) { return ''; } });
        const label = P.source === 'LeetCode' ? 'LeetCode' : P.source;
        const links = [`<a class="pc-link primary" href="${P.url}" target="_blank" rel="noopener">Open on ${e(label)} <i class="fas fa-arrow-up-right-from-square"></i></a>`]
            .concat((P.also || []).map(a => `<a class="pc-link" href="${a.url}" target="_blank" rel="noopener">${e(a.label || host(a.url))} <i class="fas fa-arrow-up-right-from-square"></i></a>`));
        const ex = (P.examples || []).map((x, i) => `
            <div class="pc-example">
                <div class="pc-ex-title">Example ${i + 1}</div>
                <div class="pc-io"><span>Input</span><code>${e(x.input)}</code></div>
                <div class="pc-io"><span>Output</span><code>${e(x.output)}</code></div>
                ${x.explanation ? `<div class="pc-io expl"><span>Explanation</span><div>${x.explanation}</div></div>` : ''}
            </div>`).join('');
        const card = document.createElement('details');
        card.className = 'problem-card';
        card.open = true;
        card.innerHTML = `
            <summary>
                <div class="pc-meta">
                    <span class="pc-src">${e(P.source)}${P.num ? ' ' + P.num : ''}</span>
                    ${P.difficulty ? `<span class="pc-diff">${e(P.difficulty)}</span>` : ''}
                    <span class="pc-toggle">Problem statement <i class="fas fa-chevron-down"></i></span>
                </div>
                <div class="pc-title">${e(P.title)}</div>
            </summary>
            <div class="pc-body">
                <div class="pc-links">${links.join('')}</div>
                <div class="pc-statement">${P.statement || ''}</div>
                ${ex ? `<h4 class="pc-h">Examples</h4><div class="pc-examples">${ex}</div>` : ''}
                ${(P.constraints || []).length ? `<h4 class="pc-h">Constraints</h4><ul class="pc-constraints">${P.constraints.map(c => `<li><code>${e(c)}</code></li>`).join('')}</ul>` : ''}
                ${P.followUp ? `<h4 class="pc-h">Follow-up</h4><p class="pc-follow">${P.followUp}</p>` : ''}
            </div>`;
        const anchor = section.querySelector(':scope > .tagline') || section.querySelector(':scope > h1');
        anchor ? anchor.after(card) : section.prepend(card);
    }

    /* ---------------------------------------------------------------- tabs */
    function showTab(id) {
        let secs = document.querySelectorAll(`section.section[id="${CSS.escape(id)}"]`);
        if (!secs.length) { id = 'viz-section'; secs = document.querySelectorAll('#viz-section'); }
        document.querySelectorAll('section.section.active').forEach(s => {
            s.classList.remove('active');
            s.querySelectorAll('.dryrun').forEach(d => d.drStop && d.drStop());
        });
        // duplicated ids in the source: show only the fullest copy (others are drafts of the same page)
        let best = secs[0];
        secs.forEach(s => { if (s.textContent.length > best.textContent.length) best = s; });
        best.classList.add('active');
        current = id;

        mountProblem(best, id);
        if (window.DryRun) DryRun.mount(best);
        if (window.renderMathInElement && !NO_MATH.has(id) && !best.dataset.math) {
            best.dataset.math = '1';
            try {
                renderMathInElement(best, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false, ignoredClasses: ['code-window', 'dryrun'] });
            } catch (e) { /* ignore */ }
        }
        // labs from the original page
        if (id === 'p28' && typeof resetKCenter === 'function') setTimeout(resetKCenter, 150);
        if (id === 'p20' && typeof initVCLab === 'function') setTimeout(initVCLab, 150);

        document.querySelectorAll('.nav-list li').forEach(li => li.classList.toggle('active', li.dataset.tab === id));
        const activeLi = document.querySelector(`.nav-list li[data-tab="${id}"]`);
        if (activeLi) {
            activeLi.closest('.nav-group').classList.remove('collapsed');
            activeLi.scrollIntoView({ block: 'nearest' });
        }
        const crumbs = document.getElementById('crumbs');
        if (crumbs) crumbs.innerHTML = `${GROUP[id] || ''} &nbsp;/&nbsp; <b>${LABEL[id] || ''}</b>`;
        const i = ORDER.indexOf(id);
        const prev = ORDER[i - 1], next = ORDER[i + 1];
        const pp = document.getElementById('pg-prev'), pn = document.getElementById('pg-next');
        if (pp) { pp.hidden = !prev; pp.querySelector('span').textContent = LABEL[prev] || ''; }
        if (pn) { pn.hidden = !next; pn.querySelector('span').textContent = LABEL[next] || ''; }
        document.getElementById('prev-btn').disabled = !prev;
        document.getElementById('next-btn').disabled = !next;
        // keep the pager at the bottom of the visible page
        const pager = document.querySelector('.pager');
        if (pager) best.after(pager);

        refreshProgress();
        document.body.classList.remove('nav-open');
        document.querySelector('.main-content').scrollTo({ top: 0 });
        if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
        document.title = (LABEL[id] || 'Algo Prep') + ' · Algo Prep';
    }

    /* the visible dry-run closest to the middle of the screen gets the arrow keys */
    function focusedDryRun() {
        const runs = [...document.querySelectorAll('section.active .dryrun')];
        if (!runs.length) return null;
        const mid = window.innerHeight / 2;
        let best = null, bestD = Infinity;
        runs.forEach(r => {
            const b = r.getBoundingClientRect();
            if (b.bottom < 0 || b.top > window.innerHeight) return;
            const d = Math.abs((b.top + b.bottom) / 2 - mid);
            if (d < bestD) { bestD = d; best = r; }
        });
        return best;
    }

    function onKey(e) {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
            if (e.key === 'Escape') t.blur();
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === '/') { e.preventDefault(); document.body.classList.add('nav-open'); document.getElementById('nav-search').focus(); return; }
        if (e.key === ']') return step(1);
        if (e.key === '[') return step(-1);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End' || (e.key === ' ' && t && t.closest && t.closest('.dryrun'))) {
            const r = (t && t.closest && t.closest('.dryrun')) || focusedDryRun();
            if (r && r.drKey && r.drKey(e)) e.preventDefault();
        }
    }

    function init() {
        buildSidebar();
        buildMain();
        document.querySelectorAll('.main-content section.section').forEach(enhanceCode);
        window.showTab = showTab;
        document.addEventListener('keydown', onKey);
        const start = decodeURIComponent(location.hash.slice(1));
        showTab(start && document.getElementById(start) ? start : 'viz-section');
        // the browser jumps to the #id anchor on load; undo that so the page starts at the top
        window.addEventListener('load', () => setTimeout(() => document.querySelector('.main-content').scrollTo({ top: 0 }), 0));
        window.addEventListener('hashchange', () => {
            const h = decodeURIComponent(location.hash.slice(1));
            if (h && h !== current && document.getElementById(h)) showTab(h);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
