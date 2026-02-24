import {
  useCallback,
  useEffect,
  type DragEvent,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { NODE_TYPES, type MoneyNodeKind } from "./nodes";
import type { SourceMode } from "../types/spendtrace";

type CanvasProps = {
  sourceMode: SourceMode;
};

type ModuleType =
  | "overall"
  | "account"
  | "spendTx"
  | "transferTx"
  | "incomeTx"
  | "category"
  | "summaryAgent"
  | "futurePurchase"
  | "budgetGuard"
  | "forecastAgent"
  | "recurringDetector"
  | "anomalyAlert";

type CreatedNode = Pick<Node, "type" | "data">;

const createMoneyNode = (
  kind: MoneyNodeKind,
  label: string,
  subtitle?: string,
  amount?: number,
): CreatedNode => ({
  type: "moneyNode",
  data: {
    kind,
    label,
    subtitle,
    amount,
  },
});

const MODULE_NODE_BUILDERS: Record<ModuleType, () => CreatedNode> = {
  overall: () => createMoneyNode("OVERALL", "My Money Graph"),
  account: () => createMoneyNode("ACCOUNT", "New Account", "Checking / Savings"),
  spendTx: () => createMoneyNode("TX_SPEND", "Merchant Charge", "Spending", 42),
  transferTx: () => createMoneyNode("TX_TRANSFER", "Transfer to Savings", "Transfer", 150),
  incomeTx: () => createMoneyNode("TX_INCOME", "Income Deposit", "Income", 1200),
  category: () => createMoneyNode("CATEGORY", "Category Cluster", "FOOD / ESSENTIALS / MISC"),
  summaryAgent: () => ({
    type: "summaryAgentNode",
    data: { label: "Summary Agent" },
  }),
  futurePurchase: () => ({
    type: "futurePurchaseNode",
    data: {
      label: "Future Purchase Goal",
      targetCost: 1800,
      monthlyContribution: 300,
    },
  }),
  budgetGuard: () => ({
    type: "budgetGuardNode",
    data: {
      label: "Monthly Budget Guard",
      monthlyBudget: 2500,
      trackedSpend: 920,
    },
  }),
  forecastAgent: () => ({
    type: "forecastAgentNode",
    data: {
      label: "Month-End Forecast",
      monthlyIncome: 6200,
      monthlySpend: 4380,
    },
  }),
  recurringDetector: () => ({
    type: "recurringDetectorNode",
    data: {
      label: "Recurring Charges",
      recurringAmount: 14.99,
      cadencePerMonth: 4,
    },
  }),
  anomalyAlert: () => ({
    type: "anomalyAlertNode",
    data: {
      label: "Spend Spike Detector",
      baselineAmount: 320,
      currentAmount: 470,
      alertThresholdPct: 25,
    },
  }),
};

const buildInitialGraph = (sourceMode: SourceMode): { nodes: Node[]; edges: Edge[] } => {
  const sourceLabel = sourceMode === "PLAID" ? "Plaid mode (local stub)" : "Demo mode";

  const nodes: Node[] = [
    {
      id: "overall",
      position: { x: 100, y: 160 },
      ...createMoneyNode("OVERALL", "Joshua's SpendTrace", sourceLabel),
    },
    {
      id: "acct-checking",
      position: { x: 420, y: 40 },
      ...createMoneyNode("ACCOUNT", "Checking Account", "Primary bank"),
    },
    {
      id: "acct-brokerage",
      position: { x: 420, y: 280 },
      ...createMoneyNode("ACCOUNT", "Brokerage Account", "Investments"),
    },
    {
      id: "tx-groceries",
      position: { x: 760, y: 20 },
      ...createMoneyNode("TX_SPEND", "Trader Joe's", "FOOD", 86.25),
    },
    {
      id: "tx-rent",
      position: { x: 760, y: 150 },
      ...createMoneyNode("TX_SPEND", "Rent", "ESSENTIALS", 1450),
    },
    {
      id: "tx-paycheck",
      position: { x: 760, y: 300 },
      ...createMoneyNode("TX_INCOME", "Payroll Deposit", "INCOME", 3200),
    },
    {
      id: "tx-transfer",
      position: { x: 760, y: 430 },
      ...createMoneyNode("TX_TRANSFER", "Transfer to Brokerage", "INVESTING", 600),
    },
    {
      id: "category-food",
      position: { x: 1110, y: 60 },
      ...createMoneyNode("CATEGORY", "FOOD Cluster"),
    },
    {
      id: "summary-agent",
      type: "summaryAgentNode",
      position: { x: 1080, y: 240 },
      data: {
        label: "Spend Summary Agent",
      },
    },
    {
      id: "budget-guard",
      type: "budgetGuardNode",
      position: { x: 1080, y: 410 },
      data: {
        label: "Essentials Budget Guard",
        monthlyBudget: 2200,
        trackedSpend: 1536,
      },
    },
    {
      id: "future-goal",
      type: "futurePurchaseNode",
      position: { x: 1410, y: 300 },
      data: {
        label: "Japan Trip Fund",
        targetCost: 4000,
        monthlyContribution: 450,
      },
    },
    {
      id: "forecast-agent",
      type: "forecastAgentNode",
      position: { x: 1390, y: 120 },
      data: {
        label: "Month-End Forecast Agent",
        monthlyIncome: 6200,
        monthlySpend: 4380,
      },
    },
    {
      id: "recurring-detector",
      type: "recurringDetectorNode",
      position: { x: 1730, y: 220 },
      data: {
        label: "Subscription Detector",
        recurringAmount: 22.5,
        cadencePerMonth: 3,
      },
    },
    {
      id: "anomaly-alert",
      type: "anomalyAlertNode",
      position: { x: 1730, y: 420 },
      data: {
        label: "Food Spend Anomaly",
        baselineAmount: 280,
        currentAmount: 410,
        alertThresholdPct: 25,
      },
    },
  ];

  const edges: Edge[] = [
    { id: "e-overall-checking", source: "overall", target: "acct-checking" },
    { id: "e-overall-brokerage", source: "overall", target: "acct-brokerage" },
    { id: "e-checking-groceries", source: "acct-checking", target: "tx-groceries" },
    { id: "e-checking-rent", source: "acct-checking", target: "tx-rent" },
    { id: "e-checking-paycheck", source: "acct-checking", target: "tx-paycheck" },
    { id: "e-checking-transfer", source: "acct-checking", target: "tx-transfer" },
    { id: "e-groceries-food", source: "tx-groceries", target: "category-food" },
    { id: "e-rent-agent", source: "tx-rent", target: "summary-agent" },
    { id: "e-paycheck-agent", source: "tx-paycheck", target: "summary-agent" },
    { id: "e-transfer-budget", source: "tx-transfer", target: "budget-guard" },
    { id: "e-budget-goal", source: "budget-guard", target: "future-goal" },
    { id: "e-summary-forecast", source: "summary-agent", target: "forecast-agent" },
    { id: "e-rent-recurring", source: "tx-rent", target: "recurring-detector" },
    { id: "e-food-anomaly", source: "tx-groceries", target: "anomaly-alert" },
  ];

  return { nodes, edges };
};

let nodeIdCounter = 0;
const createNodeId = () => `node-${Date.now()}-${nodeIdCounter++}`;

export default function Canvas({ sourceMode }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    const initialGraph = buildInitialGraph(sourceMode);
    setNodes(initialGraph.nodes);
    setEdges(initialGraph.edges);
  }, [setEdges, setNodes, sourceMode]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            animated: false,
          },
          currentEdges,
        ),
      );
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const rawModuleType = event.dataTransfer.getData("application/reactflow") as ModuleType;
      if (!rawModuleType) {
        return;
      }

      const nodeBuilder = MODULE_NODE_BUILDERS[rawModuleType] ?? MODULE_NODE_BUILDERS.account;
      const newNodeConfig = nodeBuilder();

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((currentNodes) => [
        ...currentNodes,
        {
          id: createNodeId(),
          position,
          ...newNodeConfig,
        },
      ]);
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <div className="h-full flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background gap={24} size={1.2} color="#cbd5e1" />
        <Controls />
        <MiniMap pannable zoomable nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  );
}
