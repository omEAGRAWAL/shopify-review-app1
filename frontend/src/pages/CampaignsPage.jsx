import { useState, useEffect, useCallback } from 'react';
import {
    Page,
    Layout,
    LegacyCard,
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
} from '@shopify/polaris';
import {
    fetchCampaigns,
    createCampaign,
    deleteCampaign,
    fetchPromos,
    fetchProducts
} from '../services/api';

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
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [campaignsRes, promosRes, productsRes] = await Promise.all([
                fetchCampaigns(),
                fetchPromos(),
                fetchProducts(),
            ]);
            setCampaigns(campaignsRes.data.campaigns || []);
            setPromos(promosRes.data.promos || []);
            setProducts(productsRes.data.products || []);
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            await createCampaign(formData);
            setModalOpen(false);
            setFormData({ name: '', promoId: '', productIds: [] });
            loadData();
        } catch (err) {
            setError('Failed to create campaign.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this campaign?')) {
            try {
                await deleteCampaign(id);
                loadData();
            } catch (err) {
                setError('Failed to delete campaign.');
            }
        }
    };

    const handleChange = useCallback((field) => (value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const copyPublicUrl = (publicUrl) => {
        const url = `${window.location.origin}/review/${publicUrl}`;
        navigator.clipboard.writeText(url);
        alert('Review form URL copied to clipboard!');
    };

    if (loading) {
        return (
            <Page title="Campaigns">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Spinner size="large" />
                </div>
            </Page>
        );
    }

    const promoOptions = promos.map((p) => ({
        label: p.name,
        value: p._id,
    }));

    return (
        <Page
            title="Campaigns"
            primaryAction={{
                content: 'Create Campaign',
                onAction: () => setModalOpen(true),
                disabled: promos.length === 0,
            }}
        >
            <Layout>
                {error && (
                    <Layout.Section>
                        <Banner status="critical" onDismiss={() => setError(null)}>
                            {error}
                        </Banner>
                    </Layout.Section>
                )}
                {promos.length === 0 && (
                    <Layout.Section>
                        <Banner status="info">
                            Create a promo first before creating campaigns.
                        </Banner>
                    </Layout.Section>
                )}
                <Layout.Section>
                    <LegacyCard>
                        <ResourceList
                            resourceName={{ singular: 'campaign', plural: 'campaigns' }}
                            items={campaigns}
                            renderItem={(item) => {
                                const { _id, name, status, promo, publicUrl } = item;
                                return (
                                    <ResourceItem
                                        id={_id}
                                        accessibilityLabel={`View details for ${name}`}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                    {name}
                                                </Text>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                    <Badge status={status === 'active' ? 'success' : 'warning'}>
                                                        {status}
                                                    </Badge>
                                                    {promo && (
                                                        <Text as="span" color="subdued">
                                                            Promo: {promo.name}
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>
                                            <ButtonGroup>
                                                <Button size="slim" onClick={() => copyPublicUrl(publicUrl)}>
                                                    Copy Link
                                                </Button>
                                                <Button size="slim" destructive onClick={() => handleDelete(_id)}>
                                                    Delete
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                    </ResourceItem>
                                );
                            }}
                            emptyState={
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <Text as="p" color="subdued">
                                        No campaigns yet. Create your first campaign!
                                    </Text>
                                </div>
                            }
                        />
                    </LegacyCard>
                </Layout.Section>
            </Layout>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Create Campaign"
                primaryAction={{
                    content: 'Create',
                    onAction: handleSubmit,
                    loading: saving,
                    disabled: !formData.name || !formData.promoId,
                }}
                secondaryActions={[
                    { content: 'Cancel', onAction: () => setModalOpen(false) },
                ]}
            >
                <Modal.Section>
                    <FormLayout>
                        <TextField
                            label="Campaign Name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            autoComplete="off"
                        />
                        <Select
                            label="Promo to Award"
                            options={[{ label: 'Select a promo', value: '' }, ...promoOptions]}
                            value={formData.promoId}
                            onChange={handleChange('promoId')}
                        />
                        <div>
                            <Text variant="bodyMd" fontWeight="semibold" as="p">
                                Select Products for this Campaign
                            </Text>
                            <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '8px',
                                marginTop: '8px'
                            }}>
                                {products.length === 0 ? (
                                    <Text as="p" color="subdued">No products available</Text>
                                ) : (
                                    products.map((product) => (
                                        <label
                                            key={product.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f0f0f0'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.productIds.includes(String(product.id))}
                                                onChange={(e) => {
                                                    const productId = String(product.id);
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            productIds: [...prev.productIds, productId]
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            productIds: prev.productIds.filter(id => id !== productId)
                                                        }));
                                                    }
                                                }}
                                            />
                                            {product.images?.[0]?.src && (
                                                <img
                                                    src={product.images[0].src}
                                                    alt={product.title}
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            )}
                                            <span>{product.title}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                            {formData.productIds.length > 0 && (
                                <Text as="p" color="subdued" style={{ marginTop: '8px' }}>
                                    {formData.productIds.length} product(s) selected
                                </Text>
                            )}
                        </div>
                    </FormLayout>
                </Modal.Section>
            </Modal>
        </Page>
    );
}

export default CampaignsPage;
