-- In-store feedback (product spec §2 "In-store feedback keeps outcomes apart", §5 Item page).
-- Privacy (engineering plan §7): the date only, never a time, an IP or anything about where the shopper is.
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  received_on TEXT NOT NULL,            -- server date, YYYY-MM-DD (UTC)
  app_version TEXT NOT NULL,
  item TEXT NOT NULL,
  half_month INTEGER NOT NULL CHECK (half_month BETWEEN 0 AND 23), -- the window the shopper saw (0 = early Jan)
  verdict TEXT NOT NULL CHECK (verdict IN ('peak', 'good', 'skip', 'limited')),
  outcome TEXT NOT NULL CHECK (outcome IN ('looked-good', 'looked-poor', 'not-in-stock', 'too-pricey')),
  label_origin TEXT,                    -- set when the shopper picked an origin in "What does the label say?"
  label_variety TEXT                    -- or a variety
);
CREATE INDEX feedback_item_window ON feedback (item, half_month);
