---
slug: concurrent-data-summarization
title: Concurrent Data Summarization
authors:
  name: Vinh Ngo
  title: PhD Student
  url: https://github.com/vinhqngo5/
  image_url: https://avatars.githubusercontent.com/u/46000904?s…00&u=f124ac5faefd9d6a15f8bcaf1f8450119997dced&v=4
tags: [data-summarization, concurrency, parallelism, relax-dn]
enableComments: true # for Gisqus
enableShareButtons: true # for share to social media
---
import BrowserWindow from '@site/src/components/BrowserWindow';
import {Old, New} from '@site/src/components/ChangeHighlighter';


## Introduction

With the growing interest in digitalization and its associated ecosystems, the need to store, process, index, and gain valuable insights from data is imperative. However, given the increasing volume, velocity, and variety of data that must be generated and processed, two approaches have been proposed to address this issue: **Data Summarization (or synopsis)** and **Concurrent/Parallel Processing**.

The first approach, **Data Summarization**, is based on the observation that big data is often very large but also often ephemeral, with the value brought by different pieces of data being uneven. Instead of needing to store, process, and index the entire amount of data, we can extract useful information from massive data sets into synopses data structures, typically requiring much less space and computation. Examples include simple functions such as `min`, `max`, `average`, or `median`, and more complex ones such as statistics about the `frequencies` of encountered elements and `heavy hitters`. During this process, some information may be lost compared to the original amount of data. Therefore, depending on the problem, the processed data may exist in the form of probabilistic data structures. This means the calculation results from these compact probabilistic data structures can return an approximate result with a bounded difference from the accurate answer and can allow a small probability of deviation from the bounded guarantee.


In another approach, researchers believe that we need to make fuller use of the resources we have, especially parallel hardware that has become popular with today's commodity devices. This is necessary in an era when Moore's Law is gradually ending, as we can no longer rely on the processing speed of hardware increasing exponentially every couple of years. However, the speed-up due to **Concurrency and Parallelism** will not come in straightforward, formal definitions and reasons are described rigorously in Amdahl's law. There are many things that need to be carefully designed for a concurrent system. These include Work Partitioning, Concurrent/Parallel Access Control, Resource Partitioning and Replication, Interacting With Hardware, Languages and Environments, Relax Semantics, etc. Proving an effective concurrent system is not just about increased throughput or reduced latency experimentally, it also needs to ensure its safety and liveness properties, often referred to as correctness and progress.

Although the above two approaches are different, they are not mutually exclusive. This means that we can apply both methods simultaneously. Thus, the effective combination of both methods, known as Concurrent Data Summarization, is expected to bring a new perspective to big data processing.

In this literature, although we cannot provide a comprehensive view of Concurrent Data Summarization, we will nevertheless discuss a concurrent data summary introduced by Idit Keidar, what it solves, how it is constructed, and how to prove the correctness of the algorithm. At the end, we will also further explore some research directions in this topic.


## Fast Concurrent Data Sketches
Fast Concurrent Data Sketches paper is an amazing work by Idit Keidar and her group to present a generic approach to parallelize data sketches efficiently and allow them to be queried in real-time. The work also provides a comprehensive arguments on relaxed semantics to prove the correctness and analyse the error induced by the concurrency and paralellism. In this section, we will study the Theta Sketch and how to apply the Fast Concurrent Data Sketches algorithm to the data structure. The content proceeds as follows: `(1) A Sequential Theta Sketch For Estimating the number of distinct values` provides the background and the main idea of the Theta Sketch. `(2) Making Sense of Relaxed Consistency` gives some intuitions and examples of the relaxed consistency. And finally `(3) Generic Algorithm for Concurrent Sketches` constructs a generic approach to parallelize data sketches with some further optimizations. 

### A Sequential Theta Sketch For Estimating the number of distinct values
**Estimating the number of distinct values**  in a data set is a well-studied problem with many applications in databases, stream processing, etc. Formally, the problem is described as: consider a data set, $S$, of $N$ items, where each item is from a universe of $n$ possible values. The number of distinct values in $S$, called the zeroth frequency moment $F_0$, is the number of values from the universe that occur at least once in $S$. 


|  | |
|--|--|
| stream $S_1$ | C, D, B, B, Z, B, B, R, T, S, X, R, D, U, E, B, R, T, Y, L, M, A, T, W |
| stream $S_2$ | T, B, B, R, W, B, B, T, T, E, T, R, R, T, E, M, W, T, R, M, M, W, B, W |

