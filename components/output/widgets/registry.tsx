"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import type { TypedWidget, WidgetKind } from "@/lib/types/widgets-typed";

import { ChipsWidget } from "./ChipsWidget";
import { DecisionCardWidget } from "./DecisionCardWidget";
import { ConfirmCardWidget } from "./ConfirmCardWidget";
import { StepperWidget } from "./StepperWidget";
import { ChecklistWidget } from "./ChecklistWidget";
import { SourceCardsWidget } from "./SourceCardsWidget";
import { TableWidget } from "./TableWidget";
import { ChartWidget } from "./ChartWidget";
import { CodeBlockWidget } from "./CodeBlockWidget";
import { InlineBannerWidget } from "./InlineBannerWidget";
// Teammate's 10
import { FlowchartWidget } from "./FlowchartWidget";
import { VennDiagramWidget } from "./VennDiagramWidget";
import { MindMapWidget } from "./MindMapWidget";
import { PieChartWidget } from "./PieChartWidget";
import { HeatmapWidget } from "./HeatmapWidget";
import { KpiDashboardWidget } from "./KpiDashboardWidget";
import { ProfileCardWidget } from "./ProfileCardWidget";
import { KanbanBoardWidget } from "./KanbanBoardWidget";
import { CalculatorWidget } from "./CalculatorWidget";
import { QuizWidget } from "./QuizWidget";
// My 2 unique
import { TimelineWidget } from "./TimelineWidget";
import { PricingTableWidget } from "./PricingTableWidget";
import { FallbackWidget } from "./FallbackWidget";

const REGISTRY: Record<WidgetKind, React.ComponentType<{ payload: any; actions?: any }>> = {
  chips: ChipsWidget,
  decision_card: DecisionCardWidget,
  confirm_card: ConfirmCardWidget,
  stepper: StepperWidget,
  checklist: ChecklistWidget,
  source_cards: SourceCardsWidget,
  table: TableWidget,
  chart: ChartWidget,
  code_block: CodeBlockWidget,
  inline_banner: InlineBannerWidget,
  flowchart: FlowchartWidget,
  venn_diagram: VennDiagramWidget,
  mind_map: MindMapWidget,
  pie_chart: PieChartWidget,
  heatmap: HeatmapWidget,
  kpi_dashboard: KpiDashboardWidget,
  profile_card: ProfileCardWidget,
  kanban_board: KanbanBoardWidget,
  calculator: CalculatorWidget,
  quiz: QuizWidget,
  timeline: TimelineWidget,
  pricing_table: PricingTableWidget,
};

export function renderTypedWidget(widget: TypedWidget): ReactNode {
  const Renderer = REGISTRY[widget.kind];
  if (!Renderer) return <FallbackWidget widget={widget} />;
  return (
    <WidgetErrorBoundary fallback={<FallbackWidget widget={widget} />}>
      <Renderer payload={widget.payload} actions={widget.actions} />
    </WidgetErrorBoundary>
  );
}

class WidgetErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* swallow */
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
