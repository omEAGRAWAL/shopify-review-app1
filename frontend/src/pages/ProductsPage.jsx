import { useState, useEffect } from 'react';
import {
    Page,
    Layout,
    Card,
    ResourceList,
    ResourceItem,
    Thumbnail,
    Text,
    Spinner,
    Banner,
    EmptyState,
    Box,
    InlineStack,
    BlockStack,
    Badge,
    Button,
    TextField,
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { fetchProducts } from '../services/api';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        // Filter products based on search query
        if (searchQuery.trim() === '') {
            setFilteredProducts(products);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = products.filter(product =>
                product.title.toLowerCase().includes(query)
            );
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchProducts();
            const productsList = response.data.products || [];
            setProducts(productsList);
            setFilteredProducts(productsList);
        } catch (err) {
            setError('Failed to load products. Please make sure you are authenticated.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const formatPrice = (price) => {
        const numPrice = parseFloat(price);
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const getInventoryStatus = (item) => {
        const variant = item.variants?.[0];
        if (!variant) return null;

        const inventoryQuantity = variant.inventory_quantity || 0;

        if (inventoryQuantity === 0) {
            return { tone: 'critical', label: 'Out of stock' };
        } else if (inventoryQuantity < 10) {
            return { tone: 'warning', label: 'Low stock' };
        }
        return { tone: 'success', label: 'In stock' };
    };

    if (loading) {
        return (
            <Page title="Products">
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
            title="Products"
            subtitle={`${products.length} product${products.length !== 1 ? 's' : ''} in your store`}
            secondaryActions={[
                {
                    content: 'Refresh',
                    onAction: loadProducts,
                    loading: loading,
                },
            ]}
        >
            <Layout>
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

                {/* Search Section */}
                {products.length > 0 && (
                    <Layout.Section>
                        <Card>
                            <Box padding="400">
                                <TextField
                                    label="Search products"
                                    labelHidden
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search by product name..."
                                    prefix={<SearchIcon />}
                                    clearButton
                                    onClearButtonClick={clearSearch}
                                    autoComplete="off"
                                />
                            </Box>
                        </Card>
                    </Layout.Section>
                )}

                {/* Products List */}
                <Layout.Section>
                    <Card padding="0">
                        {products.length === 0 ? (
                            <EmptyState
                                heading="No products found"
                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                                <p>
                                    Your store doesn't have any products yet. Add products to your Shopify store to see them here.
                                </p>
                            </EmptyState>
                        ) : filteredProducts.length === 0 ? (
                            <Box padding="800">
                                <InlineStack align="center">
                                    <BlockStack gap="200" inlineAlign="center">
                                        <Text as="p" variant="headingMd" alignment="center">
                                            No products match your search
                                        </Text>
                                        <Text as="p" tone="subdued" alignment="center">
                                            Try adjusting your search terms
                                        </Text>
                                        <Box paddingBlockStart="300">
                                            <Button onClick={clearSearch}>Clear search</Button>
                                        </Box>
                                    </BlockStack>
                                </InlineStack>
                            </Box>
                        ) : (
                            <ResourceList
                                resourceName={{ singular: 'product', plural: 'products' }}
                                items={filteredProducts}
                                renderItem={(item) => {
                                    const { id, title, images, variants } = item;
                                    const media = (
                                        <Thumbnail
                                            source={images?.[0]?.src || ''}
                                            alt={title}
                                            size="medium"
                                        />
                                    );
                                    const price = variants?.[0]?.price || '0.00';
                                    const inventoryStatus = getInventoryStatus(item);

                                    return (
                                        <ResourceItem
                                            id={id}
                                            media={media}
                                            accessibilityLabel={`View details for ${title}`}
                                        >
                                            <Box padding="400">
                                                <InlineStack align="space-between" blockAlign="start" wrap={false}>
                                                    <BlockStack gap="200">
                                                        <Text variant="headingSm" as="h3" fontWeight="semibold">
                                                            {title}
                                                        </Text>
                                                        <InlineStack gap="200" wrap={false}>
                                                            <Text variant="headingMd" as="p" fontWeight="bold">
                                                                ${formatPrice(price)}
                                                            </Text>
                                                            {variants && variants.length > 1 && (
                                                                <Text as="span" tone="subdued" variant="bodySm">
                                                                    • {variants.length} variant{variants.length !== 1 ? 's' : ''}
                                                                </Text>
                                                            )}
                                                        </InlineStack>
                                                        {inventoryStatus && (
                                                            <Badge tone={inventoryStatus.tone}>
                                                                {inventoryStatus.label}
                                                            </Badge>
                                                        )}
                                                    </BlockStack>
                                                </InlineStack>
                                            </Box>
                                        </ResourceItem>
                                    );
                                }}
                            />
                        )}
                    </Card>
                </Layout.Section>

                {/* Stats Footer */}
                {filteredProducts.length > 0 && searchQuery && (
                    <Layout.Section>
                        <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                            <Text as="p" tone="subdued" alignment="center" variant="bodySm">
                                Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? 's' : ''}
                            </Text>
                        </Box>
                    </Layout.Section>
                )}
            </Layout>
        </Page>
    );
}

export default ProductsPage;