import Task from '../models/Task.js';

/**
 * Get all tasks for the authenticated user
 * GET /api/v1/tasks
 */
export const listTasks = async (req, res) => {
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
    console.error('List tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks',
    });
  }
};

/**
 * Create a new task
 * POST /api/v1/tasks
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, completed, projectId } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and dueDate',
      });
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
    console.error('Create task error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating task',
    });
  }
};

/**
 * Update a task
 * PUT /api/v1/tasks/:id
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, completed, projectId } = req.body;

    let task = await Task.findOne({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
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
    console.error('Update task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating task',
    });
  }
};

/**
 * Delete a task
 * DELETE /api/v1/tasks/:id
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Delete task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task',
    });
  }
};
