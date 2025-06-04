
import React, { useState } from 'react';
import { AITask, TaskStatus } from '../types';
import { MOCK_AI_TASKS } from '../constants';
// Fix: Import SparklesIcon
import { CogIcon, LoadingSpinner, SparklesIcon } from './common/IconComponents';

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
  const [tasks, setTasks] = useState<AITask[]>(MOCK_AI_TASKS);
  const [isLoading, setIsLoading] = useState(false); // For simulated actions

  const handleRetryTask = (taskId: string) => {
    setIsLoading(true);
    console.log(`Retrying task ${taskId}... (Placeholder)`);
    // Simulate API call and update
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, status: TaskStatus.IN_PROGRESS, updatedAt: new Date() } : task
      ));
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <CogIcon className="w-7 h-7 mr-2 text-blue-600" />
          AI Worker Task Monitor
        </h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center">
            <SparklesIcon className="w-4 h-4 mr-1.5"/> Assign New Task (Placeholder)
        </button>
      </div>
      
      {isLoading && <div className="flex justify-center my-4"><LoadingSpinner /></div>}

      <div className="overflow-x-auto">
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
                  <div className="text-xs text-gray-500">{task.description.substring(0,50)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{task.assignedTo}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{task.updatedAt.toLocaleDateString()}</td>
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