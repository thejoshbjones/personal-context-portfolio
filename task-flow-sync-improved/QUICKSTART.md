# Quick Start - Task Flow Sync (Improved)

## Installation (One Command)

```bash
SKILL_DIR="/var/folders/pg/h422m1s15tb4fct7d_2_6b7r0000gn/T/claude-hostloop-plugins/186d395eb6c99b8c/skills/task-flow-sync" && \
SOURCE_DIR="/Users/joshuajones/GitHub/personal-context-portfolio/task-flow-sync-improved" && \
cp -r "$SKILL_DIR" "$SKILL_DIR.backup.$(date +%Y%m%d)" && \
cp "$SOURCE_DIR"/*.py "$SKILL_DIR/" && \
cp "$SOURCE_DIR"/*.md "$SKILL_DIR/" && \
chmod +x "$SKILL_DIR/thread_tasks.py" && \
echo "✅ Done! Test with: cd $SKILL_DIR && python3 thread_tasks.py --mode monthly --current-page 47"
```

## Usage

### Basic (with preview)
```bash
python3 thread_tasks.py --mode monthly --current-page 47
```

### Auto-apply (no preview)
```bash
python3 thread_tasks.py --mode monthly --current-page 47 --no-preview
```

### Custom path
```bash
python3 thread_tasks.py --mode monthly --current-page 47 --portfolio-path /custom/path
```

## What to Expect

```
✓ Found portfolio at local path: /sessions/.../personal-context-portfolio

======================================================================
PREVIEW: Found 10 open tasks to thread forward
From: Earlier dates in July 2026
To: 2026-07-13 (page 47)
======================================================================

 1. [2026-07-07 p.47] Look at flight and logistics options...
 2. [2026-07-07 p.47] Datacenter Phone Plan
...

======================================================================

Apply these changes? (yes/no): yes

======================================================================
Status: SUCCESS
Message: Successfully threaded 10 tasks forward to 2026-07-13
Tasks threaded: 10
======================================================================
```

## Rollback

```bash
SKILL_DIR="/var/folders/pg/h422m1s15tb4fct7d_2_6b7r0000gn/T/claude-hostloop-plugins/186d395eb6c99b8c/skills/task-flow-sync"
rm -rf "$SKILL_DIR"
cp -r "$SKILL_DIR.backup.YYYYMMDD" "$SKILL_DIR"
```

## Files Included

- `thread_tasks.py` - Executable script (the automation)
- `SKILL.md` - Updated skill documentation
- `README.md` - Overview of improvements
- `IMPROVEMENTS.md` - Detailed before/after comparison
- `INSTALLATION.md` - Full installation guide (this summary)
- `QUICKSTART.md` - This file

## Key Improvements

| Before | After |
|--------|-------|
| 15+ messages | 2-3 messages |
| ~10 minutes | ~2 minutes |
| Write Python each time | One command |
| No preview | Preview with confirmation |
| Manual file access | Auto-detection |
| Trial and error | Clear error messages |

## Troubleshooting

**Portfolio not found?**
```bash
python3 thread_tasks.py --mode monthly --current-page 47 --portfolio-path /Users/joshuajones/GitHub/personal-context-portfolio
```

**Need help?**
```bash
python3 thread_tasks.py --help
```

**Test without changes?**
- Preview mode is default - just say "no" when prompted

## Next Steps

1. Install (one command above)
2. Test with preview mode
3. Confirm it works as expected
4. Use `/task-flow-sync` in Claude (it will use the new script)
5. Enjoy faster task threading!

---

For full documentation, see `INSTALLATION.md`
