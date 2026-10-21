import React from "react";

// A structured flowchart (sequence, decisions, loops) drawn as SVG with the standard 4CP0 symbols:
// terminator (rounded), process (rectangle), input/output (parallelogram), decision (diamond), subprogram (double-sided box).
export type FlowNode =
  | { t: "start" | "end"; text?: string }
  | { t: "process" | "io" | "sub"; text: string }
  | { t: "if"; text: string; yes: FlowNode[]; no: FlowNode[]; yesLabel?: string; noLabel?: string }
  | { t: "while"; text: string; body: FlowNode[]; yesLabel?: string; noLabel?: string };

const BOX_W = 190;
const LINE_H = 15;
const GAP = 26; // vertical gap (arrow length) between shapes
const COL_GAP = 34;
const CH = 7.1; // average character width at 12.5px

function wrap(text: string, max = 24): string[] {
  const words = String(text || "").split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

type El = React.ReactNode;
interface Block {
  w: number; // total width
  h: number; // total height
  cx: number; // x of the centre line, measured from the block's left
  draw: (x: number, y: number, key: string) => El[]; // x,y = top-left
}

const stroke = "#334155";

function Arrow({ x1, y1, x2, y2, head = true }: { x1: number; y1: number; x2: number; y2: number; head?: boolean }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={1.6} markerEnd={head ? "url(#fc-arrow)" : undefined} />;
}

function Label({ x, y, text, anchor = "middle" }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fontSize={11.5} fontWeight={700} fill="#7c3aed" textAnchor={anchor} fontFamily="ui-sans-serif, system-ui">
      {text}
    </text>
  );
}

function TextLines({ cx, cy, lines }: { cx: number; cy: number; lines: string[] }) {
  const top = cy - ((lines.length - 1) * LINE_H) / 2;
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={cx} y={top + i * LINE_H + 4} fontSize={12.5} textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fill="#0f172a">
          {l}
        </text>
      ))}
    </>
  );
}

function shapeBlock(n: FlowNode): Block {
  if (n.t === "if" || n.t === "while") throw new Error("not a simple shape");
  const text = n.t === "start" ? n.text || "Start" : n.t === "end" ? n.text || "End" : n.text;
  const lines = wrap(text || "", n.t === "io" ? 22 : 24);
  const longest = Math.max(...lines.map((l) => l.length));
  const w = Math.max(n.t === "start" || n.t === "end" ? 110 : BOX_W, longest * CH + 34);
  const h = Math.max(40, lines.length * LINE_H + 22);
  return {
    w,
    h,
    cx: w / 2,
    draw: (x, y, key) => {
      const cx = x + w / 2;
      const cy = y + h / 2;
      let shape: El;
      if (n.t === "start" || n.t === "end") shape = <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="#ede9fe" stroke={stroke} strokeWidth={1.6} />;
      else if (n.t === "io") {
        const s = 14;
        shape = <polygon points={`${x + s},${y} ${x + w},${y} ${x + w - s},${y + h} ${x},${y + h}`} fill="#e0f2fe" stroke={stroke} strokeWidth={1.6} />;
      } else if (n.t === "sub")
        shape = (
          <g>
            <rect x={x} y={y} width={w} height={h} fill="#fef3c7" stroke={stroke} strokeWidth={1.6} />
            <line x1={x + 10} y1={y} x2={x + 10} y2={y + h} stroke={stroke} strokeWidth={1.4} />
            <line x1={x + w - 10} y1={y} x2={x + w - 10} y2={y + h} stroke={stroke} strokeWidth={1.4} />
          </g>
        );
      else shape = <rect x={x} y={y} width={w} height={h} fill="#ffffff" stroke={stroke} strokeWidth={1.6} />;
      return [
        <g key={key}>
          {shape}
          <TextLines cx={cx} cy={cy} lines={lines} />
        </g>,
      ];
    },
  };
}

function diamond(text: string) {
  const lines = wrap(text, 18);
  const longest = Math.max(...lines.map((l) => l.length));
  const w = Math.max(150, longest * CH * 1.55 + 30);
  const h = Math.max(70, lines.length * LINE_H * 1.7 + 36);
  return { w, h, lines };
}