**Figure. 1** Two example data streams of $N = 24$ items from a universe $\{A, B, \ldots, Z\}$ of size $n = 26$. $S_1$ has 15 distinct values while $S_2$ has 6.



**Figure 1** depicts two example streams, $S_1$ and $S_2$ , with $15$ and $6$ distinct values, respectively. The simplest and most direct approach to estimating the number of distinct values is to maintain a sorted set of distinct values. Whenever a new item is encountered in the data stream, a binary search is performed over the sorted set. If the item is already present, it is skipped; otherwise, the new item is inserted into its correct position in the sorted set. Finally, the size of the set is calculated to return $F_0$, the number of distinct values. However, this approach won't scale well as the size of the data stream increases. It requires linear space proportional to the number of distinct items and need to perform a binary search for every new item encountered.
  
So, what we want here is an estimation algorithm that outputs an estimate $\hat{F}_0$, a function of the synopsis, that is guaranteed to be close to the true $F_0$ for the stream, however it requires much less space and computation. The relative error $\epsilon$ introduced by using the synopsis is calculated as $\mid \hat{F}_0 - F_0 \mid / F_0$. The desired synopsis should provide a ($\epsilon, \delta$)-approximation, which guarantees that the estimated output $\hat{F}_0$ is within the relative error of $\epsilon$ with probability at least $1 - \delta$.

<br/>
<center>
![Theta Sketch Example](sequential_theta_sketch.drawio.svg)
</center>

**Figure. 2** An example illustrating the application of Theta Sketch ($k=2$) to estimate the number of distinct items in a datastream $S$ containing 4 unique items. The estimated result returns 5, showing a slight deviation from the actual count.

A common algorithm sastifies above requirements is **K Minimum Values (KMV) Theta Sketch**. It maintains a sample set of size $k$ and a parameter $\Theta$ to decide which elements are added to the sample set. It uses a random hash function $h$ whose outputs are uniformly distributed in the range $[0, 1]$, and $\Theta$ is always in the same range. An incoming stream element is first hashed, and then the hash is compared to $\Theta$. In case it is smaller, the value is added to sample set. Otherwise, it is ignored. Because the hash outputs are uniformly distributed, the expected proportion of values smaller than $\Theta$ is $\Theta$. Therefore, we can estimate the number of distinct items in the stream by dividing the number of distinct items stored samples by $\Theta$ (assuming that the random hash function is drawn independently of the stream values). 

KMV $\Theta$ Theta Sketch takes a parameter $k$ to create a constant sample set of $k$ items to keep the $k$ smallest hashes seen so far. $\Theta$ is $1$ during the first $k$ updates, and subsequently it is the hash of the largest sample in the set. Once the sample set is full, every update that inserts a new element also removes the largest one and updates $\Theta$. This sample set is implemented effectively as a sorted set. The KMV $\Theta$ Theta Sketch also provides the merge method to merge two KMV $\Theta$ Theta Sketches while still providing the same bounded-guarantee. Intuitively, the merge algorithm is similar to adding a batch of samples to the sample set.

The accuracy of the algorithm is based on the *Relative Standard Error (RSE)* of the estimate, which is the standard error normalized by the quantity being estimated. The KMV $\Theta$ Theta Sketch with $k$ samples has the RSE less than $\frac{1}{\sqrt{k-1}}$.


```clike
Initialize(k):
    theta = 1 
    k = k
    est = 0 
    sample_set = empty set of size k

Query():
    return est

Update(element):
    hash_value = random_hash(element)
    if hash_value >= theta:
        return 
    add hash_value to sample_set
    keep k smallest samples in the sample_set
    theta = max(sample_set)
    est = (|sample_set| - 1) / theta

Merge(S):
    sample_set = merfe sample_set and S.sample_set
    keep k smallest values in the sample_set
    theta = max(sample_set)
    est = (|sample_set| - 1) / theta
```
**Algorithm. 1**  Sequential Theta Sketch

