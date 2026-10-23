/* Dry runs: Graph traversal problems (p1 – p8) */
(function () {
    const { clone } = DryRun.util;

    /* ------------------------------------------------------------ p1 Number of Provinces */
    DryRun.register('p1', {
        title: 'Count provinces with DFS on the adjacency list',
        input: 'isConnected = [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1],[0,0,0,1,1]]',
        legend: [['cur', 'node in dfs()'], ['visited', 'visited'], ['c0', 'province 1'], ['c1', 'province 2'], ['c2', 'province 3']],
        insight: {
            pattern: 'Connected components',
            idea: [
                'A province is just a <b>connected component</b>. Every time the outer loop finds an unvisited city, a brand-new component starts → <code>count++</code>.',
                'One <code>dfs(i)</code> call marks the whole component, so later cities of the same province are skipped.'
            ],
            traps: [
                'The matrix is symmetric, so pushing both <code>adj[i]</code> and <code>adj[j]</code> inside the double loop adds every edge twice — harmless for correctness, but remember it doubles the list size.',
                'Skip <code>i == j</code> (self-loop on the diagonal).'
            ],
            tips: [
                'You can DFS directly on the matrix (row <code>i</code> is the neighbour list) and skip building <code>adjList</code>: still O(V²).',
                'DSU alternative: start with <code>V</code> components and decrement on every successful <code>union</code>.'
            ]
        },
        frames() {
            const M = [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1], [0, 0, 0, 1, 1]];
            const V = M.length;
            const pos = [{ x: 60, y: 60 }, { x: 60, y: 170 }, { x: 190, y: 115 }, { x: 320, y: 60 }, { x: 320, y: 170 }];
            const nodes = pos.map((p, i) => ({ id: i, ...p }));
            const edges = [];
            for (let i = 0; i < V; i++) for (let j = i + 1; j < V; j++) if (M[i][j]) edges.push({ u: i, v: j });
            const adj = Array.from({ length: V }, () => []);
            for (let i = 0; i < V; i++) for (let j = 0; j < V; j++) if (M[i][j] === 1 && i !== j) { adj[i].push(j); adj[j].push(i); }

            const visited = Array(V).fill(false), comp = Array(V).fill(-1);
            let count = 0;
            const frames = [];
            const snap = (note, cur, stack, extra = {}) => {
                const nodeCls = {};
                for (let i = 0; i < V; i++) nodeCls[i] = comp[i] >= 0 ? 'c' + (comp[i] % 4) : '';
                if (cur !== undefined && cur !== null) nodeCls[cur] = 'cur';
                frames.push({
                    note,
                    final: extra.final,
                    views: [
                        { type: 'graph', title: 'Graph', nodes, edges, nodeCls },
                        { type: 'array', title: 'visited[]', values: visited.map(v => (v ? 'T' : 'F')), cls: Object.fromEntries(visited.map((v, i) => [i, v ? 'visited' : ''])) },
                        { type: 'list', title: 'recursion stack', kind: 'stack', items: stack.map(x => `dfs(${x})`) },
                        { type: 'vars', title: 'variables', vars: { i: extra.i ?? '-', count }, changed: extra.changed || [] }
                    ]
                });
            };

            snap('Build <code>adjList</code> from the matrix (skip the diagonal). Nothing is visited yet, <code>count = 0</code>.', null, []);
            const stack = [];
            const dfs = (u, i) => {
                visited[u] = true; comp[u] = count - 1; stack.push(u);
                snap(`<code>dfs(${u})</code>: mark <b>${u}</b> visited. Neighbours: [${adj[u].join(', ')}].`, u, clone(stack), { i });
                for (const it of adj[u]) {
                    if (!visited[it]) dfs(it, i);
                }
                stack.pop();
                snap(`All neighbours of <b>${u}</b> are visited → return from <code>dfs(${u})</code>.`, stack[stack.length - 1], clone(stack), { i });
            };
            for (let i = 0; i < V; i++) {
                if (!visited[i]) {
                    count++;
                    snap(`<code>i = ${i}</code> is <b>not visited</b> → a new province starts, <code>count = ${count}</code>.`, i, clone(stack), { i, changed: ['count'] });
                    dfs(i, i);
                } else {
                    snap(`<code>i = ${i}</code> was already visited inside an earlier DFS → skip.`, null, [], { i });
                }
            }
            snap(`Loop finished. <b>Answer = ${count}</b> provinces: {0,1}, {2}, {3,4}.`, null, [], { final: true });
            return frames;
        }
    });
})();

