import React, { useState, useEffect } from 'react';
import { Terminal, Binary, Sigma, Cpu } from 'lucide-react';

const ALGORITHM_STREAMS = [
  // 1. Coding Algorithm: Dijkstra's Shortest Path
  {
    type: 'GRAPH ALGORITHM',
    title: 'Dijkstra_Shortest_Path.cpp',
    badge: 'O(E log V)',
    code: `// Dijkstra Shortest Path (Priority Queue)
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
dist[src] = 0;
pq.push({0, src});

while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;
    for (auto &[v, w] : adj[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push({dist[v], v});
        }
    }
}`
  },

  // 2. Mathematical Algorithm: Fast Fourier Transform (FFT)
  {
    type: 'MATHEMATICAL ALGORITHM',
    title: 'Cooley_Tukey_FFT.py',
    badge: 'O(N log N)',
    code: `# Fast Fourier Transform (Complex Roots of Unity)
def fft(a: list[complex]) -> list[complex]:
    n = len(a)
    if n <= 1: return a
    even, odd = fft(a[0::2]), fft(a[1::2])
    w = [cmath.exp(-2j * cmath.pi * k / n) for k in range(n // 2)]
    return [even[k] + w[k] * odd[k] for k in range(n // 2)] + \\
           [even[k] - w[k] * odd[k] for k in range(n // 2)]`
  },

  // 3. Coding Algorithm: Kadane's Maximum Subarray
  {
    type: 'DYNAMIC PROGRAMMING',
    title: 'Kadane_Max_Subarray.cpp',
    badge: 'O(N) Time · O(1) Space',
    code: `// Kadane's Maximum Subarray Sum
long long max_so_far = nums[0];
long long current_max = nums[0];

for (size_t i = 1; i < nums.size(); ++i) {
    current_max = max((long long)nums[i], current_max + nums[i]);
    max_so_far = max(max_so_far, current_max);
}
return max_so_far;`
  },

  // 4. Mathematical Algorithm: Extended Euclidean & Fermat
  {
    type: 'NUMBER THEORY',
    title: 'Extended_Euclid_GCD.cpp',
    badge: 'gcd(a, b) = ax + by',
    code: `// Extended Euclidean Algorithm
long long extgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long d = extgcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - y1 * (a / b);
    return d; // a^(p-1) = 1 (mod p)
}`
  },

  // 5. Mathematical Algorithm: Gradient Descent Optimization
  {
    type: 'OPTIMIZATION ALGORITHM',
    title: 'Gradient_Descent.py',
    badge: '∇J(θ) Minimization',
    code: `# Stochastic Gradient Descent Update
def gradient_descent(X, y, theta, alpha=0.01, epochs=1000):
    m = len(y)
    for epoch in range(epochs):
        error = X.dot(theta) - y
        grad = (1 / m) * X.T.dot(error)
        theta = theta - alpha * grad
    return theta`
  }
];

// Floating mathematical formula symbols
const MATH_EQUATIONS = [
  { eq: 'e^{i\\pi} + 1 = 0', top: '18%', left: '12%', color: '#C6F432' },
  { eq: '\\nabla L(\\theta) = \\frac{1}{m} \\sum (h_\\theta(x) - y)x', top: '38%', right: '8%', color: '#64B5F6' },
  { eq: '\\sum_{k=0}^{\\infty} \\frac{x^k}{k!} = e^x', top: '55%', left: '6%', color: '#86E18B' },
  { eq: 'F_n = \\frac{\\phi^n - \\psi^n}{\\sqrt{5}}', top: '72%', right: '14%', color: '#F7A258' },
  { eq: '\\det(A - \\lambda I) = 0', top: '88%', left: '15%', color: '#C6F432' },
  { eq: 'a^{\\phi(m)} \\equiv 1 \\pmod m', top: '25%', right: '20%', color: '#64B5F6' }
];

