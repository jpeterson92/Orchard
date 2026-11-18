-- Real-user measurement (engineering plan §5 M8, §7 Privacy): one count per UTC day, metric and value bucket.
-- No row describes a visit: no time of day, IP, page, device or location.
CREATE TABLE measure (
  day TEXT NOT NULL,        -- YYYY-MM-DD, the server's UTC date
  metric TEXT NOT NULL,     -- lcp, inp, cls or verdict (src/shared/measure.ts)
  bucket INTEGER NOT NULL,  -- the bucket's upper edge: ms, or CLS in hundredths
  n INTEGER NOT NULL,       -- page loads counted
  PRIMARY KEY (day, metric, bucket)
) WITHOUT ROWID;
