import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
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
  StatusBadge,
  Toaster,
  DataTablePaginationState,
  Text,
  Input,
  Select,
  DropdownMenu,
  Button,
  Label,
} from "@medusajs/ui";
import { sdk } from "../../lib/config";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ProductQuery = {
  id: string;
  type: "question" | "custom_delivery" | "customize_product";
  product_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  subject: string;
  message: string;
  address: {
    address_1: string;
    address_2?: string | null;
    city: string;
    state?: string | null;
    postal_code: string;
    country: string;
    country_code?: string | null;
  };
  status: "new" | "read" | "responded";
  created_at: Date;
  updated_at: Date;
};

const columnHelper = createDataTableColumnHelper<ProductQuery>();

const ActionsMenu = ({
  query,
  onRefetch,
}: {
  query: ProductQuery;
  onRefetch: () => void;
}) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>(query.status);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (status: string) => {
      return sdk.client.fetch(`/admin/product-queries/${query.id}`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-queries"] });
      toast.success("Status updated successfully");
      setIsUpdateOpen(false);
      onRefetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return sdk.client.fetch(`/admin/product-queries/${query.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-queries"] });
      toast.success("Query deleted successfully");
      onRefetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete query");
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete this query? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const handleUpdate = () => {
    updateMutation.mutate(updateStatus);
  };

  return (
    <>
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
          <DropdownMenu.Item onClick={() => setIsViewOpen(true)}>
            View
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={() => setIsUpdateOpen(true)}>
            Update Status
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onClick={handleDelete}
            className="text-ui-fg-destructive"
          >
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      {/* View Modal */}
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <Heading level="h2">Product Query Details</Heading>
                <Button
                  variant="transparent"
                  size="small"
                  onClick={() => setIsViewOpen(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Type</Label>
                <Text>
                  {query.type === "question"
                    ? "Question"
                    : query.type === "custom_delivery"
                    ? "Custom Delivery"
                    : "Customize Product"}
                </Text>
              </div>
              <div>
                <Label>Status</Label>
                <StatusBadge
                  color={
                    query.status === "responded"
                      ? "green"
                      : query.status === "read"
                      ? "blue"
                      : "grey"
                  }
                >
                  {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                </StatusBadge>
              </div>
              <div>
                <Label>Customer Name</Label>
                <Text>{query.customer_name}</Text>
              </div>
              <div>
                <Label>Email</Label>
                <Text>{query.customer_email}</Text>
              </div>
              <div>
                <Label>Mobile</Label>
                <Text>{query.customer_mobile}</Text>
              </div>
              <div>
                <Label>Subject</Label>
                <Text>{query.subject}</Text>
              </div>
              <div>
                <Label>Message</Label>
                <Text className="whitespace-pre-wrap">{query.message}</Text>
              </div>
              <div>
                <Label>Product ID</Label>
                <Link
                  to={`/products/${query.product_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {query.product_id}
                </Link>
              </div>
              <div>
                <Label>Address</Label>
                <Text>
                  {query.address.address_1}
                  {query.address.address_2 && `, ${query.address.address_2}`}
                  <br />
                  {query.address.city}
                  {query.address.state && `, ${query.address.state}`}
                  <br />
                  {query.address.postal_code}, {query.address.country}
                  {query.address.country_code &&
                    ` (${query.address.country_code})`}
                </Text>
              </div>
              <div>
                <Label>Created At</Label>
                <Text>{new Date(query.created_at).toLocaleString()}</Text>
              </div>
              <div>
                <Label>Updated At</Label>
                <Text>{new Date(query.updated_at).toLocaleString()}</Text>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md m-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <Heading level="h2">Update Status</Heading>
                <Button
                  variant="transparent"
                  size="small"
                  onClick={() => setIsUpdateOpen(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="new">New</Select.Item>
                    <Select.Item value="read">Read</Select.Item>
                    <Select.Item value="responded">Responded</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsUpdateOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                isLoading={updateMutation.isPending}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const columns = [
  columnHelper.select(),
  columnHelper.accessor("id", {
    header: "ID",
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: ({ row }) => {
      const typeLabels: Record<string, string> = {
        question: "Question",
        custom_delivery: "Custom Delivery",
        customize_product: "Customize Product",
      };
      return typeLabels[row.original.type] || row.original.type;
    },
  }),
  columnHelper.accessor("customer_name", {
    header: "Customer Name",
  }),
  columnHelper.accessor("customer_email", {
    header: "Email",
  }),
  columnHelper.accessor("customer_mobile", {
    header: "Mobile",
  }),
  columnHelper.accessor("subject", {
    header: "Subject",
  }),
  columnHelper.accessor("message", {
    header: "Message",
    cell: ({ row }) => {
      const message = row.original.message;
      return message.length > 50 ? `${message.substring(0, 50)}...` : message;
    },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => {
      const color =
        row.original.status === "responded"
          ? "green"
          : row.original.status === "read"
          ? "blue"
          : "grey";
      return (
        <StatusBadge color={color}>
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </StatusBadge>
      );
    },
  }),
  columnHelper.accessor("product_id", {
    header: "Product",
    cell: ({ row }) => {
      return (
        <Link to={`/products/${row.original.product_id}`}>
          {row.original.product_id}
        </Link>
      );
    },
  }),
  columnHelper.accessor("created_at", {
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString();
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return <ActionsMenu query={row.original} onRefetch={() => {}} />;
    },
  }),
];

const commandHelper = createDataTableCommandHelper();

const useCommands = (refetch: () => void) => {
  return [
    commandHelper.command({
      label: "Mark as Read",
      shortcut: "R",
      action: async (selection) => {
        const ids = Object.keys(selection);
        await Promise.all(
          ids.map((id) =>
            sdk.client
              .fetch(`/admin/product-queries/${id}`, {
                method: "PATCH",
                body: {
                  status: "read",
                },
              })
              .catch(console.error)
          )
        );
        toast.success("Queries marked as read");
        refetch();
      },
    }),
    commandHelper.command({
      label: "Mark as Responded",
      shortcut: "A",
      action: async (selection) => {
        const ids = Object.keys(selection);
        await Promise.all(
          ids.map((id) =>
            sdk.client
              .fetch(`/admin/product-queries/${id}`, {
                method: "PATCH",
                body: {
                  status: "responded",
                },
              })
              .catch(console.error)
          )
        );
        toast.success("Queries marked as responded");
        refetch();
      },
    }),
  ];
};

const limit = 15;

const ProductQueriesPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [emailFilter, setEmailFilter] = useState<string>("");

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      offset: String(pagination.pageIndex * pagination.pageSize),
      limit: String(pagination.pageSize),
      order: "-created_at",
    };
    if (typeFilter !== "all") {
      params.type = typeFilter;
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (emailFilter) {
      params.email = emailFilter;
    }
    return params;
  }, [pagination, typeFilter, statusFilter, emailFilter]);

  const { data, isLoading, refetch } = useQuery<{
    product_queries: ProductQuery[];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ["product-queries", queryParams],
    queryFn: () =>
      sdk.client.fetch("/admin/product-queries", {
        query: queryParams,
      }),
  });

  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>(
    {}
  );

  const commands = useCommands(refetch);

  // Create columns with refetch function
  const columnsWithActions = useMemo(() => {
    return columns.map((col) => {
      if (col.id === "actions") {
        return {
          ...col,
          cell: ({ row }: any) => (
            <ActionsMenu query={row.original} onRefetch={refetch} />
          ),
        };
      }
      return col;
    });
  }, [refetch]);

  const table = useDataTable({
    columns: columnsWithActions,
    data: data?.product_queries || [],
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

  const hasQueries = !isLoading && (data?.count ?? 0) > 0;

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <Heading>Product Queries</Heading>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Type Filter Tabs */}
            <div className="flex gap-2 border rounded-md p-1">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1 text-sm rounded ${
                  typeFilter === "all"
                    ? "bg-ui-bg-interactive text-ui-fg-on-interactive"
                    : "bg-transparent hover:bg-ui-bg-subtle"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter("question")}
                className={`px-3 py-1 text-sm rounded ${
                  typeFilter === "question"
                    ? "bg-ui-bg-interactive text-ui-fg-on-interactive"
                    : "bg-transparent hover:bg-ui-bg-subtle"
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setTypeFilter("custom_delivery")}
                className={`px-3 py-1 text-sm rounded ${
                  typeFilter === "custom_delivery"
                    ? "bg-ui-bg-interactive text-ui-fg-on-interactive"
                    : "bg-transparent hover:bg-ui-bg-subtle"
                }`}
              >
                Delivery
              </button>
              <button
                onClick={() => setTypeFilter("customize_product")}
                className={`px-3 py-1 text-sm rounded ${
                  typeFilter === "customize_product"
                    ? "bg-ui-bg-interactive text-ui-fg-on-interactive"
                    : "bg-transparent hover:bg-ui-bg-subtle"
                }`}
              >
                Customize
              </button>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger className="w-[150px]">
                <Select.Value placeholder="All Status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All Status</Select.Item>
                <Select.Item value="new">New</Select.Item>
                <Select.Item value="read">Read</Select.Item>
                <Select.Item value="responded">Responded</Select.Item>
              </Select.Content>
            </Select>

            {/* Email Filter */}
            <Input
              type="text"
              placeholder="Filter by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </DataTable.Toolbar>
        {hasQueries ? (
          <>
            <DataTable.Table />
            <DataTable.Pagination />
            <DataTable.CommandBar
              selectedLabel={(count) => `${count} selected`}
            />
          </>
        ) : (
          !isLoading && (
            <div className="py-12 flex justify-center">
              <Text className="text-ui-fg-subtle">No queries found</Text>
            </div>
          )
        )}
      </DataTable>
      <Toaster />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Product Queries",
  icon: ChatBubbleLeftRight,
});

export default ProductQueriesPage;
