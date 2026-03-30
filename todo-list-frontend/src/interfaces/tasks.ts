export interface Task {
  id: number;
  name: string;
  description?: string;
  storyPoints?: number;
  status: "PENDIENTE" | "EN_PROGRESO" | "EN_REVISION" | "COMPLETADO";
  dueDate?: string;
  assignedTo: number;
}