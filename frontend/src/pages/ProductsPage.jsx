import { useState, useEffect } from 'react';
import {
    Page,
    Layout,
    LegacyCard,
    ResourceList,
    ResourceItem,
    Thumbnail,
    Text,
    Spinner,
    Banner,
} from '@shopify/polaris';
import { fetchProducts } from '../services/api';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await fetchProducts();
            setProducts(response.data.products || []);
        } catch (err) {
            setError('Failed to load products. Please make sure you are authenticated.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Page title="Products">
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Spinner size="large" />
                </div>
            </Page>
        );
    }

    return (
        <Page title="Products">
            <Layout>
                {error && (
                    <Layout.Section>
                        <Banner status="warning">{error}</Banner>
                    </Layout.Section>
                )}
                <Layout.Section>
                    <LegacyCard>
                        <ResourceList
                            resourceName={{ singular: 'product', plural: 'products' }}
                            items={products}
                            renderItem={(item) => {
                                const { id, title, images, variants } = item;
                                const media = (
                                    <Thumbnail
                                        source={images?.[0]?.src || ''}
                                        alt={title}
                                    />
                                );
                                const price = variants?.[0]?.price || '0.00';

                                return (
                                    <ResourceItem
                                        id={id}
                                        media={media}
                                        accessibilityLabel={`View details for ${title}`}
                                    >
                                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                                            {title}
                                        </Text>
                                        <div>${price}</div>
                                    </ResourceItem>
                                );
                            }}
                            emptyState={
                                <div style={{ padding: '20px', textAlign: 'center' }}>
                                    <Text as="p" color="subdued">
                                        No products found. Make sure your store has products.
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

export default ProductsPage;