/* Dry runs: p2 – p8 (grid BFS/DFS, bipartite, cycle detection in directed graphs) */
(function () {
    const { clone } = DryRun.util;
    const DR = [-1, 1, 0, 0], DC = [0, 0, -1, 1];
    const DIRS = ['up', 'down', 'left', 'right'];
    const P = (r, c) => `(${r},${c})`;
    const K = (r, c) => `${r},${c}`;
    const gridLabels = (m, n) => ({ rowLabels: Array.from({ length: m }, (_, i) => i), colLabels: Array.from({ length: n }, (_, i) => i), corner: 'r\\c' });

    /* ------------------------------------------------------------ p2 Number of Islands */
    DryRun.register('p2', {
        title: 'numIslands driver + your bfs(): one BFS per unvisited land cell',
        input: 'grid = [["1","1","0","0","0"],["1","0","0","1","0"],["0","0","1","1","0"],["0","0","0","0","1"]]',
        legend: [['land', "land '1' (unvisited)"], ['water', "water '0'"], ['cur', 'popped (row,col)'], ['queued', 'in queue (already visited)'], ['visited', 'current island, done'], ['done', 'earlier islands']],
        insight: {
            pattern: 'Connected components on a grid (flood fill)',
            idea: [
                'Each island is a <b>connected component</b> of land cells under 4-directional adjacency. The driver scans every cell; an unvisited <code>\'1\'</code> means a new island → <code>count++</code> and one <code>bfs()</code> swallows the whole island.',
                'Total work is O(M·N): every cell is pushed into the queue at most once because <code>visited</code> is set <b>at push time</b>.'
            ],
            traps: [
                'Mark <code>visited</code> when you <b>push</b>, not when you pop — otherwise the same cell can be enqueued by several neighbours (TLE / memory blow-up on big grids).',
                'The grid is <code>char</code>: compare with <code>\'1\'</code>, not <code>1</code>.',
                'Check bounds <i>before</i> indexing <code>grid[nrow][ncol]</code> (short-circuit order in the <code>if</code> matters).',
                'Diagonal cells are NOT adjacent here (only 4 directions). Some variants use 8-connectivity — just extend <code>dr</code>/<code>dc</code>.'
            ],
            tips: [
                'You can drop the <code>visited</code> matrix by overwriting land with <code>\'0\'</code> (sink the island) — no extra grid besides the queue.',
                'Recursive DFS is shorter but can stack-overflow on a 300×300 all-land grid; BFS or an explicit stack is safer.',
                'Variants: Max Area of Island (LC 695 — return BFS size), Number of Enclaves (LC 1020 — BFS from the border first), Surrounded Regions (LC 130), Distinct Islands (LC 694 — record the shape).',
                'DSU also works: union each land cell with its right/down land neighbour, answer = #land − #successful unions.'
            ]
        },
        frames() {
            const grid = ['11000', '10010', '00110', '00001'].map(r => r.split(''));
            const m = grid.length, n = grid[0].length;
            const visited = DryRun.util.grid(m, n, false);
            const island = DryRun.util.grid(m, n, -1);
            let count = 0;
            const frames = [];
            const snap = (note, o = {}) => {
                const cls = {};
                for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
                    if (grid[r][c] === '0') cls[K(r, c)] = 'water';
                    else if (island[r][c] >= 0 && (o.final || island[r][c] < count - 1)) cls[K(r, c)] = 'done';
                    else if (visited[r][c]) cls[K(r, c)] = 'visited';
                    else cls[K(r, c)] = 'land';
                }
                (o.q || []).forEach(([r, c]) => (cls[K(r, c)] = 'queued'));
                if (o.cur) cls[K(o.cur[0], o.cur[1])] = 'cur';
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'grid', title: 'grid', values: clone(grid), cls, ...gridLabels(m, n) },
                        { type: 'list', title: 'queue q', kind: 'queue', items: (o.q || []).map(([r, c]) => P(r, c)) },
                        { type: 'vars', title: 'variables', vars: { i: o.i ?? '-', j: o.j ?? '-', row: o.row ?? '-', col: o.col ?? '-', count }, changed: o.changed || [] }
                    ]
                });
            };
            snap('Scan every cell with <code>i</code>, <code>j</code>. Water is skipped; an unvisited <code>\'1\'</code> starts a new island.');
            for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
                if (grid[i][j] !== '1') continue;
                if (visited[i][j]) {
                    snap(`<code>(${i},${j})</code> is land but <code>visited[${i}][${j}]</code> is already true (swallowed by an earlier BFS) → skip.`, { i, j, cur: [i, j] });
                    continue;
                }
                count++;
                // bfs(m,n,i,j,grid,visited)
                const q = [];
                visited[i][j] = true; island[i][j] = count - 1; q.push([i, j]);
                snap(`<code>(${i},${j})</code> is unvisited land → <b>new island</b>, <code>count = ${count}</code>. Call <code>bfs()</code>: mark it visited and push it.`, { i, j, q: clone(q), changed: ['count'] });
                while (q.length) {
                    const [row, col] = q.shift();
                    const pushed = [];
                    for (let k = 0; k < 4; k++) {
                        const nrow = row + DR[k], ncol = col + DC[k];
                        if (nrow >= 0 && ncol >= 0 && nrow < m && ncol < n && grid[nrow][ncol] === '1' && !visited[nrow][ncol]) {
                            q.push([nrow, ncol]); visited[nrow][ncol] = true; island[nrow][ncol] = count - 1;
                            pushed.push(`${DIRS[k]} ${P(nrow, ncol)}`);
                        }
                    }
                    snap(`Pop <code>(${row},${col})</code> and try 4 directions. ` + (pushed.length ? `Unvisited land found: <b>${pushed.join(', ')}</b> → push &amp; mark visited.` : 'No unvisited land neighbour → nothing pushed.') + (q.length ? '' : ` Queue empty → island #${count} fully explored.`), { i, j, row, col, q: clone(q), cur: [row, col], changed: ['row', 'col'] });
                }
            }
            snap(`Scan finished. <b>Answer = ${count}</b> islands.`, { final: true });
            return frames;
        }
    });

    /* ------------------------------------------------------------ p3 Flood Fill */
    DryRun.register('p3', {
        title: 'floodFill driver + your recursive dfs() (up, down, left, right)',
        input: 'image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2',
        legend: [['cur', 'dfs(r,c) painting now'], ['dep', 'pixel in recursion stack'], ['done', 'painted (visited)'], ['bad', 'call returns immediately']],
        insight: {
            pattern: 'Flood fill (DFS on an implicit grid graph)',
            idea: [
                'Read <code>initialColor = image[sr][sc]</code> <b>before</b> painting, then DFS: a pixel joins the fill iff it is in bounds, not yet visited and still has <code>initialColor</code>.',
                'All the checks sit at the top of <code>dfs()</code> (“call first, check inside”), so each cell is reached from up to 4 neighbours but painted once → O(M·N).'
            ],
            traps: [
                'If <code>color == initialColor</code> and you have no <code>visited</code> array, the "same colour" test never fails → infinite recursion. Either keep <code>visited</code> (as you do) or return early when the colours are equal.',
                'Capture <code>initialColor</code> before the first write; comparing against <code>image[sr][sc]</code> later reads the already-painted value.',
                'Bounds must be tested before <code>image[r][c]</code> is read — your <code>if</code> does this thanks to short-circuit <code>||</code>.'
            ],
            tips: [
                'With the early-return trick you can skip <code>visited</code> entirely: painted pixels no longer equal <code>initialColor</code>.',
                'Recursion depth can reach M·N (snake-shaped region); for huge grids switch to BFS / an explicit stack.',
                'Same template: Number of Islands (LC 200), Surrounded Regions (LC 130), Pacific Atlantic (LC 417), paint-bucket tools.'
            ]
        },
        frames() {
            const image = [[1, 1, 1], [1, 1, 0], [1, 0, 1]];
            const m = 3, n = 3, sr = 1, sc = 1, newColor = 2;
            const initialColor = image[sr][sc];
            const visited = DryRun.util.grid(m, n, false);
            const frames = [], stack = [];
            const snap = (note, o = {}) => {
                const cls = {};
                for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (visited[r][c]) cls[K(r, c)] = 'done';
                stack.forEach(([r, c]) => (cls[K(r, c)] = 'dep'));
                if (o.bad && o.bad[0] >= 0 && o.bad[1] >= 0 && o.bad[0] < m && o.bad[1] < n) cls[K(o.bad[0], o.bad[1])] = 'bad';
                if (o.cur) cls[K(o.cur[0], o.cur[1])] = 'cur';
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'grid', title: 'image', values: clone(image), cls, ...gridLabels(m, n) },
                        { type: 'list', title: 'recursion stack', kind: 'stack', items: stack.map(([r, c]) => `dfs${P(r, c)}`).concat(o.bad ? [`dfs${P(o.bad[0], o.bad[1])} returns`] : []), cls: o.bad ? { [stack.length]: 'bad' } : {} },
                        { type: 'vars', title: 'variables', vars: { r: o.r ?? '-', c: o.c ?? '-', initialColor, newColor }, changed: o.changed || [] }
                    ]
                });
            };
            snap(`<code>initialColor = image[${sr}][${sc}] = ${initialColor}</code>, <code>newColor = ${newColor}</code>. Start with <code>dfs(${sr},${sc})</code>.`);
            const dfs = (r, c, from) => {
                let why = null;
                if (r < 0 || c < 0 || r >= m || c >= n) why = 'out of bounds';
                else if (visited[r][c]) why = `<code>visited[${r}][${c}]</code> is already true`;
                else if (image[r][c] !== initialColor) why = `<code>image[${r}][${c}] = ${image[r][c]} ≠ initialColor</code>`;
                if (why) {
                    snap(`From <code>(${from[0]},${from[1]})</code> go ${from[2]}: <code>dfs(${r},${c})</code> returns immediately — ${why}.`, { r, c, bad: [r, c] });
                    return;
                }
                visited[r][c] = true; image[r][c] = newColor; stack.push([r, c]);
                snap(`<code>dfs(${r},${c})</code>: in bounds, unvisited and colour ${initialColor} → set <code>visited[${r}][${c}]</code>, paint <b>${newColor}</b>. Now recurse up, down, left, right.`, { r, c, cur: [r, c], changed: ['r', 'c'] });
                for (let k = 0; k < 4; k++) dfs(r + DR[k], c + DC[k], [r, c, DIRS[k]]);
                stack.pop();
            };
            dfs(sr, sc, [sr, sc, '']);
            snap(`All calls returned. Final image = <b>[${image.map(r => '[' + r.join(',') + ']').join(',')}]</b>. The bottom-right 1 is not 4-connected to the start, so it stays 1.`, { final: true });
            return frames;
        }
    });

    /* ------------------------------------------------------------ p4 Rotten Oranges */
    function rottenFrames(grid) {
        const m = grid.length, n = grid[0].length;
        const visited = DryRun.util.grid(m, n, 0);
        const q = [];
        const frames = [];
        let time = 0;
        const snap = (note, o = {}) => {
            const cls = {};
            for (let r = 0; r < m; r++) for (let c = 0; c < n; c++)
                cls[K(r, c)] = grid[r][c] === 0 ? 'wall' : visited[r][c] === 2 ? 'rotten' : visited[r][c] === 1 ? 'fresh' : '';
            q.forEach(([[r, c]]) => (cls[K(r, c)] = 'queued'));
            (o.bad || []).forEach(([r, c]) => (cls[K(r, c)] = 'bad'));
            if (o.cur) cls[K(o.cur[0], o.cur[1])] = 'cur';
            frames.push({
                note, final: o.final,
                views: [
                    { type: 'grid', title: 'visited (0 empty · 1 fresh · 2 rotten)', values: clone(visited), cls, ...gridLabels(m, n) },
                    { type: 'list', title: 'queue q  {(r,c), t}', kind: 'queue', items: q.map(([[r, c], t]) => `${P(r, c)} t=${t}`) },
                    { type: 'vars', title: 'variables', vars: { r: o.r ?? '-', c: o.c ?? '-', t: o.t ?? '-', time }, changed: o.changed || [] }
                ]
            });
        };
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
            if (grid[i][j] === 2) { q.push([[i, j], 0]); visited[i][j] = 2; }
            else if (grid[i][j] === 1) visited[i][j] = 1;
        }
        snap('Initial scan: every rotten orange is pushed with <code>t = 0</code> (<b>multi-source</b> BFS) and gets <code>visited = 2</code>; fresh ones get <code>visited = 1</code>.');
        while (q.length) {
            const [[r, c], t] = q.shift();
            const prev = time; time = Math.max(t, time);
            const rot = [];
            for (let k = 0; k < 4; k++) {
                const nr = r + DR[k], nc = c + DC[k];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && visited[nr][nc] === 1 && grid[nr][nc] === 1) {
                    q.push([[nr, nc], t + 1]); visited[nr][nc] = 2; rot.push(P(nr, nc));
                }
            }
            snap(`Pop <code>(${r},${c})</code> with <code>t = ${t}</code>; <code>time = max(${t}, ${prev}) = ${time}</code>. ` + (rot.length ? `Fresh neighbours ${rot.join(', ')} rot → push with <code>t = ${t + 1}</code>.` : 'No fresh neighbour.'), { r, c, t, cur: [r, c], changed: time !== prev ? ['time'] : [] });
        }
        const left = [];
        for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (visited[i][j] === 1) left.push([i, j]);
        if (left.length) snap(`Queue empty, but <code>visited</code> still has a <b>1</b> at ${left.map(([a, b]) => P(a, b)).join(', ')} — a fresh orange no rotten one can reach. <b>Answer = -1</b>.`, { bad: left, final: true });
        else snap(`Queue empty and no <code>visited[i][j] == 1</code> left → every orange rotted. <b>Answer = ${time}</b> minutes.`, { final: true });
        return frames;
    }
    DryRun.register('p4', {
        title: 'Multi-source BFS — all rotten oranges start in the queue at t = 0',
        legend: [['rotten', 'rotten (visited = 2)'], ['fresh', 'fresh (visited = 1)'], ['wall', 'empty cell'], ['cur', 'popped'], ['queued', 'in queue'], ['bad', 'never rots']],
        insight: {
            pattern: 'Multi-source BFS (level = minute)',
            idea: [
                'All initially rotten oranges spread <b>simultaneously</b>, so push them all at <code>t = 0</code> before the loop. BFS then pops cells in non-decreasing <code>t</code>, and the first time a fresh orange is reached is the earliest minute it rots.',
                'The answer is the largest <code>t</code> ever popped (your <code>time = max(t, time)</code>), provided no fresh orange is left.'
            ],
            traps: [
                'Running a separate BFS from each rotten orange gives wrong times (and O((MN)²)). One queue, all sources.',
                'Return <code>-1</code> only if a fresh orange remains; a grid with <b>no fresh oranges</b> (even no oranges at all) answers <code>0</code>.',
                'Mark rotten when pushing, otherwise two rotten neighbours enqueue the same orange twice.'
            ],
            tips: [
                'Level-by-level alternative: count fresh oranges, process the queue in rounds of <code>q.size()</code>, <code>minutes++</code> per round that rots something, decrement fresh on each rot; answer <code>fresh == 0 ? minutes : -1</code>.',
                'Same pattern: 01 Matrix (LC 542), Walls and Gates (LC 286), As Far from Land as Possible (LC 1162), Shortest Bridge (LC 934, BFS from a whole island).'
            ]
        },
        examples: [
            { label: 'All rot', input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', frames() { return rottenFrames([[2, 1, 1], [1, 1, 0], [0, 1, 1]]); } },
            { label: 'Impossible', input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', frames() { return rottenFrames([[2, 1, 1], [0, 1, 1], [1, 0, 1]]); } }
        ]
    });

    /* ------------------------------------------------------------ p5 01 Matrix */
    DryRun.register('p5', {
        title: 'Multi-source BFS from every 0 — dist[r][c] is written when (r,c) is popped',
        input: 'mat = [[0,0,0],[0,1,0],[1,1,1]]',
        legend: [['water', 'mat = 0 (source)'], ['land', 'mat = 1'], ['cur', 'popped now'], ['queued', 'in queue (visited)'], ['done', 'dist assigned'], ['dim', 'not reached yet']],
        insight: {
            pattern: 'Multi-source BFS (reverse the question)',
            idea: [
                'Instead of a BFS from every 1 to its nearest 0 (O((MN)²)), start from <b>all zeros at once</b> with distance 0. The first time BFS reaches a cell is its distance to the closest zero.',
                'Each cell is pushed once (visited at push time), so the whole thing is O(M·N).'
            ],
            traps: [
                'Do not BFS separately from each 1 — TLE on 10⁴ cells.',
                'Mark <code>visited</code> on push, not on pop, or a cell gets enqueued once per neighbour.',
                'Your code sets <code>dist[r][c] = s</code> on pop; setting <code>dist[nr][nc] = s + 1</code> on push is equivalent and lets you drop <code>s</code> from the queue.'
            ],
            tips: [
                'DP alternative with two sweeps: top-left → bottom-right using up/left, then bottom-right → top-left using down/right. Same O(M·N), no queue.',
                'Initialise <code>dist</code> with −1 for 1-cells and use <code>dist == -1</code> as "unvisited" to drop the separate <code>visited</code> grid.',
                'Related: Rotting Oranges (LC 994), Map of Highest Peak (LC 1765 — essentially this problem), As Far from Land as Possible (LC 1162).'
            ]
        },
        frames() {
            const mat = [[0, 0, 0], [0, 1, 0], [1, 1, 1]];
            const m = 3, n = 3;
            const visited = DryRun.util.grid(m, n, 0), dist = DryRun.util.grid(m, n, 0), popped = DryRun.util.grid(m, n, false);
            const q = [], frames = [];
            const snap = (note, o = {}) => {
                const cls = {}, mcls = {};
                for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
                    cls[K(r, c)] = popped[r][c] ? 'done' : 'dim';
                    mcls[K(r, c)] = mat[r][c] === 0 ? 'water' : 'land';
                }
                q.forEach(([[r, c]]) => (cls[K(r, c)] = 'queued'));
                if (o.cur) { cls[K(o.cur[0], o.cur[1])] = 'cur'; mcls[K(o.cur[0], o.cur[1])] = 'cur'; }
                frames.push({
                    note, final: o.final,
                    views: [
                        { type: 'grid', title: 'mat', values: mat, cls: mcls, ...gridLabels(m, n) },
                        { type: 'grid', title: 'dist', values: clone(dist), cls, ...gridLabels(m, n) },
                        { type: 'list', title: 'queue q  {(r,c), s}', kind: 'queue', items: q.map(([[r, c], s]) => `${P(r, c)} s=${s}`) },
                        { type: 'vars', title: 'variables', vars: { r: o.r ?? '-', c: o.c ?? '-', s: o.s ?? '-' } }
                    ]
                });
            };
            for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (mat[i][j] === 0) { visited[i][j] = 1; q.push([[i, j], 0]); }
            snap(`Push <b>every 0</b> with <code>s = 0</code> and mark it visited — ${q.length} sources start the BFS together.`);
            while (q.length) {
                const [[r, c], s] = q.shift();
                dist[r][c] = s; popped[r][c] = true;
                const pushed = [];
                for (let k = 0; k < 4; k++) {
                    const nr = r + DR[k], nc = c + DC[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) { q.push([[nr, nc], s + 1]); visited[nr][nc] = 1; pushed.push(P(nr, nc)); }
                }
                snap(`Pop <code>(${r},${c})</code>, set <code>dist[${r}][${c}] = ${s}</code>. ` + (pushed.length ? `Unvisited neighbours ${pushed.join(', ')} → push with <code>s = ${s + 1}</code>.` : 'All neighbours already visited.'), { r, c, s, cur: [r, c] });
            }
            snap(`Queue empty. <b>Answer = [${dist.map(r => '[' + r.join(',') + ']').join(',')}]</b>.`, { final: true });
            return frames;
        }
    });

    /* ------------------------------------------------------------ p6 Bipartite */
    function bipartiteFrames(graph, pos) {
        const n = graph.length;
        const nodes = pos.map((p, i) => ({ id: i, x: p[0], y: p[1] }));
        const edges = [];
        graph.forEach((nb, u) => nb.forEach(v => { if (u < v) edges.push({ u, v }); }));
        const color = Array(n).fill(-1);
        const stack = [], frames = [];
        const snap = (note, o = {}) => {
            const nodeCls = {}, badges = {};
            for (let i = 0; i < n; i++) { nodeCls[i] = color[i] === -1 ? '' : 'c' + color[i]; if (color[i] !== -1) badges[i] = 'c=' + color[i]; }
            if (o.cur !== undefined) nodeCls[o.cur] = 'cur';
            if (o.badNode !== undefined) nodeCls[o.badNode] = 'bad';
            const edgeCls = {};
            if (o.edge) edgeCls[`${o.edge[0]}-${o.edge[1]}`] = o.edgeCls || 'cur';
            frames.push({
                note, final: o.final,
                views: [
                    { type: 'graph', title: 'graph', nodes, edges, nodeCls, edgeCls, badges },
                    { type: 'array', title: 'color[]', values: clone(color), cls: Object.fromEntries(color.map((c, i) => [i, i === o.cur ? 'cur' : i === o.badNode ? 'bad' : c === -1 ? '' : 'visited'])) },
                    { type: 'list', title: 'recursion stack', kind: 'stack', items: stack.map(([u, c]) => `dfs(${u}, c=${c})`) },
                    { type: 'vars', title: 'variables', vars: { i: o.i ?? '-', node: o.node ?? '-', it: o.it ?? '-' } }
                ]
            });
        };
        snap('All <code>color[i] = -1</code> (uncoloured). The outer loop starts <code>dfs(i, adj, color, 0)</code> from every uncoloured node, so disconnected parts are handled too.');
        const dfs = (node, c, i) => {
            color[node] = c; stack.push([node, c]);
            snap(`<code>dfs(${node}, c=${c})</code>: set <code>color[${node}] = ${c}</code>. Every neighbour must end up with colour <b>${c ? 0 : 1}</b>.`, { cur: node, i, node });
            for (const it of graph[node]) {
                if (color[it] === -1) {
                    snap(`Neighbour <b>${it}</b> is uncoloured → recurse with <code>!c = ${c ? 0 : 1}</code>.`, { cur: node, i, node, it, edge: [node, it] });
                    if (!dfs(it, c ? 0 : 1, i)) { stack.pop(); return false; }
                    snap(`Back in <code>dfs(${node})</code>: the subtree under ${it} coloured fine.`, { cur: node, i, node, it });
                } else if (color[it] === c) {
                    snap(`Neighbour <b>${it}</b> already has colour <b>${c}</b> = <code>color[${node}]</code> → edge ${node}–${it} joins two same-coloured nodes (odd cycle). <code>return false</code>.`, { cur: node, i, node, it, edge: [node, it], edgeCls: 'bad', badNode: it });
                    stack.pop();
                    return false;
                } else {
                    snap(`Neighbour <b>${it}</b> already has the opposite colour ${color[it]} → consistent, continue.`, { cur: node, i, node, it, edge: [node, it], edgeCls: 'tree' });
                }
            }
            stack.pop();
            return true;
        };
        for (let i = 0; i < n; i++) {
            if (color[i] === -1) {
                if (i > 0) snap(`Outer loop: <code>i = ${i}</code> is still uncoloured → new component, start <code>dfs(${i}, c=0)</code>.`, { i, cur: i });
                if (!dfs(i, 0, i)) {
                    snap('<code>false</code> propagates up through every <code>dfs</code> call and out of <code>isBipartite</code>. <b>Answer = false</b>.', { final: true, i });
                    return frames;
                }
            } else {
                snap(`Outer loop: <code>i = ${i}</code> already coloured → skip.`, { i });
            }
        }
        snap('Every node coloured without a conflict → the two colours are the two sides. <b>Answer = true</b>.', { final: true });
        return frames;
    }
    DryRun.register('p6', {
        title: 'DFS 2-colouring with color[] (0 / 1, -1 = uncoloured)',
        legend: [['c0', 'colour 0'], ['c1', 'colour 1'], ['cur', 'current dfs node'], ['bad', 'conflict']],
        insight: {
            pattern: '2-colouring / odd-cycle detection',
            idea: [
                'A graph is bipartite ⇔ it has <b>no odd-length cycle</b> ⇔ it can be 2-coloured. Colour a node <code>c</code>, force every neighbour to <code>!c</code>; any neighbour already holding <code>c</code> is a contradiction.',
                'Inside a connected component the colouring is forced once the first node is chosen, so a greedy DFS/BFS is exact. O(V + E).'
            ],
            traps: [
                'The graph can be <b>disconnected</b> — loop over all nodes and start a DFS from every uncoloured one (your outer loop does this). Checking only node 0 is the classic WA.',
                'Propagate the result of the recursive call (<code>if(!dfs(...)) return false;</code>); calling <code>dfs</code> and ignoring its return value loses the conflict.',
                'Use a 3-state array (−1 / 0 / 1); a plain <code>visited</code> bool cannot tell the two sides apart.'
            ],
            tips: [
                'BFS version avoids deep recursion: pop <code>u</code>, for each <code>v</code> uncoloured → <code>color[v] = 1 - color[u]</code>; same colour → false.',
                'DSU version: union all neighbours of <code>u</code> together; if <code>find(u) == find(v)</code> for some neighbour <code>v</code> → not bipartite.',
                'Related: Possible Bipartition (LC 886, build the graph from dislikes), bipartite matching, "does the graph contain an odd cycle?".'
            ]
        },
        examples: [
            { label: 'Bipartite', input: 'graph = [[1,3],[0,2],[1,3],[0,2],[5],[4]]', frames() { return bipartiteFrames([[1, 3], [0, 2], [1, 3], [0, 2], [5], [4]], [[60, 60], [190, 60], [190, 180], [60, 180], [320, 60], [320, 180]]); } },
            { label: 'Not bipartite', input: 'graph = [[1,2,3],[0,2],[0,1,3],[0,2]]', frames() { return bipartiteFrames([[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]], [[60, 60], [200, 60], [200, 190], [60, 190]]); } }
        ]
    });

    /* ------------------------------------------------------------ shared: directed-cycle DFS (p7, p8) */
    function cycleDfsFrames(adj, pos, opts) {
        const V = adj.length;
        const nodes = pos.map((p, i) => ({ id: i, x: p[0], y: p[1] }));
        const edges = [];
        adj.forEach((nb, u) => nb.forEach(v => edges.push({ u, v })));
        const vis = Array(V).fill(0), pVis = Array(V).fill(0), check = Array(V).fill(0);
        const stack = [], frames = [];
        const snap = (note, o = {}) => {
            const nodeCls = {};
            for (let i = 0; i < V; i++) {
                if (opts.safe ? check[i] : (vis[i] && !pVis[i])) nodeCls[i] = 'done';
                else if (stack.includes(i)) nodeCls[i] = 'queued';
                else if (vis[i]) nodeCls[i] = 'bad';
                else nodeCls[i] = '';
            }
            if (o.cur !== undefined) nodeCls[o.cur] = 'cur';
            const edgeCls = {};
            if (o.edge) edgeCls[`${o.edge[0]}-${o.edge[1]}`] = o.edgeCls || 'cur';
            const arr = (name, a, on) => ({ type: 'array', title: name, values: clone(a), cls: Object.fromEntries(a.map((x, i) => [i, x ? on : ''])) });
            const views = [
                { type: 'graph', title: opts.graphTitle, nodes, edges, nodeCls, edgeCls, directed: true },
                arr('vis[]', vis, 'visited'), arr('pVis[] (on current path)', pVis, 'queued')
            ];
            if (opts.safe) views.push(arr('check[] (safe)', check, 'done'));
            views.push({ type: 'list', title: 'recursion stack', kind: 'stack', items: stack.map(u => `dfs(${u})`) });
            views.push({ type: 'vars', title: 'variables', vars: { i: o.i ?? '-', node: o.node ?? '-', it: o.it ?? '-' } });
            frames.push({ note, final: o.final, views });
        };
        snap(opts.intro);
        const dfs = (node, i) => {
            vis[node] = 1; pVis[node] = 1; stack.push(node);
            snap(`<code>dfs(${node})</code>: <code>vis[${node}] = pVis[${node}] = 1</code> (now on the current path). Out-edges → [${adj[node].join(', ') || 'none'}].`, { cur: node, i, node });
            for (const it of adj[node]) {
                if (!vis[it]) {
                    snap(`<b>${it}</b> unvisited → recurse <code>dfs(${it})</code>.`, { cur: node, i, node, it, edge: [node, it] });
                    if (dfs(it, i)) {
                        stack.pop();
                        snap(`<code>dfs(${it})</code> returned <b>true</b> (cycle below) → <code>dfs(${node})</code> returns true immediately${opts.safe ? `, so <code>check[${node}]</code> stays 0 and <code>pVis[${node}]</code> stays 1` : ''}.`, { cur: node, i, node, it });
                        return true;
                    }
                    snap(`Back in <code>dfs(${node})</code>: no cycle through ${it}.`, { cur: node, i, node, it });
                } else if (pVis[it]) {
                    snap(`<b>${it}</b> is visited <b>and</b> <code>pVis[${it}] = 1</code> → edge ${node}→${it} points back into the current path: <b>cycle!</b> <code>return true</code>.`, { cur: node, i, node, it, edge: [node, it], edgeCls: 'bad' });
                    stack.pop();
                    return true;
                } else {
                    snap(`<b>${it}</b> is visited but <code>pVis[${it}] = 0</code> (not on the current path) → already explored with no cycle, skip.`, { cur: node, i, node, it, edge: [node, it], edgeCls: 'tree' });
                }
            }
            if (opts.safe) check[node] = 1;
            pVis[node] = 0; stack.pop();
            snap(`All out-edges of <b>${node}</b> handled without a cycle → ${opts.safe ? `<code>check[${node}] = 1</code>, ` : ''}<code>pVis[${node}] = 0</code> (leave the path), return false.`, { cur: node, i, node });
            return false;
        };
        for (let i = 0; i < V; i++) {
            if (!vis[i]) {
                if (i > 0) snap(`Outer loop: <code>i = ${i}</code> not visited → <code>dfs(${i})</code>.`, { cur: i, i });
                if (dfs(i, i) && opts.stopOnCycle) {
                    snap(opts.cycleFinal, { final: true, i });
                    return frames;
                }
            } else {
                snap(`Outer loop: <code>i = ${i}</code> already visited → skip.`, { i });
            }
        }
        snap(opts.finalNote(check), { final: true });
        return frames;
    }

    /* ------------------------------------------------------------ p7 Eventual Safe Nodes */
    DryRun.register('p7', {
        title: 'DFS with vis / pVis / check — a node is safe iff its DFS finishes without hitting the path',
        input: 'graph = [[1,2],[2,3],[5],[0],[5],[],[]]',
        legend: [['cur', 'current dfs node'], ['queued', 'on current path (pVis = 1)'], ['done', 'safe (check = 1)'], ['bad', 'unsafe (reaches a cycle)']],
        insight: {
            pattern: 'Cycle detection in a directed graph (3-state DFS)',
            idea: [
                'A node is <b>unsafe</b> iff some path from it reaches a cycle. DFS with a "path" array: a neighbour with <code>pVis = 1</code> closes a cycle.',
                'When a cycle is found, <code>dfs</code> returns <code>true</code> immediately <b>without</b> resetting <code>pVis</code> or setting <code>check</code> — every node on that path stays marked, and any later node that reaches them sees <code>pVis = 1</code> and is unsafe too. Nodes whose DFS finishes cleanly get <code>check = 1</code>.',
                'O(V + E): each node is expanded once.'
            ],
            traps: [
                'Leaving <code>pVis[node] = 1</code> on the "cycle found" path is <b>intentional</b> here — resetting it would let later DFSs treat those nodes as safe.',
                'Using only <code>vis[]</code> (undirected-style) misreports edges into already-finished nodes as cycles.',
                'The answer must be sorted ascending — collecting with <code>for i in 0..V-1 if(check[i])</code> gives that for free.'
            ],
            tips: [
                'BFS alternative (Kahn on the <b>reversed</b> graph): reverse all edges, start from terminal nodes (out-degree 0) and peel nodes whose out-degree drops to 0 — those are exactly the safe nodes.',
                'The three arrays can merge into one <code>state[]</code>: 0 = unvisited, 1 = on path / unsafe, 2 = safe.',
                'Related: Course Schedule I/II (LC 207/210) use the same vis + pVis DFS.'
            ]
        },
        frames() {
            const adj = [[1, 2], [2, 3], [5], [0], [5], [], []];
            const pos = [[60, 150], [200, 40], [340, 150], [60, 40], [200, 260], [340, 260], [60, 260]];
            return cycleDfsFrames(adj, pos, {
                safe: true,
                graphTitle: 'graph (directed)',
                intro: 'Run <code>dfs</code> from every unvisited node. <code>pVis</code> marks the current recursion path; <code>check</code> marks proven-safe nodes. Start with <code>dfs(0)</code>.',
                finalNote: check => `Collect every <code>i</code> with <code>check[i] = 1</code>: <b>Answer = [${check.map((x, i) => (x ? i : -1)).filter(x => x >= 0).join(',')}]</b>. Nodes 0, 1, 3 lie on the cycle 0→1→3→0.`
            });
        }
    });

    /* ------------------------------------------------------------ p8 Course Schedule */
    function courseFrames(numCourses, prerequisites, pos) {
        const adj = Array.from({ length: numCourses }, () => []);
        for (const it of prerequisites) adj[it[1]].push(it[0]);
        return cycleDfsFrames(adj, pos, {
            safe: false, stopOnCycle: true,
            graphTitle: 'adj (edge b→a for prerequisite [a,b])',
            intro: 'Build <code>adj</code>: for each <code>[a,b]</code> push <code>a</code> into <code>adj[b]</code> (take b before a). Then search for a <b>directed cycle</b>, starting with <code>dfs(0)</code>.',
            cycleFinal: '<code>dfs</code> returned true → a cycle means those courses wait on each other forever, so <code>canFinish</code> returns false. <b>Answer = false</b>.',
            finalNote: () => 'Every DFS finished without a back edge → the prerequisite graph is a DAG. <b>Answer = true</b>.'
        });
    }
    DryRun.register('p8', {
        title: 'Directed-cycle detection with vis[] + pVis[] (path) DFS',
        legend: [['cur', 'current dfs node'], ['queued', 'on current path (pVis = 1)'], ['done', 'finished, no cycle'], ['bad', 'part of a cycle']],
        insight: {
            pattern: 'Cycle detection in a directed graph / topological sort',
            idea: [
                'All courses can be finished ⇔ the prerequisite graph has <b>no directed cycle</b> (it is a DAG).',
                'In DFS, an edge to a node that is still on the recursion path (<code>pVis = 1</code>) is a <b>back edge</b> = cycle. An edge to a visited node that has already left the path is a cross/forward edge — harmless.'
            ],
            traps: [
                'Using only <code>vis[]</code> (the undirected trick) is wrong: in the diamond 0→1→3, 0→2→3 node 3 is reached twice without any cycle.',
                'Forgetting <code>pVis[node] = 0</code> on the way out turns every cross edge into a fake cycle.',
                'Edge direction: <code>[a,b]</code> means b → a. Flipping it does not change the yes/no answer here, but it matters for Course Schedule II (the order).',
                'Courses with no prerequisites still need the outer loop over all <code>numCourses</code>.'
            ],
            tips: [
                'Kahn\'s BFS: push all in-degree-0 nodes, pop &amp; decrement; if fewer than <code>numCourses</code> nodes get popped there is a cycle. Iterative (no recursion depth issues) and directly yields the order for LC 210.',
                'A single <code>state[]</code> array (0 unvisited, 1 visiting, 2 done) replaces <code>vis</code> + <code>pVis</code>.',
                'Related: Course Schedule II (LC 210), Alien Dictionary (LC 269), Parallel Courses (LC 1136 — longest path in a DAG), Eventual Safe States (LC 802).'
            ]
        },
        examples: [
            { label: 'Possible (DAG)', input: 'numCourses = 5, prerequisites = [[1,0],[2,0],[3,1],[3,2],[4,3]]', frames() { return courseFrames(5, [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3]], [[60, 110], [190, 40], [190, 180], [320, 110], [450, 110]]); } },
            { label: 'Cycle', input: 'numCourses = 4, prerequisites = [[1,0],[2,1],[3,2],[1,3]]', frames() { return courseFrames(4, [[1, 0], [2, 1], [3, 2], [1, 3]], [[60, 110], [190, 110], [320, 40], [320, 180]]); } }
        ]
    });
})();
