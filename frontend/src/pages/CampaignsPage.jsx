import { useState, useEffect, useCallback } from 'react';
import {
    Page,
    Layout,
    Card,
    ResourceList,
    ResourceItem,
    Text,
    Button,
    Modal,
    FormLayout,
    TextField,
    Select,
    Spinner,
    Badge,
    Banner,
    ButtonGroup,
    EmptyState,
    Box,
    InlineStack,
    BlockStack,
    Divider,
    Thumbnail,
    Checkbox,
    Icon,
    Tooltip,
} from '@shopify/polaris';
import {
    LinkIcon,
    DeleteIcon,
    PlusIcon,
    ShopcodesIcon,
} from '@shopify/polaris-icons';
import {
    fetchCampaigns,
    createCampaign,
    deleteCampaign,
    fetchPromos,
    fetchProducts
} from '../services/api';
import { QRCodeCanvas } from 'qrcode.react';

function CampaignsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [promos, setPromos] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        promoId: '',
        productIds: [],
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedCampaignForQr, setSelectedCampaignForQr] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [campaignsRes, promosRes, productsRes] = await Promise.all([
                fetchCampaigns(),
                fetchPromos(),
                fetchProducts(),
            ]);
            setCampaigns(campaignsRes.data.campaigns || []);
            setPromos(promosRes.data.promos || []);
            setProducts(productsRes.data.products || []);
        } catch (err) {
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            setError(null);
            await createCampaign(formData);
            setModalOpen(false);
            setFormData({ name: '', promoId: '', productIds: [] });
            setSuccess('Campaign created successfully!');
            setTimeout(() => setSuccess(null), 3000);
            loadData();
        } catch (err) {
            setError('Failed to create campaign. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            try {
                setDeletingId(id);
                setError(null);
                await deleteCampaign(id);
                setSuccess('Campaign deleted successfully!');
                setTimeout(() => setSuccess(null), 3000);
                loadData();
            } catch (err) {
                setError('Failed to delete campaign. Please try again.');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleChange = useCallback((field) => (value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const copyPublicUrl = (publicUrl) => {
        const url = `${import.meta.env.VITE_APP_URL}/review/${publicUrl}`;
        navigator.clipboard.writeText(url);
        setSuccess('Review form URL copied to clipboard!');
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleOpenQrModal = (campaign) => {
        setSelectedCampaignForQr(campaign);
        setQrModalOpen(true);
    };

    const downloadQRCode = (format) => {
        const canvas = document.getElementById('qr-code-canvas');
        if (!canvas) return;

        const url = canvas.toDataURL(`image/${format}`);
        const link = document.createElement('a');
        link.href = url;
        link.download = `campaign-qr-${selectedCampaignForQr.name}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleProductToggle = useCallback((productId) => {
        setFormData(prev => ({
            ...prev,
            productIds: prev.productIds.includes(productId)
                ? prev.productIds.filter(id => id !== productId)
                : [...prev.productIds, productId]
        }));
    }, []);

    const handleModalClose = () => {
        setModalOpen(false);
        setFormData({ name: '', promoId: '', productIds: [] });
    };

    if (loading) {
        return (
            <Page title="Campaigns">
                <Box paddingBlockStart="800" paddingBlockEnd="800">
                    <InlineStack align="center" blockAlign="center">
                        <Spinner size="large" />
                    </InlineStack>
                </Box>
            </Page>
        );
    }

    const promoOptions = promos.map((p) => ({
        label: p.name,
        value: p._id,
    }));

    const isFormValid = formData.name.trim() && formData.promoId;

    return (
        <Page
            title="Campaigns"
            subtitle="Create and manage your review collection campaigns"
            primaryAction={
                promos.length > 0
                    ? {
                        content: 'Create Campaign',
                        onAction: () => setModalOpen(true),
                        icon: PlusIcon,
                    }
                    : undefined
            }
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

                {/* Info Banner - No Promos */}
                {promos.length === 0 && (
                    <Layout.Section>
                        <Banner status="info">
                            <p>
                                You need to create at least one promo before you can create campaigns.
                                Visit the Promos page to get started.
                            </p>
                        </Banner>
                    </Layout.Section>
                )}

                {/* Campaigns List */}
                <Layout.Section>
                    <Card padding="0">
                        {campaigns.length === 0 ? (
                            <EmptyState
                                heading="Create your first campaign"
                                action={
                                    promos.length > 0
                                        ? {
                                            content: 'Create Campaign',
                                            onAction: () => setModalOpen(true),
                                        }
                                        : undefined
                                }
                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                                <p>
                                    Campaigns help you collect reviews for specific products and reward customers with promos.
                                </p>
                            </EmptyState>
                        ) : (
                            <ResourceList
                                resourceName={{ singular: 'campaign', plural: 'campaigns' }}
                                items={campaigns}
                                renderItem={(item) => {
                                    const { _id, name, status, promo, publicUrl, productIds = [] } = item;
                                    const isDeleting = deletingId === _id;

                                    return (
                                        <ResourceItem
                                            id={_id}
                                            accessibilityLabel={`View details for ${name}`}
                                        >
                                            <Box padding="400">
                                                <BlockStack gap="300">
                                                    <InlineStack align="space-between" blockAlign="center">
                                                        <BlockStack gap="200">
                                                            <Text variant="headingMd" as="h3" fontWeight="semibold">
                                                                {name}
                                                            </Text>
                                                            <InlineStack gap="200" wrap={false}>
                                                                <Badge
                                                                    tone={status === 'active' ? 'success' : 'attention'}
                                                                >
                                                                    {status === 'active' ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                                {promo && (
                                                                    <Text as="span" tone="subdued" variant="bodySm">
                                                                        Promo: {promo.name}
                                                                    </Text>
                                                                )}
                                                                {productIds.length > 0 && (
                                                                    <Text as="span" tone="subdued" variant="bodySm">
                                                                        • {productIds.length} product{productIds.length !== 1 ? 's' : ''}
                                                                    </Text>
                                                                )}
                                                            </InlineStack>
                                                        </BlockStack>
                                                        <ButtonGroup>
                                                            <Tooltip content="Show QR Code">
                                                                <Button
                                                                    size="slim"
                                                                    icon={ShopcodesIcon}
                                                                    onClick={() => handleOpenQrModal(item)}
                                                                >
                                                                    QR Code
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="Copy review form link">
                                                                <Button
                                                                    size="slim"
                                                                    icon={LinkIcon}
                                                                    onClick={() => copyPublicUrl(publicUrl)}
                                                                >
                                                                    Copy Link
                                                                </Button>
                                                            </Tooltip>
                                                            <Button
                                                                size="slim"
                                                                tone="critical"
                                                                icon={DeleteIcon}
                                                                onClick={() => handleDelete(_id)}
                                                                loading={isDeleting}
                                                                disabled={isDeleting}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </ButtonGroup>
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

            {/* Create Campaign Modal */}
            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                title="Create Campaign"
                primaryAction={{
                    content: 'Create Campaign',
                    onAction: handleSubmit,
                    loading: saving,
                    disabled: !isFormValid || saving,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: handleModalClose,
                        disabled: saving,
                    },
                ]}
            >
                <Modal.Section>
                    <BlockStack gap="400">
                        <FormLayout>
                            <TextField
                                label="Campaign Name"
                                value={formData.name}
                                onChange={handleChange('name')}
                                autoComplete="off"
                                placeholder="e.g., Summer Product Reviews"
                                helpText="Choose a descriptive name for your campaign"
                                maxLength={100}
                                showCharacterCount
                            />
                            <Select
                                label="Promo to Award"
                                options={[
                                    { label: 'Select a promo', value: '' },
                                    ...promoOptions,
                                ]}
                                value={formData.promoId}
                                onChange={handleChange('promoId')}
                                helpText="Customers will receive this promo after submitting a review"
                            />
                        </FormLayout>

                        <Divider />

                        {/* Product Selection */}
                        <BlockStack gap="300">
                            <Text variant="headingSm" as="h4" fontWeight="semibold">
                                Select Products
                            </Text>
                            <Text as="p" tone="subdued" variant="bodySm">
                                Choose which products customers can review in this campaign
                            </Text>

                            {products.length === 0 ? (
                                <Box
                                    background="bg-surface-secondary"
                                    padding="400"
                                    borderRadius="200"
                                >
                                    <Text as="p" tone="subdued" alignment="center">
                                        No products available. Please add products to your store first.
                                    </Text>
                                </Box>
                            ) : (
                                <>
                                    <Box
                                        borderColor="border"
                                        borderWidth="025"
                                        borderRadius="200"
                                        maxHeight="300px"
                                        overflowY="scroll"
                                    >
                                        <BlockStack gap="0">
                                            {products.map((product, index) => (
                                                <Box
                                                    key={product.id}
                                                    borderBlockStartWidth={index > 0 ? "025" : undefined}
                                                    borderColor="border"
                                                >
                                                    <Box padding="300">
                                                        <InlineStack gap="300" blockAlign="center" wrap={false}>
                                                            <Checkbox
                                                                checked={formData.productIds.includes(String(product.id))}
                                                                onChange={() => handleProductToggle(String(product.id))}
                                                            />
                                                            {product.images?.[0]?.src && (
                                                                <Thumbnail
                                                                    source={product.images[0].src}
                                                                    alt={product.title}
                                                                    size="small"
                                                                />
                                                            )}
                                                            <Text as="span" variant="bodyMd">
                                                                {product.title}
                                                            </Text>
                                                        </InlineStack>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </BlockStack>
                                    </Box>
                                    {formData.productIds.length > 0 && (
                                        <Text as="p" tone="subdued" variant="bodySm">
                                            {formData.productIds.length} product{formData.productIds.length !== 1 ? 's' : ''} selected
                                        </Text>
                                    )}
                                </>
                            )}
                        </BlockStack>
                    </BlockStack>
                </Modal.Section>
            </Modal>

            {/* QR Code Modal */}
            <Modal
                open={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                title="Campaign QR Code"
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: () => setQrModalOpen(false),
                    },
                ]}
            >
                <Modal.Section>
                    {selectedCampaignForQr && (
                        <BlockStack gap="400" align="center">
                            <Box padding="400">
                                <BlockStack gap="400" align="center" inlineAlign="center">
                                    <Text as="p" variant="bodyMd">
                                        Scan to view review form for <strong>{selectedCampaignForQr.name}</strong>
                                    </Text>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #dfe3e8', display: 'flex', justifyContent: 'center' }}>
                                        <QRCodeCanvas
                                            id="qr-code-canvas"
                                            value={`${import.meta.env.VITE_APP_URL}/review/${selectedCampaignForQr.publicUrl}`}
                                            size={256}
                                            level={"H"}
                                            includeMargin={true}
                                        />
                                    </div>
                                    <ButtonGroup>
                                        <Button onClick={() => downloadQRCode('png')}>Download PNG</Button>
                                        <Button onClick={() => downloadQRCode('jpeg')}>Download JPG</Button>
                                    </ButtonGroup>
                                </BlockStack>
                            </Box>
                        </BlockStack>
                    )}
                </Modal.Section>
            </Modal>
        </Page>
    );
}

export default CampaignsPage;