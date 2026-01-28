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
    EmptyState,
    Box,
    InlineStack,
    BlockStack,
    ButtonGroup,
    Divider,
    Icon,
    Tooltip,
} from '@shopify/polaris';
import {
    DiscountIcon,
    DeleteIcon,
    PlusIcon,
} from '@shopify/polaris-icons';
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
    const [success, setSuccess] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadPromos();
    }, []);

    const loadPromos = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchPromos();
            setPromos(response.data.promos || []);
        } catch (err) {
            setError('Failed to load promos. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Promo name is required';
        }

        if (formData.type === 'discount') {
            const value = parseFloat(formData.discountValue);

            if (!formData.discountValue || isNaN(value)) {
                errors.discountValue = 'Discount value is required';
            } else if (value <= 0) {
                errors.discountValue = 'Discount value must be greater than 0';
            } else if (formData.discountType === 'percentage' && value > 100) {
                errors.discountValue = 'Percentage cannot exceed 100%';
            }
        }

        if (!formData.codePrefix.trim()) {
            errors.codePrefix = 'Code prefix is required';
        } else if (!/^[A-Z0-9]+$/.test(formData.codePrefix)) {
            errors.codePrefix = 'Code prefix must contain only uppercase letters and numbers';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError(null);
            await createPromo(formData);
            setModalOpen(false);
            setFormData({
                name: '',
                type: 'discount',
                discountType: 'percentage',
                discountValue: '',
                codePrefix: 'REVIEW',
            });
            setFormErrors({});
            setSuccess('Promo created successfully!');
            setTimeout(() => setSuccess(null), 3000);
            loadPromos();
        } catch (err) {
            setError('Failed to create promo. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this promo? This action cannot be undone.')) {
            try {
                setDeletingId(id);
                setError(null);
                await deletePromo(id);
                setSuccess('Promo deleted successfully!');
                setTimeout(() => setSuccess(null), 3000);
                loadPromos();
            } catch (err) {
                setError('Failed to delete promo. Please try again.');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const handleChange = useCallback((field) => (value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    }, [formErrors]);

    const handleModalClose = () => {
        setModalOpen(false);
        setFormData({
            name: '',
            type: 'discount',
            discountType: 'percentage',
            discountValue: '',
            codePrefix: 'REVIEW',
        });
        setFormErrors({});
    };

    const formatDiscountDisplay = (discountType, discountValue) => {
        const value = parseFloat(discountValue);
        if (isNaN(value)) return 'N/A';

        if (discountType === 'percentage') {
            return `${value}% off`;
        }
        return `$${value.toFixed(2)} off`;
    };

    if (loading) {
        return (
            <Page title="Promos">
                <Box paddingBlockStart="800" paddingBlockEnd="800">
                    <InlineStack align="center" blockAlign="center">
                        <Spinner size="large" />
                    </InlineStack>
                </Box>
            </Page>
        );
    }

    const isFormValid = formData.name.trim() &&
        formData.codePrefix.trim() &&
        (formData.type !== 'discount' || formData.discountValue);

    return (
        <Page
            title="Promos"
            subtitle="Manage promotional offers for your review campaigns"
            primaryAction={{
                content: 'Create Promo',
                onAction: () => setModalOpen(true),
                icon: PlusIcon,
            }}
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

                {/* Promos List */}
                <Layout.Section>
                    <Card padding="0">
                        {promos.length === 0 ? (
                            <EmptyState
                                heading="Create your first promo"
                                action={{
                                    content: 'Create Promo',
                                    onAction: () => setModalOpen(true),
                                }}
                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                                <p>
                                    Promos are rewards that customers receive after submitting reviews.
                                    Create discount codes or extended warranties to incentivize reviews.
                                </p>
                            </EmptyState>
                        ) : (
                            <ResourceList
                                resourceName={{ singular: 'promo', plural: 'promos' }}
                                items={promos}
                                renderItem={(item) => {
                                    const { _id, name, type, discountType, discountValue, codePrefix } = item;
                                    const isDeleting = deletingId === _id;

                                    return (
                                        <ResourceItem
                                            id={_id}
                                            accessibilityLabel={`View details for ${name}`}
                                        >
                                            <Box padding="400">
                                                <InlineStack align="space-between" blockAlign="start" wrap={false}>
                                                    <BlockStack gap="200">
                                                        <InlineStack gap="200" wrap={false} blockAlign="center">
                                                            <Icon source={DiscountIcon} tone="base" />
                                                            <Text variant="headingSm" as="h3" fontWeight="semibold">
                                                                {name}
                                                            </Text>
                                                        </InlineStack>
                                                        <InlineStack gap="200" wrap={true}>
                                                            <Badge tone={type === 'discount' ? 'success' : 'info'}>
                                                                {type === 'discount' ? 'Discount Code' : 'Extended Warranty'}
                                                            </Badge>
                                                            {type === 'discount' && (
                                                                <Text as="span" variant="bodySm" fontWeight="semibold">
                                                                    {formatDiscountDisplay(discountType, discountValue)}
                                                                </Text>
                                                            )}
                                                            <Text as="span" tone="subdued" variant="bodySm">
                                                                Code prefix: <Text as="span" fontWeight="semibold">{codePrefix}</Text>
                                                            </Text>
                                                        </InlineStack>
                                                    </BlockStack>
                                                    <Tooltip content="Delete promo">
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
                                                    </Tooltip>
                                                </InlineStack>
                                            </Box>
                                        </ResourceItem>
                                    );
                                }}
                            />
                        )}
                    </Card>
                </Layout.Section>

                {/* Info Card */}
                {promos.length > 0 && (
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <BlockStack gap="200">
                                    <Text variant="headingSm" as="h4" fontWeight="semibold">
                                        How promos work
                                    </Text>
                                    <Text as="p" tone="subdued">
                                        When customers complete a review through your campaigns, they automatically
                                        receive a unique promo code based on the prefix you set. Each code is
                                        single-use and tied to the customer's email.
                                    </Text>
                                </BlockStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                )}
            </Layout>

            {/* Create Promo Modal */}
            <Modal
                open={modalOpen}
                onClose={handleModalClose}
                title="Create Promo"
                primaryAction={{
                    content: 'Create Promo',
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
                                label="Promo Name"
                                value={formData.name}
                                onChange={handleChange('name')}
                                autoComplete="off"
                                placeholder="e.g., Summer Review Discount"
                                helpText="Internal name for this promo"
                                error={formErrors.name}
                                maxLength={100}
                                showCharacterCount
                            />

                            <Select
                                label="Promo Type"
                                options={[
                                    { label: 'Discount Code', value: 'discount' },
                                    { label: 'Extended Warranty', value: 'warranty' },
                                ]}
                                value={formData.type}
                                onChange={handleChange('type')}
                                helpText="Choose what type of reward customers will receive"
                            />

                            {formData.type === 'discount' && (
                                <>
                                    <Divider />
                                    <BlockStack gap="400">
                                        <Text variant="headingSm" as="h4" fontWeight="semibold">
                                            Discount Details
                                        </Text>
                                        <Select
                                            label="Discount Type"
                                            options={[
                                                { label: 'Percentage Off', value: 'percentage' },
                                                { label: 'Fixed Amount Off', value: 'fixed' },
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
                                            placeholder={formData.discountType === 'percentage' ? '10' : '5.00'}
                                            helpText={
                                                formData.discountType === 'percentage'
                                                    ? 'Enter percentage (1-100)'
                                                    : 'Enter dollar amount'
                                            }
                                            error={formErrors.discountValue}
                                            min="0"
                                            max={formData.discountType === 'percentage' ? '100' : undefined}
                                            step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        />
                                    </BlockStack>
                                </>
                            )}

                            <Divider />

                            <TextField
                                label="Code Prefix"
                                value={formData.codePrefix}
                                onChange={handleChange('codePrefix')}
                                placeholder="REVIEW"
                                helpText="Uppercase letters and numbers only. Generated codes will be: PREFIX-XXXXX"
                                error={formErrors.codePrefix}
                                maxLength={20}
                            />
                        </FormLayout>

                        {/* Preview */}
                        {formData.codePrefix && (
                            <Box
                                background="bg-surface-secondary"
                                padding="400"
                                borderRadius="200"
                            >
                                <BlockStack gap="200">
                                    <Text variant="bodySm" as="p" fontWeight="semibold">
                                        Preview
                                    </Text>
                                    <Text variant="bodySm" as="p" tone="subdued">
                                        Example code: <Text as="span" fontWeight="bold">{formData.codePrefix}-A1B2C</Text>
                                    </Text>
                                </BlockStack>
                            </Box>
                        )}
                    </BlockStack>
                </Modal.Section>
            </Modal>
        </Page>
    );
}

export default PromosPage;