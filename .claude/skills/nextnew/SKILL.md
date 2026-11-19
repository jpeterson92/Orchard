---
name: nextnew
description: Start the next Orchard increment (/next) in a fresh session and archive this one, so long conversations don't build up. Run when Jared types /nextnew, or says yes to "Run /nextnew?".
---

# /nextnew: hand the next increment to a fresh session

Follow CLAUDE.md throughout. Keep chat output to one or two lines.

1. **Leave nothing behind.** Run `git status --short`. If this session left uncommitted work, commit it per CLAUDE.md (checks in proportion) and update `PROGRESS.md` first. If something can't be committed cleanly, stop and tell Jared instead of archiving.
2. **Start the new session** with `mcp__ccd_session__start_session` (load it with ToolSearch if it's deferred):
   - `initiation: "user_asked"`, `context: "fresh"`, `use_worktree: false`, `title: "Next increment"`
   - `prompt`: "Run the /next increment: read `.claude/skills/next/SKILL.md` and follow it exactly."
   - `background`: "Orchard (see CLAUDE.md and PROGRESS.md). The previous session ended so this one starts with a small context; PROGRESS.md holds the next concrete action."
3. **Detach it** with `mcp__ccd_session_mgmt__detach_session` and the new session's id, so archiving this session doesn't archive it too.
4. **Hand off:** write one line linking the new session ([Next increment](#local_<id>)) and saying this session is being archived. Then call `mcp__ccd_session_mgmt__archive_session` with `session_id: "self"`. The app often refuses (the session is open on screen, or Remote Control counts as live work); then say in one line that Jared can archive it from the sidebar.
