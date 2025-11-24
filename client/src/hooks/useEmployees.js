// client/src/hooks/useEmployees.js
import { useEffect, useRef, useState, useCallback } from 'react';
import * as api from '../api/employee.api';
import dayjs from 'dayjs';

const UI_KEY = 'employee_admin_ui_v1';

function loadUI() {
  try { return JSON.parse(localStorage.getItem(UI_KEY) || '{}'); } catch { return {}; }
}
function saveUI(state) {
  try { localStorage.setItem(UI_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export default function useEmployees() {
  const saved = loadUI();

  // data
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // UI state
  const [page, setPage] = useState(saved.page || 1);
  const [limit, setLimit] = useState(saved.limit || 10);
  const [search, setSearch] = useState(saved.search || '');
  const [department, setDepartment] = useState(saved.department || undefined);
  const [status, setStatus] = useState(saved.status || undefined);
  const [dateFrom, setDateFrom] = useState(saved.dateFrom || undefined);
  const [dateTo, setDateTo] = useState(saved.dateTo || undefined);
  const [showArchived, setShowArchived] = useState(saved.showArchived || false);
  const [sortField, setSortField] = useState(saved.sortField || undefined);
  const [sortOrder, setSortOrder] = useState(saved.sortOrder || undefined);

  // persist UI state whenever it changes
  useEffect(() => {
    saveUI({ page, limit, search, department, status, dateFrom, dateTo, showArchived, sortField, sortOrder });
  }, [page, limit, search, department, status, dateFrom, dateTo, showArchived, sortField, sortOrder]);

  // debounce search
  const searchRef = useRef('');
  useEffect(() => {
    const t = setTimeout(() => { searchRef.current = search; fetchList(1); }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, department, status, dateFrom, dateTo, showArchived, limit, sortField, sortOrder]);

  // fetch cancellation guard
  const fetchIdRef = useRef(0);

  const fetchList = useCallback(async (pageToFetch = page) => {
    setLoading(true);
    const id = ++fetchIdRef.current;
    try {
      const q = {
        q: searchRef.current || undefined,
        department,
        status,
        dateFrom,
        dateTo,
        showArchived,
        page: pageToFetch,
        limit,
        sortField,
        sortOrder
      };
      const resp = await api.listEmployees(q); // returns { items, total, page, limit }
      if (fetchIdRef.current !== id) return; // stale
      setList(resp.items || []);
      setTotal(resp.total || 0);
      setPage(resp.page || pageToFetch);
    } catch (err) {
      console.error('fetchList error', err);
    } finally {
      if (fetchIdRef.current === id) setLoading(false);
    }
  }, [page, limit, department, status, dateFrom, dateTo, showArchived, sortField, sortOrder]);

  // initial load & when page changes
  useEffect(() => { fetchList(page); }, [fetchList, page]);

  // CRUD wrappers that re-fetch after mutation
  async function create(payload) {
    await api.createEmployee(payload);
    // go back to first page to surface new item
    await fetchList(1);
  }
  async function update(id, payload) {
    await api.updateEmployee(id, payload);
    await fetchList(page);
  }
  async function archive(id) {
    await api.archiveEmployee(id);
    await fetchList(page);
  }
  async function restore(id) {
    await api.restoreEmployee(id);
    await fetchList(page);
  }
  async function getOne(id) {
    return api.getEmployee(id);
  }

  return {
    // data
    list, total, loading,

    // pagination & UI
    page, setPage, limit, setLimit,
    search, setSearch, department, setDepartment, status, setStatus,
    dateFrom, setDateFrom, dateTo, setDateTo, showArchived, setShowArchived,
    sortField, setSortField, sortOrder, setSortOrder,

    // actions
    fetchList,
    create, update, archive, restore, getOne
  };
}
