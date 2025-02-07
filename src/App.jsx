import React, { useState, createContext, useContext } from 'react';
import { Tractor, Users, Sprout, FileText, LogOut, UserCircle, Droplets, Zap, Bug, TreePine, Sun, Cloud, Wind, Thermometer, Calendar, CheckCircle, Edit, Trash2, Plus, Phone, MapPin, Award, Lock, Mail, AlertTriangle, Download, User } from 'lucide-react';
import './styles/main.css';
import './styles/auth.css';
import './styles/app.css';

// Auth Context
const AuthContext = createContext(null);

// Simulated user database
const users = [
  {
    id: '1',
    email: 'demo@farm.com',
    password: 'password',
    name: 'Demo User',
    role: 'admin',
    profile: {
      phone: '+1234567890',
      address: '123 Farm Street',
      farmSize: '500 acres',
      preferredCrops: ['Wheat', 'Corn', 'Soybeans'],
      certifications: ['Organic Farming', 'Sustainable Agriculture']
    }
  }
];

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const foundUser = users.find(u => u.email === email && u.password === password);
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        return true;
      }
      throw new Error('Invalid credentials');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email already registered');
      }
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        role: 'farmer',
        profile: {
          phone: '',
          address: '',
          farmSize: '',
          preferredCrops: [],
          certifications: []
        }
      };
      users.push(newUser);
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('Email not found');
    }
    const token = Math.random().toString(36).substring(2, 15);
    setResetToken(token);
    return token;
  };

  const resetPassword = async (token, newPassword) => {
    if (token !== resetToken) {
      throw new Error('Invalid or expired reset token');
    }
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      setResetToken(null);
    }
  };

  const updateProfile = async (profileData) => {
    if (!user) throw new Error('No user logged in');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        ...profileData,
        profile: {
          ...users[userIndex].profile,
          ...profileData.profile
        }
      };
      const { password, ...updatedUser } = users[userIndex];
      setUser(updatedUser);
    }
  };

  const logout = () => {
    setUser(null);
    setResetToken(null);
  };

  const checkPermission = (requiredRole) => {
    return user && (user.role === 'admin' || user.role === requiredRole);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      requestPasswordReset, 
      resetPassword,
      updateProfile,
      checkPermission,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Login Form Component
const LoginForm = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Sign in to your account</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">
            <Mail className="input-icon" />
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <Lock className="input-icon" />
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => onToggleForm('reset')}
            className="text-sm text-green-600 hover:text-green-700 mt-1"
          >
            Forgot password?
          </button>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account?{' '}
        <button onClick={() => onToggleForm('register')} className="link-button">
          Create Account
        </button>
      </p>
    </div>
  );
};

// Register Form Component
const RegisterForm = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profile: {
          phone: formData.phone,
          address: formData.address
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Join our sustainable farming community</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">
            <User className="input-icon" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Mail className="input-icon" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Phone className="input-icon" />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <MapPin className="input-icon" />
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Lock className="input-icon" />
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Lock className="input-icon" />
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{' '}
        <button onClick={onToggleForm} className="link-button">
          Sign In
        </button>
      </p>
    </div>
  );
};

