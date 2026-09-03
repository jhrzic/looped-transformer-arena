# Looped Transformers Sandbox

## ⚠️ Simulation Disclaimer

This repository is an **educational sandbox simulation**. It does not run live, low-level tensor weights or connect to backend PyTorch/GPU execution clusters. Instead, the core engine explicitly visualizes the *mathematical behaviors and logic paths* of these two transformer designs using deterministic JavaScript algorithms.

**[▶ Live demo](https://looped-transformer-arena.vercel.app)**

An interactive visualization of why fixed-depth transformers stall on deep multi-hop graph traversal, and how a **looped (weight-tied recurrent) transformer** sidesteps that wall by spending more compute on harder inputs.

Built with Vite, React, TypeScript, and Tailwind. Runs entirely in the browser.

## Scenarios

Three hand-built reasoning tasks, selectable at runtime:

| Scenario | Hops | What it models |
|---|---|---|
| **Fraud Ring Discovery** | 6 | Shell accounts cycling transactions back to an illicit source |
| **Live Maze Traversal** | 7 | Deep pathfinding through dead ends and bifurcations |
| **8-Hop Pointer Chasing** | 8 | Recursive indirect memory dereference chains |

Each contains a hidden multi-hop path plus decoy nodes. The two architectures run the same task side by side.

- **Standard transformer** — a fixed 12-layer stack. Each layer propagates relational information roughly one hop. When the path is deeper than the stack's horizon, traversal dies partway and the model reports a clean result: a false negative by construction.
- **Looped transformer** — the same block applied recursively. Each loop advances the traversal; a halting gate accumulates confidence and fires when the hidden state stabilizes.

## Concepts visualized

**Layer saturation / horizon collapse.** Feed-forward transformers pass hidden states through a rigid stack. Multi-hop reasoning needing more sequential steps than the stack provides cannot complete, regardless of model width.

**Fixed-point iteration.** A looped transformer applies a shared block recursively: `h_t = F_θ(h_{t-1})`. When the map behaves as a contraction, repeated application drives consecutive states together (`‖h_t − h_{t−1}‖ → 0`), and the loop exits once the change falls below threshold.

**Learned halting.** Rather than a fixed loop count, a small head emits a halting probability each iteration. Easy inputs exit fast; tangled topologies hold the state longer.

**Weight tying and parameter count.** Storing one shared block instead of 12 distinct ones is a −91.7% reduction in layer blocks. That figure is arithmetic (11/12), not a measured benchmark.

## Run locally

```bash
git clone https://github.com/jhrzic/looped-transformer-arena.git
cd looped-transformer-arena
npm install
npm run dev
```

Open http://localhost:3000, pick a scenario, and hit **Execute Parallel Run**.

## Background reading

- Giannou et al., *Looped Transformers as Programmable Computers*, ICML 2023 ([arXiv:2301.13196](https://arxiv.org/abs/2301.13196))
- Banino, Balaguer & Blundell, *PonderNet: Learning to Ponder*, 2021 ([arXiv:2107.05407](https://arxiv.org/abs/2107.05407))
- Dehghani et al., *Universal Transformers*, 2018 ([arXiv:1807.03819](https://arxiv.org/abs/1807.03819))
- Fan et al., *Looped Transformers for Length Generalization*, 2024 ([arXiv:2409.15647](https://arxiv.org/abs/2409.15647))

This sandbox simulates behaviors these papers describe; it does not implement or benchmark the models themselves.

## License

MIT
