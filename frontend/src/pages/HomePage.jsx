import { Page, Layout, Card, Text, BlockStack, Spinner, Box, InlineStack, Banner, Button, Divider } from '@shopify/polaris';
import { useEffect, useState } from 'react';
import {
    MegaphoneIcon,
    StarIcon,
    DiscountIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
} from '@shopify/polaris-icons';
import { fetchCampaigns, fetchReviews, fetchPromos } from '../services/api';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        campaigns: 0,
        activeCampaigns: 0,
        reviews: 0,
        pendingReviews: 0,
        approvedReviews: 0,
        rejectedReviews: 0,
        promosIssued: 0,
        averageRating: 0,
        promos: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentReviews, setRecentReviews] = useState([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const [campaignsRes, reviewsRes, promosRes] = await Promise.all([
                fetchCampaigns(),
                fetchReviews(),
                fetchPromos(),
            ]);

            const campaigns = campaignsRes.data.campaigns || [];
            const reviews = reviewsRes.data.reviews || [];
            const promos = promosRes.data.promos || [];

            // Calculate average rating
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

            // Get recent reviews (last 5)
            const sortedReviews = [...reviews].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 5);

            setStats({
                campaigns: campaigns.length,
                activeCampaigns: campaigns.filter(c => c.status === 'active').length,
                reviews: reviews.length,
                pendingReviews: reviews.filter(r => r.status === 'pending').length,
                approvedReviews: reviews.filter(r => r.status === 'approved').length,
                rejectedReviews: reviews.filter(r => r.status === 'rejected').length,
                promosIssued: reviews.filter(r => r.promoCode).length,
                averageRating: avgRating,
                promos: promos.length,
            });

            setRecentReviews(sortedReviews);
        } catch (error) {
            console.error("Error loading stats:", error);
            setError("Failed to load dashboard data. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0 || diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderStars = (rating) => {
        return (
            <InlineStack gap="050">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} as="span" tone={star <= rating ? 'warning' : 'subdued'}>
                        {star <= rating ? '★' : '☆'}
                    </Text>
                ))}
            </InlineStack>
        );
    };

    const StatCard = ({ title, value, subtitle, icon, tone = 'base' }) => (
        <Card>
            <Box padding="400">
                <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="start">
                        <Text as="p" tone="subdued" variant="bodySm">
                            {title}
                        </Text>
                        {icon && (
                            <Box>
                                <div style={{ color: tone === 'success' ? '#008060' : tone === 'warning' ? '#FFC453' : tone === 'critical' ? '#D72C0D' : '#202223' }}>
                                    {icon}
                                </div>
                            </Box>
                        )}
                    </InlineStack>
                    <Text as="p" variant="heading2xl" fontWeight="bold">
                        {value}
                    </Text>
                    {subtitle && (
                        <Text as="p" tone="subdued" variant="bodySm">
                            {subtitle}
                        </Text>
                    )}
                </BlockStack>
            </Box>
        </Card>
    );

    if (loading) {
        return (
            <Page title="Dashboard">
                <Box paddingBlockStart="800" paddingBlockEnd="800">
                    <InlineStack align="center" blockAlign="center">
                        <Spinner size="large" />
                    </InlineStack>
                </Box>
            </Page>
        );
    }

    const hasData = stats.campaigns > 0 || stats.reviews > 0 || stats.promos > 0;

    return (
        <Page
            title="Dashboard"
            subtitle="Overview of your review incentive campaigns"
            secondaryActions={[
                {
                    content: 'Refresh',
                    onAction: loadStats,
                },
            ]}
        >
            <Layout>
                {/* Error Banner */}
                {error && (
                    <Layout.Section>
                        <Banner status="critical" onDismiss={() => setError(null)}>
                            <p>{error}</p>
                        </Banner>
                    </Layout.Section>
                )}

                {/* Welcome Banner for New Users */}
                {!hasData && !loading && (
                    <Layout.Section>
                        <Card>
                            <Box padding="600">
                                <BlockStack gap="400">
                                    <Text variant="headingLg" as="h2" fontWeight="bold">
                                        Welcome to Review Incentive App! 🎉
                                    </Text>
                                    <Text as="p" variant="bodyLg" tone="subdued">
                                        Start incentivizing customer reviews with automated promo codes and extended warranties.
                                        Follow these steps to get started:
                                    </Text>
                                    <Divider />
                                    <BlockStack gap="300">
                                        <InlineStack gap="300" blockAlign="center">
                                            <Box>
                                                <div style={{
                                                    background: '#F1F2F4',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    1
                                                </div>
                                            </Box>
                                            <BlockStack gap="100">
                                                <Text as="p" variant="bodyMd" fontWeight="semibold">
                                                    Create a Promo Template
                                                </Text>
                                                <Text as="p" variant="bodySm" tone="subdued">
                                                    Set up discount codes or extended warranties to reward reviewers
                                                </Text>
                                            </BlockStack>
                                        </InlineStack>
                                        <InlineStack gap="300" blockAlign="center">
                                            <Box>
                                                <div style={{
                                                    background: '#F1F2F4',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    2
                                                </div>
                                            </Box>
                                            <BlockStack gap="100">
                                                <Text as="p" variant="bodyMd" fontWeight="semibold">
                                                    Launch a Campaign
                                                </Text>
                                                <Text as="p" variant="bodySm" tone="subdued">
                                                    Choose products and connect them with your promo template
                                                </Text>
                                            </BlockStack>
                                        </InlineStack>
                                        <InlineStack gap="300" blockAlign="center">
                                            <Box>
                                                <div style={{
                                                    background: '#F1F2F4',
                                                    borderRadius: '50%',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    3
                                                </div>
                                            </Box>
                                            <BlockStack gap="100">
                                                <Text as="p" variant="bodyMd" fontWeight="semibold">
                                                    Share & Collect Reviews
                                                </Text>
                                                <Text as="p" variant="bodySm" tone="subdued">
                                                    Share your campaign link with customers to start collecting reviews
                                                </Text>
                                            </BlockStack>
                                        </InlineStack>
                                    </BlockStack>
                                    <InlineStack gap="200">
                                        <Button variant="primary" onClick={() => navigate('/promos')}>
                                            Create First Promo
                                        </Button>
                                        <Button onClick={() => navigate('/campaigns')}>
                                            View Campaigns
                                        </Button>
                                    </InlineStack>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                )}

                {/* Stats Grid */}
                {hasData && (
                    <>
                        <Layout.Section>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h3">
                                    Overview
                                </Text>
                                <InlineStack gap="400" wrap={true}>
                                    <Box minWidth="200px">
                                        <StatCard
                                            title="Total Campaigns"
                                            value={stats.campaigns}
                                            subtitle={`${stats.activeCampaigns} active`}
                                            icon={<MegaphoneIcon />}
                                        />
                                    </Box>
                                    <Box minWidth="200px">
                                        <StatCard
                                            title="Total Reviews"
                                            value={stats.reviews}
                                            subtitle={stats.pendingReviews > 0 ? `${stats.pendingReviews} pending approval` : 'All caught up!'}
                                            icon={<StarIcon />}
                                            tone="warning"
                                        />
                                    </Box>
                                    <Box minWidth="200px">
                                        <StatCard
                                            title="Promo Codes Issued"
                                            value={stats.promosIssued}
                                            subtitle={`${stats.promos} promo template${stats.promos !== 1 ? 's' : ''}`}
                                            icon={<DiscountIcon />}
                                            tone="success"
                                        />
                                    </Box>
                                    <Box minWidth="200px">
                                        <StatCard
                                            title="Average Rating"
                                            value={stats.averageRating}
                                            subtitle={stats.reviews > 0 ? `Based on ${stats.reviews} review${stats.reviews !== 1 ? 's' : ''}` : 'No reviews yet'}
                                            icon={<StarIcon />}
                                            tone="warning"
                                        />
                                    </Box>
                                </InlineStack>
                            </BlockStack>
                        </Layout.Section>

                        {/* Review Status Breakdown */}
                        {stats.reviews > 0 && (
                            <Layout.Section>
                                <Card>
                                    <Box padding="400">
                                        <BlockStack gap="400">
                                            <Text variant="headingMd" as="h3">
                                                Review Status
                                            </Text>
                                            <InlineStack gap="600" wrap={true}>
                                                <InlineStack gap="200" blockAlign="center">
                                                    <div style={{ color: '#008060' }}>
                                                        <CheckCircleIcon />
                                                    </div>
                                                    <BlockStack gap="050">
                                                        <Text as="p" variant="headingLg" fontWeight="bold">
                                                            {stats.approvedReviews}
                                                        </Text>
                                                        <Text as="p" variant="bodySm" tone="subdued">
                                                            Approved
                                                        </Text>
                                                    </BlockStack>
                                                </InlineStack>
                                                <InlineStack gap="200" blockAlign="center">
                                                    <div style={{ color: '#FFC453' }}>
                                                        <ClockIcon />
                                                    </div>
                                                    <BlockStack gap="050">
                                                        <Text as="p" variant="headingLg" fontWeight="bold">
                                                            {stats.pendingReviews}
                                                        </Text>
                                                        <Text as="p" variant="bodySm" tone="subdued">
                                                            Pending
                                                        </Text>
                                                    </BlockStack>
                                                </InlineStack>
                                                <InlineStack gap="200" blockAlign="center">
                                                    <div style={{ color: '#D72C0D' }}>
                                                        <XCircleIcon />
                                                    </div>
                                                    <BlockStack gap="050">
                                                        <Text as="p" variant="headingLg" fontWeight="bold">
                                                            {stats.rejectedReviews}
                                                        </Text>
                                                        <Text as="p" variant="bodySm" tone="subdued">
                                                            Rejected
                                                        </Text>
                                                    </BlockStack>
                                                </InlineStack>
                                            </InlineStack>
                                        </BlockStack>
                                    </Box>
                                </Card>
                            </Layout.Section>
                        )}

                        {/* Recent Reviews */}
                        {recentReviews.length > 0 && (
                            <Layout.Section>
                                <Card>
                                    <Box padding="400">
                                        <BlockStack gap="400">
                                            <InlineStack align="space-between" blockAlign="center">
                                                <Text variant="headingMd" as="h3">
                                                    Recent Reviews
                                                </Text>
                                                <Button onClick={() => navigate('/reviews')}>
                                                    View All
                                                </Button>
                                            </InlineStack>
                                            <BlockStack gap="300">
                                                {recentReviews.map((review, index) => (
                                                    <Box key={review._id}>
                                                        {index > 0 && <Divider />}
                                                        <Box paddingBlockStart={index > 0 ? "300" : undefined}>
                                                            <BlockStack gap="200">
                                                                <InlineStack align="space-between" blockAlign="start">
                                                                    <BlockStack gap="100">
                                                                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                                                                            {review.customerName}
                                                                        </Text>
                                                                        <InlineStack gap="200" blockAlign="center">
                                                                            {renderStars(review.rating)}
                                                                            <Text as="span" tone="subdued" variant="bodySm">
                                                                                • {formatDate(review.createdAt)}
                                                                            </Text>
                                                                        </InlineStack>
                                                                    </BlockStack>
                                                                </InlineStack>
                                                                {review.reviewText && (
                                                                    <Text as="p" variant="bodySm" tone="subdued">
                                                                        "{review.reviewText.length > 100
                                                                            ? review.reviewText.substring(0, 100) + '...'
                                                                            : review.reviewText}"
                                                                    </Text>
                                                                )}
                                                            </BlockStack>
                                                        </Box>
                                                    </Box>
                                                ))}
                                            </BlockStack>
                                        </BlockStack>
                                    </Box>
                                </Card>
                            </Layout.Section>
                        )}

                        {/* Quick Actions */}
                        {stats.pendingReviews > 0 && (
                            <Layout.Section>
                                <Banner
                                    title={`You have ${stats.pendingReviews} review${stats.pendingReviews !== 1 ? 's' : ''} waiting for approval`}
                                    status="info"
                                    action={{
                                        content: 'Review Now',
                                        onAction: () => navigate('/reviews')
                                    }}
                                >
                                    <p>Review and approve customer feedback to build trust and credibility.</p>
                                </Banner>
                            </Layout.Section>
                        )}
                    </>
                )}
            </Layout>
        </Page>
    );
}

export default HomePage;