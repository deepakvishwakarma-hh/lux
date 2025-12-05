import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Tag } from "@medusajs/icons";
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  Toaster,
  DataTablePaginationState,
  Text,
  Button,
  Input,
  Textarea,
  Label,
} from "@medusajs/ui";
import { sdk } from "../../lib/config";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpTypes } from "@medusajs/framework/types";

type Brand = {
  id: string;
  name: string;
  description?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  created_at: Date;
  updated_at: Date;
  products?: HttpTypes.AdminProduct[];
};

type BrandFormData = {
  name: string;
  description?: string;
  meta_title?: string;
  meta_desc?: string;
};

const columnHelper = createDataTableColumnHelper<Brand>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: ({ row }) => {
      return (
        <Text className="text-ui-fg-subtle max-w-md truncate">
          {row.original.description || "-"}
        </Text>
      );
    },
  }),
  columnHelper.accessor("products", {
    header: "Products",
    cell: ({ row }) => {
      const productCount = row.original.products?.length || 0;
      return <Text className="text-ui-fg-subtle">{productCount} products</Text>;
    },
  }),
];

const limit = 15;

const BrandsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    description: "",
    meta_title: "",
    meta_desc: "",
  });

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<{
    brands: Brand[];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ["brands", pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      sdk.client.fetch("/admin/brands", {
        query: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
          order: "-created_at",
          fields: ["*", "products.*"],
        },
      }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: BrandFormData) => {
      return sdk.client.fetch("/admin/brands", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BrandFormData>;
    }) => {
      return sdk.client.fetch(`/admin/brands/${id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return sdk.client.fetch(`/admin/brands/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      meta_title: "",
      meta_desc: "",
    });
    setEditingBrand(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || "",
      meta_title: brand.meta_title || "",
      meta_desc: brand.meta_desc || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBrand) {
      updateMutation.mutate({
        id: editingBrand.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const table = useDataTable({
    columns,
    data: data?.brands || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  });

  const hasBrands = !isLoading && (data?.count ?? 0) > 0;

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Brands</Heading>
          <Button onClick={handleOpenCreate}>Create Brand</Button>
        </DataTable.Toolbar>
        {hasBrands ? (
          <>
            <DataTable.Table
              onRowClick={(row) => handleOpenEdit(row.original)}
            />
            <DataTable.Pagination />
          </>
        ) : (
          !isLoading && (
            <div className="py-12 flex justify-center">
              <Text className="text-ui-fg-subtle">No brands found</Text>
            </div>
          )
        )}
      </DataTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <Heading>{editingBrand ? "Edit Brand" : "Create Brand"}</Heading>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_title: e.target.value })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="meta_desc">Meta Description</Label>
                  <Textarea
                    id="meta_desc"
                    value={formData.meta_desc}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_desc: e.target.value })
                    }
                    rows={3}
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
                <Button
                  type="submit"
                  isLoading={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingBrand ? "Update" : "Create"}
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
  label: "Brands",
  icon: Tag,
});

export default BrandsPage;