export default function AlgorithmBackground() {
  // Stream 1 (Left): Coding Algorithms
  const [stream1Idx, setStream1Idx] = useState(0);
  const [stream1Text, setStream1Text] = useState('');
  const [stream1Finished, setStream1Finished] = useState(false);

  // Stream 2 (Right): Mathematical Algorithms
  const [stream2Idx, setStream2Idx] = useState(1);
  const [stream2Text, setStream2Text] = useState('');
  const [stream2Finished, setStream2Finished] = useState(false);

  // Typing effect for Stream 1
  useEffect(() => {
    const fullCode = ALGORITHM_STREAMS[stream1Idx].code;
    setStream1Text('');
    setStream1Finished(false);

    let charIdx = 0;
    const interval = setInterval(() => {
      if (charIdx < fullCode.length) {
        setStream1Text(fullCode.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(interval);
        setStream1Finished(true);
        // Wait 3.5 seconds, then move to next
        setTimeout(() => {
          setStream1Idx((prev) => (prev + 2) % ALGORITHM_STREAMS.length);
        }, 3500);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [stream1Idx]);

  // Typing effect for Stream 2
  useEffect(() => {
    const fullCode = ALGORITHM_STREAMS[stream2Idx].code;
    setStream2Text('');
    setStream2Finished(false);

    let charIdx = 0;
    const interval = setInterval(() => {
      if (charIdx < fullCode.length) {
        setStream2Text(fullCode.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(interval);
        setStream2Finished(true);
        // Wait 4 seconds, then move to next
        setTimeout(() => {
          setStream2Idx((prev) => (prev + 1) % ALGORITHM_STREAMS.length);
        }, 4000);
      }
    }, 32);

    return () => clearInterval(interval);
  }, [stream2Idx]);

  const stream1Data = ALGORITHM_STREAMS[stream1Idx];
  const stream2Data = ALGORITHM_STREAMS[stream2Idx];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Floating Mathematical Equations in background */}
      {MATH_EQUATIONS.map((item, idx) => (
        <div
          key={idx}
          className="absolute font-mono text-xs md:text-sm tracking-wider font-semibold opacity-15 md:opacity-20 animate-pulse hidden sm:block"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            color: item.color,
            animationDuration: `${4 + idx * 1.5}s`
          }}
        >
          {item.eq}
        </div>
      ))}

      {/* Stream Window 1: Left Background (Coding Algorithm) */}
      <div className="absolute top-[28%] left-[2%] md:left-[4%] max-w-[340px] md:max-w-[420px] opacity-25 hover:opacity-40 transition-opacity duration-300 hidden lg:block">
        <div className="rounded-xl border border-[#C6F432]/30 bg-[#080B0A]/85 p-3.5 backdrop-blur-md shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#292D34]/80 text-[10px] font-mono mb-2">
            <div className="flex items-center gap-1.5 text-[#C6F432]">
              <Binary className="w-3.5 h-3.5" />
              <span className="font-bold uppercase tracking-wider">{stream1Data.type}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#C6F432]/10 text-[#C6F432] font-semibold">
              {stream1Data.badge}
            </span>
          </div>

          <div className="text-[10px] text-[#929B95] font-mono mb-1.5">
            // {stream1Data.title}
          </div>

          {/* Typing Code Body */}
          <pre className="font-mono text-[10px] md:text-[11px] text-[#F4F4F0] leading-relaxed whitespace-pre-wrap overflow-hidden min-h-[140px]">
            {stream1Text}
            <span className="inline-block w-2 h-3.5 bg-[#C6F432] ml-0.5 animate-pulse align-middle" />
          </pre>

          {stream1Finished && (
            <div className="pt-2 text-[9px] font-mono text-[#86E18B] flex items-center gap-1">
              <span>✓ Verified &amp; Optimized</span>
            </div>
          )}
        </div>
      </div>

      {/* Stream Window 2: Right Background (Mathematical Algorithm) */}
      <div className="absolute top-[56%] right-[2%] md:right-[4%] max-w-[340px] md:max-w-[420px] opacity-25 hover:opacity-40 transition-opacity duration-300 hidden lg:block">
        <div className="rounded-xl border border-[#64B5F6]/30 bg-[#080B0A]/85 p-3.5 backdrop-blur-md shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#292D34]/80 text-[10px] font-mono mb-2">
            <div className="flex items-center gap-1.5 text-[#64B5F6]">
              <Sigma className="w-3.5 h-3.5" />
              <span className="font-bold uppercase tracking-wider">{stream2Data.type}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#64B5F6]/10 text-[#64B5F6] font-semibold">
              {stream2Data.badge}
            </span>
          </div>

          <div className="text-[10px] text-[#929B95] font-mono mb-1.5">
            // {stream2Data.title}
          </div>

          {/* Typing Code Body */}
          <pre className="font-mono text-[10px] md:text-[11px] text-[#F4F4F0] leading-relaxed whitespace-pre-wrap overflow-hidden min-h-[140px]">
            {stream2Text}
            <span className="inline-block w-2 h-3.5 bg-[#64B5F6] ml-0.5 animate-pulse align-middle" />
          </pre>

          {stream2Finished && (
            <div className="pt-2 text-[9px] font-mono text-[#64B5F6] flex items-center gap-1">
              <span>✓ Convergence Reached</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
