import { defineWidgetConfig } from "@medusajs/admin-sdk";
import {
  Container,
  Heading,
  Text,
  Input,
  Label,
  Checkbox,
  Toaster,
} from "@medusajs/ui";
import { sdk } from "../lib/config";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

type Brand = {
  id: string;
  name: string;
  slug?: string | null;
};

const ProductBrandsWidget = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch brands for this product
  const { data: productBrandsData, isLoading: isLoadingProductBrands } =
    useQuery<{
      product_id: string;
      brands: Brand[];
    }>({
      queryKey: ["product-brands", id],
      queryFn: () => sdk.client.fetch(`/admin/products/${id}/brands`),
      enabled: !!id,
    });

  // Fetch all brands for selection
  const { data: brandsData, isLoading: isLoadingBrands } = useQuery<{
    brands: Brand[];
    count: number;
  }>({
    queryKey: ["brands", searchQuery],
    queryFn: () =>
      sdk.client.fetch("/admin/brands", {
        query: {
          limit: 100,
          offset: 0,
          fields: "id,name,slug",
        },
      }),
  });

  // Update selected brands when product brands load
  useEffect(() => {
    if (productBrandsData?.brands) {
      setSelectedBrands(new Set(productBrandsData.brands.map((b) => b.id)));
    }
  }, [productBrandsData]);

  const linkBrandsMutation = useMutation({
    mutationFn: async (brandIds: string[]) => {
      return sdk.client.fetch(`/admin/products/${id}/brands`, {
        method: "POST",
        body: { brand_ids: brandIds },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brands", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  const unlinkBrandMutation = useMutation({
    mutationFn: async (brandId: string) => {
      return sdk.client.fetch(
        `/admin/products/${id}/brands?brand_id=${brandId}`,
        {
          method: "DELETE",
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brands", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  const handleBrandToggle = async (brandId: string, isSelected: boolean) => {
    try {
      if (isSelected) {
        // Link brand
        await linkBrandsMutation.mutateAsync([brandId]);
        setSelectedBrands((prev) => new Set([...prev, brandId]));
      } else {
        // Unlink brand
        await unlinkBrandMutation.mutateAsync(brandId);
        setSelectedBrands((prev) => {
          const newSet = new Set(prev);
          newSet.delete(brandId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error toggling brand:", error);
    }
  };

  if (!id) {
    return null;
  }

  const filteredBrands =
    brandsData?.brands?.filter((brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <Container className="p-0">
      <div className="px-6 py-4 border-b">
        <Heading level="h2">Brands</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Select brands to associate with this product ({selectedBrands.size}{" "}
          selected)
        </Text>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div>
          <Input
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoadingProductBrands || isLoadingBrands ? (
          <Text>Loading brands...</Text>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredBrands.length === 0 ? (
              <Text className="text-ui-fg-subtle">No brands found</Text>
            ) : (
              filteredBrands.map((brand) => {
                const isSelected = selectedBrands.has(brand.id);
                return (
                  <div
                    key={brand.id}
                    className="flex items-center gap-3 p-2 hover:bg-ui-bg-base-hover rounded"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleBrandToggle(brand.id, checked as boolean)
                      }
                      disabled={
                        linkBrandsMutation.isPending ||
                        unlinkBrandMutation.isPending
                      }
                    />
                    <Label
                      htmlFor={`brand-${brand.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {brand.name}
                    </Label>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <Toaster />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductBrandsWidget;
