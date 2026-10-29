import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'growth.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
db.exec(`
CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  birthdate TEXT NOT NULL,
  gender TEXT DEFAULT 'other',
  color_theme TEXT DEFAULT '#4f46e5',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS metric_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  default_unit TEXT NOT NULL,
  is_standard INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS measurement_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  measured_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES measurement_sessions(id) ON DELETE CASCADE,
  child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL REFERENCES metric_types(key),
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  measured_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_measurements_child ON measurements(child_id, measured_date);
CREATE INDEX IF NOT EXISTS idx_measurements_metric ON measurements(metric_key);
CREATE INDEX IF NOT EXISTS idx_sessions_child ON measurement_sessions(child_id, measured_date);
`);

// Pre-populate standard metrics
const defaultMetrics = [
  { key: 'height', label: 'Height', category: 'general', default_unit: 'in', is_standard: 1, display_order: 10 },
  { key: 'weight', label: 'Weight', category: 'general', default_unit: 'lbs', is_standard: 1, display_order: 20 },
  { key: 'head', label: 'Head Circumference', category: 'upper_body', default_unit: 'in', is_standard: 1, display_order: 30 },
  { key: 'neck', label: 'Neck', category: 'upper_body', default_unit: 'in', is_standard: 1, display_order: 35 },
  { key: 'chest', label: 'Chest / Bust', category: 'upper_body', default_unit: 'in', is_standard: 1, display_order: 40 },
  { key: 'bicep_left', label: 'Left Arm / Bicep', category: 'upper_body', default_unit: 'in', is_standard: 1, display_order: 45 },
  { key: 'bicep_right', label: 'Right Arm / Bicep', category: 'upper_body', default_unit: 'in', is_standard: 1, display_order: 50 },
  { key: 'forearm_left', label: 'Left Forearm', category: 'upper_body', default_unit: 'in', is_standard: 1, display_order: 55 },
  { key: 'forearm_right', label: 'Right Forearm', category: 'upper_body', default_unit: 'in', is_standard: 1, display_order: 60 },
  { key: 'wingspan', label: 'Arm Span / Wingspan', category: 'upper_body', default_unit: 'in', is_standard: 1, display_order: 65 },
  { key: 'waist', label: 'Waist', category: 'core', default_unit: 'in', is_standard: 1, display_order: 70 },
  { key: 'hips', label: 'Hips', category: 'core', default_unit: 'in', is_standard: 1, display_order: 75 },
  { key: 'thigh_left', label: 'Left Thigh', category: 'lower_body', default_unit: 'in', is_standard: 1, display_order: 80 },
  { key: 'thigh_right', label: 'Right Thigh', category: 'lower_body', default_unit: 'in', is_standard: 1, display_order: 85 },
  { key: 'calf_left', label: 'Left Calf', category: 'lower_body', default_unit: 'in', is_standard: 1, display_order: 90 },
  { key: 'calf_right', label: 'Right Calf', category: 'lower_body', default_unit: 'in', is_standard: 1, display_order: 95 },
  { key: 'inseam', label: 'Inseam / Leg Length', category: 'lower_body', default_unit: 'in', is_standard: 1, display_order: 100 },
  { key: 'foot_length', label: 'Foot Length', category: 'lower_body', default_unit: 'in', is_standard: 1, display_order: 110 }
];

