import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

type Props = PropsWithChildren<{
  setDraggingTaskId: Dispatch<SetStateAction<string | null>>;
  afterDragEnd: (values: { taskId: string; newColumnId: string }) => void;
}>;

export default function DndProvider(props: Props) {
  const { children, setDraggingTaskId, afterDragEnd } = props;

  // Sensors for better drag experience
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  const handleDragStart = event => {
    setDraggingTaskId(event.active.id);
  };

  const handleDragEnd = event => {
    const { active, over } = event;
    setDraggingTaskId(null);

    if (!over) return;

    const taskId = active.id;
    const newColumnId = over.id;

    afterDragEnd({ taskId, newColumnId });
  };

  const handleDragCancel = () => {
    setDraggingTaskId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
    </DndContext>
  );
}
