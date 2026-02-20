import { NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import Challenge from '@/models/Challenge';

const SEED_CHALLENGES = [
    {
        title: "Two Sum", slug: "two-sum", difficulty: "Easy", category: "Arrays", source: "LeetCode",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.",
        examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9" }],
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
        starterCode: { python: "def twoSum(nums, target):\n    # Your code here\n    pass", javascript: "function twoSum(nums, target) {\n    // Your code here\n}", cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}", java: "public int[] twoSum(int[] nums, int target) {\n    // Your code here\n}" },
        testCases: [{ input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]", isHidden: false }, { input: "[3,2,4]\n6", expectedOutput: "[1, 2]", isHidden: false }, { input: "[3,3]\n6", expectedOutput: "[0, 1]", isHidden: true }],
        hints: ["Try using a hash map to store complements."], tags: ["array", "hashmap"]
    },
    {
        title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", category: "Stacks", source: "LeetCode",
        description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
        examples: [{ input: 's = "()"', output: "true", explanation: "" }, { input: 's = "(]"', output: "false", explanation: "" }],
        constraints: "1 <= s.length <= 10^4",
        starterCode: { python: "def isValid(s):\n    pass", javascript: "function isValid(s) {\n}", cpp: "bool isValid(string s) {\n}", java: "public boolean isValid(String s) {\n}" },
        testCases: [{ input: "()", expectedOutput: "true", isHidden: false }, { input: "(]", expectedOutput: "false", isHidden: false }, { input: "()[]{}", expectedOutput: "true", isHidden: true }],
        hints: ["Use a stack."], tags: ["stack", "string"]
    },
    {
        title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", category: "Linked Lists", source: "LeetCode",
        description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
        examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "" }],
        constraints: "The number of nodes in the list is [0, 5000].",
        starterCode: { python: "def reverseList(head):\n    pass", javascript: "function reverseList(head) {\n}", cpp: "ListNode* reverseList(ListNode* head) {\n}", java: "public ListNode reverseList(ListNode head) {\n}" },
        testCases: [{ input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]", isHidden: false }],
        hints: ["Use three pointers: prev, curr, next."], tags: ["linked-list", "recursion"]
    },
    {
        title: "Best Time to Buy and Sell Stock", slug: "best-time-buy-sell-stock", difficulty: "Easy", category: "Arrays", source: "LeetCode",
        description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
        examples: [{ input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6)" }],
        constraints: "1 <= prices.length <= 10^5",
        starterCode: { python: "def maxProfit(prices):\n    pass", javascript: "function maxProfit(prices) {\n}", cpp: "int maxProfit(vector<int>& prices) {\n}", java: "public int maxProfit(int[] prices) {\n}" },
        testCases: [{ input: "[7,1,5,3,6,4]", expectedOutput: "5", isHidden: false }, { input: "[7,6,4,3,1]", expectedOutput: "0", isHidden: false }],
        hints: ["Track the minimum price seen so far."], tags: ["array", "greedy"]
    },
    {
        title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", category: "Linked Lists", source: "LeetCode",
        description: "Merge two sorted linked lists and return it as a sorted list.",
        examples: [{ input: "l1 = [1,2,4], l2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "" }],
        constraints: "Both lists are sorted in non-decreasing order.",
        starterCode: { python: "def mergeTwoLists(l1, l2):\n    pass", javascript: "function mergeTwoLists(l1, l2) {\n}", cpp: "ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n}", java: "public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n}" },
        testCases: [{ input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]", isHidden: false }],
        hints: ["Use a dummy head node."], tags: ["linked-list", "recursion"]
    },
    {
        title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", category: "Dynamic Programming", source: "LeetCode",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." }],
        constraints: "1 <= nums.length <= 10^5",
        starterCode: { python: "def maxSubArray(nums):\n    pass", javascript: "function maxSubArray(nums) {\n}", cpp: "int maxSubArray(vector<int>& nums) {\n}", java: "public int maxSubArray(int[] nums) {\n}" },
        testCases: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", isHidden: false }, { input: "[1]", expectedOutput: "1", isHidden: false }, { input: "[5,4,-1,7,8]", expectedOutput: "23", isHidden: true }],
        hints: ["Kadane's Algorithm."], tags: ["dp", "array", "divide-and-conquer"]
    },
    {
        title: "3Sum", slug: "3sum", difficulty: "Medium", category: "Arrays", source: "LeetCode",
        description: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
        examples: [{ input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "" }],
        constraints: "3 <= nums.length <= 3000",
        starterCode: { python: "def threeSum(nums):\n    pass", javascript: "function threeSum(nums) {\n}", cpp: "vector<vector<int>> threeSum(vector<int>& nums) {\n}", java: "public List<List<Integer>> threeSum(int[] nums) {\n}" },
        testCases: [{ input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]", isHidden: false }],
        hints: ["Sort the array first, then use two pointers."], tags: ["array", "two-pointers", "sorting"]
    },
    {
        title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", category: "Two Pointers", source: "LeetCode",
        description: "Given `n` non-negative integers `a1, a2, ..., an`, where each represents a point at coordinate `(i, ai)`, find two lines that together with the x-axis form a container that holds the most water.",
        examples: [{ input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "" }],
        constraints: "n >= 2",
        starterCode: { python: "def maxArea(height):\n    pass", javascript: "function maxArea(height) {\n}", cpp: "int maxArea(vector<int>& height) {\n}", java: "public int maxArea(int[] height) {\n}" },
        testCases: [{ input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49", isHidden: false }, { input: "[1,1]", expectedOutput: "1", isHidden: true }],
        hints: ["Use two pointers from both ends."], tags: ["two-pointers", "greedy"]
    },
    {
        title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", category: "Hash Map", source: "LeetCode",
        description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
        examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: "" }],
        constraints: "1 <= strs.length <= 10^4",
        starterCode: { python: "def groupAnagrams(strs):\n    pass", javascript: "function groupAnagrams(strs) {\n}", cpp: "vector<vector<string>> groupAnagrams(vector<string>& strs) {\n}", java: "public List<List<String>> groupAnagrams(String[] strs) {\n}" },
        testCases: [{ input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isHidden: false }],
        hints: ["Sort each word and use it as a key in a hash map."], tags: ["hashmap", "string", "sorting"]
    },
    {
        title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order", difficulty: "Medium", category: "Trees", source: "LeetCode",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
        examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", explanation: "" }],
        constraints: "The number of nodes is in the range [0, 2000].",
        starterCode: { python: "def levelOrder(root):\n    pass", javascript: "function levelOrder(root) {\n}", cpp: "vector<vector<int>> levelOrder(TreeNode* root) {\n}", java: "public List<List<Integer>> levelOrder(TreeNode root) {\n}" },
        testCases: [{ input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]", isHidden: false }],
        hints: ["Use BFS with a queue."], tags: ["tree", "bfs"]
    },
    {
        title: "Longest Substring Without Repeating Characters", slug: "longest-substring-no-repeat", difficulty: "Medium", category: "Sliding Window", source: "LeetCode",
        description: "Given a string `s`, find the length of the longest substring without repeating characters.",
        examples: [{ input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' }],
        constraints: "0 <= s.length <= 5 * 10^4",
        starterCode: { python: "def lengthOfLongestSubstring(s):\n    pass", javascript: "function lengthOfLongestSubstring(s) {\n}", cpp: "int lengthOfLongestSubstring(string s) {\n}", java: "public int lengthOfLongestSubstring(String s) {\n}" },
        testCases: [{ input: "abcabcbb", expectedOutput: "3", isHidden: false }, { input: "bbbbb", expectedOutput: "1", isHidden: false }, { input: "pwwkew", expectedOutput: "3", isHidden: true }],
        hints: ["Use a sliding window with a set."], tags: ["sliding-window", "hashmap", "string"]
    },
    {
        title: "Coin Change", slug: "coin-change", difficulty: "Medium", category: "Dynamic Programming", source: "LeetCode",
        description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins needed to make up that amount. If that amount cannot be made up, return `-1`.",
        examples: [{ input: "coins = [1,5,11], amount = 11", output: "1", explanation: "11 = 11" }],
        constraints: "1 <= coins.length <= 12\n0 <= amount <= 10^4",
        starterCode: { python: "def coinChange(coins, amount):\n    pass", javascript: "function coinChange(coins, amount) {\n}", cpp: "int coinChange(vector<int>& coins, int amount) {\n}", java: "public int coinChange(int[] coins, int amount) {\n}" },
        testCases: [{ input: "[1,5,11]\n11", expectedOutput: "1", isHidden: false }, { input: "[2]\n3", expectedOutput: "-1", isHidden: false }, { input: "[1]\n0", expectedOutput: "0", isHidden: true }],
        hints: ["Bottom-up DP: dp[i] = min coins to make amount i."], tags: ["dp", "bfs"]
    },
    {
        title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", category: "Graphs", source: "LeetCode",
        description: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites`. Return `true` if you can finish all courses. Otherwise, return `false`.",
        examples: [{ input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "" }],
        constraints: "1 <= numCourses <= 2000",
        starterCode: { python: "def canFinish(numCourses, prerequisites):\n    pass", javascript: "function canFinish(numCourses, prerequisites) {\n}", cpp: "bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n}", java: "public boolean canFinish(int numCourses, int[][] prerequisites) {\n}" },
        testCases: [{ input: "2\n[[1,0]]", expectedOutput: "true", isHidden: false }, { input: "2\n[[1,0],[0,1]]", expectedOutput: "false", isHidden: false }],
        hints: ["Topological sort or cycle detection via DFS."], tags: ["graph", "topological-sort", "bfs", "dfs"]
    },
    {
        title: "Word Search", slug: "word-search", difficulty: "Medium", category: "Backtracking", source: "LeetCode",
        description: "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid. The word can be constructed from letters of sequentially adjacent cells.",
        examples: [{ input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true", explanation: "" }],
        constraints: "m, n >= 1, 1 <= word.length <= 15",
        starterCode: { python: "def exist(board, word):\n    pass", javascript: "function exist(board, word) {\n}", cpp: "bool exist(vector<vector<char>>& board, string word) {\n}", java: "public boolean exist(char[][] board, String word) {\n}" },
        testCases: [{ input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCCED', expectedOutput: "true", isHidden: false }],
        hints: ["DFS + backtracking."], tags: ["backtracking", "matrix", "dfs"]
    },
    {
        title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", category: "Arrays", source: "LeetCode",
        description: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals.",
        examples: [{ input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "[1,3] and [2,6] overlap." }],
        constraints: "1 <= intervals.length <= 10^4",
        starterCode: { python: "def merge(intervals):\n    pass", javascript: "function merge(intervals) {\n}", cpp: "vector<vector<int>> merge(vector<vector<int>>& intervals) {\n}", java: "public int[][] merge(int[][] intervals) {\n}" },
        testCases: [{ input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]", isHidden: false }],
        hints: ["Sort by start time, then merge."], tags: ["array", "sorting"]
    },
    {
        title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", category: "Two Pointers", source: "LeetCode",
        description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "" }],
        constraints: "n >= 1",
        starterCode: { python: "def trap(height):\n    pass", javascript: "function trap(height) {\n}", cpp: "int trap(vector<int>& height) {\n}", java: "public int trap(int[] height) {\n}" },
        testCases: [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6", isHidden: false }, { input: "[4,2,0,3,2,5]", expectedOutput: "9", isHidden: true }],
        hints: ["Two pointer approach: track left_max, right_max."], tags: ["two-pointers", "stack", "dp"]
    },
    {
        title: "Median of Two Sorted Arrays", slug: "median-two-sorted-arrays", difficulty: "Hard", category: "Binary Search", source: "LeetCode",
        description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
        examples: [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.0", explanation: "merged = [1,2,3] → median = 2.0" }],
        constraints: "0 <= m, n <= 1000",
        starterCode: { python: "def findMedianSortedArrays(nums1, nums2):\n    pass", javascript: "function findMedianSortedArrays(nums1, nums2) {\n}", cpp: "double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n}", java: "public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n}" },
        testCases: [{ input: "[1,3]\n[2]", expectedOutput: "2.0", isHidden: false }, { input: "[1,2]\n[3,4]", expectedOutput: "2.5", isHidden: false }],
        hints: ["Binary search on the shorter array."], tags: ["binary-search", "divide-and-conquer"]
    },
    {
        title: "Word Ladder", slug: "word-ladder", difficulty: "Hard", category: "BFS", source: "LeetCode",
        description: "Given two words, `beginWord` and `endWord`, and a dictionary's word list, return the number of words in the shortest transformation sequence from `beginWord` to `endWord`. Each transformed word must exist in the word list.",
        examples: [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", explanation: 'hit → hot → dot → dog → cog' }],
        constraints: "1 <= beginWord.length <= 10",
        starterCode: { python: "def ladderLength(beginWord, endWord, wordList):\n    pass", javascript: "function ladderLength(beginWord, endWord, wordList) {\n}", cpp: "int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n}", java: "public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n}" },
        testCases: [{ input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: "5", isHidden: false }],
        hints: ["BFS level-by-level."], tags: ["bfs", "hashmap"]
    },
    {
        title: "Serialize and Deserialize Binary Tree", slug: "serialize-deserialize-tree", difficulty: "Hard", category: "Trees", source: "LeetCode",
        description: "Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work.",
        examples: [{ input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]", explanation: "" }],
        constraints: "The number of nodes is in [0, 10^4].",
        starterCode: { python: "class Codec:\n    def serialize(self, root):\n        pass\n    def deserialize(self, data):\n        pass", javascript: "function serialize(root) { }\nfunction deserialize(data) { }", cpp: "string serialize(TreeNode* root) { }\nTreeNode* deserialize(string data) { }", java: "public String serialize(TreeNode root) { }\npublic TreeNode deserialize(String data) { }" },
        testCases: [{ input: "[1,2,3,null,null,4,5]", expectedOutput: "[1,2,3,null,null,4,5]", isHidden: false }],
        hints: ["Use preorder traversal with null markers."], tags: ["tree", "design", "bfs", "dfs"]
    },
    {
        title: "LRU Cache", slug: "lru-cache", difficulty: "Hard", category: "Design", source: "LeetCode",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class with `get(key)` and `put(key, value)` in O(1) time complexity.",
        examples: [{ input: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)', output: "1, -1", explanation: "After put(3,3), key 2 was evicted." }],
        constraints: "1 <= capacity <= 3000",
        starterCode: { python: "class LRUCache:\n    def __init__(self, capacity):\n        pass\n    def get(self, key):\n        pass\n    def put(self, key, value):\n        pass", javascript: "class LRUCache {\n    constructor(capacity) { }\n    get(key) { }\n    put(key, value) { }\n}", cpp: "class LRUCache {\npublic:\n    LRUCache(int capacity) { }\n    int get(int key) { }\n    void put(int key, int value) { }\n};", java: "class LRUCache {\n    public LRUCache(int capacity) { }\n    public int get(int key) { }\n    public void put(int key, int value) { }\n}" },
        testCases: [{ input: "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2", expectedOutput: "1\n-1", isHidden: false }],
        hints: ["HashMap + Doubly Linked List."], tags: ["design", "hashmap", "linked-list"]
    },
];

export async function POST() {
    try {
        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        // Upsert each challenge by slug
        let created = 0;
        let updated = 0;
        for (const c of SEED_CHALLENGES) {
            const existing = await Challenge.findOne({ slug: c.slug });
            if (existing) {
                await Challenge.updateOne({ slug: c.slug }, { $set: c });
                updated++;
            } else {
                await Challenge.create(c);
                created++;
            }
        }

        return NextResponse.json({
            message: `Seed complete: ${created} created, ${updated} updated.`,
            total: SEED_CHALLENGES.length
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