const checkMetricStmt = db.prepare('SELECT COUNT(*) as count FROM metric_types WHERE key = ?');
const insertMetricStmt = db.prepare(`
  INSERT INTO metric_types (key, label, category, default_unit, is_standard, display_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const m of defaultMetrics) {
  const row = checkMetricStmt.get(m.key);
  if (!row || row.count === 0) {
    insertMetricStmt.run(m.key, m.label, m.category, m.default_unit, m.is_standard, m.display_order);
  }
}

// Age calculator helper
export function calculateAge(birthdateStr, targetDateStr = null) {
  const birth = new Date(birthdateStr + 'T00:00:00');
  const target = targetDateStr ? new Date(targetDateStr + 'T00:00:00') : new Date();
  
  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = (years * 12) + months + (days / 30.4375);
  let label = '';
  if (years > 0) {
    label = `${years}y ${months}m`;
  } else if (months > 0) {
    label = `${months}m ${days}d`;
  } else {
    label = `${days} days`;
  }

  return { years, months, days, totalMonths: Math.round(totalMonths * 10) / 10, label };
}

// Child operations
export function getChildren() {
  const rows = db.prepare('SELECT * FROM children ORDER BY id ASC').all();
  return rows.map(child => ({
    ...child,
    age: calculateAge(child.birthdate)
  }));
}

export function getChildById(id) {
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(id);
  if (!child) return null;
  return {
    ...child,
    age: calculateAge(child.birthdate)
  };
}

export function createChild({ name, birthdate, gender, color_theme, notes }) {
  const stmt = db.prepare(`
    INSERT INTO children (name, birthdate, gender, color_theme, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  const res = stmt.run(name.trim(), birthdate, gender || 'other', color_theme || '#4f46e5', notes || '');
  return getChildById(Number(res.lastInsertRowid));
}

export function updateChild(id, { name, birthdate, gender, color_theme, notes }) {
  const stmt = db.prepare(`
    UPDATE children
    SET name = ?, birthdate = ?, gender = ?, color_theme = ?, notes = ?
    WHERE id = ?
  `);
  stmt.run(name.trim(), birthdate, gender || 'other', color_theme || '#4f46e5', notes || '', id);
  return getChildById(id);
}

export function deleteChild(id) {
  const stmt = db.prepare('DELETE FROM children WHERE id = ?');
  return stmt.run(id);
}

// Metric Types
export function getMetricTypes() {
  return db.prepare('SELECT * FROM metric_types ORDER BY display_order ASC, label ASC').all();
}

export function createMetricType({ key, label, category, default_unit, display_order }) {
  const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const stmt = db.prepare(`
    INSERT INTO metric_types (key, label, category, default_unit, is_standard, display_order)
    VALUES (?, ?, ?, ?, 0, ?)
  `);
  stmt.run(sanitizedKey, label.trim(), category || 'custom', default_unit || 'in', display_order || 200);
  return db.prepare('SELECT * FROM metric_types WHERE key = ?').get(sanitizedKey);
}

export function deleteMetricType(key) {
  // Prevent deleting standard metrics
  const metric = db.prepare('SELECT is_standard FROM metric_types WHERE key = ?').get(key);
  if (!metric || metric.is_standard) {
    throw new Error('Cannot delete standard metric');
  }
  db.prepare('DELETE FROM measurements WHERE metric_key = ?').run(key);
  return db.prepare('DELETE FROM metric_types WHERE key = ?').run(key);
}

// Measurement Sessions and Measurements
export function createMeasurementSession(childId, measuredDate, notes, items) {
  // items: array of { metric_key, value, unit }
  db.exec('BEGIN TRANSACTION;');
  try {
    const sessionStmt = db.prepare(`
      INSERT INTO measurement_sessions (child_id, measured_date, notes)
      VALUES (?, ?, ?)
    `);
    const sessionRes = sessionStmt.run(childId, measuredDate, notes || '');
    const sessionId = Number(sessionRes.lastInsertRowid);

    const measStmt = db.prepare(`
      INSERT INTO measurements (session_id, child_id, metric_key, value, unit, measured_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      if (item.value !== null && item.value !== '' && !isNaN(Number(item.value))) {
        measStmt.run(
          sessionId,
          childId,
          item.metric_key,
          Number(item.value),
          item.unit || 'in',
          measuredDate
        );
      }
    }

    db.exec('COMMIT;');
    return getSessionById(sessionId);
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function getSessionById(sessionId) {
  const session = db.prepare('SELECT * FROM measurement_sessions WHERE id = ?').get(sessionId);
  if (!session) return null;

  const items = db.prepare(`
    SELECT m.*, mt.label, mt.category
    FROM measurements m
    JOIN metric_types mt ON m.metric_key = mt.key
    WHERE m.session_id = ?
    ORDER BY mt.display_order ASC
  `).all(sessionId);

  return { ...session, measurements: items };
}

export function getSessionsForChild(childId) {
  const sessions = db.prepare(`
    SELECT * FROM measurement_sessions
    WHERE child_id = ?
    ORDER BY measured_date DESC, id DESC
  `).all(childId);

  const measStmt = db.prepare(`
    SELECT m.*, mt.label, mt.category
    FROM measurements m
    JOIN metric_types mt ON m.metric_key = mt.key
    WHERE m.session_id = ?
    ORDER BY mt.display_order ASC
  `);

  return sessions.map(s => ({
    ...s,
    measurements: measStmt.all(s.id)
  }));
}

export function updateMeasurementSession(sessionId, measuredDate, notes, items) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const session = db.prepare('SELECT * FROM measurement_sessions WHERE id = ?').get(sessionId);
    if (!session) throw new Error('Session not found');

    db.prepare('UPDATE measurement_sessions SET measured_date = ?, notes = ? WHERE id = ?')
      .run(measuredDate, notes || '', sessionId);

    db.prepare('DELETE FROM measurements WHERE session_id = ?').run(sessionId);

    const measStmt = db.prepare(`
      INSERT INTO measurements (session_id, child_id, metric_key, value, unit, measured_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      if (item.value !== null && item.value !== '' && !isNaN(Number(item.value))) {
        measStmt.run(
          sessionId,
          session.child_id,
          item.metric_key,
          Number(item.value),
          item.unit || 'in',
          measuredDate
        );
      }
    }

    db.exec('COMMIT;');
    return getSessionById(sessionId);
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function deleteSession(sessionId) {
  return db.prepare('DELETE FROM measurement_sessions WHERE id = ?').run(sessionId);
}

export function getLatestMeasurementsForChild(childId) {
  // Returns map of metric_key -> { value, unit, measured_date, previous_value, delta }
  const metrics = getMetricTypes();
  const result = {};

  const historyStmt = db.prepare(`
    SELECT value, unit, measured_date
    FROM measurements
    WHERE child_id = ? AND metric_key = ?
    ORDER BY measured_date DESC, id DESC
    LIMIT 2
  `);

  for (const m of metrics) {
    const rows = historyStmt.all(childId, m.key);
    if (rows.length > 0) {
      const latest = rows[0];
      const prev = rows.length > 1 ? rows[1] : null;
      const delta = prev ? Math.round((latest.value - prev.value) * 100) / 100 : 0;
      result[m.key] = {
        value: latest.value,
        unit: latest.unit,
        measured_date: latest.measured_date,
        prev_value: prev ? prev.value : null,
        prev_date: prev ? prev.measured_date : null,
        delta
      };
    }
  }

  return result;
}

export function getChildHistoryForMetric(childId, metricKey) {
  const child = getChildById(childId);
  if (!child) return [];

  const rows = db.prepare(`
    SELECT m.*, s.notes as session_notes
    FROM measurements m
    JOIN measurement_sessions s ON m.session_id = s.id
    WHERE m.child_id = ? AND m.metric_key = ?
    ORDER BY m.measured_date ASC, m.id ASC
  `).all(childId, metricKey);

  return rows.map((r, idx) => {
    const ageAtDate = calculateAge(child.birthdate, r.measured_date);
    const prev = idx > 0 ? rows[idx - 1] : null;
    const delta = prev ? Math.round((r.value - prev.value) * 100) / 100 : null;
    return {
      ...r,
      age: ageAtDate,
      delta
    };
  });
}

export function getSiblingComparison(metricKey) {
  const children = getChildren();
  const datasets = [];

  for (const child of children) {
    const history = getChildHistoryForMetric(child.id, metricKey);
    datasets.push({
      child: {
        id: child.id,
        name: child.name,
        color_theme: child.color_theme
      },
      points: history.map(h => ({
        x: h.age.totalMonths, // age in months on x-axis
        y: h.value,
        unit: h.unit,
        date: h.measured_date,
        ageLabel: h.age.label
      }))
    });
  }

  return datasets;
}

export function getChildStats(childId) {
  const child = getChildById(childId);
  if (!child) return null;

  const latest = getLatestMeasurementsForChild(childId);
  const totalSessions = db.prepare('SELECT COUNT(*) as c FROM measurement_sessions WHERE child_id = ?').get(childId).c;
  const firstSession = db.prepare('SELECT MIN(measured_date) as d FROM measurement_sessions WHERE child_id = ?').get(childId).d;
  const lastSession = db.prepare('SELECT MAX(measured_date) as d FROM measurement_sessions WHERE child_id = ?').get(childId).d;

  return {
    child,
    totalSessions,
    firstSession,
    lastSession,
    latest
  };
}

export function deleteMeasurement(id) {
  return db.prepare('DELETE FROM measurements WHERE id = ?').run(id);
}

export function updateMeasurement(id, value, unit) {
  const stmt = db.prepare('UPDATE measurements SET value = ?, unit = ? WHERE id = ?');
  return stmt.run(Number(value), unit, id);
}

export function exportAll() {
  const children = db.prepare('SELECT * FROM children').all();
  const metricTypes = db.prepare('SELECT * FROM metric_types').all();
  const sessions = db.prepare('SELECT * FROM measurement_sessions').all();
  const measurements = db.prepare('SELECT * FROM measurements').all();
  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    children,
    metricTypes,
    sessions,
    measurements
  };
}

export function importAll(data) {
  if (!data || !data.children || !data.measurements) {
    throw new Error('Invalid backup data format');
  }

  db.exec('BEGIN TRANSACTION;');
  try {
    // Clear existing data
    db.exec('DELETE FROM measurements;');
    db.exec('DELETE FROM measurement_sessions;');
    db.exec('DELETE FROM children;');

    const insertChild = db.prepare(`
      INSERT INTO children (id, name, birthdate, gender, color_theme, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of data.children) {
      insertChild.run(c.id, c.name, c.birthdate, c.gender, c.color_theme, c.notes, c.created_at || new Date().toISOString());
    }

    if (data.metricTypes) {
      const insertMetric = db.prepare(`
        INSERT OR IGNORE INTO metric_types (key, label, category, default_unit, is_standard, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const m of data.metricTypes) {
        insertMetric.run(m.key, m.label, m.category, m.default_unit, m.is_standard, m.display_order);
      }
    }

    if (data.sessions) {
      const insertSession = db.prepare(`
        INSERT INTO measurement_sessions (id, child_id, measured_date, notes, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const s of data.sessions) {
        insertSession.run(s.id, s.child_id, s.measured_date, s.notes, s.created_at || new Date().toISOString());
      }
    }

    const insertMeas = db.prepare(`
      INSERT INTO measurements (id, session_id, child_id, metric_key, value, unit, measured_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of data.measurements) {
      insertMeas.run(m.id, m.session_id, m.child_id, m.metric_key, m.value, m.unit, m.measured_date, m.created_at || new Date().toISOString());
    }

    db.exec('COMMIT;');
    return { success: true, count: data.measurements.length };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
