// client/src/components/EmployeeDrawer.jsx
import React, { useEffect } from 'react';
import { Drawer, Form, Input, Select, DatePicker, Button, message, InputNumber } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

export default function EmployeeDrawer({ open, onClose, initial = null, onSave, loading = false }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (initial) {
      form.setFieldsValue({
        ...initial,
        joiningDate: initial.joiningDate ? dayjs(initial.joiningDate) : null,
        performanceScore: initial.performanceScore ?? undefined
      });
    } else {
      form.resetFields();
    }
  }, [initial, form, open]);

  const handleFinish = async (values, keepOpen = false) => {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        department: values.department,
        role: values.role,
        joiningDate: values.joiningDate.toISOString(),
        status: values.status,
        performanceScore: values.performanceScore ?? Math.floor(Math.random() * 50) + 50,
        isArchived: initial?.isArchived || false
      };
      await onSave(payload, keepOpen);
      // success message is shown by caller usually; duplicate is fine
      if (!keepOpen) {
        message.success('Saved');
      } else {
        message.success('Saved — you can continue editing');
      }
      if (!keepOpen) onClose();
      else if (!initial) form.resetFields(); // if adding & keepOpen, clear form
    } catch (err) {
      console.error('Save error', err);
      message.error(err?.response?.data?.message || 'Save failed');
    }
  };

  return (
    <Drawer
      title={initial ? 'Edit Employee' : 'Add Employee'}
      width={520}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={(v) => handleFinish(v, false)}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="Full name" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
          <Input placeholder="email@example.com" />
        </Form.Item>

        <Form.Item name="department" label="Department" rules={[{ required: true }]}>
          <Select placeholder="Select department">
            <Option value="Engineering">Engineering</Option>
            <Option value="Product">Product</Option>
            <Option value="Design">Design</Option>
            <Option value="HR">HR</Option>
            <Option value="Finance">Finance</Option>
          </Select>
        </Form.Item>

        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item
          name="joiningDate"
          label="Joining Date"
          rules={[
            { required: true, message: 'Joining date required' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) return Promise.resolve();
                if (value.isAfter(dayjs())) return Promise.reject(new Error('Joining date cannot be in the future'));
                return Promise.resolve();
              }
            })
          ]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
            <Option value="On Leave">On Leave</Option>
          </Select>
        </Form.Item>

        <Form.Item name="performanceScore" label="Performance Score (0-100)">
          <InputNumber min={0} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={() => form.submit()} loading={loading}>Save</Button>
          <Button
            type="primary"
            onClick={() => form.validateFields().then(vals => handleFinish(vals, true))}
            loading={loading}
          >
            Save & Continue Editing
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}
