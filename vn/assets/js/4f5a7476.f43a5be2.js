"use strict";(self.webpackChunkhpc_blog=self.webpackChunkhpc_blog||[]).push([[8613],{9245:e=>{e.exports=JSON.parse('{"archive":{"blogPosts":[{"id":"concurrent-data-summarization","metadata":{"permalink":"/hpc-blog/vn/blog/concurrent-data-summarization","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/concurrent-data-summarization/concurrent-data-summarization.mdx","source":"@site/blog/concurrent-data-summarization/concurrent-data-summarization.mdx","title":"Concurrent Data Summarization","description":"Introduction","date":"2024-06-10T20:09:20.000Z","tags":[{"inline":false,"label":"Hola","permalink":"/hpc-blog/vn/blog/tags/hola","description":"Hola tag description"},{"inline":false,"label":"Docusaurus","permalink":"/hpc-blog/vn/blog/tags/docusaurus","description":"Docusaurus tag description"}],"readingTime":11.2,"hasTruncateMarker":false,"authors":[{"name":"Vinh Ngo","title":"PhD Student","url":"https://github.com/vinhqngo5/","image_url":"https://avatars.githubusercontent.com/u/46000904?s\u202600&u=f124ac5faefd9d6a15f8bcaf1f8450119997dced&v=4","imageURL":"https://avatars.githubusercontent.com/u/46000904?s\u202600&u=f124ac5faefd9d6a15f8bcaf1f8450119997dced&v=4"}],"frontMatter":{"slug":"concurrent-data-summarization","title":"Concurrent Data Summarization","authors":{"name":"Vinh Ngo","title":"PhD Student","url":"https://github.com/vinhqngo5/","image_url":"https://avatars.githubusercontent.com/u/46000904?s\u202600&u=f124ac5faefd9d6a15f8bcaf1f8450119997dced&v=4","imageURL":"https://avatars.githubusercontent.com/u/46000904?s\u202600&u=f124ac5faefd9d6a15f8bcaf1f8450119997dced&v=4"},"tags":["hola","docusaurus"]},"unlisted":false,"nextItem":{"title":"Welcome","permalink":"/hpc-blog/vn/blog/welcome"}},"content":"import BrowserWindow from \'@site/src/components/BrowserWindow\';\\n\\n\\n## Introduction\\n\\nWith the growing interest in digitalization and its associated ecosystems, the need to store, process, index, and gain valuable insights from data is imperative. However, given the increasing volume, velocity, and variety of data that must be generated and processed, two approaches have been proposed to address this issue: Data Summarization (or synopsis) and Concurrent/Parallel Processing.\\n\\nThe first approach, Data Summarization, is based on the observation that big data is often very large but also often ephemeral, with the value brought by different pieces of data being uneven. Instead of needing to store, process, and index the entire amount of data, we can extract useful information from massive data sets into synopses data structures, typically requiring much less space and computation. Examples include simple functions such as min, max, average, or median, and more complex ones such as statistics about the frequencies of encountered elements and heavy hitters. During this process, some information may be lost compared to the original amount of data. Therefore, depending on the problem, the processed data may exist in the form of probabilistic data structures. This means the calculation results from these compact probabilistic data structures can return an approximate result with a bounded difference from the accurate answer and can allow a small probability of deviation from the bounded guarantee.\\n\\n\\nIn another approach, researchers believe that we need to make fuller use of the resources we have, especially parallel hardware that has become popular with today\'s commodity devices. This is necessary in an era when Moore\'s Law is gradually ending, as we can no longer rely on the processing speed of hardware increasing exponentially every couple of years. However, the speed-up due to Concurrency and Parallelism will not come in straightforward, formal definitions and reasons are described rigorously in Amdahl\'s law. There are many things that need to be carefully designed for a concurrent system. These include Work Partitioning, Concurrent/Parallel Access Control, Resource Partitioning and Replication, Interacting With Hardware, Languages and Environments, Relax Semantics, etc. Proving an effective concurrent system is not just about increased throughput or reduced latency experimentally, it also needs to ensure its safety and liveness properties, often referred to as correctness and progress.\\n\\nAlthough the above two approaches are different, they are not mutually exclusive. This means that we can apply both methods simultaneously. Thus, the effective combination of both methods, known as Concurrent Data Summarization, is expected to bring a new perspective to big data processing.\\n\\nIn this literature, although we cannot provide a comprehensive view of Concurrent Data Summarization, we will nevertheless discuss a concurrent data summary introduced by Idit Keidar, what it solves, how it is constructed, and how to prove the correctness of the algorithm. At the end, we will also further explore some research directions in this topic.\\n\\n\\n## Showcase - Fast Concurrent Data Sketches\\n\\n### A Sequential Theta Sketch For Estimating the number of distinct values\\n**Estimating the number of distinct values**  in a data set is a well-studied problem with many applications in databases, stream processing, etc. Formally, the problem is describes as: consider a data set, $S$, of $N$ items, where each item is from a universe of $n$ possible values. The number of distinct values in $S$, called the zeroth frequency moment $F_0$, is the number of values from the universe that occur at least once in $S$. \\n\\n\\n|  | |\\n|--|--|\\n| stream $S_1$ | C, D, B, B, Z, B, B, R, T, S, X, R, D, U, E, B, R, T, Y, L, M, A, T, W |\\n| stream $S_2$ | T, B, B, R, W, B, B, T, T, E, T, R, R, T, E, M, W, T, R, M, M, W, B, W |\\n\\n**Figure. 1** Two example data streams of $N = 24$ items from a universe $\\\\{A, B, \\\\ldots, Z\\\\}$ of size $n = 26$. $S_1$ has 15 distinct values while $S_2$ has 6.\\n\\n\\n\\nFigure 1 depicts two example streams, $S_1$ and $S_2$ , with $15$ and $6$ distinct values, respectively. The simplest and most direct approach is to maintain a sorted set of distinct values. Whenever a new item is encountered in the data stream, a binary search is performed over the sorted set. If the item is already present, it is skipped; otherwise, the new item is inserted into its correct position in the sorted set. Finally, the size of the set is calculated to return $F_0$ the number of distinct values. However, this approach won\'t scale well as the size of the data stream increases. It requires linear space proportional to the number of distinct items and need to perform a binary search for every new item encountered.\\n  \\nSo, what we want here is an estimation algorithm that outputs an estimate $\\\\hat{F}_0$, a function of the synopsis, that is guaranteed to be close to the true $F_0$ for the stream, however it requires much less space and computation. The relative error $\\\\epsilon$ introduced by using the synopsis is calculated as $\\\\mid \\\\hat{F}_0 - F_0 \\\\mid / F_0$. The desired synopsis should provide a ($\\\\epsilon, \\\\delta$)-approximation, which guarantees that the estimated output $\\\\hat{F}_0$ is within the relative error of $\\\\epsilon$ with probability at least $1 - \\\\delta$.\\n\\nA common algorithm sastifies above requirements is **K Minimum Values (KMV) Theta Sketch**. It maintains a sample set of size $k$ and a parameter $\\\\Theta$ to decide which elements are added to the sample set. It uses a random hash function $h$ whose outputs are uniformly distributed in the range $[0, 1]$, and $\\\\Theta$ is always in the same range. An incoming stream element is first hashed, and then the hash is compared to $\\\\Theta$. In case it is smaller, the value is added to sample set. Otherwise, it is ignored. Because the hash outputs are uniformly distributed, the expected proportion of values smaller than $\\\\Theta$ is $\\\\Theta$. Therefore, we can estimate the number of distinct items in the stream by dividing the number of distinct items stored samples by $\\\\Theta$ (assuming that the random hash function is drawn independently of the stream values). \\n\\nKMV $\\\\Theta$ Theta Sketch takes a parameter $k$ to create a constant sample set of $k$ items to keep the $k$ smallest hashes seen so far. $\\\\Theta$ is $1$ during the first $k$ updates, and subsequently it is the hash of the largest sample in the set. Once the sample set is full, every update that inserts a new element also removes the largest one and updates $\\\\Theta$. This sample set is implemented effectively as a sorted set. The KMV $\\\\Theta$ Theta Sketch also provides the merge method to merge two KMV $\\\\Theta$ Theta Sketches while still providing the same bounded-guarantee. Intuitively, the merge algorithm is similar to adding a batch of samples to the sample set.\\n\\nThe accuracy of the algorithm is based on the Relative Standard Error (RSE) of the estimate, which is the standard error normalized by the quantity being estimated. The KMV $\\\\Theta$ Theta Sketch with $k$ samples has the RSE less than $\\\\frac{1}{\\\\sqrt{k-1}}$.\\n\\n\\n```clike\\nInitialize(k):\\n    theta = 1 \\n    k = k\\n    est = 0 \\n    sample_set = empty set of size k\\n\\nQuery():\\n    return est\\n\\nUpdate(element):\\n    hash_value = random_hash(element)\\n    if hash_value >= theta:\\n        return \\n    add hash_value to sample_set\\n    keep k smallest samples in the sample_set\\n    theta = max(sample_set)\\n    est = (|sample_set| - 1) / theta\\n\\nMerge(S):\\n    sample_set = merfe sample_set and S.sample_set\\n    keep k smallest values in the sample_set\\n    theta = max(sample_set)\\n    est = (|sample_set| - 1) / theta\\n```\\n**Algorithm. 1**  Sequential Theta Sketch\\n\\nAt the first glance, we can argue that there is no difference between the use of the $\\\\Theta$ and the use of the $k$. However, without the use of the $\\\\Theta$, the value $k$ will be overloaded with multiple roles: (1) $k$ determines the RSE (accuracy) of the sketch, (2) $k$ determines the upper-bound size of sample set (the sketch), (3) $k$ is used as a constant in the estimator and RSE equations, (4) $k$ determines the V($k^{th}$) threshold, used to reject/accept hash values into the sorted set. By unloading some of these roles, we will gain the freedom to do some flexible and customizable implementation. The introduction of the value $\\\\Theta$ decouples (3) and (4) above from $k$. \\n<br/>\\n\\n<center>\\n![Theta Sketch Example](sequential_theta_sketch.drawio.svg)\\n</center>\\n\\n**Figure. 2** An example illustrating the application of Theta Sketch ($k=2$) to estimate the number of distinct items in a datastream $S$ containing 4 unique items. The estimated result returns 5, showing a slight deviation from the actual count.\\n\\n### Making Sense of Relaxed Consistency\\n\\nBy Algorithm 1, we already have the KMV $\\\\Theta$ Theta Sketch as the basic building block for the Concurrent Sketches, where multiple sketches run concurrently. However, they require an effective concurrency scheme to coordinate the concurrent/parallel access and synchronize the information between sketches. To achieve a higher probability of acceleration provided by the scheme, some form of relaxation is required.\\n\\nThe idea of relaxation here is that instead of making operations look like they happen sequentially, one after another, we can relax some properties of the implementation. Imagine a simple design of the CPU and its memory hierarchy, which only has two cores sharing the same main memory. If two threads want to write simultaneously to the same memory location, while one thread is writing, the other needs to wait until the former finishes its ongoing operation, which might cause a stall. Rather than waiting for the write from the first thread to become visible, the second thread could place its write into a store buffer and then continue to the next operation. Immediately after that, while the write is still waiting in the store buffer to be visible, if the second thread wants to read the value it just wrote, it can read the value from the cached register or the store buffer without going to the main memory. However, that value is not visible yet to the first thread, so different values of the same memory location will be observed by the two threads.\\n\\n<center>\\n![Simple store buffer](simple_store_buffer.drawio.svg)\\n</center>\\n\\n**Figure. 4** This figure demonstrates the situation where two threads on separate CPU cores interact with a shared memory location using store buffers. Core 2 writes the value `A = 2` to its store buffer and then to main memory, while Core 1 writes `A = 1` to its store buffer. When Core 1 reads the value of A, it reads A = 1 from its store buffer, whereas Core 2 reads `A = 2` from the main memory. This results in both cores observing different values for the same memory location.\\n\\n:::warning \\nThe above example is just a simple store buffer illustration that might not be accurate in reality. However, it serves as a good way to explain some sources/implementations of relaxation.\\n:::\\n\\nAnother example of relaxation can be the FIFO queue, which has sequential semantics, inherently leading to memory contention in parallel environments, thus limiting scalability. The $k$ out-of-order relaxation allows relaxed operation orders to deviate from the sequential order by up to $k$. This means for the dequeue operation on the relaxed FIFO queue, any of the first $k$ items can be returned instead of just the head. The relaxation increases the number of memory access points at the expense of weakening the sequential semantics.\\n\\n<center>\\n![FIFO queue](fifo_queue.drawio.svg)\\n</center>\\n\\n**Figure. 5** A standard FIFO queue where sequential semantics lead to a memory contention point. The dequeue operation always retrieves the head item, causing contention in parallel environments and limiting scalability.\\n\\n<center>\\n![Relaxed FIFO queue](relaxed_fifo_queue.drawio.svg)\\n</center>\\n\\n**Figure. 6** a $k$ out-of-order relaxed FIFO queue. In this model, the dequeue operation can return any of the first $k$ items instead of just the head. This relaxation reduces memory contention by increasing the number of memory access points, although it weakens the strict sequential semantics.\\n\\n\\n### Relaxed Consistency for Concurrent Sketches\\nThis section discusses the Relaxed Consistency for Concurrent Sketches. We will step-by-step extend the sequential KMV $\\\\Theta$ Theta Sketch to support some form of concurrency. The paper adopts a variant of the out-of-order relaxation mentioned above. Intuitively, this relaxation allows a query to \u201cmiss\u201d a bounded number of updates that precede it. Because a sketch is order-agnostic, the relaxation further allows re-ordering of the updates \u201cseen\u201d by a query. From now on, we will call this type of relaxation *r-relaxation* to distinguish it from the relaxations used by the Concurrent KMV $\\\\Theta$ Theta Sketches.\\n\\n**Definition *r-relaxation*:** A sequential history $H$ is an *r-relaxation* of a sequential history $H\'$, if $H$ is comprised of all but at most $r$ of the invocations in $H\'$ and their responses, and each invocation in $H$ is preceded by all but at most $r$ of the invocations that precede the same invocation in $H\'$. The *r-relaxation* of sequential sketches is the set of histories that have *r-relaxations* in sequential sketches:\\n\\n:::danger \\nContinue this section later after reading the Quantitative Relaxation of Concurrent Data Structures paper to see what is the difference between the two definitions.\\n:::\\n### Generic Algorithm for  Concurrent Sketches\\n\\n**Composable sketch:** in order to be able to build upon an existing sequential sketch,  we first extend it to support a form of concurrency called *composable*. A composable sketch allows concurrency between merges and queries. This property is needed so that we don\'t have to stop all the sketches when we are merging or querying.\\n\\n<center>\\n![Generic Concurrent Sketches](parsketch1.drawio.svg)\\n</center>\\n\\n## Directions for Concurrent Data Summarization"},{"id":"welcome","metadata":{"permalink":"/hpc-blog/vn/blog/welcome","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2021-08-26-welcome/index.md","source":"@site/blog/2021-08-26-welcome/index.md","title":"Welcome","description":"Docusaurus blogging features are powered by the blog plugin.","date":"2021-08-26T00:00:00.000Z","tags":[{"inline":false,"label":"Facebook","permalink":"/hpc-blog/vn/blog/tags/facebook","description":"Facebook tag description"},{"inline":false,"label":"Hello","permalink":"/hpc-blog/vn/blog/tags/hello","description":"Hello tag description"},{"inline":false,"label":"Docusaurus","permalink":"/hpc-blog/vn/blog/tags/docusaurus","description":"Docusaurus tag description"}],"readingTime":0.405,"hasTruncateMarker":false,"authors":[{"name":"S\xe9bastien Lorber","title":"Docusaurus maintainer","url":"https://sebastienlorber.com","imageURL":"https://github.com/slorber.png","key":"slorber"},{"name":"Yangshun Tay","title":"Front End Engineer @ Facebook","url":"https://github.com/yangshun","imageURL":"https://github.com/yangshun.png","key":"yangshun"}],"frontMatter":{"slug":"welcome","title":"Welcome","authors":["slorber","yangshun"],"tags":["facebook","hello","docusaurus"]},"unlisted":false,"prevItem":{"title":"Concurrent Data Summarization","permalink":"/hpc-blog/vn/blog/concurrent-data-summarization"},"nextItem":{"title":"MDX Blog Post","permalink":"/hpc-blog/vn/blog/mdx-blog-post"}},"content":"[Docusaurus blogging features](https://docusaurus.io/docs/blog) are powered by the [blog plugin](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog).\\n\\nSimply add Markdown files (or folders) to the `blog` directory.\\n\\nRegular blog authors can be added to `authors.yml`.\\n\\nThe blog post date can be extracted from filenames, such as:\\n\\n- `2019-05-30-welcome.md`\\n- `2019-05-30-welcome/index.md`\\n\\nA blog post folder can be convenient to co-locate blog post images:\\n\\n![Docusaurus Plushie](./docusaurus-plushie-banner.jpeg)\\n\\nThe blog supports tags as well!\\n\\n**And if you don\'t want a blog**: just delete this directory, and use `blog: false` in your Docusaurus config."},{"id":"mdx-blog-post","metadata":{"permalink":"/hpc-blog/vn/blog/mdx-blog-post","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2021-08-01-mdx-blog-post.mdx","source":"@site/blog/2021-08-01-mdx-blog-post.mdx","title":"MDX Blog Post","description":"Blog posts support Docusaurus Markdown features, such as MDX.","date":"2021-08-01T00:00:00.000Z","tags":[{"inline":false,"label":"Docusaurus","permalink":"/hpc-blog/vn/blog/tags/docusaurus","description":"Docusaurus tag description"}],"readingTime":0.175,"hasTruncateMarker":false,"authors":[{"name":"S\xe9bastien Lorber","title":"Docusaurus maintainer","url":"https://sebastienlorber.com","imageURL":"https://github.com/slorber.png","key":"slorber"}],"frontMatter":{"slug":"mdx-blog-post","title":"MDX Blog Post","authors":["slorber"],"tags":["docusaurus"]},"unlisted":false,"prevItem":{"title":"Welcome","permalink":"/hpc-blog/vn/blog/welcome"},"nextItem":{"title":"Long Blog Post","permalink":"/hpc-blog/vn/blog/long-blog-post"}},"content":"Blog posts support [Docusaurus Markdown features](https://docusaurus.io/docs/markdown-features), such as [MDX](https://mdxjs.com/).\\n\\n:::tip\\n\\nUse the power of React to create interactive blog posts.\\n\\n```js\\n<button onClick={() => alert(\'button clicked!\')}>Click me!</button>\\n```\\n\\n<button onClick={() => alert(\'button clicked!\')}>Click me!</button>\\n\\n:::"},{"id":"long-blog-post","metadata":{"permalink":"/hpc-blog/vn/blog/long-blog-post","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2019-05-29-long-blog-post.md","source":"@site/blog/2019-05-29-long-blog-post.md","title":"Long Blog Post","description":"This is the summary of a very long blog post,","date":"2019-05-29T00:00:00.000Z","tags":[{"inline":false,"label":"Hello","permalink":"/hpc-blog/vn/blog/tags/hello","description":"Hello tag description"},{"inline":false,"label":"Docusaurus","permalink":"/hpc-blog/vn/blog/tags/docusaurus","description":"Docusaurus tag description"}],"readingTime":2.05,"hasTruncateMarker":true,"authors":[{"name":"Endilie Yacop Sucipto","title":"Maintainer of Docusaurus","url":"https://github.com/endiliey","imageURL":"https://github.com/endiliey.png","key":"endi"}],"frontMatter":{"slug":"long-blog-post","title":"Long Blog Post","authors":"endi","tags":["hello","docusaurus"]},"unlisted":false,"prevItem":{"title":"MDX Blog Post","permalink":"/hpc-blog/vn/blog/mdx-blog-post"},"nextItem":{"title":"First Blog Post","permalink":"/hpc-blog/vn/blog/first-blog-post"}},"content":"This is the summary of a very long blog post,\\n\\nUse a `\x3c!--` `truncate` `--\x3e` comment to limit blog post size in the list view.\\n\\n\x3c!--truncate--\x3e\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet"},{"id":"first-blog-post","metadata":{"permalink":"/hpc-blog/vn/blog/first-blog-post","editUrl":"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/blog/2019-05-28-first-blog-post.md","source":"@site/blog/2019-05-28-first-blog-post.md","title":"First Blog Post","description":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet","date":"2019-05-28T00:00:00.000Z","tags":[{"inline":false,"label":"Hola","permalink":"/hpc-blog/vn/blog/tags/hola","description":"Hola tag description"},{"inline":false,"label":"Docusaurus","permalink":"/hpc-blog/vn/blog/tags/docusaurus","description":"Docusaurus tag description"}],"readingTime":0.12,"hasTruncateMarker":false,"authors":[{"name":"Gao Wei","title":"Docusaurus Core Team","url":"https://github.com/wgao19","image_url":"https://github.com/wgao19.png","imageURL":"https://github.com/wgao19.png"}],"frontMatter":{"slug":"first-blog-post","title":"First Blog Post","authors":{"name":"Gao Wei","title":"Docusaurus Core Team","url":"https://github.com/wgao19","image_url":"https://github.com/wgao19.png","imageURL":"https://github.com/wgao19.png"},"tags":["hola","docusaurus"]},"unlisted":false,"prevItem":{"title":"Long Blog Post","permalink":"/hpc-blog/vn/blog/long-blog-post"}},"content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque elementum dignissim ultricies. Fusce rhoncus ipsum tempor eros aliquam consequat. Lorem ipsum dolor sit amet"}]}}')}}]);