// Password Reset Component
const PasswordReset = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request');
  const [error, setError] = useState('');
  const { requestPasswordReset, resetPassword, isLoading } = useAuth();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = await requestPasswordReset(email);
      setToken(token);
      setStep('reset');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await resetPassword(token, newPassword);
      onToggleForm('login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">
        {step === 'request' 
          ? 'Enter your email to reset your password' 
          : 'Enter your new password'}
      </p>
      
      {error && <div className="error-message">{error}</div>}
      
      {step === 'request' ? (
        <form onSubmit={handleRequestReset} className="form">
          <div className="form-group">
            <label className="form-label">
              <Mail className="input-icon" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="form">
          <div className="form-group">
            <label className="form-label">
              <Lock className="input-icon" />
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      <p className="auth-switch">
        Remember your password?{' '}
        <button onClick={() => onToggleForm('login')} className="link-button">
          Sign In
        </button>
      </p>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const metrics = {
    waterUsage: 75,
    energyConsumption: 60,
    pesticideUsage: 30,
    carbonEmissions: 45,
    sustainabilityScore: 85,
  };

  const weather = {
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    forecast: 'Partly Cloudy',
    recommendation: 'Good conditions for irrigation',
  };

  const events = [
    { id: 1, title: 'Crop Rotation', date: '2024-03-20' },
    { id: 2, title: 'Soil Testing', date: '2024-03-22' },
    { id: 3, title: 'Equipment Maintenance', date: '2024-03-25' },
  ];

  return (
    <div className="dashboard-container">
      {/* Weather Section */}
      <div className="weather-section">
        <h3 className="weather-title">Farm Weather Conditions</h3>
        <div className="weather-grid">
          <div className="weather-item">
            <Thermometer className="weather-icon" />
            <div>
              <p className="weather-label">Temperature</p>
              <p className="weather-value">{weather.temperature}°C</p>
            </div>
          </div>
          <div className="weather-item">
            <Droplets className="weather-icon" />
            <div>
              <p className="weather-label">Humidity</p>
              <p className="weather-value">{weather.humidity}%</p>
            </div>
          </div>
          <div className="weather-item">
            <Wind className="weather-icon" />
            <div>
              <p className="weather-label">Wind Speed</p>
              <p className="weather-value">{weather.windSpeed} km/h</p>
            </div>
          </div>
          <div className="weather-item">
            <Cloud className="weather-icon" />
            <div>
              <p className="weather-label">Forecast</p>
              <p className="weather-forecast">{weather.forecast}</p>
            </div>
          </div>
        </div>
        <p className="weather-recommendation">
          {weather.recommendation}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-item metric-water">
          <div className="metric-header">
            <h3 className="metric-title">Water Usage</h3>
            <Droplets className="metric-icon" />
          </div>
          <div className="metric-bar-container">
            <div 
              className="metric-bar metric-bar-water"
              style={{ width: `${metrics.waterUsage}%` }}
            ></div>
          </div>
          <p className="metric-text">{metrics.waterUsage}% of limit</p>
        </div>

        <div className="metric-item metric-energy">
          <div className="metric-header">
            <h3 className="metric-title">Energy Usage</h3>
            <Zap className="metric-icon" />
          </div>
          <div className="metric-bar-container">
            <div 
              className="metric-bar metric-bar-energy"
              style={{ width: `${metrics.energyConsumption}%` }}
            ></div>
          </div>
          <p className="metric-text">{metrics.energyConsumption}% of limit</p>
        </div>

        <div className="metric-item metric-pesticide">
          <div className="metric-header">
            <h3 className="metric-title">Pesticide Usage</h3>
            <Bug className="metric-icon" />
          </div>
          <div className="metric-bar-container">
            <div 
              className="metric-bar metric-bar-pesticide"
              style={{ width: `${metrics.pesticideUsage}%` }}
            ></div>
          </div>
          <p className="metric-text">{metrics.pesticideUsage}% of limit</p>
        </div>

        <div className="metric-item metric-carbon">
          <div className="metric-header">
            <h3 className="metric-title">Carbon Footprint</h3>
            <TreePine className="metric-icon" />
          </div>
          <div className="metric-bar-container">
            <div 
              className="metric-bar metric-bar-carbon"
              style={{ width: `${metrics.carbonEmissions}%` }}
            ></div>
          </div>
          <p className="metric-text">{metrics.carbonEmissions}% of target</p>
        </div>
      </div>

      {/* Sustainability Score */}
      <div className="sustainability-section">
        <div className="sustainability-header">
          <div>
            <h3 className="sustainability-title">Farm Sustainability Score</h3>
            <p className="sustainability-description">Based on resource usage and environmental impact</p>
          </div>
          <div className="sustainability-score">{metrics.sustainabilityScore}/100</div>
        </div>
      </div>

      <div className="dashboard-lower-section">
        {/* Upcoming Events */}
        <div className="events-section">
          <div className="events-header">
            <h3 className="events-title">Upcoming Events</h3>
            <Calendar className="events-icon" />
          </div>
          <div className="events-list">
            {events.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-details">
                  <CheckCircle className="event-icon" />
                  <span className="event-title">{event.title}</span>
                </div>
                <span className="event-date">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Management */}
        <TaskList />
      </div>
    </div>
  );
};


// Task List Component
const TaskList = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Inspect irrigation system',
      dueDate: '2024-03-21',
      priority: 'high',
      completed: false,
    },
    {
      id: 2,
      title: 'Order organic fertilizer',
      dueDate: '2024-03-23',
      priority: 'medium',
      completed: true,
    },
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    priority: 'medium',
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        ...newTask,
        completed: false,
      },
    ]);
    setNewTask({
      title: '',
      dueDate: '',
      priority: 'medium',
    });
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <div className="task-list-container">
      <h3 className="task-list-title">Task Management</h3>
      
      <form onSubmit={handleAddTask} className="add-task-form">
        <div className="form-input-container">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Add a new task"
            className="task-input"
          />
          <div className="form-input-group">
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="task-date-input"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="task-priority-select"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <button type="submit" className="task-add-button">
              <Plus className="button-icon" />
            </button>
          </div>
        </div>
      </form>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed-task' : ''}`}>
            <div className="task-details">
              <button
                onClick={() => toggleTaskComplete(task.id)}
                className={`task-complete-button ${task.completed ? 'complete' : 'incomplete'}`}
              >
                <CheckCircle />
              </button>
              <span className={`task-title ${task.completed ? 'completed-title' : ''}`}>
                {task.title}
              </span>
            </div>
            <div className="task-meta">
              <span className={`task-priority priority-${task.priority}`}>
                {task.priority}
              </span>
              <div className="task-date">
                <Calendar className="task-date-icon" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="task-delete-button"
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// Farmer Management Component
const FarmerManagement = () => {
  const [farmers, setFarmers] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    farmName: '',
    location: '',
    cropTypes: '',
    farmSize: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setFarmers(
        farmers.map((farmer) => (farmer.id === formData.id ? formData : farmer))
      );
    } else {
      setFarmers([...farmers, { ...formData, id: Date.now().toString() }]);
    }
    resetForm();
  };

  const handleDelete = (id) => {
    setFarmers(farmers.filter((farmer) => farmer.id !== id));
  };

  const handleEdit = (farmer) => {
    setFormData(farmer);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      farmName: '',
      location: '',
      cropTypes: '',
      farmSize: '',
    });
    setIsEditing(false);
  };

  return (
    <div className="farmer-management-container">
      <h2 className="farmer-management-title">Farmer Management</h2>

      {/* Farmer Registration Form */}
      <form onSubmit={handleSubmit} className="farmer-form">
        <div className="form-grid">
          <div>
            <label className="form-label">Farmer Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Farm Name</label>
            <input
              type="text"
              name="farmName"
              value={formData.farmName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Crop Types</label>
            <input
              type="text"
              name="cropTypes"
              value={formData.cropTypes}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Farm Size (acres)</label>
            <input
              type="text"
              name="farmSize"
              value={formData.farmSize}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="form-submit-button">
            {isEditing ? 'Update Farmer' : 'Add Farmer'} <Plus className="button-icon" />
          </button>
        </div>
      </form>

      {/* Farmers List */}
      <div className="farmer-list-container">
        <table className="farmer-list-table">
          <thead>
            <tr>
              <th>Farmer</th>
              <th>Farm Details</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((farmer) => (
              <tr key={farmer.id}>
                <td className="farmer-list-item">
                  <User className="farmer-icon" />
                  <div>
                    <div className="farmer-name">{farmer.name}</div>
                    <div className="farm-name">{farmer.farmName}</div>
                  </div>
                </td>
                <td>
                  <div className="crop-types">{farmer.cropTypes}</div>
                  <div className="farm-size">{farmer.farmSize} acres</div>
                </td>
                <td className="location">{farmer.location}</td>
                <td className="actions">
                  <button
                    onClick={() => handleEdit(farmer)}
                    className="edit-button"
                  >
                    <Edit className="action-icon" />
                  </button>
                  <button
                    onClick={() => handleDelete(farmer.id)}
                    className="delete-button"
                  >
                    <Trash2 className="action-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Crop Management Component
const CropManagement = () => {
  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    waterNeeds: 0,
    pesticideUsage: 0,
    plantingDate: '',
    expectedHarvest: '',
  });

  const WATER_THRESHOLD = 80;
  const PESTICIDE_THRESHOLD = 70;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCrops([...crops, { ...formData, id: Date.now().toString() }]);
    setFormData({
      id: '',
      name: '',
      waterNeeds: 0,
      pesticideUsage: 0,
      plantingDate: '',
      expectedHarvest: '',
    });
  };

  return (
    <div className="crop-management-container">
      <h2 className="crop-management-title">Crop Management</h2>

      {/* Crop Registration Form */}
      <form onSubmit={handleSubmit} className="crop-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Crop Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Water Needs (L/day)</label>
            <input
              type="number"
              name="waterNeeds"
              value={formData.waterNeeds}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Pesticide Usage (mL/acre)</label>
            <input
              type="number"
              name="pesticideUsage"
              value={formData.pesticideUsage}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Planting Date</label>
            <input
              type="date"
              name="plantingDate"
              value={formData.plantingDate}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Expected Harvest Date</label>
            <input
              type="date"
              name="expectedHarvest"
              value={formData.expectedHarvest}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>
        <div className="form-button-container">
          <button type="submit" className="form-submit-button">
            Add Crop
          </button>
        </div>
      </form>

      {/* Crops List */}
      <div className="crops-list">
        {crops.map((crop) => (
          <div key={crop.id} className="crop-card">
            <div className="card-header">
              <h3 className="crop-name">{crop.name}</h3>
            </div>
            <div className="card-details">
              <div className="detail">
                <p className="detail-label">Water Needs</p>
                <div className="detail-progress-bar">
                  <div
                    className={`progress-bar ${
                      crop.waterNeeds > WATER_THRESHOLD
                        ? 'progress-bar-red'
                        : 'progress-bar-blue'
                    }`}
                    style={{ width: `${(crop.waterNeeds / 100) * 100}%` }}
                  ></div>
                </div>
                <p className="detail-value">{crop.waterNeeds} L/day</p>
              </div>
              <div className="detail">
                <p className="detail-label">Pesticide Usage</p>
                <div className="detail-progress-bar">
                  <div
                    className={`progress-bar ${
                      crop.pesticideUsage > PESTICIDE_THRESHOLD
                        ? 'progress-bar-red'
                        : 'progress-bar-yellow'
                    }`}
                    style={{ width: `${(crop.pesticideUsage / 100) * 100}%` }}
                  ></div>
                </div>
                <p className="detail-value">{crop.pesticideUsage} mL/acre</p>
              </div>
              <div className="date-details">
                <p>Planted: {new Date(crop.plantingDate).toLocaleDateString()}</p>
                <p>
                  Expected Harvest: {new Date(crop.expectedHarvest).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// Reports Component
const Reports = () => {
  const reportData = {
    waterUsage: [
      { month: 'January', usage: 2500 },
      { month: 'February', usage: 2300 },
      { month: 'March', usage: 2800 },
    ],
    pesticideUsage: [
      { month: 'January', usage: 150 },
      { month: 'February', usage: 120 },
      { month: 'March', usage: 180 },
    ],
    energyConsumption: [
      { month: 'January', usage: 1200 },
      { month: 'February', usage: 1100 },
      { month: 'March', usage: 1300 },
    ],
  };

  const downloadCSV = () => {
    const headers = ['Month', 'Water Usage (L)', 'Pesticide Usage (mL)', 'Energy (kWh)'];
    const rows = reportData.waterUsage.map((water, index) => [
      water.month,
      water.usage,
      reportData.pesticideUsage[index].usage,
      reportData.energyConsumption[index].usage,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farm_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="report-container">
      <div className="header1">
        <h2 className="title">Farm Performance Reports</h2>
        <button
          onClick={downloadCSV}
          className="download-btn"
        >
          Download Report <Download className="download-icon" />
        </button>
      </div>

      <div className="table-container">
        <table className="report-table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Month</th>
              <th className="table-header-cell">Water Usage (L)</th>
              <th className="table-header-cell">Pesticide Usage (mL)</th>
              <th className="table-header-cell">Energy Consumption (kWh)</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {reportData.waterUsage.map((water, index) => (
              <tr key={water.month} className="table-row">
                <td className="table-cell">{water.month}</td>
                <td className="table-cell">{water.usage}</td>
                <td className="table-cell">{reportData.pesticideUsage[index].usage}</td>
                <td className="table-cell">{reportData.energyConsumption[index].usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-cards">
        <div className="summary-card water-summary">
          <h3 className="summary-title">Water Usage Summary</h3>
          <p className="summary-text">
            Total: {reportData.waterUsage.reduce((acc, curr) => acc + curr.usage, 0)}L
          </p>
          <p className="summary-text">
            Average: {Math.round(reportData.waterUsage.reduce((acc, curr) => acc + curr.usage, 0) / reportData.waterUsage.length)}L
          </p>
        </div>

        <div className="summary-card pesticide-summary">
          <h3 className="summary-title">Pesticide Usage Summary</h3>
          <p className="summary-text">
            Total: {reportData.pesticideUsage.reduce((acc, curr) => acc + curr.usage, 0)}mL
          </p>
          <p className="summary-text">
            Average: {Math.round(reportData.pesticideUsage.reduce((acc, curr) => acc + curr.usage, 0) / reportData.pesticideUsage.length)}mL
          </p>
        </div>

        <div className="summary-card energy-summary">
          <h3 className="summary-title">Energy Usage Summary</h3>
          <p className="summary-text">
            Total: {reportData.energyConsumption.reduce((acc, curr) => acc + curr.usage, 0)}kWh
          </p>
          <p className="summary-text">
            Average: {Math.round(reportData.energyConsumption.reduce((acc, curr) => acc + curr.usage, 0) / reportData.energyConsumption.length)}kWh
          </p>
        </div>
      </div>
    </div>
  );
};


// User Profile Component
const UserProfile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    profile: {
      ...user.profile
    }
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value
        }
      }));
    }
  };

  const handleArrayChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: value.split(',').map(item => item.trim())
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="user-profile">
      <div className="header2">
        <h2>User Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>
              <User className="input-icon" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Phone className="input-icon" />
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.profile.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <MapPin className="input-icon" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.profile.address}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Sprout className="input-icon" />
              Farm Size
            </label>
            <input
              type="text"
              name="farmSize"
              value={formData.profile.farmSize}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Sprout className="input-icon" />
              Preferred Crops (comma-separated)
            </label>
            <input
              type="text"
              name="preferredCrops"
              value={formData.profile.preferredCrops.join(', ')}
              onChange={(e) => handleArrayChange('preferredCrops', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Award className="input-icon" />
              Certifications (comma-separated)
            </label>
            <input
              type="text"
              name="certifications"
              value={formData.profile.certifications.join(', ')}
              onChange={(e) => handleArrayChange('certifications', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="buttons">
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="profile-field">
            <User className="input-icon" />
            <div>
              <h3>Full Name</h3>
              <p>{user.name}</p>
            </div>
          </div>

          <div className="profile-field">
            <Phone className="input-icon" />
            <div>
              <h3>Phone</h3>
              <p>{user.profile.phone}</p>
            </div>
          </div>

          <div className="profile-field">
            <MapPin className="input-icon" />
            <div>
              <h3>Address</h3>
              <p>{user.profile.address}</p>
            </div>
          </div>

          <div className="profile-field">
            <Sprout className="input-icon" />
            <div>
              <h3>Farm Size</h3>
              <p>{user.profile.farmSize}</p>
            </div>
          </div>

          <div className="profile-field">
            <Sprout className="input-icon" />
            <div>
              <h3>Preferred Crops</h3>
              <div className="tags">
                {user.profile.preferredCrops.map((crop, index) => (
                  <span key={index}>{crop}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="profile-field">
            <Award className="input-icon" />
            <div>
              <h3>Certifications</h3>
              <div className="tags blue-tag">
                {user.profile.certifications.map((cert, index) => (
                  <span key={index}>{cert}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Auth Pages Component
function AuthPages() {
  const [authPage, setAuthPage] = useState('login');

  const renderAuthPage = () => {
    switch (authPage) {
      case 'register':
        return <RegisterForm onToggleForm={() => setAuthPage('login')} />;
      case 'reset':
        return <PasswordReset onToggleForm={() => setAuthPage('login')} />;
      default:
        return <LoginForm onToggleForm={setAuthPage} />;
    }
  };

  return (
    <div className="auth-container">
      {renderAuthPage()}
    </div>
  );
}

// App Content Component
function AppContent() {
  const { user, logout, checkPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <AuthPages />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'farmers':
        return checkPermission('admin') ? <FarmerManagement /> : <div>Access Denied</div>;
      case 'crops':
        return <CropManagement />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <div className="header-title">
            <Tractor />
            <span>Sustainable Agriculture Monitor</span>
          </div>
          <div className="user-menu">
            <span className="user-name">{user.name}</span>
            <button
              onClick={() => setActiveTab('profile')}
              className="btn btn-icon"
              title="Profile"
            >
              <UserCircle size={18} />
            </button>
            <button onClick={logout} className="btn btn-logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="container">
          <div className="nav-list">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <Tractor />
              <span>Dashboard</span>
            </button>
            {checkPermission('admin') && (
              <button
                onClick={() => setActiveTab('farmers')}
                className={`nav-item ${activeTab === 'farmers' ? 'active' : ''}`}
              >
                <Users />
                <span>Farmers</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('crops')}
              className={`nav-item ${activeTab === 'crops' ? 'active' : ''}`}
            >
              <Sprout />
              <span>Crops</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            >
              <FileText />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container main-content">
        {renderContent()}
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <p>© {new Date().getFullYear()} Sustainable Agriculture Monitoring System</p>
        </div>
      </footer>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;