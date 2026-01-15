import { useState } from 'react';
import React from "react";

const Tasks = () => {
  // Dummy task data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Create social media content calendar',
      clientName: 'Sarah Johnson',
      dueDate: '2024-01-15',
      priority: 'high',
      completed: false,
    },
    {
      id: 2,
      title: 'Design landing page mockup',
      clientName: 'Michael Chen',
      dueDate: '2024-01-20',
      priority: 'medium',
      completed: false,
    },
    {
      id: 3,
      title: 'Write blog post about AI trends',
      clientName: 'Emily Rodriguez',
      dueDate: '2024-01-18',
      priority: 'high',
      completed: false,
    },
    {
      id: 4,
      title: 'Update website copy',
      clientName: 'David Thompson',
      dueDate: '2024-01-25',
      priority: 'low',
      completed: true,
    },
    {
      id: 5,
      title: 'Review and approve marketing materials',
      clientName: 'Jessica Williams',
      dueDate: '2024-01-22',
      priority: 'medium',
      completed: false,
    },
    {
      id: 6,
      title: 'Schedule client meeting',
      clientName: 'Robert Martinez',
      dueDate: '2024-01-16',
      priority: 'low',
      completed: false,
    },
  ]);

  const handleToggleComplete = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityBadge = (priority) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`;
      case 'medium':
        return `${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`;
      case 'low':
        return `${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`;
      default:
        return `${baseClasses} bg-slate-700 text-slate-300 border border-slate-600`;
    }
  };

  const getPriorityLabel = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && !tasks.find(t => t.dueDate === dueDate)?.completed;
  };

  // Separate completed and incomplete tasks
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <div className="min-h-screen bg-slate-950 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Tasks
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your tasks and track progress
          </p>
        </div>

        {/* Incomplete Tasks */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Active Tasks ({incompleteTasks.length})
          </h2>
          
          {/* Desktop Table View */}
          <div className="hidden md:block bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th scope="col" className="w-12 px-6 py-3"></th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      Client Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      Due Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900/60 divide-y divide-slate-800">
                  {incompleteTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-800/50 transition-all duration-200 ease-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task.id)}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-600 rounded cursor-pointer bg-slate-800/50"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {task.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                          {task.clientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            isOverdue(task.dueDate)
                              ? 'text-red-400 font-medium'
                              : 'text-slate-300'
                          }`}
                        >
                          {formatDate(task.dueDate)}
                          {isOverdue(task.dueDate) && (
                            <span className="ml-2 text-xs">(Overdue)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getPriorityBadge(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {incompleteTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out"
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                    className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-600 rounded cursor-pointer flex-shrink-0 bg-slate-800/50"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-white mb-2">
                      {task.title}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-slate-300">
                        <svg
                          className="h-4 w-4 mr-2 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {task.clientName}
                      </div>
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-sm ${
                            isOverdue(task.dueDate)
                              ? 'text-red-400 font-medium'
                              : 'text-slate-300'
                          }`}
                        >
                          <svg
                            className="h-4 w-4 inline mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(task.dueDate)}
                          {isOverdue(task.dueDate) && (
                            <span className="ml-1">(Overdue)</span>
                          )}
                        </div>
                        <span className={getPriorityBadge(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Completed Tasks ({completedTasks.length})
            </h2>
            
            {/* Desktop Table View */}
            <div className="hidden md:block bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden opacity-60">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th scope="col" className="w-12 px-6 py-3"></th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                      >
                        Client Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                      >
                        Due Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                      >
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900/60 divide-y divide-slate-800">
                    {completedTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-800/50 transition-all duration-200 ease-out"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id)}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-600 rounded cursor-pointer bg-slate-800/50"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-500 line-through">
                            {task.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">
                            {task.clientName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">
                            {formatDate(task.dueDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getPriorityBadge(task.priority)}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 opacity-75"
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-600 rounded cursor-pointer flex-shrink-0 bg-slate-800/50"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-500 dark:text-gray-400 line-through mb-2">
                        {task.title}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          {task.clientName}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500">
                            <svg
                              className="h-4 w-4 inline mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {formatDate(task.dueDate)}
                          </div>
                          <span className={getPriorityBadge(task.priority)}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
