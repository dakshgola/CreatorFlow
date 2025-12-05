# Mongoose Models Documentation

This directory contains all Mongoose models for the CreatorCommand application.

## Models Overview

### 1. User Model (`User.js`)
**Purpose**: User authentication and profile management

**Fields**:
- `name` (String, required) - User's full name
- `email` (String, required, unique) - User's email address
- `password` (String, required, hashed) - Hashed password using bcrypt
- `themePreference` (String) - Theme preference: 'light', 'dark', or 'system'
- `createdAt` (Date) - Account creation timestamp

**Features**:
- Password hashing with bcrypt before save
- Email validation with regex
- `comparePassword()` method for authentication
- Password excluded from queries by default (`select: false`)

**Usage**:
```javascript
import User from './models/User.js';

const user = new User({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  themePreference: 'dark'
});
```

---

### 2. Client Model (`Client.js`)
**Purpose**: Manage client information

**Fields**:
- `userId` (ObjectId, ref: User) - Owner of the client record
- `name` (String, required) - Client name
- `niche` (String, required) - Client's niche/industry
- `links` (Array) - Array of platform/URL objects (max 10)
- `paymentRate` (Number, required) - Payment rate per project/hour
- `notes` (String) - Additional notes about the client

**Relationships**:
- Belongs to: User

**Usage**:
```javascript
import Client from './models/Client.js';

const client = new Client({
  userId: user._id,
  name: 'Acme Corp',
  niche: 'E-commerce',
  links: [{ platform: 'Instagram', url: 'https://instagram.com/acme' }],
  paymentRate: 5000,
  notes: 'Prefers video content'
});
```

---

### 3. Project Model (`Project.js`)
**Purpose**: Manage content projects

**Fields**:
- `userId` (ObjectId, ref: User) - Project owner
- `clientId` (ObjectId, ref: Client, optional) - Associated client
- `title` (String, required) - Project title
- `script` (String) - Project script/content
- `captions` (Array) - Array of captions (max 50)
- `hashtags` (Array) - Array of hashtags (max 30)
- `status` (String, enum) - Status: 'Idea', 'Scripted', 'Shot', 'Edited', 'Posted'
- `plannedDate` (Date, optional) - Planned completion date
- `createdAt` (Date) - Creation timestamp

**Relationships**:
- Belongs to: User
- Optional: Client

**Usage**:
```javascript
import Project from './models/Project.js';

const project = new Project({
  userId: user._id,
  clientId: client._id,
  title: 'Product Launch Video',
  status: 'Idea',
  hashtags: ['#product', '#launch']
});
```

---

### 4. Task Model (`Task.js`)
**Purpose**: Manage tasks and to-dos

**Fields**:
- `userId` (ObjectId, ref: User) - Task owner
- `projectId` (ObjectId, ref: Project, optional) - Associated project
- `title` (String, required) - Task title
- `description` (String) - Task description
- `dueDate` (Date, required) - Task due date
- `priority` (String, enum) - Priority: 'low', 'medium', 'high'
- `completed` (Boolean) - Completion status (default: false)

**Relationships**:
- Belongs to: User
- Optional: Project

**Usage**:
```javascript
import Task from './models/Task.js';

const task = new Task({
  userId: user._id,
  projectId: project._id,
  title: 'Review script',
  dueDate: new Date('2024-01-20'),
  priority: 'high'
});
```

---

### 5. Payment Model (`Payment.js`)
**Purpose**: Track payments and invoices

**Fields**:
- `userId` (ObjectId, ref: User) - Payment owner
- `clientId` (ObjectId, ref: Client) - Associated client
- `amount` (Number, required) - Payment amount
- `dueDate` (Date, required) - Payment due date
- `paid` (Boolean) - Payment status (default: false)

**Relationships**:
- Belongs to: User
- Belongs to: Client

**Virtual Fields**:
- `isOverdue` - Returns true if payment is overdue

**Usage**:
```javascript
import Payment from './models/Payment.js';

const payment = new Payment({
  userId: user._id,
  clientId: client._id,
  amount: 5000,
  dueDate: new Date('2024-01-25'),
  paid: false
});
```

---

### 6. History Model (`History.js`)
**Purpose**: Track activity history and logs

**Fields**:
- `userId` (ObjectId, ref: User) - History owner
- `type` (String, enum) - Type: 'client', 'project', 'task', 'payment', 'system', 'other'
- `content` (String, required) - History content/description
- `createdAt` (Date) - Timestamp
- `metadata` (Mixed) - Additional metadata object

**Relationships**:
- Belongs to: User

**Usage**:
```javascript
import History from './models/History.js';

const history = new History({
  userId: user._id,
  type: 'project',
  content: 'Created new project: Product Launch',
  metadata: { projectId: project._id }
});
```

---

## Model Relationships

```
User
├── Clients (1 to many)
├── Projects (1 to many)
├── Tasks (1 to many)
├── Payments (1 to many)
└── History (1 to many)

Client
├── Projects (1 to many, optional)
└── Payments (1 to many)

Project
└── Tasks (1 to many, optional)
```

---

## Importing Models

### Import Individual Models
```javascript
import User from './models/User.js';
import Client from './models/Client.js';
```

### Import All Models
```javascript
import { User, Client, Project, Task, Payment, History } from './models/index.js';
```

---

## Validation Features

All models include:
- **Required field validation** - Ensures critical fields are present
- **Type validation** - Ensures correct data types
- **Length validation** - Prevents excessively long strings
- **Enum validation** - Restricts values to predefined options
- **Custom validators** - Business logic validation (e.g., URL format, array limits)
- **Indexes** - Optimized database queries

---

## Best Practices

1. **Always validate on the client side** before sending to the server
2. **Use populate()** for referenced documents when needed
3. **Handle validation errors** gracefully in your API routes
4. **Use indexes** for frequently queried fields
5. **Hash passwords** before saving (handled automatically in User model)


