import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ShoppingBag } from "@medusajs/icons";
import {
  createDataTableCommandHelper,
  DataTableRowSelectionState,
  toast,
} from "@medusajs/ui";
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  Toaster,
  DataTablePaginationState,
  Text,
} from "@medusajs/ui";
import { sdk } from "../../lib/config";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

type ProductListItem = {
  id: string;
  title: string;
  image: string | null;
  price: number | null;
  price_formatted: string | null;
};

const columnHelper = createDataTableColumnHelper<ProductListItem>();

const columns = [
  columnHelper.select(),
  columnHelper.accessor("image", {
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.image;
      return (
        <div className="w-16 h-16 flex items-center justify-center bg-ui-bg-subtle rounded bg-white border border-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={row.original.title}
              className="w-full h-full object-contain rounded"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.innerHTML = "—";
                }
              }}
            />
          ) : (
            <Text className="text-ui-fg-subtle text-xs">No image</Text>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("title", {
    header: "Title",
    cell: ({ row }) => (
      <Link 
        to={`/products/${row.original.id}`}
        className="font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {row.original.title}
      </Link>
    ),
  }),
  columnHelper.accessor("price_formatted", {
    header: "Price (USD)",
    cell: ({ row }) => (
      <Text>
        {row.original.price_formatted || (row.original.price 
          ? `$${((row.original.price || 0) / 100).toFixed(2)}` 
          : "—")}
      </Text>
    ),
  }),
];

const commandHelper = createDataTableCommandHelper();

const useCommands = (
  refetch: () => void,
  queryClient: ReturnType<typeof useQueryClient>,
  offset: number,
  limit: number
) => {
  return [
    commandHelper.command({
      label: "Delete",
      shortcut: "D",
      action: async (selection) => {
        const productIds = Object.keys(selection);
        
        // Store previous data for rollback
        const previousData = queryClient.getQueryData(["products-list", offset, limit]);
        
        // Optimistic update: remove products from cache immediately
        queryClient.setQueriesData(
          { queryKey: ["products-list"] },
          (oldData: any) => {
            if (!oldData) return oldData;
            const filteredProducts = oldData.products.filter(
              (p: ProductListItem) => !productIds.includes(p.id)
            );
            return {
              ...oldData,
              products: filteredProducts,
              count: Math.max(0, (oldData.count || filteredProducts.length) - productIds.length),
            };
          }
        );

        try {
          await sdk.client.fetch("/admin/products-list", {
            method: "DELETE",
            body: {
              ids: productIds,
            },
          });

          toast.success("Products deleted successfully", {
            description: `${productIds.length} product(s) deleted`,
          });
          
          // Refetch to ensure consistency
          refetch();
        } catch (error: any) {
          // Rollback optimistic update on error
          if (previousData) {
            queryClient.setQueryData(["products-list", offset, limit], previousData);
          } else {
            queryClient.invalidateQueries({ queryKey: ["products-list"] });
          }
          
          toast.error("Failed to delete products", {
            description: error.message || "An error occurred",
          });
        }
      },
    }),
  ];
};

const limit = 50;

const ProductsListPage = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const offset = useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<{
    products: ProductListItem[];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ["products-list", offset, limit],
    queryFn: () =>
      sdk.client.fetch("/admin/products-list", {
        query: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
        },
      }),
  });

  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>(
    {}
  );

  const commands = useCommands(refetch, queryClient, offset, limit);
  const table = useDataTable({
    columns,
    data: data?.products || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
    commands,
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
    },
  });

  // Handle row clicks
  const handleRowClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const hasProducts = !isLoading && (data?.count ?? 0) > 0;

  return (
    <Container>
      <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex-shrink-0 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
            <Heading>Products</Heading>
          </DataTable.Toolbar>
          {hasProducts ? (
            <>
              <div className="flex-1 min-h-0 overflow-hidden border border-ui-border-base rounded-lg bg-ui-bg-base shadow-sm">
                <div 
                  className="h-full overflow-y-auto overflow-x-auto [&_tbody_tr]:cursor-pointer [&_tbody_tr]:hover:bg-ui-bg-subtle-hover [&_tbody_tr]:transition-colors"
                  onClick={(e) => {
                    // Find the closest table row (skip header row)
                    const target = (e.target as HTMLElement).closest('tbody tr');
                    if (target && !(e.target as HTMLElement).closest('a, button, input, label')) {
                      // Get the row data from the table instance
                      const rowElement = target;
                      const rowIndex = Array.from(target.parentElement?.children || []).indexOf(rowElement);
                      const product = data?.products?.[rowIndex];
                      if (product) {
                        handleRowClick(product.id);
                      }
                    }
                  }}
                >
                  <DataTable.Table />
                </div>
              </div>
              <div className="flex-shrink-0">
                <DataTable.Pagination />
              </div>
              <div className="flex-shrink-0">
                <DataTable.CommandBar
                  selectedLabel={(count) => `${count} selected`}
                />
              </div>
            </>
          ) : (
            !isLoading && (
              <div className="py-12 flex justify-center">
                <Text className="text-ui-fg-subtle">No products found</Text>
              </div>
            )
          )}
        </DataTable>
      </div>
      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Products List",
  icon: ShoppingBag,
});

export default ProductsListPage;
