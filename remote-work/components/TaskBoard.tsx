"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Calendar } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  assigneeId: string | null;
  dueDate: Date | null;
  position: number | null;
}

interface TaskBoardProps {
  initialTasks: Task[];
  workspaceId: string;
  userId: string;
}

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {task.priority && (
              <span
                className={`text-xs px-2 py-1 rounded ${
                  priorityColors[task.priority as keyof typeof priorityColors] ||
                  priorityColors.medium
                }`}
              >
                {task.priority}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TaskBoard({ initialTasks, workspaceId, userId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("todo");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = tasks
      .filter((task) => task.status === column.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    return acc;
  }, {} as Record<string, Task[]>);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropped on a column (column IDs are in the format "column-{id}")
    const targetColumn = columns.find((col) => col.id === overId || `column-${col.id}` === overId);
    if (targetColumn && targetColumn.id !== activeTask.status) {
      // Update task status
      const updatedTask = { ...activeTask, status: targetColumn.id };
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? updatedTask : t))
      );

      // Update in database
      try {
        await fetch("/api/tasks/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: activeId,
            status: targetColumn.id,
          }),
        });
      } catch (error) {
        console.error("Error updating task:", error);
      }
      return;
    }

    // Reorder within same column
    const activeColumn = tasksByColumn[activeTask.status] || [];
    const oldIndex = activeColumn.findIndex((t) => t.id === activeId);
    const overTask = activeColumn.find((t) => t.id === overId);
    
    if (overTask && oldIndex !== -1) {
      const newIndex = activeColumn.findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex) {
        const newTasks = arrayMove(activeColumn, oldIndex, newIndex);
        const updatedTasks = tasks.map((task) => {
          if (task.status === activeTask.status) {
            const newTask = newTasks.find((t) => t.id === task.id);
            if (newTask) {
              return { ...task, position: newTasks.indexOf(newTask) };
            }
          }
          return task;
        });
        setTasks(updatedTasks);

        // Update positions in database
        try {
          await fetch("/api/tasks/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              taskIds: newTasks.map((t) => t.id),
            }),
          });
        } catch (error) {
          console.error("Error reordering tasks:", error);
        }
      }
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    const response = await fetch("/api/tasks/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        title: newTaskTitle,
        description: newTaskDescription || null,
        status: newTaskStatus,
        createdById: userId,
      }),
    });

    if (response.ok) {
      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setShowNewTaskForm(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {showNewTaskForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <textarea
            placeholder="Description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={2}
          />
          <select
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewTaskForm(false);
                setNewTaskTitle("");
                setNewTaskDescription("");
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[400px]"
            >
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                {column.title} ({tasksByColumn[column.id]?.length || 0})
              </h2>
              <SortableContext
                items={tasksByColumn[column.id]?.map((t) => t.id) || []}
                strategy={verticalListSortingStrategy}
                id={`column-${column.id}`}
              >
                <div>
                  {tasksByColumn[column.id]?.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}

