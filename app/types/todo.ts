export interface Todo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
} 

// Add default export
export default Todo; 