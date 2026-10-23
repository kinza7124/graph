/* Dry runs: String DP + knapsack-style DP (p32 p33 p34 p35 p37 p39 p40 p41 p42 p43)
   Every trace below is COMPUTED by running the same algorithm as the code on the page. */
(function () {
    const { clone } = DryRun.util;
    const mk = (r, c, v) => Array.from({ length: r }, () => Array(c).fill(v));
    const q = s => `'${s}'`;
    const fmtNum = x => (typeof x === 'number' ? x.toLocaleString('en-US') : x);

    /* ---------------------------------------------------------------- shared: LCS table fill */
    // Pushes one frame per cell, exactly mirroring
    //   for i=1..n, for j=1..m: if (a[i-1]==b[j-1]) dp[i][j]=1+dp[i-1][j-1]; else dp[i][j]=max(dp[i-1][j], dp[i][j-1]);
    function lcsFill(a, b, A, B, frames, extraViews) {
        const n = a.length, m = b.length;
        const dp = mk(n + 1, m + 1, 0), filled = mk(n + 1, m + 1, false);
        for (let i = 0; i <= n; i++) filled[i][0] = true;
        for (let j = 0; j <= m; j++) filled[0][j] = true;
        const rowLabels = ['', ...a], colLabels = ['', ...b];
        const view = (cls, title = 'dp[i][j] = LCS of first i chars & first j chars') => ({
            type: 'grid', title, values: dp.map((row, r) => row.map((x, c) => (filled[r][c] ? x : ''))),
            cls, rowLabels, colLabels, corner: `${A}\\${B}`
        });
        const fillCls = () => { const c = {}; for (let r = 0; r <= n; r++) for (let k = 0; k <= m; k++) if (filled[r][k]) c[`${r},${k}`] = 'done'; return c; };
        const push = (note, cls, vars, changed) => frames.push({ note, views: [view(cls), { type: 'vars', title: 'variables', vars, changed: changed || [] }, ...(extraViews ? extraViews() : [])] });

        push(`Table is <code>(n+1) × (m+1) = ${n + 1} × ${m + 1}</code>, all 0. Row 0 / column 0 = an <b>empty prefix</b>, so LCS = 0 there (base case, no loop needed).`,
            fillCls(), { n, m });
        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                const cls = fillCls();
                let note;
                if (a[i - 1] === b[j - 1]) {
                    dp[i][j] = 1 + dp[i - 1][j - 1];
                    cls[`${i - 1},${j - 1}`] = 'dep';
                    note = `<code>${A}[${i - 1}] == ${B}[${j - 1}]</code> (${q(a[i - 1])}) → <b>match</b>: <code>dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}</code> (diagonal).`;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    cls[`${i - 1},${j}`] = 'dep'; cls[`${i},${j - 1}`] = 'dep';
                    note = `${q(a[i - 1])} ≠ ${q(b[j - 1])} → drop one char: <code>dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}</code> (top / left).`;
                }
                filled[i][j] = true;
                cls[`${i},${j}`] = 'cur';
                push(note, cls, { i, j, [`${A}[i-1]`]: q(a[i - 1]), [`${B}[j-1]`]: q(b[j - 1]), 'dp[i][j]': dp[i][j] }, ['dp[i][j]']);
            }
        }
        return { dp, view, n, m };
    }

    /* ---------------------------------------------------------------- p32 LCS */
    function lcsFrames(a, b) {
        const frames = [];
        const { dp, view, n, m } = lcsFill(a, b, 'text1', 'text2', frames);
        // reconstruction (not in the length-only code, but the standard follow-up)
        let i = n, j = m, lcs = '';
        const path = [];
        const pathCls = (cur, deps = []) => {
            const c = {};
            for (let r = 0; r <= n; r++) for (let k = 0; k <= m; k++) c[`${r},${k}`] = 'dim';
            path.forEach(([r, k]) => (c[`${r},${k}`] = 'path'));
            deps.forEach(([r, k]) => (c[`${r},${k}`] = 'dep'));
            if (cur) c[`${cur[0]},${cur[1]}`] = 'cur';
            return c;
        };
        const push = (note, cls, final) => frames.push({ note, final, views: [view(cls, 'Backtrack from dp[n][m]'), { type: 'vars', title: 'reconstruction', vars: { i, j, lcs: `"${lcs}"` }, changed: ['lcs'] }] });
        push(`Table done: <code>dp[${n}][${m}] = ${dp[n][m]}</code> is the length. To get the actual string, <b>walk back</b> from the bottom-right cell.`, pathCls([n, m]));
        while (i > 0 && j > 0) {
            path.push([i, j]);
            if (a[i - 1] === b[j - 1]) {
                lcs = a[i - 1] + lcs;
                push(`<code>text1[${i - 1}] == text2[${j - 1}]</code> (${q(a[i - 1])}) → this char is in the LCS. Prepend it and go <b>diagonal</b> to <code>dp[${i - 1}][${j - 1}]</code>.`, pathCls([i, j], [[i - 1, j - 1]]));
                i--; j--;
            } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                push(`Mismatch. <code>dp[${i - 1}][${j}] = ${dp[i - 1][j]} ≥ dp[${i}][${j - 1}] = ${dp[i][j - 1]}</code> → the value came from <b>above</b>; move up (skip ${q(a[i - 1])}).`, pathCls([i, j], [[i - 1, j]]));
                i--;
            } else {
                push(`Mismatch. <code>dp[${i}][${j - 1}] = ${dp[i][j - 1]} > dp[${i - 1}][${j}] = ${dp[i - 1][j]}</code> → the value came from the <b>left</b>; move left (skip ${q(b[j - 1])}).`, pathCls([i, j], [[i, j - 1]]));
                j--;
            }
        }
        path.push([i, j]);
        push(`Reached row/column 0. <b>Answer = dp[${n}][${m}] = ${dp[n][m]}</b>, one LCS is <b>"${lcs}"</b>.`, pathCls(null), true);
        return frames;
    }

    DryRun.register('p32', {
        title: 'Fill the LCS table cell by cell, then walk back to read the subsequence',
        legend: [['cur', 'cell being computed'], ['dep', 'cells it reads'], ['done', 'filled'], ['path', 'backtrack path']],
        insight: {
            pattern: '2-D string DP (two prefixes)',
            idea: [
                '<b>State:</b> <code>dp[i][j]</code> = LCS length of the first <code>i</code> chars of <code>text1</code> and the first <code>j</code> chars of <code>text2</code>.',
                '<b>Recurrence:</b> last chars equal → they can be matched together: <code>1 + dp[i-1][j-1]</code>. Otherwise one of them is useless: <code>max(dp[i-1][j], dp[i][j-1])</code>.',
                '<b>Base:</b> an empty prefix has LCS 0 → row 0 and column 0 are zeros (that is why the table is <code>(n+1)×(m+1)</code>).'
            ],
            traps: [
                'The table is 1-indexed but the strings are 0-indexed: compare <code>text1[i-1]</code> with <code>text2[j-1]</code>, not <code>text1[i]</code>.',
                'On a match do <b>not</b> also take <code>max</code> with top/left — the diagonal + 1 is always at least as good.',
                'Subsequence ≠ substring. For longest common <b>substring</b> reset to 0 on mismatch and take the max over all cells.'
            ],
            tips: [
                'Reconstruct by walking back: match → diagonal (take the char); else go towards the larger of top/left.',
                'Space O(min(n,m)): only the previous row is needed (keep <code>prev</code> and <code>cur</code> rows, or one row + a saved diagonal).',
                'O(n·m) time. Family: SCS (<code>n+m-LCS</code>), min insert/delete to convert (<code>n+m-2·LCS</code>), Longest Palindromic Subsequence (<code>LCS(s, reverse(s))</code>), Edit Distance.'
            ]
        },
        examples: [
            { label: '"abc" / "ac"', input: 'text1 = "abc", text2 = "ac"', frames: () => lcsFrames('abc', 'ac') },
            { label: '"abcde" / "ace"', input: 'text1 = "abcde", text2 = "ace"', frames: () => lcsFrames('abcde', 'ace') }
        ]
    });

    /* ---------------------------------------------------------------- p33 SCS */
    function scsFrames(s1, s2, remark) {
        const frames = [];
        let ans = '';
        const ansView = () => ({ type: 'array', title: 'ans (built backwards)', values: ans.split(''), cls: ans.length ? { [ans.length - 1]: 'cur' } : {} });
        const { dp, view, n, m } = lcsFill(s1, s2, 's1', 's2', frames);
        let i = n, j = m;
        const path = [];
        const pathCls = (cur, deps = []) => {
            const c = {};
            for (let r = 0; r <= n; r++) for (let k = 0; k <= m; k++) c[`${r},${k}`] = 'dim';
            path.forEach(([r, k]) => (c[`${r},${k}`] = 'path'));
            deps.forEach(([r, k]) => (c[`${r},${k}`] = 'dep'));
            if (cur) c[`${cur[0]},${cur[1]}`] = 'cur';
            return c;
        };
        const push = (note, cls, final, extra) => frames.push({ note, final, views: [view(cls, 'Step 2: backtrack'), { type: 'vars', title: 'variables', vars: { i, j, 'LCS len': dp[n][m], 'SCS len': n + m - dp[n][m] } }, ansView(), ...(extra || [])] });
        push(`Step 1 done: <code>LCS = dp[${n}][${m}] = ${dp[n][m]}</code>, so the SCS has length <code>${n} + ${m} − ${dp[n][m]} = ${n + m - dp[n][m]}</code>. Step 2: start at <code>i = n, j = m</code>.`, pathCls([n, m]));
        while (i > 0 && j > 0) {
            path.push([i, j]);
            if (s1[i - 1] === s2[j - 1]) {
                ans += s1[i - 1];
                push(`<code>s1[${i - 1}] == s2[${j - 1}]</code> (${q(s1[i - 1])}) → common char, write it <b>once</b>: <code>ans += ${q(s1[i - 1])}</code>, <code>i--, j--</code>.`, pathCls([i, j], [[i - 1, j - 1]]));
                i--; j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) {
                ans += s1[i - 1];
                push(`Mismatch, <code>dp[${i - 1}][${j}] = ${dp[i - 1][j]} > dp[${i}][${j - 1}] = ${dp[i][j - 1]}</code> → move up, leaving ${q(s1[i - 1])} of <code>s1</code> behind, so <code>ans += ${q(s1[i - 1])}</code>, <code>i--</code>.`, pathCls([i, j], [[i - 1, j]]));
                i--;
            } else {
                ans += s2[j - 1];
                push(`Mismatch, <code>dp[${i - 1}][${j}] = ${dp[i - 1][j]} ≤ dp[${i}][${j - 1}] = ${dp[i][j - 1]}</code> → <code>else</code> branch: move left, leaving ${q(s2[j - 1])} of <code>s2</code> behind, so <code>ans += ${q(s2[j - 1])}</code>, <code>j--</code>.`, pathCls([i, j], [[i, j - 1]]));
                j--;
            }
        }
        path.push([i, j]);
        if (i === 0 && j === 0) push(`Both indices hit 0 → the main loop ends with nothing left over.`, pathCls(null));
        while (i > 0) { ans += s1[i - 1]; push(`<code>j == 0</code>: <code>s2</code> is exhausted, copy the rest of <code>s1</code>: <code>ans += ${q(s1[i - 1])}</code>.`, pathCls([i, 0])); i--; }
        while (j > 0) { ans += s2[j - 1]; push(`<code>i == 0</code>: <code>s1</code> is exhausted, copy the rest of <code>s2</code>: <code>ans += ${q(s2[j - 1])}</code>.`, pathCls([0, j])); j--; }
        const built = ans;
        ans = ans.split('').reverse().join('');
        push(`<code>reverse(ans)</code>: "${built}" → <b>"${ans}"</b> (length ${ans.length} = ${n} + ${m} − ${dp[n][m]}). Both "${s1}" and "${s2}" are subsequences of it.` + (remark || ''), pathCls(null), true);
        return frames;
    }

    DryRun.register('p33', {
        title: 'LCS table, then backtrack to build the supersequence',
        legend: [['cur', 'current cell'], ['dep', 'cells read / next move'], ['done', 'filled'], ['path', 'backtrack path']],
        insight: {
            pattern: 'LCS table + reconstruction',
            idea: [
                'Characters of the LCS are shared, so they are written once; every other char of both strings must appear → <code>|SCS| = n + m − LCS</code>.',
                'The backtrack is the LCS backtrack, except that when you <b>skip</b> a char (move up or left) you still <b>emit</b> it.',
                'Both strings are walked from the end, so <code>ans</code> is built backwards and reversed once at the end.'
            ],
            traps: [
                'Forgetting the two "leftover" loops: when one index reaches 0, the remaining prefix of the other string must still be appended.',
                'Emit the char of the string you <b>leave</b>: moving up (<code>i--</code>) emits <code>s1[i-1]</code>, moving left (<code>j--</code>) emits <code>s2[j-1]</code>.',
                'Ties (<code>dp[i-1][j] == dp[i][j-1]</code>) can go either way; different tie rules give different but equally short answers — any is accepted on LeetCode.'
            ],
            tips: [
                'Use <code>string</code> + one <code>reverse</code> (O(n+m)) instead of inserting at the front (O((n+m)²)).',
                'If only the <b>length</b> is asked, no reconstruction needed: <code>n + m − dp[n][m]</code>.',
                'Same "walk back and emit" trick prints the LCS itself, the edit script of Edit Distance, or the path of any grid DP.'
            ]
        },
        input: 's1 = "brute", s2 = "groot"',
        frames: () => scsFrames('brute', 'groot', ' <i>("brute" has no <code>o</code>, so the LCS is "rt" (length 2), not "rot"; hence 8, not 7.)</i>')
    });

    /* ---------------------------------------------------------------- p40 Edit Distance */
    function editFrames(s1, s2) {
        const n = s1.length, m = s2.length, frames = [];
        const dp = mk(n + 1, m + 1, 0), filled = mk(n + 1, m + 1, false);
        const rowLabels = ['', ...s1], colLabels = ['', ...s2];
        const view = (cls, title = 'dp[i][j] = min ops: first i of s1 → first j of s2') => ({
            type: 'grid', title, values: dp.map((row, r) => row.map((x, c) => (filled[r][c] ? x : ''))), cls, rowLabels, colLabels, corner: 's1\\s2', wide: m > 5
        });
        const fillCls = () => { const c = {}; for (let r = 0; r <= n; r++) for (let k = 0; k <= m; k++) if (filled[r][k]) c[`${r},${k}`] = 'done'; return c; };
        const push = (note, cls, vars, changed, final, title) => frames.push({ note, final, views: [view(cls, title), { type: 'vars', title: 'variables', vars, changed: changed || [] }] });

        for (let i = 0; i <= n; i++) { dp[i][0] = i; filled[i][0] = true; }
        for (let j = 0; j <= m; j++) { dp[0][j] = j; filled[0][j] = true; }
        push(`Base cases: <code>dp[i][0] = i</code> (delete all <code>i</code> chars) and <code>dp[0][j] = j</code> (insert all <code>j</code> chars).`, fillCls(), { n, m });
        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                const cls = fillCls();
                let note;
                if (s1[i - 1] === s2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                    cls[`${i - 1},${j - 1}`] = 'dep';
                    note = `<code>s1[${i - 1}] == s2[${j - 1}]</code> (${q(s1[i - 1])}) → no operation needed: <code>dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${dp[i][j]}</code>.`;
                } else {
                    const d = dp[i - 1][j - 1], u = dp[i - 1][j], l = dp[i][j - 1];
                    dp[i][j] = 1 + Math.min(d, u, l);
                    cls[`${i - 1},${j - 1}`] = 'dep'; cls[`${i - 1},${j}`] = 'dep'; cls[`${i},${j - 1}`] = 'dep';
                    const which = d === Math.min(d, u, l) ? 'replace' : u === Math.min(d, u, l) ? 'delete' : 'insert';
                    note = `${q(s1[i - 1])} ≠ ${q(s2[j - 1])} → <code>1 + min(sub ${d}, del ${u}, ins ${l}) = ${dp[i][j]}</code> (best: <b>${which}</b>).`;
                }
                filled[i][j] = true;
                cls[`${i},${j}`] = 'cur';
                push(note, cls, { i, j, 's1[i-1]': q(s1[i - 1]), 's2[j-1]': q(s2[j - 1]), 'dp[i][j]': dp[i][j] }, ['dp[i][j]']);
            }
        }
        // walk back to list the operations
        const ops = [], path = [];
        const pathCls = cur => {
            const c = {};
            for (let r = 0; r <= n; r++) for (let k = 0; k <= m; k++) c[`${r},${k}`] = 'dim';
            path.forEach(([r, k]) => (c[`${r},${k}`] = 'path'));
            if (cur) c[`${cur[0]},${cur[1]}`] = 'cur';
            return c;
        };
        let i = n, j = m;
        const steps = [];
        while (i > 0 || j > 0) {
            path.push([i, j]);
            if (i > 0 && j > 0 && s1[i - 1] === s2[j - 1]) { i--; j--; continue; }
            if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) { steps.push(`replace ${q(s1[i - 1])}→${q(s2[j - 1])}`); i--; j--; }
            else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) { steps.push(`delete ${q(s1[i - 1])}`); i--; }
            else { steps.push(`insert ${q(s2[j - 1])}`); j--; }
        }
        path.push([0, 0]);
        ops.push(...steps.reverse());
        frames.push({
            note: `<b>Answer = dp[${n}][${m}] = ${dp[n][m]}</b>. Walking back (diagonal on a match, otherwise the neighbour that is exactly 1 smaller) gives the edits: ${ops.map(o => `<code>${o}</code>`).join(', ')}.`,
            final: true,
            views: [view(pathCls(null), 'Backtrack path'), { type: 'list', title: 'operations (in order)', kind: 'queue', items: ops }]
        });
        return frames;
    }

    DryRun.register('p40', {
        title: 'Fill the edit-distance table (tabulation)',
        legend: [['cur', 'cell being computed'], ['dep', 'diag / up / left it reads'], ['done', 'filled'], ['path', 'optimal edit path']],
        placeLast: true,
        insight: {
            pattern: '2-D string DP (Levenshtein)',
            idea: [
                '<b>State:</b> <code>dp[i][j]</code> = min operations to turn the first <code>i</code> chars of <code>s1</code> into the first <code>j</code> chars of <code>s2</code>.',
                'Last chars equal → free: <code>dp[i-1][j-1]</code>. Otherwise try the 3 ops on the last char: <b>replace</b> (↖ diag), <b>delete</b> from s1 (↑ up), <b>insert</b> into s1 (← left), and add 1.',
                '<b>Base:</b> <code>dp[i][0] = i</code> deletions, <code>dp[0][j] = j</code> insertions — not zeros like LCS!'
            ],
            traps: [
                'Initialising row/col 0 with 0 (copy-paste from LCS) gives wrong answers.',
                'In the recursive version the base cases are <code>i &lt; 0 → j+1</code> and <code>j &lt; 0 → i+1</code> (0-indexed); the table version shifts everything by one.',
                'Mixing up which neighbour is insert vs delete does not change the number, but it breaks the reconstructed edit script.'
            ],
            tips: [
                'Rolling rows: keep <code>prev</code> and <code>cur</code> (or one row + the old diagonal) → O(min(n,m)) memory.',
                'Only insert+delete allowed? Answer is <code>n + m − 2·LCS</code>.',
                'Related: One Edit Distance, Delete Operation for Two Strings (583), Min ASCII Delete Sum (712), Wildcard / Regex matching use the same 2-D layout.'
            ]
        },
        examples: [
            { label: 'kitten → sitting', input: 's1 = "KITTEN", s2 = "SITTING"', frames: () => editFrames('KITTEN', 'SITTING') },
            { label: 'horse → ros', input: 's1 = "horse", s2 = "ros"', frames: () => editFrames('horse', 'ros') }
        ]
    });

    /* ---------------------------------------------------------------- p42 Word Break */
    DryRun.register('p42', {
        title: 'dp[i]: can the first i characters be segmented?',
        input: 's = "ilikeapple", wordDict = {i, like, ice, cream, icecream, mobile, apple}',
        legend: [['cur', 'dp[i] being decided'], ['dep', 'dp[j] (left part)'], ['cmp', 's.substr(j, i-j)'], ['done', 'dp = true']],
        after: ':scope > blockquote', // right after the tabulation code + its exam tip
        insight: {
            pattern: '1-D DP over prefix positions',
            idea: [
                '<b>State:</b> <code>dp[i]</code> = the prefix <code>s[0..i-1]</code> can be split into dictionary words.',
                '<b>Transition:</b> <code>dp[i]</code> is true if some split <code>j &lt; i</code> has a valid left part (<code>dp[j]</code>) <b>and</b> the last piece <code>s[j..i-1]</code> is a word.',
                '<b>Base:</b> <code>dp[0] = true</code> (empty prefix). Answer: <code>dp[n]</code>.'
            ],
            traps: [
                '<code>substr(j, i - j)</code> takes a <b>length</b>, not an end index.',
                'Check <code>dp[j]</code> first — the short-circuit skips the costly substring + hash lookup most of the time.',
                'Forgetting <code>break</code> is not a bug, just slower; forgetting <code>dp[0] = true</code> makes everything false.'
            ],
            tips: [
                'Speed-up: only try <code>j ≥ i − maxWordLen</code> → O(n · L²) instead of O(n³).',
                'For Word Break II (all sentences) store, for each <code>i</code>, the list of valid <code>j</code>s and DFS back from <code>n</code>.',
                'A Trie walk forward from every true <code>dp[j]</code> avoids building substrings at all.'
            ]
        },
        frames() {
            const s = 'ilikeapple', dictArr = ['i', 'like', 'ice', 'cream', 'icecream', 'mobile', 'apple'];
            const dict = new Set(dictArr), n = s.length;
            const dp = Array(n + 1).fill(false);
            dp[0] = true;
            const frames = [];
            const snap = (note, i, j, extra = {}) => {
                const dcls = {}, scls = {};
                dp.forEach((v, k) => v && (dcls[k] = 'done'));
                if (j !== null && j !== undefined) { dcls[j] = 'dep'; for (let k = j; k < i; k++) scls[k] = 'cmp'; }
                if (i !== null && i !== undefined) dcls[i] = 'cur';
                const part = extra.part;
                frames.push({
                    note, final: extra.final,
                    views: [
                        { type: 'array', title: 's', values: s.split(''), cls: scls, wide: true },
                        { type: 'array', title: 'dp[0..n]', values: dp.map(v => (v ? 'T' : 'F')), cls: dcls, pointers: Object.assign({}, i != null ? { i } : {}, j != null ? { j } : {}), wide: true },
                        { type: 'vars', title: 'variables', vars: { i: i ?? '-', j: j ?? '-', 'dp[j]': j != null ? (dp[j] ? 'true' : 'false') : '-', 's.substr(j,i-j)': part !== undefined ? `"${part}"` : '-', 'in dict?': extra.hit === undefined ? '-' : extra.hit ? 'yes' : 'no' }, changed: extra.changed || [] },
                        { type: 'list', title: 'dict', kind: 'set', markHead: false, items: dictArr, cls: extra.word !== undefined ? { [dictArr.indexOf(extra.word)]: 'cur' } : {} }
                    ]
                });
            };
            snap('<code>dp[0] = true</code>: the empty prefix is always segmentable. Everything else starts <code>false</code>.', 0, null);
            for (let i = 1; i <= n; i++) {
                let lastJ = -1;
                const tried = [];
                for (let j = 0; j < i; j++) {
                    if (!dp[j]) continue; // short-circuit: substr is never built
                    lastJ = j;
                    const part = s.substr(j, i - j);
                    const hit = dict.has(part);
                    tried.push(j);
                    if (hit) {
                        dp[i] = true;
                        snap(`<code>i = ${i}</code>, <code>j = ${j}</code>: <code>dp[${j}]</code> is true and <code>"${part}"</code> is in the dictionary → <code>dp[${i}] = true</code>, <code>break</code>.`, i, j, { part, hit, word: part, changed: ['in dict?'] });
                        break;
                    }
                    // is this the last j with dp[j] true?
                    let more = false;
                    for (let k = j + 1; k < i; k++) if (dp[k]) more = true;
                    snap(`<code>i = ${i}</code>, <code>j = ${j}</code>: <code>dp[${j}]</code> true but <code>"${part}"</code> is not a word.` + (more ? '' : ` No other <code>j</code> has <code>dp[j]</code> true (the rest short-circuit on <code>dp[j] == false</code>) → <code>dp[${i}]</code> stays <b>false</b>.`), i, j, { part, hit });
                }
                if (lastJ < 0) snap(`<code>i = ${i}</code>: no <code>j</code> with <code>dp[j]</code> true → <code>dp[${i}] = false</code>.`, i, null);
            }
            snap(`Loop finished. <b>Answer = dp[${n}] = ${dp[n]}</b> → "ilikeapple" = "i" + "like" + "apple".`, n, null, { final: true });
            return frames;
        }
    });

    /* ---------------------------------------------------------------- p41 Rod Cutting */
    DryRun.register('p41', {
        title: 'Rod cutting tabulation: dp[j] = best first cut i + dp[j-i]',
        input: 'price = [1, 5, 8, 9, 10, 16, 18, 20], n = 8',
        legend: [['cur', 'dp[j] being computed'], ['dep', 'dp[j-i] reused'], ['cmp', 'price[i-1] of first piece'], ['path', 'reconstructed pieces']],
        placeLast: true,
        insight: {
            pattern: 'Unbounded knapsack (1-D)',
            idea: [
                '<b>State:</b> <code>dp[j]</code> = max revenue from a rod of length <code>j</code>.',
                '<b>Transition:</b> the first piece has some length <code>i</code> (1..j); the rest is an optimal rod of length <code>j−i</code>: <code>dp[j] = max(price[i-1] + dp[j-i])</code>.',
                'Store the winning <code>i</code> in <code>cut[j]</code> to rebuild the pieces: <code>n → n − cut[n] → …</code>.'
            ],
            traps: [
                '<code>price</code> is 0-indexed: a piece of length <code>i</code> sells for <code>price[i-1]</code>.',
                'Strict <code>&lt;</code> keeps the <b>first</b> best <code>i</code> on ties (e.g. <code>cut[8] = 2</code>, not 3 or 6); any of them is optimal.',
                'Brute recursion is O(2ⁿ) — memoize or tabulate.'
            ],
            tips: [
                'Same shape as Unbounded Knapsack with weight = length, value = price, capacity = n; loops can also be "items outer, capacity inner".',
                'O(n²) time, O(n) space.',
                'Variants: cost per cut (subtract c when <code>i &lt; j</code>), only allowed lengths (iterate over those), Integer Break (343), Coin Change.'
            ]
        },
        frames() {
            const price = [1, 5, 8, 9, 10, 16, 18, 20], n = 8;
            const dp = Array(n + 1).fill(0), cut = Array(n + 1).fill(0);
            const frames = [];
            const snap = (note, j, i, vars = {}, changed = [], extra = {}) => {
                const pc = {}, dc = {}, cc = {};
                if (i) pc[i - 1] = 'cmp';
                for (let k = 0; k < (j ?? -1); k++) dc[k] = 'done';
                if (j != null && i) dc[j - i] = 'dep';
                if (j != null) dc[j] = 'cur';
                (extra.path || []).forEach(k => (dc[k] = 'path', cc[k] = 'path'));
                frames.push({
                    note, final: extra.final,
                    views: [
                        { type: 'array', title: 'price[] (piece length = index+1)', values: price, cls: pc, labels: price.map((_, k) => `len ${k + 1}`) },
                        { type: 'array', title: 'dp[] (best revenue for length)', values: dp.slice(), cls: dc },
                        { type: 'array', title: 'cut[] (first piece used)', values: cut.slice(), cls: cc },
                        { type: 'vars', title: 'variables', vars, changed }
                    ]
                });
            };
            snap('<code>dp[0] = 0</code>: a rod of length 0 earns nothing. Compute <code>dp[1..8]</code> left to right.', null, 0, {});
            for (let j = 1; j <= n; j++) {
                let max_val = -Infinity;
                for (let i = 1; i <= j; i++) {
                    const cand = price[i - 1] + dp[j - i];
                    let note = `<code>j = ${j}, i = ${i}</code>: first piece of length ${i} → <code>price[${i - 1}] + dp[${j - i}] = ${price[i - 1]} + ${dp[j - i]} = ${cand}</code>`;
                    const changed = [];
                    if (max_val < cand) {
                        max_val = cand; cut[j] = i; changed.push('max_val', 'cut[j]');
                        note += ` &gt; old max → <code>max_val = ${cand}</code>, <code>cut[${j}] = ${i}</code>.`;
                    } else note += cand === max_val ? ` = max_val (tie, strict <code>&lt;</code> keeps the old cut).` : ` &lt; ${max_val}, no change.`;
                    if (i === j) { dp[j] = max_val; changed.push('dp[j]'); note += ` Done: <b><code>dp[${j}] = ${max_val}</code></b>.`; }
                    snap(note, j, i, { j, i, candidate: cand, max_val, 'cut[j]': cut[j] }, changed);
                }
            }
            const pieces = [], path = [];
            let rem = n;
            while (rem > 0) {
                path.push(rem);
                pieces.push(cut[rem]);
                snap(`Reconstruct: <code>cut[${rem}] = ${cut[rem]}</code> → sell a piece of length ${cut[rem]} (${price[cut[rem] - 1]}), remaining <code>${rem} − ${cut[rem]} = ${rem - cut[rem]}</code>.`, null, cut[rem], { remaining: rem - cut[rem], pieces: `{${pieces.join(', ')}}` }, ['pieces'], { path: path.slice() });
                rem -= cut[rem];
            }
            snap(`<b>Answer = dp[${n}] = ${dp[n]}</b>, pieces {${pieces.join(', ')}} → ${pieces.map(p => price[p - 1]).join(' + ')} = ${dp[n]}.`, null, 0, { 'dp[n]': dp[n], pieces: `{${pieces.join(', ')}}` }, [], { path, final: true });
            return frames;
        }
    });

    /* ---------------------------------------------------------------- p39 Coin Change II */
    DryRun.register('p39', {
        title: 'Count combinations: one pass over dp[] per coin',
        input: 'coins = [1, 5, 6, 8], amount = 13',
        legend: [['cur', 'dp[j] += …'], ['dep', 'dp[j - coins[i]]'], ['pivot', 'current coin'], ['done', 'coins finished']],
        placeLast: true,
        insight: {
            pattern: 'Unbounded knapsack — counting combinations',
            idea: [
                '<b>State:</b> after processing coins <code>0..i</code>, <code>dp[j]</code> = number of ways to make <code>j</code> using only those coins.',
                '<code>dp[j] += dp[j − c]</code>: old <code>dp[j]</code> = ways <b>without</b> coin <code>c</code>, <code>dp[j−c]</code> (already updated this pass) = ways using <b>at least one more</b> <code>c</code>.',
                '<b>Base:</b> <code>dp[0] = 1</code> — one way to pay 0: take nothing.'
            ],
            traps: [
                '<b>Loop order matters!</b> Coins outer / amount inner counts <b>combinations</b> (1+5 = 5+1). Amount outer / coins inner counts <b>permutations</b> (Combination Sum IV).',
                'Inner loop goes <b>upwards</b> (<code>j = c..amount</code>) so a coin can be reused; going downwards turns it into 0/1 knapsack (each coin once).',
                'Counts overflow quickly — use <code>long long</code> / mod if asked.'
            ],
            tips: [
                'The 2-D version <code>dp[i][j] = dp[i-1][j] + dp[i][j-c]</code> collapses to this 1-D array because row <code>i</code> only reads row <code>i-1</code> (same index) and itself.',
                'O(n · amount) time, O(amount) space.',
                'Min coins (Coin Change I, 322) uses the same loops with <code>dp[j] = min(dp[j], dp[j-c] + 1)</code> and <code>dp[0]=0</code>, rest = ∞.'
            ]
        },
        frames() {
            const coins = [1, 5, 6, 8], amount = 13, n = coins.length;
            const dp = Array(amount + 1).fill(0);
            dp[0] = 1;
            const frames = [];
            const snap = (note, i, j, vars, changed = [], final) => {
                const cc = {}, dc = {};
                for (let k = 0; k < n; k++) cc[k] = k < i ? 'done' : k === i ? 'pivot' : '';
                if (j != null) { dc[j] = 'cur'; dc[j - coins[i]] = 'dep'; }
                frames.push({
                    note, final,
                    views: [
                        { type: 'array', title: 'coins[]', values: coins, cls: cc },
                        { type: 'array', title: 'dp[0..amount] (ways)', values: dp.slice(), cls: dc, pointers: j != null ? { j, 'j-c': j - coins[i] } : {}, wide: true },
                        { type: 'vars', title: 'variables', vars, changed }
                    ]
                });
            };
            snap('<code>dp[0] = 1</code> (pay 0 by taking nothing); every other amount has 0 ways before any coin is used.', -1, null, { amount });
            for (let i = 0; i < n; i++) {
                const c = coins[i];
                snap(`Coin <code>coins[${i}] = ${c}</code>: sweep <code>j = ${c}..${amount}</code> upwards. Amounts below ${c} keep their old counts.`, i, null, { i, 'coins[i]': c });
                for (let j = c; j <= amount; j++) {
                    const old = dp[j];
                    dp[j] += dp[j - c];
                    snap(`<code>dp[${j}] += dp[${j} − ${c}]</code> → <code>${old} + ${dp[j - c]} = ${dp[j]}</code>` + (c === 1 ? ' (only 1s: exactly one way).' : `: ${old} way(s) without coin ${c} + ${dp[j - c]} way(s) ending with a ${c}.`), i, j, { i, 'coins[i]': c, j, 'dp[j]': dp[j] }, ['dp[j]']);
                }
            }
            snap(`All coins processed. <b>Answer = dp[${amount}] = ${dp[amount]}</b> ways. Final dp = [${dp.join(', ')}].`, n, null, { 'dp[amount]': dp[amount] }, [], true);
            return frames;
        }
    });

    /* ---------------------------------------------------------------- p37 Matrix Chain Multiplication */
    function mcmFrames(arr) {
        const n = arr.length, frames = [];
        const BIG = Infinity;
        const dp = mk(n, n, 0), split = mk(n, n, 0), filled = mk(n, n, false);
        for (let i = 1; i < n; i++) filled[i][i] = true;
        const labels = Array.from({ length: n - 1 }, (_, k) => `A${k + 1}`);
        const vals = M => M.slice(1).map((row, r) => row.slice(1).map((x, c) => (r > c ? '–' : filled[r + 1][c + 1] ? (x === BIG ? '∞' : fmtNum(x)) : '')));
        const grid = (cls, title) => ({ type: 'grid', title, values: vals(dp), cls, rowLabels: labels, colLabels: labels, corner: 'i\\j' });
        const sgrid = cls => ({ type: 'grid', title: 'best split k (extra, for parenthesising)', values: split.slice(1).map((row, r) => row.slice(1).map((x, c) => (r >= c || !filled[r + 1][c + 1] ? '' : x))), cls, rowLabels: labels, colLabels: labels, corner: 'i\\j' });
        const baseCls = () => { const c = {}; for (let r = 1; r < n; r++) for (let k = r; k < n; k++) if (filled[r][k]) c[`${r - 1},${k - 1}`] = 'done'; return c; };
        const dims = { type: 'array', title: 'arr[] (A_k is arr[k-1] × arr[k])', values: arr };
        const push = (note, cls, vars, changed, final, scls, dcls) => frames.push({ note, final, views: [grid(cls, 'dp[i][j] = min cost of A_i … A_j'), sgrid(scls || {}), Object.assign({}, dims, { cls: dcls || {} }), { type: 'vars', title: 'variables', vars, changed: changed || [] }] });

        push(`<code>n = arr.size() = ${n}</code> → ${n - 1} matrices. Diagonal <code>dp[i][i] = 0</code>: one matrix needs no multiplication.`, baseCls(), { n });
        for (let len = 2; len < n; len++) {
            for (let i = 1; i + len - 1 < n; i++) {
                const j = i + len - 1;
                dp[i][j] = BIG;
                for (let k = i; k < j; k++) {
                    const cost = dp[i][k] + dp[k + 1][j] + arr[i - 1] * arr[k] * arr[j];
                    const better = cost < dp[i][j];
                    const old = dp[i][j];
                    dp[i][j] = Math.min(dp[i][j], cost);
                    if (better) split[i][j] = k;
                    const lastK = k === j - 1;
                    if (lastK) filled[i][j] = true;
                    const cls = baseCls();
                    cls[`${i - 1},${k - 1}`] = 'dep'; cls[`${k},${j - 1}`] = 'dep'; cls[`${i - 1},${j - 1}`] = 'cur';
                    let note = `<code>len = ${len}</code>, <code>dp[${i}][${j}]</code>, split <code>k = ${k}</code>: (A${i}..A${k})(A${k + 1}..A${j}) → <code>dp[${i}][${k}] + dp[${k + 1}][${j}] + arr[${i - 1}]·arr[${k}]·arr[${j}] = ${fmtNum(dp[i][k])} + ${fmtNum(dp[k + 1][j])} + ${arr[i - 1]}·${arr[k]}·${arr[j]} = <b>${fmtNum(cost)}</b></code>`;
                    note += better ? (old === BIG ? '.' : ` &lt; ${fmtNum(old)} → new best.`) : ` ≥ ${fmtNum(old)}, keep.`;
                    if (lastK) note += ` Final <code>dp[${i}][${j}] = ${fmtNum(dp[i][j])}</code>.`;
                    push(note, cls, { len, i, j, k, cost: fmtNum(cost), 'dp[i][j]': lastK || dp[i][j] !== BIG ? fmtNum(dp[i][j]) : '∞' }, ['cost', 'dp[i][j]'], false,
                        { [`${i - 1},${j - 1}`]: 'cur' }, { [i - 1]: 'cmp', [k]: 'pivot', [j]: 'cmp' });
                }
            }
        }
        const paren = (i, j) => (i === j ? `A${i}` : `(${paren(i, split[i][j])}·${paren(split[i][j] + 1, j)})`);
        const fc = baseCls(); fc[`0,${n - 2}`] = 'path';
        push(`<b>Answer = dp[1][${n - 1}] = ${fmtNum(dp[1][n - 1])}</b> scalar multiplications, order <code>${paren(1, n - 1)}</code> (read from the split table).`, fc, { 'dp[1][n-1]': fmtNum(dp[1][n - 1]), order: paren(1, n - 1) }, [], true, { [`0,${n - 2}`]: 'path' });
        return frames;
    }

    DryRun.register('p37', {
        title: 'MCM: fill dp[i][j] by increasing chain length',
        legend: [['cur', 'dp[i][j] being computed'], ['dep', 'dp[i][k] and dp[k+1][j]'], ['done', 'final'], ['pivot', 'arr[k] (split dim)']],
        placeLast: true,
        insight: {
            pattern: 'Interval DP (partition DP)',
            idea: [
                '<b>State:</b> <code>dp[i][j]</code> = min scalar multiplications to compute <code>A_i·…·A_j</code>, where <code>A_k</code> is <code>arr[k-1] × arr[k]</code>.',
                '<b>Transition:</b> the <b>last</b> multiplication splits the chain at some <code>k</code>: <code>dp[i][k] + dp[k+1][j] + arr[i-1]·arr[k]·arr[j]</code>; take the min over <code>k = i..j-1</code>.',
                'Fill by <b>chain length</b> so both halves (shorter intervals) are already final when you need them.'
            ],
            traps: [
                'With <code>n = arr.size()</code> there are only <code>n − 1</code> matrices → answer is <code>dp[1][n-1]</code>, not <code>dp[0][n-1]</code>.',
                'Looping <code>i</code> then <code>j</code> row by row reads cells that are not computed yet — iterate by length (or <code>i</code> from n-1 down to 1, <code>j</code> upwards).',
                'Products like 10⁴·10⁴·10⁴ overflow <code>int</code>; use <code>long long</code> and <code>LLONG_MAX</code>.'
            ],
            tips: [
                'Keep <code>split[i][j] = k</code> to print the parenthesisation recursively.',
                'O(n³) time, O(n²) space. Same template: Burst Balloons (312), Min Cost to Cut a Stick (1547), Optimal BST, Palindrome Partitioning II.',
                '<b>Strassen</b> is unrelated to MCM: it multiplies two n×n matrices with 7 instead of 8 half-size products, T(n) = 7T(n/2) + O(n²) = O(n<sup>log₂7</sup>) ≈ O(n<sup>2.81</sup>) (Master theorem, case 1). MCM decides the <i>order</i>; Strassen speeds up each product.'
            ]
        },
        examples: [
            { label: '[10, 20, 30, 40]', input: 'arr = [10, 20, 30, 40]  (A1 10×20, A2 20×30, A3 30×40)', frames: () => mcmFrames([10, 20, 30, 40]) },
            { label: '[40, 20, 30, 10, 30]', input: 'arr = [40, 20, 30, 10, 30]  (4 matrices)', frames: () => mcmFrames([40, 20, 30, 10, 30]) }
        ]
    });

    /* ---------------------------------------------------------------- shared: 0/1 knapsack table */
    // items: [{name, cost, val}], W, unit formatting; fixes: {'i,w': 'html remark'} for cells where the page's table differs
    function knapsackFrames({ items, W, unitNote, fmt = x => x, fixes = {}, rowName = 'item', answerFmt }) {
        const n = items.length, frames = [];
        const dp = mk(n + 1, W + 1, 0), filled = mk(n + 1, W + 1, false);
        for (let w = 0; w <= W; w++) filled[0][w] = true;
        const rowLabels = ['0 (none)', ...items.map(it => `${it.name} (${it.cost}, ${it.val})`)];
        const colLabels = Array.from({ length: W + 1 }, (_, w) => String(w));
        const view = (cls, title = 'dp[i][w] = best value using first i, budget w') => ({
            type: 'grid', title, values: dp.map((row, r) => row.map((x, c) => (filled[r][c] ? fmt(x) : ''))), cls, rowLabels, colLabels, corner: 'i \\ w', wide: true
        });
        const fillCls = () => { const c = {}; for (let r = 0; r <= n; r++) for (let k = 0; k <= W; k++) if (filled[r][k]) c[`${r},${k}`] = 'done'; return c; };
        const push = (note, cls, vars, changed, final, extra) => frames.push({ note, final, views: [view(cls, extra && extra.title), { type: 'vars', title: 'variables', vars, changed: changed || [] }, ...((extra && extra.views) || [])] });

        push(`Row 0: no ${rowName}s → value 0 for every budget. ${unitNote || ''}`, fillCls(), { n, W });
        for (let i = 1; i <= n; i++) {
            const { name, cost, val } = items[i - 1];
            // budgets where the item does not fit: copy from above in one step
            const lim = Math.min(cost - 1, W);
            for (let w = 0; w <= lim; w++) { dp[i][w] = dp[i - 1][w]; filled[i][w] = true; }
            const c0 = fillCls();
            for (let w = 0; w <= lim; w++) { c0[`${i},${w}`] = 'cur'; c0[`${i - 1},${w}`] = 'dep'; }
            push(`<b>${name}</b> costs ${cost}: for <code>w = 0..${lim}</code> it does not fit → copy the row above (<code>dp[${i}][w] = dp[${i - 1}][w]</code>).`, c0, { i, [rowName]: name, cost, value: fmt(val) });
            for (let w = cost; w <= W; w++) {
                const skip = dp[i - 1][w], take = val + dp[i - 1][w - cost];
                dp[i][w] = Math.max(skip, take);
                filled[i][w] = true;
                const cls = fillCls();
                cls[`${i - 1},${w}`] = 'dep'; cls[`${i - 1},${w - cost}`] = 'dep'; cls[`${i},${w}`] = 'cur';
                let note = `<code>w = ${w}</code>: skip ${name} → <code>dp[${i - 1}][${w}] = ${fmt(skip)}</code>; take ${name} → <code>${fmt(val)} + dp[${i - 1}][${w - cost}] = ${fmt(take)}</code>. <code>dp[${i}][${w}] = ${fmt(dp[i][w])}</code> (${take > skip ? '<b>take</b>' : 'skip'}).`;
                if (fixes[`${i},${w}`]) note += ` <i>${fixes[`${i},${w}`]}</i>`;
                push(note, cls, { i, [rowName]: name, w, skip: fmt(skip), take: fmt(take), 'dp[i][w]': fmt(dp[i][w]) }, ['dp[i][w]']);
            }
        }
        // backtrack
        const path = [], chosen = [];
        let w = W;
        const pc = cur => { const c = {}; for (let r = 0; r <= n; r++) for (let k = 0; k <= W; k++) c[`${r},${k}`] = 'dim'; path.forEach(([r, k]) => (c[`${r},${k}`] = 'path')); if (cur) c[`${cur[0]},${cur[1]}`] = 'cur'; return c; };
        for (let i = n; i >= 1; i--) {
            path.push([i, w]);
            const it = items[i - 1];
            const cls = pc([i, w]); cls[`${i - 1},${w}`] = 'dep';
            if (dp[i][w] !== dp[i - 1][w]) {
                chosen.unshift(it.name);
                push(`Backtrack: <code>dp[${i}][${w}] = ${fmt(dp[i][w])} ≠ dp[${i - 1}][${w}] = ${fmt(dp[i - 1][w])}</code> → <b>${it.name} is taken</b>; budget <code>${w} − ${it.cost} = ${w - it.cost}</code>.`, cls, { i, w, chosen: chosen.join(', ') || '-' }, ['chosen'], false, { title: 'Backtrack' });
                w -= it.cost;
            } else {
                push(`Backtrack: <code>dp[${i}][${w}] = dp[${i - 1}][${w}] = ${fmt(dp[i][w])}</code> → ${it.name} is <b>not</b> taken; move up.`, cls, { i, w, chosen: chosen.join(', ') || '-' }, [], false, { title: 'Backtrack' });
            }
        }
        path.push([0, w]);
        const used = items.filter(it => chosen.includes(it.name)).reduce((s, it) => s + it.cost, 0);
        push(answerFmt(dp[n][W], chosen, used), pc(null), { 'dp[n][W]': fmt(dp[n][W]), chosen: chosen.join(', '), 'budget used': used }, [], true, { title: 'Optimal selection' });
        return frames;
    }

    const knapInsight = (extraIdea, extraTips) => ({
        pattern: '0/1 Knapsack',
        idea: [
            '<b>State:</b> <code>dp[i][w]</code> = best total value using only the first <code>i</code> items with budget <code>w</code>.',
            '<b>Choice per item:</b> skip it (<code>dp[i-1][w]</code>) or take it once (<code>value + dp[i-1][w − cost]</code>, only if it fits).',
            ...(extraIdea || [])
        ],
        traps: [
            'Rows are 1-indexed: row <code>i</code> uses item <code>i−1</code> of the 0-indexed arrays.',
            'Take reads the <b>previous</b> row (<code>dp[i-1]</code>) — reading the current row would allow taking the same item twice (that is unbounded knapsack).',
            'Greedy by value/cost ratio is <b>wrong</b> for 0/1 (it only works for fractional knapsack).'
        ],
        tips: [
            '1-D optimisation: one array, loop <code>w</code> from <b>W down to cost</b> (downwards keeps items single-use).',
            'Reconstruct: walk up from <code>dp[n][W]</code>; if the value changes between row <code>i</code> and <code>i−1</code>, item <code>i</code> was taken → subtract its cost.',
            'O(n·W) time — pseudo-polynomial: scale money to units (e.g. $100k) to keep <code>W</code> small.',
            ...(extraTips || [])
        ]
    });

    /* ---------------------------------------------------------------- p34 Investment case study */
    DryRun.register('p34', {
        title: '0/1 knapsack over 4 projects, budget 10 (× $100k)',
        after: '.dp-table',
        insightAfter: '.problem-desc',
        input: 'A (4, 6)  B (3, 4)  C (5, 8)  D (2, 2.5)   — (cost, profit) in $100k, capacity 10',
        legend: [['cur', 'cell being computed'], ['dep', 'skip / take source'], ['done', 'filled'], ['path', 'backtrack path']],
        insight: knapInsight(['Here: item = project, cost = investment, value = profit, capacity = $1M = 10 units of $100k.'],
            ['Profits like 2.5 are fine as <code>double</code> here, but in contests scale them to integers (×10) to avoid floating-point comparisons in the backtrack.']),
        frames: () => knapsackFrames({
            items: [{ name: 'A', cost: 4, val: 6 }, { name: 'B', cost: 3, val: 4 }, { name: 'C', cost: 5, val: 8 }, { name: 'D', cost: 2, val: 2.5 }],
            W: 10, rowName: 'project',
            unitNote: 'Money is in units of $100k, so the capacity is 10.',
            fixes: {
                '4,7': '(The table on this page shows 10 here, but taking D gives 2.5 + dp[3][5] = 2.5 + 8 = 10.5.)',
                '4,5': '(One copy of the table on this page shows 6.5 here; the max is 8.)',
                '4,9': '(The table on this page shows 12.5 here, but <code>max(14, 12.5) = 14</code> — A + C fits in budget 9.)'
            },
            answerFmt: (v, ch, used) => `<b>Answer = ${v} → $${(v * 100000).toLocaleString('en-US')}</b> profit with projects <b>${ch.join(', ')}</b>, investing $${(used * 100000).toLocaleString('en-US')}.`
        })
    });

    /* ---------------------------------------------------------------- p43 Course selection */
    DryRun.register('p43', {
        title: '0/1 knapsack: credits vs. weekly study hours (W = 8)',
        after: '.course-table',
        input: 'C1 (2h, 6)  C2 (3h, 10)  C3 (4h, 12)  C4 (5h, 18)   — (hours, credits), W = 8',
        legend: [['cur', 'cell being computed'], ['dep', 'skip / take source'], ['done', 'filled'], ['path', 'backtrack path']],
        insight: knapInsight(['Here: item = course, weight = study hours, value = credits, capacity = 8 hours.']),
        frames: () => knapsackFrames({
            items: [{ name: 'C1', cost: 2, val: 6 }, { name: 'C2', cost: 3, val: 10 }, { name: 'C3', cost: 4, val: 12 }, { name: 'C4', cost: 5, val: 18 }],
            W: 8, rowName: 'course',
            fixes: { '4,7': '(The summary table on this page shows 22 here, but taking C4 + C1 gives 18 + 6 = 24.)' },
            answerFmt: (v, ch, used) => `<b>Answer = dp[4][8] = ${v} credits</b> with courses <b>${ch.join(' + ')}</b> (${used} hours).`
        })
    });

    /* ---------------------------------------------------------------- p35 R&D portfolio (group knapsack) */
    DryRun.register('p35', {
        title: 'Group knapsack: pick at most one option per group',
        after: '.dp-table',
        insightAfter: '.problem-desc',
        input: 'G1 {A (3,7), A+D (4,10)}  G2 {B (2,5), B+C (6,14)}  G3 {E (5,11), F (3,8)}  — (cost, value) $M, budget 10',
        legend: [['cur', 'cell being computed'], ['dep', 'dp[g-1][cap − option cost]'], ['done', 'filled'], ['path', 'backtrack path']],
        insight: {
            pattern: 'Group (multiple-choice) knapsack',
            idea: [
                '<b>Model the constraints as groups:</b> "D requires A" → the only legal combos are {none, A, A+D}; "C requires B" → {none, B, B+C}; "E xor F" → {none, E, F}. Groups are independent of each other.',
                '<b>State:</b> <code>dp[g][cap]</code> = best value from the first <code>g</code> groups with budget <code>cap</code>.',
                '<b>Transition:</b> choose exactly one option of group <code>g</code> (including "none"): <code>max over options (val + dp[g-1][cap − cost])</code>.'
            ],
            traps: [
                'Treating projects as independent items lets the DP pick D without A or E together with F.',
                'An option like A+D must use the <b>combined</b> cost/value (4, 10), and D alone is <b>not</b> an option.',
                'Read from row <code>g−1</code> only, otherwise two options of the same group could both be chosen.'
            ],
            tips: [
                'Complexity O(W · total options). With a 1-D array, loop <code>cap</code> downward and try all options of the group inside.',
                'Dependency <b>trees</b> (an item needs its parent) generalise to tree knapsack: <code>dp[node][cap]</code> merged over children.',
                'Ties: prefer "none" in the backtrack to spend the least money for the same value.'
            ]
        },
        frames() {
            const groups = [
                { name: 'G1 (A/AD)', opts: [{ n: 'none', c: 0, v: 0 }, { n: 'A', c: 3, v: 7 }, { n: 'A+D', c: 4, v: 10 }] },
                { name: 'G2 (B/BC)', opts: [{ n: 'none', c: 0, v: 0 }, { n: 'B', c: 2, v: 5 }, { n: 'B+C', c: 6, v: 14 }] },
                { name: 'G3 (E/F)', opts: [{ n: 'none', c: 0, v: 0 }, { n: 'E', c: 5, v: 11 }, { n: 'F', c: 3, v: 8 }] }
            ];
            const W = 10, G = groups.length, frames = [];
            const dp = mk(G + 1, W + 1, 0), filled = mk(G + 1, W + 1, false);
            for (let w = 0; w <= W; w++) filled[0][w] = true;
            const fixes = { '3,7': '(The final table on this page shows 15 here, but F + dp[G2][4] = 8 + 10 = 18, i.e. A+D and F.)' };
            const view = (cls, title = 'dp[g][cap]') => ({ type: 'grid', title, values: dp.map((row, r) => row.map((x, c) => (filled[r][c] ? x : ''))), cls, rowLabels: ['Base', ...groups.map(g => g.name)], colLabels: Array.from({ length: W + 1 }, (_, k) => String(k)), corner: 'g \\ cap', wide: true });
            const fillCls = () => { const c = {}; for (let r = 0; r <= G; r++) for (let k = 0; k <= W; k++) if (filled[r][k]) c[`${r},${k}`] = 'done'; return c; };
            const push = (note, cls, items, icls, final, title) => frames.push({ note, final, views: [view(cls, title), { type: 'list', title: 'options tried (value + dp[g-1][cap-cost])', kind: 'set', markHead: false, items, cls: icls || {} }] });
            push('Base row: no groups → value 0. Each group offers its legal combinations (dependencies and exclusions are already baked in).', fillCls(), groups.map(g => `${g.name}: ${g.opts.map(o => `${o.n}(${o.c},${o.v})`).join(' ')}`));
            for (let g = 1; g <= G; g++) {
                for (let cap = 0; cap <= W; cap++) {
                    const cands = [];
                    let best = -1, bi = 0;
                    groups[g - 1].opts.forEach(o => {
                        if (o.c <= cap) {
                            const val = o.v + dp[g - 1][cap - o.c];
                            cands.push({ o, val });
                            if (val > best) { best = val; bi = cands.length - 1; }
                        }
                    });
                    dp[g][cap] = best;
                    filled[g][cap] = true;
                    const cls = fillCls();
                    cands.forEach(({ o }) => (cls[`${g - 1},${cap - o.c}`] = 'dep'));
                    cls[`${g},${cap}`] = 'cur';
                    let note = `<code>dp[${g}][${cap}] = max(${cands.map(({ o, val }) => (o.c ? `${o.v} + ${dp[g - 1][cap - o.c]}` : `${val}`)).join(', ')}) = ${best}</code>` + (cands.length < groups[g - 1].opts.length ? ` (options costing more than ${cap} don't fit)` : '') + ` → <b>${cands[bi].o.n}</b>.`;
                    if (fixes[`${g},${cap}`]) note += ` <i>${fixes[`${g},${cap}`]}</i>`;
                    push(note, cls, cands.map(({ o, val }) => `${o.n}: ${o.v} + dp[${g - 1}][${cap - o.c}] = ${val}`), { [bi]: 'cur' });
                }
            }
            // backtrack (prefer 'none' on ties, then first option)
            const path = [], chosen = [];
            let cap = W;
            const pc = cur => { const c = {}; for (let r = 0; r <= G; r++) for (let k = 0; k <= W; k++) c[`${r},${k}`] = 'dim'; path.forEach(([r, k]) => (c[`${r},${k}`] = 'path')); if (cur) c[`${cur[0]},${cur[1]}`] = 'cur'; return c; };
            for (let g = G; g >= 1; g--) {
                path.push([g, cap]);
                const o = groups[g - 1].opts.find(o => o.c <= cap && o.v + dp[g - 1][cap - o.c] === dp[g][cap]);
                const cls = pc([g, cap]); cls[`${g - 1},${cap - o.c}`] = 'dep';
                if (o.n === 'none') push(`Backtrack at <code>(G${g}, ${cap})</code>: value ${dp[g][cap]} equals <code>dp[${g - 1}][${cap}]</code> → pick <b>nothing</b> from ${groups[g - 1].name}.`, cls, chosen.length ? chosen : ['—'], {}, false, 'Backtrack');
                else {
                    chosen.push(o.n);
                    push(`Backtrack at <code>(G${g}, ${cap})</code>: <code>${o.v} + dp[${g - 1}][${cap - o.c}] = ${dp[g][cap]}</code> → pick <b>${o.n}</b> (cost ${o.c}); budget left ${cap - o.c}.`, cls, chosen.slice(), {}, false, 'Backtrack');
                    cap -= o.c;
                }
            }
            path.push([0, cap]);
            push(`<b>Answer = dp[3][10] = ${dp[G][W]} ($${dp[G][W]}M)</b> with ${chosen.join(' + ')} → projects ${chosen.flatMap(x => x.split('+')).sort().join(', ')}, total cost $${W - cap}M.`, pc(null), chosen, {}, true, 'Optimal selection');
            return frames;
        }
    });
})();
