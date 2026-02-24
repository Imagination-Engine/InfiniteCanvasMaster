import { type NodeTypes } from "@xyflow/react";
import { MoneyNode } from "./MoneyNode";
import { SummaryAgentNode } from "./SummaryAgentNode";
import { FuturePurchaseNode } from "./FuturePurchaseNode";
import { BudgetGuardNode } from "./BudgetGuardNode";
import { ForecastAgentNode } from "./ForecastAgentNode";
import { RecurringDetectorNode } from "./RecurringDetectorNode";
import { AnomalyAlertNode } from "./AnomalyAlertNode";

export { MoneyNode } from "./MoneyNode";
export { SummaryAgentNode } from "./SummaryAgentNode";
export { FuturePurchaseNode } from "./FuturePurchaseNode";
export { BudgetGuardNode } from "./BudgetGuardNode";
export { ForecastAgentNode } from "./ForecastAgentNode";
export { RecurringDetectorNode } from "./RecurringDetectorNode";
export { AnomalyAlertNode } from "./AnomalyAlertNode";

export type {
  MoneyNodeData,
  MoneyNodeKind,
  MoneyNodeType,
} from "./MoneyNode";
export type {
  SummaryAgentNodeData,
  SummaryAgentNodeType,
} from "./SummaryAgentNode";
export type {
  FuturePurchaseNodeData,
  FuturePurchaseNodeType,
} from "./FuturePurchaseNode";
export type {
  BudgetGuardNodeData,
  BudgetGuardNodeType,
} from "./BudgetGuardNode";
export type {
  ForecastAgentNodeData,
  ForecastAgentNodeType,
} from "./ForecastAgentNode";
export type {
  RecurringDetectorNodeData,
  RecurringDetectorNodeType,
} from "./RecurringDetectorNode";
export type {
  AnomalyAlertNodeData,
  AnomalyAlertNodeType,
} from "./AnomalyAlertNode";

export const NODE_TYPES: NodeTypes = {
  moneyNode: MoneyNode,
  summaryAgentNode: SummaryAgentNode,
  futurePurchaseNode: FuturePurchaseNode,
  budgetGuardNode: BudgetGuardNode,
  forecastAgentNode: ForecastAgentNode,
  recurringDetectorNode: RecurringDetectorNode,
  anomalyAlertNode: AnomalyAlertNode,
};
