
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
  dueTime?: string; // HH:mm format
  notificationSent?: boolean;       // For 5-min warning
  overdueNotificationSent?: boolean; // For "Time Expired" alert
  streakPenalized?: boolean;
  createdAt: number;
}

export interface AppState {
  tasks: Task[];
  searchQuery: string;
  filterCategory: Category | 'All';
  showOnboarding: boolean;
}
