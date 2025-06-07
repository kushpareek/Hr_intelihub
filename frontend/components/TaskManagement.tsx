
import React, { useState, useEffect } from 'react'; // Add useEffect
import { AITask, TaskStatus } from '../types';
// import { MOCK_AI_TASKS } from '../constants'; // Remove MOCK
import { CogIcon, LoadingSpinner, SparklesIcon } from './common/IconComponents';
import { apiClient } from '../services/api'; // Import apiClient
import { getStoredUser } from '../services/api'; // For getting current user for new tasks

const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  let bgColor = '';
  let textColor = '';
  switch (status) {
    case TaskStatus.PENDING:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case TaskStatus.IN_PROGRESS:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case TaskStatus.COMPLETED:
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case TaskStatus.FAILED:
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};


const TaskManagement: React.FC = () => {
  // const [tasks, setTasks] = useState<AITask[]>(MOCK_AI_TASKS); // CHANGE TO:
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(''); // e.g. "Email Automation Bot"
  const [actionMessage, setActionMessage] = useState<string | null>(null); // For feedback

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const fetchedTasks = await apiClient<AITask[]>('/aitasks', 'GET');
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching AI tasks:", error);
        setActionMessage(`Error fetching tasks: ${(error as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleRetryTask = async (taskId: string) => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const updatedTask = await apiClient<AITask>(`/aitasks/${taskId}`, 'PUT', {
        status: TaskStatus.PENDING, // Or TaskStatus.IN_PROGRESS if retry means immediate re-queue
      });
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      setActionMessage(`Task ${updatedTask.title} status updated to ${updatedTask.status}.`);
    } catch (error) {
        console.error(`Error retrying task ${taskId}:`, error);
        setActionMessage(`Error retrying task: ${(error as Error).message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newTaskTitle || !newTaskAssignedTo) {
        setActionMessage("Task title and 'Assigned To' are required.");
        return;
    }
    setIsLoading(true);
    setActionMessage(null);
    try {
        const currentUser = getStoredUser(); // Assuming you have a way to get current user id if needed by backend
        const payload: Partial<AITask> = {
            title: newTaskTitle,
            description: newTaskDescription,
            assigned_to: newTaskAssignedTo,
            status: TaskStatus.PENDING,
            // user_id will be set by backend based on auth token
        };
        const createdTask = await apiClient<AITask>('/aitasks', 'POST', payload);
        setTasks(prev => [createdTask, ...prev]); // Add to top of list
        setShowCreateTaskForm(false);
        setNewTaskTitle(''); setNewTaskDescription(''); setNewTaskAssignedTo('');
        setActionMessage(`New AI Task "${createdTask.title}" created.`);

    } catch (error) {
        console.error("Error creating new AI task:", error);
        setActionMessage(`Error creating task: ${(error as Error).message}`);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      {actionMessage && (
        <div className={`p-3 mb-4 text-sm rounded-lg shadow ${actionMessage.toLowerCase().includes("error") ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-700'}`} role="alert">
            {actionMessage}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <CogIcon className="w-7 h-7 mr-2 text-blue-600" />
          AI Worker Task Monitor
        </h2>
        <button onClick={() => setShowCreateTaskForm(!showCreateTaskForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center">
            <SparklesIcon className="w-4 h-4 mr-1.5"/> {showCreateTaskForm ? 'Cancel' : 'Assign New Task'}
        </button>
      </div>

      {showCreateTaskForm && (
        <form onSubmit={handleCreateNewTask} className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-md space-y-3">
            <h3 className="text-lg font-semibold text-blue-700">Create New AI Task</h3>
            <input type="text" placeholder="Task Title*" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="p-2 border rounded w-full" required />
            <textarea placeholder="Task Description" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} rows={3} className="w-full p-2 border rounded"></textarea>
            <input type="text" placeholder="Assigned To (e.g., Email Bot, Sourcing AI)*" value={newTaskAssignedTo} onChange={e => setNewTaskAssignedTo(e.target.value)} className="p-2 border rounded w-full" required />
             <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Task'}
            </button>
        </form>
      )}
      
      {isLoading && tasks.length === 0 && <div className="flex justify-center my-4"><LoadingSpinner /> Loading tasks...</div>}
      {!isLoading && tasks.length === 0 && <p className="text-center text-gray-500 py-8">No tasks currently active.</p>}

      {tasks.length > 0 && (
        <div className="overflow-x-auto">
          {/* Table structure remains largely the same, just ensure it uses `tasks` state */}
          {/* ... table from original TaskManagement.tsx ... */}
          {/* Ensure onClick for Retry button calls handleRetryTask(task.id) */}
           <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  <div className="text-xs text-gray-500">{task.description?.substring(0,50)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{task.assigned_to}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(task.updated_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {task.status === TaskStatus.FAILED && (
                    <button 
                      onClick={() => handleRetryTask(task.id)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      disabled={isLoading}
                    >
                      Retry
                    </button>
                  )}
                   {task.status !== TaskStatus.FAILED && (
                    <button 
                      className="text-gray-400 cursor-not-allowed"
                      disabled
                    >
                      -
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tasks.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 py-8">No tasks currently active.</p>
      )}
    </div>
  );
};

export default TaskManagement;