import React, { useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaRupeeSign } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import '../../assets/styles/revenue.css';
import BarChart from '../../components/BarChart';
import LineChart from '../../components/LineChart';
import Loader from '../../components/Loader';
import NoData from '../../components/NoData';
import { getRevenueRequest } from '../../store/slice/revenue.slice';

function Revenue() {
    const dispatch = useDispatch();
    const { loading, error, summary, weeklyTrend, monthlyTrend, hotelBreakdown } = useSelector(
        (state) => state.revenue
    );

    useEffect(() => {
        dispatch(getRevenueRequest());
    }, [dispatch]);

    const cards = [
        { key: 'today', title: 'Today Revenue', icon: FaRupeeSign },
        { key: 'week', title: 'Week Revenue', icon: FaChartLine },
        { key: 'month', title: 'Month Revenue', icon: FaCalendarAlt },
        { key: 'year', title: 'Year Revenue', icon: FaChartLine }
    ];

    const hotelChartData = (hotelBreakdown || []).map((item) => ({
        hotel: item.hotelName,
        value: item.revenue
    }));

    const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

    if (loading) return <Loader />;

    return (
        <div className="owner-revenue-page">
            <div className="heading-container owner-page-heading">
                <h4 className="text-center text-white m-0">Revenue Analytics</h4>
            </div>

            {error ? (
                <div className="alert alert-danger">{error}</div>
            ) : (
                <>
                    <div className="revenue-summary-grid">
                        {cards.map(({ key, title, icon: Icon }) => (
                            <article className={`revenue-summary-card revenue-card-${key}`} key={key}>
                                <div className="revenue-card-icon"><Icon /></div>
                                <div className="revenue-card-copy">
                                    <span>{title}</span>
                                    <strong>{formatCurrency(summary?.[key])}</strong>
                                </div>
                            </article>
                        ))}
                    </div>

                    <section className="revenue-chart-card revenue-chart-wide">
                        <div className="revenue-section-heading">
                            <div>
                                <small>PERFORMANCE</small>
                                <h5>Weekly Revenue Trend</h5>
                            </div>
                        </div>
                        <div className="revenue-chart-body">
                            {weeklyTrend?.[0]?.data?.length ? (
                                <LineChart data={weeklyTrend} xLabel="Day" yLabel="Revenue" />
                            ) : <NoData />}
                        </div>
                    </section>

                    <div className="revenue-secondary-grid">
                        <section className="revenue-chart-card">
                            <div className="revenue-section-heading"><h5>Yearly Revenue by Month</h5></div>
                            <div className="revenue-chart-body">
                                {monthlyTrend?.length ? (
                                    <BarChart keys={['value']} index="month" data={monthlyTrend} xlabel="month" ylabel="Revenue" />
                                ) : <NoData />}
                            </div>
                        </section>
                        <section className="revenue-chart-card">
                            <div className="revenue-section-heading"><h5>Hotel-wise Revenue</h5></div>
                            <div className="revenue-chart-body">
                                {hotelChartData.length ? (
                                    <BarChart keys={['value']} index="hotel" data={hotelChartData} xlabel="hotel" ylabel="Revenue" />
                                ) : <NoData />}
                            </div>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}

export default Revenue;
