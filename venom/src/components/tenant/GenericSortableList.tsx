"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useGenericInlineEditor } from "./GenericInlineEditorContext";
import type { ReactNode } from "react";

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    position: "relative",
    zIndex: isDragging ? 999 : undefined,
  };

  const handle = (
    <span
      {...attributes}
      {...listeners}
      title="Přetažením přeřadit"
      style={{
        cursor: "grab",
        touchAction: "none",
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        color: "var(--color-text-muted, #888)",
        padding: "0 6px",
        opacity: 0.5,
        transition: "opacity 150ms",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "0.5"; }}
    >
      <GripVertical style={{ width: 16, height: 16 }} />
    </span>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  );
}

interface GenericSortableListProps<T extends Record<string, unknown>> {
  sectionId: number;
  field: string;
  items: T[];
  children: (item: T, index: number, handle: ReactNode) => ReactNode;
}

export function GenericSortableList<T extends Record<string, unknown>>({
  sectionId,
  field,
  items,
  children,
}: GenericSortableListProps<T>) {
  const { isAdmin, reorderField } = useGenericInlineEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const ids = items.map((_, i) => `item-${i}`);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const reordered = arrayMove(items, oldIdx, newIdx);
    reorderField(sectionId, field, reordered as unknown[]);
  }

  if (!isAdmin) {
    return <>{items.map((item, i) => children(item, i, null))}</>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => (
          <SortableRow key={ids[i]} id={ids[i]}>
            {(handle) => children(item, i, handle)}
          </SortableRow>
        ))}
      </SortableContext>
    </DndContext>
  );
}
