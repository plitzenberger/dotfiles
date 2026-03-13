### Algorithm Complexity Analysis Framework

For evaluating and communicating algorithm efficiency:

| Aspect              | Question                                                              |
| ------------------- | --------------------------------------------------------------------- |
| **Time Complexity** | What is the worst/average/best case runtime as input scales?          |
| **Space Complexity**| How much memory is required relative to input size?                   |
| **Scalability**     | At what input size does performance become unacceptable?              |
| **Parallelizability**| Can the algorithm be parallelized? What is the theoretical speedup? |
| **Cache Efficiency**| How well does it utilize CPU cache and memory hierarchy?              |
| **I/O Complexity**  | How many disk/network operations are required?                        |
| **Trade-offs**      | What are the time-space-accuracy trade-offs available?                |

#### Common Complexity Classes

| Class       | Example Algorithms                    | Practical Guidance                    |
| ----------- | ------------------------------------- | ------------------------------------- |
| O(1)        | Hash lookup, array access             | Ideal for hot paths                   |
| O(log n)    | Binary search, balanced tree ops      | Excellent for large datasets          |
| O(n)        | Linear scan, single-pass aggregation  | Acceptable for most workloads         |
| O(n log n)  | Merge sort, heap sort                 | Standard for sorting operations       |
| O(n²)       | Nested loops, naive comparisons       | Limit to small datasets (<10K)        |
| O(2ⁿ)       | Subset enumeration, brute force       | Only viable with aggressive pruning   |