function seqBlock(nodes: FlowNode[]): Block {
  const blocks = nodes.map(nodeBlock);
  if (!blocks.length) return { w: 40, h: 0, cx: 20, draw: () => [] };
  const left = Math.max(...blocks.map((b) => b.cx));
  const right = Math.max(...blocks.map((b) => b.w - b.cx));
  const w = left + right;
  const h = blocks.reduce((a, b) => a + b.h, 0) + GAP * (blocks.length - 1);
  return {
    w,
    h,
    cx: left,
    draw: (x, y, key) => {
      const out: El[] = [];
      let yy = y;
      blocks.forEach((b, i) => {
        out.push(...b.draw(x + left - b.cx, yy, `${key}-${i}`));
        yy += b.h;
        if (i < blocks.length - 1) {
          out.push(<Arrow key={`${key}-a${i}`} x1={x + left} y1={yy} x2={x + left} y2={yy + GAP} />);
          yy += GAP;
        }
      });
      return out;
    },
  };
}

function nodeBlock(n: FlowNode): Block {
  if (n.t === "if") {
    const d = diamond(n.text);
    const yes = seqBlock(n.yes);
    const no = seqBlock(n.no);
    // yes branch straight down under the diamond, no branch in a column to the right
    const yesLeft = Math.max(yes.cx, d.w / 2);
    const yesRight = Math.max(yes.w - yes.cx, d.w / 2);
    const noCx = yesLeft + yesRight + COL_GAP + (n.no.length ? no.cx : 0);
    const w = noCx + (n.no.length ? no.w - no.cx : 10);
    const branchH = Math.max(yes.h, no.h);
    const h = d.h + GAP + branchH + GAP + 6;
    return {
      w,
      h,
      cx: yesLeft,
      draw: (x, y, key) => {
        const cx = x + yesLeft;
        const out: El[] = [];
        out.push(
          <g key={`${key}-d`}>
            <polygon points={`${cx},${y} ${cx + d.w / 2},${y + d.h / 2} ${cx},${y + d.h} ${cx - d.w / 2},${y + d.h / 2}`} fill="#fce7f3" stroke={stroke} strokeWidth={1.6} />
            <TextLines cx={cx} cy={y + d.h / 2} lines={d.lines} />
          </g>
        );
        const by = y + d.h + GAP;
        const mergeY = by + branchH + GAP;
        // yes
        if (n.yes.length) {
          out.push(<Arrow key={`${key}-ya`} x1={cx} y1={y + d.h} x2={cx} y2={by} />);
          out.push(...yes.draw(cx - yes.cx, by, `${key}-y`));
          out.push(<Arrow key={`${key}-yb`} x1={cx} y1={by + yes.h} x2={cx} y2={mergeY} head={false} />);
        } else out.push(<Arrow key={`${key}-ya`} x1={cx} y1={y + d.h} x2={cx} y2={mergeY} head={false} />);
        out.push(<Label key={`${key}-yl`} x={cx + 8} y={y + d.h + 14} text={n.yesLabel || "Yes"} anchor="start" />);
        // no
        const nx = x + noCx;
        out.push(<Arrow key={`${key}-n1`} x1={cx + d.w / 2} y1={y + d.h / 2} x2={nx} y2={y + d.h / 2} head={false} />);
        out.push(<Label key={`${key}-nl`} x={cx + d.w / 2 + 6} y={y + d.h / 2 - 6} text={n.noLabel || "No"} anchor="start" />);
        if (n.no.length) {
          out.push(<Arrow key={`${key}-n2`} x1={nx} y1={y + d.h / 2} x2={nx} y2={by} />);
          out.push(...no.draw(nx - no.cx, by, `${key}-n`));
          out.push(<Arrow key={`${key}-n3`} x1={nx} y1={by + no.h} x2={nx} y2={mergeY} head={false} />);
        } else out.push(<Arrow key={`${key}-n2`} x1={nx} y1={y + d.h / 2} x2={nx} y2={mergeY} head={false} />);
        out.push(<Arrow key={`${key}-m`} x1={nx} y1={mergeY} x2={cx + 2} y2={mergeY} />);
        out.push(<line key={`${key}-m2`} x1={cx} y1={mergeY} x2={cx} y2={y + h} stroke={stroke} strokeWidth={1.6} />);
        return out;
      },
    };
  }
  if (n.t === "while") {
    const d = diamond(n.text);
    const body = seqBlock(n.body);
    const loopPad = 26; // space on the left for the return line
    const left = Math.max(body.cx, d.w / 2) + loopPad;
    const right = Math.max(body.w - body.cx, d.w / 2) + COL_GAP;
    const top = 14; // room for the loop-back arrow to join above the diamond
    const h = top + d.h + GAP + body.h + GAP + 10;
    return {
      w: left + right,
      h,
      cx: left,
      draw: (x, y, key) => {
        const cx = x + left;
        const dy = y + top;
        const out: El[] = [];
        out.push(<line key={`${key}-t`} x1={cx} y1={y} x2={cx} y2={dy} stroke={stroke} strokeWidth={1.6} />);
        out.push(
          <g key={`${key}-d`}>
            <polygon points={`${cx},${dy} ${cx + d.w / 2},${dy + d.h / 2} ${cx},${dy + d.h} ${cx - d.w / 2},${dy + d.h / 2}`} fill="#fce7f3" stroke={stroke} strokeWidth={1.6} />
            <TextLines cx={cx} cy={dy + d.h / 2} lines={d.lines} />
          </g>
        );
        const by = dy + d.h + GAP;
        out.push(<Arrow key={`${key}-ya`} x1={cx} y1={dy + d.h} x2={cx} y2={by} />);
        out.push(<Label key={`${key}-yl`} x={cx + 8} y={dy + d.h + 14} text={n.yesLabel || "Yes"} anchor="start" />);
        out.push(...body.draw(cx - body.cx, by, `${key}-b`));
        // loop back: down a little, left, up, right into the top of the diamond
        const endY = by + body.h + 12;
        const lx = x + 6;
        out.push(<line key={`${key}-l1`} x1={cx} y1={by + body.h} x2={cx} y2={endY} stroke={stroke} strokeWidth={1.6} />);
        out.push(<line key={`${key}-l2`} x1={cx} y1={endY} x2={lx} y2={endY} stroke={stroke} strokeWidth={1.6} />);
        out.push(<line key={`${key}-l3`} x1={lx} y1={endY} x2={lx} y2={y + 6} stroke={stroke} strokeWidth={1.6} />);
        out.push(<Arrow key={`${key}-l4`} x1={lx} y1={y + 6} x2={cx - 2} y2={y + 6} />);
        // exit: right from the diamond, down past the body, back to the centre line at the bottom
        const ex = x + left + right - 8;
        out.push(<line key={`${key}-e1`} x1={cx + d.w / 2} y1={dy + d.h / 2} x2={ex} y2={dy + d.h / 2} stroke={stroke} strokeWidth={1.6} />);
        out.push(<Label key={`${key}-nl`} x={cx + d.w / 2 + 6} y={dy + d.h / 2 - 6} text={n.noLabel || "No"} anchor="start" />);
        out.push(<line key={`${key}-e2`} x1={ex} y1={dy + d.h / 2} x2={ex} y2={y + h - 4} stroke={stroke} strokeWidth={1.6} />);
        out.push(<line key={`${key}-e3`} x1={ex} y1={y + h - 4} x2={cx} y2={y + h - 4} stroke={stroke} strokeWidth={1.6} />);
        out.push(<line key={`${key}-e4`} x1={cx} y1={y + h - 4} x2={cx} y2={y + h} stroke={stroke} strokeWidth={1.6} />);
        return out;
      },
    };
  }
  return shapeBlock(n);
}

export const Flowchart: React.FC<{ nodes: FlowNode[]; title?: string }> = ({ nodes, title }) => {
  let block: Block;
  try {
    block = seqBlock(nodes);
  } catch {
    return <div className="text-xs text-rose-700">This flowchart could not be drawn.</div>;
  }
  const pad = 12;
  const W = block.w + pad * 2;
  const H = block.h + pad * 2;
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {title && <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-xs font-mono text-slate-500">{title}</div>}
      <div className="overflow-x-auto p-2">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: "100%", height: "auto" }} role="img" aria-label="Flowchart">
          <defs>
            <marker id="fc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
            </marker>
          </defs>
          {block.draw(pad, pad, "fc")}
        </svg>
      </div>
    </div>
  );
};
