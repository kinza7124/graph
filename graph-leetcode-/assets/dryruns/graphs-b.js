/* Dry runs: Shortest paths, MST, DSU, SCC (p9 – p19) */
(function () {
    const { clone } = DryRun.util;
    const INF = Infinity;

    /* ---- small shared helpers ------------------------------------------------ */
    // lexicographic compare of tuples — exactly how std::pair / std::tuple with greater<> order a min-heap
    const lexCmp = (a, b) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
        return 0;
    };
    // min-heap modelled as a sorted array; `len` = how many leading fields take part in the comparison
    const pqPush = (pq, item, len) => {
        pq.push(item);
        pq.sort((a, b) => lexCmp(a.slice(0, len || a.length), b.slice(0, len || b.length)));
    };
    const tup = t => '(' + t.map(x => (x === INF ? '∞' : x)).join(',') + ')';
    const fmtD = x => (x === INF ? '∞' : x);
    const ek = (u, v) => `${u}-${v}`;

    /* ======================================================== p9 Network Delay Time */
    DryRun.register('p9', {
        title: 'Dijkstra from k with a min-heap of {dist, node}',
        input: 'times = [[1,2,2],[1,3,5],[2,3,1],[2,4,6],[3,4,2],[4,5,1],[3,5,7]], n = 5, k = 1',
        legend: [['cur', 'popped node / edge being relaxed'], ['queued', 'in pq'], ['visited', 'popped before'], ['tree', 'edge that set dist[]']],
        insight: {
            pattern: 'Single-source shortest path (Dijkstra)',
            idea: [
                'The signal reaches node <code>v</code> at time <code>dist[v]</code> = shortest path from <code>k</code>. Everyone has heard it once the <b>slowest</b> node has → answer = <code>max(dist[i])</code>.',
                'Edge weights are non-negative, so the smallest <code>{d, node}</code> in the min-heap is always final — that greedy fact is all Dijkstra is.',
                'Any node still at <code>1e9</code> was never reached → return <code>-1</code>.'
            ],
            traps: [
                'Nodes are <b>1-indexed</b>: size arrays <code>n+1</code> and loop <code>i = 1..n</code> (index 0 is unused and must not be counted).',
                'This code has no <code>if (d &gt; dist[node]) continue;</code>. It is still correct (a stale entry cannot improve anything), but it re-scans adjacency lists. Adding the check is the standard optimisation.',
                'The heap needs <code>greater&lt;&gt;</code> — the default <code>priority_queue</code> is a <b>max</b>-heap, which silently gives wrong/slow results.',
                'Edges are <b>directed</b> here: only <code>adj[u].push_back({v,w})</code>.'
            ],
            tips: [
                'Complexity O(E log E): every successful relaxation pushes once.',
                'n ≤ 100 here, so Bellman–Ford (O(nE)) or even Floyd–Warshall would also pass — pick the one you can type bug-free fastest.',
                'Related: 1514 Path with Max Probability (max-heap), 1631 Path with Minimum Effort (dist = max edge), 787 Cheapest Flights (extra state).'
            ]
        },
        frames() {
            const n = 5, k = 1;
            const times = [[1, 2, 2], [1, 3, 5], [2, 3, 1], [2, 4, 6], [3, 4, 2], [4, 5, 1], [3, 5, 7]];
            const pos = { 1: [40, 120], 2: [170, 40], 3: [170, 200], 4: [300, 110], 5: [420, 200] };
            const nodes = Object.entries(pos).map(([id, p]) => ({ id: +id, x: p[0], y: p[1] }));
            const edges = times.map(([u, v, w]) => ({ u, v, w, directed: true }));
            const adj = Array.from({ length: n + 1 }, () => []);
            for (const [u, v, w] of times) adj[u].push([v, w]);

            const dist = Array(n + 1).fill(INF), par = Array(n + 1).fill(0), popped = new Set();
            const pq = [];
            const frames = [];
            const snap = (note, o = {}) => {
                const nodeCls = {}, edgeCls = {}, badges = {};
                for (let i = 1; i <= n; i++) {
                    if (popped.has(i)) nodeCls[i] = 'visited';
                    if (pq.some(t => t[1] === i)) nodeCls[i] = 'queued';
                    badges[i] = 'd=' + fmtD(dist[i]);
                    if (par[i]) edgeCls[ek(par[i], i)] = 'tree';
                }
                if (o.node) nodeCls[o.node] = 'cur';
                if (o.edge) edgeCls[ek(o.edge[0], o.edge[1])] = o.ok === false ? 'bad' : 'cur';
                const dcls = {};
                if (o.changed !== undefined) dcls[o.changed - 1] = 'cur';
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'graph', title: 'Directed graph (badge = dist)', nodes, edges, nodeCls, edgeCls, badges, directed: true },
                        { type: 'array', title: 'dist[1..n]', values: dist.slice(1), labels: [1, 2, 3, 4, 5], cls: dcls },
                        { type: 'list', title: 'pq (min-heap of {d, node})', kind: 'pq', items: pq.map(tup) },
                        { type: 'vars', title: 'variables', vars: o.vars || { d: '-', node: '-' }, changed: o.vchanged || [] }
                    ]
                });
            };

            dist[k] = 0; pq.push([0, k]);
            snap(`Build <code>adj</code> (directed). <code>dist[k=${k}] = 0</code>, everything else <code>1e9</code> (∞). Push <code>{0, ${k}}</code>.`, { node: k });
            while (pq.length) {
                const [d, node] = pq.shift();
                const stale = d > dist[node];
                popped.add(node);
                snap(`Pop <code>{${d}, ${node}}</code> → <code>d = ${d}</code>, <code>node = ${node}</code>.` +
                    (stale ? ` <b>Stale</b> entry (dist[${node}] is already ${dist[node]}); the code has no skip-check, so it still scans the neighbours — nothing will improve.` :
                        adj[node].length ? ` Relax its ${adj[node].length} outgoing edge(s).` : ' No outgoing edges.'),
                    { node, vars: { d, node }, vchanged: ['d', 'node'] });
                for (const [v, w] of adj[node]) {
                    if (d + w < dist[v]) {
                        const old = dist[v];
                        dist[v] = d + w; par[v] = node;
                        pqPush(pq, [dist[v], v]);
                        snap(`Edge ${node}→${v} (w=${w}): <code>d + w = ${d + w} &lt; dist[${v}] = ${fmtD(old)}</code> → update <code>dist[${v}] = ${dist[v]}</code> and push <code>{${dist[v]}, ${v}}</code>.`,
                            { node, edge: [node, v], changed: v, vars: { d, node, 'it.first': v, 'it.second': w } });
                    } else {
                        snap(`Edge ${node}→${v} (w=${w}): <code>${d} + ${w} = ${d + w}</code> is not &lt; <code>dist[${v}] = ${dist[v]}</code> → no change.`,
                            { node, edge: [node, v], ok: false, vars: { d, node, 'it.first': v, 'it.second': w } });
                    }
                }
            }
            let ans = 0;
            for (let i = 1; i <= n; i++) ans = Math.max(ans, dist[i]);
            snap(`Heap empty. No <code>dist[i]</code> is 1e9, so every node got the signal. <b>Answer = max(dist) = ${ans}</b> (node ${dist.indexOf(ans)} hears it last).`, { final: true, vars: { ans } });
            return frames;
        }
    });

    /* ======================================================== p10 Cheapest Flights within K stops */
    const flightsRun = K => function () {
        const n = 4, src = 0, dst = 3, k = K;
        const flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]];
        const pos = [[40, 120], [170, 40], [170, 200], [310, 120]];
        const nodes = pos.map((p, i) => ({ id: i, x: p[0], y: p[1], }));
        const edges = flights.map(([u, v, w]) => ({ u, v, w, directed: true }));
        const adj = Array.from({ length: n }, () => []);
        for (const [u, v, w] of flights) adj[u].push([v, w]);
        const dist = Array.from({ length: n }, () => Array(k + 2).fill(INF));
        const pq = [];
        const frames = [];
        const snap = (note, o = {}) => {
            const nodeCls = {}, edgeCls = {}, gcls = {};
            if (o.u !== undefined) nodeCls[o.u] = o.final ? 'done' : 'cur';
            if (o.edge) edgeCls[ek(o.edge[0], o.edge[1])] = o.ok === false ? 'bad' : 'cur';
            (o.path || []).forEach(([a, b]) => (edgeCls[ek(a, b)] = 'path'));
            if (o.cell) gcls[o.cell.join(',')] = o.ok === false ? 'bad' : 'cur';
            frames.push({
                note, final: o.final,
                views: [
                    { type: 'graph', title: `Flights (src = ${src}, dst = ${dst})`, nodes, edges, nodeCls, edgeCls, directed: true },
                    { type: 'grid', title: 'dist[node][stops]', values: dist, cls: gcls, rowLabels: dist.map((_, i) => 'node ' + i), colLabels: dist[0].map((_, j) => j), corner: 'stops →' },
                    { type: 'list', title: 'pq {cost, node, stops}', kind: 'pq', items: pq.map(tup) },
                    { type: 'vars', title: 'variables', vars: o.vars || { cost: '-', u: '-', stops: '-', k }, changed: o.vchanged || [] }
                ]
            });
        };
        pq.push([0, src, 0]);
        dist[src][0] = 0;
        snap(`Push <code>{0, ${src}, 0}</code>, <code>dist[${src}][0] = 0</code>. Here <code>stops</code> counts <b>edges taken</b>, so at most <code>k + 1 = ${k + 1}</code> flights are allowed.`, { u: src });
        const via = {}; // for drawing the final route
        while (pq.length) {
            const [cost, u, stops] = pq.shift();
            const vars = { cost, u, stops, k };
            if (u === dst) {
                const path = [];
                let key = `${u},${stops}`;
                while (via[key]) { const [pu, ps] = via[key]; path.push([pu, +key.split(',')[0]]); key = `${pu},${ps}`; }
                snap(`Pop <code>{${cost}, ${u}, ${stops}}</code>: <code>u == dst</code> → the heap is ordered by cost, so this is the cheapest valid route. <b>Answer = ${cost}</b>.`, { u, vars, final: true, path });
                return frames;
            }
            if (stops > k) {
                snap(`Pop <code>{${cost}, ${u}, ${stops}}</code>: <code>stops = ${stops} &gt; k = ${k}</code> → already used all allowed flights, <code>continue</code>.`, { u, vars, vchanged: ['stops'] });
                continue;
            }
            snap(`Pop <code>{${cost}, ${u}, ${stops}}</code> (cheapest in the heap). Try every flight out of <b>${u}</b>.`, { u, vars, vchanged: ['cost', 'u', 'stops'] });
            for (const [v, w] of adj[u]) {
                if (cost + w < dist[v][stops + 1]) {
                    dist[v][stops + 1] = cost + w;
                    via[`${v},${stops + 1}`] = [u, stops];
                    pqPush(pq, [cost + w, v, stops + 1]);
                    snap(`Flight ${u}→${v} ($${w}): <code>${cost} + ${w} = ${cost + w} &lt; dist[${v}][${stops + 1}]</code> → store it and push <code>{${cost + w}, ${v}, ${stops + 1}}</code>.`,
                        { u, edge: [u, v], cell: [v, stops + 1], vars: { ...vars, v, w } });
                } else {
                    snap(`Flight ${u}→${v} ($${w}): <code>${cost + w}</code> is not cheaper than <code>dist[${v}][${stops + 1}] = ${fmtD(dist[v][stops + 1])}</code> → skip.`,
                        { u, edge: [u, v], cell: [v, stops + 1], ok: false, vars: { ...vars, v, w } });
                }
            }
        }
        snap('Heap empty and <code>dst</code> never popped → <b>Answer = -1</b>.', { final: true });
        return frames;
    };
    DryRun.register('p10', {
        title: 'Dijkstra on (node, stops) states',
        legend: [['cur', 'popped / relaxed'], ['bad', 'rejected'], ['path', 'chosen route']],
        insight: {
            pattern: 'Shortest path with a resource limit (state = node + stops)',
            idea: [
                'Plain Dijkstra is wrong here: the cheapest way to reach a node may use too many stops, and a pricier-but-shorter route can be the only one that still reaches <code>dst</code> in time.',
                'Fix: make the <b>state</b> <code>(node, stops)</code>. <code>dist[v][s]</code> = cheapest cost to stand at <code>v</code> after exactly <code>s</code> flights. Now states never compete with each other unfairly.',
                'Because the heap pops by cost, the first time <code>dst</code> is popped its cost is optimal.'
            ],
            traps: [
                '“k stops” = <b>k + 1 edges</b>. Off-by-one on <code>stops &gt; k</code> vs <code>stops &gt;= k</code> is the #1 bug.',
                'Do <b>not</b> use a single 1-D <code>dist[v]</code> with Dijkstra — it prunes the few-stops path that you actually need (try the k = 1 example).',
                '<code>INT_MAX + w</code> would overflow, but here <code>cost</code> always comes from a real popped state, so it is safe.'
            ],
            tips: [
                'The most common accepted solution is <b>Bellman–Ford limited to k+1 rounds</b> (copy the dist array each round!) — O(k·E), very short to code.',
                'BFS by levels (queue of {node, cost}, at most k+1 levels) with a 1-D dist also works since we only care about level count.',
                'Same “expand the state” trick: 1293 Shortest Path with Obstacle Elimination, 864 Shortest Path to Get All Keys, 2093 Min Cost to Reach City With Discounts.'
            ]
        },
        examples: [
            { label: 'k = 1', input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1', frames: flightsRun(1) },
            { label: 'k = 2', input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 2', frames: flightsRun(2) }
        ]
    });

    /* ======================================================== p11 Word Ladder */
    DryRun.register('p11', {
        title: 'BFS over words, erasing from the set when discovered',
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        legend: [['cur', 'word being expanded'], ['queued', 'in queue'], ['visited', 'already popped'], ['tree', 'BFS tree edge']],
        insight: {
            pattern: 'BFS on an implicit graph',
            idea: [
                'Words are nodes, “differ by one letter” is an edge. Every edge costs 1 → <b>BFS</b> gives the shortest sequence.',
                'Never build the graph explicitly. From a word, generate all <code>L × 26</code> one-letter variants and look them up in a hash set.',
                'Erasing a word from <code>st</code> the moment it is <b>pushed</b> doubles as the visited array — each word enters the queue at most once.'
            ],
            traps: [
                'The answer counts <b>words</b>, not moves — that is why the start is pushed with <code>steps = 1</code>.',
                'If <code>endWord</code> is not in <code>wordList</code> the answer is 0 (the BFS handles it, but you can return early).',
                'Restore <code>word[i] = original</code> after the inner loop, otherwise later positions mutate the wrong word.',
                'Marking visited when <b>popping</b> instead of pushing lets the same word be queued many times → TLE.'
            ],
            tips: [
                'Complexity O(N · L · 26) lookups (each costs O(L) for hashing).',
                'Bidirectional BFS (expand the smaller frontier) is a big speed-up on large dictionaries.',
                'Word Ladder II (126) needs all shortest paths: BFS to record parents/levels, then DFS back from endWord.',
                'Same pattern: 433 Minimum Genetic Mutation, 752 Open the Lock.'
            ]
        },
        frames() {
            const beginWord = 'hit', endWord = 'cog';
            const wordList = ['hot', 'dot', 'dog', 'lot', 'log', 'cog'];
            const P = { hit: [30, 110], hot: [140, 110], dot: [250, 40], lot: [250, 180], dog: [370, 40], log: [370, 180], cog: [480, 110] };
            const nodes = Object.entries(P).map(([w, p]) => ({ id: w, x: p[0], y: p[1], label: w }));
            const all = Object.keys(P), edges = [];
            const diff1 = (a, b) => [...a].filter((c, i) => c !== b[i]).length === 1;
            for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (diff1(all[i], all[j])) edges.push({ u: all[i], v: all[j] });

            const q = [[beginWord, 1]];
            const st = new Set(wordList);
            st.delete(beginWord);
            const popped = new Set(), par = {}, steps = { [beginWord]: 1 };
            const frames = [];
            const snap = (note, o = {}) => {
                const nodeCls = {}, edgeCls = {}, badges = {};
                for (const w of all) {
                    if (popped.has(w)) nodeCls[w] = 'visited';
                    if (q.some(x => x[0] === w)) nodeCls[w] = 'queued';
                    if (steps[w]) badges[w] = 'steps=' + steps[w];
                }
                Object.entries(par).forEach(([c, p]) => (edgeCls[ek(p, c)] = 'tree'));
                if (o.cur) nodeCls[o.cur] = o.final ? 'done' : 'cur';
                if (o.found) { nodeCls[o.found] = 'queued'; edgeCls[ek(o.cur, o.found)] = 'cur'; }
                (o.path || []).forEach(([a, b]) => (edgeCls[ek(a, b)] = 'path'));
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'graph', title: 'Implicit word graph (edges drawn only for illustration)', nodes, edges, nodeCls, edgeCls, badges, wide: true },
                        { type: 'list', title: 'q {word, steps}', kind: 'queue', items: q.map(([w, s]) => `${w},${s}`) },
                        { type: 'list', title: 'st (unvisited dictionary words)', kind: 'set', items: wordList.filter(w => st.has(w)) },
                        { type: 'vars', title: 'variables', vars: o.vars || { word: '-', steps: '-' }, changed: o.vchanged || [] }
                    ]
                });
            };
            snap(`Push <code>{"${beginWord}", 1}</code>; put the dictionary into <code>st</code> and erase <code>beginWord</code> from it.`);
            while (q.length) {
                let [word, s] = q.shift();
                popped.add(word);
                if (word === endWord) {
                    const path = [];
                    for (let w = word; par[w]; w = par[w]) path.push([par[w], w]);
                    snap(`Pop <code>"${word}"</code>: <code>word == endWord</code> → <b>Answer = ${s}</b> words (${path.reverse().map(p => p[0]).concat(word).join(' → ')}).`,
                        { cur: word, final: true, path, vars: { word, steps: s } });
                    return frames;
                }
                snap(`Pop <code>{"${word}", ${s}}</code>. Try replacing each position <code>i</code> with <code>'a'..'z'</code> and look the result up in <code>st</code>.`,
                    { cur: word, vars: { word, steps: s }, vchanged: ['word', 'steps'] });
                const arr = [...word];
                let foundAny = false;
                for (let i = 0; i < arr.length; i++) {
                    const original = arr[i];
                    for (let c = 97; c <= 122; c++) {
                        arr[i] = String.fromCharCode(c);
                        const cand = arr.join('');
                        if (st.has(cand)) {
                            st.delete(cand);
                            q.push([cand, s + 1]);
                            par[cand] = word; steps[cand] = s + 1; foundAny = true;
                            snap(`<code>i = ${i}</code>, <code>ch = '${arr[i]}'</code> → <code>"${cand}"</code> is in <code>st</code>: erase it (visited) and push <code>{"${cand}", ${s + 1}}</code>.`,
                                { cur: word, found: cand, vars: { word: cand, steps: s, i, ch: arr[i] } });
                        }
                    }
                    arr[i] = original;
                }
                if (!foundAny) snap(`No variant of <code>"${word}"</code> is still in <code>st</code> (its neighbours were already discovered) → nothing pushed.`, { cur: word, vars: { word, steps: s } });
            }
            snap('Queue empty → <b>Answer = 0</b>.', { final: true });
            return frames;
        }
    });

    /* ======================================================== p12 Number of Ways to Arrive */
    DryRun.register('p12', {
        title: 'Dijkstra + ways[] counting (robust long long version)',
        input: 'n = 7, roads = [[0,6,7],[0,1,2],[1,2,3],[1,3,3],[6,3,3],[3,5,1],[6,5,1],[2,5,1],[0,4,5],[4,6,2]]',
        legend: [['cur', 'popped node / relaxed edge'], ['queued', 'in pq'], ['visited', 'finalised'], ['bad', 'stale / no change'], ['tree', 'edge on a shortest path']],
        insight: {
            pattern: 'Dijkstra + DP on the shortest-path DAG',
            idea: [
                'Count shortest paths while running Dijkstra: <code>ways[v]</code> = number of shortest paths from 0 to <code>v</code>.',
                '<b>Strictly shorter</b> path found → old paths are useless: <code>ways[v] = ways[u]</code>. <b>Equal</b> length → another set of shortest paths: <code>ways[v] += ways[u]</code>.',
                'Correctness relies on popping <code>u</code> only when <code>dist[u]</code> is final (so <code>ways[u]</code> is complete) — hence the stale-entry <code>continue</code> is <b>required</b> here.'
            ],
            traps: [
                'Without <code>if (dist_ &gt; dist[node]) continue;</code> a stale pop would add <code>ways[node]</code> a second time → over-counting.',
                'Distances can reach ~2·10<sup>11</sup>: use <code>long long</code> and an infinity like <code>1e18</code> (the “Simpler Version” with <code>int</code>/<code>1e9</code> overflows on big tests).',
                'Take <code>% MOD</code> on every addition — the “Simpler Version” never reduces <code>ways</code>, so it overflows on graphs with many equal paths.',
                'Roads are bidirectional: push both directions.'
            ],
            tips: [
                'Same template counts anything over shortest paths: 1786 Restricted Paths, 2192 / “number of shortest paths” in CSES-style tasks (also track min/max edges on shortest paths).',
                'For unweighted graphs the same idea works with BFS levels.',
                'O(E log V) time, O(V + E) memory.'
            ]
        },
        frames() {
            const n = 7, MOD = 1e9 + 7;
            const roads = [[0, 6, 7], [0, 1, 2], [1, 2, 3], [1, 3, 3], [6, 3, 3], [3, 5, 1], [6, 5, 1], [2, 5, 1], [0, 4, 5], [4, 6, 2]];
            const pos = { 0: [40, 150], 1: [160, 60], 4: [110, 290], 3: [290, 130], 6: [290, 250], 2: [290, 10], 5: [430, 150] };
            const nodes = Object.entries(pos).map(([id, p]) => ({ id: +id, x: p[0], y: p[1] }));
            const edges = roads.map(([u, v, w]) => ({ u, v, w }));
            const adjList = Array.from({ length: n }, () => []);
            for (const [a, b, w] of roads) { adjList[a].push([b, w]); adjList[b].push([a, w]); }
            const dist = Array(n).fill(INF), ways = Array(n).fill(0), done = new Set();
            const preds = Array.from({ length: n }, () => new Set());
            const pq = [];
            const frames = [];
            const snap = (note, o = {}) => {
                const nodeCls = {}, edgeCls = {}, badges = {};
                for (let i = 0; i < n; i++) {
                    if (done.has(i)) nodeCls[i] = 'visited';
                    if (pq.some(t => t[1] === i)) nodeCls[i] = 'queued';
                    badges[i] = fmtD(dist[i]) + ' / ' + ways[i] + 'w';
                    preds[i].forEach(p => (edgeCls[ek(p, i)] = 'tree'));
                }
                if (o.node !== undefined) nodeCls[o.node] = o.stale ? 'bad' : o.final ? 'done' : 'cur';
                if (o.edge) edgeCls[ek(o.edge[0], o.edge[1])] = o.ok === false ? 'bad' : 'cur';
                const ch = {};
                if (o.v !== undefined) ch[o.v] = 'cur';
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'graph', title: 'Roads (badge = dist / ways)', nodes, edges, nodeCls, edgeCls, badges },
                        { type: 'array', title: 'dist[]', values: dist.slice(), cls: ch },
                        { type: 'array', title: 'ways[]', values: ways.slice(), cls: ch },
                        { type: 'list', title: 'pq {dist, node}', kind: 'pq', items: pq.map(tup) },
                        { type: 'vars', title: 'variables', vars: o.vars || { dist_: '-', node: '-' }, changed: o.vchanged || [] }
                    ]
                });
            };
            pq.push([0, 0]); dist[0] = 0; ways[0] = 1;
            snap('Push <code>{0, 0}</code>, <code>dist[0] = 0</code>, <code>ways[0] = 1</code> (the empty path). All other <code>dist = 1e18</code>, <code>ways = 0</code>.', { node: 0 });
            while (pq.length) {
                const [dist_, node] = pq.shift();
                if (dist_ > dist[node]) {
                    snap(`Pop <code>{${dist_}, ${node}}</code>: <code>dist_ = ${dist_} &gt; dist[${node}] = ${dist[node]}</code> → <b>stale</b>, <code>continue</code>. (Processing it would add <code>ways[${node}]</code> twice!)`,
                        { node, stale: true, vars: { dist_, node } });
                    continue;
                }
                done.add(node);
                snap(`Pop <code>{${dist_}, ${node}}</code>: <code>dist[${node}] = ${dist_}</code> is final and <code>ways[${node}] = ${ways[node]}</code> is complete. Relax its neighbours.`,
                    { node, vars: { dist_, node }, vchanged: ['dist_', 'node'] });
                for (const [adjNode, edgeWeight] of adjList[node]) {
                    const newdist = dist_ + edgeWeight;
                    const vars = { dist_, node, adjNode, edgeWeight, newdist };
                    if (newdist < dist[adjNode]) {
                        const old = dist[adjNode];
                        dist[adjNode] = newdist;
                        ways[adjNode] = ways[node];
                        preds[adjNode] = new Set([node]);
                        pqPush(pq, [dist[adjNode], adjNode]);
                        snap(`${node}→${adjNode}: <code>newdist = ${newdist} &lt; ${fmtD(old)}</code> → <b>shorter</b>: <code>dist[${adjNode}] = ${newdist}</code>, <b>reset</b> <code>ways[${adjNode}] = ways[${node}] = ${ways[node]}</code>, push.`,
                            { node, edge: [node, adjNode], v: adjNode, vars, vchanged: ['newdist'] });
                    } else if (newdist === dist[adjNode]) {
                        ways[adjNode] = (ways[adjNode] + ways[node]) % MOD;
                        preds[adjNode].add(node);
                        snap(`${node}→${adjNode}: <code>newdist = ${newdist} == dist[${adjNode}]</code> → <b>another shortest route</b>: <code>ways[${adjNode}] += ways[${node}]</code> → ${ways[adjNode]}.`,
                            { node, edge: [node, adjNode], v: adjNode, vars, vchanged: ['newdist'] });
                    } else if (!done.has(adjNode)) {
                        snap(`${node}→${adjNode}: <code>newdist = ${newdist} &gt; dist[${adjNode}] = ${dist[adjNode]}</code> → longer, ignore.`,
                            { node, edge: [node, adjNode], ok: false, vars });
                    }
                }
            }
            snap(`Heap empty. <b>Answer = ways[${n - 1}] = ${ways[n - 1]}</b> shortest routes of length ${dist[n - 1]} (green edges form the shortest-path DAG).`, { node: n - 1, final: true, vars: { 'ways[n-1]': ways[n - 1] } });
            return frames;
        }
    });

    /* ======================================================== p13 Shortest Path in Binary Matrix */
    DryRun.register('p13', {
        title: '8-direction BFS with a dist matrix',
        input: 'grid = [[0,0,1,0],[1,0,1,0],[1,0,0,1],[0,1,0,0]]',
        legend: [['cur', 'popped cell'], ['queued', 'pushed this step / in queue'], ['visited', 'popped'], ['wall', 'blocked (1)'], ['path', 'answer cell']],
        insight: {
            pattern: 'Grid BFS (unit weights, 8 neighbours)',
            idea: [
                'Each move costs 1 → BFS. The first time a cell gets a distance it is already the shortest one.',
                'Path length counts <b>cells</b>, so the start has length 1 (that is why <code>{1,{0,0}}</code> is pushed).',
                'Check <code>grid[0][0]</code> and <code>grid[n-1][n-1]</code> up front — a blocked endpoint means -1.'
            ],
            traps: [
                'Look closely at the direction arrays: <code>(dir_r[5], dir_c[5]) = (0,-1)</code> repeats “left” and the diagonal <b>(1,-1)</b> (down-left) is missing. The 8 offsets should be every <code>(dr,dc) ≠ (0,0)</code> with <code>dr,dc ∈ {-1,0,1}</code>. In this example cell (3,0) is only reachable down-left and is never reached.',
                '<code>dist[0][0] = 0</code> but its queue entry carries 1. For <code>n == 1</code> (grid = [[0]]) this returns 0 while the expected answer is 1. Setting <code>dist[0][0] = 1</code> fixes both.',
                'Marking visited when popping instead of pushing lets cells be queued many times.'
            ],
            tips: [
                'Generate directions with two loops <code>for dr in -1..1, for dc in -1..1, skip (0,0)</code> — impossible to typo.',
                'Since dist only grows by 1 per level, you can return as soon as you pop (n-1, n-1).',
                'A* with Chebyshev distance or bidirectional BFS are optional speed-ups. Related: 1293 (obstacle elimination), 542 01 Matrix (multi-source BFS).'
            ]
        },
        frames() {
            const grid = [[0, 0, 1, 0], [1, 0, 1, 0], [1, 0, 0, 1], [0, 1, 0, 0]];
            const n = grid.length;
            const dist = Array.from({ length: n }, () => Array(n).fill(INF));
            const frames = [];
            const q = [];
            const popped = new Set();
            const snap = (note, o = {}) => {
                const cls = {};
                const vals = dist.map((row, r) => row.map((d, c) => (grid[r][c] === 1 ? '■' : d)));
                for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
                    const key = `${r},${c}`;
                    if (grid[r][c] === 1) cls[key] = 'wall';
                    else if (popped.has(key)) cls[key] = 'visited';
                }
                q.forEach(([, [r, c]]) => (cls[`${r},${c}`] = 'queued'));
                (o.pushed || []).forEach(k => (cls[k] = 'queued'));
                if (o.cur) cls[o.cur] = o.final ? 'path' : 'cur';
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'grid', title: 'dist[r][c]  (■ = grid 1)', values: vals, cls, rowLabels: [0, 1, 2, 3], colLabels: [0, 1, 2, 3], corner: 'r\\c' },
                        { type: 'list', title: 'q {dist, {row, col}}', kind: 'queue', items: q.map(([d, [r, c]]) => `${d}:(${r},${c})`) },
                        { type: 'vars', title: 'variables', vars: o.vars || { dist_: '-', row: '-', col: '-' }, changed: o.vchanged || [] }
                    ]
                });
            };
            if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) { snap('Endpoint blocked → -1', { final: true }); return frames; }
            q.push([1, [0, 0]]);
            dist[0][0] = 0;
            snap('Both corners are 0, so start. Push <code>{1,{0,0}}</code> and set <code>dist[0][0] = 0</code> (note: the queue carries 1, the matrix stores 0).', { cur: '0,0' });
            const dir_r = [-1, 0, 1, 0, -1, 0, -1, 1];
            const dir_c = [0, 1, 0, -1, -1, -1, 1, 1];
            while (q.length) {
                const [dist_, [row, col]] = q.shift();
                popped.add(`${row},${col}`);
                const pushed = [];
                for (let i = 0; i < 8; i++) {
                    const newr = row + dir_r[i], newc = col + dir_c[i];
                    if (newr >= 0 && newr < n && newc >= 0 && newc < n && grid[newr][newc] === 0 && dist_ + 1 < dist[newr][newc]) {
                        dist[newr][newc] = dist_ + 1;
                        q.push([dist_ + 1, [newr, newc]]);
                        pushed.push(`${newr},${newc}`);
                    }
                }
                const missed = (row + 1 < n && col - 1 >= 0 && grid[row + 1][col - 1] === 0 && dist[row + 1][col - 1] === INF)
                    ? ` Down-left (${row + 1},${col - 1}) is open but <b>not tried</b> — <code>(1,-1)</code> is missing from the direction arrays.` : '';
                snap(`Pop <code>{${dist_},{${row},${col}}}</code> and scan the 8 offsets in <code>dir_r/dir_c</code> order. ` +
                    (pushed.length ? `Open cells with <code>dist_ + 1 = ${dist_ + 1} &lt; dist</code>: ${pushed.map(p => `(${p})`).join(', ')} → set dist and push.` : 'No neighbour improves → nothing pushed.') + missed,
                    { cur: `${row},${col}`, pushed, vars: { dist_, row, col }, vchanged: ['dist_', 'row', 'col'] });
            }
            const d = dist[n - 1][n - 1];
            snap(`Queue empty. <b>Answer = dist[${n - 1}][${n - 1}] = ${d === INF ? -1 : d}</b>. (Cell (3,0) stays ∞ only because of the missing down-left direction — it does not affect this answer.)`,
                { cur: `${n - 1},${n - 1}`, final: true, vars: { 'dist[n-1][n-1]': d } });
            return frames;
        }
    });

    /* ======================================================== p14 City with smallest number of neighbours */
    const P14 = { n: 4, edges: [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], thr: 4 };
    const p14Pos = [[40, 60], [180, 60], [180, 200], [320, 200]];
    const p14Graph = (extra = {}) => ({
        type: 'graph', title: 'Cities', nodes: p14Pos.map((p, i) => ({ id: i, x: p[0], y: p[1] })),
        edges: P14.edges.map(([u, v, w]) => ({ u, v, w })), ...extra
    });
    const p14Count = (dist, push) => {
        const { n, thr } = P14;
        let cntCity = INF, cityNum = 0;
        for (let city = 0; city < n; city++) {
            let cnt = 0;
            const reach = [];
            for (let adjCity = 0; adjCity < n; adjCity++) if (city !== adjCity && dist[city][adjCity] <= thr) { cnt++; reach.push(adjCity); }
            const better = cnt <= cntCity;
            if (better) { cntCity = cnt; cityNum = city; }
            push(city, cnt, reach, better, cntCity, cityNum);
        }
        return cityNum;
    };
    DryRun.register('p14', {
        title: 'Approach A — Floyd–Warshall, then count reachable cities',
        input: 'n = 4, edges = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold = 4',
        legend: [['cur', 'dist[i][j] improved'], ['cmp', 'dist[i][k], dist[k][j]'], ['dep', 'row/column k'], ['done', 'within threshold']],
        insight: {
            pattern: 'All-pairs shortest paths + filtering',
            idea: [
                'We need distances from <b>every</b> city → all-pairs shortest paths. n ≤ 100, so O(n³) Floyd–Warshall is ~10⁶ operations: trivial.',
                'Floyd–Warshall DP: after processing <code>k</code>, <code>dist[i][j]</code> is the shortest path using only intermediate nodes <code>0..k</code>. That is why <code>k</code> <b>must</b> be the outermost loop.',
                'Tie-break “greatest index” for free: scan cities in increasing order and update on <code>cnt &lt;= cntCity</code>.'
            ],
            traps: [
                'Putting <code>k</code> as the inner loop is a classic silent bug — results look plausible but are wrong.',
                '<code>INT_MAX + w</code> overflows to negative; the <code>== INT_MAX → continue</code> guard (or using 1e9 as ∞) prevents it.',
                'Edges are undirected: set both <code>dist[u][v]</code> and <code>dist[v][u]</code>. Do not count the city itself (<code>city != adjCity</code>).'
            ],
            tips: [
                'Use Floyd–Warshall when n ≤ ~400 and you need all pairs; use Dijkstra from each node (O(n·E log n)) for large sparse graphs.',
                'Floyd–Warshall also handles negative edges (no negative cycles); <code>dist[i][i] &lt; 0</code> afterwards ⇔ negative cycle.',
                'Related: 1462 Course Schedule IV (transitive closure with booleans), 399 Evaluate Division, 2976 Min Cost to Convert String.'
            ]
        },
        frames() {
            const { n, edges, thr } = P14;
            const dist = Array.from({ length: n }, () => Array(n).fill(INF));
            for (let i = 0; i < n; i++) dist[i][i] = 0;
            for (const [u, v, w] of edges) { dist[u][v] = w; dist[v][u] = w; }
            const frames = [];
            const snap = (note, o = {}) => {
                const cls = {};
                if (o.k !== undefined) for (let t = 0; t < n; t++) { cls[`${o.k},${t}`] = 'dep'; cls[`${t},${o.k}`] = 'dep'; }
                if (o.ik) { cls[o.ik] = 'cmp'; cls[o.kj] = 'cmp'; }
                if (o.ij) cls[o.ij] = 'cur';
                (o.ok || []).forEach(k => (cls[k] = 'done'));
                const nodeCls = {};
                if (o.k !== undefined) nodeCls[o.k] = 'cur';
                if (o.city !== undefined) { nodeCls[o.city] = 'cur'; (o.reach || []).forEach(c => (nodeCls[c] = 'done')); }
                if (o.final) nodeCls[o.ans] = 'done';
                frames.push({
                    note, final: o.final,
                    views: [
                        p14Graph({ nodeCls }),
                        { type: 'grid', title: 'dist[i][j]', values: clone(dist), cls, rowLabels: [0, 1, 2, 3], colLabels: [0, 1, 2, 3], corner: 'i\\j' },
                        { type: 'vars', title: 'variables', vars: o.vars || { k: '-', distanceThreshold: thr }, changed: o.vchanged || [] }
                    ]
                });
            };
            snap('Initialise <code>dist</code>: 0 on the diagonal, the edge weight for direct roads (both directions), <code>INT_MAX</code> (∞) elsewhere.');
            for (let k = 0; k < n; k++) {
                let any = false;
                snap(`<b>k = ${k}</b>: now allow city ${k} as an intermediate stop. Try every pair <code>(i, j)</code> via <code>dist[i][${k}] + dist[${k}][j]</code>.`, { k, vars: { k, distanceThreshold: thr }, vchanged: ['k'] });
                for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
                    if (dist[i][k] === INF || dist[k][j] === INF) continue;
                    const cand = dist[i][k] + dist[k][j];
                    if (cand < dist[i][j]) {
                        const old = dist[i][j];
                        dist[i][j] = cand; any = true;
                        snap(`k=${k}, i=${i}, j=${j}: <code>dist[${i}][${k}] + dist[${k}][${j}] = ${dist[i][k]} + ${dist[k][j]} = ${cand} &lt; ${fmtD(old)}</code> → update.`,
                            { k, ik: `${i},${k}`, kj: `${k},${j}`, ij: `${i},${j}`, vars: { k, i, j, distanceThreshold: thr } });
                    }
                }
                if (!any) snap(`k = ${k} improves nothing (every path through ${k} is no shorter).`, { k, vars: { k, distanceThreshold: thr } });
            }
            const ans = p14Count(dist, (city, cnt, reach, better, cntCity, cityNum) => {
                snap(`City <b>${city}</b>: cities with <code>dist ≤ ${thr}</code> → {${reach.join(', ')}}, <code>cnt = ${cnt}</code>. ` +
                    (better ? `<code>cnt &lt;= cntCity</code> → <code>cityNum = ${city}</code> (<code>&lt;=</code> makes a later, larger index win ties).` : `${cnt} &gt; cntCity = ${cntCity} → keep city ${cityNum}.`),
                    { city, reach, ok: reach.map(c => `${city},${c}`), vars: { city, cnt, cntCity, cityNum }, vchanged: better ? ['cntCity', 'cityNum'] : [] });
            });
            snap(`<b>Answer = ${ans}</b>: fewest reachable neighbours, ties broken by the larger index.`, { final: true, ans, vars: { cityNum: ans } });
            return frames;
        }
    });
    DryRun.register('p14', {
        title: 'Approach B — Dijkstra from every city',
        input: 'n = 4, edges = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold = 4',
        placeLast: true,
        legend: [['cur', 'popped node'], ['dep', 'current source row'], ['queued', 'in pq'], ['done', 'within threshold']],
        frames() {
            const { n, edges, thr } = P14;
            const adjList = Array.from({ length: n }, () => []);
            for (const [u, v, w] of edges) { adjList[u].push([v, w]); adjList[v].push([u, w]); }
            const dist = Array.from({ length: n }, () => Array(n).fill(INF));
            for (let i = 0; i < n; i++) dist[i][i] = 0;
            const frames = [];
            let pq = [], cur = Array(n).fill(INF);
            const snap = (note, o = {}) => {
                const cls = {}, nodeCls = {};
                if (o.src !== undefined) { for (let t = 0; t < n; t++) cls[`${o.src},${t}`] = 'dep'; nodeCls[o.src] = 'dep'; }
                pq.forEach(([, v]) => (nodeCls[v] = 'queued'));
                if (o.node !== undefined) nodeCls[o.node] = 'cur';
                (o.ok || []).forEach(k => (cls[k] = 'done'));
                if (o.city !== undefined) { nodeCls[o.city] = 'cur'; (o.reach || []).forEach(c => (nodeCls[c] = 'done')); }
                if (o.final) nodeCls[o.ans] = 'done';
                const views = [p14Graph({ nodeCls, badges: o.src !== undefined && !o.counting ? Object.fromEntries(cur.map((d, i) => [i, 'd=' + fmtD(d)])) : {} })];
                if (!o.counting) views.push({ type: 'array', title: `dijkstra(${o.src ?? '-'}) dist`, values: cur.slice() }, { type: 'list', title: 'pq {dist, node}', kind: 'pq', items: pq.map(tup) });
                views.push({ type: 'grid', title: 'dist[src][*]', values: clone(dist), cls, rowLabels: [0, 1, 2, 3], colLabels: [0, 1, 2, 3], corner: 'src' });
                frames.push({ note, final: o.final, views });
            };
            for (let src = 0; src < n; src++) {
                cur = Array(n).fill(INF); pq = [[0, src]]; cur[src] = 0;
                snap(`<code>dijkstra(${src})</code>: fresh <code>dist</code>, push <code>{0, ${src}}</code>.`, { src });
                while (pq.length) {
                    const [dist_, node] = pq.shift();
                    const upd = [];
                    for (const [adjNode, w] of adjList[node]) {
                        if (dist_ + w < cur[adjNode]) { cur[adjNode] = dist_ + w; pqPush(pq, [cur[adjNode], adjNode]); upd.push(`${adjNode}→${cur[adjNode]}`); }
                    }
                    snap(`src ${src}: pop <code>{${dist_}, ${node}}</code>. ` + (upd.length ? `Relaxed: ${upd.join(', ')}.` : 'No neighbour improves.'), { src, node });
                }
                dist[src] = cur.slice();
                snap(`<code>dist[${src}] = dijkstra(${src})</code> → row ${src} of the matrix is filled.`, { src });
            }
            const ans = p14Count(dist, (city, cnt, reach, better, cntCity, cityNum) => {
                snap(`City ${city}: reachable within ${thr} → {${reach.join(', ')}}, <code>cnt = ${cnt}</code>` + (better ? ` → <code>cityNum = ${city}</code>.` : ` → keep ${cityNum}.`),
                    { counting: true, city, reach, ok: reach.map(c => `${city},${c}`) });
            });
            snap(`Same matrix as Floyd–Warshall → <b>Answer = ${ans}</b>.`, { counting: true, final: true, ans });
            return frames;
        }
    });

    /* ======================================================== p15 / p16 Min cost to connect points */
    const PTS = [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]];
    // roughly to scale, but y is stretched so the four low points are not collinear on screen and edge labels stay readable
    const ptsXY = [[30, 290], [140, 215], [222, 20], [305, 215], [415, 290]];
    const ptsNodes = PTS.map((_, i) => ({ id: i, x: ptsXY[i][0], y: ptsXY[i][1], label: i }));
    const manhattan = (i, j) => Math.abs(PTS[i][0] - PTS[j][0]) + Math.abs(PTS[i][1] - PTS[j][1]);
    const ptsEdges = [];
    for (let i = 0; i < PTS.length; i++) for (let j = i + 1; j < PTS.length; j++) ptsEdges.push({ u: i, v: j, w: manhattan(i, j) });
    const PTS_INPUT = 'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]';

    DryRun.register('p15', {
        title: "Prim's: grow the tree from point 0 with a {weight, node} min-heap",
        input: PTS_INPUT,
        legend: [['cur', 'popped'], ['visited', 'inMST'], ['tree', 'MST edge'], ['bad', 'skipped (already inMST)']],
        insight: {
            pattern: 'Minimum spanning tree on a complete graph',
            idea: [
                'Every pair of points can be wired → complete graph with n(n-1)/2 Manhattan-distance edges; we want the cheapest set of n-1 edges connecting everything = MST.',
                '<b>Cut property</b>: the cheapest edge leaving the current tree is always safe to take. Prim just repeats that with a min-heap.',
                'A popped node that is already <code>inMST</code> is a stale/heavier bridge — skip it (that is what prevents cycles).'
            ],
            traps: [
                'Mark <code>inMST</code> when <b>popping</b>, not when pushing — marking on push can lock in a non-minimal bridge.',
                'Pushing every edge costs O(n² log n) time and O(n²) heap memory; for n = 1000 that is ~10⁶ entries — OK, but tight in memory-limited judges.',
                'Do not stop at the first pop; keep going until the heap is empty (or count n added nodes and break early).'
            ],
            tips: [
                'For dense graphs, <b>array Prim</b> (keep <code>minDist[v]</code>, pick the min by linear scan) is O(n²) with O(n) memory — the optimal choice for this problem.',
                'You may break as soon as n nodes are in the tree.',
                'Related: 1135 Connecting Cities With Minimum Cost, 1168 Optimize Water Distribution (add a virtual node 0).'
            ]
        },
        frames() {
            const n = PTS.length;
            const adjList = Array.from({ length: n }, () => []);
            for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const c = manhattan(i, j); adjList[i].push([j, c]); adjList[j].push([i, c]); }
            const pq = []; // [weight, node, from]  — only {weight,node} take part in the ordering
            const inMST = Array(n).fill(false), mstEdges = [];
            let totalCost = 0;
            const frames = [];
            const snap = (note, o = {}) => {
                const nodeCls = {}, edgeCls = {};
                ptsEdges.forEach(e => (edgeCls[ek(e.u, e.v)] = 'dim'));
                for (let i = 0; i < n; i++) if (inMST[i]) nodeCls[i] = 'visited';
                mstEdges.forEach(([a, b]) => (edgeCls[ek(a, b)] = 'tree'));
                if (o.node !== undefined) nodeCls[o.node] = o.skip ? 'bad' : 'cur';
                if (o.edge) edgeCls[ek(o.edge[0], o.edge[1])] = o.skip ? 'bad' : 'cur';
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'graph', title: 'Points (all pairs, Manhattan cost)', nodes: ptsNodes, edges: ptsEdges, nodeCls, edgeCls },
                        { type: 'list', title: 'pq {weight, node}', kind: 'pq', items: pq.map(t => tup(t.slice(0, 2))) },
                        { type: 'array', title: 'inMST[]', values: inMST.slice(), cls: Object.fromEntries(inMST.map((b, i) => [i, b ? 'visited' : ''])) },
                        { type: 'vars', title: 'variables', vars: { cost: o.cost ?? '-', node: o.node ?? '-', totalCost }, changed: o.vchanged || [] }
                    ]
                });
            };
            pq.push([0, 0, -1]);
            snap('Pre-compute all Manhattan costs into <code>adjList</code>. Push <code>{0, 0}</code>: start the “ink blot” at point 0 for free.');
            while (pq.length) {
                const [cost, node, from] = pq.shift();
                if (inMST[node]) {
                    snap(`Pop <code>{${cost}, ${node}}</code>: point ${node} is already <code>inMST</code> → <code>continue</code> (taking it would form a cycle).`, { cost, node, skip: true, edge: from >= 0 ? [from, node] : null });
                    continue;
                }
                inMST[node] = true; totalCost += cost;
                if (from >= 0) mstEdges.push([from, node]);
                const pushed = [];
                for (const [adjNode, edgeWeight] of adjList[node]) if (!inMST[adjNode]) { pqPush(pq, [edgeWeight, adjNode, node], 2); pushed.push(`{${edgeWeight},${adjNode}}`); }
                snap(`Pop <code>{${cost}, ${node}}</code>: cheapest bridge to a new point → add ${node} to the tree, <code>totalCost += ${cost}</code> = ${totalCost}. ` +
                    (pushed.length ? `Push bridges to points not yet in MST: ${pushed.join(' ')}.` : 'Every other point is already in the tree, nothing to push.'),
                    { cost, node, edge: from >= 0 ? [from, node] : null, vchanged: ['totalCost'] });
            }
            snap(`Heap empty, all ${n} points are connected by ${n - 1} edges. <b>Answer = ${totalCost}</b>.`, { final: true });
            return frames;
        }
    });

    DryRun.register('p16', {
        title: "Kruskal's: sorted edges + DSU (union by rank, path compression)",
        input: PTS_INPUT,
        legend: [['cur', 'edge being considered'], ['tree', 'MST edge'], ['bad', 'would make a cycle'], ['c0', 'one DSU group']],
        insight: {
            pattern: 'MST by sorting edges + Union-Find',
            idea: [
                'Sort all edges ascending and take an edge iff its endpoints are in <b>different</b> components (cycle property: the heaviest edge of any cycle is never needed).',
                'DSU answers “same component?” in ~O(1) amortised with path compression + union by rank.',
                'Stop after <code>n - 1</code> edges: a spanning tree on n nodes has exactly n-1 edges.'
            ],
            traps: [
                '<code>edges</code> must be stored as <code>{cost, u, v}</code> (cost first) so the default <code>sort</code> orders by cost.',
                'Always compare <b>roots</b> (<code>findUltimateParent</code>), never <code>parent[u] == parent[v]</code>.',
                'Here <code>findUltimateParent</code> is called in the check and again inside <code>unionSet</code> — harmless thanks to path compression.',
                'O(n²) edges for n = 1000 → 500k vectors of size 3: prefer <code>array&lt;int,3&gt;</code> or a struct to save memory/time.'
            ],
            tips: [
                'Kruskal shines on sparse edge lists; on complete graphs Prim O(n²) is asymptotically better (O(n² log n) for the sort here).',
                'Keep a DSU template ready: it also solves 1319, 684 Redundant Connection, 721 Accounts Merge, 1101 Earliest Moment Everyone Becomes Friends.',
                'Union by rank alone gives O(log n); combined with path compression it is α(n) — effectively constant.'
            ]
        },
        frames() {
            const n = PTS.length;
            const edges = [];
            for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([manhattan(i, j), i, j]);
            edges.sort(lexCmp);
            const parent = [...Array(n).keys()], rank = Array(n).fill(0);
            const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
            const unionSet = (u, v) => {
                u = find(u); v = find(v);
                if (u !== v) {
                    if (rank[u] < rank[v]) [u, v] = [v, u];
                    parent[v] = u;
                    if (rank[u] === rank[v]) rank[u]++;
                }
                return [u, v];
            };
            let totalCost = 0, edgesUsed = 0;
            const mst = [], rejected = [];
            const frames = [];
            const snap = (note, o = {}) => {
                const nodeCls = {}, edgeCls = {};
                // colour nodes by group (without mutating parent[])
                const root = x => { while (parent[x] !== x) x = parent[x]; return x; };
                const roots = [...new Set([...Array(n).keys()].map(root))];
                for (let i = 0; i < n; i++) { const r = root(i); const sz = [...Array(n).keys()].filter(t => root(t) === r).length; nodeCls[i] = sz > 1 ? 'c' + (roots.indexOf(r) % 4) : ''; }
                ptsEdges.forEach(e => (edgeCls[ek(e.u, e.v)] = 'dim'));
                mst.forEach(([a, b]) => (edgeCls[ek(a, b)] = 'tree'));
                rejected.forEach(([a, b]) => (edgeCls[ek(a, b)] = 'bad'));
                if (o.e) edgeCls[ek(o.e[1], o.e[2])] = o.reject ? 'bad' : 'cur';
                const ecls = {};
                edges.forEach((e, i) => {
                    if (mst.some(m => m[0] === e[1] && m[1] === e[2])) ecls[i] = 'done';
                    else if (rejected.some(m => m[0] === e[1] && m[1] === e[2])) ecls[i] = 'bad';
                });
                if (o.idx !== undefined) ecls[o.idx] = o.reject ? 'bad' : 'cur';
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'graph', title: 'Points (colour = DSU group)', nodes: ptsNodes, edges: ptsEdges, nodeCls, edgeCls },
                        { type: 'array', title: 'edges sorted by cost (label = u-v)', values: edges.map(e => e[0]), labels: edges.map(e => `${e[1]}-${e[2]}`), cls: ecls, pointers: o.idx !== undefined ? { e: o.idx } : {}, wide: true },
                        { type: 'array', title: 'parent[]', values: parent.slice(), cls: o.pcls || {} },
                        { type: 'array', title: 'rank[]', values: rank.slice() },
                        { type: 'vars', title: 'variables', vars: { cost: o.e ? o.e[0] : '-', u: o.e ? o.e[1] : '-', v: o.e ? o.e[2] : '-', totalCost, edgesUsed }, changed: o.vchanged || [] }
                    ]
                });
            };
            snap(`Build all ${edges.length} edges <code>{cost, i, j}</code> and <code>sort</code> them — cheapest first. Every point starts as its own group (<code>parent[i] = i</code>).`);
            for (let idx = 0; idx < edges.length; idx++) {
                const e = edges[idx], [cost, u, v] = e;
                const pu = find(u), pv = find(v);
                if (pu !== pv) {
                    const [a, b] = unionSet(u, v);
                    totalCost += cost; mst.push([u, v]);
                    ++edgesUsed;
                    snap(`Edge ${u}-${v} (cost ${cost}): roots ${pu} ≠ ${pv} → different groups. <code>unionSet</code>: <code>parent[${b}] = ${a}</code> (rank[${a}] = ${rank[a]}). <code>totalCost = ${totalCost}</code>, <code>edgesUsed = ${edgesUsed}</code>.` +
                        (edgesUsed === n - 1 ? ` That is <code>n - 1 = ${n - 1}</code> edges → <code>break</code>.` : ''),
                        { e, idx, pcls: { [b]: 'cur' }, vchanged: ['totalCost', 'edgesUsed'] });
                    if (edgesUsed === n - 1) break;
                } else {
                    rejected.push([u, v]);
                    snap(`Edge ${u}-${v} (cost ${cost}): <code>findUltimateParent(${u}) = findUltimateParent(${v}) = ${pu}</code> → already connected, building it would close a <b>cycle</b>. Skip.`, { e, idx, reject: true });
                }
            }
            snap(`Done: ${n - 1} edges chosen. <b>Answer = ${totalCost}</b> (same MST as Prim's).`, { final: true });
            return frames;
        }
    });

    /* ======================================================== p17 Make Network Connected */
    DryRun.register('p17', {
        title: 'DSU: count redundant cables and components',
        input: 'n = 6, connections = [[0,1],[2,3],[1,3],[3,0],[1,2]]',
        legend: [['cur', 'cable being processed'], ['tree', 'cable that merged groups'], ['bad', 'redundant cable (cntExtras)'], ['c0', 'one DSU group']],
        insight: {
            pattern: 'Connected components with Union-Find',
            idea: [
                'To join <code>C</code> components you need exactly <code>C - 1</code> cables. Where do they come from? Only from <b>redundant</b> cables — ones whose endpoints were already connected.',
                'So: answer = <code>C - 1</code> if <code>cntExtras ≥ C - 1</code>, else -1.',
                'Shortcut: a connected graph needs ≥ n-1 edges, so <code>connections.size() &lt; n - 1</code> ⇒ -1 immediately; otherwise the answer is always <code>C - 1</code>.'
            ],
            traps: [
                'Count components as nodes with <code>parent[i] == i</code> — <b>after</b> all unions. Isolated computers (no cables) are components too.',
                'Compare <b>ultimate</b> parents, not <code>parent[u]</code> directly.',
                'Rank is a height bound, not a size; do not use it to count members.'
            ],
            tips: [
                'DFS/BFS component counting works equally well: answer = components - 1 after the n-1 edge check.',
                'O((n + E) α(n)).',
                'Related: 547 Number of Provinces, 684 Redundant Connection, 990 Satisfiability of Equality Equations, 1579 Remove Max Number of Edges.'
            ]
        },
        frames() {
            const n = 6, connections = [[0, 1], [2, 3], [1, 3], [3, 0], [1, 2]];
            const pos = [[40, 50], [160, 50], [40, 170], [160, 170], [290, 50], [290, 170]];
            const nodes = pos.map((p, i) => ({ id: i, x: p[0], y: p[1] }));
            const edges = connections.map(([u, v]) => ({ u, v }));
            const parent = [...Array(n).keys()], rank = Array(n).fill(0);
            const compressed = [];
            const find = node => {
                if (node === parent[node]) return node;
                const r = find(parent[node]);
                if (parent[node] !== r) compressed.push(`${node}→${r}`);
                return (parent[node] = r);
            };
            const unionBysize = (u, v) => {
                const pu = find(u), pv = find(v);
                if (pu === pv) return '';
                if (rank[pu] > rank[pv]) { parent[pv] = pu; return `rank[${pu}] &gt; rank[${pv}] → <code>parent[${pv}] = ${pu}</code>`; }
                if (rank[pv] > rank[pu]) { parent[pu] = pv; return `rank[${pv}] &gt; rank[${pu}] → <code>parent[${pu}] = ${pv}</code>`; }
                parent[pv] = pu; rank[pu]++;
                return `equal ranks → <code>parent[${pv}] = ${pu}</code>, <code>rank[${pu}]++</code>`;
            };
            let cntExtras = 0;
            const used = [], extra = [];
            const frames = [];
            const snap = (note, o = {}) => {
                const root = x => { while (parent[x] !== x) x = parent[x]; return x; };
                const roots = [...new Set([...Array(n).keys()].map(root))];
                const nodeCls = {}, edgeCls = {};
                for (let i = 0; i < n; i++) { const r = root(i); nodeCls[i] = [...Array(n).keys()].some(t => t !== i && root(t) === r) ? 'c' + (roots.indexOf(r) % 4) : ''; }
                used.forEach(([a, b]) => (edgeCls[ek(a, b)] = 'tree'));
                extra.forEach(([a, b]) => (edgeCls[ek(a, b)] = 'bad'));
                if (o.e) edgeCls[ek(o.e[0], o.e[1])] = o.bad ? 'bad' : 'cur';
                (o.roots || []).forEach(r => (nodeCls[r] = 'cur'));
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'graph', title: 'Computers & cables (colour = group)', nodes, edges, nodeCls, edgeCls },
                        { type: 'array', title: 'parent[]', values: parent.slice(), cls: o.pcls || {} },
                        { type: 'array', title: 'rank[]', values: rank.slice() },
                        { type: 'vars', title: 'variables', vars: o.vars || { cntExtras }, changed: o.vchanged || [] }
                    ]
                });
            };
            snap(`<code>DisjointSet ds(${n})</code>: every computer is its own group (<code>parent[i] = i</code>, <code>rank = 0</code>).`);
            for (const [u, v] of connections) {
                compressed.length = 0;
                const pu = find(u), pv = find(v);
                const comp = compressed.length ? ` Path compression on the way: ${compressed.join(', ')}.` : '';
                if (pu === pv) {
                    cntExtras++; extra.push([u, v]);
                    snap(`Cable ${u}-${v}: <code>findUltimateParent(${u}) = findUltimateParent(${v}) = ${pu}</code> → already connected, this cable is <b>spare</b>. <code>cntExtras = ${cntExtras}</code>.${comp}`,
                        { e: [u, v], bad: true, vars: { u, v, cntExtras }, vchanged: ['cntExtras'] });
                } else {
                    const how = unionBysize(u, v);
                    used.push([u, v]);
                    snap(`Cable ${u}-${v}: roots ${pu} ≠ ${pv} → <code>unionBysize</code>: ${how}.${comp}`, { e: [u, v], vars: { u, v, cntExtras }, pcls: { [pu]: 'cur', [pv]: 'cur' } });
                }
            }
            const roots = [];
            for (let i = 0; i < n; i++) if (parent[i] === i) roots.push(i);
            const cntC = roots.length, ans = cntC - 1;
            snap(`Count roots (<code>parent[i] == i</code>): {${roots.join(', ')}} → <code>cntC = ${cntC}</code> separate networks. We need <code>ans = cntC - 1 = ${ans}</code> moves.`,
                { roots, vars: { cntExtras, cntC, ans }, vchanged: ['cntC', 'ans'] });
            snap(`<code>cntExtras = ${cntExtras} ≥ ans = ${ans}</code> → enough spare cables. <b>Answer = ${cntExtras >= ans ? ans : -1}</b>.`, { final: true, roots, vars: { cntExtras, cntC, ans } });
            return frames;
        }
    });

    /* ======================================================== p18 Kosaraju */
    DryRun.register('p18', {
        title: "Kosaraju: finish-order DFS → transpose → DFS in stack order",
        input: 'V = 8, edges: 0→1, 1→2, 2→0, 1→3, 3→4, 4→5, 5→3, 6→5, 6→7, 7→6',
        legend: [['cur', 'in dfs now'], ['visited', 'visited'], ['done', 'finished (pushed to st)'], ['c0', 'SCC 1'], ['c1', 'SCC 2'], ['c2', 'SCC 3']],
        insight: {
            pattern: 'Strongly connected components (two-pass DFS)',
            idea: [
                'Pass 1 records <b>finish order</b>. The node that finishes last lies in a “source” SCC of the condensation DAG.',
                'Transposing reverses every edge but keeps each SCC intact. A source SCC becomes a <b>sink</b>, so DFS from it on the transposed graph cannot leak into other SCCs.',
                'Popping the stack visits SCCs in topological order of the original condensation; every DFS that starts in pass 2 is exactly one SCC. Anything it could leak into was already visited.'
            ],
            traps: [
                'Push to the stack <b>after</b> exploring all children (post-order). Pushing on entry breaks the algorithm.',
                'Pass 2 must use the <b>transposed</b> graph and a <b>fresh</b> visited array.',
                'Deep recursion on V = 10⁵ chains can overflow the stack; use an iterative DFS or raise the stack size.'
            ],
            tips: [
                'O(V + E) time and memory. Tarjan’s algorithm does it in one pass with low-link values — worth knowing for bridges/articulation points too.',
                'Condensing SCCs into a DAG is the standard first step for 2-SAT, “minimum edges to make strongly connected” (max(#sources, #sinks)), and DP on cyclic graphs.',
                'Related: 1192 Critical Connections (Tarjan), 2360 Longest Cycle, GfG “Strongly Connected Components (Kosaraju)”.'
            ]
        },
        frames() {
            const V = 8;
            const E = [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4], [4, 5], [5, 3], [6, 5], [6, 7], [7, 6]];
            const pos = [[40, 60], [150, 130], [40, 200], [260, 130], [370, 60], [370, 200], [490, 200], [490, 60]];
            const nodes = pos.map((p, i) => ({ id: i, x: p[0], y: p[1] }));
            const adj = Array.from({ length: V }, () => []);
            for (const [u, v] of E) adj[u].push(v);
            const gEdges = E.map(([u, v]) => ({ u, v, directed: true }));
            const tEdges = E.map(([u, v]) => ({ u: v, v: u, directed: true }));
            const st = [], visited = Array(V).fill(0), finished = Array(V).fill(false), rec = [];
            let transposed = null, visited2 = Array(V).fill(0), scc = Array(V).fill(-1), sccCount = 0;
            const frames = [];
            const snap = (note, o = {}) => {
                const nodeCls = {}, edgeCls = {};
                for (let i = 0; i < V; i++) {
                    if (scc[i] >= 0) nodeCls[i] = 'c' + (scc[i] % 4);
                    else if (!transposed) nodeCls[i] = finished[i] ? 'done' : visited[i] ? 'visited' : '';
                    else nodeCls[i] = 'dim';
                }
                if (o.cur !== undefined) nodeCls[o.cur] = 'cur';
                if (o.edge) edgeCls[ek(o.edge[0], o.edge[1])] = 'cur';
                const views = [];
                if (!transposed) views.push({ type: 'graph', title: 'Pass 1: original graph adj', nodes, edges: gEdges, nodeCls, edgeCls, directed: true });
                else views.push({ type: 'graph', title: 'Pass 2: transposedAdj (all edges reversed)', nodes, edges: tEdges, nodeCls, edgeCls, directed: true });
                views.push(
                    { type: 'list', title: 'st (finish order)', kind: 'stack', items: st.slice(), cls: o.stCls || {} },
                    { type: 'list', title: 'recursion', kind: 'stack', items: rec.map(x => (transposed ? `dfs2(${x})` : `dfs(${x})`)) },
                    { type: 'array', title: transposed ? 'visited2[]' : 'visited[]', values: (transposed ? visited2 : visited).slice() },
                    { type: 'vars', title: 'variables', vars: { sccCount }, changed: o.vchanged || [] }
                );
                frames.push({ note, final: o.final, views });
            };
            snap('<b>Step 1</b>: DFS the original graph from every unvisited node; push a node onto <code>st</code> only when all its neighbours are done.');
            const dfs = (node, from) => {
                visited[node] = 1; rec.push(node);
                snap(`<code>dfs(${node})</code>: mark visited. Neighbours in <code>adj[${node}]</code>: [${adj[node].join(', ')}].`, { cur: node, edge: from !== undefined ? [from, node] : null });
                for (const it of adj[node]) if (!visited[it]) dfs(it, node);
                st.push(node); finished[node] = true; rec.pop();
                snap(`All neighbours of ${node} finished → <code>st.push(${node})</code> (post-order).`, { cur: node, stCls: { [st.length - 1]: 'cur' } });
            };
            for (let i = 0; i < V; i++) if (!visited[i]) dfs(i);
            transposed = Array.from({ length: V }, () => []);
            for (let i = 0; i < V; i++) for (const it of adj[i]) transposed[it].push(i);
            snap(`<b>Step 2</b>: build <code>transposedAdj</code> — every edge u→v becomes v→u. SCCs stay the same, but edges <i>between</i> SCCs now point backwards. Stack top is <b>${st[st.length - 1]}</b> (finished last).`);
            const dfs2 = (node, from) => {
                visited2[node] = 1; rec.push(node); scc[node] = sccCount;
                snap(`<code>dfs2(${node})</code> on the transposed graph: neighbours [${transposed[node].join(', ')}]` +
                    (transposed[node].some(x => visited2[x]) ? ` — already-visited ones (${transposed[node].filter(x => visited2[x]).join(', ')}) belong to earlier SCCs or this one, so DFS cannot leak.` : '.'),
                    { cur: node, edge: from !== undefined ? [from, node] : null });
                for (const it of transposed[node]) if (!visited2[it]) dfs2(it, node);
                rec.pop();
            };
            while (st.length) {
                const node = st.pop();
                if (!visited2[node]) {
                    snap(`<b>Step 3</b>: pop <b>${node}</b> — not in <code>visited2</code>, so it starts a new SCC.`, { cur: node });
                    dfs2(node);
                    sccCount++;
                    const members = [...Array(V).keys()].filter(i => scc[i] === sccCount - 1);
                    snap(`<code>dfs2</code> returned having visited {${members.join(', ')}} — that is one SCC. <code>sccCount = ${sccCount}</code>.`, { vchanged: ['sccCount'] });
                } else {
                    snap(`Pop <b>${node}</b>: already in an SCC → skip.`, { cur: node });
                }
            }
            const groups = [];
            for (let c = 0; c < sccCount; c++) groups.push('{' + [...Array(V).keys()].filter(i => scc[i] === c).join(',') + '}');
            snap(`Stack empty. <b>Answer = ${sccCount}</b> strongly connected components: ${groups.join(', ')}.`, { final: true });
            return frames;
        }
    });

    /* ======================================================== p19 Revision sheet */
    DryRun.register('p19', {
        title: 'Which algorithm when? — walk through the decision checklist',
        insightAfter: ':scope > .tagline',
        after: ':scope > .insight',
        legend: [['cur', 'question being asked'], ['done', 'chosen algorithm']],
        insight: {
            pattern: 'Choosing the right graph tool',
            idea: [
                'Ask in order: <b>What is asked?</b> (reachability / components / order / shortest path / spanning tree / SCC) → <b>Are there weights?</b> → <b>Negative?</b> → <b>Single source or all pairs?</b> → <b>How big is n?</b>',
                'Unit weights → BFS. 0/1 weights → 0-1 BFS (deque). Non-negative → Dijkstra. Negative → Bellman–Ford / SPFA. All pairs with n ≤ 400 → Floyd–Warshall.',
                'Dependencies / ordering → topological sort (Kahn’s also detects cycles: fewer than V nodes output ⇒ cycle).',
                'Dynamic connectivity / grouping while reading edges → DSU. Minimum cost to connect everything → MST.'
            ],
            traps: [
                'Dijkstra with negative edges is <b>wrong</b>, not just slow.',
                'Undirected cycle check needs the parent check; directed needs the recursion-stack (path) array — mixing them is a classic bug.',
                'Grid problems are graphs too: count V = rows·cols and E ≈ 4V (or 8V) before choosing.',
                'Use <code>long long</code> for path sums; use ∞ = 1e18 (not INT_MAX) when you will add to it.'
            ],
            tips: [
                'Constraint cheat-sheet: n ≤ 400 → O(n³) fine; n ≤ 5000 → O(n²); n ≤ 2·10⁵ → O((n+m) log n).',
                'Constraint on “at most k edges / stops” ⇒ expand the state (node, k) or Bellman–Ford with k rounds.',
                'Multi-source BFS: push all sources at distance 0 at the start (rotting oranges, 01 matrix).',
                'Bipartite ⇔ no odd cycle ⇔ BFS 2-colouring succeeds.'
            ]
        },
        frames() {
            const cases = [
                ['Minimum moves in a maze / grid', 'Unweighted? yes', 'BFS', 'O(V+E)', 'p13'],
                ['Count islands / provinces', 'Connectivity only', 'DFS / BFS / DSU', 'O(V+E)', 'p1'],
                ['Course schedule — can we finish?', 'Dependencies (DAG?)', 'Topological sort (Kahn)', 'O(V+E)', 'p8'],
                ['Signal delay from one node', 'Weighted ≥ 0, one source', 'Dijkstra', 'O(E log V)', 'p9'],
                ['Cheapest flight, ≤ k stops', 'Weighted + extra limit', 'Dijkstra on (node, stops) / BF k rounds', 'O(k·E)', 'p10'],
                ['Currency arbitrage / negative edges', 'Negative weights', 'Bellman–Ford', 'O(V·E)', ''],
                ['Every city’s reachable neighbours', 'All pairs, n ≤ 100', 'Floyd–Warshall', 'O(V³)', 'p14'],
                ['Wire all points with min cost', 'Connect everything cheaply', 'MST: Prim (dense) / Kruskal (sparse)', 'O(E log V)', 'p15'],
                ['Make the network connected', 'Merge groups while reading edges', 'DSU', 'O(E α(V))', 'p17'],
                ['Mutually reachable clusters', 'Directed cycles as groups', 'Kosaraju / Tarjan SCC', 'O(V+E)', 'p18'],
                ['Split into two teams', 'No odd cycle?', 'Bipartite 2-colouring', 'O(V+E)', 'p6']
            ];
            const frames = [];
            const table = upto => {
                let h = '<table class="dr-grid" style="text-align:left;font-family:inherit;font-size:.9rem"><tr><th>Problem says…</th><th>Key question</th><th>Use</th><th>Cost</th></tr>';
                cases.forEach((c, i) => {
                    const cls = i === upto ? 'cur' : i < upto ? 'done' : '';
                    h += `<tr><td style="text-align:left${i === upto ? ';font-weight:700;color:#ffcf5c' : ''}">${c[0]}</td><td style="text-align:left">${i <= upto ? c[1] : '?'}</td><td class="${cls}" style="text-align:left">${i <= upto ? c[2] : '?'}</td><td>${i <= upto ? c[3] : ''}</td></tr>`;
                });
                return h + '</table>';
            };
            frames.push({ note: 'Read the statement first and translate it into one of these shapes. Step through to reveal the tool for each.', views: [{ type: 'html', title: 'Decision checklist', html: table(-1), wide: true }] });
            cases.forEach((c, i) => {
                frames.push({
                    note: `<b>${c[0]}</b> → ${c[1]} → use <b>${c[2]}</b> (${c[3]}).` + (c[4] ? ` Worked dry run on page <code>${c[4]}</code>.` : ''),
                    views: [{ type: 'html', title: 'Decision checklist', html: table(i), wide: true }]
                });
            });
            frames.push({ note: '<b>Rule of thumb:</b> unit weights → BFS · non-negative → Dijkstra · negative → Bellman–Ford · all pairs (small n) → Floyd–Warshall · connect all → MST · groups → DSU · order → Topo sort · cycles-as-groups → SCC.', final: true, views: [{ type: 'html', title: 'Decision checklist', html: table(cases.length), wide: true }] });
            return frames;
        }
    });
})();
