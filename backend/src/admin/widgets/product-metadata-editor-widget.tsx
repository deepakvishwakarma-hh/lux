import { defineWidgetConfig } from "@medusajs/admin-sdk";
import {
  Container,
  Heading,
  Button,
  Text,
  Input,
  Label,
  Textarea,
  Select,
  Checkbox,
  toast,
} from "@medusajs/ui";
import { AdminProduct, DetailWidgetProps } from "@medusajs/types";
import { useState, useEffect } from "react";
import { sdk } from "../lib/config";

// Field type definition
type FieldType = "text" | "number" | "textarea" | "select" | "checkbox";

interface MetadataField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

// Field configuration - exact field names as specified
const METADATA_FIELDS: MetadataField[] = [
  { key: "size", label: "Size", type: "text" },
  { key: "model", label: "Model", type: "text" },
  { key: "shape", label: "Shape", type: "text" },
  { key: "gender", label: "Gender", type: "text" },
  { key: "keywords", label: "Keywords", type: "text" },
  { key: "age_group", label: "Age Group", type: "text" },
  { key: "condition", label: "Condition", type: "text" },
  { key: "rim_style", label: "Rim Style", type: "text" },
  { key: "arm_length", label: "Arm Length", type: "text" },
  { key: "color_code", label: "Color Code", type: "text" },
  { key: "lens_width", label: "Lens Width", type: "text" },
  { key: "lens_bridge", label: "Lens Bridge", type: "text" },
  { key: "sales_price", label: "Sales Price", type: "number" },
  { key: "purchase_cost", label: "Purchase Cost", type: "number" },
  { key: "regular_price", label: "Regular Price", type: "number" },
  { key: "frame_material", label: "Frame Material", type: "text" },
  { key: "region_availability", label: "Region Availability", type: "text" },
];

// Helper function to format field value for display
const formatFieldValue = (value: any, fieldType: string): string => {
  if (value === null || value === undefined) return "";
  if (fieldType === "textarea" && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
};

// Helper function to parse field value for storage
const parseFieldValue = (value: string, fieldType: string, originalValue: any): any => {
  if (!value || value.trim() === "") {
    return null;
  }

  if (fieldType === "number") {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  if (fieldType === "checkbox") {
    if (typeof value === "boolean") {
      return value;
    }
    return value === "true";
  }

  if (fieldType === "textarea") {
    // Try to parse as JSON if it looks like JSON
    if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  // Handle comma-separated arrays
  if (fieldType === "text" && (value.includes(",") || originalValue === "array")) {
    return value.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
  }

  return value;
};

// The widget component
const ProductMetadataEditorWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  // Initialize metadata with default values for missing fields
  useEffect(() => {
    const currentMetadata = data.metadata || {};
    const initializedMetadata: Record<string, any> = { ...currentMetadata };

    // Initialize all fields with null if they don't exist
    METADATA_FIELDS.forEach((field) => {
      if (!(field.key in initializedMetadata)) {
        initializedMetadata[field.key] = null;
      }
    });

    setMetadata(initializedMetadata);
  }, [data.metadata]);

  const handleFieldChange = (key: string, value: any, fieldType: string, originalValue: any) => {
    const parsedValue = parseFieldValue(value, fieldType, originalValue);
    setMetadata((prev) => ({
      ...prev,
      [key]: parsedValue,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get all field keys from our configuration
      const configuredFieldKeys = new Set(METADATA_FIELDS.map((field) => field.key));

      // Start with existing metadata to preserve any fields not in our configuration
      const currentMetadata = data.metadata || {};
      const updatedMetadata: Record<string, any> = { ...currentMetadata };

      // Update with our edited values
      Object.entries(metadata).forEach(([key, value]) => {
        if (configuredFieldKeys.has(key)) {
          // Only update configured fields
          if (value !== null && value !== undefined && value !== "") {
            updatedMetadata[key] = value;
          } else {
            // Remove the field if it's set to null/empty and it's a configured field
            delete updatedMetadata[key];
          }
        }
      });

      await sdk.admin.product.update(data.id, {
        metadata: updatedMetadata,
      });

      toast.success("Product metadata saved successfully");
    } catch (error) {
      console.error("Failed to save metadata:", error);
      toast.error("Failed to save product metadata");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    const currentMetadata = data.metadata || {};

    // Compare only configured fields
    for (const field of METADATA_FIELDS) {
      const key = field.key;
      const currentValue = currentMetadata[key];
      const newValue = metadata[key];

      // Normalize values for comparison (handle null/undefined/empty string)
      const normalizedCurrent = currentValue === null || currentValue === undefined || currentValue === "" ? null : currentValue;
      const normalizedNew = newValue === null || newValue === undefined || newValue === "" ? null : newValue;

      if (JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedNew)) {
        return true;
      }
    }

    return false;
  };

  return (
    <Container className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header Section */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <Heading level="h2" className="text-xl font-semibold text-gray-900 mb-2">
          Product Details
        </Heading>
        <Text className="text-sm text-gray-500">
          Edit product metadata fields. Missing fields will be added automatically.
        </Text>
      </div>

      {/* Fields */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {METADATA_FIELDS.map((field) => {
            const fieldValue = metadata[field.key];
            const displayValue = formatFieldValue(fieldValue, field.type);
            const isEmpty = fieldValue === null || fieldValue === undefined || displayValue === "";

            return (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                  {field.label}
                  {isEmpty && (
                    <span className="ml-2 text-xs text-yellow-600 font-normal">
                      (Missing)
                    </span>
                  )}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={displayValue}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value, field.type, fieldValue)
                    }
                    rows={4}
                    className={`w-full ${isEmpty ? "border-yellow-400 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500" : ""}`}
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={displayValue || ""}
                    onValueChange={(value) =>
                      handleFieldChange(field.key, value, field.type, fieldValue)
                    }
                  >
                    <Select.Trigger className={isEmpty ? "border-yellow-400 bg-yellow-50" : ""}>
                      <Select.Value placeholder="Select..." />
                    </Select.Trigger>
                    <Select.Content>
                      {field.options?.map((option: string) => (
                        <Select.Item key={option} value={option}>
                          {option}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.key}
                      checked={fieldValue === true || (typeof fieldValue === "string" && fieldValue === "true")}
                      onCheckedChange={(checked) =>
                        handleFieldChange(field.key, String(checked), field.type, fieldValue)
                      }
                    />
                    <Label htmlFor={field.key} className="cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type === "number" ? "number" : "text"}
                    value={displayValue}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value, field.type, fieldValue)
                    }
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    className={`w-full ${isEmpty ? "border-yellow-400 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500" : ""}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => {
            const currentMetadata = data.metadata || {};
            const initializedMetadata: Record<string, any> = { ...currentMetadata };
            METADATA_FIELDS.forEach((field) => {
              if (!(field.key in initializedMetadata)) {
                initializedMetadata[field.key] = null;
              }
            });
            setMetadata(initializedMetadata);
          }}
          className="min-w-[100px]"
        >
          Reset
        </Button>
        <Button
          variant="primary"
          disabled={loading || !hasChanges()}
          onClick={handleSave}
          className="min-w-[100px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductMetadataEditorWidget;
