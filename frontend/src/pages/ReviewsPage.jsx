import { useState, useEffect, useMemo } from 'react';
import {
    Page,
    Layout,
    Card,
    ResourceList,
    ResourceItem,
    Text,
    Spinner,
    Badge,
    Banner,
    EmptyState,
    Box,
    InlineStack,
    BlockStack,
    ButtonGroup,
    Button,
    Tabs,
    TextField,
    Select,
    Tooltip,
} from '@shopify/polaris';
import {
    CheckIcon,
    XIcon,
    SearchIcon,
} from '@shopify/polaris-icons';
import { fetchReviews, updateReviewStatus } from '../services/api';

function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortValue, setSortValue] = useState('newest');

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchReviews();
            setReviews(response.data.reviews || []);
        } catch (err) {
            setError('Failed to load reviews. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setUpdatingId(id);
            setError(null);
            await updateReviewStatus(id, newStatus);
            setSuccess(`Review ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully!`);
            setTimeout(() => setSuccess(null), 3000);
            loadReviews();
        } catch (err) {
            setError('Failed to update review status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const tabs = [
        { id: 'all', content: 'All', badge: reviews.length.toString() },
        { id: 'pending', content: 'Pending', badge: reviews.filter(r => r.status === 'pending').length.toString() },
        { id: 'approved', content: 'Approved', badge: reviews.filter(r => r.status === 'approved').length.toString() },
        { id: 'rejected', content: 'Rejected', badge: reviews.filter(r => r.status === 'rejected').length.toString() },
    ];

    const filteredAndSortedReviews = useMemo(() => {
        let filtered = reviews;

        // Filter by tab
        const currentTab = tabs[selectedTab].id;
        if (currentTab !== 'all') {
            filtered = filtered.filter(review => review.status === currentTab);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(review =>
                review.customerName?.toLowerCase().includes(query) ||
                review.customerEmail?.toLowerCase().includes(query) ||
                review.reviewText?.toLowerCase().includes(query) ||
                review.campaign?.name?.toLowerCase().includes(query)
            );
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortValue) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'rating-high':
                    return b.rating - a.rating;
                case 'rating-low':
                    return a.rating - b.rating;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [reviews, selectedTab, searchQuery, sortValue, tabs]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    const clearSearch = () => {
        setSearchQuery('');
    };

    if (loading) {
        return (
            <Page title="Reviews">
                <Box paddingBlockStart="800" paddingBlockEnd="800">
                    <InlineStack align="center" blockAlign="center">
                        <Spinner size="large" />
                    </InlineStack>
                </Box>
            </Page>
        );
    }

    return (
        <Page
            title="Reviews"
            subtitle={`${reviews.length} total review${reviews.length !== 1 ? 's' : ''}`}
            secondaryActions={[
                {
                    content: 'Refresh',
                    onAction: loadReviews,
                    loading: loading,
                },
            ]}
        >
            <Layout>
                {/* Success Banner */}
                {success && (
                    <Layout.Section>
                        <Banner
                            status="success"
                            onDismiss={() => setSuccess(null)}
                        >
                            <p>{success}</p>
                        </Banner>
                    </Layout.Section>
                )}

                {/* Error Banner */}
                {error && (
                    <Layout.Section>
                        <Banner
                            status="critical"
                            onDismiss={() => setError(null)}
                        >
                            <p>{error}</p>
                        </Banner>
                    </Layout.Section>
                )}

                {/* Stats Cards */}
                {reviews.length > 0 && (
                    <Layout.Section>
                        <InlineStack gap="400">
                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <Text as="p" tone="subdued" variant="bodySm">
                                            Total Reviews
                                        </Text>
                                        <Text as="p" variant="heading2xl" fontWeight="bold">
                                            {reviews.length}
                                        </Text>
                                    </BlockStack>
                                </Box>
                            </Card>
                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <Text as="p" tone="subdued" variant="bodySm">
                                            Average Rating
                                        </Text>
                                        <InlineStack gap="200" blockAlign="center">
                                            <Text as="p" variant="heading2xl" fontWeight="bold">
                                                {averageRating}
                                            </Text>
                                            <Text as="span" tone="warning" variant="headingLg">
                                                ★
                                            </Text>
                                        </InlineStack>
                                    </BlockStack>
                                </Box>
                            </Card>
                            <Card>
                                <Box padding="400">
                                    <BlockStack gap="200">
                                        <Text as="p" tone="subdued" variant="bodySm">
                                            Pending Review
                                        </Text>
                                        <Text as="p" variant="heading2xl" fontWeight="bold">
                                            {reviews.filter(r => r.status === 'pending').length}
                                        </Text>
                                    </BlockStack>
                                </Box>
                            </Card>
                        </InlineStack>
                    </Layout.Section>
                )}

                {/* Filters */}
                <Layout.Section>
                    <Card>
                        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                            <Box padding="400">
                                <InlineStack gap="400" wrap={false}>
                                    <Box minWidth="300px">
                                        <TextField
                                            label="Search reviews"
                                            labelHidden
                                            value={searchQuery}
                                            onChange={setSearchQuery}
                                            placeholder="Search by name, email, or text..."
                                            prefix={<SearchIcon />}
                                            clearButton
                                            onClearButtonClick={clearSearch}
                                            autoComplete="off"
                                        />
                                    </Box>
                                    <Box minWidth="200px">
                                        <Select
                                            label="Sort by"
                                            labelHidden
                                            options={[
                                                { label: 'Newest first', value: 'newest' },
                                                { label: 'Oldest first', value: 'oldest' },
                                                { label: 'Highest rating', value: 'rating-high' },
                                                { label: 'Lowest rating', value: 'rating-low' },
                                            ]}
                                            value={sortValue}
                                            onChange={setSortValue}
                                        />
                                    </Box>
                                </InlineStack>
                            </Box>
                        </Tabs>
                    </Card>
                </Layout.Section>

                {/* Reviews List */}
                <Layout.Section>
                    <Card padding="0">
                        {reviews.length === 0 ? (
                            <EmptyState
                                heading="No reviews yet"
                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                                <p>
                                    Start collecting reviews by sharing your campaign links with customers.
                                    Reviews will appear here for you to approve or reject.
                                </p>
                            </EmptyState>
                        ) : filteredAndSortedReviews.length === 0 ? (
                            <Box padding="800">
                                <InlineStack align="center">
                                    <BlockStack gap="200" inlineAlign="center">
                                        <Text as="p" variant="headingMd" alignment="center">
                                            No reviews found
                                        </Text>
                                        <Text as="p" tone="subdued" alignment="center">
                                            Try adjusting your filters or search terms
                                        </Text>
                                        <Box paddingBlockStart="300">
                                            <Button onClick={() => { setSearchQuery(''); setSelectedTab(0); }}>
                                                Clear all filters
                                            </Button>
                                        </Box>
                                    </BlockStack>
                                </InlineStack>
                            </Box>
                        ) : (
                            <ResourceList
                                resourceName={{ singular: 'review', plural: 'reviews' }}
                                items={filteredAndSortedReviews}
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

                                    const isUpdating = updatingId === _id;

                                    return (
                                        <ResourceItem
                                            id={_id}
                                            accessibilityLabel={`Review by ${customerName}`}
                                        >
                                            <Box padding="400">
                                                <BlockStack gap="300">
                                                    {/* Header */}
                                                    <InlineStack align="space-between" blockAlign="start" wrap={false}>
                                                        <BlockStack gap="100">
                                                            <Text variant="headingSm" as="h3" fontWeight="semibold">
                                                                {customerName}
                                                            </Text>
                                                            <Text as="span" tone="subdued" variant="bodySm">
                                                                {customerEmail}
                                                            </Text>
                                                        </BlockStack>
                                                        <ButtonGroup>
                                                            <Tooltip content="Approve review">
                                                                <Button
                                                                    size="slim"
                                                                    icon={CheckIcon}
                                                                    onClick={() => handleStatusChange(_id, 'approved')}
                                                                    disabled={status === 'approved' || isUpdating}
                                                                    loading={isUpdating && status !== 'approved'}
                                                                    tone={status === 'approved' ? 'success' : undefined}
                                                                >
                                                                    Approve
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="Reject review">
                                                                <Button
                                                                    size="slim"
                                                                    icon={XIcon}
                                                                    onClick={() => handleStatusChange(_id, 'rejected')}
                                                                    disabled={status === 'rejected' || isUpdating}
                                                                    loading={isUpdating && status !== 'rejected'}
                                                                    tone={status === 'rejected' ? 'critical' : undefined}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </Tooltip>
                                                        </ButtonGroup>
                                                    </InlineStack>

                                                    {/* Rating and Status */}
                                                    <InlineStack gap="300" wrap={true} blockAlign="center">
                                                        {renderStars(rating)}
                                                        <Badge
                                                            tone={
                                                                status === 'approved' ? 'success' :
                                                                    status === 'rejected' ? 'critical' :
                                                                        'attention'
                                                            }
                                                        >
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </Badge>
                                                        {campaign && (
                                                            <Text as="span" tone="subdued" variant="bodySm">
                                                                Campaign: <Text as="span" fontWeight="semibold">{campaign.name}</Text>
                                                            </Text>
                                                        )}
                                                        <Text as="span" tone="subdued" variant="bodySm">
                                                            {formatDate(createdAt)}
                                                        </Text>
                                                    </InlineStack>

                                                    {/* Review Text */}
                                                    {reviewText && (
                                                        <Box
                                                            background="bg-surface-secondary"
                                                            padding="300"
                                                            borderRadius="200"
                                                        >
                                                            <Text as="p" variant="bodyMd">
                                                                "{reviewText}"
                                                            </Text>
                                                        </Box>
                                                    )}

                                                    {/* Footer */}
                                                    <InlineStack gap="400">
                                                        <Text as="span" tone="subdued" variant="bodySm">
                                                            Promo Code: <Text as="span" fontWeight="bold">{promoCode}</Text>
                                                        </Text>
                                                    </InlineStack>
                                                </BlockStack>
                                            </Box>
                                        </ResourceItem>
                                    );
                                }}
                            />
                        )}
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}

export default ReviewsPage;