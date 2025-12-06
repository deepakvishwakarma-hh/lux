import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Photo } from "@medusajs/icons";
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
  Label,
  DropdownMenu,
} from "@medusajs/ui";
import { sdk } from "../../lib/config";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Carousel = {
  id: string;
  image_url1?: string | null;
  image_url2?: string | null;
  link?: string | null;
  order: number;
  created_at: Date;
  updated_at: Date;
};

type CarouselFormData = {
  image_url1?: string;
  image_url2?: string;
  link?: string;
  order?: number;
};

const limit = 15;

const CarouselsPage = () => {
  const columnHelper = createDataTableColumnHelper<Carousel>();

  const handleOpenEdit = (carousel: Carousel) => {
    window.location.href = `/app/carousel/${carousel.id}`;
  };

  const columns = [
    columnHelper.accessor("order", {
      header: "Order",
      cell: ({ row }) => {
        return <Text>{row.original.order || 0}</Text>;
      },
    }),
    columnHelper.accessor("image_url1", {
      header: "Desktop Image",
      cell: ({ row }) => {
        const imageUrl = row.original.image_url1;
        if (!imageUrl) {
          return <Text className="text-ui-fg-subtle">-</Text>;
        }
        return (
          <div className="w-16 h-16">
            <img
              src={imageUrl}
              alt="Desktop"
              className="w-full h-full object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        );
      },
    }),
    columnHelper.accessor("image_url2", {
      header: "Mobile Image",
      cell: ({ row }) => {
        const imageUrl = row.original.image_url2;
        if (!imageUrl) {
          return <Text className="text-ui-fg-subtle">-</Text>;
        }
        return (
          <div className="w-16 h-16">
            <img
              src={imageUrl}
              alt="Mobile"
              className="w-full h-full object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        );
      },
    }),
    columnHelper.accessor("link", {
      header: "Link",
      cell: ({ row }) => {
        return (
          <Text className="text-ui-fg-subtle max-w-md truncate">
            {row.original.link || "-"}
          </Text>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="transparent" size="small">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 4C8.55228 4 9 3.55228 9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3C7 3.55228 7.44772 4 8 4Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 14C8.55228 14 9 13.5523 9 13C9 12.4477 8.55228 12 8 12C7.44772 12 7 12.4477 7 13C7 13.5523 7.44772 14 8 14Z"
                    fill="currentColor"
                  />
                </svg>
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(row.original);
                }}
              >
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row.original);
                }}
                className="text-ui-fg-destructive"
              >
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        );
      },
    }),
  ];
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CarouselFormData>({
    image_url1: "",
    image_url2: "",
    link: "",
    order: 0,
  });
  const [imagePreview1, setImagePreview1] = useState<string | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    carousels: Carousel[];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ["carousels", pagination.pageIndex, pagination.pageSize],
    queryFn: () =>
      sdk.client.fetch("/admin/carousels", {
        query: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
          order: "order",
        },
      }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: CarouselFormData) => {
      return sdk.client.fetch("/admin/carousels", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return sdk.client.fetch(`/admin/carousels/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousels"] });
    },
  });

  const handleDelete = (carousel: Carousel) => {
    if (
      window.confirm(
        `Are you sure you want to delete this carousel item? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(carousel.id);
    }
  };

  const resetForm = () => {
    setFormData({
      image_url1: "",
      image_url2: "",
      link: "",
      order: 0,
    });
    setImagePreview1(null);
    setImagePreview2(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      image_url1: formData.image_url1 || undefined,
      image_url2: formData.image_url2 || undefined,
      link: formData.link || undefined,
      order: formData.order || 0,
    };
    createMutation.mutate(submitData);
  };

  const table = useDataTable({
    columns,
    data: data?.carousels || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  });

  const hasCarousels = !isLoading && (data?.count ?? 0) > 0;

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Carousels</Heading>
          <Button onClick={handleOpenCreate}>Create Carousel</Button>
        </DataTable.Toolbar>
        {hasCarousels ? (
          <>
            <DataTable.Table />
            <DataTable.Pagination />
          </>
        ) : (
          !isLoading && (
            <div className="py-12 flex justify-center">
              <Text className="text-ui-fg-subtle">No carousels found</Text>
            </div>
          )
        )}
      </DataTable>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <Heading>Create Carousel</Heading>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="order">Order *</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="image_url1">Desktop Image URL</Label>
                  <Input
                    id="image_url1"
                    type="url"
                    value={formData.image_url1}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({ ...formData, image_url1: url });
                      setImagePreview1(url || null);
                    }}
                    placeholder="https://example.com/desktop-image.jpg"
                  />
                  {imagePreview1 && (
                    <div className="mt-2">
                      <img
                        src={imagePreview1}
                        alt="Desktop Preview"
                        className="max-w-xs max-h-48 object-contain border rounded"
                        onError={() => setImagePreview1(null)}
                      />
                    </div>
                  )}
                  <div className="mt-2">
                    <Label htmlFor="image_file1" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("image_file1")?.click();
                        }}
                        disabled={createMutation.isPending}
                      >
                        Upload Desktop Image
                      </Button>
                    </Label>
                    <input
                      id="image_file1"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview1(reader.result as string);
                        };
                        reader.readAsDataURL(file);

                        try {
                          const uploadFormData = new FormData();
                          uploadFormData.append("file", file);

                          const baseUrl =
                            import.meta.env.VITE_BACKEND_URL || "/";
                          const response = await fetch(
                            `${baseUrl}/admin/upload`,
                            {
                              method: "POST",
                              body: uploadFormData,
                              credentials: "include",
                            }
                          );

                          if (!response.ok) {
                            throw new Error(
                              `Upload failed: ${response.statusText}`
                            );
                          }

                          const data = (await response.json()) as {
                            url?: string;
                            file?: any;
                          };

                          if (data.url) {
                            setFormData((prev) => ({
                              ...prev,
                              image_url1: data.url,
                            }));
                            setImagePreview1(data.url);
                          } else {
                            throw new Error("No URL returned from upload");
                          }
                        } catch (error) {
                          console.error("Error uploading image:", error);
                          setImagePreview1(null);
                          alert("Failed to upload image. Please try again.");
                        }
                      }}
                    />
                    <Text className="text-ui-fg-subtle text-xs mt-1">
                      Upload an image file or paste an image URL
                    </Text>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="image_url2">Mobile Image URL</Label>
                  <Input
                    id="image_url2"
                    type="url"
                    value={formData.image_url2}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData({ ...formData, image_url2: url });
                      setImagePreview2(url || null);
                    }}
                    placeholder="https://example.com/mobile-image.jpg"
                  />
                  {imagePreview2 && (
                    <div className="mt-2">
                      <img
                        src={imagePreview2}
                        alt="Mobile Preview"
                        className="max-w-xs max-h-48 object-contain border rounded"
                        onError={() => setImagePreview2(null)}
                      />
                    </div>
                  )}
                  <div className="mt-2">
                    <Label htmlFor="image_file2" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById("image_file2")?.click();
                        }}
                        disabled={createMutation.isPending}
                      >
                        Upload Mobile Image
                      </Button>
                    </Label>
                    <input
                      id="image_file2"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview2(reader.result as string);
                        };
                        reader.readAsDataURL(file);

                        try {
                          const uploadFormData = new FormData();
                          uploadFormData.append("file", file);

                          const baseUrl =
                            import.meta.env.VITE_BACKEND_URL || "/";
                          const response = await fetch(
                            `${baseUrl}/admin/upload`,
                            {
                              method: "POST",
                              body: uploadFormData,
                              credentials: "include",
                            }
                          );

                          if (!response.ok) {
                            throw new Error(
                              `Upload failed: ${response.statusText}`
                            );
                          }

                          const data = (await response.json()) as {
                            url?: string;
                            file?: any;
                          };

                          if (data.url) {
                            setFormData((prev) => ({
                              ...prev,
                              image_url2: data.url,
                            }));
                            setImagePreview2(data.url);
                          } else {
                            throw new Error("No URL returned from upload");
                          }
                        } catch (error) {
                          console.error("Error uploading image:", error);
                          setImagePreview2(null);
                          alert("Failed to upload image. Please try again.");
                        }
                      }}
                    />
                    <Text className="text-ui-fg-subtle text-xs mt-1">
                      Upload an image file or paste an image URL
                    </Text>
                  </div>
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
  label: "Carousels",
  icon: Photo,
});

export default CarouselsPage;