At the first glance, we can argue that there is no difference between the use of the $\Theta$ and the use of the $k$. However, without the use of the $\Theta$, the value $k$ will be overloaded with multiple roles: (1) $k$ determines the RSE (accuracy) of the sketch, (2) $k$ determines the upper-bound size of sample set (the sketch), (3) $k$ is used as a constant in the estimator and RSE equations, (4) $k$ determines the V($k^{th}$) threshold, used to reject/accept hash values into the sorted set. By unloading some of these roles, we will gain the freedom to do some flexible and customizable implementation. The introduction of the value $\Theta$ decouples (3) and (4) above from $k$. 


### Making Sense of Relaxed Consistency

By **Algorithm 1**, we already have the KMV $\Theta$ Theta Sketch as the basic building block for the Concurrent Sketches, where multiple sketches run concurrently. However, they require an effective concurrency scheme to coordinate the concurrent/parallel accesses and synchronize the information between sketches. To achieve a higher probability of acceleration provided by the scheme, some form of relaxation is required.

The idea of relaxation here is that instead of making operations look like they happen sequentially, one after another, we can relax some properties of the implementation. Imagine a simple design of the CPU and its memory hierarchy, which only has two cores sharing the same main memory. If two threads want to write simultaneously to the same memory location, while one thread is writing, the other needs to wait until the former finishes its ongoing operation, which might cause a stall. Rather than waiting for the write from the first thread to become visible, the second thread could place its write into a `store buffer` and then continue to the next operation. Immediately after that, while the write is still waiting in the `store buffer` to be visible, if the second thread wants to read the value it just wrote, it can read the value from the cached register or the `store buffer` without going to the main memory. However, that value is not visible yet to the first thread, so different values of the same memory location will be observed by the two threads.

<center>
![Simple store buffer](simple_store_buffer.drawio.svg)
</center>

**Figure. 4** This figure demonstrates the situation where two threads on separate CPU cores interact with a shared memory location using store buffers. Core 2 writes the value `A = 2` to its store buffer and then to main memory, while Core 1 writes `A = 1` to its store buffer. When Core 1 reads the value of A, it reads A = 1 from its store buffer, whereas Core 2 reads `A = 2` from the main memory. This results in both cores observing different values for the same memory location.

:::warning 
The above example is just a simple store buffer illustration that might not be accurate in reality. However, it serves as a good way to explain some sources/implementations of relaxation.
:::

Another example of relaxation can be the FIFO queue, which has sequential semantics, inherently leading to memory contention in parallel environments, thus limiting scalability. The $k$ out-of-order relaxation allows relaxed operation orders to deviate from the sequential order by up to $k$. This means for the dequeue operation on the relaxed FIFO queue, any of the first $k$ items can be returned instead of just the head. The relaxation increases the number of memory access points at the expense of weakening the sequential semantics.

<center>
![FIFO queue](fifo_queue.drawio.svg)
</center>

**Figure. 5** A standard FIFO queue where sequential semantics lead to a memory contention point. The dequeue operation always retrieves the head item, causing contention in parallel environments and limiting scalability.

<center>
![Relaxed FIFO queue](relaxed_fifo_queue.drawio.svg)
</center>

**Figure. 6** a $k$ out-of-order relaxed FIFO queue. In this model, the dequeue operation can return any of the first $k$ items instead of just the head. This relaxation reduces memory contention by increasing the number of memory access points, although it weakens the strict sequential semantics.

<!---
### Relaxed Consistency for Concurrent Sketches
This section discusses the Relaxed Consistency for Concurrent Sketches. We will step-by-step extend the sequential KMV $\Theta$ Theta Sketch to support some form of concurrency. The paper adopts a variant of the out-of-order relaxation mentioned above. Intuitively, this relaxation allows a query to “miss” a bounded number of updates that precede it. Because a sketch is order-agnostic, the relaxation further allows re-ordering of the updates “seen” by a query. From now on, we will call this type of relaxation *r-relaxation* to distinguish it from the relaxations used by the Concurrent KMV $\Theta$ Theta Sketches.

**Definition *r-relaxation*:** A sequential history $H$ is an *r-relaxation* of a sequential history $H'$, if $H$ is comprised of all but at most $r$ of the invocations in $H'$ and their responses, and each invocation in $H$ is preceded by all but at most $r$ of the invocations that precede the same invocation in $H'$. The *r-relaxation* of sequential sketches is the set of histories that have *r-relaxations* in sequential sketches:

:::danger 
Continue this section later after reading the Quantitative Relaxation of Concurrent Data Structures paper to see what is the difference between the two definitions.
:::
-->

