// Export all models from a single file for easier imports
import User from './User.js';
import Client from './Client.js';
import Project from './Project.js';
import Task from './Task.js';
import Payment from './Payment.js';
import History from './History.js';
import Media from './Media.js';

export {
  User,
  Client,
  Project,
  Task,
  Payment,
  History,
  Media,
};

export default {
  User,
  Client,
  Project,
  Task,
  Payment,
  History,
  Media,
};

import cors from "cors";

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://creatorcommand.vercel.app",
  ],
  credentials: true
}));
