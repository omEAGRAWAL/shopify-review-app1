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
} from '@shopify/polaris';
import { fetchPromos, createPromo, deletePromo } from '../services/api';

function PromosPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'discount',
        discountType: 'percentage',
        discountValue: '',
        codePrefix: 'REVIEW',
    });
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadPromos();
    }, []);

    const loadPromos = async () => {
        try {
            setLoading(true);
            const response = await fetchPromos();
            setPromos(response.data.promos || []);
        } catch (err) {
            setError('Failed to load promos.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);
            await createPromo(formData);
            setModalOpen(false);
            setFormData({
                name: '',
                type: 'discount',
                discountType: 'percentage',
                discountValue: '',
                codePrefix: 'REVIEW',
            });
            loadPromos();
        } catch (err) {
            setError('Failed to create promo.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this promo?')) {
            try {
                await deletePromo(id);
                loadPromos();
            } catch (err) {
                setError('Failed to delete promo.');
            }
        }
    };

    const handleChange = useCallback((field) => (value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    if (loading) {
        return (
            <Page title="Promos">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Spinner size="large" />
                </div>
            </Page>
        );
    }

    return (
        <Page
            title="Promos"
            primaryAction={{
                content: 'Create Promo',
                onAction: () => setModalOpen(true),
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
                <Layout.Section>
                    <LegacyCard>
                        <ResourceList
                            resourceName={{ singular: 'promo', plural: 'promos' }}
                            items={promos}
                            renderItem={(item) => {
                                const { _id, name, type, discountType, discountValue, codePrefix } = item;
                                return (
                                    <ResourceItem
                                        id={_id}
                                        accessibilityLabel={`View details for ${name}`}
                                        shortcutActions={[
                                            { content: 'Delete', destructive: true, onAction: () => handleDelete(_id) },
                                        ]}
                                    >
                                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                                            {name}
                                        </Text>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <Badge status={type === 'discount' ? 'success' : 'info'}>
                                                {type}
                                            </Badge>
                                            {type === 'discount' && (
                                                <Text as="span" color="subdued">
                                                    {discountValue}{discountType === 'percentage' ? '%' : '$'} off
                                                </Text>
                                            )}
                                            <Text as="span" color="subdued">
                                                Prefix: {codePrefix}
                                            </Text>
                                        </div>
                                    </ResourceItem>
                                );
                            }}
                            emptyState={
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <Text as="p" color="subdued">
                                        No promos yet. Create your first promo!
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
                title="Create Promo"
                primaryAction={{
                    content: 'Create',
                    onAction: handleSubmit,
                    loading: saving,
                }}
                secondaryActions={[
                    { content: 'Cancel', onAction: () => setModalOpen(false) },
                ]}
            >
                <Modal.Section>
                    <FormLayout>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            autoComplete="off"
                        />
                        <Select
                            label="Type"
                            options={[
                                { label: 'Discount', value: 'discount' },
                                { label: 'Extended Warranty', value: 'warranty' },
                            ]}
                            value={formData.type}
                            onChange={handleChange('type')}
                        />
                        {formData.type === 'discount' && (
                            <>
                                <Select
                                    label="Discount Type"
                                    options={[
                                        { label: 'Percentage', value: 'percentage' },
                                        { label: 'Fixed Amount', value: 'fixed' },
                                    ]}
                                    value={formData.discountType}
                                    onChange={handleChange('discountType')}
                                />
                                <TextField
                                    label="Discount Value"
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={handleChange('discountValue')}
                                    suffix={formData.discountType === 'percentage' ? '%' : '$'}
                                />
                            </>
                        )}
                        <TextField
                            label="Code Prefix"
                            value={formData.codePrefix}
                            onChange={handleChange('codePrefix')}
                            helpText="Generated codes will start with this prefix"
                        />
                    </FormLayout>
                </Modal.Section>
            </Modal>
        </Page>
    );
}

export default PromosPage;
