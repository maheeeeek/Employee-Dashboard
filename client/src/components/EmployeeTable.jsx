// client/src/components/EmployeeTable.jsx
import React, { useMemo } from 'react';
import { Table, Input, Row, Col, Select, DatePicker, Switch, Button, Space, Card, Progress, Empty } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function EmployeeTable({ employees, total, loading, ui, actions }) {
  // ui: the object returned from useEmployees that exposes state and setters
  const {
    page, setPage, limit, setLimit,
    search, setSearch, department, setDepartment, status, setStatus,
    dateFrom, setDateFrom, dateTo, setDateTo,
    showArchived, setShowArchived,
    sortField, setSortField, sortOrder, setSortOrder
  } = ui;

  // derive departments from the current list for the department dropdown (client-side)
  const departments = useMemo(() => Array.from(new Set((employees || []).map(e => e.department).filter(Boolean))), [employees]);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: true },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Department', dataIndex: 'department', key: 'department', sorter: true },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
      sorter: true,
      render: (d) => dayjs(d).format('YYYY-MM-DD')
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <span>{s}</span> },
    { title: 'Performance', dataIndex: 'performanceScore', key: 'performanceScore', render: p => <Progress percent={p || 0} size="small" /> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => actions.onEdit(record)}>Edit</Button>
          {record.isArchived ? (
            <Button type="link" onClick={() => actions.onRestore(record._id || record.id)}>Restore</Button>
          ) : (
            <Button danger type="link" onClick={() => actions.onArchive(record._id || record.id)}>Archive</Button>
          )}
        </Space>
      )
    }
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    // pagination
    if (pagination && pagination.current) setPage(pagination.current);
    if (pagination && pagination.pageSize) setLimit(pagination.pageSize);

    // sorting
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      setSortField(undefined);
      setSortOrder(undefined);
    }
  };

  const hasData = employees && employees.length > 0;

  return (
    <div>
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col flex="auto">
          <Input
            placeholder="Search name, email, department, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>

        <Col>
          <Select placeholder="Department" allowClear style={{ minWidth: 160 }} value={department} onChange={setDepartment}>
            {departments.map(d => <Select.Option key={d} value={d}>{d}</Select.Option>)}
          </Select>
        </Col>

        <Col>
          <Select placeholder="Status" allowClear style={{ minWidth: 140 }} value={status} onChange={setStatus}>
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
            <Select.Option value="On Leave">On Leave</Select.Option>
          </Select>
        </Col>

        <Col>
          <RangePicker
            value={dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : []}
            onChange={(vals) => {
              if (!vals || vals.length === 0) { setDateFrom(undefined); setDateTo(undefined); return; }
              setDateFrom(vals[0].toISOString());
              setDateTo(vals[1].toISOString());
            }}
          />
        </Col>

        <Col>
          <Space>
            <Switch checked={showArchived} onChange={setShowArchived} checkedChildren="Archived" unCheckedChildren="Active" />
            <Button onClick={() => {
              // toggle view mode: the Dashboard controls the actual view toggle logic (if needed)
              // For simplicity, if you want the table->card toggle here, lift state up and pass props.
              // We'll call actions.toggleView if provided.
              actions.toggleView?.();
            }}>
              Toggle View
            </Button>
          </Space>
        </Col>
      </Row>

      {!hasData && !loading ? (
        <Empty description="No employees found matching your criteria" />
      ) : (
        <Table
          rowKey={(r) => r._id || r.id}
          columns={columns}
          dataSource={employees}
          loading={loading}
          pagination={{ current: page, pageSize: limit, total }}
          onChange={handleTableChange}
        />
      )}
    </div>
  );
}
