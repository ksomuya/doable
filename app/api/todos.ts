import { supabase } from '../utils/supabase';
import { Todo } from '../types/todo';

// Get all todos
export const getTodos = async (): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
  
  return data || [];
};

// Get a single todo by ID
export const getTodoById = async (id: string): Promise<Todo | null> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching todo:', error);
    return null;
  }
  
  return data;
};

// Create a new todo
export const createTodo = async (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo | null> => {
  const { data, error } = await supabase
    .from('todos')
    .insert(todo)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating todo:', error);
    return null;
  }
  
  return data;
};

// Update a todo
export const updateTodo = async (id: string, todo: Partial<Todo>): Promise<Todo | null> => {
  const { data, error } = await supabase
    .from('todos')
    .update(todo)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating todo:', error);
    return null;
  }
  
  return data;
};

// Delete a todo
export const deleteTodo = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting todo:', error);
    return false;
  }
  
  return true;
}; 