import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Lesson, TopologyLink, TopologyNode } from "../types";

interface Props {
  lesson: Lesson;
}

const colorByType: Record<TopologyNode["type"], string> = {
  host: "#2563eb",
  switch: "#10b981",
  router: "#f59e0b",
  server: "#7c3aed",
  firewall: "#dc2626",
  internet: "#64748b"
};

type SimNode = TopologyNode & d3.SimulationNodeDatum;
type SimLink = d3.SimulationLinkDatum<SimNode> & Omit<TopologyLink, "source" | "target">;

export default function NetworkSimulator({ lesson }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const width = ref.current.clientWidth || 900;
    const height = 520;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const nodes: SimNode[] = lesson.topology.nodes.map((node) => ({ ...node }));
    const links: SimLink[] = lesson.topology.links.map((link) => ({ ...link }));

    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force("link", d3.forceLink<SimNode, SimLink>(links).id((node) => node.id).distance(135))
      .force("charge", d3.forceManyBody().strength(-520))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(48));

    const link = svg
      .append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(links)
      .join("line");

    const labels = svg
      .append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("font-size", 12)
      .attr("fill", "#475569")
      .text((d) => d.label);

    const node = svg
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, SimNode>()
        .on("start", (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }));

    node.append("circle").attr("r", 30).attr("fill", (d) => colorByType[d.type]).attr("stroke", "#fff").attr("stroke-width", 3);
    node.append("text").attr("text-anchor", "middle").attr("dy", 48).attr("font-size", 13).attr("font-weight", 700).text((d) => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);
      labels
        .attr("x", (d) => (((d.source as SimNode).x ?? 0) + ((d.target as SimNode).x ?? 0)) / 2)
        .attr("y", (d) => (((d.source as SimNode).y ?? 0) + ((d.target as SimNode).y ?? 0)) / 2);
      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [lesson]);

  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <h3 className="text-xl font-semibold">Topologie interactive</h3>
        <p className="mt-2 text-sm text-slate-600">Deplace les equipements pour visualiser les flux et segments.</p>
      </section>
      <section className="panel overflow-hidden p-2">
        <svg ref={ref} className="h-[520px] w-full" role="img" aria-label={`Topologie ${lesson.title}`} />
      </section>
    </div>
  );
}
