import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Heart } from "@medusajs/icons";
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  DataTablePaginationState,
  Text,
  Button,
  Input,
  Label,
  Toaster,
} from "@medusajs/ui";
import { sdk } from "../../lib/config";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type LikedProduct = {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: Date;
  updated_at: Date;
};

type LikedProductFormData = {
  customer_id: string;
  product_id: string;
};

const limit = 15;

const LikedProductsPage = () => {
  const columnHelper = createDataTableColumnHelper<LikedProduct>();

  const columns = [
    columnHelper.accessor("customer_id", {
      header: "Customer ID",
      cell: ({ row }) => {
        return (
          <Text className="font-mono text-sm">{row.original.customer_id}</Text>
        );
      },
    }),
    columnHelper.accessor("product_id", {
      header: "Product ID",
      cell: ({ row }) => {
        return (
          <Text className="font-mono text-sm">{row.original.product_id}</Text>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      cell: ({ row }) => {
        return (
          <Text className="text-ui-fg-subtle">
            {new Date(row.original.created_at).toLocaleString()}
          </Text>
        );
      },
    }),
  ];

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<LikedProductFormData>({
    customer_id: "",
    product_id: "",
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    liked_products: LikedProduct[];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ["liked-products", pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      sdk.client.fetch("/admin/liked-products", {
        query: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
          order: "-created_at",
        },
      }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: LikedProductFormData) => {
      return sdk.client.fetch("/admin/liked-products", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked-products"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      customer_id: "",
      product_id: "",
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const table = useDataTable({
    columns,
    data: data?.liked_products || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  });

  const hasLikedProducts = !isLoading && (data?.count ?? 0) > 0;

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Liked Products (Wishlist)</Heading>
          <Button onClick={handleOpenCreate}>Create Entry</Button>
        </DataTable.Toolbar>
        {hasLikedProducts ? (
          <>
            <DataTable.Table />
            <DataTable.Pagination />
          </>
        ) : (
          !isLoading && (
            <div className="py-12 flex justify-center">
              <Text className="text-ui-fg-subtle">No liked products found</Text>
            </div>
          )
        )}
      </DataTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <Heading>Create Liked Product Entry</Heading>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="customer_id">Customer ID *</Label>
                  <Input
                    id="customer_id"
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_id: e.target.value })
                    }
                    placeholder="Enter customer ID"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="product_id">Product ID *</Label>
                  <Input
                    id="product_id"
                    value={formData.product_id}
                    onChange={(e) =>
                      setFormData({ ...formData, product_id: e.target.value })
                    }
                    placeholder="Enter product ID"
                    required
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={createMutation.isPending}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Liked Products",
  icon: Heart,
});

export default LikedProductsPage;
