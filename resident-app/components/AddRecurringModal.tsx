/**
 * AddRecurringModal — Form to add a recurring visitor via the backend.
 */
'use client';

import { useState } from 'react';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SCHEDULE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)' },
  { value: 'every_monday', label: 'Every Monday' },
  { value: 'every_tuesday', label: 'Every Tuesday' },
  { value: 'every_wednesday', label: 'Every Wednesday' },
  { value: 'every_thursday', label: 'Every Thursday' },
  { value: 'every_friday', label: 'Every Friday' },
  { value: 'every_saturday', label: 'Every Saturday' },
  { value: 'every_sunday', label: 'Every Sunday' },
];

export default function AddRecurringModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('weekdays');
  const [timeFrom, setTimeFrom] = useState('09:00');
  const [timeTo, setTimeTo] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setName('');
    setSchedule('weekdays');
    setTimeFrom('09:00');
    setTimeTo('17:00');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Visitor name is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/recurring-visitors/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          schedule,
          time_window: `${timeFrom}-${timeTo}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to add recurring visitor.');
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <Modal.Header>
        <h2 className="text-title text-ink">Add Recurring Visitor</h2>
        <p className="text-caption text-ink-muted mt-1">Set up automatic access for regular visitors</p>
      </Modal.Header>

      <Modal.Body>
        {success ? (
          <div className="text-center py-6">
            <span className="text-4xl">✅</span>
            <p className="text-body text-status-success mt-3 font-medium">
              Recurring visitor added!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-caption text-status-error">
                {error}
              </div>
            )}

            <div>
              <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                Visitor Name <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fatima (Housekeeper)"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                Schedule
              </label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className={inputClass}
              >
                {SCHEDULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                  From
                </label>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                  To
                </label>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      {!success && (
        <Modal.Footer>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={loading}>
            Add Recurring Visitor
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
