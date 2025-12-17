# Product Filter API - cURL Examples

## Base URL

```
GET /store/products/filter
```

## Basic Examples

### 1. Get all products (with default pagination)

```bash
curl -X GET "http://localhost:9000/store/products/filter" \
  -H "Content-Type: application/json"
```

### 2. Filter by brand slug

```bash
curl -X GET "http://localhost:9000/store/products/filter?brand_slug=nike" \
  -H "Content-Type: application/json"
```

### 3. Filter by brand ID

```bash
curl -X GET "http://localhost:9000/store/products/filter?brand_id=brand_123" \
  -H "Content-Type: application/json"
```

### 4. Filter by category name

```bash
curl -X GET "http://localhost:9000/store/products/filter?category_name=Shirts" \
  -H "Content-Type: application/json"
```

### 5. Filter by multiple categories (comma-separated)

```bash
curl -X GET "http://localhost:9000/store/products/filter?category_name=Shirts,Shoes" \
  -H "Content-Type: application/json"
```

### 6. Filter by category ID

```bash
curl -X GET "http://localhost:9000/store/products/filter?category_id=cat_123" \
  -H "Content-Type: application/json"
```

### 7. Filter by price range

```bash
curl -X GET "http://localhost:9000/store/products/filter?min_price=10&max_price=100&currency_code=USD" \
  -H "Content-Type: application/json"
```

### 8. Filter by minimum price only

```bash
curl -X GET "http://localhost:9000/store/products/filter?min_price=50" \
  -H "Content-Type: application/json"
```

### 9. Filter by maximum price only

```bash
curl -X GET "http://localhost:9000/store/products/filter?max_price=200" \
  -H "Content-Type: application/json"
```

### 10. Filter by metadata (using query parameters)

```bash
curl -X GET "http://localhost:9000/store/products/filter?metadata_gender=male&metadata_size=large" \
  -H "Content-Type: application/json"
```

### 11. Filter by metadata (JSON string - URL encoded)

```bash
curl -X GET "http://localhost:9000/store/products/filter?metadata=%7B%22gender%22%3A%22male%22%2C%22size%22%3A%22large%22%7D" \
  -H "Content-Type: application/json"
```

### 12. Filter by metadata with array values

```bash
curl -X GET "http://localhost:9000/store/products/filter?metadata_tags=tag1,tag2" \
  -H "Content-Type: application/json"
```

### 13. Filter by product status

```bash
curl -X GET "http://localhost:9000/store/products/filter?status=published" \
  -H "Content-Type: application/json"
```

## Combined Filters

### 14. Brand + Price Range

```bash
curl -X GET "http://localhost:9000/store/products/filter?brand_slug=nike&min_price=50&max_price=200" \
  -H "Content-Type: application/json"
```

### 15. Brand + Category + Price Range

```bash
curl -X GET "http://localhost:9000/store/products/filter?brand_slug=nike&category_name=Shirts&min_price=50&max_price=200" \
  -H "Content-Type: application/json"
```

### 16. Category + Metadata + Price Range

```bash
curl -X GET "http://localhost:9000/store/products/filter?category_name=Shirts&metadata_gender=male&metadata_size=large&min_price=30&max_price=150" \
  -H "Content-Type: application/json"
```

### 17. All filters combined

```bash
curl -X GET "http://localhost:9000/store/products/filter?brand_slug=nike&category_name=Shirts,Shoes&min_price=50&max_price=200&metadata_gender=male&status=published" \
  -H "Content-Type: application/json"
```

## Pagination & Sorting

### 18. With pagination

```bash
curl -X GET "http://localhost:9000/store/products/filter?limit=10&offset=0" \
  -H "Content-Type: application/json"
```

### 19. Sort by title (ascending)

```bash
curl -X GET "http://localhost:9000/store/products/filter?order=title&order_direction=asc" \
  -H "Content-Type: application/json"
```

### 20. Sort by created date (descending - default)

```bash
curl -X GET "http://localhost:9000/store/products/filter?order=created_at&order_direction=desc" \
  -H "Content-Type: application/json"
```

### 21. Sort by updated date

```bash
curl -X GET "http://localhost:9000/store/products/filter?order=updated_at&order_direction=desc" \
  -H "Content-Type: application/json"
```

### 22. Complete example with all options

```bash
curl -X GET "http://localhost:9000/store/products/filter?brand_slug=nike&category_name=Shirts&min_price=50&max_price=200&metadata_gender=male&status=published&limit=20&offset=0&order=title&order_direction=asc&currency_code=USD" \
  -H "Content-Type: application/json"
```

