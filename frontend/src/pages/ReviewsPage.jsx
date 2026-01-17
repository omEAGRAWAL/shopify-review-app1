import { useState, useEffect } from 'react';
import {
    Page,
    Layout,
    LegacyCard,
    ResourceList,
    ResourceItem,
    Text,
    Spinner,
    Badge,
    Banner,
} from '@shopify/polaris';
import { fetchReviews, updateReviewStatus } from '../services/api';

function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await fetchReviews();
            setReviews(response.data.reviews || []);
        } catch (err) {
            setError('Failed to load reviews.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateReviewStatus(id, newStatus);
            loadReviews();
        } catch (err) {
            setError('Failed to update review status.');
        }
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (loading) {
        return (
            <Page title="Reviews">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Spinner size="large" />
                </div>
            </Page>
        );
    }

    return (
        <Page title="Reviews">
            <Layout>
                {error && (
                    <Layout.Section>
                        <Banner status="critical" onDismiss={() => setError(null)}>
                            {error}
                        </Banner>
                    </Layout.Section>
                )}
                <Layout.Section>
                    <LegacyCard>
                        <ResourceList
                            resourceName={{ singular: 'review', plural: 'reviews' }}
                            items={reviews}
                            renderItem={(item) => {
                                const {
                                    _id,
                                    customerName,
                                    customerEmail,
                                    rating,
                                    reviewText,
                                    promoCode,
                                    status,
                                    campaign,
                                    createdAt
                                } = item;

                                const statusBadge = {
                                    approved: 'success',
                                    pending: 'attention',
                                    rejected: 'critical',
                                };

                                return (
                                    <ResourceItem
                                        id={_id}
                                        accessibilityLabel={`Review by ${customerName}`}
                                        shortcutActions={[
                                            {
                                                content: 'Approve',
                                                onAction: () => handleStatusChange(_id, 'approved'),
                                                disabled: status === 'approved',
                                            },
                                            {
                                                content: 'Reject',
                                                onAction: () => handleStatusChange(_id, 'rejected'),
                                                destructive: true,
                                                disabled: status === 'rejected',
                                            },
                                        ]}
                                    >
                                        <div style={{ marginBottom: '8px' }}>
                                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                {customerName}
                                            </Text>
                                            <Text as="span" color="subdued">
                                                {customerEmail}
                                            </Text>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <Text as="span" color="warning">
                                                {renderStars(rating)}
                                            </Text>
                                            <Badge status={statusBadge[status]}>{status}</Badge>
                                            {campaign && (
                                                <Text as="span" color="subdued">
                                                    Campaign: {campaign.name}
                                                </Text>
                                            )}
                                        </div>
                                        {reviewText && (
                                            <Text as="p" color="subdued">
                                                "{reviewText}"
                                            </Text>
                                        )}
                                        <div style={{ marginTop: '8px' }}>
                                            <Text as="span" color="subdued">
                                                Promo Code: <strong>{promoCode}</strong>
                                            </Text>
                                            <Text as="span" color="subdued" style={{ marginLeft: '16px' }}>
                                                {new Date(createdAt).toLocaleDateString()}
                                            </Text>
                                        </div>
                                    </ResourceItem>
                                );
                            }}
                            emptyState={
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <Text as="p" color="subdued">
                                        No reviews yet. Share your campaign links to collect reviews!
                                    </Text>
                                </div>
                            }
                        />
                    </LegacyCard>
                </Layout.Section>
            </Layout>
        </Page>
    );
}

export default ReviewsPage;
