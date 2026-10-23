/* Problem statements: graphs */
window.PROBLEMS = window.PROBLEMS || {};
(function () {
  var minCostPoints = {
    source: 'LeetCode', num: 1584, title: 'Min Cost to Connect All Points', difficulty: 'Medium',
    url: 'https://leetcode.com/problems/min-cost-to-connect-all-points/',
    statement:
      '<p>You are given an array <code>points</code> describing integer coordinates on a 2D plane, where <code>points[i] = [x<sub>i</sub>, y<sub>i</sub>]</code>.</p>' +
      '<p>Connecting two points <code>[x<sub>i</sub>, y<sub>i</sub>]</code> and <code>[x<sub>j</sub>, y<sub>j</sub>]</code> costs their <b>Manhattan distance</b>: <code>|x<sub>i</sub> - x<sub>j</sub>| + |y<sub>i</sub> - y<sub>j</sub>|</code>.</p>' +
      '<p>Return the minimum total cost needed so that all points are connected. All points count as connected when there is <b>exactly one</b> simple path between every pair of points.</p>',
    examples: [
      { input: 'points = [[0,0],[2,2],[3,10],[5,2],[7,0]]', output: '20',
        explanation: 'One optimal way to connect the points costs 20 in total. With that set of connections, there is a unique path between every pair of points.' },
      { input: 'points = [[3,12],[-2,5],[-4,1]]', output: '18' }
    ],
    constraints: [
      '1 <= points.length <= 1000',
      '-10^6 <= xi, yi <= 10^6',
      'All pairs (xi, yi) are distinct.'
    ],
    followUp: ''
  };

  Object.assign(window.PROBLEMS, {
    p1: {
      source: 'LeetCode', num: 547, title: 'Number of Provinces', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/number-of-provinces/',
      statement:
        '<p>There are <code>n</code> cities. Some are directly connected to each other and some are not. Connectivity is transitive: if city <code>a</code> is directly connected to city <code>b</code>, and <code>b</code> is directly connected to city <code>c</code>, then <code>a</code> is indirectly connected to <code>c</code>.</p>' +
        '<p>A <b>province</b> is a group of cities that are directly or indirectly connected to one another, with no other city outside the group connected to any of them.</p>' +
        '<p>You are given an <code>n x n</code> matrix <code>isConnected</code>, where <code>isConnected[i][j] = 1</code> if the <code>i</code>-th and <code>j</code>-th cities are directly connected, and <code>isConnected[i][j] = 0</code> otherwise.</p>' +
        '<p>Return the total number of provinces.</p>',
      examples: [
        { input: 'isConnected = [[1,1,0],[1,1,0],[0,0,1]]', output: '2' },
        { input: 'isConnected = [[1,0,0],[0,1,0],[0,0,1]]', output: '3' }
      ],
      constraints: [
        '1 <= n <= 200',
        'n == isConnected.length',
        'n == isConnected[i].length',
        'isConnected[i][j] is 1 or 0.',
        'isConnected[i][i] == 1',
        'isConnected[i][j] == isConnected[j][i]'
      ],
      followUp: ''
    },

    p2: {
      source: 'LeetCode', num: 200, title: 'Number of Islands', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/number-of-islands/',
      statement:
        '<p>You are given an <code>m x n</code> 2D grid <code>grid</code> of characters, where <code>\'1\'</code> represents land and <code>\'0\'</code> represents water. Return the number of islands.</p>' +
        '<p>An <b>island</b> is a group of land cells joined horizontally or vertically (not diagonally) and surrounded by water. You may assume that all four edges of the grid are surrounded by water.</p>',
      examples: [
        { input: 'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]', output: '1' },
        { input: 'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]', output: '3' }
      ],
      constraints: [
        'm == grid.length',
        'n == grid[i].length',
        '1 <= m, n <= 300',
        'grid[i][j] is \'0\' or \'1\'.'
      ],
      followUp: ''
    },

    p3: {
      source: 'LeetCode', num: 733, title: 'Flood Fill', difficulty: 'Easy',
      url: 'https://leetcode.com/problems/flood-fill/',
      statement:
        '<p>An image is represented by an <code>m x n</code> integer grid <code>image</code>, where <code>image[i][j]</code> is the color value of that pixel. You are also given three integers <code>sr</code>, <code>sc</code> and <code>color</code>. Perform a <b>flood fill</b> starting at pixel <code>image[sr][sc]</code>:</p>' +
        '<ol>' +
        '<li>Start from the starting pixel and change its color to <code>color</code>.</li>' +
        '<li>Do the same for every pixel that is directly adjacent to it (up, down, left or right) and has the <b>same original color</b> as the starting pixel.</li>' +
        '<li>Keep repeating this for the adjacent pixels of each newly recolored pixel, as long as they share the starting pixel\'s original color.</li>' +
        '<li>Stop when there are no more adjacent pixels of the original color to update.</li>' +
        '</ol>' +
        '<p>Return the modified image after the flood fill.</p>',
      examples: [
        { input: 'image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2', output: '[[2,2,2],[2,2,0],[2,0,1]]',
          explanation: 'Starting from the center pixel (1, 1), every pixel connected to it by a path of the same original color (1) is recolored to 2. The bottom-right pixel is not recolored because it is not 4-directionally connected to the starting pixel.' },
        { input: 'image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0', output: '[[0,0,0],[0,0,0]]',
          explanation: 'The starting pixel already has color 0, which equals the target color, so the image does not change.' }
      ],
      constraints: [
        'm == image.length',
        'n == image[i].length',
        '1 <= m, n <= 50',
        '0 <= image[i][j], color < 2^16',
        '0 <= sr < m',
        '0 <= sc < n'
      ],
      followUp: ''
    },

    p4: {
      source: 'LeetCode', num: 994, title: 'Rotting Oranges', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/rotting-oranges/',
      statement:
        '<p>You are given an <code>m x n</code> grid in which each cell holds one of three values:</p>' +
        '<ul>' +
        '<li><code>0</code>: an empty cell,</li>' +
        '<li><code>1</code>: a fresh orange,</li>' +
        '<li><code>2</code>: a rotten orange.</li>' +
        '</ul>' +
        '<p>Every minute, each fresh orange that is 4-directionally adjacent (up, down, left, right) to a rotten orange becomes rotten.</p>' +
        '<p>Return the minimum number of minutes that must pass until no cell contains a fresh orange. If this can never happen, return <code>-1</code>.</p>',
      examples: [
        { input: 'grid = [[2,1,1],[1,1,0],[0,1,1]]', output: '4' },
        { input: 'grid = [[2,1,1],[0,1,1],[1,0,1]]', output: '-1',
          explanation: 'The orange in the bottom-left corner (row 2, column 0) never rots, because rotting only spreads 4-directionally.' },
        { input: 'grid = [[0,2]]', output: '0',
          explanation: 'There are no fresh oranges at minute 0, so the answer is 0.' }
      ],
      constraints: [
        'm == grid.length',
        'n == grid[i].length',
        '1 <= m, n <= 10',
        'grid[i][j] is 0, 1, or 2.'
      ],
      followUp: ''
    },

    p5: {
      source: 'LeetCode', num: 542, title: '01 Matrix', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/01-matrix/',
      statement:
        '<p>Given an <code>m x n</code> binary matrix <code>mat</code>, return a matrix of the same size where each cell holds the distance from that cell to the nearest <code>0</code> in <code>mat</code>.</p>' +
        '<p>The distance between two cells that share an edge (up, down, left, right) is <code>1</code>.</p>',
      examples: [
        { input: 'mat = [[0,0,0],[0,1,0],[0,0,0]]', output: '[[0,0,0],[0,1,0],[0,0,0]]' },
        { input: 'mat = [[0,0,0],[0,1,0],[1,1,1]]', output: '[[0,0,0],[0,1,0],[1,2,1]]' }
      ],
      constraints: [
        'm == mat.length',
        'n == mat[i].length',
        '1 <= m, n <= 10^4',
        '1 <= m * n <= 10^4',
        'mat[i][j] is either 0 or 1.',
        'There is at least one 0 in mat.'
      ],
      followUp: ''
    },

    p6: {
      source: 'LeetCode', num: 785, title: 'Is Graph Bipartite?', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/is-graph-bipartite/',
      statement:
        '<p>There is an <b>undirected</b> graph with <code>n</code> nodes numbered <code>0</code> to <code>n - 1</code>. It is given as a 2D array <code>graph</code>, where <code>graph[u]</code> lists the nodes adjacent to node <code>u</code>: for every <code>v</code> in <code>graph[u]</code>, there is an undirected edge between <code>u</code> and <code>v</code>. The graph has these properties:</p>' +
        '<ul>' +
        '<li>No self-edges: <code>graph[u]</code> does not contain <code>u</code>.</li>' +
        '<li>No parallel edges: <code>graph[u]</code> has no duplicate values.</li>' +
        '<li>If <code>v</code> is in <code>graph[u]</code>, then <code>u</code> is in <code>graph[v]</code> (the graph is undirected).</li>' +
        '<li>The graph may be disconnected: there may be pairs of nodes <code>u</code> and <code>v</code> with no path between them.</li>' +
        '</ul>' +
        '<p>A graph is <b>bipartite</b> if its nodes can be split into two independent sets <code>A</code> and <code>B</code> such that <b>every</b> edge connects a node in <code>A</code> with a node in <code>B</code>.</p>' +
        '<p>Return <code>true</code> if and only if the graph is bipartite.</p>',
      examples: [
        { input: 'graph = [[1,2,3],[0,2],[0,1,3],[0,2]]', output: 'false',
          explanation: 'There is no way to split the nodes into two independent sets such that every edge connects a node in one set with a node in the other.' },
        { input: 'graph = [[1,3],[0,2],[1,3],[0,2]]', output: 'true',
          explanation: 'The nodes can be split into two sets: {0, 2} and {1, 3}.' }
      ],
      constraints: [
        'graph.length == n',
        '1 <= n <= 100',
        '0 <= graph[u].length < n',
        '0 <= graph[u][i] <= n - 1',
        'graph[u] does not contain u.',
        'All the values of graph[u] are unique.',
        'If graph[u] contains v, then graph[v] contains u.'
      ],
      followUp: ''
    },

    p7: {
      source: 'LeetCode', num: 802, title: 'Find Eventual Safe States', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/find-eventual-safe-states/',
      statement:
        '<p>There is a directed graph with <code>n</code> nodes labeled <code>0</code> to <code>n - 1</code>. It is given as a 0-indexed 2D integer array <code>graph</code>, where <code>graph[i]</code> is an integer array of the nodes that node <code>i</code> has an outgoing edge to (there is an edge from <code>i</code> to each node in <code>graph[i]</code>).</p>' +
        '<p>A node is a <b>terminal node</b> if it has no outgoing edges. A node is a <b>safe node</b> if every possible path that starts from it leads to a terminal node (or to another safe node).</p>' +
        '<p>Return an array containing all the safe nodes of the graph, sorted in <b>ascending</b> order.</p>',
      examples: [
        { input: 'graph = [[1,2],[2,3],[5],[0],[5],[],[]]', output: '[2,4,5,6]',
          explanation: 'Nodes 5 and 6 are terminal nodes because they have no outgoing edges. Every path starting at nodes 2, 4, 5 or 6 ends at node 5 or node 6.' },
        { input: 'graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]', output: '[4]',
          explanation: 'Only node 4 is a terminal node, and every path starting at node 4 leads to node 4.' }
      ],
      constraints: [
        'n == graph.length',
        '1 <= n <= 10^4',
        '0 <= graph[i].length <= n',
        '0 <= graph[i][j] <= n - 1',
        'graph[i] is sorted in a strictly increasing order.',
        'The graph may contain self-loops.',
        'The number of edges in the graph will be in the range [1, 4 * 10^4].'
      ],
      followUp: ''
    },

    p8: {
      source: 'LeetCode', num: 207, title: 'Course Schedule', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/course-schedule/',
      statement:
        '<p>You must take <code>numCourses</code> courses in total, labeled <code>0</code> to <code>numCourses - 1</code>. You are given an array <code>prerequisites</code> where <code>prerequisites[i] = [a<sub>i</sub>, b<sub>i</sub>]</code> means you have to take course <code>b<sub>i</sub></code> before you can take course <code>a<sub>i</sub></code>.</p>' +
        '<p>For example, the pair <code>[0, 1]</code> means that course <code>1</code> must be completed before course <code>0</code>.</p>' +
        '<p>Return <code>true</code> if it is possible to finish all the courses. Otherwise, return <code>false</code>.</p>',
      examples: [
        { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true',
          explanation: 'There are 2 courses. To take course 1 you must first finish course 0, which is possible.' },
        { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false',
          explanation: 'There are 2 courses. Course 1 requires course 0, and course 0 also requires course 1. This is a cycle, so it is impossible.' }
      ],
      constraints: [
        '1 <= numCourses <= 2000',
        '0 <= prerequisites.length <= 5000',
        'prerequisites[i].length == 2',
        '0 <= ai, bi < numCourses',
        'All the pairs prerequisites[i] are unique.'
      ],
      followUp: ''
    },

    p9: {
      source: 'LeetCode', num: 743, title: 'Network Delay Time', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/network-delay-time/',
      statement:
        '<p>You are given a network of <code>n</code> nodes labeled <code>1</code> to <code>n</code>, and a list <code>times</code> of travel times along <b>directed</b> edges, where <code>times[i] = (u<sub>i</sub>, v<sub>i</sub>, w<sub>i</sub>)</code>: <code>u<sub>i</sub></code> is the source node, <code>v<sub>i</sub></code> is the target node, and <code>w<sub>i</sub></code> is the time it takes a signal to travel from source to target.</p>' +
        '<p>A signal is sent from a given node <code>k</code>. Return the <b>minimum</b> time it takes for all <code>n</code> nodes to receive the signal. If some node can never receive it, return <code>-1</code>.</p>',
      examples: [
        { input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2', output: '2' },
        { input: 'times = [[1,2,1]], n = 2, k = 1', output: '1' },
        { input: 'times = [[1,2,1]], n = 2, k = 2', output: '-1' }
      ],
      constraints: [
        '1 <= k <= n <= 100',
        '1 <= times.length <= 6000',
        'times[i].length == 3',
        '1 <= ui, vi <= n',
        'ui != vi',
        '0 <= wi <= 100',
        'All the pairs (ui, vi) are unique. (i.e., no multiple edges.)'
      ],
      followUp: ''
    },

    p10: {
      source: 'LeetCode', num: 787, title: 'Cheapest Flights Within K Stops', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/',
      statement:
        '<p>There are <code>n</code> cities connected by some number of flights. You are given an array <code>flights</code> where <code>flights[i] = [from<sub>i</sub>, to<sub>i</sub>, price<sub>i</sub>]</code> means there is a one-way flight from city <code>from<sub>i</sub></code> to city <code>to<sub>i</sub></code> that costs <code>price<sub>i</sub></code>.</p>' +
        '<p>You are also given three integers <code>src</code>, <code>dst</code> and <code>k</code>. Return the <b>cheapest price</b> to travel from <code>src</code> to <code>dst</code> using <b>at most</b> <code>k</code> stops (intermediate cities). If no such route exists, return <code>-1</code>.</p>',
      examples: [
        { input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1', output: '700',
          explanation: 'The optimal route is 0 -> 1 -> 3 with cost 100 + 600 = 700. The route 0 -> 1 -> 2 -> 3 is cheaper, but it uses 2 stops, which exceeds k = 1, so it is not allowed.' },
        { input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1', output: '200',
          explanation: 'The cheapest route with at most 1 stop is 0 -> 1 -> 2, costing 100 + 100 = 200.' },
        { input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0', output: '500',
          explanation: 'With no stops allowed, the only option is the direct flight 0 -> 2, costing 500.' }
      ],
      constraints: [
        '1 <= n <= 100',
        '0 <= flights.length <= (n * (n - 1) / 2)',
        'flights[i].length == 3',
        '0 <= fromi, toi < n',
        'fromi != toi',
        '1 <= pricei <= 10^4',
        'There will not be any multiple flights between two cities.',
        '0 <= src, dst, k < n',
        'src != dst'
      ],
      followUp: ''
    },

    p11: {
      source: 'LeetCode', num: 127, title: 'Word Ladder', difficulty: 'Hard',
      url: 'https://leetcode.com/problems/word-ladder/',
      statement:
        '<p>A <b>transformation sequence</b> from <code>beginWord</code> to <code>endWord</code> using a dictionary <code>wordList</code> is a sequence of words <code>beginWord -&gt; s<sub>1</sub> -&gt; s<sub>2</sub> -&gt; ... -&gt; s<sub>k</sub></code> such that:</p>' +
        '<ul>' +
        '<li>Every two adjacent words in the sequence differ by exactly one letter.</li>' +
        '<li>Every <code>s<sub>i</sub></code> for <code>1 &lt;= i &lt;= k</code> is in <code>wordList</code>. Note that <code>beginWord</code> does not need to be in <code>wordList</code>.</li>' +
        '<li><code>s<sub>k</sub> == endWord</code>.</li>' +
        '</ul>' +
        '<p>Given <code>beginWord</code>, <code>endWord</code> and <code>wordList</code>, return the <b>number of words</b> in the <b>shortest</b> transformation sequence from <code>beginWord</code> to <code>endWord</code>, or <code>0</code> if no such sequence exists.</p>',
      examples: [
        { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5',
          explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which contains 5 words.' },
        { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0',
          explanation: 'endWord "cog" is not in wordList, so no valid transformation sequence exists.' }
      ],
      constraints: [
        '1 <= beginWord.length <= 10',
        'endWord.length == beginWord.length',
        '1 <= wordList.length <= 5000',
        'wordList[i].length == beginWord.length',
        'beginWord, endWord, and wordList[i] consist of lowercase English letters.',
        'beginWord != endWord',
        'All the words in wordList are unique.'
      ],
      followUp: ''
    },

    p12: {
      source: 'LeetCode', num: 1976, title: 'Number of Ways to Arrive at Destination', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/',
      statement:
        '<p>A city has <code>n</code> intersections numbered <code>0</code> to <code>n - 1</code>, joined by <b>bidirectional</b> roads. Every intersection can be reached from every other intersection, and there is at most one road between any two intersections.</p>' +
        '<p>You are given an integer <code>n</code> and a 2D integer array <code>roads</code>, where <code>roads[i] = [u<sub>i</sub>, v<sub>i</sub>, time<sub>i</sub>]</code> means there is a road between intersections <code>u<sub>i</sub></code> and <code>v<sub>i</sub></code> that takes <code>time<sub>i</sub></code> minutes to travel.</p>' +
        '<p>You want to travel from intersection <code>0</code> to intersection <code>n - 1</code> in the <b>shortest amount of time</b>. Return the <b>number of different ways</b> you can do this. Since the answer may be large, return it <b>modulo</b> <code>10<sup>9</sup> + 7</code>.</p>',
      examples: [
        { input: 'n = 7, roads = [[0,6,7],[0,1,2],[1,2,3],[1,3,3],[6,3,3],[3,5,1],[6,5,1],[2,5,1],[0,4,5],[4,6,2]]', output: '4',
          explanation: 'The shortest time from intersection 0 to intersection 6 is 7 minutes. The four ways to achieve it are: 0 -> 6; 0 -> 4 -> 6; 0 -> 1 -> 2 -> 5 -> 6; 0 -> 1 -> 3 -> 5 -> 6.' },
        { input: 'n = 2, roads = [[1,0,10]]', output: '1',
          explanation: 'There is only one way to go from intersection 0 to intersection 1, and it takes 10 minutes.' }
      ],
      constraints: [
        '1 <= n <= 200',
        'n - 1 <= roads.length <= n * (n - 1) / 2',
        'roads[i].length == 3',
        '0 <= ui, vi <= n - 1',
        '1 <= timei <= 10^9',
        'ui != vi',
        'There is at most one road connecting any two intersections.',
        'You can reach any intersection from any other intersection.'
      ],
      followUp: ''
    },

    p13: {
      source: 'LeetCode', num: 1091, title: 'Shortest Path in Binary Matrix', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/',
      statement:
        '<p>Given an <code>n x n</code> binary matrix <code>grid</code>, return the length of the shortest <b>clear path</b> in the matrix. If there is no clear path, return <code>-1</code>.</p>' +
        '<p>A <b>clear path</b> is a path from the top-left cell <code>(0, 0)</code> to the bottom-right cell <code>(n - 1, n - 1)</code> such that:</p>' +
        '<ul>' +
        '<li>Every visited cell on the path has value <code>0</code>.</li>' +
        '<li>Each pair of consecutive cells on the path is <b>8-directionally</b> connected (they are different cells that share an edge or a corner).</li>' +
        '</ul>' +
        '<p>The <b>length</b> of a clear path is the number of cells visited along it (including the start and end cells).</p>',
      examples: [
        { input: 'grid = [[0,1],[1,0]]', output: '2' },
        { input: 'grid = [[0,0,0],[1,1,0],[1,1,0]]', output: '4' },
        { input: 'grid = [[1,0,0],[1,1,0],[1,1,0]]', output: '-1' }
      ],
      constraints: [
        'n == grid.length',
        'n == grid[i].length',
        '1 <= n <= 100',
        'grid[i][j] is 0 or 1'
      ],
      followUp: ''
    },

    p14: {
      source: 'LeetCode', num: 1334, title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/',
      statement:
        '<p>There are <code>n</code> cities numbered <code>0</code> to <code>n - 1</code>. You are given an array <code>edges</code>, where <code>edges[i] = [from<sub>i</sub>, to<sub>i</sub>, weight<sub>i</sub>]</code> is a <b>bidirectional</b> weighted edge between cities <code>from<sub>i</sub></code> and <code>to<sub>i</sub></code>, and an integer <code>distanceThreshold</code>.</p>' +
        '<p>Return the city that can reach the <b>smallest</b> number of other cities through some path whose total distance is <b>at most</b> <code>distanceThreshold</code>. If several cities tie, return the one with the <b>greatest</b> number.</p>' +
        '<p>The distance of a path between cities <code>i</code> and <code>j</code> is the sum of the weights of the edges along that path.</p>',
      examples: [
        { input: 'n = 4, edges = [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], distanceThreshold = 4', output: '3',
          explanation: 'Neighboring cities within distance 4 of each city: City 0 -> [City 1, City 2]; City 1 -> [City 0, City 2, City 3]; City 2 -> [City 0, City 1, City 3]; City 3 -> [City 1, City 2]. Cities 0 and 3 each have 2 neighbors within the threshold, so return city 3, the one with the greater number.' },
        { input: 'n = 5, edges = [[0,1,2],[0,4,8],[1,2,3],[1,4,2],[2,3,1],[3,4,1]], distanceThreshold = 2', output: '0',
          explanation: 'Neighboring cities within distance 2 of each city: City 0 -> [City 1]; City 1 -> [City 0, City 4]; City 2 -> [City 3, City 4]; City 3 -> [City 2, City 4]; City 4 -> [City 1, City 2, City 3]. City 0 has only 1 neighbor within the threshold.' }
      ],
      constraints: [
        '2 <= n <= 100',
        '1 <= edges.length <= n * (n - 1) / 2',
        'edges[i].length == 3',
        '0 <= fromi < toi < n',
        '1 <= weighti, distanceThreshold <= 10^4',
        'All pairs (fromi, toi) are distinct.'
      ],
      followUp: ''
    },

    p15: minCostPoints,
    p16: minCostPoints,

    p17: {
      source: 'LeetCode', num: 1319, title: 'Number of Operations to Make Network Connected', difficulty: 'Medium',
      url: 'https://leetcode.com/problems/number-of-operations-to-make-network-connected/',
      statement:
        '<p>There are <code>n</code> computers numbered <code>0</code> to <code>n - 1</code>, linked by ethernet cables into a network. You are given <code>connections</code>, where <code>connections[i] = [a<sub>i</sub>, b<sub>i</sub>]</code> is a cable between computers <code>a<sub>i</sub></code> and <code>b<sub>i</sub></code>. Any computer can reach any other computer directly or indirectly through the network.</p>' +
        '<p>In one operation, you may remove a cable between two directly connected computers and plug it in between any pair of computers that are not directly connected.</p>' +
        '<p>Return the <b>minimum</b> number of operations needed to make all the computers connected. If it is not possible, return <code>-1</code>.</p>',
      examples: [
        { input: 'n = 4, connections = [[0,1],[0,2],[1,2]]', output: '1',
          explanation: 'Remove the cable between computers 1 and 2 and place it between computers 1 and 3.' },
        { input: 'n = 6, connections = [[0,1],[0,2],[0,3],[1,2],[1,3]]', output: '2' },
        { input: 'n = 6, connections = [[0,1],[0,2],[0,3],[1,2]]', output: '-1',
          explanation: 'There are not enough cables.' }
      ],
      constraints: [
        '1 <= n <= 10^5',
        '1 <= connections.length <= min(n * (n - 1) / 2, 10^5)',
        'connections[i].length == 2',
        '0 <= ai, bi < n',
        'ai != bi',
        'There are no repeated connections.',
        'No two computers are connected by more than one cable.'
      ],
      followUp: ''
    },

    p18: {
      source: 'GeeksforGeeks', title: 'Strongly Connected Components (Kosaraju\'s Algorithm)', difficulty: 'Medium',
      url: 'https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1',
      statement:
        '<p>You are given a <b>directed</b> graph with <code>V</code> vertices numbered <code>0</code> to <code>V - 1</code>, as an adjacency list <code>adj</code>, where <code>adj[u]</code> lists every vertex <code>v</code> such that there is a directed edge <code>u -&gt; v</code>.</p>' +
        '<p>A <b>strongly connected component</b> (SCC) is a maximal set of vertices in which every vertex can reach every other vertex of the set by following directed edges. Every vertex belongs to exactly one SCC (a vertex with no cycle through it forms an SCC by itself).</p>' +
        '<p>Return the <b>number</b> of strongly connected components in the graph.</p>',
      examples: [
        { input: 'V = 5, adj = [[2,3],[0],[1],[4],[]]', output: '3',
          explanation: 'Edges: 0 -> 2, 0 -> 3, 1 -> 0, 2 -> 1, 3 -> 4. The SCCs are {0, 1, 2} (0 -> 2 -> 1 -> 0 is a cycle), {3} and {4}, so there are 3.' },
        { input: 'V = 3, adj = [[1],[2],[0]]', output: '1',
          explanation: 'Edges 0 -> 1 -> 2 -> 0 form a single cycle, so all three vertices are in one SCC.' }
      ],
      constraints: [
        '1 <= V <= 5000',
        '0 <= E <= V * (V - 1)',
        '0 <= u, v <= V - 1',
        'Expected time complexity: O(V + E)',
        'Expected auxiliary space: O(V + E)'
      ],
      followUp: ''
    }
  });
})();
