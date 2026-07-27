import React, { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import * as websiteService from '../../services/websiteSettings.service';
import './style.css';

const empty = {
    heroTitle: '',
    heroDescription: '',
    primaryButtonText: '',
    secondaryButtonText: '',
    videoEnabled: true,
    isPublished: true
};
export default function AdminLandingSettings() {
    const [settings, setSettings] = useState(empty);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logo, setLogo] = useState(null);
    const [video, setVideo] = useState(null);
    const load = async () => {
        try {
            setSettings(await websiteService.getAdmin());
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    const change = (e) =>
        setSettings((s) => ({
            ...s,
            [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
        }));
    const saveContent = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            setSettings(await websiteService.update(settings));
            toast.success('Landing settings saved');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };
    const sendLogo = async () => {
        if (!logo) return toast.error('Select a logo');
        try {
            setSettings(await websiteService.uploadLogo(logo));
            setLogo(null);
            toast.success('Logo updated');
        } catch (e) {
            toast.error(e.message);
        }
    };
    const sendVideo = async () => {
        if (!video) return toast.error('Select a video');
        try {
            setSettings(await websiteService.uploadVideo(video));
            setVideo(null);
            toast.success('Video updated');
        } catch (e) {
            toast.error(e.message);
        }
    };
    const removeVideo = async () => {
        try {
            setSettings(await websiteService.deleteVideo());
            toast.success('Video removed');
        } catch (e) {
            toast.error(e.message);
        }
    };
    if (loading) return <Loader />;
    return (
        <div className="admin-landing-page m-4">
            <div className="heading-container mb-4">
                <h4 className="text-center text-white pt-4 m-0">Landing Page Management</h4>
            </div>
            <div className="admin-landing-grid">
                <Card className="p-4">
                    <h5>Branding & Media</h5>
                    {settings.logoUrl && (
                        <img className="admin-logo-preview" src={settings.logoUrl} alt="Landing logo" />
                    )}
                    <Form.Control
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => setLogo(e.target.files?.[0] || null)}
                    />
                    <Button className="mt-2" onClick={sendLogo}>
                        Upload Logo
                    </Button>
                    <hr />
                    {settings.heroVideoUrl && (
                        <video className="admin-video-preview" src={settings.heroVideoUrl} controls />
                    )}
                    <Form.Control
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    />
                    <div className="d-flex gap-2 mt-2">
                        <Button onClick={sendVideo}>Upload Video</Button>
                        {settings.heroVideoUrl && (
                            <Button variant="danger" onClick={removeVideo}>
                                Remove
                            </Button>
                        )}
                    </div>
                    <small className="text-muted mt-2">Maximum 40 MB. MP4 recommended.</small>
                </Card>
                <Card className="p-4">
                    <h5>Hero Content</h5>
                    <Form onSubmit={saveContent}>
                        <Form.Group className="mb-3">
                            <Form.Label>Hero title</Form.Label>
                            <Form.Control
                                name="heroTitle"
                                value={settings.heroTitle || ''}
                                onChange={change}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="heroDescription"
                                value={settings.heroDescription || ''}
                                onChange={change}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Primary button</Form.Label>
                            <Form.Control
                                name="primaryButtonText"
                                value={settings.primaryButtonText || ''}
                                onChange={change}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Secondary button</Form.Label>
                            <Form.Control
                                name="secondaryButtonText"
                                value={settings.secondaryButtonText || ''}
                                onChange={change}
                            />
                        </Form.Group>
                        <Form.Check
                            className="mb-2"
                            type="switch"
                            name="videoEnabled"
                            label="Enable background video"
                            checked={Boolean(settings.videoEnabled)}
                            onChange={change}
                        />
                        <Form.Check
                            className="mb-3"
                            type="switch"
                            name="isPublished"
                            label="Landing page published"
                            checked={Boolean(settings.isPublished)}
                            onChange={change}
                        />
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
