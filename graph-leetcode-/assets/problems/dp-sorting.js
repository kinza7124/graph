/* Problem statements: DP, D&C, sorting */
window.PROBLEMS = window.PROBLEMS || {};
(function () {
  var LC = function (slug) { return 'https://leetcode.com/problems/' + slug + '/'; };

  var knapsack = {
    source: 'GeeksforGeeks', title: '0 - 1 Knapsack Problem', difficulty: 'Medium',
    url: 'https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1',
    statement:
      '<p>You are given <code>n</code> items. Item <code>i</code> has a value <code>val[i]</code> and a weight ' +
      '<code>wt[i]</code>. You also have a knapsack that can carry a total weight of at most <code>W</code>.</p>' +
      '<p>Choose a subset of the items so that their total weight does not exceed <code>W</code> and their total value ' +
      'is as large as possible. Return that maximum total value.</p>' +
      '<p>Every item is either taken whole or left behind (you cannot take a fraction of an item), and each item can be ' +
      'taken at most once. If no item fits, the answer is <code>0</code>.</p>',
    examples: [
      { input: 'W = 4, val = [1, 2, 3], wt = [4, 5, 1]', output: '3',
        explanation: 'Take only the third item (weight 1, value 3). Adding any other item would exceed the capacity of 4.' },
      { input: 'W = 3, val = [1, 2, 3], wt = [4, 5, 6]', output: '0',
        explanation: 'Every item weighs more than 3, so nothing can be put in the knapsack.' },
      { input: 'W = 5, val = [10, 40, 30, 50], wt = [5, 4, 6, 3]', output: '50',
        explanation: 'The best choice is the item with weight 3 and value 50; no pair of items fits within weight 5 with a higher value.' }
    ],
    constraints: [
      '2 <= val.size() = wt.size() <= 10^3',
      '1 <= W <= 10^3',
      '1 <= val[i] <= 10^3',
      '1 <= wt[i] <= 10^3'
    ],
    followUp: ''
  };

  var sortArray = function (followUp) {
    return {
      source: 'LeetCode', num: 912, title: 'Sort an Array', difficulty: 'Medium',
      url: LC('sort-an-array'),
      statement:
        '<p>Given an integer array <code>nums</code>, sort it in ascending (non-decreasing) order and return the sorted array.</p>' +
        '<p>You must not use any built-in sorting function. Your solution must run in <code>O(n log n)</code> time and use ' +
        'as little extra space as possible.</p>',
      examples: [
        { input: 'nums = [5,2,3,1]', output: '[1,2,3,5]',
          explanation: 'After sorting, 2 and 3 keep their places relative to each other while 1 and 5 move to the front and back.' },
        { input: 'nums = [5,1,1,2,0,0]', output: '[0,0,1,1,2,5]',
          explanation: 'The values do not have to be distinct; duplicates simply appear next to each other in the output.' }
      ],
      constraints: [
        '1 <= nums.length <= 5 * 10^4',
        '-5 * 10^4 <= nums[i] <= 5 * 10^4'
      ],
      followUp: followUp
    };
  };

  Object.assign(window.PROBLEMS, {
    p21: {
      source: 'LeetCode', num: 70, title: 'Climbing Stairs', difficulty: 'Easy',
      url: LC('climbing-stairs'),
      statement:
        '<p>You are climbing a staircase that has <code>n</code> steps to reach the top.</p>' +
        '<p>Each move, you may climb either <code>1</code> step or <code>2</code> steps. Count how many distinct ' +
        'ways there are to reach the top, and return that number.</p>',
      examples: [
        { input: 'n = 2', output: '2', explanation: 'There are two ways: (1) 1 step + 1 step, (2) 2 steps.' },
        { input: 'n = 3', output: '3', explanation: 'There are three ways: (1) 1 + 1 + 1, (2) 1 + 2, (3) 2 + 1.' }
      ],
      constraints: ['1 <= n <= 45'],
      followUp: ''
    },

    p22: {
      source: 'Coding Ninjas (Code360)', title: 'Frog Jump', difficulty: 'Easy',
      url: 'https://www.naukri.com/code360/problems/frog-jump_3621012',
      also: [ { label: 'GeeksforGeeks (Geek Jump)', url: 'https://www.geeksforgeeks.org/problems/geek-jump/1' } ],
      statement:
        '<p>A staircase has <code>N</code> stairs, and a frog sits on the 1st stair and wants to reach the <code>N</code>-th stair. ' +
        'You are given an array <code>HEIGHT</code> where <code>HEIGHT[i]</code> is the height of the <code>(i+1)</code>-th stair.</p>' +
        '<p>From stair <code>i</code> the frog can jump only to stair <code>i+1</code> or stair <code>i+2</code>. A jump from stair ' +
        '<code>i</code> to stair <code>j</code> costs <code>|HEIGHT[i-1] - HEIGHT[j-1]|</code> energy (the absolute difference of the two heights).</p>' +
        '<p>Return the minimum total energy the frog needs to get from the 1st stair to the <code>N</code>-th stair.</p>' +
        '<p>Input format (Code360): the first line holds <code>T</code>, the number of test cases. Each test case has a line with ' +
        '<code>N</code> followed by a line with the <code>N</code> heights. Print one answer per test case.</p>',
      examples: [
        { input: 'N = 4, HEIGHT = [10, 20, 30, 10]', output: '20',
          explanation: 'Jump 1 -> 2 (cost |10 - 20| = 10), then 2 -> 4 (cost |20 - 10| = 10). Total 20, which is the minimum.' },
        { input: 'N = 3, HEIGHT = [10, 50, 10]', output: '0',
          explanation: 'Jump straight from stair 1 to stair 3: |10 - 10| = 0.' }
      ],
      constraints: [
        '1 <= T <= 10',
        '1 <= N <= 100000',
        '0 <= HEIGHT[i] <= 1000'
      ],
      followUp: 'Can you solve it in O(N) time and O(1) extra space?'
    },

    p23: {
      source: 'GeeksforGeeks', title: 'Minimal Cost', difficulty: 'Medium',
      url: 'https://www.geeksforgeeks.org/problems/minimal-cost/1',
      statement:
        '<p>You are given an array <code>arr[]</code> of <code>n</code> stones, where <code>arr[i]</code> is the height of stone ' +
        '<code>i</code>, and an integer <code>k</code>. A frog (the "Geek") starts on stone <code>0</code> and wants to reach the ' +
        'last stone, <code>n-1</code>.</p>' +
        '<p>From stone <code>i</code> it can jump to any of the stones <code>i+1, i+2, ..., i+k</code> (as long as that stone exists). ' +
        'Jumping from stone <code>i</code> to stone <code>j</code> costs <code>|arr[i] - arr[j]|</code>.</p>' +
        '<p>Return the minimum total cost needed to reach the last stone.</p>',
      examples: [
        { input: 'k = 3, arr = [10, 30, 40, 50, 20]', output: '30',
          explanation: 'Jump 0 -> 1 (cost |10 - 30| = 20), then 1 -> 4 (cost |30 - 20| = 10). Total 30.' },
        { input: 'k = 1, arr = [10, 20, 10]', output: '20',
          explanation: 'With k = 1 the only path is 0 -> 1 -> 2, costing |10 - 20| + |20 - 10| = 20.' },
        { input: 'k = 2, arr = [10, 20, 30, 10]', output: '20',
          explanation: 'Worked example from this page (k = 2 is the plain Frog Jump): 0 -> 1 -> 3 costs 10 + 10 = 20.' }
      ],
      constraints: [
        '1 <= arr.size() <= 10^4',
        '1 <= k <= 100',
        '1 <= arr[i] <= 10^4'
      ],
      followUp: 'Expected: O(n * k) time and O(n) auxiliary space.'
    },

    p24: {
      source: 'LeetCode', num: 198, title: 'House Robber', difficulty: 'Medium',
      url: LC('house-robber'),
      also: [ { label: 'Code360 (Maximum Sum of Non-Adjacent Elements)', url: 'https://www.naukri.com/code360/problems/maximum-sum-of-non-adjacent-elements_843261' } ],
      statement:
        '<p>A row of houses lines a street, and house <code>i</code> holds <code>nums[i]</code> amount of money. You are a robber ' +
        'planning to rob some of these houses.</p>' +
        '<p>The only restriction: neighbouring houses share a security system, and the police are alerted automatically if two ' +
        '<em>adjacent</em> houses are robbed on the same night.</p>' +
        '<p>Return the largest amount of money you can collect without robbing any two adjacent houses. Equivalently: pick a ' +
        'subset of array elements, no two of which are next to each other, with the maximum possible sum.</p>',
      examples: [
        { input: 'nums = [1,2,3,1]', output: '4',
          explanation: 'Rob house 1 (money = 1) and house 3 (money = 3). Total = 1 + 3 = 4.' },
        { input: 'nums = [2,7,9,3,1]', output: '12',
          explanation: 'Rob house 1 (2), house 3 (9) and house 5 (1). Total = 2 + 9 + 1 = 12.' }
      ],
      constraints: [
        '1 <= nums.length <= 100',
        '0 <= nums[i] <= 400'
      ],
      followUp: ''
    },

    p25: {
      source: 'LeetCode', num: 213, title: 'House Robber II', difficulty: 'Medium',
      url: LC('house-robber-ii'),
      statement:
        '<p>You are a robber planning to rob houses along a street; house <code>i</code> holds <code>nums[i]</code> money. This time ' +
        'the houses are arranged in a <strong>circle</strong>, so the first house and the last house are neighbours.</p>' +
        '<p>Adjacent houses share a security system that calls the police if both are broken into on the same night.</p>' +
        '<p>Return the maximum amount of money you can rob without alerting the police (no two adjacent houses robbed, where the ' +
        'first and last houses also count as adjacent).</p>',
      examples: [
        { input: 'nums = [2,3,2]', output: '3',
          explanation: 'You cannot rob house 1 (2) and house 3 (2) together because they are adjacent in the circle. Rob house 2 for 3.' },
        { input: 'nums = [1,2,3,1]', output: '4',
          explanation: 'Rob house 1 (1) and house 3 (3). Total = 1 + 3 = 4.' },
        { input: 'nums = [1,2,3]', output: '3' }
      ],
      constraints: [
        '1 <= nums.length <= 100',
        '0 <= nums[i] <= 1000'
      ],
      followUp: ''
    },

    p26: {
      source: 'Coding Ninjas (Code360)', title: "Ninja's Training", difficulty: 'Medium',
      url: 'https://www.naukri.com/code360/problems/ninja-s-training_3621003',
      statement:
        '<p>A ninja has an <code>N</code>-day training schedule. Each day he performs exactly one of three activities: Running, ' +
        'Fighting Practice, or Learning New Moves. Each activity on each day earns merit points, given as an <code>N x 3</code> ' +
        'array <code>points</code>, where <code>points[i][j]</code> is what activity <code>j</code> earns on day <code>i</code>.</p>' +
        '<p>The ninja cannot perform the same activity on two consecutive days.</p>' +
        '<p>Return the maximum total merit points he can earn over the <code>N</code> days.</p>' +
        '<p>Input format (Code360): the first line holds <code>T</code>, the number of test cases. Each test case begins with ' +
        '<code>N</code>, followed by <code>N</code> lines of three integers each. Print one answer per test case.</p>',
      examples: [
        { input: 'N = 3, points = [[1,2,5],[3,1,1],[3,3,3]]', output: '11',
          explanation: 'Day 1: activity 3 (5 points), day 2: activity 1 (3 points), day 3: activity 2 (3 points). Total 5 + 3 + 3 = 11.' },
        { input: 'N = 3, points = [[10,40,70],[20,50,80],[30,60,90]]', output: '210',
          explanation: 'Day 1: activity 3 (70), day 2: activity 2 (50), day 3: activity 3 (90). Total 210.' },
        { input: 'N = 2, points = [[10,50,1],[5,100,11]]', output: '110',
          explanation: 'Day 1: activity 1 (10), day 2: activity 2 (100). Total 110.' },
        { input: 'N = 3, points = [[18,11,19],[4,13,7],[1,8,13]]', output: '45',
          explanation: 'Day 1: activity 3 (19), day 2: activity 2 (13), day 3: activity 3 (13). Total 45.' }
      ],
      constraints: [
        '1 <= T <= 10',
        '1 <= N <= 100000',
        '1 <= points[i][j] <= 100'
      ],
      followUp: ''
    },

    p27: {
      source: 'LeetCode', num: 62, title: 'Unique Paths', difficulty: 'Medium',
      url: LC('unique-paths'),
      statement:
        '<p>A robot stands on an <code>m x n</code> grid, starting in the top-left cell <code>grid[0][0]</code>. It wants to reach ' +
        'the bottom-right cell <code>grid[m-1][n-1]</code>. At every step the robot can move only <strong>down</strong> or ' +
        '<strong>right</strong>.</p>' +
        '<p>Given the two integers <code>m</code> and <code>n</code>, return the number of distinct paths the robot can take to reach ' +
        'the bottom-right corner.</p>' +
        '<p>The test cases guarantee that the answer is at most <code>2 * 10^9</code>.</p>',
      examples: [
        { input: 'm = 3, n = 7', output: '28' },
        { input: 'm = 3, n = 2', output: '3',
          explanation: 'From the top-left corner there are 3 ways to reach the bottom-right corner: (1) Right -> Down -> Down, (2) Down -> Down -> Right, (3) Down -> Right -> Down.' }
      ],
      constraints: ['1 <= m, n <= 100'],
      followUp: ''
    },

    p29: {
      source: 'LeetCode', num: 64, title: 'Minimum Path Sum', difficulty: 'Medium',
      url: LC('minimum-path-sum'),
      statement:
        '<p>You are given an <code>m x n</code> grid filled with non-negative numbers. Find a path from the top-left cell to the ' +
        'bottom-right cell whose sum of visited numbers is as small as possible, and return that sum.</p>' +
        '<p>At each step you may move only <strong>down</strong> or <strong>right</strong>. Both the start and end cells count toward the sum.</p>',
      examples: [
        { input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]', output: '7',
          explanation: 'The path 1 -> 3 -> 1 -> 1 -> 1 has the smallest sum, 7.' },
        { input: 'grid = [[1,2,3],[4,5,6]]', output: '12' }
      ],
      constraints: [
        'm == grid.length',
        'n == grid[i].length',
        '1 <= m, n <= 200',
        '0 <= grid[i][j] <= 200'
      ],
      followUp: ''
    },

    p30: {
      source: 'LeetCode', num: 416, title: 'Partition Equal Subset Sum', difficulty: 'Medium',
      url: LC('partition-equal-subset-sum'),
      statement:
        '<p>Given an integer array <code>nums</code>, decide whether its elements can be split into two subsets whose sums are equal. ' +
        'Every element must go into exactly one of the two subsets.</p>' +
        '<p>Return <code>true</code> if such a partition exists, otherwise <code>false</code>.</p>',
      examples: [
        { input: 'nums = [1,5,11,5]', output: 'true',
          explanation: 'The array can be split into [1, 5, 5] and [11], both summing to 11.' },
        { input: 'nums = [1,2,3,5]', output: 'false',
          explanation: 'No way exists to split the array into two subsets with equal sums.' }
      ],
      constraints: [
        '1 <= nums.length <= 200',
        '1 <= nums[i] <= 100'
      ],
      followUp: ''
    },

    'dp-subsequences': {
      source: 'GeeksforGeeks', title: 'Subset Sum Problem', difficulty: 'Medium',
      url: 'https://www.geeksforgeeks.org/problems/subset-sum-problem-1611555638/1',
      also: [ { label: 'GeeksforGeeks (Perfect Sum: count subsets with sum K)', url: 'https://www.geeksforgeeks.org/problems/perfect-sum-problem5633/1' } ],
      statement:
        '<p>You are given an array <code>arr[]</code> of non-negative integers and an integer <code>sum</code>. Determine whether ' +
        'some subset of the array (not necessarily contiguous; any selection of elements) has elements adding up exactly to ' +
        '<code>sum</code>.</p>' +
        '<p>Return <code>true</code> if such a subset exists, otherwise <code>false</code>.</p>' +
        '<p>Related variant (Perfect Sum): instead of a yes/no answer, count how many subsets have sum equal to the target. ' +
        'The same take / not-take DP applies, with addition in place of logical OR.</p>',
      examples: [
        { input: 'arr = [3, 34, 4, 12, 5, 2], sum = 9', output: 'true',
          explanation: 'The subset [4, 5] adds up to 9.' },
        { input: 'arr = [3, 34, 4, 12, 5, 2], sum = 30', output: 'false',
          explanation: 'No subset adds up to 30.' },
        { input: 'arr = [1, 2, 3], sum = 6', output: 'true',
          explanation: 'The whole array [1, 2, 3] adds up to 6.' }
      ],
      constraints: [
        '1 <= arr.size() <= 200',
        '1 <= arr[i] <= 200',
        '1 <= sum <= 10^4'
      ],
      followUp: ''
    },

    p31: Object.assign({}, knapsack),
    p36: Object.assign({}, knapsack),

    p32: {
      source: 'LeetCode', num: 1143, title: 'Longest Common Subsequence', difficulty: 'Medium',
      url: LC('longest-common-subsequence'),
      statement:
        '<p>Given two strings <code>text1</code> and <code>text2</code>, return the length of their longest common subsequence. ' +
        'If they share no common subsequence, return <code>0</code>.</p>' +
        '<p>A <em>subsequence</em> of a string is obtained by deleting zero or more of its characters without changing the order ' +
        'of the remaining ones. For example, <code>"ace"</code> is a subsequence of <code>"abcde"</code>.</p>' +
        '<p>A <em>common subsequence</em> is a string that is a subsequence of both strings.</p>',
      examples: [
        { input: 'text1 = "abcde", text2 = "ace"', output: '3',
          explanation: 'The longest common subsequence is "ace", of length 3.' },
        { input: 'text1 = "abc", text2 = "abc"', output: '3',
          explanation: 'The longest common subsequence is "abc", of length 3.' },
        { input: 'text1 = "abc", text2 = "def"', output: '0',
          explanation: 'The two strings have no common subsequence, so the answer is 0.' }
      ],
      constraints: [
        '1 <= text1.length, text2.length <= 1000',
        'text1 and text2 consist of only lowercase English characters.'
      ],
      followUp: ''
    },

    p33: {
      source: 'LeetCode', num: 1092, title: 'Shortest Common Supersequence', difficulty: 'Hard',
      url: LC('shortest-common-supersequence'),
      statement:
        '<p>Given two strings <code>str1</code> and <code>str2</code>, return the shortest string that contains both ' +
        '<code>str1</code> and <code>str2</code> as subsequences. If several shortest strings exist, you may return any of them.</p>' +
        '<p>A string <code>s</code> is a subsequence of a string <code>t</code> if <code>s</code> can be obtained by deleting some ' +
        '(possibly zero) characters of <code>t</code> without reordering the rest.</p>',
      examples: [
        { input: 'str1 = "abac", str2 = "cab"', output: '"cabac"',
          explanation: 'str1 = "abac" is a subsequence of "cabac" (delete the first "c"); str2 = "cab" is a subsequence of "cabac" (delete the last "ac"). This is the shortest string satisfying both.' },
        { input: 'str1 = "aaaaaaaa", str2 = "aaaaaaaa"', output: '"aaaaaaaa"' }
      ],
      constraints: [
        '1 <= str1.length, str2.length <= 1000',
        'str1 and str2 consist of lowercase English letters.'
      ],
      followUp: ''
    },

    p39: {
      source: 'LeetCode', num: 518, title: 'Coin Change II', difficulty: 'Medium',
      url: LC('coin-change-ii'),
      statement:
        '<p>You are given an integer array <code>coins</code> of distinct coin denominations and an integer <code>amount</code>. ' +
        'You have an unlimited supply of every denomination.</p>' +
        '<p>Return the number of different combinations of coins that add up to exactly <code>amount</code>. Combinations are ' +
        'unordered (1+2 and 2+1 are the same combination). If the amount cannot be formed, return <code>0</code>.</p>' +
        '<p>The answer is guaranteed to fit in a signed 32-bit integer.</p>',
      examples: [
        { input: 'amount = 5, coins = [1,2,5]', output: '4',
          explanation: 'The four ways are: 5 = 5, 5 = 2 + 2 + 1, 5 = 2 + 1 + 1 + 1, 5 = 1 + 1 + 1 + 1 + 1.' },
        { input: 'amount = 3, coins = [2]', output: '0',
          explanation: 'An amount of 3 cannot be built from coins of 2 only.' },
        { input: 'amount = 10, coins = [10]', output: '1' }
      ],
      constraints: [
        '1 <= coins.length <= 300',
        '1 <= coins[i] <= 5000',
        'All the values of coins are unique.',
        '0 <= amount <= 5000'
      ],
      followUp: ''
    },

    p40: {
      source: 'LeetCode', num: 72, title: 'Edit Distance', difficulty: 'Medium',
      url: LC('edit-distance'),
      statement:
        '<p>Given two strings <code>word1</code> and <code>word2</code>, return the minimum number of operations needed to turn ' +
        '<code>word1</code> into <code>word2</code>.</p>' +
        '<p>Three operations are allowed on a word, each costing one operation:</p>' +
        '<ul><li>Insert a character</li><li>Delete a character</li><li>Replace a character</li></ul>',
      examples: [
        { input: 'word1 = "horse", word2 = "ros"', output: '3',
          explanation: 'horse -> rorse (replace "h" with "r"); rorse -> rose (remove "r"); rose -> ros (remove "e").' },
        { input: 'word1 = "intention", word2 = "execution"', output: '5',
          explanation: 'intention -> inention (remove "t"); inention -> enention (replace "i" with "e"); enention -> exention (replace "n" with "x"); exention -> exection (replace "n" with "c"); exection -> execution (insert "u").' }
      ],
      constraints: [
        '0 <= word1.length, word2.length <= 500',
        'word1 and word2 consist of lowercase English letters.'
      ],
      followUp: ''
    },

    p41: {
      source: 'GeeksforGeeks', title: 'Rod Cutting', difficulty: 'Medium',
      url: 'https://www.geeksforgeeks.org/problems/rod-cutting0840/1',
      statement:
        '<p>You have a rod of length <code>n</code> and an array <code>price[]</code> of size <code>n</code>, where ' +
        '<code>price[i]</code> is the selling price of a piece of length <code>i + 1</code>.</p>' +
        '<p>You may cut the rod into any number of pieces of integer lengths (or not cut it at all), and each length can be used ' +
        'any number of times. Return the maximum total value you can get by cutting the rod and selling the pieces.</p>',
      examples: [
        { input: 'price = [1, 5, 8, 9, 10, 17, 17, 20]', output: '22',
          explanation: 'The rod has length 8. Cutting it into pieces of lengths 2 and 6 gives 5 + 17 = 22, the maximum.' },
        { input: 'price = [3, 5, 8, 9, 10, 17, 17, 20]', output: '24',
          explanation: 'Cutting the rod of length 8 into eight pieces of length 1 gives 8 * 3 = 24.' },
        { input: 'price = [3]', output: '3',
          explanation: 'There is only one possibility: a single piece of length 1, worth 3.' }
      ],
      constraints: [
        '1 <= price.size() <= 10^3',
        '1 <= price[i] <= 10^6'
      ],
      followUp: ''
    },

    p42: {
      source: 'LeetCode', num: 139, title: 'Word Break', difficulty: 'Medium',
      url: LC('word-break'),
      statement:
        '<p>Given a string <code>s</code> and a list of strings <code>wordDict</code> (the dictionary), return <code>true</code> if ' +
        '<code>s</code> can be split into a sequence of one or more dictionary words separated by spaces, and <code>false</code> otherwise.</p>' +
        '<p>Any dictionary word may be used as many times as needed in the segmentation.</p>',
      examples: [
        { input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true',
          explanation: '"leetcode" can be split as "leet code".' },
        { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: 'true',
          explanation: '"applepenapple" can be split as "apple pen apple". Note that the word "apple" is reused.' },
        { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: 'false' }
      ],
      constraints: [
        '1 <= s.length <= 300',
        '1 <= wordDict.length <= 1000',
        '1 <= wordDict[i].length <= 20',
        's and wordDict[i] consist of only lowercase English letters.',
        'All the strings of wordDict are unique.'
      ],
      followUp: ''
    },

    p37: {
      source: 'GeeksforGeeks', title: 'Matrix Chain Multiplication', difficulty: 'Hard',
      url: 'https://www.geeksforgeeks.org/problems/matrix-chain-multiplication0303/1',
      statement:
        '<p>You are given an array <code>arr[]</code> of size <code>n</code> describing a chain of <code>n - 1</code> matrices: ' +
        'the <code>i</code>-th matrix (1-indexed) has dimensions <code>arr[i-1] x arr[i]</code>.</p>' +
        '<p>Matrix multiplication is associative, so the chain can be parenthesised in many ways, and the number of scalar ' +
        'multiplications depends on that choice (multiplying a <code>p x q</code> matrix by a <code>q x r</code> matrix costs ' +
        '<code>p * q * r</code>). Return the minimum number of scalar multiplications needed to multiply the whole chain.</p>' +
        '<p>If there is only one matrix, no multiplication is needed and the answer is <code>0</code>.</p>',
      examples: [
        { input: 'arr = [2, 1, 3, 4]', output: '20',
          explanation: 'Matrices: A (2x1), B (1x3), C (3x4). Computing A(BC) costs 1*3*4 + 2*1*4 = 12 + 8 = 20, the minimum. (AB)C would cost 2*1*3 + 2*3*4 = 30.' },
        { input: 'arr = [1, 2, 3, 4, 3]', output: '30',
          explanation: 'Matrices: A (1x2), B (2x3), C (3x4), D (4x3). ((AB)C)D costs 1*2*3 + 1*3*4 + 1*4*3 = 6 + 12 + 12 = 30.' },
        { input: 'arr = [3, 4]', output: '0',
          explanation: 'There is only one matrix, so no multiplication is required.' }
      ],
      constraints: [
        '2 <= arr.size() <= 100',
        '1 <= arr[i] <= 200'
      ],
      followUp: ''
    },

    p45: {
      source: 'LeetCode', num: 53, title: 'Maximum Subarray', difficulty: 'Medium',
      url: LC('maximum-subarray'),
      statement:
        '<p>Given an integer array <code>nums</code>, find the non-empty contiguous subarray with the largest sum and return that sum.</p>',
      examples: [
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6',
          explanation: 'The subarray [4,-1,2,1] has the largest sum, 6.' },
        { input: 'nums = [1]', output: '1',
          explanation: 'The subarray [1] has the largest sum, 1.' },
        { input: 'nums = [5,4,-1,7,8]', output: '23',
          explanation: 'The whole array [5,4,-1,7,8] has the largest sum, 23.' }
      ],
      constraints: [
        '1 <= nums.length <= 10^5',
        '-10^4 <= nums[i] <= 10^4'
      ],
      followUp: 'If you have an O(n) solution (Kadane), also try a divide-and-conquer solution, which is more subtle.'
    },

    p46: {
      source: 'LeetCode', num: 704, title: 'Binary Search', difficulty: 'Easy',
      url: LC('binary-search'),
      statement:
        '<p>You are given an array of integers <code>nums</code> sorted in ascending order and an integer <code>target</code>. ' +
        'Write a function that searches for <code>target</code> in <code>nums</code>: return its index if it is present, and ' +
        '<code>-1</code> otherwise.</p>' +
        '<p>Your algorithm must run in <code>O(log n)</code> time.</p>',
      examples: [
        { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4',
          explanation: '9 is present in nums at index 4.' },
        { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1',
          explanation: '2 does not appear in nums, so return -1.' }
      ],
      constraints: [
        '1 <= nums.length <= 10^4',
        '-10^4 < nums[i], target < 10^4',
        'All the integers in nums are unique.',
        'nums is sorted in ascending order.'
      ],
      followUp: ''
    },

    p44: sortArray('Insertion sort is O(n^2) in the worst case and will time out on the largest inputs here; use it to understand the algorithm, and note it is stable, in-place and O(n) on nearly sorted data.'),
    p47: sortArray('Merge sort meets the O(n log n) requirement in every case and is stable, but needs O(n) extra space for merging.'),
    p48: sortArray('Plain quick sort with a fixed pivot degrades to O(n^2) on sorted or all-equal inputs (both appear in the tests); use a random pivot and three-way partitioning.'),
    p49: sortArray('Values lie in [-5 * 10^4, 5 * 10^4], so counting sort with an offset of 5 * 10^4 runs in O(n + k) time with k = 10^5 + 1.'),
    p50: sortArray('Bucket sort is O(n + k) on average when values are spread evenly; think about how to map negative values to buckets and what happens when many values land in one bucket.'),
    p51: sortArray('Radix sort works digit by digit with a stable counting pass; shift all values by 5 * 10^4 (or handle negatives separately) before sorting.'),
    p54: sortArray('Heap sort runs in O(n log n) time in every case with O(1) extra space, but it is not stable.'),

    p52: {
      source: 'CSES', title: 'Minimum Euclidean Distance', difficulty: 'Hard',
      url: 'https://cses.fi/problemset/task/2194',
      statement:
        '<p>You are given <code>n</code> distinct points in the plane. Find the minimum Euclidean distance <code>d</code> between ' +
        'any two different points, and output <code>d^2</code> (the squared distance, which is always an integer).</p>' +
        '<p>For points <code>(x1, y1)</code> and <code>(x2, y2)</code> the squared distance is ' +
        '<code>(x1 - x2)^2 + (y1 - y2)^2</code>.</p>' +
        '<p>Input: the first line contains <code>n</code>. Each of the next <code>n</code> lines contains two integers ' +
        '<code>x</code> and <code>y</code>, the coordinates of a point. Output a single integer: <code>d^2</code>.</p>' +
        '<p>Note that coordinates go up to <code>10^9</code> in absolute value, so squared distances can reach about ' +
        '<code>8 * 10^18</code>; use 64-bit integers.</p>',
      examples: [
        { input: '4\n2 1\n4 4\n1 2\n6 3', output: '2',
          explanation: 'The closest pair is (2, 1) and (1, 2): (2 - 1)^2 + (1 - 2)^2 = 2.' }
      ],
      constraints: [
        '2 <= n <= 2 * 10^5',
        '-10^9 <= x, y <= 10^9',
        'All points are distinct.'
      ],
      followUp: 'A brute-force O(n^2) check is too slow; aim for O(n log n) with divide and conquer or a sweep line.'
    }
  });
})();
