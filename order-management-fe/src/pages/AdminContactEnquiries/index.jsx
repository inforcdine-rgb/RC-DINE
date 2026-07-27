import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Modal, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';

import Loader from '../../components/Loader';
import * as contactService from '../../services/contactEnquiry.service';
import './style.css';

const statuses = ['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'];

export default function AdminContactEnquiries() {
    const [data, setData] = useState({
        enquiries: [],
        total: 0,
        page: 1,
        totalPages: 1
    });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');

    const load = useCallback(
        async (page = 1) => {
            setLoading(true);

            try {
                const response = await contactService.getEnquiries({
                    page,
                    limit: 20,
                    status,
                    search
                });
                setData(response);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        },
        [search, status]
    );

    useEffect(() => {
        load(1);
    }, [load]);

    const openEnquiry = (item) => {
        setSelected({ ...item });
        setNotes(item.adminNotes || '');
    };

    const closeModal = () => {
        setSelected(null);
        setNotes('');
    };

    const save = async () => {
        if (!selected) return;

        try {
            const updated = await contactService.updateEnquiry(selected.id, {
                status: selected.status,
                adminNotes: notes
            });

            setData((current) => ({
                ...current,
                enquiries: current.enquiries.map((item) => (item.id === updated.id ? updated : item))
            }));
            closeModal();
            toast.success('Enquiry updated');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="admin-enquiries m-4">
            <div className="heading-container mb-4">
                <h4 className="text-center text-white pt-4 m-0">Contact Enquiries</h4>
            </div>

            <Card className="p-3 mb-3">
                <div className="enquiry-filters">
                    <Form.Control
                        placeholder="Search name, mobile, email or restaurant"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="">All statuses</option>
                        {statuses.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </Form.Select>
                    <Button onClick={() => load(1)}>Search</Button>
                </div>
            </Card>

            {loading ? (
                <Loader />
            ) : (
                <Card className="p-3">
                    <div className="table-responsive">
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Restaurant</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.enquiries.length ? (
                                    data.enquiries.map((item) => (
                                        <tr key={item.id}>
                                            <td>{new Date(item.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td>
                                                {item.name}
                                                <small className="d-block text-muted">{item.email || 'No email'}</small>
                                            </td>
                                            <td>
                                                <a href={`tel:${item.mobile}`}>{item.mobile}</a>
                                            </td>
                                            <td>{item.restaurantName || '—'}</td>
                                            <td>
                                                <span className={`enquiry-status ${item.status.toLowerCase()}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Button size="sm" onClick={() => openEnquiry(item)}>
                                                    Open
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            No enquiries found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    <div className="enquiry-pagination">
                        <Button disabled={data.page <= 1} onClick={() => load(data.page - 1)}>
                            Previous
                        </Button>
                        <span>
                            Page {data.page} of {data.totalPages} · {data.total} enquiries
                        </span>
                        <Button disabled={data.page >= data.totalPages} onClick={() => load(data.page + 1)}>
                            Next
                        </Button>
                    </div>
                </Card>
            )}

            <Modal show={Boolean(selected)} onHide={closeModal} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Enquiry Details</Modal.Title>
                </Modal.Header>

                {selected && (
                    <Modal.Body>
                        <div className="enquiry-detail-grid">
                            <p>
                                <strong>Name</strong>
                                {selected.name}
                            </p>
                            <p>
                                <strong>Mobile</strong>
                                {selected.mobile}
                            </p>
                            <p>
                                <strong>Email</strong>
                                {selected.email || '—'}
                            </p>
                            <p>
                                <strong>Restaurant</strong>
                                {selected.restaurantName || '—'}
                            </p>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Customer message</Form.Label>
                            <Form.Control as="textarea" rows={5} value={selected.message} readOnly />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={selected.status}
                                onChange={(event) =>
                                    setSelected((current) => ({
                                        ...current,
                                        status: event.target.value
                                    }))
                                }
                            >
                                {statuses.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Admin notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                            />
                        </Form.Group>
                    </Modal.Body>
                )}

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                    <Button onClick={save}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
