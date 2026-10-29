import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Children Endpoints
app.get('/api/children', (req, res) => {
  try {
    const children = db.getChildren();
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/children', (req, res) => {
  try {
    const { name, birthdate, gender, color_theme, notes } = req.body;
    if (!name || !birthdate) {
      return res.status(400).json({ error: 'Name and birthdate are required' });
    }
    const child = db.createChild({ name, birthdate, gender, color_theme, notes });
    res.status(201).json(child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/children/:id', (req, res) => {
  try {
    const child = db.getChildById(Number(req.params.id));
    if (!child) return res.status(404).json({ error: 'Child not found' });
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/children/:id', (req, res) => {
  try {
    const { name, birthdate, gender, color_theme, notes } = req.body;
    const child = db.updateChild(Number(req.params.id), { name, birthdate, gender, color_theme, notes });
    if (!child) return res.status(404).json({ error: 'Child not found' });
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/children/:id', (req, res) => {
  try {
    db.deleteChild(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Metrics Endpoints
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = db.getMetricTypes();
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/metrics', (req, res) => {
  try {
    const { key, label, category, default_unit, display_order } = req.body;
    if (!key || !label) {
      return res.status(400).json({ error: 'Key and label are required' });
    }
    const metric = db.createMetricType({ key, label, category, default_unit, display_order });
    res.status(201).json(metric);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/metrics/:key', (req, res) => {
  try {
    db.deleteMetricType(req.params.key);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Stats and Measurements
app.get('/api/children/:id/stats', (req, res) => {
  try {
    const stats = db.getChildStats(Number(req.params.id));
    if (!stats) return res.status(404).json({ error: 'Child not found' });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/children/:id/sessions', (req, res) => {
  try {
    const sessions = db.getSessionsForChild(Number(req.params.id));
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/children/:id/sessions', (req, res) => {
  try {
    const childId = Number(req.params.id);
    const { measured_date, notes, measurements } = req.body;
    if (!measured_date || !Array.isArray(measurements) || measurements.length === 0) {
      return res.status(400).json({ error: 'measured_date and measurements array are required' });
    }
    const session = db.createMeasurementSession(childId, measured_date, notes, measurements);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sessions/:id', (req, res) => {
  try {
    db.deleteSession(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/children/:id/history/:metricKey', (req, res) => {
  try {
    const history = db.getChildHistoryForMetric(Number(req.params.id), req.params.metricKey);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/compare', (req, res) => {
  try {
    const metric = req.query.metric || 'height';
    const datasets = db.getSiblingComparison(metric);
    res.json(datasets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/measurements/:id', (req, res) => {
  try {
    const { value, unit } = req.body;
    db.updateMeasurement(Number(req.params.id), value, unit);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/measurements/:id', (req, res) => {
  try {
    db.deleteMeasurement(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export & Import
app.get('/api/export', (req, res) => {
  try {
    const backup = db.exportAll();
    res.setHeader('Content-Disposition', `attachment; filename="growth_tracker_backup_${new Date().toISOString().slice(0, 10)}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/import', (req, res) => {
  try {
    const result = db.importAll(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve index.html for all frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Child Growth Tracker listening on http://0.0.0.0:${PORT}`);
});
