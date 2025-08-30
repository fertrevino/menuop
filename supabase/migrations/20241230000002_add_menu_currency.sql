-- Add currency field to menus table
ALTER TABLE menus ADD COLUMN currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'MXN', 'BRL', 'KRW', 'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'TRY', 'ZAR', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'EGP', 'CLP', 'ARS', 'COP', 'PEN', 'UYU'));

-- Update existing menus to have USD as default currency
UPDATE menus SET currency = 'USD' WHERE currency IS NULL;

-- Make currency NOT NULL after setting defaults
ALTER TABLE menus ALTER COLUMN currency SET NOT NULL;

-- Add comment to the column
COMMENT ON COLUMN menus.currency IS 'ISO 4217 currency code for menu pricing';
