const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 12-week curriculum data
const curriculum = {
  // Phase 1: Foundations (Days 1-14)
  1: { topic: "Arrays & Basic Operations", phase: "Foundations", week: 1 },
  2: { topic: "String Manipulation", phase: "Foundations", week: 1 },
  3: { topic: "Time & Space Complexity", phase: "Foundations", week: 1 },
  4: { topic: "Standard Library Functions", phase: "Foundations", week: 1 },
  5: { topic: "Basic Math Operations", phase: "Foundations", week: 1 },
  6: { topic: "Input/Output Handling", phase: "Foundations", week: 1 },
  7: { topic: "Week 1 Review & Mixed Practice", phase: "Foundations", week: 1, isReview: true },
  8: { topic: "Advanced Array Techniques", phase: "Foundations", week: 2 },
  9: { topic: "String Algorithms", phase: "Foundations", week: 2 },
  10: { topic: "Bit Manipulation Basics", phase: "Foundations", week: 2 },
  11: { topic: "Number Theory", phase: "Foundations", week: 2 },
  12: { topic: "Pattern Recognition", phase: "Foundations", week: 2 },
  13: { topic: "Problem Solving Strategies", phase: "Foundations", week: 2 },
  14: { topic: "Week 2 Review & Assessment", phase: "Foundations", week: 2, isReview: true },
  
  // Phase 2: Patterns & Techniques (Days 15-35)
  15: { topic: "Two Pointers Technique", phase: "Patterns & Techniques", week: 3 },
  16: { topic: "Hash Tables & Maps", phase: "Patterns & Techniques", week: 3 },
  17: { topic: "Sorting Algorithms", phase: "Patterns & Techniques", week: 3 },
  18: { topic: "Binary Search", phase: "Patterns & Techniques", week: 3 },
  19: { topic: "Sliding Window", phase: "Patterns & Techniques", week: 3 },
  20: { topic: "Basic Recursion", phase: "Patterns & Techniques", week: 3 },
  21: { topic: "Week 3 Review & Mixed Practice", phase: "Patterns & Techniques", week: 3, isReview: true },
  22: { topic: "Advanced Two Pointers", phase: "Patterns & Techniques", week: 4 },
  23: { topic: "Hash Set Applications", phase: "Patterns & Techniques", week: 4 },
  24: { topic: "Merge Sort & Quick Sort", phase: "Patterns & Techniques", week: 4 },
  25: { topic: "Binary Search Variations", phase: "Patterns & Techniques", week: 4 },
  26: { topic: "Advanced Sliding Window", phase: "Patterns & Techniques", week: 4 },
  27: { topic: "Recursion with Memoization", phase: "Patterns & Techniques", week: 4 },
  28: { topic: "Week 4 Review & Assessment", phase: "Patterns & Techniques", week: 4, isReview: true },
  29: { topic: "Prefix Sums", phase: "Patterns & Techniques", week: 5 },
  30: { topic: "Frequency Counting", phase: "Patterns & Techniques", week: 5 },
  31: { topic: "Custom Sorting", phase: "Patterns & Techniques", week: 5 },
  32: { topic: "Search in Rotated Arrays", phase: "Patterns & Techniques", week: 5 },
  33: { topic: "Multiple Sliding Windows", phase: "Patterns & Techniques", week: 5 },
  34: { topic: "Divide and Conquer", phase: "Patterns & Techniques", week: 5 },
  35: { topic: "Week 5 Review & Mixed Practice", phase: "Patterns & Techniques", week: 5, isReview: true },
  
  // Phase 3: Core Data Structures (Days 36-63)
  36: { topic: "Linked Lists Basics", phase: "Core Data Structures", week: 6 },
  37: { topic: "Linked List Manipulation", phase: "Core Data Structures", week: 6 },
  38: { topic: "Stacks Implementation", phase: "Core Data Structures", week: 6 },
  39: { topic: "Stack Applications", phase: "Core Data Structures", week: 6 },
  40: { topic: "Queues & Deques", phase: "Core Data Structures", week: 6 },
  41: { topic: "Queue Applications", phase: "Core Data Structures", week: 6 },
  42: { topic: "Week 6 Review & Assessment", phase: "Core Data Structures", week: 6, isReview: true },
  43: { topic: "Binary Trees Basics", phase: "Core Data Structures", week: 7 },
  44: { topic: "Tree Traversals", phase: "Core Data Structures", week: 7 },
  45: { topic: "Binary Search Trees", phase: "Core Data Structures", week: 7 },
  46: { topic: "Tree Construction", phase: "Core Data Structures", week: 7 },
  47: { topic: "Backtracking Introduction", phase: "Core Data Structures", week: 7 },
  48: { topic: "Backtracking Applications", phase: "Core Data Structures", week: 7 },
  49: { topic: "Week 7 Review & Mixed Practice", phase: "Core Data Structures", week: 7, isReview: true },
  50: { topic: "Heaps & Priority Queues", phase: "Core Data Structures", week: 8 },
  51: { topic: "Heap Applications", phase: "Core Data Structures", week: 8 },
  52: { topic: "Advanced Tree Problems", phase: "Core Data Structures", week: 8 },
  53: { topic: "Tree Optimization", phase: "Core Data Structures", week: 8 },
  54: { topic: "Complex Backtracking", phase: "Core Data Structures", week: 8 },
  55: { topic: "Permutations & Combinations", phase: "Core Data Structures", week: 8 },
  56: { topic: "Week 8 Review & Assessment", phase: "Core Data Structures", week: 8, isReview: true },
  57: { topic: "Trie Data Structure", phase: "Core Data Structures", week: 9 },
  58: { topic: "Advanced Linked Lists", phase: "Core Data Structures", week: 9 },
  59: { topic: "Stack & Queue Combinations", phase: "Core Data Structures", week: 9 },
  60: { topic: "Tree Balancing", phase: "Core Data Structures", week: 9 },
  61: { topic: "Advanced Heaps", phase: "Core Data Structures", week: 9 },
  62: { topic: "Data Structure Design", phase: "Core Data Structures", week: 9 },
  63: { topic: "Week 9 Review & Mixed Practice", phase: "Core Data Structures", week: 9, isReview: true },
  
  // Phase 4: Advanced Topics (Days 64-84)
  64: { topic: "Graph Representation", phase: "Advanced Topics", week: 10 },
  65: { topic: "Graph Traversal (BFS/DFS)", phase: "Advanced Topics", week: 10 },
  66: { topic: "Shortest Path Algorithms", phase: "Advanced Topics", week: 10 },
  67: { topic: "Dynamic Programming Basics", phase: "Advanced Topics", week: 10 },
  68: { topic: "DP Pattern Recognition", phase: "Advanced Topics", week: 10 },
  69: { topic: "Greedy Algorithms", phase: "Advanced Topics", week: 10 },
  70: { topic: "Week 10 Review & Assessment", phase: "Advanced Topics", week: 10, isReview: true },
  71: { topic: "Advanced Graph Algorithms", phase: "Advanced Topics", week: 11 },
  72: { topic: "Complex DP Problems", phase: "Advanced Topics", week: 11 },
  73: { topic: "Advanced Greedy", phase: "Advanced Topics", week: 11 },
  74: { topic: "Union Find", phase: "Advanced Topics", week: 11 },
  75: { topic: "Segment Trees", phase: "Advanced Topics", week: 11 },
  76: { topic: "Advanced Optimization", phase: "Advanced Topics", week: 11 },
  77: { topic: "Week 11 Review & Mixed Practice", phase: "Advanced Topics", week: 11, isReview: true },
  78: { topic: "System Design Basics", phase: "Advanced Topics", week: 12 },
  79: { topic: "Interview Preparation", phase: "Advanced Topics", week: 12 },
  80: { topic: "Mock Interviews", phase: "Advanced Topics", week: 12 },
  81: { topic: "Final Review Session 1", phase: "Advanced Topics", week: 12, isReview: true },
  82: { topic: "Final Review Session 2", phase: "Advanced Topics", week: 12, isReview: true },
  83: { topic: "Capstone Challenge", phase: "Advanced Topics", week: 12 },
  84: { topic: "Graduation & Next Steps", phase: "Advanced Topics", week: 12, isReview: true }
};

// Get curriculum for specific day
router.get('/day/:day', authenticateToken, async (req, res) => {
  try {
    const { day } = req.params;
    const dayNum = parseInt(day);
    
    if (dayNum < 1 || dayNum > 84) {
      return res.status(400).json({ error: 'Invalid day number' });
    }
    
    const curriculumData = curriculum[dayNum];
    if (!curriculumData) {
      return res.status(404).json({ error: 'Curriculum not found for this day' });
    }
    
    res.json({
      day: dayNum,
      ...curriculumData
    });
  } catch (error) {
    console.error('Get curriculum error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get full curriculum overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const overview = Object.keys(curriculum).map(day => ({
      day: parseInt(day),
      ...curriculum[day]
    }));
    
    res.json({ curriculum: overview });
  } catch (error) {
    console.error('Get curriculum overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;