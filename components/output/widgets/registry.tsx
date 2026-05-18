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
// New v2 widgets
import { FlowchartWidget } from "./FlowchartWidget";
import { KpiTilesWidget } from "./KpiTilesWidget";
import { TimelineWidget } from "./TimelineWidget";
import { KanbanWidget } from "./KanbanWidget";
import { PricingTableWidget } from "./PricingTableWidget";
import { FallbackWidget } from "./FallbackWidget";

// One file = one widget. registry maps kind → React component.
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
  kpi_tiles: KpiTilesWidget,
  timeline: TimelineWidget,
  kanban: KanbanWidget,
  pricing_table: PricingTableWidget,
};

/**
 * Dispatches a typed widget to its registered renderer. If the kind is
 * unknown OR the renderer throws at render time, falls back to FallbackWidget
 * so one bad widget can't blow up the whole bubble.
 */
export function renderTypedWidget(widget: TypedWidget): ReactNode {
  const Renderer = REGISTRY[widget.kind];
  if (!Renderer) return <FallbackWidget widget={widget} />;
  return (
    <WidgetErrorBoundary fallback={<FallbackWidget widget={widget} />}>
      <Renderer payload={widget.payload} actions={widget.actions} />
    </WidgetErrorBoundary>
  );
}

class WidgetErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* swallow — fallback is shown */
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
