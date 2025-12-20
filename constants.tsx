
import React from 'react';
import { Briefcase, User, AlertCircle, ShoppingBag, HeartPulse, Layers } from 'lucide-react';
import { Category, Priority } from './types';

export const CATEGORIES: Category[] = ['Work', 'Personal', 'Urgent', 'Shopping', 'Health'];

export const CATEGORY_ICONS: Record<Category | 'All', React.ReactNode> = {
  Work: <Briefcase size={18} />,
  Personal: <User size={18} />,
  Urgent: <AlertCircle size={18} />,
  Shopping: <ShoppingBag size={18} />,
  Health: <HeartPulse size={18} />,
  All: <Layers size={18} />
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-blue-400',
  medium: 'bg-yellow-400',
  high: 'bg-red-500'
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Work: 'bg-indigo-500',
  Personal: 'bg-green-500',
  Urgent: 'bg-rose-600',
  Shopping: 'bg-amber-500',
  Health: 'bg-sky-500'
};