### Generic Algorithm for  Concurrent Sketches

A sequential KMV $\Theta$ Theta Sketch has been described in section `(1) A Sequential Theta Sketch For Estimating the number of distinct values`. However, to be able to coordinate multiple threads to work concurrently, the orginal sequential algorithm has to be extended with some operations that allow concurrency and some forms of optimizations to mitigate the overhead costs (cache invalidation, missing global information, etc).  

**Composable sketch:** To build upon an existing sequential sketch, we extend it to support a form of concurrency called *composable*. A composable sketch allows concurrency between merges and queries. This property is essential to avoid stopping all sketches during merging or querying.

**Composable sketch implementation:** To materialize this idea, we need to add a *Snapshot* API that can run concurrently with merges and obtain a queryable copy of the sketch. The sequential specification of this operation is as follows: `S.Snapshot()` returns a copy `S'` of `S` such that immediately after `S'` is returned, `S.Query(arg) = S'.Query(arg)` for every possible `arg`.

<center>
![Generic Concurrent Sketches](parsketch0.drawio.svg)
</center>
**Figure. 7** The Concurrent Sketches Algorithm is initialized with a Global Sketch (Composable sketch) and Small Thread-local Sketches (sequential sketch). The Global Sketch is managed by the propagator and the small thread-local sketches are managed by the worker threads, one thread for each of the sketchs. The worker threads will periodically request merge the small sketches to the global sketch. After that, global sketch will return some hints (global information) to the worker threads.

**Pre-filtering optimization:** When multiple threads work simultaneously, they interact only with the data received locally, without knowledge of the global data. We can optimize their performance by sharing "hints" about the data processed globally.

Let's consider a simple example of finding the smallest number in an entire data stream using multiple threads. Each thread maintains a thread-local variable that holds the minimum value it has seen so far from the data stream it receives. By the end, the global result is obtained by reducing all the thread-local minima. However, while processing the data stream, threads can sometimes communicate to get the current global minimum and then assign it to the thread-local variable. This way, we can reduce the number of swap operations needed for elements that are just local minima but not the global minimum.

**Pre-filtering implementation:** To support pre-filtering, we need to add the following two APIs:
`S.CalcHint()` returns a value $h \neq 0 $ to be used as a hint. `S.ShouldAdd(h, arg)` filters out updates that do not affect the sketch’s state, given a hint h.


```clike
// Composable Theta Sketch Operations
Initialize(k):
    sample_set = init k 1's   // initialize sample set with k 1's
    theta = 1                     // set threshold to 1
    est = 0                   // initialize estimate to 0
    h = init random uniform hash // initialize hash function

Query():
    return est

Update(arg):
    if h(arg) >= theta:
        return
    add h(arg) to sample_set
    keep k smallest samples in sample_set
    theta = max(sample_set)
    est = (|sample_set| - 1) / theta

Merge(S):
    sample_set = merge sample_set and S.sample_set
    keep k smallest values in sample_set
    theta = max(sample_set)
    est = (|sample_set| - 1) / theta

Snapshot():
    localCopy = empty sketch
    localCopy.est = est
    return localCopy

CalcHint():
    return theta

ShouldAdd(H, arg):
    return h(arg) < H
```
**Algorithm. 2** Composable Theta Sketch operations after adding three new apis to support *composable* and *pre-filtering* optimization. 


**Generic Concurrent Algorithm:** This algorithm involves three different types of threads, each corresponding to a specific workload: (1) Worker threads - responsible for managing the sequential sketches (`local S`). They process incoming stream elements and update the thread-local sketches. (2) Propagator thread - responsible for managing the global sketch (`global S`). They merge local sketches into the global sketch. (2) Query threads - responsible for taking snapshots from the global sketch and performing queries.


<center>
![Generic Concurrent Sketches](parsketch1.drawio.svg)
</center>
**Figure. 8** This diagram illustrates an example of concurrent sketches. Each worker thread has its own sequential sketch to handle a paritition of the data stream. Thread 1 is still processing data because it hasn't reached its update limit. Thread 2 has reached its update limit and is waiting for the propagator to merge its sketch with the global sketch. Propagator is currently merging another worker's sketch into the global sketch.

```clike
// Propagator thread operations 
Initialize():
    initialize the composable sketch

Run():
    while true do
        for all threads signaled to the propagator do
            globalS.Merge(localS)
            send hint from globalS.CalcHint() to localS 
```
**Algorithm. 3.1** Propagator thread operations 

