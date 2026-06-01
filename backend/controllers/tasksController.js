import Task from '../models/Task.js';
import AppError from '../utils/AppError.js';

/**
 * Get all tasks for the authenticated user
 * GET /api/v1/tasks
 */
export const listTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id })
      .populate('projectId', 'title')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 * POST /api/v1/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, completed, projectId } = req.body;

    if (!title || !dueDate) {
      return next(new AppError('Please provide title and dueDate', 400));
    }

    const task = await Task.create({
      userId: req.user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      completed: completed || false,
      projectId: projectId || null,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join(', '), 400));
    }
    next(error);
  }
};

/**
 * Update a task
 * PUT /api/v1/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, completed, projectId } = req.body;

    let task = await Task.findOne({ _id: id, userId: req.user.id });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (priority !== undefined) task.priority = priority;
    if (completed !== undefined) task.completed = completed;
    if (projectId !== undefined) task.projectId = projectId || null;

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid task ID format', 400));
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(new AppError(messages.join(', '), 400));
    }
    next(error);
  }
};

/**
 * Delete a task
 * DELETE /api/v1/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid task ID format', 400));
    }
    next(error);
  }
};
