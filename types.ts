
export type Priority = 'low' | 'medium' | 'high';

export type Category = 'Work' | 'Personal' | 'Urgent' | 'Shopping' | 'Health';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  createdAt: number;
}

export interface AppState {
  tasks: Task[];
  searchQuery: string;
  filterCategory: Category | 'All';
  showOnboarding: boolean;
}
