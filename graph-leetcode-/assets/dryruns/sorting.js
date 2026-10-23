/* Dry runs: sorting, divide & conquer, correctness and approximation theory
   (p44 – p54, plus theory pages p20, p28, p38).
   Every trace below is COMPUTED by running the user's algorithm on the input. */
(function () {
    const { clone } = DryRun.util;

    /* ---------------------------------------------------------------- helpers */
    const arrView = (title, values, o = {}) => Object.assign({ type: 'array', title, values: values.slice() }, o);
    const varsView = (vars, changed = [], title = 'variables') => ({ type: 'vars', title, vars: Object.assign({}, vars), changed });
    const stackView = (items, title = 'call stack') => ({ type: 'list', kind: 'stack', title, items: items.slice() });
    const r2 = x => (x === Infinity ? '∞' : Math.round(x * 100) / 100);
    const list = a => '[' + a.join(', ') + ']';
    const hyp = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);

    /* ======================================================================
       p44 Insertion Sort (adjacent swaps, j = i)
       ====================================================================== */
    function insertionFrames(input) {
        const arr = input.slice(), n = arr.length, F = [];
        let comps = 0, swaps = 0;
        const snap = (note, o = {}) => {
            const cls = {};
            for (let k = 0; k < n; k++) {
                if (o.done) cls[k] = 'sorted';
                else if (o.pref !== undefined && k < o.pref) cls[k] = 'visited';
            }
            Object.assign(cls, o.cls || {});
            F.push({
                note, final: o.final,
                views: [
                    arrView('arr[]', arr, { cls, bars: true, pointers: o.ptr || {} }),
                    varsView({ i: o.i ?? '-', j: o.j ?? '-', n, comparisons: comps, swaps }, o.ch || [])
                ]
            });
        };
        snap(`Start with <code>arr = ${list(arr)}</code>. <code>arr[0..0]</code> is a one-element prefix, trivially sorted (<b>initialisation</b> of the invariant).`, { pref: 1 });
        for (let i = 1; i < n; i++) {
            let j = i;
            snap(`Outer loop <code>i = ${i}</code>: the invariant says <code>arr[0..${i - 1}]</code> is sorted. Set <code>j = i</code>; element <b>${arr[i]}</b> will bubble left by adjacent swaps.`,
                { pref: i, i, j, ptr: { j }, cls: { [j]: 'cur' }, ch: ['i', 'j'] });
            while (true) {
                if (!(j > 0)) {
                    snap(`<code>j = 0</code>: the element reached the front, so <code>j &gt; 0</code> fails and the <code>while</code> stops. <code>arr[0..${i}]</code> is now sorted.`,
                        { pref: i + 1, i, j, ptr: { j }, cls: { [j]: 'cur' } });
                    break;
                }
                comps++;
                if (arr[j] < arr[j - 1]) {
                    snap(`Compare <code>arr[j] = ${arr[j]}</code> with <code>arr[j-1] = ${arr[j - 1]}</code>: ${arr[j]} &lt; ${arr[j - 1]} → out of order, so swap.`,
                        { pref: i, i, j, ptr: { 'j-1': j - 1, j }, cls: { [j]: 'cur', [j - 1]: 'cmp' }, ch: ['comparisons'] });
                    [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
                    swaps++; j--;
                    snap(`<code>swap(arr[j], arr[j-1])</code> then <code>j--</code> → <code>j = ${j}</code>. Array: <code>${list(arr)}</code>.`,
                        { pref: i + 1, i, j, ptr: { j }, cls: { [j]: 'cur', [j + 1]: 'swap' }, ch: ['j', 'swaps'] });
                } else {
                    snap(`Compare <code>arr[j] = ${arr[j]}</code> with <code>arr[j-1] = ${arr[j - 1]}</code>: ${arr[j]} ≥ ${arr[j - 1]} → already in place, the <code>while</code> stops. <code>arr[0..${i}]</code> is sorted (<b>maintenance</b>).`,
                        { pref: i + 1, i, j, ptr: { 'j-1': j - 1, j }, cls: { [j]: 'cur', [j - 1]: 'cmp' }, ch: ['comparisons'] });
                    break;
                }
            }
        }
        snap(`<code>i = n = ${n}</code>: loop ends and the invariant covers the whole array (<b>termination</b>). <b>Sorted: ${list(arr)}</b> using ${comps} comparisons and ${swaps} swaps.`, { done: true, final: true });
        return F;
    }

    DryRun.register('p44', {
        title: 'Insertion sort with adjacent swaps',
        legend: [['cur', 'element being inserted (arr[j])'], ['cmp', 'arr[j-1] being compared'], ['swap', 'just swapped'], ['visited', 'sorted prefix arr[0..i]'], ['sorted', 'final']],
        insight: {
            pattern: 'Incremental sorting / loop invariant',
            idea: [
                'Invariant: at the start of iteration <code>i</code>, <code>arr[0..i-1]</code> is sorted. Each pass inserts <code>arr[i]</code> into that prefix.',
                'Number of swaps = number of <b>inversions</b> (pairs i&lt;j with arr[i]&gt;arr[j]). Sorted input → 0 swaps → <b>O(n)</b>; reverse input → n(n-1)/2 swaps → <b>O(n²)</b>.',
                '<b>Stable</b> (strict <code>&lt;</code> never swaps equal keys), <b>in-place</b> O(1) extra memory, <b>online</b> (can sort as data arrives).'
            ],
            traps: [
                'Writing <code>arr[j] &lt;= arr[j-1]</code> makes it swap equal keys → no longer stable.',
                'Check <code>j &gt; 0</code> <b>before</b> reading <code>arr[j-1]</code> (short-circuit order matters, otherwise arr[-1]).',
                'Adjacent swaps do 3 assignments per step; the "shift with a key variable" version does 1 — same O(), smaller constant.'
            ],
            tips: [
                'Best choice for tiny arrays (n ≤ ~16): std::sort itself switches to insertion sort for small ranges.',
                'Great for <b>nearly sorted</b> data: runs in O(n + inversions).',
                'Exam favourite: be ready to state the invariant with Initialization / Maintenance / Termination.'
            ]
        },
        examples: [
            { label: 'Notes input', input: 'arr = {5, 2, 4, 6, 1}', frames: () => insertionFrames([5, 2, 4, 6, 1]) },
            { label: 'Best case (sorted)', input: 'arr = {1, 2, 3, 4, 5}', frames: () => insertionFrames([1, 2, 3, 4, 5]) },
            { label: 'Worst case (reverse)', input: 'arr = {5, 4, 3, 2, 1}', frames: () => insertionFrames([5, 4, 3, 2, 1]) }
        ]
    });

    /* ======================================================================
       p45 Maximum subarray — divide & conquer with crossing sum
       ====================================================================== */
    DryRun.register('p45', {
        title: 'maxSubArray(a, 0, 8) — left, right and crossing sums',
        input: 'a = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        legend: [['visited', 'left half [l..m]'], ['queued', 'right half [m+1..r]'], ['cmp', 'crossing scan'], ['sorted', 'best subarray / best prefix'], ['dim', 'outside current call']],
        insight: {
            pattern: 'Divide & conquer on an array',
            idea: [
                'The best subarray of <code>a[l..r]</code> lies entirely in the left half, entirely in the right half, or <b>crosses the midpoint</b>.',
                'The crossing case is linear: best suffix of the left half (scan <code>m → l</code>) + best prefix of the right half (scan <code>m+1 → r</code>). Both must be non-empty, so the crossing sum always contains a[m] and a[m+1].',
                'Recurrence <b>T(n) = 2T(n/2) + O(n)</b> → Master theorem case 2 (a=2, b=2, f(n)=Θ(n)) → <b>O(n log n)</b>; stack depth O(log n).'
            ],
            traps: [
                'The recurrence is 2T(n/2) + O(n), <b>not</b> T(n/2) + O(n) — there are two recursive calls.',
                'Initialise <code>leftSum</code>/<code>rightSum</code> to INT_MIN, not 0, or an all-negative array returns 0 instead of its largest element.',
                'Adding <code>leftSum + rightSum</code> of two INT_MIN-ish values can overflow; with real data each side has at least one element so it is fine.'
            ],
            tips: [
                'In contests use <b>Kadane</b> (O(n)): <code>cur = max(a[i], cur + a[i]); best = max(best, cur)</code>.',
                'The D&C version generalises to segment trees: store (sum, best prefix, best suffix, best) per node to answer range max-subarray queries.'
            ]
        },
        frames() {
            const a = [-2, 1, -3, 4, -1, 2, 1, -5, 4], n = a.length, F = [], stack = [];
            const snap = (note, o) => {
                const cls = {};
                for (let k = 0; k < n; k++) {
                    if (k < o.l || k > o.r) cls[k] = 'dim';
                    else if (o.m !== undefined) cls[k] = k <= o.m ? 'visited' : 'queued';
                }
                if (o.best) for (let k = o.best[0]; k <= o.best[1]; k++) cls[k] = 'sorted';
                Object.assign(cls, o.cls || {});
                const ptr = { l: o.l, r: o.r };
                if (o.m !== undefined) ptr.m = o.m;
                const views = [arrView('a[]', a, { cls, pointers: ptr })];
                if (o.sums) views.push(arrView('running sum (from m outwards)', o.sums, { cls: o.sumCls }));
                views.push(stackView(stack));
                views.push(varsView(o.vars, o.ch || []));
                F.push({ note, views, final: o.final });
            };
            const msa = (l, r) => {
                stack.push(`maxSubArray(${l},${r})`);
                if (l === r) {
                    snap(`Base case <code>l == r == ${l}</code>: a one-element subarray, return <code>a[${l}] = ${a[l]}</code>.`,
                        { l, r, best: [l, l], vars: { l, r, return: a[l] }, ch: ['return'] });
                    stack.pop();
                    return { s: a[l], lo: l, hi: l };
                }
                const m = Math.floor((l + r) / 2);
                snap(`<code>maxSubArray(${l}, ${r})</code>: <code>m = (${l}+${r})/2 = ${m}</code>. Solve left <code>[${l}..${m}]</code>, right <code>[${m + 1}..${r}]</code>, then the crossing case.`,
                    { l, r, m, vars: { l, m, r }, ch: ['m'] });
                const L = msa(l, m);
                const R = msa(m + 1, r);
                // maxCrossingSum exactly as written
                const sums = Array(n).fill(''), sumCls = {};
                let sum = 0, leftSum = -Infinity, bl = m;
                for (let i = m; i >= l; i--) { sum += a[i]; sums[i] = sum; if (sum > leftSum) { leftSum = sum; bl = i; } }
                sum = 0;
                let rightSum = -Infinity, br = m + 1;
                for (let i = m + 1; i <= r; i++) { sum += a[i]; sums[i] = sum; if (sum > rightSum) { rightSum = sum; br = i; } }
                for (let k = 0; k < n; k++) sumCls[k] = k < l || k > r ? 'dim' : 'cmp';
                sumCls[bl] = 'sorted'; sumCls[br] = 'sorted';
                const cross = leftSum + rightSum;
                const leftList = [], rightList = [];
                for (let i = m; i >= l; i--) leftList.push(sums[i]);
                for (let i = m + 1; i <= r; i++) rightList.push(sums[i]);
                snap(`<code>maxCrossingSum(${l}, ${m}, ${r})</code>: left sums (i = ${m}→${l}) ${list(leftList)} → <code>leftSum = ${leftSum}</code>; right sums (i = ${m + 1}→${r}) ${list(rightList)} → <code>rightSum = ${rightSum}</code>. Crossing = <b>${cross}</b>.`,
                    { l, r, m, best: [bl, br], sums, sumCls, vars: { l, m, r, leftMax: L.s, rightMax: R.s, leftSum, rightSum, crossing: cross }, ch: ['leftSum', 'rightSum', 'crossing'] });
                const X = { s: cross, lo: bl, hi: br };
                let res = L;
                if (R.s > res.s) res = R;
                if (X.s > res.s) res = X;
                const which = res === L ? 'left' : res === R ? 'right' : 'crossing';
                snap(`Return <code>max(${L.s}, ${R.s}, ${cross}) = <b>${res.s}</b></code> (from the ${which} case: a[${res.lo}..${res.hi}]).`,
                    { l, r, best: [res.lo, res.hi], vars: { l, m, r, leftMax: L.s, rightMax: R.s, crossing: cross, return: res.s }, ch: ['return'] });
                stack.pop();
                return res;
            };
            snap('Call <code>maxSubArray(a, 0, 8)</code> on the whole array.', { l: 0, r: n - 1, vars: { l: 0, r: n - 1 } });
            const res = msa(0, n - 1);
            snap(`Done. <b>Maximum subarray sum = ${res.s}</b> for a[${res.lo}..${res.hi}] = ${list(a.slice(res.lo, res.hi + 1))}. It is the crossing case at the top level (left half best = 4, right half best = 4).`,
                { l: 0, r: n - 1, best: [res.lo, res.hi], vars: { answer: res.s }, final: true });
            return F;
        }
    });

    /* ======================================================================
       p46 Binary search (recursive)
       ====================================================================== */
    function bsFrames(arr, target) {
        const n = arr.length, F = [], stack = [];
        const snap = (note, o = {}) => {
            const cls = {};
            for (let k = 0; k < n; k++) if (o.start === undefined || k < o.start || k > o.end) cls[k] = 'dim';
            Object.assign(cls, o.cls || {});
            const ptr = {};
            if (o.start !== undefined) { ptr.start = o.start; ptr.end = o.end; }
            if (o.mid !== undefined) ptr.mid = o.mid;
            F.push({
                note, final: o.final,
                views: [
                    arrView('arr[] (sorted)', arr, { cls, pointers: ptr }),
                    stackView(stack),
                    varsView({ start: o.start ?? '-', end: o.end ?? '-', mid: o.mid ?? '-', 'arr[mid]': o.mid !== undefined ? arr[o.mid] : '-', target }, o.ch || [])
                ]
            });
        };
        let calls = 0;
        const bs = (start, end) => {
            calls++;
            stack.push(`binarySearch(${start}, ${end})`);
            if (start > end) {
                snap(`<code>start = ${start} &gt; end = ${end}</code>: the search range is empty → base case, return <b>-1</b>.`, { start, end, cls: {} });
                stack.pop();
                return -1;
            }
            const mid = start + Math.floor((end - start) / 2);
            snap(`Range <code>[${start}..${end}]</code>: <code>mid = ${start} + (${end} - ${start})/2 = ${mid}</code>, <code>arr[mid] = ${arr[mid]}</code>.`,
                { start, end, mid, cls: { [mid]: 'cmp' }, ch: ['start', 'end', 'mid'] });
            let res;
            if (arr[mid] === target) {
                snap(`<code>arr[${mid}] == ${target}</code> → <b>match</b>, return ${mid}.`, { start, end, mid, cls: { [mid]: 'sorted' } });
                res = mid;
            } else if (arr[mid] > target) {
                snap(`<code>arr[mid] = ${arr[mid]} &gt; ${target}</code>: target can only be on the left → recurse on <code>[${start}..${mid - 1}]</code>.`,
                    { start, end, mid, cls: Object.fromEntries(Array.from({ length: end - mid + 1 }, (_, t) => [mid + t, 'bad'])) });
                res = bs(start, mid - 1);
            } else {
                snap(`<code>arr[mid] = ${arr[mid]} &lt; ${target}</code>: target can only be on the right → recurse on <code>[${mid + 1}..${end}]</code>.`,
                    { start, end, mid, cls: Object.fromEntries(Array.from({ length: mid - start + 1 }, (_, t) => [start + t, 'bad'])) });
                res = bs(mid + 1, end);
            }
            stack.pop();
            return res;
        };
        snap(`Search for <b>${target}</b> in a sorted array of ${n} elements: call <code>binarySearch(arr, 0, ${n - 1}, ${target})</code>.`, { start: 0, end: n - 1 });
        const ans = bs(0, n - 1);
        snap(ans >= 0
            ? `Each call returns the value of its recursive call. <b>Answer: index ${ans}</b> (arr[${ans}] = ${target}) after ${calls} calls — at most ⌊log₂ ${n}⌋+1 = ${Math.floor(Math.log2(n)) + 1} probes.`
            : `<b>Answer: -1</b> — ${target} is not in the array. ${calls} calls; the range halved every time until it became empty.`,
            { start: 0, end: n - 1, cls: ans >= 0 ? { [ans]: 'sorted' } : {}, final: true });
        return F;
    }

    DryRun.register('p46', {
        title: 'Recursive binary search',
        legend: [['cmp', 'arr[mid]'], ['bad', 'discarded half'], ['sorted', 'found'], ['dim', 'outside [start..end]']],
        insight: {
            pattern: 'Divide & conquer / halving the search space',
            idea: [
                'Invariant: if <code>target</code> is present, it lies in <code>arr[start..end]</code>. Each step discards half the range while keeping that true.',
                '<b>T(n) = T(n/2) + O(1)</b> → Master theorem case 2 (a=1, b=2, f=Θ(1)) → <b>O(log n)</b>. Best case O(1) when the first mid hits.',
                'Recursive version uses O(log n) stack; the iterative version is O(1) space.'
            ],
            traps: [
                'Use <code>mid = start + (end - start)/2</code> to avoid <code>int</code> overflow of <code>start + end</code>.',
                'The parameter names in the signature must match the body (the snippet declares <code>low, high</code> but uses <code>start, end</code> — it would not compile as-is).',
                'Off-by-one: with a closed range <code>[start..end]</code> recurse on <code>mid-1</code> / <code>mid+1</code> and stop when <code>start &gt; end</code>.'
            ],
            tips: [
                'In contests: <code>lower_bound</code> / <code>upper_bound</code>, or "binary search on the answer" over a monotone predicate.',
                'For "first true" searches use a half-open loop: <code>while (lo &lt; hi) { mid = lo + (hi-lo)/2; ok(mid) ? hi = mid : lo = mid + 1; }</code>.'
            ]
        },
        examples: [
            { label: 'Target 23 (found)', input: 'arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23', frames: () => bsFrames([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23) },
            { label: 'Target 40 (missing)', input: 'arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 40', frames: () => bsFrames([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 40) }
        ]
    });

    /* ======================================================================
       p47 Merge sort
       ====================================================================== */
    DryRun.register('p47', {
        title: 'mergeSort(arr, 0, 6) with the temp-array merge',
        input: 'arr = [38, 27, 43, 3, 9, 82, 10]',
        legend: [['cmp', 'arr[i] / arr[j] compared next'], ['swap', 'just written to temp'], ['visited', 'sorted run'], ['dim', 'already consumed / outside [l..r]'], ['sorted', 'final']],
        insight: {
            pattern: 'Divide & conquer sorting',
            idea: [
                'Split at <code>m = l + (r-l)/2</code>, sort both halves recursively, then <b>merge</b> two sorted runs in linear time with a temp array.',
                '<b>T(n) = 2T(n/2) + Θ(n)</b> → Master theorem case 2 → <b>Θ(n log n)</b> in best, average and worst case. Extra space Θ(n) (temp) + O(log n) stack.',
                '<b>Stable</b> because ties take from the left run (<code>arr[i] &lt;= arr[j]</code>). Not in-place.'
            ],
            traps: [
                'Using <code>&lt;</code> instead of <code>&lt;=</code> in the merge breaks stability.',
                'With <code>m = l + (r-l)/2</code> and 7 elements the first split is <code>[0..3] | [4..6]</code> — the left half gets the extra element.',
                '<code>int temp[r-l+1]</code> is a VLA (GCC extension); prefer <code>vector&lt;int&gt;</code> and allocate it once outside the recursion for speed.'
            ],
            tips: [
                'Merge sort counts <b>inversions</b> for free: when you take <code>arr[j]</code> from the right run, add <code>m - i + 1</code>.',
                'Best choice for linked lists (no random access needed) and external sorting. In C++ <code>stable_sort</code> is a merge sort.'
            ]
        },
        frames() {
            const arr = [38, 27, 43, 3, 9, 82, 10], n = arr.length, F = [], stack = [];
            let finished = false;
            const runs = [];          // sorted runs produced so far, for colouring
            const runCls = () => { const c = {}; runs.forEach(([a, b]) => { for (let k = a; k <= b; k++) c[k] = 'visited'; }); return c; };
            const snap = (note, o = {}) => {
                const cls = finished ? Object.fromEntries(arr.map((_, k) => [k, 'sorted'])) : runCls();
                if (o.l !== undefined) for (let k = 0; k < n; k++) if (k < o.l || k > o.r) cls[k] = 'dim';
                Object.assign(cls, o.cls || {});
                const ptr = {};
                if (o.l !== undefined) { ptr.l = o.l; ptr.r = o.r; if (o.m !== undefined) ptr.m = o.m; }
                const views = [arrView('arr[]', arr, { cls, pointers: ptr })];
                if (o.merge) {
                    const { l, m, r, i, j, temp, k } = o.merge;
                    const lc = {}, rc = {};
                    for (let t = l; t <= m; t++) lc[t - l] = t < i ? 'dim' : t === i ? 'cmp' : '';
                    for (let t = m + 1; t <= r; t++) rc[t - m - 1] = t < j ? 'dim' : t === j ? 'cmp' : '';
                    views.push(arrView(`left run arr[${l}..${m}]`, arr.slice(l, m + 1), { cls: lc, labels: Array.from({ length: m - l + 1 }, (_, t) => l + t), pointers: i <= m ? { i: i - l } : {} }));
                    views.push(arrView(`right run arr[${m + 1}..${r}]`, arr.slice(m + 1, r + 1), { cls: rc, labels: Array.from({ length: r - m }, (_, t) => m + 1 + t), pointers: j <= r ? { j: j - m - 1 } : {} }));
                    const tv = temp.concat(Array(r - l + 1 - temp.length).fill(''));
                    views.push(arrView('temp[]', tv, { cls: o.tempCls || (k > 0 ? { [k - 1]: 'swap' } : {}), pointers: k <= r - l ? { k } : {} }));
                }
                views.push(stackView(stack));
                F.push({ note, views, final: o.final });
            };
            const merge = (l, m, r) => {
                let i = l, j = m + 1, k = 0;
                const temp = [];
                const st = () => ({ merge: { l, m, r, i, j, temp: temp.slice(), k } });
                snap(`<code>merge(arr, ${l}, ${m}, ${r})</code>: combine sorted runs <code>${list(arr.slice(l, m + 1))}</code> and <code>${list(arr.slice(m + 1, r + 1))}</code>. <code>i = ${l}</code>, <code>j = ${m + 1}</code>, <code>k = 0</code>.`,
                    Object.assign({ l, r, m }, st(), { tempCls: {} }));
                while (i <= m && j <= r) {
                    if (arr[i] <= arr[j]) {
                        const msg = `<code>arr[i] = ${arr[i]} &lt;= arr[j] = ${arr[j]}</code> → <code>temp[${k}] = ${arr[i]}</code>, <code>i++</code>.`;
                        temp[k++] = arr[i++];
                        snap(msg, Object.assign({ l, r, m }, st()));
                    } else {
                        const msg = `<code>arr[i] = ${arr[i]} &gt; arr[j] = ${arr[j]}</code> → <code>temp[${k}] = ${arr[j]}</code>, <code>j++</code>.`;
                        temp[k++] = arr[j++];
                        snap(msg, Object.assign({ l, r, m }, st()));
                    }
                }
                while (i <= m) { const v = arr[i]; temp[k++] = arr[i++]; snap(`Right run exhausted → copy leftover <code>${v}</code> from the left run (<code>while (i &lt;= m)</code>).`, Object.assign({ l, r, m }, st())); }
                while (j <= r) { const v = arr[j]; temp[k++] = arr[j++]; snap(`Left run exhausted → copy leftover <code>${v}</code> from the right run (<code>while (j &lt;= r)</code>).`, Object.assign({ l, r, m }, st())); }
                for (let p = 0; p < k; p++) arr[l + p] = temp[p];
                for (let q = runs.length - 1; q >= 0; q--) if (runs[q][0] >= l && runs[q][1] <= r) runs.splice(q, 1);
                runs.push([l, r]);
                const c = {};
                for (let t = l; t <= r; t++) c[t] = 'swap';
                snap(`Copy <code>temp</code> back: <code>arr[${l}..${r}] = ${list(temp)}</code> is now one sorted run.`, { l, r, cls: c });
            };
            const mergeSort = (l, r) => {
                stack.push(`mergeSort(${l},${r})`);
                if (l < r) {
                    const m = l + Math.floor((r - l) / 2);
                    const single = [l === m ? `[${arr[l]}]` : null, m + 1 === r ? `[${arr[r]}]` : null].filter(Boolean);
                    snap(`<code>mergeSort(${l}, ${r})</code>: <code>l &lt; r</code>, so <code>m = ${l} + (${r}-${l})/2 = ${m}</code>. Sort <code>[${l}..${m}]</code> then <code>[${m + 1}..${r}]</code>.${single.length ? ` (${single.join(' and ')}: single element → <code>l == r</code>, returns immediately.)` : ''}`,
                        { l, r, m });
                    mergeSort(l, m);
                    mergeSort(m + 1, r);
                    merge(l, m, r);
                }
                stack.pop();
            };
            snap(`Initial array <code>${list(arr)}</code>. Call <code>mergeSort(arr, 0, ${n - 1})</code>.`);
            mergeSort(0, n - 1);
            finished = true;
            snap(`All merges done. <b>Sorted: ${list(arr)}</b>. Depth ⌈log₂ 7⌉ = 3 levels, each level does O(n) merge work.`, { final: true });
            return F;
        }
    });

    /* ======================================================================
       p48 Quick sort — first-element pivot, user's exact partition
       ====================================================================== */
    function quickFrames(input) {
        const arr = input.slice(), n = arr.length, F = [], stack = [];
        const fixed = Array(n).fill(false);
        let comps = 0, swaps = 0;
        const snap = (note, o = {}) => {
            const cls = {};
            for (let k = 0; k < n; k++) {
                if (fixed[k]) cls[k] = 'sorted';
                else if (o.s !== undefined && (k < o.s || k > o.e)) cls[k] = 'dim';
            }
            if (o.pv !== undefined) cls[o.pv] = 'pivot';
            Object.assign(cls, o.cls || {});
            const ptr = {};
            if (o.s !== undefined) { ptr.start = o.s; ptr.end = o.e; }
            if (o.i !== undefined) ptr.i = o.i;
            if (o.j !== undefined) ptr.j = o.j;
            F.push({
                note, final: o.final,
                views: [
                    arrView('arr[]', arr, { cls, bars: true, pointers: ptr }),
                    stackView(stack),
                    varsView({ start: o.s ?? '-', end: o.e ?? '-', pivot: o.pivot ?? '-', i: o.i ?? '-', j: o.j ?? '-', swaps }, o.ch || [])
                ]
            });
        };
        const partition = (start, end) => {
            const pivot = arr[start];
            let i = start + 1, j = end;
            const base = () => ({ s: start, e: end, pivot, pv: start });
            snap(`<code>partition(${start}, ${end})</code>: <code>pivot = arr[start] = ${pivot}</code>, <code>i = ${i}</code>, <code>j = ${j}</code>.`,
                Object.assign(base(), { i, j, ch: ['pivot', 'i', 'j'] }));
            let guard = 0;
            while (i <= j) {
                if (++guard > 60) throw new Error('partition does not terminate on this input');
                const i0 = i, j0 = j, skipped = [];
                while (i <= end && arr[i] <= pivot) { skipped.push(arr[i]); i++; comps++; }
                const iWhy = i > end ? `<code>i = ${i} &gt; end</code>` : `<code>arr[${i}] = ${arr[i]} &gt; ${pivot}</code>`;
                snap(`Move <code>i</code> while <code>arr[i] &lt;= pivot</code>${skipped.length ? `: skip ${list(skipped)}` : ''} → stops at ${iWhy}.`,
                    Object.assign(base(), { i, j, cls: i <= end ? { [i]: 'cmp' } : {}, ch: i !== i0 ? ['i'] : [] }));
                const skippedJ = [];
                while (arr[j] > pivot) { skippedJ.push(arr[j]); j--; comps++; }
                snap(`Move <code>j</code> while <code>arr[j] &gt; pivot</code>${skippedJ.length ? `: skip ${list(skippedJ)}` : ''} → stops at <code>j = ${j}</code> (<code>arr[j] = ${arr[j]}</code> ≤ ${pivot}${j === start ? ', the pivot itself' : ''}).`,
                    Object.assign(base(), { i, j, cls: Object.assign(i <= end ? { [i]: 'cmp' } : {}, j !== start ? { [j]: 'cmp' } : {}), ch: j !== j0 ? ['j'] : [] }));
                if (i < j && arr[i] > pivot && arr[j] < pivot) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    swaps++;
                    snap(`<code>i &lt; j</code>, <code>arr[i] &gt; pivot</code> and <code>arr[j] &lt; pivot</code> → <b>swap</b> them: <code>${list(arr)}</code>.`,
                        Object.assign(base(), { i, j, cls: { [i]: 'swap', [j]: 'swap' }, ch: ['swaps'] }));
                } else if (i <= j && i === i0 && j === j0) {
                    throw new Error('no pointer moved (duplicate of the pivot) — infinite loop');
                }
            }
            [arr[start], arr[j]] = [arr[j], arr[start]];
            if (start !== j) swaps++;
            fixed[j] = true;
            snap(`<code>i = ${i} &gt; j = ${j}</code> → loop ends. <code>swap(arr[start], arr[j])</code> puts pivot <b>${pivot}</b> at index <b>${j}</b>: everything left is ≤ ${pivot}, everything right is &gt; ${pivot}. Return <code>${j}</code>.`,
                { s: start, e: end, pivot, i, j, cls: start !== j ? { [start]: 'swap' } : {}, ch: ['swaps'] });
            return j;
        };
        const qs = (start, end) => {
            stack.push(`quickSort(${start},${end})`);
            if (start < end) {
                const p = partition(start, end);
                qs(start, p - 1);
                qs(p + 1, end);
            } else if (start === end) {
                fixed[start] = true;
                snap(`<code>quickSort(${start}, ${end})</code>: one element (<code>start == end</code>) → already in its final place.`, { s: start, e: end });
            }
            stack.pop();
        };
        snap(`Initial array <code>${list(arr)}</code>. Call <code>quickSort(arr, 0, ${n - 1})</code>.`);
        qs(0, n - 1);
        for (let k = 0; k < n; k++) fixed[k] = true;
        snap(`<b>Sorted: ${list(arr)}</b> with ${swaps} swaps (including pivot placements).`, { final: true });
        return F;
    }

    DryRun.register('p48', {
        title: 'Quick sort — first element as pivot',
        legend: [['pivot', 'pivot'], ['cmp', 'where i / j stopped'], ['swap', 'swapped'], ['sorted', 'final position'], ['dim', 'outside [start..end]']],
        insight: {
            pattern: 'Divide & conquer / partitioning',
            idea: [
                'After <code>partition</code> the pivot sits at its <b>final</b> index <code>p</code>; left part ≤ pivot, right part &gt; pivot. Recurse on both sides, no merge step.',
                'Best/average: balanced splits, <b>T(n) = 2T(n/2) + Θ(n)</b> → Θ(n log n). Worst: pivot is min/max every time (sorted or reverse input with first-element pivot) → <b>T(n) = T(n-1) + Θ(n)</b> → Θ(n²), recursion depth n.',
                'In-place (O(log n) stack on average), <b>not stable</b>.'
            ],
            traps: [
                'With this exact partition, a value <b>equal to the pivot</b> on the right side stops <code>j</code> but fails <code>arr[j] &lt; pivot</code>, so nothing moves and <code>while (i &lt;= j)</code> spins forever (e.g. <code>[5, 7, 5]</code>). Using <code>arr[j] &lt;= pivot</code> in the swap test (or Hoare\'s scheme) fixes it.',
                'The pivot must end at index <code>j</code> (not <code>i</code>): j stops on an element ≤ pivot, so swapping it to the front keeps the left part valid.',
                'Already-sorted input is the worst case for a first-element pivot — exactly what judges like to test.'
            ],
            tips: [
                'Use a random pivot (swap a random element to <code>start</code> first) to make Θ(n²) astronomically unlikely.',
                'Recurse into the smaller side and loop on the larger to cap stack depth at O(log n).',
                '<code>nth_element</code> (quickselect) finds the k-th smallest in O(n) average using the same partition.'
            ]
        },
        examples: [
            { label: 'Notes input', input: 'arr = [8, 3, 6, 4, 2]', frames: () => quickFrames([8, 3, 6, 4, 2]) },
            { label: 'With swaps', input: 'arr = [5, 9, 2, 7, 1, 8, 3]', frames: () => quickFrames([5, 9, 2, 7, 1, 8, 3]) },
            { label: 'Sorted (worst case)', input: 'arr = [1, 2, 3, 4, 5]', frames: () => quickFrames([1, 2, 3, 4, 5]) }
        ]
    });

    /* ======================================================================
       p49 Counting sort (stable, prefix sums, backward pass)
       ====================================================================== */
    DryRun.register('p49', {
        title: 'Stable counting sort',
        input: 'arr = [4, 2, 2, 8, 3, 3, 1]',
        legend: [['cur', 'arr[i] being processed'], ['cmp', 'count[] cell touched'], ['swap', 'just written'], ['sorted', 'final']],
        insight: {
            pattern: 'Non-comparison sort / prefix sums',
            idea: [
                'After the prefix-sum pass, <code>count[v]</code> = number of elements ≤ v = one past the <b>last</b> slot value v may occupy in the output.',
                'Walking <code>i</code> from <code>n-1</code> down to 0 and decrementing <code>count</code> fills each value\'s block from right to left, so equal keys keep their original order → <b>stable</b>.',
                'Time <b>Θ(n + k)</b> (k = maxVal), space Θ(n + k). It beats the Ω(n log n) comparison lower bound because it never compares elements.'
            ],
            traps: [
                'Iterating forward in step 3 still sorts, but the sort is no longer stable (matters for radix sort!).',
                'Negative numbers: shift every key by <code>-minVal</code>; huge maxVal (e.g. 10⁹) makes the count array impossible.',
                '<code>int count[maxVal+1] = {0}</code> is a VLA and cannot be brace-initialised in standard C++ — use <code>vector&lt;int&gt; count(maxVal+1, 0)</code>.'
            ],
            tips: [
                'Use it when keys are small integers (ages, grades, characters, digits).',
                'It is the stable subroutine inside LSD radix sort.'
            ]
        },
        frames() {
            const arr = [4, 2, 2, 8, 3, 3, 1], n = arr.length, F = [];
            let maxVal = arr[0];
            for (let i = 1; i < n; i++) if (arr[i] > maxVal) maxVal = arr[i];
            const count = Array(maxVal + 1).fill(0);
            const output = Array(n).fill('');
            const snap = (note, o = {}) => F.push({
                note, final: o.final,
                views: [
                    arrView('arr[]', arr, { cls: o.a || {}, pointers: o.ap || {} }),
                    arrView('count[] (index = value)', count, { cls: o.c || {} }),
                    arrView('output[]', output, { cls: o.o || {} }),
                    varsView(Object.assign({ n, maxVal }, o.vars || {}), o.ch || [])
                ]
            });
            snap(`Find the maximum: <code>maxVal = ${maxVal}</code>, so <code>count</code> has ${maxVal + 1} cells (indices 0..${maxVal}), all 0.`, { a: { [arr.indexOf(maxVal)]: 'cur' }, ch: ['maxVal'] });
            for (let i = 0; i < n; i++) {
                count[arr[i]]++;
                snap(`Step 1, <code>i = ${i}</code>: <code>count[arr[i]]++</code> → <code>count[${arr[i]}] = ${count[arr[i]]}</code>.`, { a: { [i]: 'cur' }, ap: { i }, c: { [arr[i]]: 'cmp' }, vars: { i } });
            }
            for (let i = 1; i <= maxVal; i++) {
                const before = count[i];
                count[i] += count[i - 1];
                snap(`Step 2 (prefix sum), <code>i = ${i}</code>: <code>count[${i}] = ${before} + count[${i - 1}] = ${count[i]}</code> → ${count[i]} element(s) are ≤ ${i}.`, { c: { [i]: 'swap', [i - 1]: 'cmp' }, vars: { i } });
            }
            for (let i = n - 1; i >= 0; i--) {
                const pos = count[arr[i]] - 1;
                output[pos] = arr[i];
                count[arr[i]]--;
                snap(`Step 3, <code>i = ${i}</code> (backwards): value ${arr[i]} goes to <code>output[count[${arr[i]}] - 1] = output[${pos}]</code>, then <code>count[${arr[i]}]--</code> → ${count[arr[i]]}.`,
                    { a: { [i]: 'cur' }, ap: { i }, c: { [arr[i]]: 'cmp' }, o: { [pos]: 'swap' }, vars: { i } });
            }
            for (let i = 0; i < n; i++) arr[i] = output[i];
            const all = Object.fromEntries(arr.map((_, k) => [k, 'sorted']));
            snap(`Step 4: copy <code>output</code> back into <code>arr</code>. <b>Sorted: ${list(arr)}</b>. The two 2s and the two 3s kept their original relative order (stable).`, { a: all, o: all, final: true });
            return F;
        }
    });

    /* ======================================================================
       p50 Bucket sort on [0,1)
       ====================================================================== */
    DryRun.register('p50', {
        title: 'Bucket sort: scatter → sort → gather',
        input: 'arr = [0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68], n = 10',
        legend: [['cur', 'current element'], ['swap', 'just placed'], ['cmp', 'bucket being sorted'], ['sorted', 'gathered / final']],
        insight: {
            pattern: 'Distribution sort (scatter–gather)',
            idea: [
                'Map each key in [0,1) to bucket <code>⌊n·x⌋</code>. Buckets are ordered, so concatenating sorted buckets gives a sorted array.',
                'With <b>uniformly distributed</b> input each bucket holds O(1) expected elements → expected <b>Θ(n)</b> total. Worst case: everything in one bucket → cost of the inner sort (Θ(n²) with insertion sort, Θ(n log n) with std::sort).',
                'Stable if the per-bucket sort is stable (std::sort is <b>not</b>; use stable_sort or insertion sort). Not in-place: Θ(n) extra.'
            ],
            traps: [
                'A key equal to 1.0 gives index n → out of bounds. Clamp with <code>min(n-1, (int)(n*x))</code>.',
                'For other ranges normalise first: <code>idx = (x - minV) * n / (maxV - minV + ε)</code>.',
                'Float rounding: <code>n * 0.7f</code> may be 6.9999 → bucket 6; harmless for correctness, just a different bucket.'
            ],
            tips: [
                'Rarely needed in contests; the idea (bucketing by value range) shows up in "maximum gap" (LeetCode 164) and in sqrt-decomposition tricks.',
                'Exam phrasing: "average case O(n + k)" assumes the uniform-distribution model.'
            ]
        },
        frames() {
            const arr = [0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68], n = arr.length, F = [];
            const buckets = Array.from({ length: n }, () => []);
            const out = arr.slice();
            const snap = (note, o = {}) => {
                const rows = Math.max(1, ...buckets.map(b => b.length));
                const grid = Array.from({ length: rows }, (_, r) => buckets.map(b => (r < b.length ? b[r] : null)));
                F.push({
                    note, final: o.final,
                    views: [
                        arrView('arr[]', out, { cls: o.a || {}, pointers: o.ap || {} }),
                        { type: 'grid', title: 'buckets[0..9] (columns)', values: grid, cls: o.g || {}, colLabels: buckets.map((_, k) => 'B' + k), rowLabels: Array.from({ length: rows }, (_, r) => r), corner: 'slot' },
                        varsView(o.vars || {}, o.ch || [])
                    ]
                });
            };
            snap('Create <code>n = 10</code> empty buckets. Bucket <code>b</code> will receive keys in <code>[b/10, (b+1)/10)</code>.');
            for (let i = 0; i < n; i++) {
                const index = Math.floor(n * arr[i]);
                buckets[index].push(arr[i]);
                snap(`Scatter <code>i = ${i}</code>: <code>index = n * arr[i] = 10 × ${arr[i]} = ${r2(n * arr[i])}</code> → int <b>${index}</b>; push into bucket ${index}.`,
                    { a: { [i]: 'cur' }, ap: { i }, g: { [`${buckets[index].length - 1},${index}`]: 'swap' }, vars: { i, index }, ch: ['index'] });
            }
            for (let b = 0; b < n; b++) {
                if (buckets[b].length < 2) continue;
                const before = buckets[b].slice();
                buckets[b].sort((x, y) => x - y);
                const g = {};
                buckets[b].forEach((_, r) => (g[`${r},${b}`] = 'cmp'));
                snap(`Sort bucket ${b}: <code>${list(before)}</code> → <code>${list(buckets[b])}</code>.`, { g, vars: { bucket: b } });
            }
            snap('All other buckets have 0 or 1 element, so <code>sort</code> leaves them unchanged.');
            let idx = 0;
            const done = {};
            for (let b = 0; b < n; b++) {
                if (!buckets[b].length) continue;
                const placed = [];
                for (const x of buckets[b]) { placed.push(idx); out[idx++] = x; }
                const a = {};
                for (let k = 0; k < idx; k++) a[k] = 'sorted';
                placed.forEach(k => (a[k] = 'swap'));
                buckets[b].forEach((_, r) => (done[`${r},${b}`] = 'sorted'));
                snap(`Gather bucket ${b}: write ${list(buckets[b])} to <code>arr[${placed[0]}..${placed[placed.length - 1]}]</code>, <code>idx = ${idx}</code>.`, { a, g: Object.assign({}, done), vars: { bucket: b, idx }, ch: ['idx'] });
            }
            snap(`<b>Sorted: ${list(out)}</b>. Six non-empty buckets, the largest holds 3 keys — close to the uniform ideal.`,
                { a: Object.fromEntries(out.map((_, k) => [k, 'sorted'])), g: done, final: true });
            return F;
        }
    });

    /* ======================================================================
       p51 LSD radix sort (counting sort per digit)
       ====================================================================== */
    DryRun.register('p51', {
        title: 'LSD radix sort (base 10)',
        input: 'arr = [170, 45, 75, 90, 802, 24, 2, 66]',
        legend: [['cur', 'arr[i] being placed'], ['cmp', 'count[digit]'], ['swap', 'just written'], ['sorted', 'final']],
        insight: {
            pattern: 'Non-comparison sort / digit-by-digit',
            idea: [
                'Sort by the units digit, then tens, then hundreds… each pass with a <b>stable</b> counting sort. After pass t the array is sorted by the last t digits.',
                'Why stability matters: in pass 2, 170 and 75 share tens digit 7. Stability keeps them in their pass-1 order (170 before 75 because units 0 &lt; 5), so ties on a higher digit are always broken correctly by the lower digits already sorted.',
                'Time <b>Θ(d·(n + k))</b> with d digits and base k=10; space Θ(n + k).'
            ],
            traps: [
                'The loop condition <code>maxVal / exp &gt; 0</code> overflows for maxVal near INT_MAX when <code>exp *= 10</code>; use <code>long long exp</code>.',
                'Negative numbers break <code>(arr[i]/exp) % 10</code>; sort negatives separately or offset all keys.',
                'Iterating forward when building <code>output</code> destroys stability and gives wrong results.'
            ],
            tips: [
                'Use base 256 (bytes) with shifts for speed: 4 passes sort any 32-bit unsigned array.',
                'Radix-style digit thinking also solves suffix-array construction and "sort strings of equal length".'
            ]
        },
        frames() {
            const arr = [170, 45, 75, 90, 802, 24, 2, 66], n = arr.length, F = [];
            let maxVal = arr[0];
            for (let i = 1; i < n; i++) if (arr[i] > maxVal) maxVal = arr[i];
            let count = Array(10).fill(0), output = Array(n).fill(''), exp = 1, pass = 0;
            const place = e => (e === 1 ? 'units' : e === 10 ? 'tens' : e === 100 ? 'hundreds' : e + 's');
            const snap = (note, o = {}) => F.push({
                note, final: o.final,
                views: [
                    arrView('arr[]  (label = current digit)', arr, { cls: o.a || {}, pointers: o.ap || {}, labels: arr.map(x => 'd=' + (Math.floor(x / exp) % 10)) }),
                    arrView('count[0..9]', count, { cls: o.c || {} }),
                    arrView('output[]', output, { cls: o.o || {} }),
                    varsView({ maxVal, exp, pass, place: place(exp) }, o.ch || [])
                ]
            });
            snap(`<code>maxVal = ${maxVal}</code> has 3 digits → passes with <code>exp = 1, 10, 100</code> (stop when <code>maxVal / exp == 0</code>).`, { ch: ['maxVal'] });
            for (exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
                pass++;
                count = Array(10).fill(0);
                output = Array(n).fill('');
                for (let i = 0; i < n; i++) count[Math.floor(arr[i] / exp) % 10]++;
                snap(`Pass ${pass} (${place(exp)}, <code>exp = ${exp}</code>): count each digit <code>(arr[i]/exp) % 10</code> → <code>count = ${list(count)}</code>.`, { ch: ['exp', 'pass'] });
                for (let i = 1; i < 10; i++) count[i] += count[i - 1];
                snap(`Prefix sums: <code>count = ${list(count)}</code>; <code>count[d]</code> is now one past the last slot for digit d.`, {});
                for (let i = n - 1; i >= 0; i--) {
                    const digit = Math.floor(arr[i] / exp) % 10;
                    const pos = count[digit] - 1;
                    output[pos] = arr[i];
                    count[digit]--;
                    snap(`<code>i = ${i}</code>: ${arr[i]} has digit <b>${digit}</b> → <code>output[${pos}] = ${arr[i]}</code>, <code>count[${digit}]--</code>.`,
                        { a: { [i]: 'cur' }, ap: { i }, c: { [digit]: 'cmp' }, o: { [pos]: 'swap' } });
                }
                for (let i = 0; i < n; i++) arr[i] = output[i];
                snap(`Copy back. After pass ${pass}: <code>${list(arr)}</code> — sorted by the last ${pass} digit(s).`, { a: Object.fromEntries(arr.map((_, k) => [k, 'visited'])) });
            }
            snap(`<code>maxVal / ${exp} = 0</code> → stop. <b>Sorted: ${list(arr)}</b> after ${pass} passes = d·(n + 10) work.`, { a: Object.fromEntries(arr.map((_, k) => [k, 'sorted'])), final: true });
            return F;
        }
    });

    /* ======================================================================
       p52 Closest pair of points
       ====================================================================== */
    function pointsSvg(P, o) {
        const maxX = Math.max(...P.map(p => p.x)), maxY = Math.max(...P.map(p => p.y));
        const W = 380, H = 270, pad = 26;
        // square-root axes: monotone (strip stays a band), but spreads out clustered points
        const padR = 70, sx = (W - pad - padR) / Math.sqrt(maxX), sy = (H - 2 * pad) / Math.sqrt(maxY);
        const X = x => pad + Math.sqrt(Math.max(0, x)) * sx, Y = y => H - pad - Math.sqrt(Math.max(0, y)) * sy;
        let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:100%;height:auto;display:block">`;
        s += `<rect x="0" y="0" width="${W}" height="${H}" rx="8" fill="#0d111a"/>`;
        s += `<line x1="${pad}" y1="${H - pad}" x2="${W - 8}" y2="${H - pad}" stroke="#2a3245"/><line x1="${pad}" y1="${H - pad}" x2="${pad}" y2="8" stroke="#2a3245"/>`;
        if (o.mid !== undefined && o.d !== undefined && isFinite(o.d)) {
            const a = Math.max(0, o.mid - o.d), b = o.mid + o.d;
            s += `<rect x="${X(a)}" y="8" width="${Math.max(2, X(b) - X(a))}" height="${H - pad - 8}" fill="rgba(179,146,240,.16)" stroke="rgba(179,146,240,.6)" stroke-dasharray="4 3"/>`;
        }
        if (o.mid !== undefined) s += `<line x1="${X(o.mid)}" y1="8" x2="${X(o.mid)}" y2="${H - pad}" stroke="#ffcf5c" stroke-dasharray="5 4"/><text x="${X(o.mid) + 4}" y="${H - 8}" fill="#ffcf5c" font-size="10">x = ${o.mid}</text>`;
        const seg = (p, q, col, wd) => (s += `<line x1="${X(p.x)}" y1="${Y(p.y)}" x2="${X(q.x)}" y2="${Y(q.y)}" stroke="${col}" stroke-width="${wd}"/>`);
        if (o.best) seg(o.best[0], o.best[1], '#3ddc97', 3);
        if (o.pair) seg(o.pair[0], o.pair[1], '#ffcf5c', 2);
        P.forEach((p, k) => {
            const inR = o.l === undefined || (k >= o.l && k <= o.r);
            const strip = o.strip && o.strip.includes(p.name);
            const fill = strip ? '#b392f0' : inR ? '#4f8cff' : '#2a3245';
            s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5" fill="${fill}" stroke="#0d111a" stroke-width="1.5"/>`;
            // put the label on the left when a neighbour to the right would collide with it
            const crowded = P.some(q => q !== p && X(q.x) > X(p.x) && X(q.x) - X(p.x) < 45 && Math.abs(Y(q.y) - Y(p.y)) < 16);
            s += `<text x="${X(p.x) + (crowded ? -7 : 7)}" y="${Y(p.y) - 6}" text-anchor="${crowded ? 'end' : 'start'}" fill="${inR ? '#dfe6f5' : '#5d667c'}" font-size="10.5" font-family="monospace">${p.name}(${p.x},${p.y})</text>`;
        });
        return s + '</svg>';
    }

    function closestFrames(raw) {
        const names = 'ABCDEFGH';
        const P = raw.map(([x, y], k) => ({ x, y, name: names[k] }));
        const F = [], stack = [];
        const pname = p => `${p.name}(${p.x},${p.y})`;
        let best = null;
        const snap = (note, o = {}) => {
            const cls = {};
            P.forEach((_, k) => { if (o.l !== undefined && (k < o.l || k > o.r)) cls[k] = 'dim'; });
            Object.assign(cls, o.cls || {});
            const views = [
                { type: 'html', title: 'plane (√-scaled axes, x right, y up)', html: pointsSvg(P, Object.assign({ best }, o)) },
                arrView('P[] (sorted by x)', P.map(p => `${p.name}(${p.x},${p.y})`), { cls, pointers: o.ptr || {} })
            ];
            if (o.stripList) views.push({ type: 'list', kind: 'set', title: 'strip (sorted by y)', items: o.stripList });
            views.push(stackView(stack));
            views.push(varsView(o.vars || {}, o.ch || []));
            F.push({ note, views, final: o.final });
        };
        snap(`Input points: ${P.map(pname).join(', ')}.`, { vars: { n: P.length } });
        P.sort((a, b) => a.x - b.x);
        snap(`Step 1: sort by x → ${P.map(pname).join(', ')}.`, { vars: { n: P.length } });
        const brute = (l, r) => {
            let m = Infinity;
            for (let i = l; i <= r; i++) for (let j = i + 1; j <= r; j++) {
                const d = hyp(P[i], P[j]);
                const better = d < m;
                if (better) m = d;
                if (!best || d < best.d) best = { 0: P[i], 1: P[j], d };
                snap(`bruteForce: dist(${pname(P[i])}, ${pname(P[j])}) = <b>${r2(d)}</b>${better ? ` → new minimum for [${l}..${r}]` : ''}.`,
                    { l, r, pair: [P[i], P[j]], cls: { [i]: 'cmp', [j]: 'cmp' }, vars: { l, r, 'min so far': r2(m) } });
            }
            return m;
        };
        const util = (l, r) => {
            stack.push(`closestUtil(${l},${r})`);
            let res;
            if (r - l <= 3) {
                snap(`<code>closestUtil(${l}, ${r})</code>: <code>r - l = ${r - l} &lt;= 3</code> → solve by brute force over all pairs.`, { l, r, vars: { l, r } });
                res = brute(l, r);
                snap(`Return <b>${r2(res)}</b> from <code>[${l}..${r}]</code>.`, { l, r, vars: { l, r, return: r2(res) }, ch: ['return'] });
            } else {
                const mid = Math.floor((l + r) / 2), midPoint = P[mid];
                snap(`<code>closestUtil(${l}, ${r})</code>: <code>mid = ${mid}</code>, <code>midPoint = ${pname(midPoint)}</code>. Left = [${l}..${mid}], right = [${mid + 1}..${r}].`,
                    { l, r, mid: midPoint.x, ptr: { mid }, cls: { [mid]: 'cur' }, vars: { l, r, mid } });
                const dl = util(l, mid), dr = util(mid + 1, r);
                const d = Math.min(dl, dr);
                snap(`<code>d = min(d_L = ${r2(dl)}, d_R = ${r2(dr)}) = <b>${r2(d)}</b></code>. A closer pair would have to cross the line x = ${midPoint.x}.`,
                    { l, r, mid: midPoint.x, d, vars: { d_L: r2(dl), d_R: r2(dr), d: r2(d) }, ch: ['d'] });
                const strip = [];
                for (let i = l; i <= r; i++) if (Math.abs(P[i].x - midPoint.x) < d) strip.push(P[i]);
                strip.sort((a, b) => a.y - b.y);
                const sNames = strip.map(p => p.name);
                const sCls = {};
                for (let i = l; i <= r; i++) if (sNames.includes(P[i].name)) sCls[i] = 'queued';
                snap(`Strip: points with <code>|x - ${midPoint.x}| &lt; ${r2(d)}</code> → ${strip.length ? strip.map(pname).join(', ') : 'none'}. Sorted by y for <code>stripClosest</code>.`,
                    { l, r, mid: midPoint.x, d, strip: sNames, cls: sCls, stripList: strip.map(pname), vars: { d: r2(d), 'strip size': strip.length } });
                let minDist = d, checks = 0;
                for (let i = 0; i < strip.length; i++)
                    for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < minDist; j++) {
                        const dd = hyp(strip[i], strip[j]);
                        checks++;
                        const better = dd < minDist;
                        minDist = Math.min(minDist, dd);
                        if (better && (!best || dd < best.d)) best = { 0: strip[i], 1: strip[j], d: dd };
                        snap(`stripClosest: <code>${strip[j].y} - ${strip[i].y} &lt; ${r2(better ? d : minDist)}</code> so compare ${pname(strip[i])} and ${pname(strip[j])}: dist = <b>${r2(dd)}</b>${better ? ' → <b>new minimum</b> across the line' : ''}.`,
                            { l, r, mid: midPoint.x, d, strip: sNames, cls: sCls, stripList: strip.map(pname), pair: [strip[i], strip[j]], vars: { d: r2(d), minDist: r2(minDist) }, ch: ['minDist'] });
                    }
                if (!checks) snap(`stripClosest: ${strip.length < 2 ? 'fewer than two points in the strip' : 'every y-gap is ≥ d'} → no pair to check, <code>minDist</code> stays ${r2(d)}.`,
                    { l, r, mid: midPoint.x, d, strip: sNames, cls: sCls, stripList: strip.map(pname), vars: { d: r2(d), minDist: r2(minDist) } });
                res = Math.min(d, minDist);
                snap(`Return <code>min(d, stripClosest) = <b>${r2(res)}</b></code>.`, { l, r, vars: { return: r2(res) }, ch: ['return'] });
            }
            stack.pop();
            return res;
        };
        const ans = util(0, P.length - 1);
        snap(`<b>Minimum distance = ${r2(ans)}</b> between ${pname(best[0])} and ${pname(best[1])}.`, { vars: { answer: r2(ans) }, final: true });
        return F;
    }

    DryRun.register('p52', {
        title: 'Closest pair: divide at the median x, then check the strip',
        legend: [['cmp', 'pair being measured'], ['cur', 'midPoint'], ['queued', 'in the strip'], ['dim', 'outside [l..r]']],
        insight: {
            pattern: 'Geometric divide & conquer',
            idea: [
                'Sort by x, split at the median, solve both halves → <code>d = min(d_L, d_R)</code>. Only pairs that <b>cross</b> the dividing line and are closer than d remain: they lie in a strip of width 2d.',
                'Packing argument: inside the strip, sorted by y, each point only needs to be compared with the next ≤ 7 points (the <code>strip[j].y - strip[i].y &lt; minDist</code> check stops the inner loop early).',
                'Sorting the strip inside every call gives T(n) = 2T(n/2) + O(n log n) = O(n log² n); pre-sorting by y once (or merging by y like merge sort) gives <b>T(n) = 2T(n/2) + O(n) = O(n log n)</b>.'
            ],
            traps: [
                'The strip test is <code>|x - midPoint.x| &lt; d</code>: with d = 1.41 and mid x = 5, the point (3,4) is <b>not</b> in the strip (|3−5| = 2).',
                '<code>bruteForce</code> must be defined for the base case (≤ 4 points); it is not shown in the snippet.',
                'Work with squared distances (long long) to avoid floating-point issues; take sqrt only at the end.'
            ],
            tips: [
                'For contests a simpler sweep-line with a <code>set</code> ordered by y also runs in O(n log n).',
                'Duplicates give distance 0 — handle them naturally, no special case needed.'
            ]
        },
        examples: [
            { label: 'Notes example', input: 'points = {(2,3), (12,30), (40,50), (5,1), (12,10), (3,4)}', frames: () => closestFrames([[2, 3], [12, 30], [40, 50], [5, 1], [12, 10], [3, 4]]) },
            { label: 'Pair across the line', input: 'points = {(1,1), (4,9), (6,2), (7,3), (9,8), (12,1)}', frames: () => closestFrames([[1, 1], [4, 9], [6, 2], [7, 3], [9, 8], [12, 1]]) }
        ]
    });

    /* ======================================================================
       p53 Formal loop correctness — invariant checked every iteration
       ====================================================================== */
    function invRow(label, ok, text) {
        const col = ok === null ? '#8b93a7' : ok ? '#3ddc97' : '#ff5c7a';
        const mark = ok === null ? '·' : ok ? 'holds' : 'fails';
        return `<div style="display:flex;gap:10px;align-items:baseline;margin:4px 0"><b style="color:${col};width:18px">${mark}</b><span style="min-width:120px;color:#8b93a7">${label}</span><span>${text}</span></div>`;
    }

    function linearFrames(A, x) {
        const n = A.length, F = [];
        const snap = (note, i, rows, o = {}) => {
            const cls = {};
            for (let k = 0; k < n; k++) if (k < i) cls[k] = 'visited';
            Object.assign(cls, o.cls || {});
            F.push({
                note, final: o.final,
                views: [
                    arrView('A[]', A, { cls, pointers: i < n ? { i } : {} }),
                    varsView({ i, n, x, 'B: i < n': i < n }, o.ch || []),
                    { type: 'html', title: 'proof obligations', wide: true, html: rows.join('') }
                ]
            });
        };
        const I = i => `x ∉ A[0..${i - 1}]${i === 0 ? ' (empty range)' : ' = {' + A.slice(0, i).join(', ') + '}'}`;
        snap(`Precondition <b>P</b>: array <code>A[0..${n - 1}]</code> exists, target <code>x = ${x}</code>. Execute <code>int i = 0</code>.`, 0,
            [invRow('P (pre)', true, `A has n = ${n} elements, x = ${x}`), invRow('I (invariant)', true, I(0) + ' — <b>initialisation</b>: P ⇒ I'), invRow('Q (post)', null, 'not yet')], { ch: ['i'] });
        let i = 0;
        while (i < n) {
            snap(`Iteration start, <code>i = ${i}</code>: <b>I ∧ B</b> holds (${I(i)}, and ${i} &lt; ${n}). Test <code>A[${i}] == x</code>?`, i,
                [invRow('B (guard)', true, `i = ${i} &lt; n = ${n}`), invRow('I (invariant)', true, I(i)), invRow('check', null, `A[${i}] = ${A[i]} vs x = ${x}`)], { cls: { [i]: 'cmp' } });
            if (A[i] === x) {
                snap(`<code>A[${i}] = ${x}</code> → <b>return ${i}</b>. Correct because A[${i}] really is x (early exit; no claim about later positions is needed).`, i,
                    [invRow('I (invariant)', true, I(i)), invRow('found', true, `A[${i}] == x → return ${i}`)], { cls: { [i]: 'sorted' }, final: true });
                return F;
            }
            i++;
            snap(`<code>A[${i - 1}] = ${A[i - 1]} ≠ ${x}</code>, so <code>i++</code> → ${i}. <b>Maintenance</b>: x is not in A[0..${i - 2}] (old I) and not at ${i - 1}, so <b>I</b> holds for the new i.`, i,
                [invRow('{I ∧ B} body {I}', true, I(i))], { ch: ['i'] });
        }
        snap(`Guard <code>i &lt; n</code> is false (<code>i = ${n}</code>). <b>Termination</b>: I ∧ ¬B ⇒ x ∉ A[0..${n - 1}] = <b>Q</b>. <b>return -1</b>.`, i,
            [invRow('¬B', true, `i = ${i} = n`), invRow('I (invariant)', true, I(i)), invRow('Q (post)', true, `x = ${x} is not in A → return -1`)], { final: true });
        return F;
    }

    function insertionInvariantFrames(input) {
        const arr = input.slice(), n = arr.length, F = [];
        const sortedPrefix = i => arr.slice(0, i).every((v, k, a) => k === 0 || a[k - 1] <= v);
        const snap = (note, i, rows, o = {}) => {
            const cls = {};
            for (let k = 0; k < n; k++) if (k < i) cls[k] = o.final ? 'sorted' : 'visited';
            if (i < n && !o.final) cls[i] = 'cur';
            F.push({
                note, final: o.final,
                views: [
                    arrView('arr[]', arr, { cls, bars: true, pointers: i < n ? { i } : {} }),
                    varsView({ i, n }, o.ch || []),
                    { type: 'html', title: 'invariant check', wide: true, html: rows.join('') }
                ]
            });
        };
        for (let i = 1; i <= n; i++) {
            const ok = sortedPrefix(i);
            const pref = '{' + arr.slice(0, i).join(', ') + '}';
            if (i === n) {
                snap(`<code>i = n = ${n}</code>: guard fails. <b>Termination</b>: I says arr[0..${n - 1}] is sorted → the whole array is sorted (<b>Q</b>).`, i,
                    [invRow('I', ok, `arr[0..${n - 1}] = ${pref} is sorted`), invRow('Q (post)', ok, 'entire array sorted')], { final: true });
                break;
            }
            snap(`Start of iteration <code>i = ${i}</code>: ${i === 1 ? '<b>initialisation</b> — a single element is sorted' : '<b>maintenance</b> kept the prefix sorted'}. Now insert <b>${arr[i]}</b>.`, i,
                [invRow('I', ok, `arr[0..${i - 1}] = ${pref} is sorted`), invRow('B (guard)', true, `i = ${i} &lt; n = ${n}`)], { ch: ['i'] });
            let j = i;
            while (j > 0 && arr[j] < arr[j - 1]) { [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]]; j--; }
        }
        return F;
    }

    DryRun.register('p53', {
        title: 'Checking P, I, B and Q at every iteration',
        legend: [['visited', 'region the invariant talks about'], ['cmp', 'element examined by the body'], ['cur', 'next element'], ['sorted', 'result']],
        insight: {
            pattern: 'Loop invariants / Hoare logic',
            idea: [
                'Three obligations: <b>Initialisation</b> P ⇒ I, <b>Maintenance</b> {I ∧ B} body {I}, <b>Termination</b> I ∧ ¬B ⇒ Q. Add a <b>variant</b> (e.g. n − i strictly decreases) to prove the loop actually stops.',
                'A good invariant is a "partial answer" parameterised by the loop variable: "x ∉ A[0..i-1]", "arr[0..i-1] is sorted", "target ∈ A[low..high] if present".',
                'Plug the exit value of the loop variable into I (i = n) and it should read exactly like Q.'
            ],
            traps: [
                'Stating the invariant <b>after</b> the increment (off by one): always say "at the start of each iteration".',
                'An invariant that is true but too weak (e.g. "i ≤ n") cannot prove Q.',
                'Early <code>return</code> inside the loop needs its own argument (it is not the I ∧ ¬B exit).'
            ],
            tips: [
                'Write the invariant first, then the code: it tells you the loop bounds and the update order.',
                'Exam template: "Invariant: At the start of each iteration of the loop, …; Init: …; Maint: …; Term: … therefore …".'
            ]
        },
        examples: [
            { label: 'Linear search, x found', input: 'A = [7, 3, 9, 4, 1, 8], x = 4', frames: () => linearFrames([7, 3, 9, 4, 1, 8], 4) },
            { label: 'Linear search, x missing', input: 'A = [7, 3, 9, 4], x = 5', frames: () => linearFrames([7, 3, 9, 4], 5) },
            { label: 'Insertion sort invariant', input: 'arr = [5, 2, 4, 6, 1]', frames: () => insertionInvariantFrames([5, 2, 4, 6, 1]) }
        ]
    });

    /* ======================================================================
       p54 Heap sort with extraction vector
       ====================================================================== */
    function heapFrames(input) {
        const A = input.slice(), N = A.length, F = [], ans = [];
        const pos = Array.from({ length: N }, (_, i) => {
            const lv = Math.floor(Math.log2(i + 1)), first = 2 ** lv - 1, cnt = 2 ** lv;
            return { x: Math.round(((i - first + 0.5) / cnt) * 360), y: 40 + lv * 72 };
        });
        const edges = [];
        for (let i = 1; i < N; i++) edges.push({ u: Math.floor((i - 1) / 2), v: i });
        let heapN = N;
        const snap = (note, o = {}) => {
            const nodeCls = {}, edgeCls = {}, cls = {};
            for (let k = 0; k < N; k++) if (k >= heapN) { nodeCls[k] = 'done'; cls[k] = 'sorted'; }
            edges.forEach(e => { if (e.v >= heapN) edgeCls[`${e.u}-${e.v}`] = 'dim'; });
            (o.cmp || []).forEach(k => { nodeCls[k] = 'queued'; cls[k] = 'cmp'; });
            (o.swap || []).forEach(k => { nodeCls[k] = 'c1'; cls[k] = 'swap'; });
            if (o.cur !== undefined) { nodeCls[o.cur] = 'cur'; cls[o.cur] = cls[o.cur] || 'cur'; }
            if (o.final) for (let k = 0; k < N; k++) { cls[k] = 'sorted'; nodeCls[k] = 'done'; }
            F.push({
                note, final: o.final,
                views: [
                    { type: 'graph', title: `heap as a tree (size n = ${heapN})`, nodes: A.map((v, i) => ({ id: i, x: pos[i].x, y: pos[i].y, label: v })), edges, nodeCls, edgeCls, badges: Object.fromEntries(A.map((_, i) => [i, '#' + i])) },
                    arrView('A[]', A, { cls, pointers: o.ptr || {} }),
                    { type: 'list', kind: 'set', title: 'ans', items: ans.slice() },
                    varsView(o.vars || {}, o.ch || [])
                ]
            });
        };
        const heapify = (n, i) => {
            let largest = i;
            const left = 2 * i + 1, right = 2 * i + 2;
            if (left < n && A[left] > A[largest]) largest = left;
            if (right < n && A[right] > A[largest]) largest = right;
            const kids = [left, right].filter(k => k < n);
            const kidTxt = kids.length ? kids.map(k => `A[${k}] = ${A[k]}`).join(', ') : 'no children';
            if (largest !== i) {
                snap(`<code>heapify(A, ${n}, ${i})</code>: parent A[${i}] = ${A[i]}, ${kidTxt} → <code>largest = ${largest}</code> (${A[largest]}). Heap property violated.`,
                    { cur: i, cmp: kids, ptr: { i, largest }, vars: { n, i, left, right, largest }, ch: ['largest'] });
                [A[i], A[largest]] = [A[largest], A[i]];
                snap(`<code>swap(A[${i}], A[${largest}])</code> → ${A[i]} moves up, ${A[largest]} sinks to index ${largest}; recurse <code>heapify(A, ${n}, ${largest})</code>.`,
                    { swap: [i, largest], ptr: { i, largest }, vars: { n, i, largest } });
                heapify(n, largest);
            } else {
                snap(`<code>heapify(A, ${n}, ${i})</code>: A[${i}] = ${A[i]}, ${kidTxt} → <code>largest == i</code>, subtree already a max-heap. Stop.`,
                    { cur: i, cmp: kids, ptr: { i }, vars: { n, i, left, right, largest } });
            }
        };
        snap(`Input <code>${list(A)}</code> viewed as a complete binary tree: children of i are 2i+1 and 2i+2.`, { vars: { n: N } });
        for (let i = Math.floor(N / 2) - 1; i >= 0; i--) heapify(N, i);
        snap(`Build-max-heap done: <code>${list(A)}</code>. Every parent ≥ its children, so A[0] = ${A[0]} is the maximum.`, { vars: { n: N } });
        for (let i = N - 1; i >= 0; i--) {
            ans.push(A[0]);
            snap(`Extraction <code>i = ${i}</code>: <code>ans.push_back(A[0] = ${A[0]})</code>.`, { cur: 0, ptr: { i }, vars: { i }, ch: ['i'] });
            [A[0], A[i]] = [A[i], A[0]];
            heapN = i;
            snap(`<code>swap(A[0], A[${i}])</code>: the max goes to index ${i} (outside the heap now); heap size becomes ${i}.`, { swap: i > 0 ? [0] : [], ptr: { i }, vars: { i, 'heap size': i } });
            if (i > 0) heapify(i, 0);
        }
        const asc = ans.slice().reverse();
        snap(`<b>ans = ${list(ans)}</b> (descending). <code>reverse(ans)</code> → <b>${list(asc)}</b>. Note A itself is also sorted ascending in place: <code>${list(A)}</code>.`, { final: true });
        return F;
    }

    DryRun.register('p54', {
        title: 'Heap sort: build max-heap, then extract',
        legend: [['cur', 'node i in heapify'], ['queued', 'children compared'], ['swap', 'swapped'], ['done', 'extracted (outside heap)']],
        insight: {
            pattern: 'Priority queue / binary heap',
            idea: [
                'Array ⇄ complete binary tree: parent <code>(i-1)/2</code>, children <code>2i+1</code>, <code>2i+2</code>. Leaves start at <code>n/2</code>, so build-heap only heapifies indices <code>n/2-1 … 0</code>.',
                'Build-heap is <b>O(n)</b> (most nodes are near the bottom: Σ h·n/2^(h+1) = O(n)); each of the n extractions costs one O(log n) heapify → <b>O(n log n)</b> always.',
                'Swapping the root with <code>A[i]</code> builds an ascending array in place — the <code>ans</code> vector is optional (O(1) extra space without it). <b>Not stable.</b>'
            ],
            traps: [
                'Pass the <b>reduced</b> size <code>i</code> to <code>heapify(A, i, 0)</code>, otherwise the extracted maxima get pulled back into the heap.',
                'Start build-heap at <code>n/2 - 1</code> going <b>down</b> to 0; going up does not build a heap.',
                'Use <code>largest</code> (compare both children) — swapping with the first larger child can break the property.'
            ],
            tips: [
                'In contests just use <code>priority_queue</code> (max-heap) or <code>priority_queue&lt;int, vector&lt;int&gt;, greater&lt;int&gt;&gt;</code> (min-heap).',
                'Top-k problems: keep a min-heap of size k → O(n log k).',
                '<code>make_heap</code> + <code>sort_heap</code> in &lt;algorithm&gt; do exactly this algorithm.'
            ]
        },
        examples: [
            { label: 'Notes input', input: 'A = {4, 10, 3, 5, 1}', frames: () => heapFrames([4, 10, 3, 5, 1]) },
            { label: '7 elements', input: 'A = {3, 9, 2, 1, 4, 5, 8}', frames: () => heapFrames([3, 9, 2, 1, 4, 5, 8]) }
        ]
    });

    /* ======================================================================
       p20 P / NP / approximation — 2-approx vertex cover + greedy set cover
       ====================================================================== */
    function minVertexCover(V, E) {
        let best = null;
        for (let mask = 0; mask < 1 << V.length; mask++) {
            const S = V.filter((_, k) => mask & (1 << k));
            if (best && S.length >= best.length) continue;
            if (E.every(([u, v]) => S.includes(u) || S.includes(v))) best = S;
        }
        return best;
    }

    function vcFrames(V, E, pos) {
        const F = [], C = [];
        let Ep = E.map((e, k) => k);
        const nodes = V.map((v, k) => ({ id: v, x: pos[k][0], y: pos[k][1] }));
        const edges = E.map(([u, v]) => ({ u, v }));
        const ek = ([u, v]) => `${u}-${v}`;
        const snap = (note, o = {}) => {
            const nodeCls = {}, edgeCls = {};
            C.forEach(v => (nodeCls[v] = 'done'));
            E.forEach((e, k) => { if (!Ep.includes(k)) edgeCls[ek(e)] = 'tree'; });
            if (o.pick !== undefined) { edgeCls[ek(E[o.pick])] = 'cur'; }
            (o.newNodes || []).forEach(v => (nodeCls[v] = 'cur'));
            (o.removed || []).forEach(k => (edgeCls[ek(E[k])] = 'bad'));
            if (o.opt) o.opt.forEach(v => (nodeCls[v] = nodeCls[v] === 'done' ? 'done' : 'c3'));
            F.push({
                note, final: o.final,
                views: [
                    { type: 'graph', title: 'G', nodes, edges, nodeCls, edgeCls },
                    { type: 'list', kind: 'set', title: "E' (uncovered edges)", items: Ep.map(k => `(${E[k][0]},${E[k][1]})`), cls: o.pick !== undefined ? { [Ep.indexOf(o.pick)]: 'cur' } : {} },
                    { type: 'list', kind: 'set', title: 'C (cover)', items: C.slice() },
                    varsView(Object.assign({ '|C|': C.length, "|E'|": Ep.length }, o.vars || {}), o.ch || [])
                ]
            });
        };
        snap(`<code>C = ∅</code>, <code>E' = </code> all ${E.length} edges.`);
        while (Ep.length) {
            const pick = Ep[0];
            const [u, v] = E[pick];
            snap(`Pick an arbitrary uncovered edge — here the first one in E': <b>(${u}, ${v})</b>.`, { pick });
            const fresh = [u, v].filter(x => !C.includes(x));
            C.push(...fresh);
            const removed = Ep.filter(k => C.includes(E[k][0]) || C.includes(E[k][1]));
            snap(`Add <b>both</b> endpoints ${u} and ${v} to C. Every edge touching them is now covered: ${removed.map(k => `(${E[k][0]},${E[k][1]})`).join(', ')}.`,
                { pick, newNodes: [u, v], removed, ch: ['|C|'] });
            Ep = Ep.filter(k => !removed.includes(k));
            snap(`Remove those edges from E'. ${Ep.length} edge(s) remain.`, { ch: ["|E'|"] });
        }
        const opt = minVertexCover(V, E);
        snap(`E' is empty → <b>C = {${C.join(', ')}}</b>, |C| = ${C.length}. Optimum (brute force) is {${opt.join(', ')}} with ${opt.length} vertices → ratio ${C.length}/${opt.length} = ${r2(C.length / opt.length)} ≤ 2. The picked edges form a matching, and OPT needs one vertex per matched edge.`,
            { opt, vars: { OPT: opt.length, ratio: r2(C.length / opt.length) }, final: true });
        return F;
    }

    function setCoverFrames() {
        const X = ['a', 'b', 'c', 'd', 'e'];
        const Fam = { f1: ['a', 'b'], f2: ['b', 'c'], f3: ['c', 'd'], f4: ['d', 'e'], f5: ['a', 'e'] };
        const names = Object.keys(Fam);
        let U = X.slice();
        const chosen = [], F = [];
        const snap = (note, o = {}) => {
            const grid = names.map(f => X.map(x => (Fam[f].includes(x) ? (U.includes(x) ? '1' : 'x') : '')));
            const cls = {};
            names.forEach((f, r) => X.forEach((x, c) => {
                if (!Fam[f].includes(x)) return;
                if (chosen.includes(f)) cls[`${r},${c}`] = 'sorted';
                else if (o.best === f) cls[`${r},${c}`] = 'cur';
                else if (!U.includes(x)) cls[`${r},${c}`] = 'dim';
            }));
            F.push({
                note, final: o.final,
                views: [
                    { type: 'grid', title: 'subset × element (1 = still uncovered)', values: grid, cls, rowLabels: names, colLabels: X, corner: 'F' },
                    { type: 'list', kind: 'set', title: 'uncovered X', items: U.slice() },
                    { type: 'list', kind: 'set', title: 'cover', items: chosen.slice() },
                    varsView(o.vars || {}, [])
                ]
            });
        };
        snap('Universe <code>X = {a,b,c,d,e}</code>, five subsets. Nothing chosen yet.');
        while (U.length) {
            const gain = f => Fam[f].filter(x => U.includes(x)).length;
            let best = null;
            names.forEach(f => { if (!chosen.includes(f) && (best === null || gain(f) > gain(best))) best = f; });
            const gains = names.filter(f => !chosen.includes(f)).map(f => `${f}:${gain(f)}`).join(', ');
            snap(`Gains (new elements covered): ${gains}. Pick the first maximum → <b>${best}</b> = {${Fam[best].join(',')}}.`, { best, vars: { pick: best, gain: gain(best) } });
            chosen.push(best);
            U = U.filter(x => !Fam[best].includes(x));
            snap(`Add ${best}; uncovered elements left: {${U.join(', ')}}.`, { vars: { '|cover|': chosen.length } });
        }
        snap(`X is covered by <b>{${chosen.join(', ')}}</b> (3 subsets) — matches the notes. Greedy set cover is an H(max|S|) ≈ ln n approximation.`, { final: true });
        return F;
    }

    DryRun.register('p20', {
        title: 'APPROX-VC (2-approximation) and greedy set cover',
        after: ':scope > .problem-desc:not([style]) > .code-window',
        insightAfter: ':scope > .tagline',
        legend: [['cur', 'picked edge / new vertices'], ['bad', 'edges removed this step'], ['tree', 'covered edge'], ['done', 'in C'], ['c3', 'optimal-only vertex']],
        insight: {
            pattern: 'Complexity classes & approximation',
            idea: [
                '<b>P</b>: solvable in polynomial time. <b>NP</b>: a certificate can be <b>verified</b> in polynomial time. <b>NP-hard</b>: every NP problem reduces to it. <b>NP-complete</b> = NP ∩ NP-hard.',
                'To prove a new problem B is NP-hard, reduce a <b>known</b> NP-complete problem A to B (A ≤ₚ B), never the other way round.',
                'APPROX-VC picks a <b>maximal matching</b> M and takes both endpoints: |C| = 2|M| and any cover needs ≥ |M| vertices (matched edges share no vertex) ⇒ |C| ≤ 2·OPT.'
            ],
            traps: [
                'NP does <b>not</b> mean "not polynomial"; P ⊆ NP.',
                'Reduction direction mix-ups are the #1 exam error.',
                'Taking only one endpoint per edge (greedy by degree) has <b>no</b> constant ratio guarantee — the "both endpoints" trick is what makes the proof work.'
            ],
            tips: [
                'Vertex cover on a <b>tree</b> or bipartite graph is polynomial (tree DP / König + max matching) — check the input structure before declaring NP-hard.',
                'Independent set = complement of a vertex cover; clique in G = independent set in the complement graph.',
                'Small n (≤ 20–25): brute force over bitmasks or meet-in-the-middle is fine in contests.'
            ]
        },
        examples: [
            { label: 'Notes: path 1-2-3-4', input: 'edges = (1,2), (2,3), (3,4)', frames: () => vcFrames([1, 2, 3, 4], [[1, 2], [2, 3], [3, 4]], [[40, 100], [150, 100], [260, 100], [370, 100]]) },
            { label: 'Lab graph', input: 'edges = (0,1), (1,3), (3,2), (2,0), (0,4), (3,4)', frames: () => vcFrames([0, 1, 2, 3, 4], [[0, 1], [1, 3], [3, 2], [2, 0], [0, 4], [3, 4]], [[40, 40], [240, 40], [40, 240], [240, 240], [140, 140]]) },
            { label: 'Greedy set cover', input: 'X = {a,b,c,d,e}; f1={a,b}, f2={b,c}, f3={c,d}, f4={d,e}, f5={a,e}', frames: setCoverFrames }
        ]
    });

    /* ======================================================================
       p28 Greedy k-center (farthest-first traversal)
       ====================================================================== */
    DryRun.register('p28', {
        title: 'Greedy k-center (farthest-first), k = 3',
        input: 'points (from the lab): P0(50,50) P1(70,80) P2(200,40) P3(220,70) P4(100,200) P5(130,220) P6(40,240); first center = P0',
        after: ':scope > .problem-desc:has(#kcenter-canvas)',
        insightAfter: ':scope > .tagline',
        legend: [['done', 'chosen center'], ['cur', 'point being measured'], ['bad', 'farthest so far'], ['tree', 'assignment to nearest center']],
        insight: {
            pattern: 'Greedy approximation / local search',
            idea: [
                'Greedy builds a solution step by step and never revisits a choice; local search starts from a feasible solution and keeps applying improving moves (2-opt, swap) until none helps — a <b>local</b> optimum.',
                'Farthest-first k-center: pick any center, then repeatedly add the point with the largest distance to its nearest center. Runs in O(n·k).',
                'Why 2-approx: if the result had radius r &gt; 2·OPT, the k centers plus the farthest point are k+1 points pairwise &gt; 2·OPT apart, so two of them share an optimal cluster of diameter ≤ 2·OPT — contradiction (triangle inequality).'
            ],
            traps: [
                'The guarantee needs a <b>metric</b> (triangle inequality). Without it there is no constant factor.',
                'No algorithm beats factor 2 unless P = NP (reduction from dominating set with distances 1/2).',
                'Greedy optimality must be proven (exchange argument / matroid); "it looked best locally" is not a proof.'
            ],
            tips: [
                'Contest greedy checklist: sort by the right key, prove with an exchange argument, test on small brute-force cases.',
                'Metric TSP: double-tree (MST + preorder walk) ≤ 2·OPT; Christofides ≤ 1.5·OPT.',
                'Local search tip: random restarts / simulated annealing to escape local optima in heuristic tasks.'
            ]
        },
        frames() {
            const P = [{ x: 50, y: 50 }, { x: 70, y: 80 }, { x: 200, y: 40 }, { x: 220, y: 70 }, { x: 100, y: 200 }, { x: 130, y: 220 }, { x: 40, y: 240 }];
            const n = P.length, k = 3, centers = [], F = [];
            const nodes = P.map((p, i) => ({ id: i, x: p.x * 2, y: p.y * 2, label: 'P' + i }));   // lab coordinates ×2 so circles don't overlap
            const near = i => {
                let best = Infinity, c = -1;
                centers.forEach(cIdx => { const d = Math.hypot(P[i].x - P[cIdx].x, P[i].y - P[cIdx].y); if (d < best) { best = d; c = cIdx; } });
                return { d: best, c };
            };
            const snap = (note, o = {}) => {
                const nodeCls = {}, edges = [], edgeCls = {}, badges = {};
                centers.forEach(c => (nodeCls[c] = 'done'));
                for (let i = 0; i < n; i++) {
                    if (centers.includes(i) || !centers.length) continue;
                    const { d, c } = near(i);
                    if (o.measured === undefined || o.measured.includes(i)) {
                        edges.push({ u: c, v: i });
                        edgeCls[`${c}-${i}`] = 'tree';
                        badges[i] = Math.round(d);
                    }
                }
                if (o.far !== undefined && o.far >= 0) { nodeCls[o.far] = 'bad'; const { c } = near(o.far); edgeCls[`${c}-${o.far}`] = 'bad'; }
                if (o.cur !== undefined) { nodeCls[o.cur] = 'cur'; const { c } = near(o.cur); edgeCls[`${c}-${o.cur}`] = 'cur'; }
                F.push({
                    note, final: o.final,
                    views: [
                        { type: 'graph', title: 'points (badge = distance to nearest center)', nodes, edges, nodeCls, edgeCls, badges },
                        { type: 'list', kind: 'set', title: 'centers S', items: centers.map(c => 'P' + c) },
                        varsView(o.vars || {}, o.ch || [])
                    ]
                });
            };
            snap('Seven points, <code>k = 3</code>. No centers yet.');
            centers.push(0);
            snap('Step 1: pick the first center arbitrarily → <b>P0</b>. Badges show each point\'s distance to its nearest center.', { vars: { centers: 1 }, ch: ['centers'] });
            for (let it = 1; it < k; it++) {
                let farthestDist = -1, farthestIdx = -1;
                const measured = [];
                for (let idx = 0; idx < n; idx++) {
                    if (centers.includes(idx)) continue;
                    const { d } = near(idx);
                    measured.push(idx);
                    const better = d > farthestDist;
                    if (better) { farthestDist = d; farthestIdx = idx; }
                    snap(`P${idx}: distance to nearest center = <b>${r2(d)}</b>${better ? ` &gt; previous best → farthest so far is <b>P${idx}</b>` : ` ≤ ${r2(farthestDist)} (P${farthestIdx} stays farthest)`}.`,
                        { measured: measured.slice(), cur: idx, far: farthestIdx !== idx ? farthestIdx : undefined, vars: { round: it + 1, 'P_idx': 'P' + idx, minDistToCenter: r2(d), farthestDist: r2(farthestDist), farthestIdx: 'P' + farthestIdx }, ch: better ? ['farthestDist', 'farthestIdx'] : [] });
                }
                centers.push(farthestIdx);
                snap(`Add the worst-served point <b>P${farthestIdx}</b> (distance ${r2(farthestDist)}) as center #${centers.length}. Distances shrink for points now closer to it.`,
                    { vars: { centers: centers.length }, ch: ['centers'] });
            }
            let radius = -1, worst = -1;
            for (let i = 0; i < n; i++) if (!centers.includes(i)) { const { d } = near(i); if (d > radius) { radius = d; worst = i; } }
            snap(`<b>S = {${centers.map(c => 'P' + c).join(', ')}}</b>. Covering radius = max distance to nearest center = <b>${r2(radius)}</b> (P${worst}). Guarantee: ≤ 2 × optimal radius.`,
                { far: worst, vars: { radius: r2(radius) }, final: true });
            return F;
        }
    });

    /* ======================================================================
       p38 Exam recap — cheat-list + binary exponentiation dry run
       ====================================================================== */
    DryRun.register('p38', {
        title: 'Mystery algorithm = fast power: a = 3, b = 13',
        input: 'a = 3, b = 13, result = 1',
        after: ':scope > .viz-layout',
        insightAfter: ':scope > .tagline',
        legend: [['cur', 'current lowest bit of b'], ['sorted', 'bit already consumed']],
        insight: {
            pattern: 'Problem → algorithm cheat-list',
            idea: [
                '<b>Sorted data, find item / boundary</b> → binary search, O(log n). <b>Sort, stable, guaranteed</b> → merge sort O(n log n), O(n) space. <b>Sort in place, fast average</b> → quick sort. <b>Small integer keys</b> → counting / radix O(n + k).',
                '<b>Max subarray</b> → Kadane O(n) (D&amp;C O(n log n) if asked). <b>Closest pair</b> → D&amp;C O(n log n). <b>Top-k / repeated max</b> → heap.',
                '<b>Unweighted shortest path / grid</b> → BFS. <b>Non-negative weights</b> → Dijkstra O((V+E) log V). <b>Negative edges</b> → Bellman-Ford O(VE). <b>All pairs, small V</b> → Floyd-Warshall O(V³).',
                '<b>Prerequisites / ordering</b> → topological sort (DFS or Kahn), cycle ⇒ impossible. <b>Connectivity</b> → DFS/BFS or DSU. <b>Cheapest network</b> → MST (Kruskal + DSU, Prim + heap).',
                '<b>Optimal over choices with overlapping subproblems</b> → DP: knapsack O(nW), LCS / edit distance O(nm), matrix-chain O(n³). <b>Pattern in text</b> → KMP O(n + m).',
                '<b>NP-hard optimisation</b> (vertex cover, set cover, TSP, k-center) → approximation: VC 2×, set cover ln n×, metric TSP 2× / 1.5×, k-center 2×.'
            ],
            traps: [
                'Merge sort needs O(n) extra space, not O(n log n). Binary search is O(1) space iteratively.',
                'Edit distance is DP, KMP is exact pattern matching — different problems.',
                'Master theorem: compare f(n) with n^(log_b a). T(n)=2T(n/2)+n → n log n; T(n)=T(n/2)+1 → log n; T(n)=T(n-1)+n → n² (not a Master form).',
                'Loop <code>for (i = 0; i &lt;= (n-2)/3; i++)</code> is Θ(n); a loop halving b is Θ(log b).'
            ],
            tips: [
                'Read constraints first: n ≤ 20 → 2ⁿ bitmask; n ≤ 500 → n³; n ≤ 10⁵ → n log n; n ≤ 10⁷ → O(n).',
                'f(n) = O(g(n)) ⇔ g(n) = Ω(f(n)); Θ means both.',
                'Fast power also works modulo m: multiply then <code>% m</code> each step (use long long).'
            ]
        },
        frames() {
            let a = 3, b = 13, result = 1;
            const F = [], bits = b.toString(2).split('').map(Number);
            const L = bits.length;
            let consumed = 0;
            const snap = (note, o = {}) => {
                const cls = {};
                for (let k = 0; k < L; k++) {
                    const fromRight = L - 1 - k;
                    if (fromRight < consumed) cls[k] = 'sorted';
                    else if (fromRight === consumed && !o.final) cls[k] = 'cur';
                }
                F.push({
                    note, final: o.final,
                    views: [
                        arrView('bits of the original b = 13', bits, { cls, labels: bits.map((_, k) => '2^' + (L - 1 - k)) }),
                        varsView({ a, b, result, 'b % 2': b % 2 }, o.ch || [])
                    ]
                });
            };
            snap('Start: <code>result = 1</code>, <code>a = 3</code>, <code>b = 13 = 1101₂</code>. Each loop iteration consumes one bit of b.');
            while (b > 0) {
                if (b % 2 === 1) {
                    const old = result;
                    result *= a;
                    snap(`<code>b = ${b}</code> is odd → <code>result *= a</code>: ${old} × ${a} = <b>${result}</b> (this bit contributes a = 3^${2 ** consumed}).`, { ch: ['result'] });
                } else {
                    snap(`<code>b = ${b}</code> is even → this bit is 0, result unchanged.`);
                }
                const oa = a;
                a *= a;
                b = Math.floor(b / 2);
                consumed++;
                snap(`<code>a *= a</code> → ${oa}² = ${a} (= 3^${2 ** consumed}); <code>b //= 2</code> → ${b}.`, { ch: ['a', 'b'] });
            }
            snap(`<code>b = 0</code> → loop ends after ${consumed} iterations = ⌊log₂ 13⌋ + 1. <b>3^13 = ${result}</b>, using O(log b) multiplications instead of 12.`, { final: true });
            return F;
        }
    });
})();