## Advanced Examples

### 23. Filter by multiple metadata fields

```bash
curl -X GET "http://localhost:9000/store/products/filter?metadata_gender=male&metadata_size=large&metadata_color=blue&metadata_material=cotton" \
  -H "Content-Type: application/json"
```

### 24. Filter with different currency

```bash
curl -X GET "http://localhost:9000/store/products/filter?min_price=10&max_price=100&currency_code=EUR" \
  -H "Content-Type: application/json"
```

### 25. Get second page of results

```bash
curl -X GET "http://localhost:9000/store/products/filter?limit=20&offset=20" \
  -H "Content-Type: application/json"
```

## Response Format

All requests return a JSON response in this format:

```json
{
  "products": [
    {
      "id": "prod_123",
      "title": "Product Name",
      "handle": "product-name",
      "description": "Product description",
      "subtitle": "Product subtitle",
      "status": "published",
      "thumbnail": "https://...",
      "images": [
        {
          "id": "img_123",
          "url": "https://...",
          "created_at": "2024-01-01T00:00:00Z",
          "updated_at": "2024-01-01T00:00:00Z"
        }
      ],
      "categories": [
        {
          "id": "cat_123",
          "name": "Shirts",
          "handle": "shirts",
          "description": "Category description"
        }
      ],
      "variants": [
        {
          "id": "var_123",
          "title": "Variant Title",
          "sku": "SKU123",
          "price": 1000,
          "price_formatted": "$10.00",
          "prices": [
            {
              "amount": 1000,
              "currency_code": "USD",
              "formatted": "$10.00"
            }
          ],
          "inventory_quantity": 50,
          "manage_inventory": true,
          "allow_backorder": false,
          "requires_shipping": true
        }
      ],
      "brand": {
        "id": "brand_123",
        "name": "Brand Name",
        "slug": "brand-slug",
        "description": "Brand description",
        "logo": "https://...",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      },
      "price": 1000,
      "price_formatted": "$10.00",
      "min_price": 1000,
      "min_price_formatted": "$10.00",
      "max_price": 2000,
      "max_price_formatted": "$20.00",
      "price_range": {
        "min": 1000,
        "max": 2000,
        "min_formatted": "$10.00",
        "max_formatted": "$20.00"
      },
      "currency_code": "USD",
      "metadata": {
        "gender": "male",
        "size": "large"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "discountable": true,
      "is_giftcard": false
    }
  ],
  "count": 50,
  "limit": 20,
  "offset": 0,
  "has_more": true
}
```

## Query Parameters Reference

| Parameter         | Type          | Description                                                             | Example                                                |
| ----------------- | ------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `brand_id`        | string        | Filter by brand ID                                                      | `brand_id=brand_123`                                   |
| `brand_slug`      | string        | Filter by brand slug                                                    | `brand_slug=nike`                                      |
| `category_id`     | string/array  | Filter by category ID(s)                                                | `category_id=cat_123` or `category_id=cat_123,cat_456` |
| `category_name`   | string/array  | Filter by category name(s)                                              | `category_name=Shirts` or `category_name=Shirts,Shoes` |
| `min_price`       | number        | Minimum price filter                                                    | `min_price=10`                                         |
| `max_price`       | number        | Maximum price filter                                                    | `max_price=100`                                        |
| `currency_code`   | string        | Currency for price filtering (default: USD)                             | `currency_code=EUR`                                    |
| `metadata`        | object/string | Metadata filters (JSON or query params)                                 | `metadata={"key":"value"}` or `metadata_key=value`     |
| `limit`           | number        | Results per page (1-100, default: 20)                                   | `limit=10`                                             |
| `offset`          | number        | Pagination offset (default: 0)                                          | `offset=20`                                            |
| `order`           | string        | Sort field: `created_at`, `updated_at`, `title` (default: `created_at`) | `order=title`                                          |
| `order_direction` | string        | Sort direction: `asc`, `desc` (default: `desc`)                         | `order_direction=asc`                                  |
| `status`          | string        | Filter by status: `draft`, `published`, `proposed`, `rejected`          | `status=published`                                     |

## Notes

- Prices are stored in cents (smallest currency unit). The API returns both raw amounts and formatted strings.
- Metadata can be filtered using `metadata_*` query parameters or a JSON string in the `metadata` parameter.
- Multiple category filters use OR logic (products matching any of the categories).
- All metadata filters use AND logic (all specified metadata fields must match).
- Price filtering checks if any variant price falls within the range.
