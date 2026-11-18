-- The next-visit taste question for items the shopper marked "Bought it" (product spec §2 primary metrics, §5 Item page).
-- Privacy (engineering plan §7): the date only, never a time, an IP or anything about where the shopper is.
CREATE TABLE taste (
  id INTEGER PRIMARY KEY,
  received_on TEXT NOT NULL,            -- server date, YYYY-MM-DD (UTC)
  app_version TEXT NOT NULL,            -- the build that showed the verdict when the shopper bought it
  item TEXT NOT NULL,
  half_month INTEGER NOT NULL CHECK (half_month BETWEEN 0 AND 23), -- the window the shopper bought in (0 = early Jan)
  verdict TEXT NOT NULL CHECK (verdict IN ('peak', 'good', 'skip', 'limited')),
  taste TEXT NOT NULL CHECK (taste IN ('great', 'ok', 'disappointing')),
  label_origin TEXT,                    -- set when the shopper picked an origin in "What does the label say?"
  label_variety TEXT                    -- or a variety
);
CREATE INDEX taste_item_window ON taste (item, half_month);
