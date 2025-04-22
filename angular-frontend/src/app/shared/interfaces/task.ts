export interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt?: string; // Añado el campo fecha a la interface como opcional
}