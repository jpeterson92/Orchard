-- Diagnostic events (product spec §2; engineering plan §5 M8): one count per UTC day and event.
-- No row describes a visit: no item, search text, time of day, IP, device or location.
CREATE TABLE events (
  day TEXT NOT NULL,    -- YYYY-MM-DD, the server's UTC date
  event TEXT NOT NULL,  -- item, expand, nomatch, visit or return14 (src/shared/measure.ts)
  n INTEGER NOT NULL,   -- times it happened
  PRIMARY KEY (day, event)
) WITHOUT ROWID;
