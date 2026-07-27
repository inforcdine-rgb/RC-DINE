import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Loader from '../../components/Loader';
import * as legalPageService from '../../services/legalPage.service';
import { setPageSeo } from '../../utils/seo';
import './style.css';

const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
};

export default function LegalPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const slug = location.pathname === '/terms' ? 'terms' : 'privacy';
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadPage = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setPage(await legalPageService.getPublic(slug));
        } catch (requestError) {
            setError(requestError?.message || 'Unable to load this page.');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    useEffect(() => {
        if (!page) return;
        setPageSeo({
            title: page.metaTitle || `${page.title} – RC Dine`,
            description: page.metaDescription || `Read the RC Dine ${page.title}.`
        });
    }, [page]);

    if (loading) return <Loader />;

    return (
        <div className="legal-public-page">
            <header className="legal-public-header">
                <button type="button" onClick={() => navigate('/')}>
                    ← RC Dine
                </button>
            </header>
            <main className="legal-public-card">
                {error ? (
                    <div className="legal-public-error">
                        <h1>Page unavailable</h1>
                        <p>{error}</p>
                        <div className="legal-public-actions">
                            <button type="button" onClick={loadPage}>
                                Retry
                            </button>
                            <button type="button" onClick={() => navigate('/')}>
                                Return Home
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <span className="legal-public-tag">RC DINE LEGAL</span>
                        <h1>{page?.title}</h1>
                        <p className="legal-public-updated">Last updated: {formatDate(page?.lastUpdatedAt)}</p>
                        <div className="legal-public-content">{page?.content}</div>
                    </>
                )}
            </main>
        </div>
    );
}
