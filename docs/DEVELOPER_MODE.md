# Developer Mode - JSON Menu Import

## Overview

The Developer Mode feature allows developers and power users to quickly create menus by importing JSON data. This feature is integrated directly into the Create Menu page as a toggle, providing a seamless transition between visual menu building and programmatic JSON import.

This is perfect for:

- Bulk menu imports
- Programmatic menu creation
- Development and testing scenarios
- Migrating from other systems

## How to Access

1. Navigate to your Dashboard
2. Click on "Create Menu"
3. Toggle "Developer Mode" in the navigation bar
4. Switch between visual builder and JSON import modes as needed

## JSON Structure

### Required Fields

- `name`: Menu name (string)
- `restaurant_name`: Restaurant name (string)
- `sections`: Array of menu sections

### Optional Fields

- `description`: Menu description (string)
- `currency`: Currency code (string, defaults to "USD")

### Section Structure

- `name`: Section name (string, required)
- `description`: Section description (string, optional)
- `items`: Array of menu items (required)

### Item Structure

- `name`: Item name (string, required)
- `price`: Item price (number, required)
- `description`: Item description (string, optional)
- `image_url`: Image URL (string, optional)
- `is_available`: Availability status (boolean, optional, defaults to true)

## Example JSON

```json
{
  "name": "Lunch Special",
  "restaurant_name": "Mario's Pizzeria",
  "description": "Our delicious lunch offerings",
  "currency": "USD",
  "sections": [
    {
      "name": "Appetizers",
      "description": "Start your meal right",
      "items": [
        {
          "name": "Garlic Bread",
          "description": "Fresh baked bread with garlic and herbs",
          "price": 8.99,
          "is_available": true
        },
        {
          "name": "Caesar Salad",
          "description": "Crisp romaine with parmesan and croutons",
          "price": 12.99,
          "is_available": true
        }
      ]
    },
    {
      "name": "Main Courses",
      "description": "Hearty and satisfying",
      "items": [
        {
          "name": "Margherita Pizza",
          "description": "Fresh mozzarella, tomato sauce, and basil",
          "price": 18.99,
          "is_available": true
        },
        {
          "name": "Chicken Parmesan",
          "description": "Breaded chicken with marinara and mozzarella",
          "price": 24.99,
          "is_available": true
        }
      ]
    }
  ]
}
```

## API Endpoint

### POST /api/menus/developer-import

Import a menu using JSON data.

**Headers:**

- `Content-Type: application/json`
- Authentication required (user must be signed in)

**Request Body:** Menu JSON (see structure above)

**Response:**

```json
{
  "menu": {
    "id": "uuid",
    "name": "Menu Name",
    "restaurant_name": "Restaurant Name",
    "sections": [...]
  },
  "message": "Menu imported successfully"
}
```

## Error Handling

The developer import provides detailed error messages:

- **Menu name required**: Empty or missing menu name
- **Restaurant name required**: Empty or missing restaurant name
- **At least one section required**: No sections provided
- **Section name required**: Missing section name
- **Items array required**: Missing or invalid items array
- **Item name required**: Missing item name
- **Price validation**: Invalid or missing price (must be positive number)

## Features

### Seamless Integration

- Toggle between visual builder and JSON import within the same interface
- No need to navigate between different pages
- Maintain context while switching modes

### Enhanced Validation

- Field-specific error messages
- Detailed validation feedback
- Structure validation before import

### Automatic Processing

- Automatic sort order assignment
- Default value handling for optional fields
- Complete menu structure creation

### Developer Friendly

- JSON syntax validation
- Clear error messages
- Example data provided
- Load example button for quick testing

## Use Cases

1. **Development Testing**: Quickly create test menus with realistic data
2. **Data Migration**: Import menus from other systems
3. **Bulk Operations**: Create multiple menus programmatically
4. **API Integration**: Use with external systems or scripts
5. **Rapid Prototyping**: Switch between visual design and programmatic creation
6. **Hybrid Workflows**: Start with JSON import, then fine-tune with visual editor

## Notes

- All menus created via developer import are initially in draft status
- You can publish and manage imported menus like any other menu
- The import preserves the order of sections and items as specified in the JSON
- Image URLs are stored as-is and should be valid, accessible URLs

## Security

- Only authenticated users can access developer mode
- All imported menus are associated with the authenticated user
- Standard menu ownership and permission rules apply
