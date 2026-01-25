// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  fetchProfile,
  updateProfile,
  fetchUserRequests,
  fetchAllRequests,
  fetchPickupTasks
} from '../api/authService';
import { logout, getRole, getEmail } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';

import ChatbotComponent from '../components/ChatbotComponent';

const COLORS = ['#FFBB28', '#0088FE', '#00C49F', '#FF8042', '#a28cff', '#d6478d', '#63e58b'];

const Profile = () => {
  const userRole = getRole();
  const loggedInEmail = getEmail();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', profilePicture: '' });
  const [updateFormData, setUpdateFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // chatbot for users (closed by default)
  const [showChatbot, setShowChatbot] = useState(false);

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0, pending: 0, approved: 0, scheduled: 0, completed: 0, rejected: 0,
    active: 0, completedLifetime: 0
  });

  const [ewasteTypes, setEwasteTypes] = useState([]);
  const [pickupData, setPickupData] = useState([
    { day: 'Mon', pickups: 0 },
    { day: 'Tue', pickups: 0 },
    { day: 'Wed', pickups: 0 },
    { day: 'Thu', pickups: 0 },
    { day: 'Fri', pickups: 0 },
    { day: 'Sat', pickups: 0 },
    { day: 'Sun', pickups: 0 }
  ]);

  const [staffList, setStaffList] = useState([]);
  const [selectedStaffKey, setSelectedStaffKey] = useState(null);
  const [selectedStaffStats, setSelectedStaffStats] = useState({ received: 0, completed: 0 });
  const [selectedStaffPickupData, setSelectedStaffPickupData] = useState(pickupData);

  const [unassignedCompletedCount, setUnassignedCompletedCount] = useState(0);

  const pollingRef = useRef(null);

  /* ---------------- Helpers ---------------- */

  const extractStaffIdentifiers = (req) => {
    const emails = new Set();
    const ids = new Set();
    const names = new Set();

    const add = (v) => {
      if (v == null) return;
      if (typeof v === 'string') {
        const s = v.trim();
        if (s.includes('@')) emails.add(s.toLowerCase());
        else if (s.length) names.add(s);
        return;
      }
      if (typeof v === 'number') { ids.add(String(v)); return; }
      if (typeof v === 'object') {
        if (v.email) emails.add(String(v.email).toLowerCase());
        if (v.emailAddress) emails.add(String(v.emailAddress).toLowerCase());
        if (v.id) ids.add(String(v.id));
        if (v._id) ids.add(String(v._id));
        if (v.name) names.add(String(v.name));
        if (v.user && typeof v.user === 'object') {
          if (v.user.email) emails.add(String(v.user.email).toLowerCase());
          if (v.user.id) ids.add(String(v.user.id));
          if (v.user._id) ids.add(String(v.user._id));
          if (v.user.name) names.add(String(v.user.name));
        }
      }
    };

    [
      'assignedTo','assigned_to','assignedStaff','assigned_staff','pickupStaff','pickup_staff',
      'handledBy','handled_by','handler','staffEmail','staff_email','staffId','staff_id',
      'assignee','createdBy','owner','assignedToEmail','assignedToId','assignment','assigned'
    ].forEach(k => add(req?.[k]));

    Object.keys(req || {}).forEach(k => {
      if (/email/i.test(k)) add(req[k]);
      if (/staff/i.test(k)) add(req[k]);
      if (/assigned/i.test(k) && !['assignedAt','assignedOn'].includes(k)) add(req[k]);
    });

    return {
      emails: Array.from(emails),
      ids: Array.from(ids),
      names: Array.from(names)
    };
  };

  const isAssignedToCurrentStaff = (historyReq, currentStaffCandidates = []) => {
    const ids = extractStaffIdentifiers(historyReq);
    const lowerEmails = ids.emails.map(e => e.toLowerCase());
    const lowerNames = ids.names.map(n => String(n).toLowerCase());

    for (const cand of currentStaffCandidates) {
      if (!cand) continue;
      const c = String(cand).toLowerCase();
      if (lowerEmails.includes(c)) return true;
      if (ids.ids.includes(String(cand))) return true;
      if (lowerNames.some(n => n.includes(c) || c.includes(n))) return true;
    }
    return false;
  };

  const parseQuantity = (val) => {
    if (val == null) return 1;
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) || 1 : 1;
  };

  const getDeviceType = (req) => {
    return req.deviceType || req.type || req.itemType || req.category || req.device_type || 'Others';
  };

  /* ---------------- Derive stats & charts ---------------- */

  const deriveFromRequests = (fetchedRequests = []) => {
    if (userRole === 'ROLE_PICKUP') {
      const activeRequests = fetchedRequests.filter(r => (String(r.status || '').toUpperCase() !== 'COMPLETED'));
      const completedRequests = fetchedRequests.filter(r => (String(r.status || '').toUpperCase() === 'COMPLETED'));

      const pending = activeRequests.filter(r => String(r.status || '').toUpperCase() === 'PENDING').length;
      const approved = activeRequests.filter(r => String(r.status || '').toUpperCase() === 'APPROVED').length;
      const scheduled = activeRequests.filter(r => String(r.status || '').toUpperCase() === 'SCHEDULED').length;
      const rejected = activeRequests.filter(r => String(r.status || '').toUpperCase() === 'REJECTED').length;

      const completedLifetime = completedRequests.length + (Number(unassignedCompletedCount) || 0);
      const active = activeRequests.length;
      const total = active + completedLifetime;

      const dayCounts = [0,0,0,0,0,0,0];
      completedRequests.forEach(req => {
        let dayIndex = null;
        if (req.completedAt) {
          const d = new Date(req.completedAt);
          if (!Number.isNaN(d.getTime())) dayIndex = (d.getDay() + 6) % 7;
        }
        if (dayIndex === null) {
          const fallback = (String(req.id || req._id || Math.random()).split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % 7;
          dayCounts[fallback] += 1;
        } else {
          dayCounts[dayIndex] += 1;
        }
      });

      let chartData;
      const hasPerDayCompleted = dayCounts.some(v => v > 0);
      if (hasPerDayCompleted) {
        chartData = [
          { day: 'Mon', pickups: dayCounts[0] },
          { day: 'Tue', pickups: dayCounts[1] },
          { day: 'Wed', pickups: dayCounts[2] },
          { day: 'Thu', pickups: dayCounts[3] },
          { day: 'Fri', pickups: dayCounts[4] },
          { day: 'Sat', pickups: dayCounts[5] },
          { day: 'Sun', pickups: dayCounts[6] }
        ];
      } else if (completedLifetime > 0) {
        const base = Math.floor(completedLifetime / 7);
        const rem = completedLifetime % 7;
        const arr = Array(7).fill(base);
        for (let i=0;i<rem;i++) arr[i] += 1;
        chartData = [
          { day: 'Mon', pickups: arr[0] },
          { day: 'Tue', pickups: arr[1] },
          { day: 'Wed', pickups: arr[2] },
          { day: 'Thu', pickups: arr[3] },
          { day: 'Fri', pickups: arr[4] },
          { day: 'Sat', pickups: arr[5] },
          { day: 'Sun', pickups: arr[6] }
        ];
      } else {
        chartData = [
          { day: 'Mon', pickups: 0 },
          { day: 'Tue', pickups: 0 },
          { day: 'Wed', pickups: 0 },
          { day: 'Thu', pickups: 0 },
          { day: 'Fri', pickups: 0 },
          { day: 'Sat', pickups: 0 },
          { day: 'Sun', pickups: 0 }
        ];
      }

      setPickupData(chartData);

      setStats({
        total,
        pending,
        approved,
        scheduled,
        completed: completedLifetime,
        rejected,
        active,
        completedLifetime
      });

      return;
    }

    const sBase = {
      total: fetchedRequests.length,
      pending: fetchedRequests.filter(r => String(r.status || '').toUpperCase() === 'PENDING').length,
      approved: fetchedRequests.filter(r => String(r.status || '').toUpperCase() === 'APPROVED').length,
      scheduled: fetchedRequests.filter(r => String(r.status || '').toUpperCase() === 'SCHEDULED').length,
      completed: fetchedRequests.filter(r => String(r.status || '').toUpperCase() === 'COMPLETED').length,
      rejected: fetchedRequests.filter(r => String(r.status || '').toUpperCase() === 'REJECTED').length,
    };

    if (userRole === 'ROLE_ADMIN') {
      const typeCounts = {};
      const staffMap = {};

      fetchedRequests.forEach(req => {
        const type = getDeviceType(req);
        const qty = parseQuantity(req.quantity);
        typeCounts[type] = (typeCounts[type] || 0) + qty;

        const ids = extractStaffIdentifiers(req);
        const staffKey =
          ids.emails[0] ? `${ids.emails[0]}::email` :
          ids.ids[0] ? `${ids.ids[0]}::id` :
          ids.names[0] ? `${ids.names[0]}::name` :
          null;

        if (staffKey) {
          if (!staffMap[staffKey]) {
            const label =
              (typeof req.assignedTo === 'object' && (req.assignedTo.name || req.assignedTo.email)) ||
              req.assignedStaff?.name || req.pickupStaff?.name || req.handledBy?.name || staffKey;
            staffMap[staffKey] = { label: String(label), received: 0, completed: 0, dayCounts: [0,0,0,0,0,0,0] };
          }
          staffMap[staffKey].received += 1;
          if (String(req.status || '').toUpperCase() === 'COMPLETED') {
            staffMap[staffKey].completed += 1;
            let dayIndex = null;
            if (req.completedAt) {
              const d = new Date(req.completedAt);
              if (!Number.isNaN(d.getTime())) dayIndex = (d.getDay() + 6) % 7;
            } else if (req.scheduledDate) {
              const d2 = new Date(req.scheduledDate);
              if (!Number.isNaN(d2.getTime())) dayIndex = (d2.getDay() + 6) % 7;
            }
            if (dayIndex === null) {
              const fallback = (String(req.id || req._id || Math.random()).split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % 7;
              staffMap[staffKey].dayCounts[fallback] += 1;
            } else {
              staffMap[staffKey].dayCounts[dayIndex] += 1;
            }
          }
        }
      });

      const typeData = Object.entries(typeCounts).map(([key, value], idx) => ({
        name: key, value, color: COLORS[idx % COLORS.length]
      }));
      setEwasteTypes(typeData.length ? typeData : []);

      const staffArr = Object.entries(staffMap).map(([key, v]) => ({
        key, label: v.label || key, received: v.received, completed: v.completed, dayCounts: v.dayCounts
      }));
      staffArr.sort((a,b) => b.received - a.received);
      setStaffList(staffArr);

      if (selectedStaffKey) {
        const sel = staffArr.find(s => s.key === selectedStaffKey);
        if (sel) {
          setSelectedStaffStats({ received: sel.received, completed: sel.completed });
          setSelectedStaffPickupData([
            { day: 'Mon', pickups: sel.dayCounts[0] },
            { day: 'Tue', pickups: sel.dayCounts[1] },
            { day: 'Wed', pickups: sel.dayCounts[2] },
            { day: 'Thu', pickups: sel.dayCounts[3] },
            { day: 'Fri', pickups: sel.dayCounts[4] },
            { day: 'Sat', pickups: sel.dayCounts[5] },
            { day: 'Sun', pickups: sel.dayCounts[6] }
          ]);
        }
      } else if (staffArr.length) {
        const top = staffArr[0];
        setSelectedStaffKey(top.key);
        setSelectedStaffStats({ received: top.received, completed: top.completed });
        setSelectedStaffPickupData([
          { day: 'Mon', pickups: top.dayCounts[0] },
          { day: 'Tue', pickups: top.dayCounts[1] },
          { day: 'Wed', pickups: top.dayCounts[2] },
          { day: 'Thu', pickups: top.dayCounts[3] },
          { day: 'Fri', pickups: top.dayCounts[4] },
          { day: 'Sat', pickups: top.dayCounts[5] },
          { day: 'Sun', pickups: top.dayCounts[6] }
        ]);
      }

      setStats(sBase);
      return;
    }

    setStats(sBase);
  };

  /* ---------------- Load + Polling ---------------- */

  useEffect(() => {
    let mounted = true;

    const loadOnce = async () => {
      setLoading(true);
      try {
        const profileRes = await fetchProfile();
        const userData = profileRes?.data || {};
        let fetchedRequests = [];

        try {
          if (userRole === 'ROLE_ADMIN') {
            const res = await fetchAllRequests();
            fetchedRequests = res?.data || [];
          } else if (userRole === 'ROLE_PICKUP') {
            const resActive = await fetchPickupTasks();
            const activeTasks = resActive?.data || [];

            let allHistory = [];
            try {
              const allRes = await fetchAllRequests();
              allHistory = allRes?.data || [];
            } catch {
              try { const f = await fetchUserRequests(); allHistory = f?.data || []; } catch {}
            }

            const candidates = [];
            if (loggedInEmail) candidates.push(String(loggedInEmail).toLowerCase());
            if (userData && userData.email) candidates.push(String(userData.email).toLowerCase());
            if (userData && (userData.id || userData._id)) candidates.push(String(userData.id || userData._id));
            if (userData && userData.name) candidates.push(String(userData.name));

            const completedHistoryForStaff = allHistory.filter(h => {
              if (!h) return false;
              if (String(h.status || '').toUpperCase() !== 'COMPLETED') return false;
              return isAssignedToCurrentStaff(h, candidates);
            });

            const completedUnassigned = allHistory.filter(h => {
              if (!h) return false;
              if (String(h.status || '').toUpperCase() !== 'COMPLETED') return false;
              const ids = extractStaffIdentifiers(h);
              const hasAny = ids.emails.length || ids.ids.length || ids.names.length;
              return !hasAny;
            });

            const combined = [...activeTasks];
            const combinedIds = new Set(combined.map(x => String(x.id || x._id || '')));
            for (const h of completedHistoryForStaff) {
              const hid = String(h.id || h._id || '');
              if (!hid || !combinedIds.has(hid)) {
                combined.push(h);
                combinedIds.add(hid);
              }
            }
            fetchedRequests = combined;
            setUnassignedCompletedCount(completedUnassigned.length);
          } else {
            const res = await fetchUserRequests();
            fetchedRequests = res?.data || [];
          }
        } catch {
          try { const res = await fetchUserRequests(); fetchedRequests = res?.data || []; } catch { fetchedRequests = []; }
        }

        if (!mounted) return;
        setProfile(prev => ({ ...prev, ...userData, email: loggedInEmail || userData.email, name: userData.name || prev.name }));
        setUpdateFormData(userData);
        setRequests(fetchedRequests);
        deriveFromRequests(fetchedRequests);
        setMessage('Profile and dashboard loaded.');
      } catch {
        if (!mounted) return;
        setMessage('Failed to load data. Check your connection.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    loadOnce();

    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(async () => {
        try {
          let fetchedRequests = [];
          if (userRole === 'ROLE_ADMIN') {
            const res = await fetchAllRequests();
            fetchedRequests = res?.data || [];
          } else if (userRole === 'ROLE_PICKUP') {
            const resActive = await fetchPickupTasks();
            const activeTasks = resActive?.data || [];
            let allHistory = [];
            try { const allRes = await fetchAllRequests(); allHistory = allRes?.data || []; } catch {
              try { const f = await fetchUserRequests(); allHistory = f?.data || []; } catch {}
            }

            const candidates = [];
            if (loggedInEmail) candidates.push(String(loggedInEmail).toLowerCase());
            if (profile && profile.email) candidates.push(String(profile.email).toLowerCase());
            if (profile && (profile.id || profile._id)) candidates.push(String(profile.id || profile._id));
            if (profile && profile.name) candidates.push(String(profile.name));

            const completedHistoryForStaff = allHistory.filter(h => {
              if (!h) return false;
              if (String(h.status || '').toUpperCase() !== 'COMPLETED') return false;
              return isAssignedToCurrentStaff(h, candidates);
            });

            const completedUnassigned = allHistory.filter(h => {
              if (!h) return false;
              if (String(h.status || '').toUpperCase() !== 'COMPLETED') return false;
              const ids = extractStaffIdentifiers(h);
              const hasAny = ids.emails.length || ids.ids.length || ids.names.length;
              return !hasAny;
            });

            const combined = [...activeTasks];
            const combinedIds = new Set(combined.map(x => String(x.id || x._id || '')));
            for (const h of completedHistoryForStaff) {
              const hid = String(h.id || h._id || '');
              if (!hid || !combinedIds.has(hid)) {
                combined.push(h);
                combinedIds.add(hid);
              }
            }
            fetchedRequests = combined;
            setUnassignedCompletedCount(completedUnassigned.length);
          } else {
            const res = await fetchUserRequests();
            fetchedRequests = res?.data || [];
          }

          setRequests(fetchedRequests);
          deriveFromRequests(fetchedRequests);
          setMessage('Live data updated.');
        } catch {
          // silent
        }
      }, 5000);
    };

    if (userRole === 'ROLE_USER' || userRole === 'ROLE_PICKUP' || userRole === 'ROLE_ADMIN') {
      startPolling();
    }

    return () => {
      mounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, loggedInEmail, unassignedCompletedCount, profile?.email]);

  useEffect(() => {
    if (!selectedStaffKey || !staffList.length) return;
    const sel = staffList.find(s => s.key === selectedStaffKey);
    if (!sel) return;
    setSelectedStaffStats({ received: sel.received, completed: sel.completed });
    setSelectedStaffPickupData([
      { day: 'Mon', pickups: sel.dayCounts[0] },
      { day: 'Tue', pickups: sel.dayCounts[1] },
      { day: 'Wed', pickups: sel.dayCounts[2] },
      { day: 'Thu', pickups: sel.dayCounts[3] },
      { day: 'Fri', pickups: sel.dayCounts[4] },
      { day: 'Sat', pickups: sel.dayCounts[5] },
      { day: 'Sun', pickups: sel.dayCounts[6] }
    ]);
  }, [selectedStaffKey, staffList]);

  /* ---------------- Handlers ---------------- */

  const initials = (name = '') =>
    name ? name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const handleUpdateChange = e =>
    setUpdateFormData({ ...updateFormData, [e.target.name]: e.target.value });

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('Saving...');
    try {
      await updateProfile(updateFormData);
      setProfile(p => ({ ...p, ...updateFormData }));
      setShowUpdateForm(false);
      setDrawerOpen(false);
      setMessage('✅ Profile updated!');
    } catch {
      setMessage('❌ Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  /* ---------------- Quick Menu (shared) ---------------- */

  const quickMenuConfig = {
    ROLE_USER: [
      { key: 'submit', label: 'Submit request', variant: 'success', onClick: () => navigate('/submit') },
      { key: 'requests', label: 'Requests', variant: 'primary', onClick: () => navigate('/requests') },
      { key: 'report', label: 'Report issue', variant: 'info', onClick: () => navigate('/report-issue') },
      { key: 'profile', label: 'Profile', variant: 'warning', onClick: () => setDrawerOpen(true) },
      { key: 'logout', label: 'Logout', variant: 'outline-danger', onClick: handleLogout },
    ],
    ROLE_ADMIN: [
      { key: 'dashboard', label: 'Admin Dashboard', variant: 'primary', onClick: () => navigate('/admin/dashboard') },
      { key: 'users', label: 'Users & Staff', variant: 'info', onClick: () => navigate('/admin/users') },
      { key: 'issues', label: 'Reported Issues', variant: 'warning', onClick: () => navigate('/admin/issues') },
      { key: 'logout', label: 'Logout', variant: 'outline-danger', onClick: handleLogout },
    ],
    ROLE_PICKUP: [
      { key: 'tasks', label: 'Assigned Tasks', variant: 'info', onClick: () => navigate('/pickup/dashboard') },
      { key: 'report', label: 'Report', variant: 'secondary', onClick: () => navigate('/report-issue') },
      { key: 'logout', label: 'Logout', variant: 'outline-danger', onClick: handleLogout },
    ]
  };

  const renderQuickMenu = () => {
    const items = quickMenuConfig[userRole];
    if (!items) return null;

    return (
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '12px 12px 0',
          position: 'relative',
          zIndex: 1200,
        }}
      >
        {/* top bar */}
        <div className="d-flex justify-content-between align-items-center">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              style={{
                background: 'rgba(9,132,227,0.09)',
                border: 'none',
                borderRadius: 10,
                width: 44,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
              aria-label="Open quick menu"
              onClick={() => setSidebarOpen(s => !s)}
            >
              <div style={{ width: 22 }}>
                <div style={{ height: 3, borderRadius: 2, background: '#34d399', marginBottom: 5 }} />
                <div style={{ height: 3, borderRadius: 2, background: '#38bdf8', marginBottom: 5 }} />
                <div style={{ height: 3, borderRadius: 2, background: '#fbbf24' }} />
              </div>
            </button>
            <span
              style={{
                marginLeft: 11,
                color: '#14532d',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Quick Menu
            </span>
          </div>

          {/* right side buttons */}
          <div className="d-flex gap-2">
            {items.map(item => (
              <button
                key={item.key}
                className={`btn btn-${item.variant}`}
                style={{ borderRadius: 10, fontWeight: 700 }}
                onClick={item.onClick}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* vertical dropdown, starts from same left, grows downwards */}
        {sidebarOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              marginTop: 8,
              left: 0,                 // align with container (and Quick Menu button)
              width: 220,              // vertical menu width
              background: '#ffffff',
              borderRadius: 16,
              boxShadow: '0 18px 54px rgba(34,197,94,0.25)',
              padding: '16px 12px',
              minHeight: 200,          // ⬆️ increased height
            }}
          >
            <div
              style={{
                borderBottom: '1px solid #e0ffeb',
                marginBottom: 10,
                paddingBottom: 6,
                textAlign: 'center',
                fontWeight: 800,
                fontSize: 18,
                color: '#166534',
              }}
            >
              Menu
            </div>
            <div className="d-flex flex-column gap-2">
              {items.map(item => (
                <button
                  key={item.key}
                  className={`btn btn-${item.variant}`}
                  style={{ borderRadius: 10, fontWeight: 700, minHeight: 42 }}
                  onClick={() => {
                    item.onClick();
                    setSidebarOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="container mt-5">Loading Dashboard...</div>;

  /* ---------------- small components ---------------- */

  const StatCard = ({ color, title, value, icon, footer }) => (
    <div style={{
      borderRadius: 17,
      background: `linear-gradient(160deg, #fff 65%, ${color} 100%)`,
      boxShadow: "0 10px 38px #e0ffeb15",
      padding: "22px 17px",
      minWidth: 140,
      minHeight: 110,
      border: "1px solid #f0fff4",
      fontWeight: 700
    }}>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="text-muted small">{title}</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{value}</div>
        </div>
        <div style={{ fontSize: 28 }}>{icon}</div>
      </div>
      <div className="mt-2 small text-muted">{footer}</div>
    </div>
  );

  const PickupStat = ({ icon, name, count }) => (
    <div className="card p-3 me-2 mb-2" style={{
      background: "#a7f3d0", borderRadius: 16, minWidth: 180, boxShadow: "0 4px 14px #34d3993a", color: "#14532d"
    }}>
      <div className="d-flex align-items-center gap-2">
        <span style={{ fontSize: 26 }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: 15 }}>{name}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{count}</div>
    </div>
  );

  /* ---------------- ADMIN view ---------------- */

  if (userRole === 'ROLE_ADMIN') {
    return (
      <div style={{ background: "linear-gradient(110deg,#f3e8ff 0%,#e0f9eb 100%)", minHeight: "100vh", fontFamily: "Inter,system-ui" }}>
        {renderQuickMenu()}
        <div className="container py-4">
          <div className="d-flex align-items-center gap-3 my-3 mb-4">
            <div style={{
              width: 70, height: 70, borderRadius: "18px",
              background: "linear-gradient(135deg,#38bdf8,#a7f3d0 102%)",
              display: "grid", placeItems: "center", fontWeight: 900, fontSize: 23, color: "#065f46"
            }}>AD</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 26, color: "#3b82f6" }}>ADMIN PANEL</div>
              <div style={{ fontSize: 13, color: "#6366f1" }}>{profile.name} • {profile.email}</div>
              <span className="badge bg-primary px-2 py-1 mt-1 fw-bold">System Administrator</span>
            </div>
          </div>

          <div className="d-flex gap-3 flex-wrap mb-3">
            <StatCard color="#f3e8ff" title="Total Requests" value={stats.total} icon="🗂" footer="All received" />
            <StatCard color="#c4b5fd" title="Approved" value={stats.approved} icon="✅" footer="Accepted" />
            <StatCard color="#fbbf24" title="Pending" value={stats.pending} icon="⚠️" footer="Awaiting" />
            <StatCard color="#a7f3d0" title="Completed" value={stats.completed} icon="🎉" footer="Processed" />
            <StatCard color="#fecdd3" title="Rejected" value={stats.rejected} icon="❌" footer="Not accepted" />
            <StatCard color="#c6f6e9" title="Scheduled" value={stats.scheduled} icon="📅" footer="Pickup scheduled" />
          </div>

          <div className="row mb-3">
            <div className="col-md-7">
              <div className="card p-4" style={{
                borderRadius: 18, background: "linear-gradient(120deg,#f3e8ff,#e0f9eb 90%)", boxShadow: "0 6px 24px #bbf7d0a8"
              }}>
                <h5 style={{ fontWeight: 800, color: "#3730a3" }}>Received E-Waste Types (Live)</h5>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ewasteTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {ewasteTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                <div className="d-flex gap-2 flex-wrap mt-3">
                  {ewasteTypes.map((t, i) => (
                    <div key={i} className="card p-3 me-2 mb-2" style={{
                      background: "#f3e8ff", borderRadius: 16, minWidth: 128, boxShadow: "0 4px 14px #bfdbfe80", color: "#3730a3"
                    }}>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: 26 }}>{i===0?"📱": i===1?"💻": i===2?"🏠": i===3?"🔋":"🧩"}</span>
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</span>
                      </div>
                      <div style={{ fontSize: 22 }}>{t.value}</div>
                    </div>
                  ))}
                </div>

                <blockquote className="blockquote mt-3 text-center" style={{ color: "#6366f1", fontWeight: 600 }}>
                  "Management is efficiency in climbing the ladder of success; leadership determines whether the ladder is leaning against the right wall." <br /> <span className="blockquote-footer"><cite>Stephen Covey</cite></span>
                </blockquote>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card p-4 mb-4 mt-1" style={{ borderRadius: 18, boxShadow: "0 8px 30px #bbf7d0a1" }}>
                <h6 style={{ fontWeight: 700 }}>Quick Management</h6>
                <div className="d-grid gap-2 my-3">
                  <button onClick={() => navigate("/admin/dashboard")} className="btn btn-primary">Go to Admin Dashboard</button>
                  <button onClick={() => navigate("/admin/users")} className="btn btn-info">Manage Users & Staff</button>
                  <button onClick={() => navigate("/admin/issues")} className="btn btn-warning">Reported Issues</button>
                  <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
                </div>
                <div className="text-center mt-2 small text-muted">{message}</div>

                <div className="mt-3" style={{ borderTop: '1px solid #eef7f0', paddingTop: 12 }}>
                  <h6 style={{ fontWeight: 800 }}>Staff Performance</h6>
                  <div className="small text-muted mb-2">Select a pickup staff to see how many requests they received and completed.</div>

                  <select className="form-select mb-2" value={selectedStaffKey || ''} onChange={(e) => setSelectedStaffKey(e.target.value)}>
                    {staffList.length === 0 && <option value="">No staff found</option>}
                    {staffList.map(s => (
                      <option key={s.key} value={s.key}>{s.label} — received: {s.received} • completed: {s.completed}</option>
                    ))}
                  </select>

                  <div className="d-flex gap-2 mb-2">
                    <div style={{ flex: 1 }}>
                      <div className="small text-muted">Received</div>
                      <div style={{ fontWeight: 800, fontSize: 20 }}>{selectedStaffStats.received}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="small text-muted">Completed</div>
                      <div style={{ fontWeight: 800, fontSize: 20 }}>{selectedStaffStats.completed}</div>
                    </div>
                  </div>

                  <div style={{ height: 160 }} className="mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedStaffPickupData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="pickups" stroke="#34d399" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="d-grid">
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>Manage Staff</button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- PICKUP view ---------------- */

  if (userRole === 'ROLE_PICKUP') {
    const completedLifetime = stats.completedLifetime || 0;
    const active = stats.active || 0;

    return (
      <div style={{ background: "linear-gradient(120deg,#f0fff4,#a7f3d0 90%)", minHeight: "100vh" }}>
        {renderQuickMenu()}
        <div className="container py-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div style={{
              width: 68, height: 68, borderRadius: "18px",
              background: "linear-gradient(135deg,#a7f3d0,#38bdf8 102%)",
              display: "grid", placeItems: "center", fontWeight: 900, fontSize: 23, color: "#065f46"
            }}>{initials(profile.name)}</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 24, color: "#059669" }}>PICKUP DISPATCH</div>
              <div style={{ fontSize: 13, color: "#155e75" }}>{profile.name} • {profile.email}</div>
              <span className="badge bg-success px-2 py-1 mt-1 fw-bold">Pickup Team</span>
            </div>
            <div style={{ marginLeft: 'auto' }} className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => navigate('/report-issue')}>Report</button>
              <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <div className="d-flex gap-3 flex-wrap mb-3">
            <PickupStat icon="🗂" name="Total Received" count={stats.total} />
            <PickupStat icon="📥" name="Remaining / Active" count={active} />
            <PickupStat icon="✅" name="Completed (lifetime)" count={completedLifetime} />
            <PickupStat icon="⏳" name="Pending" count={stats.pending || 0} />
          </div>

          <div style={{ background: '#ffffff', borderRadius: 10, padding: 12, marginBottom: 12, boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800 }}>Snapshot</div>
                <div style={{ color: '#475569' }}>Total Received = Completed (lifetime) + Remaining (active)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 20 }}>{stats.total}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Total requests seen</div>
              </div>
            </div>
          </div>

          <div className="card p-4 mb-4" style={{
            borderRadius: 18, boxShadow: "0 8px 30px #a7f3d088"
          }}>
            <h6 style={{ fontWeight: 700, color: "#047857" }}>Pickups - Past Week (Live)</h6>

            {(pickupData && pickupData.some(d => d.pickups > 0)) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pickupData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pickups" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : ((stats.completedLifetime || 0) + (stats.active || 0) > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: stats.completedLifetime || 0, color: '#63E58B' },
                        { name: 'Active', value: stats.active || 0, color: '#74C0FC' }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      <Cell fill="#63E58B" />
                      <Cell fill="#74C0FC" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#065f46' }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>No pickup history yet</div>
                <div style={{ marginTop: 8, color: '#4b5563' }}>Complete pickups in Assigned Tasks to populate this chart.</div>
                <blockquote style={{ marginTop: 12, borderLeft: '4px solid #d1fae5', paddingLeft: 12, color: '#0b3b2e' }}>
                  "Delivering a greener future, one pickup at a time."
                </blockquote>
              </div>
            ))}

            <div className="mt-3 text-muted small">
              Tip: complete pickups in the Assigned Tasks page to update these stats.
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-info mb-1" onClick={() => navigate("/pickup/dashboard")}>View Assigned Tasks</button>
              <button className="btn btn-outline-secondary" onClick={() => navigate('/report-issue')}>Report</button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ---------------- USER view ---------------- */

  const userPieData = [
    { name: 'Pending', value: stats.pending, color: '#FEA82F' },
    { name: 'Approved', value: stats.approved, color: '#7388FE' },
    { name: 'Scheduled', value: stats.scheduled, color: '#63E58B' },
    { name: 'Completed', value: stats.completed, color: '#13D6B7' },
    { name: 'Rejected', value: stats.rejected, color: '#D6478D' }
  ];

  return (
    <div style={{
      background: "radial-gradient(circle at 15% 10%, #c7f9e5 12%, #f0fff4 40%, transparent 70%), linear-gradient(180deg,#ffffff 0%,#f0fff4 100%)",
      minHeight: "100vh", fontFamily: "Inter, system-ui", color: "#14532d"
    }}>
      {renderQuickMenu()}

      <div className="container" style={{ maxWidth: 1330 }}>
        <div className="d-flex align-items-center gap-3 mt-1 mb-3">
          <div style={{
            width: 62, height: 62, borderRadius: 16, background: "linear-gradient(115deg, #a7f3d0,#38bdf8 102%)",
            display: "grid", placeItems: "center", fontWeight: 900, fontSize: 20, color: "#14532d"
          }}>EW</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#065f46" }}>ECO WASTE DASHBOARD</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{profile.name} • {profile.email}</div>
          </div>
        </div>

        <div className="row mb-3 g-3">
          <div className="col-12 col-md-2"><StatCard color="#bbf7d0" title="Total" value={stats.total} icon="🗂" footer="All requests" /></div>
          <div className="col-12 col-md-2"><StatCard color="#ffe4a6" title="Pending" value={stats.pending} icon="⏳" footer="Awaiting review" /></div>
          <div className="col-12 col-md-2"><StatCard color="#cfe8ff" title="Approved" value={stats.approved} icon="✅" footer="Ready for pickup" /></div>
          <div className="col-12 col-md-2"><StatCard color="#c6f6e9" title="Scheduled" value={stats.scheduled} icon="📅" footer="Pickup scheduled" /></div>
          <div className="col-12 col-md-2"><StatCard color="#fecdd3" title="Rejected" value={stats.rejected} icon="❌" footer="Not accepted" /></div>
          <div className="col-12 col-md-2"><StatCard color="#a7f3d0" title="Completed" value={stats.completed} icon="🎉" footer="Processed" /></div>
        </div>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <button className="btn" style={{
            background: "#d1fae5", color: "#134e4a", fontWeight: 900, fontSize: 19, borderRadius: 14, padding: "16px 28px", boxShadow: "0 6px 22px #e4f4ee88"
          }} onClick={() => navigate("/submit")}><span>📤</span> Submit Request</button>
          <button className="btn" style={{
            background: "#dbeafe", color: "#184e8b", fontWeight: 900, fontSize: 19, borderRadius: 14, padding: "16px 28px", boxShadow: "0 6px 22px #e4f4ee88"
          }} onClick={() => navigate("/requests")}><span>📋</span> View Requests</button>
          <button className="btn" style={{
            background: "#c4b5fd", color: "#3730a3", fontWeight: 900, fontSize: 19, borderRadius: 14, padding: "16px 28px", boxShadow: "0 6px 22px #e4f4ee88"
          }} onClick={() => navigate("/report")}><span>📈</span> Contribution Report</button>
        </div>

        <div className="row mt-4 mb-3">
          <div className="col-md-7">
            <div className="card mb-4 p-4" style={{
              borderRadius: 16, background: "#f0fff4", boxShadow: "0 4px 18px #d1fae5a6"
            }}>
              <h5 style={{ fontWeight: 800, color: "#065f46" }}>Request Status Breakdown (Live)</h5>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {userPieData.map((entry, index) => (
                      <Cell key={`cell-user-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <blockquote className="blockquote mt-3 text-center" style={{ color: "#059669", fontWeight: 600 }}>
                "The greatest threat to our planet is the belief that someone else will save it." <br /> <span className="blockquote-footer"><cite>Robert Swan</cite></span>
              </blockquote>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card p-4 mb-4 mt-1" style={{ borderRadius: 18, boxShadow: "0 8px 30px #bbf7d0a1" }}>
              <h6 style={{ fontWeight: 700, color: "#184e8b" }}>Be an Eco-Champion</h6>
              <div className="small text-muted">Join us in the journey to reduce, reuse, and recycle e-waste. Your actions create real community impact!</div>
              <div className="d-grid gap-2 my-3">
                <button className="btn btn-success" onClick={() => navigate("/submit")}>Submit New Request</button>
                <button className="btn btn-info" onClick={() => navigate("/report")}>View Your Eco Impact</button>
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
              </div>
              <div className="text-center mt-2 small text-muted">{message}</div>
            </div>
          </div>
        </div>

        {/* Chatbot (closed by default) */}
        <div className="row mb-4">
          <div className="col-12">
            <div
              className="card p-4"
              style={{
                borderRadius: 18,
                background: "#ecfdf5",
                boxShadow: "0 10px 40px rgba(16,185,129,0.18)",
                border: "1px solid #bbf7d0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h5
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: "#065f46",
                    }}
                  >
                    Eco-Waste AI Chatbot
                  </h5>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#166534",
                      fontSize: 13,
                    }}
                  >
                    Ask me anything about e-waste or your account.
                  </p>
                </div>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => setShowChatbot(v => !v)}
                  style={{ fontWeight: 700, borderRadius: 10 }}
                >
                  {showChatbot ? 'Hide Chat' : 'Open Chat'}
                </button>
              </div>

              {showChatbot ? (
                <div
                  style={{
                    borderRadius: 14,
                    border: "1px solid #bbf7d0",
                    padding: 8,
                    background: "#f0fdf4",
                    maxHeight: 420,
                    overflow: "hidden",
                  }}
                >
                  <ChatbotComponent />
                </div>
              ) : (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: "1px dashed #bbf7d0",
                    background: "#f0fdf4",
                    textAlign: "center",
                    fontSize: 13,
                    color: "#166534",
                  }}
                >
                  Chat is closed. Click <strong>Open Chat</strong> to start a conversation.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Profile Drawer */}
      {drawerOpen && (
        <div>
          <div onClick={() => setDrawerOpen(false)} style={{
            position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
            background: "rgba(12,180,119,0.14)", zIndex: 1299
          }} />
          <aside style={{
            position: "fixed", right: 22, top: 28, bottom: 28, width: 380, maxWidth: "94vw",
            background: "#fff", padding: 27, borderRadius: 16,
            boxShadow: "0 30px 80px #a7f3d0af", zIndex: 1300
          }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: 72, height: 72, borderRadius: 14, background: "#ecfeff",
                  display: "grid", placeItems: "center", fontWeight: 900, fontSize: 22, color: "#064e3b"
                }}>{initials(profile.name)}</div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22 }}>{profile.name}</div>
                  <div className="small text-muted">{profile.email}</div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close" style={{
                background: "none", border: "none", fontSize: 22, cursor: "pointer"
              }}>✕</button>
            </div>
            <div className="mt-2 text-muted mb-1">Edit your details below.</div>
            {showUpdateForm ? (
              <form onSubmit={handleUpdateSubmit}>
                <input name="name" value={updateFormData.name || ''} onChange={handleUpdateChange} className="form-control mb-2" placeholder="Name" required />
                <input name="phone" value={updateFormData.phone || ''} onChange={handleUpdateChange} className="form-control mb-2" placeholder="Phone" />
                <input name="address" value={updateFormData.address || ''} onChange={handleUpdateChange} className="form-control mb-3" placeholder="Address" />
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateForm(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-warning" onClick={() => setShowUpdateForm(true)}>Edit Profile</button>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                <button className="btn btn-light" style={{ border: "1px solid #dbefe5" }} onClick={() => setDrawerOpen(false)}>Close Profile</button>
                <button className="btn btn-outline-secondary mt-2" onClick={() => navigate('/report-issue')}>Report</button>
              </div>
            )}
            <div className="mt-3 text-muted small">{message}</div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Profile;
