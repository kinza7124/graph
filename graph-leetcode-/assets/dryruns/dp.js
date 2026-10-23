/* Dry runs: Dynamic Programming basics (dp-intro, p21 – p31, dp-subsequences, p36) */
(function () {
    const { clone } = DryRun.util;
    const INT_MAX = 2147483647, INT_MIN = -2147483648;

    /* ---- small helpers shared by every dry run in this file ---- */
    // 1-D dp array view: done = filled cells, cur = cell being computed, dep = cells it reads
    function dpArr(title, dp, opt = {}) {
        const cls = {};
        if (!opt.noDone) dp.forEach((v, i) => { if (v !== '' && v !== '-' && v !== -1) cls[i] = 'done'; });
        (opt.dep || []).forEach(i => (cls[i] = 'dep'));
        (opt.path || []).forEach(i => (cls[i] = 'path'));
        if (opt.cur !== undefined && opt.cur !== null) cls[opt.cur] = 'cur';
        Object.assign(cls, opt.extra || {});
        return { type: 'array', title, values: dp.slice(), cls, pointers: opt.pointers || {}, labels: opt.labels };
    }
    // 2-D grid view; filled(r,c) decides which cells count as computed
    function dpGrid(title, g, opt = {}) {
        const cls = {};
        g.forEach((row, r) => row.forEach((v, c) => {
            const k = `${r},${c}`;
            if (opt.clsOf) { const x = opt.clsOf(v, r, c); if (x) cls[k] = x; }
            else if (v !== '' && v !== null) cls[k] = 'done';
        }));
        // a multi-cell path only stands out if the other cells lose their 'done' colour
        if (opt.path && opt.path.length > 1) Object.keys(cls).forEach(k => { if (cls[k] === 'done') delete cls[k]; });
        (opt.dep || []).forEach(([r, c]) => (cls[`${r},${c}`] = 'dep'));
        (opt.path || []).forEach(([r, c]) => (cls[`${r},${c}`] = 'path'));
        if (opt.cur) cls[`${opt.cur[0]},${opt.cur[1]}`] = 'cur';
        return { type: 'grid', title, values: clone(g), cls, rowLabels: opt.rowLabels, colLabels: opt.colLabels, corner: opt.corner || '', wide: !!opt.wide };
    }
    const vars = (vs, changed = [], title = 'variables') => ({ type: 'vars', title, vars: vs, changed });
    const stackView = (st, title = 'call stack (top = last)') => ({ type: 'list', title, kind: 'stack', items: st.slice() });
    const show = v => (v >= INT_MAX ? 'INT_MAX' : v <= INT_MIN ? 'INT_MIN' : v);

    /* =================================================================== dp-intro Fibonacci */
    DryRun.register('dp-intro', {
        title: 'Fibonacci four ways: recursion → memo → tabulation (→ O(1) space)',
        legend: [['cur', 'being computed / top call'], ['dep', 'value read'], ['done', 'stored answer'], ['bad', 'repeated (wasted) call']],
        placeLast: true,
        insight: {
            pattern: 'DP = recursion + "remember the answers"',
            idea: [
                '<b>State:</b> <code>dp[i]</code> = the i-th Fibonacci number. <b>Recurrence:</b> <code>dp[i] = dp[i-1] + dp[i-2]</code>. <b>Base cases:</b> <code>dp[0]=0, dp[1]=1</code>.',
                'Plain recursion recomputes the same <code>fib(k)</code> over and over → O(2ⁿ). Memoization stores each answer the first time, so each state is solved once → O(N).',
                'Tabulation runs the states in dependency order (small → big) with a loop: same O(N), no recursion stack.',
                'If <code>dp[i]</code> only reads a constant number of earlier states, keep just those (<code>prev1</code>, <code>prev2</code>) → O(1) space.'
            ],
            traps: [
                'Memo array initialised to <code>0</code> instead of <code>-1</code> — <code>fib(0)=0</code> is a real answer, so 0 can\'t mean "not computed".',
                '<code>vector&lt;int&gt; dp(n+1)</code> with <code>n = 0</code> then writing <code>dp[1]</code> is out of bounds — guard small n.',
                'Fibonacci overflows <code>int</code> at n = 47 — use <code>long long</code> or take a modulo.',
                'In the O(1) version, update order matters: <code>prev2 = prev1</code> <i>before</i> <code>prev1 = curr</code>.'
            ],
            tips: [
                'Recipe for any DP: (1) write the recursion, (2) add a memo, (3) flip it into loops, (4) shrink the table.',
                'Count of states × work per state = time complexity. Here N states × O(1) = O(N).',
                'Recursion depth ~N can stack-overflow for N ≈ 10⁵–10⁶; tabulation is the safe contest choice.',
                'For huge n (10¹⁸) use matrix exponentiation: O(log n).'
            ]
        },
        examples: [
            {
                label: 'A. Plain recursion fib(4)',
                input: 'fib(4) — no memo, watch the repeated calls',
                frames() {
                    const frames = [], st = [], calls = Array(5).fill(0);
                    let total = 0;
                    const snap = (note, k, extra = {}) => {
                        const ex = {};
                        calls.forEach((c, i) => { if (c > 1) ex[i] = 'bad'; else if (c === 1) ex[i] = 'done'; });
                        frames.push({
                            note, final: extra.final,
                            views: [
                                stackView(st),
                                dpArr('calls made for each n', calls, { noDone: true, cur: k, extra: ex, labels: [0, 1, 2, 3, 4].map(i => 'fib(' + i + ')') }),
                                vars({ 'total calls': total, n: k ?? '-', returns: extra.ret ?? '-' }, extra.changed || [])
                            ]
                        });
                    };
                    const fib = n => {
                        calls[n]++; total++; st.push(`fib(${n})`);
                        if (n <= 1) {
                            snap(`<code>fib(${n})</code>: base case <code>n &lt;= 1</code> → return <b>${n}</b>.${calls[n] > 1 ? ` (called <b>${calls[n]}×</b> already!)` : ''}`, n, { ret: n, changed: ['total calls'] });
                            st.pop(); return n;
                        }
                        snap(`<code>fib(${n})</code> called${calls[n] > 1 ? ` — <b>again</b> (${calls[n]}×). Recursion has no memory, so the whole subtree is redone` : ''}. Needs <code>fib(${n - 1}) + fib(${n - 2})</code>.`, n, { changed: ['total calls'] });
                        const a = fib(n - 1), b = fib(n - 2);
                        snap(`<code>fib(${n}) = fib(${n - 1}) + fib(${n - 2}) = ${a} + ${b} = ${a + b}</code> → return.`, n, { ret: a + b });
                        st.pop(); return a + b;
                    };
                    const ans = fib(4);
                    snap(`<b>fib(4) = ${ans}</b>, but it took <b>${total} calls</b>; <code>fib(2)</code> ran 2× and <code>fib(1)</code> 3×. That blow-up is O(2ⁿ) — memoization fixes it.`, null, { final: true, ret: ans });
                    return frames;
                }
            },
            {
                label: 'B. Memoization fibMemo(5)',
                input: 'n = 5,  dp = [-1, -1, -1, -1, -1, -1]',
                frames() {
                    const n = 5, dp = Array(n + 1).fill(-1), st = [], frames = [];
                    const snap = (note, cur, extra = {}) => frames.push({
                        note, final: extra.final,
                        views: [stackView(st), dpArr('dp[] (memo, -1 = unknown)', dp, { cur, dep: extra.dep }), vars({ n: cur ?? '-', returns: extra.ret ?? '-' }, extra.changed || [])]
                    });
                    snap('<code>dp</code> starts filled with <code>-1</code> = "not computed yet". Call <code>fibMemo(5, dp)</code>.', null);
                    const f = k => {
                        st.push(`fibMemo(${k})`);
                        if (k <= 1) { snap(`<code>fibMemo(${k})</code>: base case → return <b>${k}</b> (never stored, never needed).`, k, { ret: k }); st.pop(); return k; }
                        if (dp[k] !== -1) { snap(`<code>fibMemo(${k})</code>: <code>dp[${k}] = ${dp[k]}</code> ≠ -1 → <b>reuse</b> it, no recursion. This is the saving.`, k, { ret: dp[k], dep: [k] }); st.pop(); return dp[k]; }
                        snap(`<code>fibMemo(${k})</code>: <code>dp[${k}] == -1</code> → must compute <code>fibMemo(${k - 1}) + fibMemo(${k - 2})</code>.`, k);
                        const a = f(k - 1), b = f(k - 2);
                        dp[k] = a + b;
                        snap(`Store <code>dp[${k}] = ${a} + ${b} = ${dp[k]}</code> and return it.`, k, { ret: dp[k], changed: ['returns'], dep: [k - 1, k - 2].filter(x => x >= 2) });
                        st.pop(); return dp[k];
                    };
                    const ans = f(n);
                    snap(`<b>fib(5) = ${ans}</b>. Each <code>dp[k]</code> was computed exactly once → O(N) time, O(N) memo + O(N) stack.`, null, { final: true, ret: ans });
                    return frames;
                }
            },
            {
                label: 'C. Tabulation fib(7)',
                input: 'n = 7',
                frames() {
                    const n = 7, dp = Array(n + 1).fill(''), frames = [];
                    let prev2 = '-', prev1 = '-';
                    const snap = (note, cur, dep, extra = {}) => frames.push({
                        note, final: extra.final,
                        views: [dpArr('dp[]', dp, { cur, dep, pointers: cur != null ? { i: cur } : {} }), vars({ i: cur ?? '-', 'prev2 (=dp[i-2])': prev2, 'prev1 (=dp[i-1])': prev1 }, extra.changed || [], 'space-optimised view')]
                    });
                    dp[0] = 0; dp[1] = 1; prev2 = 0; prev1 = 1;
                    snap('<code>vector&lt;int&gt; dp(n+1)</code>; base cases <code>dp[0] = 0, dp[1] = 1</code>. In version D these are <code>prev2 = 0, prev1 = 1</code>.', null, [0, 1]);
                    for (let i = 2; i <= n; i++) {
                        dp[i] = dp[i - 1] + dp[i - 2];
                        snap(`<code>i = ${i}</code>: <code>dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}</code>.`, i, [i - 1, i - 2]);
                        prev2 = prev1; prev1 = dp[i];
                        if (i === 2 || i === n) snap(`Version D: <code>curr = ${dp[i]}</code>, then shift <code>prev2 = ${prev2}</code>, <code>prev1 = ${prev1}</code>. Only two numbers are ever needed.`, i, [], { changed: ['prev2 (=dp[i-2])', 'prev1 (=dp[i-1])'] });
                    }
                    snap(`Loop done. <b>fib(7) = dp[7] = ${dp[n]}</b> (= <code>prev1</code> in the O(1) version).`, null, [], { final: true });
                    return frames;
                }
            }
        ]
    });

    /* =================================================================== p21 Climbing Stairs */
    const climb = n => function () {
        const frames = [];
        if (n <= 2) return [{ note: `<code>n &lt;= 2</code> → return <b>${n}</b>.`, final: true, views: [] }];
        const dp = Array(n + 1).fill('');
        dp[0] = '-';
        let prev2 = 1, prev1 = 2, curr = '-';
        const snap = (note, cur, dep, extra = {}) => frames.push({
            note, final: extra.final,
            views: [
                dpArr('dp[i] = ways to reach step i', dp, { cur, dep, pointers: cur ? { i: cur } : {}, extra: { 0: 'dim' } }),
                vars({ i: cur ?? '-', prev2, prev1, curr }, extra.changed || [], 'Approach 3 variables')
            ]
        });
        dp[1] = 1; dp[2] = 2;
        snap('Base cases: <code>dp[1] = 1</code> (just "1"), <code>dp[2] = 2</code> ("1+1" or "2"). <code>dp[0]</code> is unused. Approach 3 starts with <code>prev2 = 1, prev1 = 2</code>.', null, [1, 2]);
        for (let i = 3; i <= n; i++) {
            curr = prev1 + prev2;
            dp[i] = dp[i - 1] + dp[i - 2];
            snap(`<code>i = ${i}</code>: <code>dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}</code> — the last move onto step ${i} was a 1-step (from ${i - 1}) or a 2-step (from ${i - 2}).`, i, [i - 1, i - 2], { changed: ['curr'] });
            prev2 = prev1; prev1 = curr;
            snap(`Shift the window: <code>prev2 = ${prev2}</code>, <code>prev1 = ${prev1}</code> (matches the notes' trace).`, i, [], { changed: ['prev2', 'prev1'] });
        }
        snap(`<b>Answer = dp[${n}] = prev1 = ${dp[n]}</b> distinct ways.`, null, [], { final: true });
        return frames;
    };
    DryRun.register('p21', {
        title: 'Climbing Stairs: tabulation with the O(1) variables alongside',
        legend: [['cur', 'dp[i] being computed'], ['dep', 'dp[i-1], dp[i-2]'], ['done', 'filled']],
        placeLast: true,
        insight: {
            pattern: '1-D DP — counting paths (Fibonacci in disguise)',
            idea: [
                '<b>State:</b> <code>dp[i]</code> = number of distinct ways to stand on step <code>i</code>.',
                '<b>Recurrence ("one step back"):</b> the last move was either +1 (from <code>i-1</code>) or +2 (from <code>i-2</code>), and those two groups never overlap → <code>dp[i] = dp[i-1] + dp[i-2]</code>.',
                '<b>Base:</b> <code>dp[1] = 1, dp[2] = 2</code> (or equivalently <code>dp[0] = 1, dp[1] = 1</code>).'
            ],
            traps: [
                '<code>if (n &lt;= 2) return n;</code> must come before <code>dp[2] = 2</code>, otherwise n = 1 writes past a size-2 vector.',
                'Counting problems ADD the options; optimisation problems take MIN/MAX — don\'t mix them up.',
                'Answer grows like 1.618ⁿ: <code>int</code> overflows for n &gt; 45, so problems usually ask for <code>% 1e9+7</code>.'
            ],
            tips: [
                'Generalises to "steps from a set S": <code>dp[i] = Σ dp[i-s]</code> for s in S (this is also unbounded-coin "combinations in order").',
                'O(N) time, O(1) space with <code>prev1/prev2</code>. For n up to 10¹⁸, use 2×2 matrix power.',
                'Related: Min Cost Climbing Stairs (LC 746), Decode Ways (LC 91), Frog Jump (next problem).'
            ]
        },
        examples: [
            { label: 'n = 4 (notes)', input: 'n = 4', frames: climb(4) },
            { label: 'n = 6', input: 'n = 6', frames: climb(6) }
        ]
    });

    /* =================================================================== p22 Frog Jump */
    const frog = height => function () {
        const n = height.length, dp = Array(n).fill(''), frames = [];
        const snap = (note, cur, dep, v = {}, changed = [], final) => frames.push({
            note, final,
            views: [
                dpArr('height[]', height, { noDone: true, cur, extra: Object.fromEntries((dep || []).map(d => [d, 'dep'])), pointers: cur != null ? { i: cur } : {} }),
                dpArr('dp[i] = min energy to reach stone i', dp, { cur, dep }),
                vars(Object.assign({ i: cur ?? '-', jumpOne: '-', jumpTwo: '-' }, v), changed)
            ]
        });
        dp[0] = 0;
        snap('<code>dp[0] = 0</code> — the frog starts on stone 0, no energy spent.', 0, []);
        for (let i = 1; i < n; i++) {
            const jumpOne = dp[i - 1] + Math.abs(height[i] - height[i - 1]);
            snap(`<code>i = ${i}</code>: <code>jumpOne = dp[${i - 1}] + |${height[i]} - ${height[i - 1]}| = ${dp[i - 1]} + ${Math.abs(height[i] - height[i - 1])} = ${jumpOne}</code>.`, i, [i - 1], { jumpOne }, ['jumpOne']);
            let jumpTwo = INT_MAX;
            if (i > 1) {
                jumpTwo = dp[i - 2] + Math.abs(height[i] - height[i - 2]);
                snap(`<code>i &gt; 1</code> so a 2-step exists: <code>jumpTwo = dp[${i - 2}] + |${height[i]} - ${height[i - 2]}| = ${dp[i - 2]} + ${Math.abs(height[i] - height[i - 2])} = ${jumpTwo}</code>.`, i, [i - 2], { jumpOne, jumpTwo }, ['jumpTwo']);
            }
            dp[i] = Math.min(jumpOne, jumpTwo);
            snap(`<code>dp[${i}] = min(${jumpOne}, ${show(jumpTwo)}) = ${dp[i]}</code>${i === 1 ? ' — at i = 1 there is no stone -1, so <code>jumpTwo</code> stays <code>INT_MAX</code>.' : '.'}`, i, i > 1 ? [i - 1, i - 2] : [i - 1], { jumpOne, jumpTwo: show(jumpTwo) });
        }
        snap(`<b>Answer = dp[${n - 1}] = ${dp[n - 1]}</b> — minimum energy to reach the last stone.`, null, [], {}, [], true);
        return frames;
    };
    DryRun.register('p22', {
        title: 'Frog Jump: dp[i] = min(1-step, 2-step)',
        legend: [['cur', 'stone i'], ['dep', 'stone we jump from'], ['done', 'dp filled']],
        placeLast: true,
        insight: {
            pattern: '1-D DP — minimum cost path',
            idea: [
                '<b>State:</b> <code>dp[i]</code> = minimum energy to stand on stone <code>i</code>.',
                '<b>Recurrence:</b> <code>dp[i] = min(dp[i-1] + |h[i]-h[i-1]|, dp[i-2] + |h[i]-h[i-2]|)</code>.',
                'Greedy (always take the cheaper next jump) fails: a cheap jump now can force an expensive one later; DP compares complete histories.'
            ],
            traps: [
                'Forgetting the <code>i &gt; 1</code> guard → reads <code>dp[-1]</code>.',
                '<code>INT_MAX + something</code> overflows — here it\'s safe because <code>jumpTwo</code> is only ever compared, never added to.',
                'Answer is <code>dp[n-1]</code>, not <code>dp[n]</code> (0-indexed stones).'
            ],
            tips: [
                'Space: keep <code>prev1 = dp[i-1]</code>, <code>prev2 = dp[i-2]</code> → O(1).',
                'Generalises to K jumps (next problem): O(N·K).',
                'To print the actual path, store <code>parent[i]</code> = which stone produced the min and walk back from n-1.'
            ]
        },
        examples: [
            { label: '[10,20,30,10] (notes)', input: 'height = [10, 20, 30, 10]', frames: frog([10, 20, 30, 10]) },
            { label: '[30,10,60,10,60,50]', input: 'height = [30, 10, 60, 10, 60, 50]', frames: frog([30, 10, 60, 10, 60, 50]) }
        ]
    });

    /* =================================================================== p23 Frog K Jumps */
    const frogK = (height, k) => function () {
        const n = height.length, dp = Array(n).fill(INT_MAX), frames = [];
        const snap = (note, i, j, extra = {}) => {
            const dep = j ? [i - j] : [];
            frames.push({
                note, final: extra.final,
                views: [
                    dpArr('height[]', height, { noDone: true, cur: i, extra: Object.fromEntries(dep.map(d => [d, 'dep'])), pointers: i != null ? { i } : {} }),
                    dpArr('dp[] (INT_MAX = not reached yet)', dp, { cur: i, dep, extra: Object.fromEntries(dp.map((v, x) => [x, v === INT_MAX && x !== i ? '' : (x === i || dep.includes(x) ? undefined : 'done')]).filter(e => e[1] !== undefined)) }),
                    vars({ i: i ?? '-', j: j || '-', 'i - j': j ? i - j : '-', cost: extra.cost ?? '-', 'dp[i]': i != null ? show(dp[i]) : '-' }, extra.changed || [])
                ]
            });
        };
        dp[0] = 0;
        snap(`<code>dp(n, INT_MAX)</code>, then <code>dp[0] = 0</code>. Each stone looks back at most <code>k = ${k}</code> stones.`, 0, 0);
        for (let i = 1; i < n; i++) {
            for (let j = 1; j <= k; j++) {
                if (i - j >= 0) {
                    const cost = dp[i - j] + Math.abs(height[i] - height[i - j]);
                    const old = dp[i];
                    dp[i] = Math.min(dp[i], cost);
                    snap(`<code>i=${i}, j=${j}</code>: <code>cost = dp[${i - j}] + |${height[i]} - ${height[i - j]}| = ${dp[i - j]} + ${Math.abs(height[i] - height[i - j])} = ${cost}</code> → <code>dp[${i}] = min(${show(old)}, ${cost}) = ${dp[i]}</code>.`, i, j, { cost, changed: dp[i] !== old ? ['dp[i]'] : [] });
                } else {
                    snap(`<code>i=${i}, j=${j}</code>: <code>i - j = ${i - j} &lt; 0</code> → no such stone, skip.`, i, null, {});
                }
            }
        }
        snap(`<b>Answer = dp[${n - 1}] = ${dp[n - 1]}</b>.`, null, null, { final: true });
        return frames;
    };
    DryRun.register('p23', {
        title: 'Frog with K jumps: inner loop over j = 1..k',
        legend: [['cur', 'stone i'], ['dep', 'stone i-j'], ['done', 'final dp value']],
        placeLast: true,
        insight: {
            pattern: '1-D DP with a window of k transitions',
            idea: [
                '<b>State:</b> <code>dp[i]</code> = min energy to reach stone <code>i</code>.',
                '<b>Recurrence:</b> <code>dp[i] = min over j∈[1,k], i-j≥0 of dp[i-j] + |h[i]-h[i-j]|</code>.',
                'Same as Frog Jump with the two hard-coded options replaced by a loop — the classic way to generalise a DP.'
            ],
            traps: [
                'Missing the <code>i - j &gt;= 0</code> check → negative index.',
                'Initialise <code>dp</code> with <code>INT_MAX</code> (not 0), otherwise <code>min</code> keeps the fake 0.',
                'In memo form, <code>minSteps</code> must be reset inside every call.'
            ],
            tips: [
                'O(N·K) time. Space cannot drop to O(1) — you need the last k values (O(k) with a circular buffer).',
                'If the cost were just <code>dp[i-j] + c</code> (no |h| term), a monotonic deque gives O(N) sliding-window min.',
                'Related: Jump Game II (LC 45), Min Cost Climbing Stairs.'
            ]
        },
        examples: [
            { label: 'k = 2 (notes)', input: 'height = [10, 30, 40, 20], k = 2', frames: frogK([10, 30, 40, 20], 2) },
            { label: 'k = 3', input: 'height = [10, 30, 40, 50, 20], k = 3', frames: frogK([10, 30, 40, 50, 20], 3) }
        ]
    });

    /* =================================================================== p24 House Robber (non-adjacent) */
    const robLinear = (arr, name = 'arr') => {
        const n = arr.length, dp = Array(n).fill(''), frames = [];
        const snap = (note, i, dep, v = {}, final) => frames.push({
            note, final,
            views: [
                dpArr(`${name}[]`, arr, { noDone: true, cur: i, extra: Object.fromEntries((v.picked || []).map(x => [x, 'path'])), pointers: i != null ? { i } : {} }),
                dpArr('dp[i] = best sum using 0..i', dp, { cur: i, dep }),
                vars({ i: i ?? '-', pick: v.pick ?? '-', notPick: v.notPick ?? '-' }, v.changed || [])
            ]
        });
        if (n === 1) { snap(`<code>n == 1</code> → return <b>${arr[0]}</b>.`, null, [], {}, true); return { frames, ans: arr[0] }; }
        dp[0] = arr[0];
        snap(`<code>dp[0] = ${name}[0] = ${arr[0]}</code> — with one house, rob it.`, 0, []);
        dp[1] = Math.max(arr[0], arr[1]);
        snap(`<code>dp[1] = max(${name}[0], ${name}[1]) = max(${arr[0]}, ${arr[1]}) = ${dp[1]}</code> — houses 0 and 1 are adjacent, take the richer.`, 1, [0]);
        for (let i = 2; i < n; i++) {
            const pick = arr[i] + dp[i - 2], notPick = dp[i - 1];
            dp[i] = Math.max(pick, notPick);
            snap(`<code>i=${i}</code>: pick = <code>${name}[${i}] + dp[${i - 2}] = ${arr[i]} + ${dp[i - 2]} = ${pick}</code>; notPick = <code>dp[${i - 1}] = ${notPick}</code> → <code>dp[${i}] = ${dp[i]}</code> (${pick >= notPick ? 'rob it' : 'skip it'}).`, i, [i - 2, i - 1], { pick, notPick, changed: ['pick', 'notPick'] });
        }
        // backtrack the chosen houses for the final frame
        const picked = [];
        for (let i = n - 1; i >= 0;) {
            if (i === 0) { picked.push(0); break; }
            if (i === 1) { picked.push(arr[0] >= arr[1] ? 0 : 1); break; }
            if (arr[i] + dp[i - 2] >= dp[i - 1]) { picked.push(i); i -= 2; } else i--;
        }
        return { frames, ans: dp[n - 1], picked, dp, snap };
    };
    const rob = arr => function () {
        const r = robLinear(arr);
        if (r.snap) r.snap(`<b>Answer = dp[${arr.length - 1}] = ${r.ans}</b> — houses ${r.picked.slice().reverse().map(i => `${i} (${arr[i]})`).join(' + ')}.`, null, [], { picked: r.picked }, true);
        return r.frames;
    };
    DryRun.register('p24', {
        title: 'Max non-adjacent sum: pick vs notPick',
        legend: [['cur', 'index i'], ['dep', 'dp[i-2], dp[i-1]'], ['done', 'filled'], ['path', 'robbed house (final)']],
        placeLast: true,
        insight: {
            pattern: 'Pick / not-pick on a line (House Robber)',
            idea: [
                '<b>State:</b> <code>dp[i]</code> = max sum using elements <code>0..i</code> with no two adjacent.',
                '<b>Recurrence:</b> pick <code>arr[i]</code> → you can\'t use <code>i-1</code>, so add <code>dp[i-2]</code>; skip it → <code>dp[i-1]</code>. <code>dp[i] = max(arr[i] + dp[i-2], dp[i-1])</code>.',
                '<b>Base:</b> <code>dp[0] = arr[0]</code>, <code>dp[1] = max(arr[0], arr[1])</code>.'
            ],
            traps: [
                'Greedy "take every other element" fails: [2,1,1,9] → best is 2+9, not 2+1.',
                'n = 1: <code>dp[1]</code> doesn\'t exist — return early (the tabulation does).',
                'Negative numbers: with this recurrence you may pick a negative arr[i] via <code>arr[i]+dp[i-2]</code>; use <code>max(0, …)</code> semantics if an empty choice is allowed.'
            ],
            tips: [
                'O(N) time, O(1) space with <code>prev1/prev2</code> (Approach 3). Starting <code>prev2 = 0</code> also handles i = 1 neatly.',
                'Same template: Delete and Earn (LC 740), House Robber II (circular, next), House Robber III (tree DP).',
                'To reconstruct choices, walk back: if <code>arr[i]+dp[i-2] &gt;= dp[i-1]</code> house i was picked → jump to i-2, else i-1.'
            ]
        },
        examples: [
            { label: '[2,1,4,9] (notes)', input: 'arr = [2, 1, 4, 9]', frames: rob([2, 1, 4, 9]) },
            { label: '[2,7,9,3,1]', input: 'arr = [2, 7, 9, 3, 1]', frames: rob([2, 7, 9, 3, 1]) }
        ]
    });

    /* =================================================================== p25 House Robber II */
    const robCircle = nums => function () {
        const n = nums.length, frames = [];
        const ring = (note, keep, final, extra = []) => frames.push({
            note, final,
            views: [dpArr('nums[] (circle: first & last are neighbours)', nums, { noDone: true, extra: Object.fromEntries(nums.map((_, i) => [i, keep(i) ? 'dep' : 'dim'])) })].concat(extra)
        });
        if (n === 1) { ring(`<code>n == 1</code> → return <b>${nums[0]}</b>.`, () => true, true); return frames; }
        ring(`Houses 0 and ${n - 1} are neighbours, so never rob both. Split into two straight streets: <code>temp1 = nums[0..${n - 2}]</code> and <code>temp2 = nums[1..${n - 1}]</code>.`, () => true, false);
        const runs = [];
        [['temp1', 0, n - 1, 'Case 1: exclude the last house'], ['temp2', 1, n, 'Case 2: exclude the first house']].forEach(([name, a, b, label]) => {
            const t = nums.slice(a, b);
            ring(`<b>${label}</b> → <code>${name} = [${t.join(', ')}]</code>. Run <code>robdp(${name})</code>.`, i => i >= a && i < b, false);
            const r = robLinear(t, 'nums');
            r.frames.forEach(f => {
                f.note = `<code>robdp(${name})</code>: ` + f.note;
                f.views.unshift(dpArr('original nums[]', nums, { noDone: true, extra: Object.fromEntries(nums.map((_, i) => [i, i >= a && i < b ? '' : 'dim'])) }));
                f.views[1].title = `${name}[] — the robdp nums`;
                f.final = false;
                frames.push(f);
            });
            runs.push(r.ans);
            frames.push({ note: `<code>robdp(${name})</code> returns <b>${r.ans}</b>.`, views: [dpArr('original nums[]', nums, { noDone: true, extra: Object.fromEntries(nums.map((_, i) => [i, i >= a && i < b ? 'done' : 'dim'])) }), vars({ 'robdp(temp1)': runs[0], 'robdp(temp2)': runs[1] ?? '-' }, [name === 'temp1' ? 'robdp(temp1)' : 'robdp(temp2)'])] });
        });
        frames.push({ note: `<b>Answer = max(${runs[0]}, ${runs[1]}) = ${Math.max(...runs)}</b>.`, final: true, views: [dpArr('nums[]', nums, { noDone: true }), vars({ 'robdp(temp1)': runs[0], 'robdp(temp2)': runs[1], answer: Math.max(...runs) }, ['answer'])] });
        return frames;
    };
    DryRun.register('p25', {
        title: 'House Robber II: two linear runs, take the max',
        legend: [['cur', 'index i'], ['dep', 'dp[i-2], dp[i-1] / houses in this case'], ['dim', 'house excluded'], ['done', 'filled']],
        insight: {
            pattern: 'Break a circle into two lines',
            idea: [
                'In a circle the only new conflict is <b>house 0 vs house n-1</b>. Any valid plan skips at least one of them.',
                'So answer = <code>max(rob(0..n-2), rob(1..n-1))</code>, each solved with the linear House Robber DP.',
                'Both cases overlap a lot, but that\'s fine: 2 × O(N).'
            ],
            traps: [
                '<code>n == 1</code>: both slices would be empty → must return <code>nums[0]</code> first (the code does).',
                'Excluding only one end (e.g. just 1..n-1) misses plans that use house 0.',
                'Copying slices costs O(N) extra memory — pass <code>(l, r)</code> indices instead if memory is tight.'
            ],
            tips: [
                'Same "fix the wrap-around by cases" trick: circular max subarray (LC 918), circular arrangements in bitmask DP.',
                'Each linear run can use O(1) space with two variables.',
                'Time O(N), space O(N) as written (O(1) possible).'
            ]
        },
        examples: [
            { label: '[2,3,2] (notes)', input: 'nums = [2, 3, 2]', frames: robCircle([2, 3, 2]) },
            { label: '[1,2,3,1]', input: 'nums = [1, 2, 3, 1]', frames: robCircle([1, 2, 3, 1]) },
            { label: '[2,7,9,3,1]', input: 'nums = [2, 7, 9, 3, 1]', frames: robCircle([2, 7, 9, 3, 1]) }
        ]
    });

    /* =================================================================== p26 Ninja Training */
    DryRun.register('p26', {
        title: 'Ninja Training tabulation: dp[day][last]',
        input: 'n = 3, points = [[10,40,70],[20,50,80],[30,60,90]]',
        legend: [['cur', 'dp[day][last] being filled'], ['dep', 'dp[day-1][task] / points used'], ['bad', 'forbidden task (= last)'], ['done', 'filled']],
        placeLast: true,
        insight: {
            pattern: '2-D DP: (position, previous choice)',
            idea: [
                'Greedy fails because today\'s best pick may block tomorrow\'s best. Remember <b>what you did last</b> as part of the state.',
                '<b>State:</b> <code>dp[day][last]</code> = max points for days <code>0..day</code> if task <code>last</code> is forbidden on <code>day</code> (3 = nothing forbidden).',
                '<b>Recurrence:</b> <code>dp[day][last] = max over task≠last of points[day][task] + dp[day-1][task]</code>.',
                '<b>Base (day 0):</b> best single task ≠ last. <b>Answer:</b> <code>dp[n-1][3]</code>.'
            ],
            traps: [
                'Notice the index meaning: <code>dp[day-1][task]</code> = "on day-1, <code>task</code> is forbidden" — exactly what we need after doing <code>task</code> today.',
                'The 4th column (last = 3) is easy to forget; it is the answer column.',
                'Initialise tabulation cells to 0 (points are non-negative) — with negative points you\'d need -∞.'
            ],
            tips: [
                'Only the previous row is read → keep a <code>prev[4]</code> array: O(1) extra space.',
                'Time O(N·4·3). With m tasks it\'s O(N·m²); can be O(N·m) by keeping best and second-best of the previous row.',
                'Related: Paint House (LC 256), Paint House II (LC 265).'
            ]
        },
        frames() {
            const P = [[10, 40, 70], [20, 50, 80], [30, 60, 90]], n = 3;
            const dp = Array.from({ length: n }, () => Array(4).fill(''));
            const frames = [];
            const snap = (note, cur, dep, ptsCls, extra = {}) => frames.push({
                note, final: extra.final,
                views: [
                    dpGrid('points[day][task]', P, { clsOf: () => '', rowLabels: ['day 0', 'day 1', 'day 2'], colLabels: ['task 0', 'task 1', 'task 2'], dep: [] }),
                    dpGrid('dp[day][last]', dp, { cur, dep, path: extra.path, rowLabels: ['day 0', 'day 1', 'day 2'], colLabels: ['last 0', 'last 1', 'last 2', 'last 3'] }),
                    vars(extra.vars || { day: cur ? cur[0] : '-', last: cur ? cur[1] : '-' }, extra.changed || [])
                ]
            });
            const fixPts = (f, pc) => { f.views[0].cls = pc; return f; };
            const base = [[1, 2], [0, 2], [0, 1], [0, 1, 2]];
            base.forEach((ts, last) => {
                dp[0][last] = Math.max(...ts.map(t => P[0][t]));
                snap(`Base: <code>dp[0][${last}] = max(${ts.map(t => `points[0][${t}]`).join(', ')}) = max(${ts.map(t => P[0][t]).join(', ')}) = ${dp[0][last]}</code>${last === 3 ? ' — last = 3 means no restriction.' : ` — task ${last} is not allowed.`}`, [0, last], []);
                const pc = {};
                ts.forEach(t => (pc[`0,${t}`] = 'dep'));
                if (last < 3) pc[`0,${last}`] = 'bad';
                fixPts(frames[frames.length - 1], pc);
            });
            for (let day = 1; day < n; day++) {
                for (let last = 0; last < 4; last++) {
                    dp[day][last] = 0;
                    const opts = [];
                    for (let task = 0; task < 3; task++) {
                        if (task !== last) {
                            dp[day][last] = Math.max(dp[day][last], P[day][task] + dp[day - 1][task]);
                            opts.push(task);
                        }
                    }
                    const pc = {};
                    opts.forEach(t => (pc[`${day},${t}`] = 'dep'));
                    if (last < 3) pc[`${day},${last}`] = 'bad';
                    snap(`<code>dp[${day}][${last}] = max(${opts.map(t => `${P[day][t]}+${dp[day - 1][t]}`).join(', ')}) = ${dp[day][last]}</code> — try every task ≠ ${last === 3 ? 'none' : last}, add yesterday\'s best when that task is forbidden.`, [day, last], opts.map(t => [day - 1, t]));
                    fixPts(frames[frames.length - 1], pc);
                }
            }
            snap(`<b>Answer = dp[2][3] = ${dp[n - 1][3]}</b> (70 + 50 + 90: task 2 → task 1 → task 2).`, [2, 3], [], {}, { final: true, vars: { answer: dp[n - 1][3] } });
            fixPts(frames[frames.length - 1], { '0,2': 'path', '1,1': 'path', '2,2': 'path' });
            return frames;
        }
    });

    /* =================================================================== p27 Unique Paths */
    const uniq = (m, n) => function () {
        const dp = Array.from({ length: m }, () => Array(n).fill('')), frames = [];
        const snap = (note, cur, dep, extra = {}) => frames.push({
            note, final: extra.final,
            views: [
                dpGrid('dp[i][j] = paths from (0,0) to (i,j)', dp, { cur, dep, rowLabels: [...Array(m).keys()].map(i => 'i=' + i), colLabels: [...Array(n).keys()].map(j => 'j=' + j) }),
                vars(extra.vars || {}, extra.changed || [])
            ]
        });
        dp[0][0] = 1;
        snap('<code>dp[0][0] = 1</code> — one way to "reach" the start: stand still.', [0, 0], [], { vars: { i: 0, j: 0 } });
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                if (i === 0 && j === 0) { dp[i][j] = 1; continue; }
                let up = 0, left = 0;
                if (i > 0) up = dp[i - 1][j];
                if (j > 0) left = dp[i][j - 1];
                dp[i][j] = up + left;
                const dep = [];
                if (i > 0) dep.push([i - 1, j]);
                if (j > 0) dep.push([i, j - 1]);
                snap(`<code>(${i},${j})</code>: up = ${i > 0 ? `dp[${i - 1}][${j}] = ${up}` : '0 (top row)'}, left = ${j > 0 ? `dp[${i}][${j - 1}] = ${left}` : '0 (first column)'} → <code>dp[${i}][${j}] = ${dp[i][j]}</code>.`, [i, j], dep, { vars: { i, j, up, left }, changed: ['up', 'left'] });
            }
        }
        snap(`<b>Answer = dp[${m - 1}][${n - 1}] = ${dp[m - 1][n - 1]}</b> = C(${m + n - 2}, ${m - 1}).`, [m - 1, n - 1], [], { final: true, vars: { answer: dp[m - 1][n - 1] } });
        return frames;
    };
    DryRun.register('p27', {
        title: 'Unique Paths: each cell = from above + from left',
        legend: [['cur', 'cell (i,j)'], ['dep', 'above / left'], ['done', 'filled']],
        placeLast: true,
        insight: {
            pattern: 'Grid DP — counting paths',
            idea: [
                '<b>State:</b> <code>dp[i][j]</code> = number of paths from (0,0) to (i,j) moving only right/down.',
                '<b>Recurrence:</b> the last move came from above or from the left → <code>dp[i][j] = dp[i-1][j] + dp[i][j-1]</code> (missing neighbours count 0).',
                '<b>Base:</b> <code>dp[0][0] = 1</code>; the first row and column end up all 1s.'
            ],
            traps: [
                'Memo version: the bounds check <code>row &lt; 0 || col &lt; 0</code> must come <i>after</i> the (0,0) check, before indexing dp.',
                'Swapping m (rows) and n (cols) doesn\'t change the answer here, but it does in grids with obstacles.',
                'Answers overflow <code>int</code> quickly for big grids — LeetCode guarantees ≤ 2·10⁹; otherwise use <code>long long</code>.'
            ],
            tips: [
                'Space O(n): one row, <code>row[j] += row[j-1]</code> left to right.',
                'Closed form: <code>C(m+n-2, m-1)</code> — choose which of the m+n-2 moves are "down". O(min(m,n)).',
                'Related: Unique Paths II (obstacles → set cell to 0), Minimum Path Sum, Triangle, Dungeon Game.'
            ]
        },
        examples: [
            { label: 'm = 3, n = 2 (notes)', input: 'm = 3, n = 2', frames: uniq(3, 2) },
            { label: 'm = 3, n = 4', input: 'm = 3, n = 4', frames: uniq(3, 4) }
        ]
    });

    /* =================================================================== p29 Minimum Path Sum */
    DryRun.register('p29', {
        title: 'Minimum Path Sum tabulation',
        input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]',
        legend: [['cur', 'cell (i,j)'], ['dep', 'dp above / left'], ['done', 'filled'], ['path', 'optimal path']],
        placeLast: true,
        insight: {
            pattern: 'Grid DP — minimum cost path',
            idea: [
                '<b>State:</b> <code>dp[i][j]</code> = cheapest sum of a path from (0,0) to (i,j), including both ends.',
                '<b>Recurrence:</b> <code>dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])</code>; a missing neighbour is <code>INT_MAX</code> so <code>min</code> ignores it.',
                '<b>Base:</b> <code>dp[0][0] = grid[0][0]</code>.'
            ],
            traps: [
                '<code>INT_MAX + grid[i][j]</code> overflows. The tabulation is safe because it only adds to real dp values; in the memo version note the explicit <code>ans == INT_MAX</code> check.',
                'Forgetting to add <code>grid[0][0]</code> (start cell counts).',
                'Using <code>-1</code> as "unknown" in memo works only because costs are non-negative.'
            ],
            tips: [
                'Can be done in place on <code>grid</code> or with one row: O(n) space.',
                'Record which neighbour gave the min to print the path (walk back from the corner).',
                'If moves in all 4 directions were allowed, it would no longer be a DAG — use Dijkstra instead.'
            ]
        },
        frames() {
            const G = [[1, 3, 1], [1, 5, 1], [4, 2, 1]], m = 3, n = 3;
            const dp = Array.from({ length: m }, () => Array(n).fill('')), frames = [];
            const lab = { rowLabels: ['i=0', 'i=1', 'i=2'], colLabels: ['j=0', 'j=1', 'j=2'] };
            const snap = (note, cur, dep, extra = {}) => frames.push({
                note, final: extra.final,
                views: [
                    dpGrid('grid[i][j]', G, Object.assign({ clsOf: () => '', cur, path: extra.path }, lab)),
                    dpGrid('dp[i][j] = min cost to reach (i,j)', dp, Object.assign({ cur, dep, path: extra.path }, lab)),
                    vars(extra.vars || {}, extra.changed || [])
                ]
            });
            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    if (i === 0 && j === 0) {
                        dp[i][j] = G[i][j];
                        snap(`<code>(0,0)</code>: start cell → <code>dp[0][0] = grid[0][0] = ${G[0][0]}</code>.`, [0, 0], [], { vars: { i, j } });
                        continue;
                    }
                    let up = INT_MAX, left = INT_MAX;
                    if (i > 0) up = G[i][j] + dp[i - 1][j];
                    if (j > 0) left = G[i][j] + dp[i][j - 1];
                    dp[i][j] = Math.min(up, left);
                    const dep = [];
                    if (i > 0) dep.push([i - 1, j]);
                    if (j > 0) dep.push([i, j - 1]);
                    const upS = i > 0 ? `${G[i][j]} + dp[${i - 1}][${j}] = ${up}` : 'INT_MAX (no row above)';
                    const leftS = j > 0 ? `${G[i][j]} + dp[${i}][${j - 1}] = ${left}` : 'INT_MAX (no column left)';
                    snap(`<code>(${i},${j})</code>: up = ${upS}; left = ${leftS} → <code>dp[${i}][${j}] = ${dp[i][j]}</code>.`, [i, j], dep, { vars: { i, j, up: show(up), left: show(left) }, changed: ['up', 'left'] });
                }
            }
            // walk back to show the optimal path
            const path = [[m - 1, n - 1]];
            let i = m - 1, j = n - 1;
            while (i > 0 || j > 0) {
                if (i > 0 && (j === 0 || dp[i - 1][j] <= dp[i][j - 1])) i--; else j--;
                path.unshift([i, j]);
            }
            snap(`<b>Answer = dp[2][2] = ${dp[m - 1][n - 1]}</b>. Walking back along the smaller neighbour gives the path ${path.map(([a, b]) => G[a][b]).join(' → ')} = ${dp[m - 1][n - 1]}.`, null, [], { final: true, path, vars: { answer: dp[m - 1][n - 1] } });
            return frames;
        }
    });

    /* =================================================================== p30 Partition Equal Subset Sum */
    const tfCls = v => (v === true ? 'done' : v === false ? 'dim' : '');
    const partition = nums => function () {
        const n = nums.length, frames = [];
        let sum = 0;
        for (let i = 0; i < n; i++) sum += nums[i];
        if (sum % 2 !== 0) {
            return [{ note: `<code>sum = ${sum}</code> is odd → two equal halves are impossible. <b>Answer = false</b> (no table needed).`, final: true, views: [dpArr('nums[]', nums, { noDone: true }), vars({ sum, 'sum % 2': 1 }, ['sum'])] }];
        }
        const target = sum / 2;
        const dp = Array.from({ length: n }, () => Array(target + 1).fill(''));
        const lab = { rowLabels: nums.map((v, i) => `i=${i} (${v})`), colLabels: [...Array(target + 1).keys()].map(String), corner: 'i \\ T', wide: true };
        const snap = (note, cur, dep, extra = {}) => frames.push({
            note, final: extra.final,
            views: [
                dpGrid('dp[i][T] — can a subset of nums[0..i] make sum T?', dp, Object.assign({ clsOf: tfCls, cur: cur || extra.cur, dep }, lab)),
                vars(extra.vars || { sum, target }, extra.changed || [])
            ]
        });
        snap(`<code>sum = ${sum}</code> is even → look for a subset with <code>target = ${sum}/2 = ${target}</code>. The rest automatically sums to ${target} too.`, null, [], { changed: ['sum', 'target'] });
        for (let i = 0; i < n; i++) dp[i][0] = true;
        snap('<code>dp[i][0] = true</code> for every i — the empty subset makes sum 0.', null, []);
        for (let T = 1; T <= target; T++) dp[0][T] = false;
        if (nums[0] <= target) dp[0][nums[0]] = true;
        snap(`Row 0 (only <code>nums[0] = ${nums[0]}</code>): <code>dp[0][${nums[0]}] = true</code>, every other <code>dp[0][T]</code> stays false.`, [0, nums[0]], []);
        for (let i = 1; i < n; i++) {
            for (let T = 1; T <= target; T++) {
                const nottake = dp[i - 1][T];
                let take = false;
                if (nums[i] <= T) take = dp[i - 1][T - nums[i]];
                dp[i][T] = take || nottake;
                const dep = [[i - 1, T]];
                if (nums[i] <= T) dep.push([i - 1, T - nums[i]]);
                const takeS = nums[i] <= T ? `take = dp[${i - 1}][${T}-${nums[i]}] = ${take ? 'T' : 'F'}` : `take = F (${nums[i]} &gt; ${T})`;
                snap(`<code>dp[${i}][${T}]</code>: nottake = dp[${i - 1}][${T}] = ${nottake ? 'T' : 'F'}; ${takeS} → <b>${dp[i][T] ? 'T' : 'F'}</b>.`, [i, T], dep, { vars: { i, T, 'nums[i]': nums[i], nottake, take }, changed: ['take', 'nottake'] });
            }
        }
        snap(`<b>Answer = dp[${n - 1}][${target}] = ${dp[n - 1][target]}</b>${nums.join() === '1,5,11,5' ? ' — {11} vs {1, 5, 5}' : ''}.`, null, [], { final: true, cur: [n - 1, target], vars: { answer: dp[n - 1][target] } });
        return frames;
    };
    DryRun.register('p30', {
        title: 'Partition Equal Subset Sum: boolean table dp[i][T]',
        legend: [['cur', 'dp[i][T] being filled'], ['dep', 'dp[i-1][T], dp[i-1][T-nums[i]]'], ['done', 'true'], ['dim', 'false']],
        placeLast: true,
        insight: {
            pattern: 'Subset-sum (0/1 knapsack, boolean)',
            idea: [
                'Equal halves ⇔ some subset sums to <code>S/2</code>. If S is odd → false immediately.',
                '<b>State:</b> <code>dp[i][T]</code> = can some subset of <code>nums[0..i]</code> sum to exactly <code>T</code>?',
                '<b>Recurrence:</b> <code>dp[i][T] = dp[i-1][T] || dp[i-1][T-nums[i]]</code> (skip it, or use it once).',
                '<b>Base:</b> <code>dp[i][0] = true</code>; row 0 is true only at <code>T = nums[0]</code>.'
            ],
            traps: [
                '<code>if (nums[0] &lt;= target)</code> guard — <code>dp[0][nums[0]]</code> can be out of bounds.',
                'Reading from row <code>i</code> instead of <code>i-1</code> turns 0/1 into "unlimited use" (unbounded knapsack).',
                '1-D optimisation must loop <code>T</code> <b>downwards</b> for the same reason.'
            ],
            tips: [
                'Space O(target): <code>for x in nums: for T = target..x: dp[T] |= dp[T-x]</code>.',
                'Bitset trick in C++: <code>bitset&lt;10001&gt; b(1); for x: b |= b &lt;&lt; x;</code> → O(N·S/64).',
                'Related: Target Sum (LC 494), Last Stone Weight II (LC 1049), Min subset-sum difference.'
            ]
        },
        examples: [
            { label: '[1,5,11,5] (notes)', input: 'nums = [1, 5, 11, 5]', frames: partition([1, 5, 11, 5]) },
            { label: '[1,2,3,5] (odd sum)', input: 'nums = [1, 2, 3, 5]', frames: partition([1, 2, 3, 5]) }
        ]
    });

    /* =================================================================== dp-subsequences */
    DryRun.register('dp-subsequences', {
        title: 'Subsequence DP: subset-sum memo & count-subsets table',
        legend: [['cur', 'current state'], ['dep', 'state read'], ['done', 'true / counted'], ['dim', 'false / 0']],
        placeLast: true,
        insight: {
            pattern: 'Take / not-take over (index, remaining target)',
            idea: [
                '<b>State:</b> <code>f(i, target)</code> = answer using only <code>arr[0..i]</code> with <code>target</code> still to make.',
                'Two moves per element: <b>not take</b> → <code>f(i-1, target)</code>; <b>take</b> (if <code>arr[i] &lt;= target</code>) → <code>f(i-1, target-arr[i])</code>.',
                'Combine with <code>||</code> (exists?), <code>+</code> (how many?), <code>max</code> (knapsack value), <code>min</code> (fewest items).',
                'Number of states = N × (target+1), O(1) work each → O(N·K).'
            ],
            traps: [
                'Zeros in <code>arr</code>: with <code>arr[0] = 0</code> the count base case must be <code>dp[0][0] = 2</code> (take or skip the 0). The shown code sets it to 1 — fine only when all elements are positive.',
                'Count problems usually need <code>% 1e9+7</code>.',
                'Memo table of <code>int</code> with -1 sentinel; don\'t use <code>vector&lt;bool&gt;</code> for memo (no third "unknown" value).'
            ],
            tips: [
                'Space: two rows <code>prev/cur</code>, or one row looping target downwards.',
                '"Count partitions with difference D" reduces to count subsets with sum <code>(S+D)/2</code>; Target Sum (LC 494) is the same.',
                'Unbounded variants (coin change) stay on index <code>i</code> after taking.'
            ]
        },
        examples: [
            {
                label: 'Subset Sum memo (notes)',
                input: 'arr = [2, 3, 1], target = 4 — call f(2, 4)',
                frames() {
                    const arr = [2, 3, 1], K = 4, n = 3;
                    const dp = Array.from({ length: n }, () => Array(K + 1).fill(-1));
                    const st = [], frames = [];
                    const snap = (note, cur, extra = {}) => frames.push({
                        note, final: extra.final,
                        views: [
                            stackView(st),
                            dpGrid('dp[i][target] memo (-1 = unknown, 1 = true, 0 = false)', dp, { clsOf: v => (v === 1 ? 'done' : v === 0 ? 'dim' : ''), cur, dep: extra.dep, rowLabels: arr.map((v, i) => `i=${i} (${v})`), colLabels: ['0', '1', '2', '3', '4'], corner: 'i \\ t' }),
                            vars({ returns: extra.ret === undefined ? '-' : extra.ret }, extra.ret === undefined ? [] : ['returns'])
                        ]
                    });
                    const f = (i, t) => {
                        st.push(`f(${i}, ${t})`);
                        if (t === 0) { snap(`<code>f(${i}, 0)</code>: <code>target == 0</code> → a subset already hits the sum, return <b>true</b>.`, [i, 0], { ret: true }); st.pop(); return true; }
                        if (i === 0) { const r = arr[0] === t; snap(`<code>f(0, ${t})</code>: last element — return <code>arr[0] == ${t}</code> → <b>${r}</b>.`, [0, t], { ret: r }); st.pop(); return r; }
                        if (dp[i][t] !== -1) { snap(`<code>f(${i}, ${t})</code>: memo hit → <b>${!!dp[i][t]}</b>.`, [i, t], { ret: !!dp[i][t] }); st.pop(); return !!dp[i][t]; }
                        snap(`<code>f(${i}, ${t})</code>: first try <b>not take</b> <code>arr[${i}] = ${arr[i]}</code> → <code>f(${i - 1}, ${t})</code>.`, [i, t]);
                        const notTake = f(i - 1, t);
                        let take = false;
                        if (arr[i] <= t) {
                            snap(`Back in <code>f(${i}, ${t})</code>: notTake = ${notTake}. <code>${arr[i]} &lt;= ${t}</code> → try <b>take</b>: <code>f(${i - 1}, ${t - arr[i]})</code>.`, [i, t]);
                            take = f(i - 1, t - arr[i]);
                        }
                        dp[i][t] = take || notTake ? 1 : 0;
                        snap(`<code>dp[${i}][${t}] = take || notTake = ${take} || ${notTake} = <b>${!!dp[i][t]}</b></code>.`, [i, t], { ret: !!dp[i][t] });
                        st.pop(); return !!dp[i][t];
                    };
                    snap('<code>dp</code> is all -1. Start at the last index: <code>f(2, 4)</code>.', null);
                    const ans = f(2, K);
                    snap(`<b>Answer = ${ans}</b> — {3, 1} sums to 4 (take 1, take 3, then target hits 0).`, null, { final: true, ret: ans });
                    return frames;
                }
            },
            {
                label: 'Count subsets (tabulation)',
                input: 'arr = [1, 2, 2, 3], k = 3',
                frames() {
                    const arr = [1, 2, 2, 3], k = 3, n = 4;
                    const dp = Array.from({ length: n }, () => Array(k + 1).fill(''));
                    const frames = [];
                    const snap = (note, cur, dep, extra = {}) => frames.push({
                        note, final: extra.final,
                        views: [
                            dpGrid('dp[i][target] = # subsets of arr[0..i] with that sum', dp, { clsOf: v => (v === '' ? '' : v > 0 ? 'done' : 'dim'), cur: cur || extra.cur, dep, rowLabels: arr.map((v, i) => `i=${i} (${v})`), colLabels: ['0', '1', '2', '3'], corner: 'i \\ t' }),
                            vars(extra.vars || {}, extra.changed || [])
                        ]
                    });
                    for (let i = 0; i < n; i++) dp[i][0] = 1;
                    for (let t = 1; t <= k; t++) dp[0][t] = 0;
                    snap('<code>dp[i][0] = 1</code> for all i (the empty subset). Row 0 starts at 0 elsewhere.', null, []);
                    if (arr[0] <= k) dp[0][arr[0]] = 1;
                    snap(`<code>arr[0] = ${arr[0]} &lt;= k</code> → <code>dp[0][${arr[0]}] = 1</code> (the subset {${arr[0]}}).`, [0, arr[0]], []);
                    for (let i = 1; i < n; i++) {
                        for (let t = 1; t <= k; t++) {
                            const notTake = dp[i - 1][t];
                            let take = 0;
                            if (arr[i] <= t) take = dp[i - 1][t - arr[i]];
                            dp[i][t] = take + notTake;
                            const dep = [[i - 1, t]];
                            if (arr[i] <= t) dep.push([i - 1, t - arr[i]]);
                            snap(`<code>dp[${i}][${t}] = take + notTake = ${arr[i] <= t ? `dp[${i - 1}][${t - arr[i]}]` : '0'} + dp[${i - 1}][${t}] = ${take} + ${notTake} = <b>${dp[i][t]}</b></code>.`, [i, t], dep, { vars: { i, target: t, 'arr[i]': arr[i], take, notTake }, changed: ['take', 'notTake'] });
                        }
                    }
                    snap(`<b>Answer = dp[3][3] = ${dp[n - 1][k]}</b> subsets: {1,2}, {1,2′}, {3}.`, null, [], { final: true, cur: [n - 1, k], vars: { answer: dp[n - 1][k] } });
                    return frames;
                }
            }
        ]
    });

    /* =================================================================== p31 0/1 Knapsack */
    DryRun.register('p31', {
        title: '0/1 Knapsack: fill dp[i][cap] row by row',
        input: 'n = 4, W = 5, wt = [1, 2, 4, 5], val = [5, 4, 8, 6]',
        legend: [['cur', 'dp[i][cap]'], ['dep', 'not take (above) / take (above-left)'], ['done', 'filled'], ['path', 'items chosen (backtrack)']],
        insight: {
            pattern: '0/1 Knapsack — max over take / not-take',
            idea: [
                '<b>State:</b> <code>dp[i][cap]</code> = best value using items <code>0..i</code> with capacity <code>cap</code>.',
                '<b>Recurrence:</b> <code>dp[i][cap] = max(dp[i-1][cap], val[i] + dp[i-1][cap-wt[i]])</code> (second only if <code>wt[i] &lt;= cap</code>).',
                '<b>Base (row 0):</b> <code>dp[0][cap] = val[0]</code> when <code>cap &gt;= wt[0]</code>, else 0.',
                'Not take = cell directly <b>above</b>; take = cell in the row above, <code>wt[i]</code> columns to the <b>left</b>.'
            ],
            traps: [
                'Take must read row <code>i-1</code>; reading row <code>i</code> lets an item be used twice (that\'s unbounded knapsack).',
                '1-D version: loop <code>cap</code> from <code>W</code> <b>down</b> to <code>wt[i]</code>, never upward.',
                'Greedy by value/weight ratio is wrong for 0/1 (only correct for the fractional version).',
                '<code>W</code> up to 10⁹ makes O(N·W) impossible — switch to dp over value: <code>minWeight[v]</code>.'
            ],
            tips: [
                'Time O(N·W), space O(N·W) → O(W) with one row.',
                'Recover the chosen items by walking up from <code>dp[n-1][W]</code>: if the value changed from the row above, item i was taken.',
                'Same skeleton: Subset Sum, Partition, Target Sum, Ones and Zeroes (2-D capacity).'
            ]
        },
        frames() {
            const wt = [1, 2, 4, 5], val = [5, 4, 8, 6], n = 4, W = 5;
            const dp = Array.from({ length: n }, () => Array(W + 1).fill(''));
            const frames = [];
            const lab = { rowLabels: wt.map((w, i) => `i=${i} (w${w},v${val[i]})`), colLabels: [...Array(W + 1).keys()].map(c => 'cap ' + c), corner: 'item \\ cap', wide: true };
            const snap = (note, cur, dep, extra = {}) => frames.push({
                note, final: extra.final,
                views: [
                    dpGrid('dp[i][cap]', dp, Object.assign({ cur, dep, path: extra.path }, lab)),
                    vars(extra.vars || {}, extra.changed || [])
                ]
            });
            for (let i = 0; i < n; i++) for (let c = 0; c <= W; c++) if (i === 0) dp[i][c] = 0;
            for (let w = wt[0]; w <= W; w++) dp[0][w] = val[0];
            snap(`Row 0 (base): only item 0 (wt ${wt[0]}, val ${val[0]}). <code>dp[0][w] = ${val[0]}</code> for <code>w &gt;= ${wt[0]}</code>, otherwise 0.`, null, []);
            for (let i = 1; i < n; i++) {
                for (let cap = 0; cap <= W; cap++) {
                    const notTake = dp[i - 1][cap];
                    let take = INT_MIN;
                    if (wt[i] <= cap) take = val[i] + dp[i - 1][cap - wt[i]];
                    dp[i][cap] = Math.max(take, notTake);
                    const dep = [[i - 1, cap]];
                    if (wt[i] <= cap) dep.push([i - 1, cap - wt[i]]);
                    const takeS = wt[i] <= cap ? `take = ${val[i]} + dp[${i - 1}][${cap - wt[i]}] = ${take}` : `take = INT_MIN (wt ${wt[i]} &gt; cap ${cap})`;
                    snap(`<code>dp[${i}][${cap}]</code>: notTake = dp[${i - 1}][${cap}] = ${notTake}; ${takeS} → <b>${dp[i][cap]}</b>.`, [i, cap], dep, { vars: { i, cap, 'wt[i]': wt[i], 'val[i]': val[i], notTake, take: show(take) }, changed: ['notTake', 'take'] });
                }
            }
            // backtrack
            const path = [];
            let cap = W;
            const items = [];
            for (let i = n - 1; i >= 0; i--) {
                if (i === 0 ? dp[0][cap] > 0 : dp[i][cap] !== dp[i - 1][cap]) { path.push([i, cap]); items.push(i); cap -= wt[i]; }
            }
            snap(`<b>Answer = dp[3][5] = ${dp[n - 1][W]}</b>. Backtracking: take item ${items.reverse().join(' and item ')} (wt ${items.map(i => wt[i]).join(' + ')} = 5, val ${items.map(i => val[i]).join(' + ')} = ${dp[n - 1][W]}).`, null, [], { final: true, path, vars: { answer: dp[n - 1][W] } });
            return frames;
        }
    });

    /* =================================================================== p36 Knapsack simple dry run */
    DryRun.register('p36', {
        title: 'Knapsack table exactly as in the notes (1-indexed rows)',
        input: 'weights = [1, 3, 4], profits = [15, 20, 30], W = 4',
        after: '.ks-table',
        legend: [['cur', 'dp[i][w]'], ['dep', 'above (not take) / above-left (take)'], ['done', 'filled'], ['path', 'chosen items']],
        insight: {
            pattern: '0/1 Knapsack with an extra "no items" row',
            idea: [
                'Row 0 = "no items", column 0 = "no capacity" → all 0. This 1-indexed layout removes the special base row.',
                '<code>dp[i][w] = max(dp[i-1][w], profit[i] + dp[i-1][w - weight[i]])</code>, the take option only if <code>weight[i] &lt;= w</code>.',
                'Answer sits in the bottom-right cell <code>dp[n][W]</code>.'
            ],
            traps: [
                'With 1-indexed rows the item arrays are still 0-indexed in code: use <code>weight[i-1]</code>, <code>profit[i-1]</code>.',
                'When an item doesn\'t fit, copy the cell above — don\'t write 0.',
                'The take option reads the <b>previous</b> row, never the current one.'
            ],
            tips: [
                'In exams, draw the table, fill row by row, and for each cell point at "above" and "above, weight steps left".',
                'Backtrack: if <code>dp[i][w] != dp[i-1][w]</code>, item i was taken → <code>w -= weight[i]</code>.',
                'Here: 35 = Item 1 (15) + Item 2 (20), total weight 4.'
            ]
        },
        frames() {
            const wt = [1, 3, 4], pr = [15, 20, 30], n = 3, W = 4;
            const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(''));
            const frames = [];
            const lab = { rowLabels: ['0 (∅)', '1 (Item 1)', '2 (Item 2)', '3 (Item 3)'], colLabels: ['0', '1', '2', '3', '4'], corner: 'i \\ w' };
            const snap = (note, cur, dep, extra = {}) => frames.push({
                note, final: extra.final,
                views: [
                    { type: 'array', title: 'weight (Item 1..3)', values: wt, labels: ['Item 1', 'Item 2', 'Item 3'], cls: extra.item ? { [extra.item - 1]: 'cur' } : {} },
                    { type: 'array', title: 'profit', values: pr, labels: ['Item 1', 'Item 2', 'Item 3'], cls: extra.item ? { [extra.item - 1]: 'cur' } : {} },
                    dpGrid('dp[i][w]', dp, Object.assign({ cur, dep, path: extra.path }, lab)),
                    vars(extra.vars || {}, extra.changed || [])
                ]
            });
            for (let w = 0; w <= W; w++) dp[0][w] = 0;
            for (let i = 0; i <= n; i++) dp[i][0] = 0;
            snap('Step 1: row 0 (no items) and column 0 (no capacity) are all <b>0</b>.', null, []);
            for (let i = 1; i <= n; i++) {
                const w_ = wt[i - 1], p = pr[i - 1];
                for (let w = 1; w <= W; w++) {
                    const notTake = dp[i - 1][w];
                    if (w_ > w) {
                        dp[i][w] = notTake;
                        snap(`Item ${i} (wt ${w_}) doesn\'t fit in w = ${w} → copy from above: <code>dp[${i}][${w}] = ${notTake}</code>.`, [i, w], [[i - 1, w]], { item: i, vars: { i, w, 'not take': notTake, take: '—' } });
                    } else {
                        const take = p + dp[i - 1][w - w_];
                        dp[i][w] = Math.max(notTake, take);
                        snap(`<code>dp[${i}][${w}] = max(above: ${notTake}, ${p} + dp[${i - 1}][${w}-${w_}=${w - w_}] = ${p} + ${dp[i - 1][w - w_]} = ${take}) = <b>${dp[i][w]}</b></code>.`, [i, w], [[i - 1, w], [i - 1, w - w_]], { item: i, vars: { i, w, 'not take': notTake, take }, changed: ['take'] });
                    }
                }
            }
            const path = [];
            let w = W;
            const items = [];
            for (let i = n; i >= 1; i--) if (dp[i][w] !== dp[i - 1][w]) { path.push([i, w]); items.push(i); w -= wt[i - 1]; }
            path.push([n, W]);
            snap(`<b>Maximum profit = dp[3][4] = ${dp[n][W]}</b>. Backtrack: items ${items.reverse().join(' and ')} (weight ${items.map(i => wt[i - 1]).join(' + ')} = 4).`, null, [], { final: true, path, vars: { answer: dp[n][W] } });
            return frames;
        }
    });
})();