```clike
// Worker thread operations
Initialize():
    initialize the squential sketch

Run():
    while true do
        arg = listen to the incoming stream elements
        Update(arg)

Update(arg):
    if not localS.ShouldAdd(hint, arg) then return
    localS.Update(arg)
    localCounter = localCounter + 1
    if localCounter reaches threshold then 
        signal the Propagator thread to merge with the composable sketch 
        wait until the Propagator finishes 
        receive hint from the Propagator
```
**Algorithm. 3.2** Worker thread operations 

```clike
// Query thread operations 
Query(arg):
    localCopy = globalS.Snapshot() 
    return localCopy.Query(arg)
```
**Algorithm. 3.3** Query thread operations 


`Initialize`: The algorithm is initialized with a composable sketch (global sketch) and several sequential sketches (one for each worker thread). The worker threads handle updates to sequential sketches, the propagator thread handles merges to global sketches, and the query threads handle queries. An example of the overall structure is described in **Figure 7**. The initialization details for each thread type are outlined in the `Initialize` sections of **Algorithm 3.1-3.3**. It uses multiple threads to process incoming stream elements using the thread-local sketch `local S`, and a propagator thread to merge local sketches into a shared composable sketch `global S`. Note that small threads are implemented as shared or thread-local sketches, which doesn't matter as they will be updated exclusively by their owner (worker thread) and read exclusively by the thread that owns the propagator. Moreover, updates and reads do not happen in parallel, minimizing cache coherence overhead. The global sketch is updated only by the thread that owns the propagator and can be read by query threads. The number of query threads can be unbounded depending on the workload characteristics.

`Merge`: After some updates are added to the thread-local sketch `local S`, the worker thread signals the propagator to merge it with the composable sketch. After signaling the propagator, the worker thread waits until the merge operation is completed, then the worker thread can continue using the thread-local sketch. However, as the `pre-filtering` optimization mentioned above, the worker thread can piggyback the hint it obtains from the global sketch. This way, there is no need for further synchronization to pass the hint.

`Query`: Query threads use the `Snapshot` method, which can be safely run concurrently with merges, hence there is no need to synchronize between the query threads and the propagator. The freshness of the query is governed by the ***r-relaxation***.



**Further optimizations:** The algorithm also employs the `Double Buffering` technique commonly used in databases to hide the latency of the Update operation in the worker thread. One limitation of the above algorithm is that worker threads are idle while waiting for the propagator to finish the merge. This may be inefficient, especially if a single propagator iterates through many local sketches. Instead of having just one local sketch, we can have two local sketches used alternately. For example, when the first local sketch is waiting for the merge operation to finish, the second local sketch can take over as the current working sketch of the worker thread. This way, we can hide the latency of the `Update` operation
<center>
![Double Buffering technique](double_buffering.drawio.svg)
</center>
**Figure. 9** A diagram of a worker thread with two local sketches using `double buffering` technique. While Small Sketch 1 is waiting to be merged into the global sketch, Small Sketch 2 takes over as the current working thread to handle incoming data. 

## Directions for Concurrent Data Summarization

:::danger
TBD
:::

## References
1. Arik Rinberg, Alexander Spiegelman, Edward Bortnikov, Eshcar Hillel, Idit Keidar, Lee Rhodes, and Hadar Serviansky. 2022. Fast Concurrent Data Sketches. ACM Trans. Parallel Comput. 9, 2, Article 6 (June 2022), 35 pages. https://doi.org/10.1145/3512758
2. Thomas A. Henzinger, Christoph M. Kirsch, Hannes Payer, Ali Sezgin, and Ana Sokolova. 2013. Quantitative relaxation of concurrent data structures. SIGPLAN Not. 48, 1 (January 2013), 317–328. https://doi.org/10.1145/2480359.2429109
3. Charalampos Stylianopoulos, Ivan Walulya, Magnus Almgren, Olaf Landsiedel, and Marina Papatriantafilou. 2020. Delegation sketch: a parallel design with support for fast and accurate concurrent operations. In Proceedings of the Fifteenth European Conference on Computer Systems (EuroSys '20). Association for Computing Machinery, New York, NY, USA, Article 4, 1–16. https://doi.org/10.1145/3342195.3387542