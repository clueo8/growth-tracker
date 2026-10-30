// Child Growth Tracker Client Application
(function () {
  'use strict';

  const state = {
    children: [],
    activeChildId: null,
    metrics: [],
    stats: null,
    sessions: [],
    chartInstance: null,
    activeTab: 'tab-dashboard',
    unitSystem: localStorage.getItem('gt_unit_system') || 'imperial',
    theme: localStorage.getItem('gt_theme') || 'light'
  };

  // DOM Elements
  const el = {
    brandLink: document.getElementById('brandLink'),
    chipsBar: document.getElementById('childrenChipsBar'),
    childBanner: document.getElementById('childBanner'),
    childNameText: document.getElementById('childNameText'),
    childHeaderSub: document.getElementById('childHeaderSub'),
    badgeLastMeasured: document.getElementById('badgeLastMeasured'),
    badgeTotalSessions: document.getElementById('badgeTotalSessions'),
    btnEditCurrentChild: document.getElementById('btnEditCurrentChild'),
    noChildrenState: document.getElementById('noChildrenState'),
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    // Dashboard
    dashboardKeyStats: document.getElementById('dashboardKeyStats'),
    snapshotCategoriesGrid: document.getElementById('snapshotCategoriesGrid'),
    // Record
    recordChildName: document.getElementById('recordChildName'),
    sessionDate: document.getElementById('sessionDate'),
    sessionNotes: document.getElementById('sessionNotes'),
    measurementsInputSections: document.getElementById('measurementsInputSections'),
    recordSessionForm: document.getElementById('recordSessionForm'),
    // Charts
    chartMetricSelect: document.getElementById('chartMetricSelect'),
    chartViewMode: document.getElementById('chartViewMode'),
    chartCanvas: document.getElementById('growthChartCanvas'),
    chartStatsInsight: document.getElementById('chartStatsInsight'),
    // History
    historyChildName: document.getElementById('historyChildName'),
    historySessionsList: document.getElementById('historySessionsList'),
    // Settings
    settingsChildrenList: document.getElementById('settingsChildrenList'),
    metricsTableBody: document.getElementById('metricsTableBody'),
    importFileInput: document.getElementById('importFileInput'),
    unitSysImperial: document.getElementById('unitSysImperial'),
    unitSysMetric: document.getElementById('unitSysMetric'),
    themeLight: document.getElementById('themeLight'),
    themeDark: document.getElementById('themeDark'),
    // Modals
    childModal: document.getElementById('childModal'),
    childModalForm: document.getElementById('childModalForm'),
    childModalTitle: document.getElementById('childModalTitle'),
    childModalId: document.getElementById('childModalId'),
    childModalName: document.getElementById('childModalName'),
    childModalBirthdate: document.getElementById('childModalBirthdate'),
    childModalGender: document.getElementById('childModalGender'),
    childModalNotes: document.getElementById('childModalNotes'),
    childColorRow: document.getElementById('childColorRow'),
    metricModal: document.getElementById('metricModal'),
    metricModalForm: document.getElementById('metricModalForm'),
    metricLabel: document.getElementById('metricLabel'),
    metricCategory: document.getElementById('metricCategory'),
    metricUnit: document.getElementById('metricUnit'),
    // Guide Modal
    guideModal: document.getElementById('guideModal'),
    guideModalTitle: document.getElementById('guideModalTitle'),
    guideMetricSelect: document.getElementById('guideMetricSelect'),
    guideContent: document.getElementById('guideContent'),
    btnGuidePrev: document.getElementById('btnGuidePrev'),
    btnGuideNext: document.getElementById('btnGuideNext'),
    // Edit Session Modal
    editSessionModal: document.getElementById('editSessionModal'),
    editSessionModalForm: document.getElementById('editSessionModalForm'),
    editSessionModalTitle: document.getElementById('editSessionModalTitle'),
    editSessionId: document.getElementById('editSessionId'),
    editSessionDate: document.getElementById('editSessionDate'),
    editSessionNotes: document.getElementById('editSessionNotes'),
    editSessionInputsGrid: document.getElementById('editSessionInputsGrid'),
    // Custom Styled Dialog Modal
    dialogModal: document.getElementById('dialogModal'),
    dialogIcon: document.getElementById('dialogIcon'),
    dialogTitle: document.getElementById('dialogTitle'),
    dialogMessage: document.getElementById('dialogMessage'),
    btnDialogCancel: document.getElementById('btnDialogCancel'),
    btnDialogConfirm: document.getElementById('btnDialogConfirm')
  };

  // Comprehensive Measurement Guide & Tips
  const MEASUREMENT_GUIDE = {
    height: {
      title: 'Height / Stature',
      tool: '📏 Tape Measure or Stadiometer + Flat Ruler/Book',
      posture: 'Stand barefoot, flat on floor against a flat wall, heels together, looking straight ahead.',
      steps: [
        'Have child remove shoes, heavy socks, and hair clips or bulky ponytails.',
        'Child stands with heels, buttocks, and upper back/shoulders resting gently against the wall.',
        'Keep chin level: the eye-to-ear line (Frankfort horizontal plane) should be parallel to the floor.',
        'Place a flat book or ruler against the wall and slide down until it firmly rests on top of the head (compressing hair).',
        'Mark lightly with a pencil or measure straight down to the floor with your tape.'
      ],
      proTip: 'Measure at the same time of day—kids are up to half an inch taller in the morning after spinal decompression during sleep!'
    },
    weight: {
      title: 'Weight',
      tool: '⚖️ Digital Scale',
      posture: 'Stand still and centered on the scale with weight balanced equally on both feet.',
      steps: [
        'Place scale on a hard, flat floor (never on carpet or squishy bath mats).',
        'Child should wear minimal clothing (e.g. underwear or light t-shirt) and no shoes.',
        'Keep hands and arms relaxed at sides.',
        'Wait until the digital reading stabilizes before noting the number.'
      ],
      proTip: 'Weigh in the morning right after waking up and using the bathroom for the most consistent long-term trend.'
    },
    head: {
      title: 'Head Circumference',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Child sits comfortably with head upright and hair loose.',
      steps: [
        'Position the tape across the forehead, about 1 inch above the eyebrows.',
        'Run the tape just above both ears around the widest bump at the back of the head (the occiput).',
        'Pull the tape snug enough to compress hair down to the scalp, but not painfully tight.',
        'Record the measurement to the nearest 1/8 inch or 0.1 cm.'
      ],
      proTip: 'Take the measurement 2–3 times and record the largest reading.'
    },
    neck: {
      title: 'Neck Circumference',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Head upright, looking straight ahead with neck and shoulders relaxed.',
      steps: [
        'Place the tape around the middle of the neck, midway between the collarbone and chin.',
        'Keep the tape flat against the skin without pinching or choking.',
        'Ensure the tape is level all the way around.'
      ],
      proTip: 'Slide one finger between the tape and neck to ensure a comfortable, accurate fit.'
    },
    chest: {
      title: 'Chest / Bust',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Child stands tall with arms relaxed at sides, breathing naturally.',
      steps: [
        'Wrap the tape around the widest part of the chest (across the nipple line).',
        'Guide the tape under the armpits and horizontally across the shoulder blades.',
        'Ensure the tape is completely parallel to the floor in front and back.',
        'Record the measurement at the end of a normal, relaxed exhalation.'
      ],
      proTip: 'Do not have the child puff their chest out or hold a giant breath while measuring.'
    },
    bicep_left: {
      title: 'Left Arm / Bicep',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Arm hanging loosely and relaxed at the child\'s side.',
      steps: [
        'Find the midpoint between the tip of the shoulder (acromion) and the elbow point.',
        'Wrap the tape around the thickest part of the bicep at this midpoint.',
        'Keep the tape flat against the skin without digging into the muscle.'
      ],
      proTip: 'Keep arm relaxed. If measuring flexed, make a fist and flex bicep at 90°, noting it in the session notes.'
    },
    bicep_right: {
      title: 'Right Arm / Bicep',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Arm hanging loosely and relaxed at the child\'s side.',
      steps: [
        'Find the midpoint between the tip of the shoulder and the elbow point.',
        'Wrap the tape around the thickest part of the upper arm.',
        'Check that tape is perpendicular to the arm bone.'
      ],
      proTip: 'Comparing left vs right arm is a fun way to track dominant side development.'
    },
    forearm_left: {
      title: 'Left Forearm',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Forearm extended forward, palm facing up, muscles relaxed.',
      steps: [
        'Wrap the tape around the widest circumference of the forearm.',
        'This is typically located 1 to 2 inches below the elbow crease.',
        'Keep the tape snug without indenting the skin.'
      ],
      proTip: 'Make sure the fingers are relaxed, not clenched into a fist.'
    },
    forearm_right: {
      title: 'Right Forearm',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Forearm extended forward, palm facing up, muscles relaxed.',
      steps: [
        'Wrap the tape around the widest part of the right forearm.',
        'Position 1 to 2 inches below the elbow crease.',
        'Read the measurement where the tape overlaps.'
      ],
      proTip: 'Measure twice to ensure you found the maximum circumference.'
    },
    wingspan: {
      title: 'Arm Span / Wingspan',
      tool: '📏 Long Measuring Tape (or Tailor\'s Tape against wall)',
      posture: 'Stand flat against a wall, arms outstretched fully to the sides at shoulder height.',
      steps: [
        'Child stretches both arms out wide against a flat wall, parallel to the floor (like an airplane).',
        'Palms face forward, middle fingers stretched fully outwards.',
        'Measure from the tip of the longest finger on the left hand straight across the chest to the tip of the longest finger on the right hand.'
      ],
      proTip: 'In growing kids, wingspan often catches up to or slightly exceeds height during growth spurts!'
    },
    waist: {
      title: 'Waist Circumference',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Standing upright, feet together, breathing normally.',
      steps: [
        'Locate the natural waistline: midway between the bottom of the rib cage and the top of the hip bone (usually 1/2 to 1 inch above the belly button).',
        'Wrap the tape around the torso parallel to the floor.',
        'Child should breathe out gently and relax the abdomen.',
        'Ensure the tape is flat against the skin without compressing the belly.'
      ],
      proTip: 'Remind kids not to "suck it in" or push their belly out.'
    },
    hips: {
      title: 'Hips / Seat',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Standing straight with heels together and weight evenly balanced.',
      steps: [
        'Wrap the tape around the widest, fullest part of the hips and buttocks.',
        'Look from the side to make sure the tape is completely horizontal all the way around.',
        'Keep tape snug against light clothing or skin.'
      ],
      proTip: 'Feet must be touching or very close together; spreading feet wide alters the measurement.'
    },
    thigh_left: {
      title: 'Left Thigh',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Standing with feet shoulder-width apart, weight balanced equally on both legs.',
      steps: [
        'Wrap the tape around the thickest part of the upper thigh, just below the gluteal fold (buttock crease).',
        'Keep the tape horizontal and parallel to the ground.',
        'Do not flex the quad muscle while measuring.'
      ],
      proTip: 'Keep both feet firmly planted so one leg isn\'t carrying all the weight.'
    },
    thigh_right: {
      title: 'Right Thigh',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Standing with feet shoulder-width apart, weight balanced equally on both legs.',
      steps: [
        'Wrap tape around the fullest part of the right upper thigh, just below the buttock fold.',
        'Keep the tape level without pinching into the skin.'
      ],
      proTip: 'Measuring at the same height below the hip each time ensures consistent tracking.'
    },
    calf_left: {
      title: 'Left Calf',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Standing with feet flat on the floor, legs relaxed.',
      steps: [
        'Wrap the tape around the widest, bulkiest part of the calf muscle.',
        'Slide the tape slightly up and down to find the maximum circumference.',
        'Keep the tape level.'
      ],
      proTip: 'Ensure heels are flat on the floor (not up on tiptoes).'
    },
    calf_right: {
      title: 'Right Calf',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Standing with feet flat on the floor, legs relaxed.',
      steps: [
        'Find the widest part of the right calf muscle.',
        'Wrap the tape around horizontally and read the measurement where it crosses zero.'
      ],
      proTip: 'Heels flat on the floor, calf muscles relaxed.'
    },
    inseam: {
      title: 'Inseam / Leg Length',
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Standing straight against a wall, barefoot, feet about 6 inches apart.',
      steps: [
        'Place the starting end (0) of the measuring tape at the highest point of the inner thigh (crotch).',
        'Run the tape straight down the inside of the leg.',
        'For body inseam, measure down to the center of the inner ankle bone (or down to the floor for pant length).'
      ],
      proTip: 'Having the child hold a hardcover book snug up into the crotch like a bicycle seat gives an exact horizontal reference edge to measure from!'
    },
    foot_length: {
      title: 'Foot Length',
      tool: '📏 Ruler or Tape Measure + Sheet of Paper',
      posture: 'Standing with full weight on the foot being measured on a hard floor.',
      steps: [
        'Place a sheet of paper on the floor against a flat wall.',
        'Child places foot on the paper with heel gently touching the wall.',
        'Mark the tip of the longest toe with a pencil held straight up and down.',
        'Measure from the edge of the paper to the pencil mark.'
      ],
      proTip: 'Measure both feet—it\'s very common for one foot to be slightly larger than the other. Always size shoes to the larger foot!'
    }
  };

  // Helper formatting functions
  function formatDate(dStr) {
    if (!dStr) return '--';
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
    return dStr;
  }

  function formatCategoryName(cat) {
    switch (cat) {
      case 'general': return '📏 Height & Weight';
      case 'upper_body': return '👕 Upper Body & Arms';
      case 'core': return '🎽 Torso & Core';
      case 'lower_body': return '👖 Lower Body & Legs';
      default: return '✨ Custom Measurements';
    }
  }

  function getMetricUnit(metric) {
    if (!metric) return state.unitSystem === 'metric' ? 'cm' : 'in';
    if (metric.key === 'weight') {
      return state.unitSystem === 'metric' ? 'kg' : 'lbs';
    }
    return state.unitSystem === 'metric' ? 'cm' : 'in';
  }

  function setUnitSystem(sys) {
    state.unitSystem = sys;
    localStorage.setItem('gt_unit_system', sys);
    populateMetricDropdown();
    renderMetricsTable();
    populateRecordForm();
    renderDashboard();
    if (state.activeTab === 'tab-charts') {
      updateChart();
    }
  }

  function applyTheme(themeName) {
    state.theme = themeName;
    localStorage.setItem('gt_theme', themeName);
    if (themeName === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (el.themeLight && el.themeDark) {
      el.themeLight.checked = themeName === 'light';
      el.themeDark.checked = themeName === 'dark';
    }
    if (state.activeTab === 'tab-charts') {
      updateChart();
    }
  }

  // Custom Styled Modal Dialogs (Alert & Confirm)
  function showAlert(message, title = 'Notice', type = 'info') {
    return new Promise(resolve => {
      if (!el.dialogModal) {
        window.alert(message);
        return resolve();
      }

      const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };
      el.dialogIcon.textContent = iconMap[type] || 'ℹ️';
      el.dialogTitle.textContent = title;
      el.dialogMessage.textContent = message;

      el.btnDialogCancel.style.display = 'none';
      el.btnDialogConfirm.textContent = 'OK';
      el.btnDialogConfirm.className = 'btn btn-primary btn-sm';

      const cleanup = () => {
        el.dialogModal.style.display = 'none';
        el.btnDialogConfirm.onclick = null;
        document.removeEventListener('keydown', keyHandler);
        resolve();
      };

      const keyHandler = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          cleanup();
        }
      };

      el.btnDialogConfirm.onclick = cleanup;
      document.addEventListener('keydown', keyHandler);
      el.dialogModal.style.display = 'flex';
      setTimeout(() => el.btnDialogConfirm.focus(), 50);
    });
  }

  function showConfirm(message, title = 'Confirm Action', options = {}) {
    return new Promise(resolve => {
      if (!el.dialogModal) {
        return resolve(window.confirm(message));
      }

      const {
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        isDanger = false,
        icon = isDanger ? '🗑️' : '❓'
      } = options;

      el.dialogIcon.textContent = icon;
      el.dialogTitle.textContent = title;
      el.dialogMessage.textContent = message;

      el.btnDialogCancel.style.display = 'inline-flex';
      el.btnDialogCancel.textContent = cancelText;
      el.btnDialogConfirm.textContent = confirmText;
      el.btnDialogConfirm.className = `btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`;

      const cleanup = (result) => {
        el.dialogModal.style.display = 'none';
        el.btnDialogConfirm.onclick = null;
        el.btnDialogCancel.onclick = null;
        document.removeEventListener('keydown', keyHandler);
        resolve(result);
      };

      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          cleanup(true);
        }
      };

      el.btnDialogConfirm.onclick = () => cleanup(true);
      el.btnDialogCancel.onclick = () => cleanup(false);
      document.addEventListener('keydown', keyHandler);
      el.dialogModal.style.display = 'flex';
      setTimeout(() => el.btnDialogConfirm.focus(), 50);
    });
  }

  // API Client
  async function api(path, options = {}) {
    try {
      const res = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed (${res.status})`);
      }
      return await res.json();
    } catch (err) {
      console.error(`API Error on ${path}:`, err);
      await showAlert(err.message, 'Request Error', 'error');
      throw err;
    }
  }

  // Initialize App
  async function init() {
    applyTheme(state.theme);
    setupEventListeners();
    await loadMetrics();
    await loadChildren();
  }

  function setupEventListeners() {
    // Brand link (Go to Home / Dashboard)
    if (el.brandLink) {
      el.brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('tab-dashboard');
      });
    }

    // Nav Tabs
    el.navTabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Record Form Submit
    el.recordSessionForm.addEventListener('submit', handleRecordSubmit);

    // Chart controls
    el.chartMetricSelect.addEventListener('change', updateChart);
    el.chartViewMode.addEventListener('change', updateChart);

    // Child Modal
    el.childModalForm.addEventListener('submit', handleChildModalSubmit);
    el.childColorRow.addEventListener('click', e => {
      const swatch = e.target.closest('.color-swatch');
      if (swatch) {
        el.childColorRow.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
      }
    });

    // Metric Modal
    el.metricModalForm.addEventListener('submit', handleMetricModalSubmit);

    // Edit current child button
    el.btnEditCurrentChild.addEventListener('click', () => {
      const child = state.children.find(c => c.id === state.activeChildId);
      if (child) openChildModal(child);
    });

    // Backup import
    el.importFileInput.addEventListener('change', handleImportBackup);

    // Global Unit System Radio
    if (el.unitSysImperial && el.unitSysMetric) {
      if (state.unitSystem === 'metric') {
        el.unitSysMetric.checked = true;
      } else {
        el.unitSysImperial.checked = true;
      }
      el.unitSysImperial.addEventListener('change', () => setUnitSystem('imperial'));
      el.unitSysMetric.addEventListener('change', () => setUnitSystem('metric'));
    }

    // Global Theme Switcher
    if (el.themeLight && el.themeDark) {
      if (state.theme === 'dark') {
        el.themeDark.checked = true;
      } else {
        el.themeLight.checked = true;
      }
      el.themeLight.addEventListener('change', () => applyTheme('light'));
      el.themeDark.addEventListener('change', () => applyTheme('dark'));
    }

    // Guide Modal
    if (el.guideMetricSelect) {
      el.guideMetricSelect.addEventListener('change', e => {
        state.currentGuideKey = e.target.value;
        renderGuideContent();
      });
    }
    if (el.btnGuidePrev) {
      el.btnGuidePrev.addEventListener('click', () => stepGuide(-1));
    }
    if (el.btnGuideNext) {
      el.btnGuideNext.addEventListener('click', () => stepGuide(1));
    }

    // Edit Session Modal Form Submit
    if (el.editSessionModalForm) {
      el.editSessionModalForm.addEventListener('submit', handleEditSessionSubmit);
    }
  }

  function switchTab(tabId) {
    state.activeTab = tabId;
    el.navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    el.tabPanes.forEach(p => {
      p.style.display = p.id === tabId ? 'block' : 'none';
    });

    if (tabId === 'tab-charts') {
      setTimeout(updateChart, 50);
    } else if (tabId === 'tab-history') {
      loadSessions();
    } else if (tabId === 'tab-record') {
      populateRecordForm();
    } else if (tabId === 'tab-dashboard') {
      loadStats();
    }
  }

  // Data Loading
  async function loadMetrics() {
    state.metrics = await api('/api/metrics');
    populateMetricDropdown();
    renderMetricsTable();
  }

  async function loadChildren(selectId = null) {
    state.children = await api('/api/children');
    renderChildrenBar();
    renderSettingsChildren();

    if (state.children.length === 0) {
      el.noChildrenState.style.display = 'block';
      el.childBanner.style.display = 'none';
      state.activeChildId = null;
      return;
    }

    el.noChildrenState.style.display = 'none';
    el.childBanner.style.display = 'block';

    const targetId = selectId || state.activeChildId || Number(localStorage.getItem('gt_active_child')) || state.children[0].id;
    const exists = state.children.some(c => c.id === targetId);
    selectChild(exists ? targetId : state.children[0].id);
  }

  function renderChildrenBar() {
    let html = '';
    state.children.forEach(c => {
      const isActive = c.id === state.activeChildId;
      html += `
        <button class="child-chip ${isActive ? 'active' : ''}" onclick="window.app.selectChild(${c.id})">
          <span class="child-avatar-dot" style="background: ${c.color_theme || '#4f46e5'}"></span>
          <span>${escapeHtml(c.name)}</span>
          <span style="font-size: 0.75rem; opacity: 0.8; font-weight: 400;">(${c.age.label})</span>
        </button>
      `;
    });

    html += `
      <button class="btn-add-child-chip" onclick="window.app.openChildModal()" title="Add Child Profile">+</button>
    `;

    el.chipsBar.innerHTML = html;
  }

  async function selectChild(id) {
    state.activeChildId = id;
    localStorage.setItem('gt_active_child', id);

    const child = state.children.find(c => c.id === id);
    if (!child) return;

    // Update banner
    el.childNameText.textContent = child.name;
    el.childHeaderSub.textContent = `Born ${formatDate(child.birthdate)} • ${child.age.label} old`;
    el.childBanner.style.background = `linear-gradient(135deg, ${child.color_theme || '#4f46e5'} 0%, #1e1b4b 100%)`;

    el.recordChildName.textContent = child.name;
    el.historyChildName.textContent = child.name;

    renderChildrenBar();
    await loadStats();
    await loadSessions();

    if (state.activeTab === 'tab-charts') {
      updateChart();
    } else if (state.activeTab === 'tab-record') {
      populateRecordForm();
    }
  }

  async function loadStats() {
    if (!state.activeChildId) return;
    state.stats = await api(`/api/children/${state.activeChildId}/stats`);
    renderDashboard();

    el.badgeLastMeasured.textContent = state.stats.lastSession
      ? `Last measured: ${formatDate(state.stats.lastSession)}`
      : 'Last measured: None yet';
    el.badgeTotalSessions.textContent = `${state.stats.totalSessions} measurement session${state.stats.totalSessions === 1 ? '' : 's'}`;
  }

  async function loadSessions() {
    if (!state.activeChildId) return;
    state.sessions = await api(`/api/children/${state.activeChildId}/sessions`);
    renderHistory();
  }

  // Dashboard Rendering
  function renderDashboard() {
    if (!state.stats) return;
    const latest = state.stats.latest || {};

    // 1. Key Stat Cards (Height, Weight, Wingspan, Waist, Head)
    const keyMetrics = [
      { key: 'height', label: 'Height' },
      { key: 'weight', label: 'Weight' },
      { key: 'wingspan', label: 'Wingspan' },
      { key: 'waist', label: 'Waist' },
      { key: 'head', label: 'Head' }
    ];

    let keyCardsHtml = '';
    keyMetrics.forEach(km => {
      const data = latest[km.key];
      const mDef = state.metrics.find(m => m.key === km.key) || { label: km.label, default_unit: 'in' };
      const val = data ? data.value : '--';
      const unit = data ? data.unit : mDef.default_unit;
      const date = data ? formatDate(data.measured_date) : 'No data';

      let deltaBadge = '';
      if (data && data.delta !== undefined && data.prev_value !== null) {
        const sign = data.delta > 0 ? '+' : '';
        const cls = data.delta >= 0 ? 'delta-pos' : 'delta-neutral';
        deltaBadge = `<span class="delta-badge ${cls}">${sign}${data.delta} ${unit}</span>`;
      }

      keyCardsHtml += `
        <div class="stat-card">
          <div class="stat-label">${escapeHtml(mDef.label)}</div>
          <div class="stat-value">
            ${val} <span class="stat-unit">${unit}</span>
          </div>
          <div class="stat-footer">
            <span>${date}</span>
            ${deltaBadge}
          </div>
        </div>
      `;
    });
    el.dashboardKeyStats.innerHTML = keyCardsHtml;

    // 2. Category Snapshot Grid
    const categories = ['general', 'upper_body', 'core', 'lower_body', 'custom'];
    let catGridHtml = '';

    categories.forEach(cat => {
      const catMetrics = state.metrics.filter(m => m.category === cat);
      if (catMetrics.length === 0) return;

      let itemsHtml = '';
      catMetrics.forEach(m => {
        const data = latest[m.key];
        const val = data ? `${data.value} ${data.unit}` : '<span style="color: #94a3b8">--</span>';
        let deltaHtml = '';
        if (data && data.delta !== undefined && data.prev_value !== null) {
          const sign = data.delta > 0 ? '+' : '';
          deltaHtml = `<span style="font-size: 0.75rem; color: #059669; font-weight: 600; margin-left: 0.4rem;">(${sign}${data.delta})</span>`;
        }
        itemsHtml += `
          <div class="snapshot-item-row">
            <span class="snapshot-item-label">${escapeHtml(m.label)}</span>
            <div class="snapshot-item-value">
              ${val} ${deltaHtml}
            </div>
          </div>
        `;
      });

      catGridHtml += `
        <div class="snapshot-card">
          <div class="snapshot-card-header">
            <span>${formatCategoryName(cat)}</span>
          </div>
          <div class="snapshot-card-body">${itemsHtml}</div>
        </div>
      `;
    });

    el.snapshotCategoriesGrid.innerHTML = catGridHtml;
  }

  // Record Measurement Session Form
  function populateRecordForm() {
    const today = new Date().toISOString().slice(0, 10);
    el.sessionDate.value = today;
    el.sessionNotes.value = '';

    const latest = (state.stats && state.stats.latest) ? state.stats.latest : {};

    // Group metrics by category
    const categories = ['general', 'upper_body', 'core', 'lower_body', 'custom'];
    let html = '';

    categories.forEach(cat => {
      const catMetrics = state.metrics.filter(m => m.category === cat);
      if (catMetrics.length === 0) return;

      let tilesHtml = '';
      catMetrics.forEach(m => {
        const prior = latest[m.key];
        let hint = '<span style="color: #94a3b8">No prior record</span>';
        if (prior) {
          hint = `Previous: <strong>${prior.value} ${prior.unit}</strong> on ${formatDate(prior.measured_date)}`;
        }

        const isWeight = m.key === 'weight';
        const unit = getMetricUnit(m);

        tilesHtml += `
          <div class="meas-input-tile">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <label class="meas-input-label" for="metric_input_${m.key}" style="margin-bottom: 0;">${escapeHtml(m.label)}</label>
              <button type="button" class="btn-help-tip" tabindex="-1" onclick="window.app.openGuideModal('${m.key}')" title="How to measure ${escapeHtml(m.label)}">
                💡 Tips
              </button>
            </div>
            <div class="input-with-unit-badge">
              <input type="number" step="0.1" min="0" id="metric_input_${m.key}" name="metric_${m.key}" placeholder="0.0" data-key="${m.key}" data-unit="${unit}">
              <span class="unit-addon">${unit}</span>
            </div>
            <div class="meas-prev-hint">${hint}</div>
          </div>
        `;
      });

      html += `
        <div class="category-accordion">
          <div class="category-accordion-header">
            <span>${formatCategoryName(cat)}</span>
          </div>
          <div class="category-accordion-body">
            ${tilesHtml}
          </div>
        </div>
      `;
    });

    el.measurementsInputSections.innerHTML = html;
  }

  async function handleRecordSubmit(e) {
    e.preventDefault();
    if (!state.activeChildId) {
      await showAlert('Please select or add a child profile first.', 'Child Profile Needed', 'warning');
      return;
    }

    const measured_date = el.sessionDate.value;
    const notes = el.sessionNotes.value;

    const measurements = [];
    const inputs = el.measurementsInputSections.querySelectorAll('input[data-key]');
    inputs.forEach(inp => {
      const val = inp.value.trim();
      if (val !== '' && !isNaN(Number(val))) {
        const key = inp.dataset.key;
        const unit = inp.dataset.unit || getMetricUnit({ key });
        measurements.push({
          metric_key: key,
          value: Number(val),
          unit
        });
      }
    });

    if (measurements.length === 0) {
      await showAlert('Please enter at least one measurement value.', 'No Measurements Entered', 'warning');
      return;
    }

    await api(`/api/children/${state.activeChildId}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ measured_date, notes, measurements })
    });

    await loadStats();
    await loadSessions();
    switchTab('tab-dashboard');
    await showAlert('Measurement session recorded successfully!', 'Measurements Saved', 'success');
  }

  function resetRecordForm() {
    populateRecordForm();
  }

  // Chart Rendering
  function populateMetricDropdown() {
    let html = '';
    state.metrics.forEach(m => {
      const unit = getMetricUnit(m);
      html += `<option value="${m.key}">${escapeHtml(m.label)} (${unit})</option>`;
    });
    el.chartMetricSelect.innerHTML = html;
  }

  async function updateChart() {
    const metricKey = el.chartMetricSelect.value || 'height';
    const mode = el.chartViewMode.value;
    const metric = state.metrics.find(m => m.key === metricKey) || { label: metricKey, default_unit: 'in' };

    if (!window.Chart) {
      console.error('Chart.js not loaded');
      return;
    }

    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }

    if (mode === 'single') {
      if (!state.activeChildId) return;
      const history = await api(`/api/children/${state.activeChildId}/history/${metricKey}`);
      renderSingleChildChart(history, metric);
    } else {
      const siblingData = await api(`/api/compare?metric=${metricKey}`);
      renderSiblingChart(siblingData, metric);
    }
  }

  function renderSingleChildChart(history, metric) {
    const child = state.children.find(c => c.id === state.activeChildId);
    const themeColor = (child && child.color_theme) ? child.color_theme : '#4f46e5';

    if (history.length === 0) {
      el.chartStatsInsight.innerHTML = `No data recorded for <strong>${escapeHtml(metric.label)}</strong> yet. Enter a measurement session to see the trend!`;
    } else {
      const first = history[0];
      const last = history[history.length - 1];
      const totalGrowth = Math.round((last.value - first.value) * 100) / 100;
      const sign = totalGrowth > 0 ? '+' : '';

      el.chartStatsInsight.innerHTML = `
        <strong>${child.name}</strong> grew <strong>${sign}${totalGrowth} ${metric.default_unit}</strong> in ${escapeHtml(metric.label)} from ${formatDate(first.measured_date)} to ${formatDate(last.measured_date)}.
        Total recorded data points: ${history.length}.
      `;
    }

    const labels = history.map(h => formatDate(h.measured_date));
    const values = history.map(h => h.value);
    const isDark = state.theme === 'dark';
    const gridColor = isDark ? '#1f293d' : '#f1f5f9';
    const tickColor = isDark ? '#94a3b8' : '#64748b';

    const ctx = el.chartCanvas.getContext('2d');
    state.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `${metric.label} (${metric.default_unit})`,
          data: values,
          borderColor: themeColor,
          backgroundColor: themeColor + '20',
          fill: true,
          tension: 0.3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: themeColor,
          pointBorderColor: isDark ? '#111827' : '#ffffff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const item = history[context.dataIndex];
                const ageLabel = item && item.age ? item.age.label : '';
                return ` ${context.parsed.y} ${item.unit} (Age: ${ageLabel})`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tickColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              callback: (val) => `${val} ${metric.default_unit}`
            }
          }
        }
      }
    });
  }

  function renderSiblingChart(datasets, metric) {
    el.chartStatsInsight.innerHTML = `
      Comparing <strong>${escapeHtml(metric.label)}</strong> across siblings, normalized by age in months on the horizontal axis.
    `;

    const chartDatasets = datasets.map(d => {
      return {
        label: d.child.name,
        data: d.points.map(p => ({ x: p.x, y: p.y, ageLabel: p.ageLabel, date: p.date, unit: p.unit })),
        borderColor: d.child.color_theme || '#4f46e5',
        backgroundColor: (d.child.color_theme || '#4f46e5') + '20',
        fill: false,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8
      };
    });

    const isDark = state.theme === 'dark';
    const gridColor = isDark ? '#1f293d' : '#f1f5f9';
    const tickColor = isDark ? '#94a3b8' : '#64748b';

    const ctx = el.chartCanvas.getContext('2d');
    state.chartInstance = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: chartDatasets.map(ds => ({
          ...ds,
          showLine: true
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const raw = context.raw;
                return ` ${context.dataset.label}: ${raw.y} ${raw.unit} at age ${raw.ageLabel} (${formatDate(raw.date)})`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'Age in Months', color: tickColor },
            grid: { display: false },
            ticks: { color: tickColor }
          },
          y: {
            title: { display: true, text: `${metric.label} (${metric.default_unit})`, color: tickColor },
            grid: { color: gridColor },
            ticks: { color: tickColor }
          }
        }
      }
    });
  }

  // History Tab
  function renderHistory() {
    if (state.sessions.length === 0) {
      el.historySessionsList.innerHTML = `
        <div class="empty-state">
          <p>No measurement sessions logged yet.</p>
          <button class="btn btn-primary btn-sm" onclick="window.app.switchTab('tab-record')">+ Log First Session</button>
        </div>
      `;
      return;
    }

    let html = '';
    state.sessions.forEach(s => {
      let badgesHtml = '';
      s.measurements.forEach(m => {
        badgesHtml += `
          <div class="meas-badge" style="cursor: pointer;" onclick="window.app.openEditSessionModal(${s.id})" title="Click to edit session">
            <span>${escapeHtml(m.label)}:</span>
            <strong>${m.value} ${m.unit}</strong>
          </div>
        `;
      });

      const notesHtml = s.notes ? `<div style="font-size: 0.85rem; color: #64748b; margin-top: 0.4rem; font-style: italic;">📝 "${escapeHtml(s.notes)}"</div>` : '';

      html += `
        <div class="session-card">
          <div class="session-header">
            <div>
              <strong style="font-size: 1rem; color: #0f172a;">${formatDate(s.measured_date)}</strong>
              ${notesHtml}
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span style="font-size: 0.8rem; color: #64748b;">${s.measurements.length} measurements</span>
              <button class="btn btn-sm btn-secondary" onclick="window.app.openEditSessionModal(${s.id})" title="Edit Measurements">✏️ Edit</button>
              <button class="btn btn-sm btn-danger" onclick="window.app.deleteSession(${s.id})" title="Delete Session">🗑️</button>
            </div>
          </div>
          <div class="session-body">
            <div class="session-chips-grid">
              ${badgesHtml}
            </div>
          </div>
        </div>
      `;
    });

    el.historySessionsList.innerHTML = html;
  }

  async function deleteSession(id) {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this measurement session? All measurements for this date will be permanently deleted.',
      'Delete Session?',
      { confirmText: 'Delete Session', isDanger: true }
    );
    if (!confirmed) return;
    await api(`/api/sessions/${id}`, { method: 'DELETE' });
    await loadStats();
    await loadSessions();
  }

  // Settings & Children Management
  function renderSettingsChildren() {
    if (state.children.length === 0) {
      el.settingsChildrenList.innerHTML = '<p style="color: var(--text-muted);">No children configured.</p>';
      return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    state.children.forEach(c => {
      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #fbfcfe; border: 1px solid var(--border); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 18px; height: 18px; border-radius: 50%; background: ${c.color_theme || '#4f46e5'}"></div>
            <div>
              <strong>${escapeHtml(c.name)}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Born: ${formatDate(c.birthdate)} (${c.age.label}) • Gender: ${escapeHtml(c.gender)}</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick='window.app.openChildModal(${JSON.stringify(c)})'>Edit</button>
            <button class="btn btn-danger btn-sm" onclick="window.app.deleteChild(${c.id})">Delete</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    el.settingsChildrenList.innerHTML = html;
  }

  function renderMetricsTable() {
    let html = '';
    state.metrics.forEach(m => {
      const isCustom = !m.is_standard;
      const unit = getMetricUnit(m);
      const deleteBtn = isCustom
        ? `<button class="btn btn-danger btn-sm" onclick="window.app.deleteMetric('${m.key}')">Delete</button>`
        : '<span style="color: #94a3b8; font-size: 0.8rem;">Standard</span>';

      html += `
        <tr>
          <td><strong>${escapeHtml(m.label)}</strong></td>
          <td>${formatCategoryName(m.category)}</td>
          <td>${unit}</td>
          <td>${isCustom ? '<span style="color: #6366f1; font-weight: 600;">Custom</span>' : 'System'}</td>
          <td>${deleteBtn}</td>
        </tr>
      `;
    });
    el.metricsTableBody.innerHTML = html;
  }

  // Modals & Actions
  function openChildModal(child = null) {
    if (child) {
      el.childModalTitle.textContent = 'Edit Child Profile';
      el.childModalId.value = child.id;
      el.childModalName.value = child.name;
      el.childModalBirthdate.value = child.birthdate;
      el.childModalGender.value = child.gender || 'boy';
      el.childModalNotes.value = child.notes || '';

      const color = child.color_theme || '#4f46e5';
      el.childColorRow.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.toggle('selected', s.dataset.color === color);
      });
    } else {
      el.childModalTitle.textContent = 'Add Child Profile';
      el.childModalId.value = '';
      el.childModalName.value = '';
      el.childModalBirthdate.value = '';
      el.childModalGender.value = 'boy';
      el.childModalNotes.value = '';
      el.childColorRow.querySelectorAll('.color-swatch').forEach((s, idx) => {
        s.classList.toggle('selected', idx === 0);
      });
    }
    el.childModal.style.display = 'flex';
  }

  async function handleChildModalSubmit(e) {
    e.preventDefault();
    const id = el.childModalId.value;
    const name = el.childModalName.value.trim();
    const birthdate = el.childModalBirthdate.value;
    const gender = el.childModalGender.value;
    const notes = el.childModalNotes.value.trim();

    const selectedColorEl = el.childColorRow.querySelector('.color-swatch.selected');
    const color_theme = selectedColorEl ? selectedColorEl.dataset.color : '#4f46e5';

    if (id) {
      await api(`/api/children/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, birthdate, gender, color_theme, notes })
      });
      closeModal('childModal');
      await loadChildren(Number(id));
    } else {
      const created = await api('/api/children', {
        method: 'POST',
        body: JSON.stringify({ name, birthdate, gender, color_theme, notes })
      });
      closeModal('childModal');
      await loadChildren(created.id);
    }
  }

  async function deleteChild(id) {
    const child = state.children.find(c => c.id === id);
    const confirmed = await showConfirm(
      `Are you sure you want to delete ${child ? child.name : 'this child'}? All measurement records will be permanently removed.`,
      'Delete Child Profile?',
      { confirmText: 'Delete Child', isDanger: true }
    );
    if (!confirmed) return;
    await api(`/api/children/${id}`, { method: 'DELETE' });
    await loadChildren();
  }

  function openMetricModal() {
    el.metricLabel.value = '';
    el.metricCategory.value = 'upper_body';
    el.metricUnit.value = 'in';
    el.metricModal.style.display = 'flex';
  }

  async function handleMetricModalSubmit(e) {
    e.preventDefault();
    const label = el.metricLabel.value.trim();
    const category = el.metricCategory.value;
    const default_unit = el.metricUnit.value;
    const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_');

    await api('/api/metrics', {
      method: 'POST',
      body: JSON.stringify({ key, label, category, default_unit })
    });

    closeModal('metricModal');
    await loadMetrics();
    populateRecordForm();
    await showAlert('Custom metric added successfully!', 'Metric Added', 'success');
  }

  async function deleteMetric(key) {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this custom metric? All historical measurements for this metric will also be removed.',
      'Delete Custom Metric?',
      { confirmText: 'Delete Metric', isDanger: true }
    );
    if (!confirmed) return;
    await api(`/api/metrics/${key}`, { method: 'DELETE' });
    await loadMetrics();
    populateRecordForm();
  }

  function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  // Measurement Guide Modal
  function openGuideModal(metricKey = 'height') {
    state.currentGuideKey = metricKey;
    populateGuideMetricSelect();
    if (el.guideMetricSelect) {
      el.guideMetricSelect.value = state.currentGuideKey;
    }
    renderGuideContent();
    if (el.guideModal) {
      el.guideModal.style.display = 'flex';
    }
  }

  function populateGuideMetricSelect() {
    if (!el.guideMetricSelect) return;
    let html = '';
    state.metrics.forEach(m => {
      html += `<option value="${m.key}">${escapeHtml(m.label)}</option>`;
    });
    el.guideMetricSelect.innerHTML = html;
  }

  function renderGuideContent() {
    const key = state.currentGuideKey || 'height';
    const guide = MEASUREMENT_GUIDE[key] || {
      title: (state.metrics.find(m => m.key === key) || {}).label || key,
      tool: '🪡 Flexible Tailor\'s Tape',
      posture: 'Stand in a relaxed, natural posture.',
      steps: [
        'Place the measuring tape around the area being measured.',
        'Ensure the tape is flat against the skin or light clothing without twisting.',
        'Take the measurement where the tape overlaps zero.'
      ],
      proTip: 'Measure 2–3 times to ensure consistency.'
    };

    if (el.guideModalTitle) {
      el.guideModalTitle.textContent = `How to Measure: ${guide.title}`;
    }

    let stepsHtml = '';
    guide.steps.forEach(step => {
      stepsHtml += `<li>${step}</li>`;
    });

    if (el.guideContent) {
      el.guideContent.innerHTML = `
        <div class="guide-tool-pill">${guide.tool}</div>
        <div class="guide-posture-box">
          <strong>🧍 Position & Posture:</strong> ${guide.posture}
        </div>
        <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; color: #0f172a;">
          Step-by-Step Instructions:
        </div>
        <ol class="guide-steps-list">
          ${stepsHtml}
        </ol>
        <div class="guide-tip-box">
          <strong>💡 Pro Tip:</strong> ${guide.proTip}
        </div>
      `;
    }
  }

  function stepGuide(direction) {
    const keys = state.metrics.map(m => m.key);
    let idx = keys.indexOf(state.currentGuideKey);
    if (idx === -1) idx = 0;
    idx += direction;
    if (idx < 0) idx = keys.length - 1;
    if (idx >= keys.length) idx = 0;
    state.currentGuideKey = keys[idx];
    if (el.guideMetricSelect) {
      el.guideMetricSelect.value = state.currentGuideKey;
    }
    renderGuideContent();
  }

  // Edit Session Modal
  function openEditSessionModal(sessionId) {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return;

    el.editSessionId.value = session.id;
    el.editSessionDate.value = session.measured_date;
    el.editSessionNotes.value = session.notes || '';
    el.editSessionModalTitle.textContent = `✏️ Edit Measurements (${formatDate(session.measured_date)})`;

    // Map of existing values
    const measMap = {};
    session.measurements.forEach(m => {
      measMap[m.metric_key] = { value: m.value, unit: m.unit };
    });

    let html = '';
    state.metrics.forEach(m => {
      const existing = measMap[m.key];
      const val = existing ? existing.value : '';
      const unit = existing ? existing.unit : getMetricUnit(m);

      html += `
        <div class="meas-input-tile">
          <label class="meas-input-label" for="edit_input_${m.key}">${escapeHtml(m.label)}</label>
          <div class="input-with-unit-badge">
            <input type="number" step="0.1" min="0" id="edit_input_${m.key}" name="edit_${m.key}" value="${val}" placeholder="--" data-key="${m.key}" data-unit="${unit}">
            <span class="unit-addon">${unit}</span>
          </div>
        </div>
      `;
    });

    el.editSessionInputsGrid.innerHTML = html;
    el.editSessionModal.style.display = 'flex';
  }

  async function handleEditSessionSubmit(e) {
    e.preventDefault();
    const sessionId = Number(el.editSessionId.value);
    const measured_date = el.editSessionDate.value;
    const notes = el.editSessionNotes.value;

    const measurements = [];
    const inputs = el.editSessionInputsGrid.querySelectorAll('input[data-key]');
    inputs.forEach(inp => {
      const val = inp.value.trim();
      if (val !== '' && !isNaN(Number(val))) {
        const key = inp.dataset.key;
        const unit = inp.dataset.unit || getMetricUnit({ key });
        measurements.push({
          metric_key: key,
          value: Number(val),
          unit
        });
      }
    });

    if (measurements.length === 0) {
      await showAlert('A session must have at least one measurement.', 'Empty Session', 'warning');
      return;
    }

    await api(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify({ measured_date, notes, measurements })
    });

    closeModal('editSessionModal');
    await loadStats();
    await loadSessions();
    if (state.activeTab === 'tab-charts') {
      updateChart();
    }
    await showAlert('Measurements updated successfully!', 'Measurements Updated', 'success');
  }

  async function handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const confirmed = await showConfirm(
        'Importing this file will overwrite existing records with the backup file data. Do you wish to continue?',
        'Restore Backup?',
        { confirmText: 'Overwrite & Restore', isDanger: true }
      );
      if (!confirmed) return;
      await api('/api/import', {
        method: 'POST',
        body: JSON.stringify(json)
      });
      await showAlert('Backup imported successfully!', 'Backup Restored', 'success');
      window.location.reload();
    } catch (err) {
      await showAlert('Failed to import backup: ' + err.message, 'Import Failed', 'error');
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Export public API
  window.app = {
    init,
    selectChild,
    switchTab,
    openChildModal,
    openMetricModal,
    openGuideModal,
    openEditSessionModal,
    closeModal,
    deleteChild,
    deleteSession,
    deleteMetric,
    resetRecordForm,
    showAlert,
    showConfirm
  };

  // Override default browser alert
  window.alert = (msg) => showAlert(msg);

  // Run on page load
  document.addEventListener('DOMContentLoaded', init);
})();
