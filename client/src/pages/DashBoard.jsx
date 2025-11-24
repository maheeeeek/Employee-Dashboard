// client/src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Layout, Button, Space, message, Row, Col, Card, Progress, Empty } from 'antd';
import useEmployees from '../hooks/useEmployees';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeDrawer from '../components/EmployeeDrawer';
import dayjs from 'dayjs';

const { Header, Content } = Layout;

export default function Dashboard({ onLogout } = {}) {
  const emp = useEmployees();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'

  const openAdd = () => { setActive(null); setDrawerOpen(true); };
  const openEdit = (record) => { setActive(record); setDrawerOpen(true); };

  const handleSave = async (payload, keepOpen = false) => {
    setSaving(true);
    try {
      if (active && (active._id || active.id)) {
        const id = active._id || active.id;
        await emp.update(id, payload);
        message.success('Employee updated');
      } else {
        await emp.create(payload);
        message.success('Employee created');
      }
      if (!keepOpen) setDrawerOpen(false);
      if (!keepOpen) setActive(null);
    } catch (err) {
      console.error('save error', err);
      message.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const actions = {
    onEdit: (r) => openEdit(r),
    onArchive: async (id) => { await emp.archive(id); message.success('Archived'); },
    onRestore: async (id) => { await emp.restore(id); message.success('Restored'); },
    toggleView: () => setViewMode(v => v === 'table' ? 'card' : 'table')
  };

  // card view rendering
  const renderCards = () => {
    if ((!emp.list || emp.list.length === 0) && !emp.loading) {
      return <Empty description="No employees found matching your criteria" />;
    }
    return (
      <Row gutter={[16,16]}>
        {emp.list.map(e => (
          <Col xs={24} sm={12} md={8} lg={6} key={e._id || e.id}>
            <Card title={e.name} extra={<a onClick={() => openEdit(e)}>Edit</a>}>
              <p><strong>{e.role}</strong></p>
              <p>{e.email}</p>
              <p>{e.department}</p>
              <p>Joined: {dayjs(e.joiningDate).format('YYYY-MM-DD')}</p>
              <Progress percent={e.performanceScore || 0} />
              <div style={{ marginTop: 8 }}>
                {e.isArchived ? (
                  <Button onClick={() => actions.onRestore(e._id || e.id)}>Restore</Button>
                ) : (
                  <Button danger onClick={() => actions.onArchive(e._id || e.id)}>Archive</Button>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
        <div style={{ fontSize: 18 }}>Employee Admin Panel</div>
        <Space>
          <Button onClick={() => setViewMode(v => v === 'table' ? 'card' : 'table')}>{viewMode === 'table' ? 'Card View' : 'Table View'}</Button>
          <Button type="primary" onClick={openAdd}>Add Employee</Button>
          {onLogout && <Button onClick={onLogout}>Logout</Button>}
        </Space>
      </Header>

      <Content style={{ padding: 20 }}>
        {viewMode === 'table' ? (
          <EmployeeTable
            employees={emp.list}
            total={emp.total}
            loading={emp.loading}
            ui={{
              page: emp.page, setPage: emp.setPage,
              limit: emp.limit, setLimit: emp.setLimit,
              search: emp.search, setSearch: emp.setSearch,
              department: emp.department, setDepartment: emp.setDepartment,
              status: emp.status, setStatus: emp.setStatus,
              dateFrom: emp.dateFrom, setDateFrom: emp.setDateFrom,
              dateTo: emp.dateTo, setDateTo: emp.setDateTo,
              showArchived: emp.showArchived, setShowArchived: emp.setShowArchived,
              sortField: emp.sortField, setSortField: emp.setSortField,
              sortOrder: emp.sortOrder, setSortOrder: emp.setSortOrder
            }}
            actions={actions}
          />
        ) : (
          renderCards()
        )}
      </Content>

      <EmployeeDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setActive(null); }}
        initial={active}
        onSave={handleSave}
        loading={saving}
      />
    </Layout>
  );
}
