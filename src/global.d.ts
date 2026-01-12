import type { Force, SimulationNodeDatum } from 'd3';

export interface BounceForce<Node extends SimulationNodeDatum> extends Force {
	elasticty: (t: number) => this;
	radius: (t: number) => this | ((fn: (node: Node) => number) => this);
	mass: (t: number) => this | ((fn: (node: Node) => number) => this);
	onImpact: (fn: (node1: Node, node2: Node) => unknown) => this;
}
