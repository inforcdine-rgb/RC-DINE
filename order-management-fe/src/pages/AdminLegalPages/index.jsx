import React, { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import Loader from '../../components/Loader';
import * as legalPageService from '../../services/legalPage.service';
import './style.css';

const PAGE_OPTIONS = [
    { slug: 'privacy', label: 'Privacy Policy' },
    { slug: 'terms', label: 'Terms & Conditions' }
];

const EMPTY_PAGE = {
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true
};

export default function AdminLegalPages() {
    const [activeSlug, setActiveSlug] = useState('privacy');
    const [page, setPage] = useState(EMPTY_PAGE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const loadPage = async () => {
            setLoading(true);

            try {
                const response = await legalPageService.getAdmin(activeSlug);
                if (active) setPage(response);
            } catch (error) {
                toast.error(error.message);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadPage();

        return () => {
            active = false;
        };
    }, [activeSlug]);

    const change = (event) => {
        const { name, type, checked, value } = event.target;
        setPage((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            const response = await legalPageService.update(activeSlug, {
                title: page.title,
                content: page.content,
                metaTitle: page.metaTitle,
                metaDescription: page.metaDescription,
                isPublished: page.isPublished
            });
            setPage(response);
            toast.success(`${page.title} saved`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="admin-legal-page m-4">
            <div className="heading-container mb-4">
                <h4 className="text-center text-white pt-4 m-0">Privacy & Terms Management</h4>
            </div>

            <div className="admin-legal-tabs">
                {PAGE_OPTIONS.map((option) => (
                    <button
                        type="button"
                        key={option.slug}
                        className={activeSlug === option.slug ? 'active' : ''}
                        onClick={() => setActiveSlug(option.slug)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <Loader />
            ) : (
                <Card className="admin-legal-card p-4">
                    <Form onSubmit={save}>
                        <Form.Group className="mb-3">
                            <Form.Label>Page title</Form.Label>
                            <Form.Control
                                name="title"
                                value={page.title || ''}
                                onChange={change}
                                maxLength={180}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Page content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={18}
                                name="content"
                                value={page.content || ''}
                                onChange={change}
                                required
                            />
                            <Form.Text>Headings and paragraphs can be separated using blank lines.</Form.Text>
                        </Form.Group>

                        <div className="admin-legal-meta-grid">
                            <Form.Group className="mb-3">
                                <Form.Label>Meta title</Form.Label>
                                <Form.Control
                                    name="metaTitle"
                                    value={page.metaTitle || ''}
                                    onChange={change}
                                    maxLength={180}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Meta description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="metaDescription"
                                    value={page.metaDescription || ''}
                                    onChange={change}
                                    maxLength={320}
                                />
                            </Form.Group>
                        </div>

                        <Form.Check
                            className="mb-4"
                            type="switch"
                            name="isPublished"
                            label="Publicly published"
                            checked={Boolean(page.isPublished)}
                            onChange={change}
                        />

                        <div className="admin-legal-actions">
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Legal Page'}
                            </Button>
                            <a href={`/${activeSlug}`} target="_blank" rel="noreferrer">
                                Preview public page
                            </a>
                        </div>
                    </Form>
                </Card>
            )}
        </div>
    );
}
