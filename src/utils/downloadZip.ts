import JSZip from "jszip";

export async function downloadEngineSourceZip() {
  const zip = new JSZip();

  const readmeContent = `# Looped Transformer Arena

## Algorithmic Reasoning via Weight-Tied Recurrence

This repository demonstrates the fundamental difference between:
1. **Standard Feedforward Transformers**: $L$ distinct layer blocks ($O(L)$ parameters). In deep multi-hop reasoning or long-horizon algorithmic induction, fixed-depth models suffer from **Horizon Overflow / Context Blindness** once depth capacity is exhausted.
2. **Looped Transformers (Weight-Tied Recurrent Models)**: A single compact transformer block ($O(1)$ parameters) applied recursively $t = 1 \dots T$. By looping representations back into the shared block, the model achieves adaptive computational depth at test time while storing one block instead of $L$ (for $L=12$, that is $-91.7\%$ of layer blocks — an arithmetic consequence of weight tying, not a measured benchmark).

### Key Equations
- **Standard Stack**: $x_{l+1} = \text{Layer}_l(x_l; W_l), \quad l \in [0, L-1]$
- **Looped Recurrence**: $x_{t+1} = \text{Layer}_{\text{shared}}(x_t; W_{\text{shared}}), \quad t \in [0, T-1]$
- **Convergence Metric (Fixed-Point Delta)**: $\Delta_t = \|x_{t+1} - x_t\|_2 < 0.005$
- **PonderNet Halting Distribution**: $\lambda_t = \sigma(\text{Linear}(x_t)), \quad p(t) = \lambda_t \prod_{k=1}^{t-1}(1 - \lambda_k)$

### Research References
- Giannou et al., *Looped Transformers as Programmable Computers*, ICML 2023 (arXiv:2301.13196)
- Banino, Balaguer & Blundell, *PonderNet: Learning to Ponder*, 2021 (arXiv:2107.05407)
- Dehghani et al., *Universal Transformers*, 2018 (arXiv:1807.03819)
- Fan et al., *Looped Transformers for Length Generalization*, 2024 (arXiv:2409.15647)

> Note: this sandbox is a deterministic frontend *simulation* of the behaviors these papers describe. It does not implement or benchmark the models themselves.
`;

  const engineTsContent = `// Looped Transformer Engine
export interface LoopedConfig {
  hiddenDim: number;
  heads: number;
  convergenceThreshold: number;
}

export class LoopedTransformerEngine {
  constructor(private config: LoopedConfig) {}

  public step(state: Float32Array): { nextState: Float32Array; delta: number; haltProb: number } {
    const nextState = new Float32Array(state.length);
    let diffSq = 0;
    for (let i = 0; i < state.length; i++) {
      // Simulating shared feed-forward recurrent transition
      nextState[i] = Math.tanh(state[i] * 0.95);
      diffSq += (nextState[i] - state[i]) ** 2;
    }
    const delta = Math.sqrt(diffSq);
    const haltProb = 1 / (1 + Math.exp(-10 * (this.config.convergenceThreshold - delta)));
    return { nextState, delta, haltProb };
  }
}
`;

  zip.file("README.md", readmeContent);
  zip.file("src/engine.ts", engineTsContent);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "LoopedTransformerEngine.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
