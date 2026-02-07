import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecurringVisitors = () => {
  const [recurringVisitors, setRecurringVisitors] = useState([]);
  const [newVisitor, setNewVisitor] = useState({ name: '', schedule: '' });

  useEffect(() => {
    fetchRecurringVisitors();
  }, []);

  const fetchRecurringVisitors = async () => {
    try {
      const response = await axios.get('/api/visitors/recurring');
      setRecurringVisitors(response.data);
    } catch (error) {
      console.error('Error fetching recurring visitors:', error);
    }
  };

  const addRecurringVisitor = async () => {
    try {
      await axios.post('/api/visitors/recurring', newVisitor);
      setNewVisitor({ name: '', schedule: '' });
      fetchRecurringVisitors();
    } catch (error) {
      console.error('Error adding recurring visitor:', error);
    }
  };

  return (
    <div>
      <h1>Recurring Visitors</h1>
      <div>
        <input
          type="text"
          placeholder="Visitor Name"
          value={newVisitor.name}
          onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Schedule (e.g., Every Monday 10 AM)"
          value={newVisitor.schedule}
          onChange={(e) => setNewVisitor({ ...newVisitor, schedule: e.target.value })}
        />
        <button onClick={addRecurringVisitor}>Add Recurring Visitor</button>
      </div>
      <h2>Existing Recurring Visitors</h2>
      <ul>
        {recurringVisitors.map((visitor, index) => (
          <li key={index}>
            {visitor.name} - {visitor.schedule}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecurringVisitors;