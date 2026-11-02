import { ArrowUpRight } from "lucide-react";

const weeklyOrders = [
  { day: "Mon", value: 34 },
  { day: "Tue", value: 48 },
  { day: "Wed", value: 41 },
  { day: "Thu", value: 63 },
  { day: "Fri", value: 57 },
  { day: "Sat", value: 78 },
  { day: "Sun", value: 69 },
];

export function PerformanceChart() {
  const points = weeklyOrders
    .map((point, index) => {
      const x = 26 + index * 54;
      const y = 150 - point.value * 1.35;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Meal interest this week
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Illustrative demo activity · not live orders
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">
          <ArrowUpRight aria-hidden="true" size={14} />
          Demo trend
        </span>
      </div>

      <div className="mt-4 overflow-hidden">
        <svg
          viewBox="0 0 380 175"
          className="w-full"
          role="img"
          aria-labelledby="performance-title performance-description"
        >
          <title id="performance-title">Sample weekly meal interest</title>
          <desc id="performance-description">
            Fictional meal interest values rise from Monday to Saturday and
            ease slightly on Sunday.
          </desc>
          {[40, 80, 120, 160].map((y) => (
            <line
              key={y}
              x1="20"
              y1={y}
              x2="362"
              y2={y}
              stroke="#e9ebe3"
              strokeDasharray="3 5"
            />
          ))}
          <polygon
            points={`26,160 ${points} 350,160`}
            fill="url(#chart-fill)"
          />
          <defs>
            <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#63886d" stopOpacity=".22" />
              <stop offset="100%" stopColor="#63886d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={points}
            fill="none"
            stroke="#2c654b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {weeklyOrders.map((point, index) => {
            const x = 26 + index * 54;
            const y = 150 - point.value * 1.35;
            return (
              <g key={point.day}>
                <circle cx={x} cy={y} r="4" fill="white" stroke="#2c654b" strokeWidth="2" />
                <text
                  x={x}
                  y="172"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#777e74"
                >
                  {point.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
