import { NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import Challenge from '@/models/Challenge';

export const dynamic = 'force-dynamic';

const SEED_CHALLENGES = [
    // ═══════════════════════════════════════════
    //  BEGINNER TRACK (Easy) — 8 problems
    // ═══════════════════════════════════════════
    {
        title: "Two Sum", slug: "two-sum", difficulty: "Easy", track: "Beginner", category: "Arrays", source: "LeetCode",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.",
        examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9" }],
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
        starterCode: { python: "def twoSum(nums, target):\n    # Your code here\n    pass", javascript: "function twoSum(nums, target) {\n    // Your code here\n}", cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n}", java: "public int[] twoSum(int[] nums, int target) {\n    // Your code here\n}" },
        testCases: [{ input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]", isHidden: false }, { input: "[3,2,4]\n6", expectedOutput: "[1, 2]", isHidden: false }, { input: "[3,3]\n6", expectedOutput: "[0, 1]", isHidden: true }],
        hints: ["Try using a hash map to store complements."], tags: ["array", "hashmap"],
        mentorInsights: { commonMistakes: ["Using brute force nested loop O(N^2).", "Forgetting a number can't be used twice."], proTips: ["One-pass hash map solves in O(N)."], recruiterNotes: "Classic phone screen question. Explain the space/time trade-off." },
        bonusLinks: [{ label: "LeetCode #1", url: "https://leetcode.com/problems/two-sum/" }]
    },
    {
        title: "Valid Parentheses", slug: "valid-parentheses", difficulty: "Easy", track: "Beginner", category: "Stacks", source: "LeetCode",
        description: "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
        examples: [{ input: 's = "()"', output: "true", explanation: "" }, { input: 's = "(]"', output: "false", explanation: "" }],
        constraints: "1 <= s.length <= 10^4",
        starterCode: { python: "def isValid(s):\n    pass", javascript: "function isValid(s) {\n}", cpp: "bool isValid(string s) {\n}", java: "public boolean isValid(String s) {\n}" },
        testCases: [{ input: "()", expectedOutput: "true", isHidden: false }, { input: "(]", expectedOutput: "false", isHidden: false }, { input: "()[]{}", expectedOutput: "true", isHidden: true }],
        hints: ["Use a stack data structure."], tags: ["stack", "string"],
        mentorInsights: { commonMistakes: ["Forgetting to check if stack is empty at end.", "Not handling edge case of single character."], proTips: ["Map closing brackets to opening brackets for clean code."], recruiterNotes: "Tests understanding of stack-based parsing—foundational for compilers." },
        bonusLinks: [{ label: "LeetCode #20", url: "https://leetcode.com/problems/valid-parentheses/" }]
    },
    {
        title: "Reverse Linked List", slug: "reverse-linked-list", difficulty: "Easy", track: "Beginner", category: "Linked Lists", source: "LeetCode",
        description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
        examples: [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "" }],
        constraints: "The number of nodes is [0, 5000].",
        starterCode: { python: "def reverseList(head):\n    pass", javascript: "function reverseList(head) {\n}", cpp: "ListNode* reverseList(ListNode* head) {\n}", java: "public ListNode reverseList(ListNode head) {\n}" },
        testCases: [{ input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]", isHidden: false }],
        hints: ["Use three pointers: prev, curr, next."], tags: ["linked-list", "recursion"],
        mentorInsights: { commonMistakes: ["Losing reference to the next node before updating pointers."], proTips: ["Iterative approach uses O(1) space. Recursive uses O(N) call stack."], recruiterNotes: "Absolutely fundamental. Must be solved in under 5 minutes." },
        bonusLinks: [{ label: "LeetCode #206", url: "https://leetcode.com/problems/reverse-linked-list/" }]
    },
    {
        title: "Best Time to Buy and Sell Stock", slug: "best-time-buy-sell-stock", difficulty: "Easy", track: "Beginner", category: "Arrays", source: "LeetCode",
        description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
        examples: [{ input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6)" }],
        constraints: "1 <= prices.length <= 10^5",
        starterCode: { python: "def maxProfit(prices):\n    pass", javascript: "function maxProfit(prices) {\n}", cpp: "int maxProfit(vector<int>& prices) {\n}", java: "public int maxProfit(int[] prices) {\n}" },
        testCases: [{ input: "[7,1,5,3,6,4]", expectedOutput: "5", isHidden: false }, { input: "[7,6,4,3,1]", expectedOutput: "0", isHidden: false }],
        hints: ["Track the minimum price seen so far."], tags: ["array", "greedy"],
        mentorInsights: { commonMistakes: ["Using O(N^2) comparing all pairs."], proTips: ["One pass: track min_price and max_profit simultaneously."], recruiterNotes: "Very common in finance tech interviews." },
        bonusLinks: [{ label: "LeetCode #121", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" }]
    },
    {
        title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", difficulty: "Easy", track: "Beginner", category: "Linked Lists", source: "LeetCode",
        description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
        examples: [{ input: "l1 = [1,2,4], l2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "" }],
        constraints: "Both lists are sorted in non-decreasing order.",
        starterCode: { python: "def mergeTwoLists(l1, l2):\n    pass", javascript: "function mergeTwoLists(l1, l2) {\n}", cpp: "ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\n}", java: "public ListNode mergeTwoLists(ListNode l1, ListNode l2) {\n}" },
        testCases: [{ input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1,1,2,3,4,4]", isHidden: false }],
        hints: ["Use a dummy head node."], tags: ["linked-list", "recursion"],
        mentorInsights: { commonMistakes: ["Mishandling null inputs."], proTips: ["Dummy head simplifies all edge cases."], recruiterNotes: "Tests pointer manipulation basics." },
        bonusLinks: [{ label: "LeetCode #21", url: "https://leetcode.com/problems/merge-two-sorted-lists/" }]
    },
    {
        title: "Combine Two Tables (SQL)", slug: "combine-two-tables", difficulty: "Easy", track: "Beginner", category: "SQL", source: "LeetCode",
        description: "Write an SQL query to report the `firstName`, `lastName`, `city`, and `state` of each person in the `Person` table. If the address of a `personId` is not present in the `Address` table, report `null` instead.\n\nReturn the result table in any order.",
        examples: [{ input: "Person: [[1,'Wang','Allen'],[2,'Alice','Bob']]\nAddress: [[1,2,'NYC','NY']]", output: "Allen Wang null null\nBob Alice NYC NY", explanation: "Allen has no address row." }],
        constraints: "N/A",
        starterCode: { python: "-- Write your SQL query below\nSELECT\n  p.firstName,\n  p.lastName,\n  a.city,\n  a.state\nFROM Person p\nLEFT JOIN Address a ON p.personId = a.personId;", javascript: "-- SQL question: use Python tab\n", cpp: "", java: "" },
        testCases: [{ input: "Person:[[1,'Wang','Allen'],[2,'Alice','Bob']]\nAddress:[[1,2,'NYC','NY']]", expectedOutput: "Allen Wang null null\nBob Alice NYC NY", isHidden: false }],
        hints: ["Use LEFT JOIN, not INNER JOIN."], tags: ["sql", "joins", "database"],
        mentorInsights: { commonMistakes: ["Using INNER JOIN which drops rows without addresses."], proTips: ["Always alias your tables for readability."], recruiterNotes: "Fundamental SQL question for any data role." },
        bonusLinks: [{ label: "LeetCode #175", url: "https://leetcode.com/problems/combine-two-tables/" }]
    },
    {
        title: "Create DataFrame from List (Pandas)", slug: "create-dataframe-from-list", difficulty: "Easy", track: "Beginner", category: "Pandas", source: "LeetCode",
        description: "Write a solution to create a DataFrame from a 2D list called `student_data`. This 2D list contains the IDs and ages of some students.\n\nThe DataFrame should have two columns, `student_id` and `age`, and be in the same order as the original 2D list.",
        examples: [{ input: "student_data = [[1,15],[2,11],[3,11],[4,20]]", output: "student_id  age\n1           15\n2           11\n3           11\n4           20", explanation: "" }],
        constraints: "N/A",
        starterCode: { python: "import pandas as pd\n\ndef createDataframe(student_data):\n    pass", javascript: "// Pandas: use Python tab\n", cpp: "", java: "" },
        testCases: [{ input: "[[1,15],[2,11],[3,11],[4,20]]", expectedOutput: "1 15\n2 11\n3 11\n4 20", isHidden: false }],
        hints: ["Use pd.DataFrame() with the columns keyword argument."], tags: ["pandas", "dataframe"],
        mentorInsights: { commonMistakes: ["Forgetting to name columns."], proTips: ["Pandas is the backbone of Python data pipelines."], recruiterNotes: "Warm-up for data science interviews." },
        bonusLinks: [{ label: "LeetCode #2877", url: "https://leetcode.com/problems/create-a-dataframe-from-list/" }]
    },
    {
        title: "FizzBuzz", slug: "fizzbuzz", difficulty: "Easy", track: "Beginner", category: "Math", source: "HackerRank",
        description: "Given an integer `n`, return a string array `answer` where:\n- `answer[i] == \"FizzBuzz\"` if `i` is divisible by 3 and 5.\n- `answer[i] == \"Fizz\"` if `i` is divisible by 3.\n- `answer[i] == \"Buzz\"` if `i` is divisible by 5.\n- `answer[i] == i` (as a string) otherwise.",
        examples: [{ input: "n = 15", output: "[1,2,Fizz,4,Buzz,...,FizzBuzz]", explanation: "" }],
        constraints: "1 <= n <= 10^4",
        starterCode: { python: "def fizzBuzz(n):\n    pass", javascript: "function fizzBuzz(n) {\n}", cpp: "vector<string> fizzBuzz(int n) {\n}", java: "public List<String> fizzBuzz(int n) {\n}" },
        testCases: [{ input: "3", expectedOutput: "[1,2,Fizz]", isHidden: false }, { input: "15", expectedOutput: "[1,2,Fizz,4,Buzz,Fizz,7,8,Fizz,Buzz,11,Fizz,13,14,FizzBuzz]", isHidden: false }],
        hints: ["Check divisibility by 15 first, then 3, then 5."], tags: ["math", "string"],
        mentorInsights: { commonMistakes: ["Checking 3 and 5 before 15."], proTips: ["Elegant: build the string conditionally, concatenating Fizz and Buzz."], recruiterNotes: "Classic warm-up. Speed and clarity matter here." },
        bonusLinks: [{ label: "HackerRank", url: "https://www.hackerrank.com/challenges/fizzbuzz" }]
    },

    // ═══════════════════════════════════════════
    //  INTERMEDIATE TRACK (Medium) — 10 problems
    // ═══════════════════════════════════════════
    {
        title: "Maximum Subarray", slug: "maximum-subarray", difficulty: "Medium", track: "Intermediate", category: "Dynamic Programming", source: "LeetCode",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." }],
        constraints: "1 <= nums.length <= 10^5",
        starterCode: { python: "def maxSubArray(nums):\n    pass", javascript: "function maxSubArray(nums) {\n}", cpp: "int maxSubArray(vector<int>& nums) {\n}", java: "public int maxSubArray(int[] nums) {\n}" },
        testCases: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", isHidden: false }, { input: "[1]", expectedOutput: "1", isHidden: false }, { input: "[5,4,-1,7,8]", expectedOutput: "23", isHidden: true }],
        hints: ["Kadane's Algorithm."], tags: ["dp", "array", "divide-and-conquer"],
        mentorInsights: { commonMistakes: ["Using O(N^2) brute force.", "Returning 0 for all-negative arrays."], proTips: ["Kadane's: track current_sum and max_sum in one pass."], recruiterNotes: "Always mention Kadane's by name." },
        bonusLinks: [{ label: "LeetCode #53", url: "https://leetcode.com/problems/maximum-subarray/" }]
    },
    {
        title: "3Sum", slug: "3sum", difficulty: "Medium", track: "Intermediate", category: "Arrays", source: "LeetCode",
        description: "Given an integer array nums, return all triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nThe solution set must not contain duplicate triplets.",
        examples: [{ input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "" }],
        constraints: "3 <= nums.length <= 3000",
        starterCode: { python: "def threeSum(nums):\n    pass", javascript: "function threeSum(nums) {\n}", cpp: "vector<vector<int>> threeSum(vector<int>& nums) {\n}", java: "public List<List<Integer>> threeSum(int[] nums) {\n}" },
        testCases: [{ input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]", isHidden: false }],
        hints: ["Sort the array first, then use two pointers."], tags: ["array", "two-pointers", "sorting"],
        mentorInsights: { commonMistakes: ["Not handling duplicates.", "O(N^3) brute force."], proTips: ["Sort + fix one element + two pointers = O(N^2)."], recruiterNotes: "Tests ability to handle duplicates elegantly." },
        bonusLinks: [{ label: "LeetCode #15", url: "https://leetcode.com/problems/3sum/" }]
    },
    {
        title: "Container With Most Water", slug: "container-with-most-water", difficulty: "Medium", track: "Intermediate", category: "Two Pointers", source: "LeetCode",
        description: "Given `n` non-negative integers `a1, a2, ..., an`, each representing a point at coordinate `(i, ai)`, find two lines that together with the x-axis form a container that holds the most water.",
        examples: [{ input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "" }],
        constraints: "n >= 2",
        starterCode: { python: "def maxArea(height):\n    pass", javascript: "function maxArea(height) {\n}", cpp: "int maxArea(vector<int>& height) {\n}", java: "public int maxArea(int[] height) {\n}" },
        testCases: [{ input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49", isHidden: false }, { input: "[1,1]", expectedOutput: "1", isHidden: true }],
        hints: ["Use two pointers from both ends."], tags: ["two-pointers", "greedy"],
        mentorInsights: { commonMistakes: ["O(N^2) checking all pairs."], proTips: ["Move the pointer with the shorter line inward."], recruiterNotes: "Greedy + two pointers mastery check." },
        bonusLinks: [{ label: "LeetCode #11", url: "https://leetcode.com/problems/container-with-most-water/" }]
    },
    {
        title: "Group Anagrams", slug: "group-anagrams", difficulty: "Medium", track: "Intermediate", category: "Hash Map", source: "LeetCode",
        description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
        examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: "" }],
        constraints: "1 <= strs.length <= 10^4",
        starterCode: { python: "def groupAnagrams(strs):\n    pass", javascript: "function groupAnagrams(strs) {\n}", cpp: "vector<vector<string>> groupAnagrams(vector<string>& strs) {\n}", java: "public List<List<String>> groupAnagrams(String[] strs) {\n}" },
        testCases: [{ input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isHidden: false }],
        hints: ["Sort each word and use it as a hash map key."], tags: ["hashmap", "string", "sorting"],
        mentorInsights: { commonMistakes: ["Not sorting or using a canonical form as key."], proTips: ["Character frequency tuple as key avoids O(K log K) sorting per word."], recruiterNotes: "Tests hash map fluency." },
        bonusLinks: [{ label: "LeetCode #49", url: "https://leetcode.com/problems/group-anagrams/" }]
    },
    {
        title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order", difficulty: "Medium", track: "Intermediate", category: "Trees", source: "LeetCode",
        description: "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
        examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", explanation: "" }],
        constraints: "Number of nodes in [0, 2000].",
        starterCode: { python: "def levelOrder(root):\n    pass", javascript: "function levelOrder(root) {\n}", cpp: "vector<vector<int>> levelOrder(TreeNode* root) {\n}", java: "public List<List<Integer>> levelOrder(TreeNode root) {\n}" },
        testCases: [{ input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]", isHidden: false }],
        hints: ["Use BFS with a queue."], tags: ["tree", "bfs"],
        mentorInsights: { commonMistakes: ["Mixing up BFS and DFS.", "Not tracking level boundaries."], proTips: ["Process queue in batches using queue length at each level."], recruiterNotes: "Core tree traversal. Must be solved cleanly." },
        bonusLinks: [{ label: "LeetCode #102", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" }]
    },
    {
        title: "Longest Substring Without Repeating Characters", slug: "longest-substring-no-repeat", difficulty: "Medium", track: "Intermediate", category: "Sliding Window", source: "LeetCode",
        description: "Given a string `s`, find the length of the longest substring without repeating characters.",
        examples: [{ input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' }],
        constraints: "0 <= s.length <= 5 * 10^4",
        starterCode: { python: "def lengthOfLongestSubstring(s):\n    pass", javascript: "function lengthOfLongestSubstring(s) {\n}", cpp: "int lengthOfLongestSubstring(string s) {\n}", java: "public int lengthOfLongestSubstring(String s) {\n}" },
        testCases: [{ input: "abcabcbb", expectedOutput: "3", isHidden: false }, { input: "bbbbb", expectedOutput: "1", isHidden: false }, { input: "pwwkew", expectedOutput: "3", isHidden: true }],
        hints: ["Sliding window with a set or hash map."], tags: ["sliding-window", "hashmap", "string"],
        mentorInsights: { commonMistakes: ["Checking all substrings O(N^3).", "Not updating the window start correctly."], proTips: ["Sliding window: move right expanding, shrink left on duplicate."], recruiterNotes: "Amazon, Google, Meta favorite." },
        bonusLinks: [{ label: "LeetCode #3", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" }]
    },
    {
        title: "Coin Change", slug: "coin-change", difficulty: "Medium", track: "Intermediate", category: "Dynamic Programming", source: "LeetCode",
        description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount`. Return the fewest number of coins needed to make up that amount. If it cannot be made up, return `-1`.",
        examples: [{ input: "coins = [1,5,11], amount = 11", output: "1", explanation: "11 = 11" }],
        constraints: "1 <= coins.length <= 12\n0 <= amount <= 10^4",
        starterCode: { python: "def coinChange(coins, amount):\n    pass", javascript: "function coinChange(coins, amount) {\n}", cpp: "int coinChange(vector<int>& coins, int amount) {\n}", java: "public int coinChange(int[] coins, int amount) {\n}" },
        testCases: [{ input: "[1,5,11]\n11", expectedOutput: "1", isHidden: false }, { input: "[2]\n3", expectedOutput: "-1", isHidden: false }, { input: "[1]\n0", expectedOutput: "0", isHidden: true }],
        hints: ["Bottom-up DP: dp[i] = min coins for amount i."], tags: ["dp", "bfs"],
        mentorInsights: { commonMistakes: ["Greedy doesn't work here.", "Off-by-one in dp array initialization."], proTips: ["Initialize dp with amount+1 (impossible value) and iterate coins."], recruiterNotes: "Classic DP—expected in all top-tier interviews." },
        bonusLinks: [{ label: "LeetCode #322", url: "https://leetcode.com/problems/coin-change/" }]
    },
    {
        title: "Course Schedule", slug: "course-schedule", difficulty: "Medium", track: "Intermediate", category: "Graphs", source: "LeetCode",
        description: "There are `numCourses` courses labeled from `0` to `numCourses - 1`. You are given an array `prerequisites`. Return `true` if you can finish all courses, otherwise return `false`.",
        examples: [{ input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "" }],
        constraints: "1 <= numCourses <= 2000",
        starterCode: { python: "def canFinish(numCourses, prerequisites):\n    pass", javascript: "function canFinish(numCourses, prerequisites) {\n}", cpp: "bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n}", java: "public boolean canFinish(int numCourses, int[][] prerequisites) {\n}" },
        testCases: [{ input: "2\n[[1,0]]", expectedOutput: "true", isHidden: false }, { input: "2\n[[1,0],[0,1]]", expectedOutput: "false", isHidden: false }],
        hints: ["Topological sort or cycle detection via DFS."], tags: ["graph", "topological-sort", "bfs", "dfs"],
        mentorInsights: { commonMistakes: ["Not detecting cycles properly.", "Confusing directed vs undirected graph."], proTips: ["Use three states in DFS: unvisited, visiting, visited."], recruiterNotes: "Tests graph traversal + cycle detection." },
        bonusLinks: [{ label: "LeetCode #207", url: "https://leetcode.com/problems/course-schedule/" }]
    },
    {
        title: "Rising Temperature (SQL)", slug: "rising-temperature", difficulty: "Medium", track: "Intermediate", category: "SQL", source: "LeetCode",
        description: "Write an SQL query to find all dates' `Id` with higher temperatures compared to its previous dates (yesterday).",
        examples: [{ input: "Weather: [[1,'2015-01-01',10],[2,'2015-01-02',25],[3,'2015-01-03',20],[4,'2015-01-04',30]]", output: "id: 2, 4", explanation: "Day 2 was 25 > 10, Day 4 was 30 > 20." }],
        constraints: "N/A",
        starterCode: { python: "-- Write your SQL query\nSELECT w1.id\nFROM Weather w1\nJOIN Weather w2\n  ON DATEDIFF(w1.recordDate, w2.recordDate) = 1\nWHERE w1.temperature > w2.temperature;", javascript: "-- SQL: use Python tab\n", cpp: "", java: "" },
        testCases: [{ input: "Weather:[[1,'2015-01-01',10],[2,'2015-01-02',25],[3,'2015-01-03',20],[4,'2015-01-04',30]]", expectedOutput: "2\n4", isHidden: false }],
        hints: ["Self join with DATEDIFF."], tags: ["sql", "self-join", "database"],
        mentorInsights: { commonMistakes: ["Comparing by id instead of date."], proTips: ["DATEDIFF is more robust than id arithmetic."], recruiterNotes: "Self joins appear frequently in analytics roles." },
        bonusLinks: [{ label: "LeetCode #197", url: "https://leetcode.com/problems/rising-temperature/" }]
    },
    {
        title: "Merge Intervals", slug: "merge-intervals", difficulty: "Medium", track: "Intermediate", category: "Arrays", source: "LeetCode",
        description: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals.",
        examples: [{ input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "[1,3] and [2,6] overlap." }],
        constraints: "1 <= intervals.length <= 10^4",
        starterCode: { python: "def merge(intervals):\n    pass", javascript: "function merge(intervals) {\n}", cpp: "vector<vector<int>> merge(vector<vector<int>>& intervals) {\n}", java: "public int[][] merge(int[][] intervals) {\n}" },
        testCases: [{ input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]", isHidden: false }],
        hints: ["Sort by start time, then merge."], tags: ["array", "sorting"],
        mentorInsights: { commonMistakes: ["Not sorting first.", "Off-by-one with overlapping intervals."], proTips: ["Sort + single pass: extend end if overlapping."], recruiterNotes: "Very common at Google and Microsoft." },
        bonusLinks: [{ label: "LeetCode #56", url: "https://leetcode.com/problems/merge-intervals/" }]
    },

    // ═══════════════════════════════════════════
    //  ADVANCED TRACK (Hard) — 7 problems
    // ═══════════════════════════════════════════
    {
        title: "Trapping Rain Water", slug: "trapping-rain-water", difficulty: "Hard", track: "Advanced", category: "Two Pointers", source: "LeetCode",
        description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        examples: [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "" }],
        constraints: "n >= 1",
        starterCode: { python: "def trap(height):\n    pass", javascript: "function trap(height) {\n}", cpp: "int trap(vector<int>& height) {\n}", java: "public int trap(int[] height) {\n}" },
        testCases: [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6", isHidden: false }, { input: "[4,2,0,3,2,5]", expectedOutput: "9", isHidden: true }],
        hints: ["Two pointer approach: track left_max, right_max."], tags: ["two-pointers", "stack", "dp"],
        mentorInsights: { commonMistakes: ["O(N^2) brute force per index.", "Not handling monotonically decreasing terrain."], proTips: ["O(N) time, O(1) space with two pointers.", "Monotonic stack is another elegant approach."], recruiterNotes: "Separates senior from mid-level candidates." },
        bonusLinks: [{ label: "LeetCode #42", url: "https://leetcode.com/problems/trapping-rain-water/" }]
    },
    {
        title: "Median of Two Sorted Arrays", slug: "median-two-sorted-arrays", difficulty: "Hard", track: "Advanced", category: "Binary Search", source: "LeetCode",
        description: "Given two sorted arrays `nums1` and `nums2`, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).",
        examples: [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.0", explanation: "merged = [1,2,3] → median = 2.0" }],
        constraints: "0 <= m, n <= 1000",
        starterCode: { python: "def findMedianSortedArrays(nums1, nums2):\n    pass", javascript: "function findMedianSortedArrays(nums1, nums2) {\n}", cpp: "double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n}", java: "public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n}" },
        testCases: [{ input: "[1,3]\n[2]", expectedOutput: "2.0", isHidden: false }, { input: "[1,2]\n[3,4]", expectedOutput: "2.5", isHidden: false }],
        hints: ["Binary search on the shorter array."], tags: ["binary-search", "divide-and-conquer"],
        mentorInsights: { commonMistakes: ["Merging both arrays O(m+n) instead of binary search.", "Edge cases with empty arrays."], proTips: ["Binary search on shorter array's partition point."], recruiterNotes: "One of the hardest LeetCode problems. Shows deep algorithmic thinking." },
        bonusLinks: [{ label: "LeetCode #4", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" }]
    },
    {
        title: "Word Ladder", slug: "word-ladder", difficulty: "Hard", track: "Advanced", category: "BFS", source: "LeetCode",
        description: "Given two words `beginWord` and `endWord`, and a dictionary word list, return the number of words in the shortest transformation sequence. Each transformed word must exist in the word list.",
        examples: [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", explanation: "hit → hot → dot → dog → cog" }],
        constraints: "1 <= beginWord.length <= 10",
        starterCode: { python: "def ladderLength(beginWord, endWord, wordList):\n    pass", javascript: "function ladderLength(beginWord, endWord, wordList) {\n}", cpp: "int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n}", java: "public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n}" },
        testCases: [{ input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: "5", isHidden: false }],
        hints: ["BFS level-by-level."], tags: ["bfs", "hashmap"],
        mentorInsights: { commonMistakes: ["Using DFS (finds a path, not shortest).", "Slow neighbor generation."], proTips: ["Preprocess into wildcard adjacency list: *ot → [hot, dot, lot]."], recruiterNotes: "Hard graph problem. Top-tier candidate differentiator." },
        bonusLinks: [{ label: "LeetCode #127", url: "https://leetcode.com/problems/word-ladder/" }]
    },
    {
        title: "LRU Cache", slug: "lru-cache", difficulty: "Hard", track: "Advanced", category: "Design", source: "LeetCode",
        description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement `LRUCache` with `get(key)` and `put(key, value)` in O(1) time complexity.",
        examples: [{ input: "LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)", output: "1, -1", explanation: "After put(3,3), key 2 was evicted." }],
        constraints: "1 <= capacity <= 3000",
        starterCode: { python: "class LRUCache:\n    def __init__(self, capacity):\n        pass\n    def get(self, key):\n        pass\n    def put(self, key, value):\n        pass", javascript: "class LRUCache {\n    constructor(capacity) { }\n    get(key) { }\n    put(key, value) { }\n}", cpp: "class LRUCache {\npublic:\n    LRUCache(int capacity) { }\n    int get(int key) { }\n    void put(int key, int value) { }\n};", java: "class LRUCache {\n    public LRUCache(int capacity) { }\n    public int get(int key) { }\n    public void put(int key, int value) { }\n}" },
        testCases: [{ input: "2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2", expectedOutput: "1\n-1", isHidden: false }],
        hints: ["HashMap + Doubly Linked List."], tags: ["design", "hashmap", "linked-list"],
        mentorInsights: { commonMistakes: ["Not maintaining O(1) for both get and put.", "Memory leaks in C++ implementations."], proTips: ["OrderedDict in Python makes this trivial. Know the manual DLL approach too."], recruiterNotes: "System design fundamental. Must-know for senior roles." },
        bonusLinks: [{ label: "LeetCode #146", url: "https://leetcode.com/problems/lru-cache/" }]
    },
    {
        title: "Serialize and Deserialize Binary Tree", slug: "serialize-deserialize-tree", difficulty: "Hard", track: "Advanced", category: "Trees", source: "LeetCode",
        description: "Design an algorithm to serialize and deserialize a binary tree. There is no restriction on the algorithm. Just ensure that a tree can be serialized to a string and the string deserialized back to the original tree structure.",
        examples: [{ input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]", explanation: "" }],
        constraints: "Number of nodes is [0, 10^4].",
        starterCode: { python: "class Codec:\n    def serialize(self, root):\n        pass\n    def deserialize(self, data):\n        pass", javascript: "function serialize(root) { }\nfunction deserialize(data) { }", cpp: "string serialize(TreeNode* root) { }\nTreeNode* deserialize(string data) { }", java: "public String serialize(TreeNode root) { }\npublic TreeNode deserialize(String data) { }" },
        testCases: [{ input: "[1,2,3,null,null,4,5]", expectedOutput: "[1,2,3,null,null,4,5]", isHidden: false }],
        hints: ["Use preorder traversal with null markers."], tags: ["tree", "design", "bfs", "dfs"],
        mentorInsights: { commonMistakes: ["Not handling null nodes in serialization.", "Using inorder (which doesn't uniquely define a tree)."], proTips: ["Preorder + null markers is most intuitive."], recruiterNotes: "Tests ability to design encoding/decoding schemes." },
        bonusLinks: [{ label: "LeetCode #297", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" }]
    },
    {
        title: "Word Search II", slug: "word-search-ii", difficulty: "Hard", track: "Advanced", category: "Trie + Backtracking", source: "LeetCode",
        description: "Given an `m x n` board of characters and a list of strings `words`, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells.",
        examples: [{ input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]', explanation: "" }],
        constraints: "1 <= words.length <= 3 * 10^4",
        starterCode: { python: "def findWords(board, words):\n    pass", javascript: "function findWords(board, words) {\n}", cpp: "vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {\n}", java: "public List<String> findWords(char[][] board, String[] words) {\n}" },
        testCases: [{ input: '[["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]]\n["oath","pea","eat","rain"]', expectedOutput: '["eat","oath"]', isHidden: false }],
        hints: ["Build a Trie from words, then DFS on the board."], tags: ["trie", "backtracking", "matrix", "dfs"],
        mentorInsights: { commonMistakes: ["Searching each word independently (too slow).", "Not pruning the Trie during backtracking."], proTips: ["Trie + backtracking with pruning is the optimal approach."], recruiterNotes: "Combines two advanced data structures. FAANG favorite." },
        bonusLinks: [{ label: "LeetCode #212", url: "https://leetcode.com/problems/word-search-ii/" }]
    },
    {
        title: "N-Queens", slug: "n-queens", difficulty: "Hard", track: "Advanced", category: "Backtracking", source: "Codeforces",
        description: "The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other. Given an integer `n`, return all distinct solutions.",
        examples: [{ input: "n = 4", output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]', explanation: "" }],
        constraints: "1 <= n <= 9",
        starterCode: { python: "def solveNQueens(n):\n    pass", javascript: "function solveNQueens(n) {\n}", cpp: "vector<vector<string>> solveNQueens(int n) {\n}", java: "public List<List<String>> solveNQueens(int n) {\n}" },
        testCases: [{ input: "4", expectedOutput: "2 solutions", isHidden: false }, { input: "1", expectedOutput: '["Q"]', isHidden: false }],
        hints: ["Place queens row by row. Track columns, diagonals, and anti-diagonals."], tags: ["backtracking", "recursion"],
        mentorInsights: { commonMistakes: ["Not tracking both diagonals.", "Generating invalid states before checking."], proTips: ["Use sets for columns, diag (row-col), anti-diag (row+col)."], recruiterNotes: "Classic CS problem. Shows mastery of constraint-based search." },
        bonusLinks: [{ label: "LeetCode #51", url: "https://leetcode.com/problems/n-queens/" }, { label: "Codeforces", url: "https://codeforces.com/problemset/problem/1/A" }]
    },
];

export async function POST() {
    try {
        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        // Delete all existing challenges and re-create to ensure clean state
        await Challenge.deleteMany({});
        
        const results = await Challenge.insertMany(SEED_CHALLENGES);

        return NextResponse.json({
            message: `Seed complete: ${results.length} challenges deployed.`,
            total: results.length,
            tracks: {
                Beginner: SEED_CHALLENGES.filter(c => c.track === 'Beginner').length,
                Intermediate: SEED_CHALLENGES.filter(c => c.track === 'Intermediate').length,
                Advanced: SEED_CHALLENGES.filter(c => c.track === 'Advanced').length,
            }
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
