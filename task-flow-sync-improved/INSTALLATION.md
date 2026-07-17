# Installation Guide - Task Flow Sync (Improved)

This guide will help you replace the existing task-flow-sync skill with the improved version.

## Prerequisites

- Python 3.6 or higher
- Existing task-flow-sync skill installed
- Personal Context Portfolio at `/Users/joshuajones/GitHub/personal-context-portfolio`

## Installation Steps

### Step 1: Backup the Existing Skill

First, create a backup of your current skill in case you need to rollback:

```bash
# Find the skill directory
SKILL_DIR="/var/folders/pg/h422m1s15tb4fct7d_2_6b7r0000gn/T/claude-hostloop-plugins/186d395eb6c99b8c/skills/task-flow-sync"

# Create backup
cp -r "$SKILL_DIR" "$SKILL_DIR.backup.$(date +%Y%m%d)"

echo "Backup created at: $SKILL_DIR.backup.$(date +%Y%m%d)"
```

### Step 2: Install the New Version

Copy the new files into the skill directory:

```bash
# Source directory (where the improved skill files are)
SOURCE_DIR="/Users/joshuajones/GitHub/personal-context-portfolio/task-flow-sync-improved"

# Destination (the actual skill directory)
SKILL_DIR="/var/folders/pg/h422m1s15tb4fct7d_2_6b7r0000gn/T/claude-hostloop-plugins/186d395eb6c99b8c/skills/task-flow-sync"

# Copy the Python script
cp "$SOURCE_DIR/thread_tasks.py" "$SKILL_DIR/"

# Copy the updated SKILL.md (replaces the old one)
cp "$SOURCE_DIR/SKILL.md" "$SKILL_DIR/"

# Copy documentation
cp "$SOURCE_DIR/README.md" "$SKILL_DIR/"
cp "$SOURCE_DIR/IMPROVEMENTS.md" "$SKILL_DIR/"

# Make script executable
chmod +x "$SKILL_DIR/thread_tasks.py"

echo "Installation complete!"
```

### Step 3: Verify Installation

Check that all files are in place:

```bash
SKILL_DIR="/var/folders/pg/h422m1s15tb4fct7d_2_6b7r0000gn/T/claude-hostloop-plugins/186d395eb6c99b8c/skills/task-flow-sync"

ls -lh "$SKILL_DIR"

# Should show:
# - SKILL.md (new version, ~8KB)
# - thread_tasks.py (executable, ~10KB)
# - README.md (~2KB)
# - IMPROVEMENTS.md (~6KB)
```

### Step 4: Test the Installation

Run a test with preview mode (won't make changes until you confirm):

```bash
cd "$SKILL_DIR"
python3 thread_tasks.py --mode monthly --current-page 47
```

Expected output:
```
✓ Found portfolio at local path: /sessions/.../personal-context-portfolio

======================================================================
PREVIEW: Found X open tasks to thread forward
...
======================================================================

Apply these changes? (yes/no):
```

Type `no` to cancel and verify the preview looks correct.

### Step 5: Test Help Command

Verify the script options:

```bash
cd "$SKILL_DIR"
python3 thread_tasks.py --help
```

Should show all available options and modes.

## Usage After Installation

Once installed, the skill works the same way but now uses the automated script:

### From Claude

When you invoke the skill (`/task-flow-sync`), Claude will:

1. Ask for your current page number
2. Run: `python3 thread_tasks.py --mode monthly --current-page {PAGE}`
3. Show you the preview
4. Wait for your confirmation
5. Apply changes and report success

### Manually (for testing)

You can also run it manually:

```bash
# Navigate to skill directory
cd /var/folders/pg/h422m1s15tb4fct7d_2_6b7r0000gn/T/claude-hostloop-plugins/186d395eb6c99b8c/skills/task-flow-sync

# Run with preview (default)
python3 thread_tasks.py --mode monthly --current-page 47

# Run without preview (auto-apply)
python3 thread_tasks.py --mode monthly --current-page 47 --no-preview

# Run with custom portfolio path
python3 thread_tasks.py --mode monthly --current-page 47 --portfolio-path /custom/path
```

## Rollback Procedure

If you need to revert to the old version:

```bash
# Find your backup
SKILL_DIR="/var/folders/pg/h422m1s15tb4fct7d_2_6b7r0000gn/T/claude-hostloop-plugins/186d395eb6c99b8c/skills/task-flow-sync"
BACKUP_DIR="$SKILL_DIR.backup.YYYYMMDD"  # Replace with actual backup date

# Remove new version
rm -rf "$SKILL_DIR"

# Restore backup
cp -r "$BACKUP_DIR" "$SKILL_DIR"

echo "Rollback complete"
```

## Troubleshooting

### "Portfolio not found" error

The script tries multiple paths automatically. If it can't find your portfolio:

```bash
python3 thread_tasks.py --mode monthly --current-page 47 \
  --portfolio-path /Users/joshuajones/GitHub/personal-context-portfolio
```

### "Month file not found" error

Check that your month file exists and matches one of these formats:
- `2026-July.md`
- `2026-07.md`

### Script not executable

```bash
chmod +x /var/folders/.../skills/task-flow-sync/thread_tasks.py
```

### Python version issues

Check your Python version:
```bash
python3 --version
```

Should be 3.6 or higher.

## Verifying Success

After installation, the skill should:

1. ✅ Run with one command instead of multiple conversation turns
2. ✅ Show preview before making changes
3. ✅ Auto-detect your portfolio location
4. ✅ Handle KRISP attribution correctly
5. ✅ Skip already-threaded tasks
6. ✅ Report clear success/failure messages

## Next Steps

1. **Test with real data** - Run the skill on your actual journal
2. **Confirm behavior** - Verify tasks are threaded correctly
3. **Report issues** - If you find bugs, note them for fixes
4. **Request features** - Daily and KRISP modes can be added

## File Structure After Installation

```
/var/folders/.../skills/task-flow-sync/
├── SKILL.md              (updated documentation)
├── thread_tasks.py       (new executable script)
├── README.md             (new - explains improvements)
└── IMPROVEMENTS.md       (new - detailed comparison)

/var/folders/.../skills/task-flow-sync.backup.YYYYMMDD/
└── (original files, preserved for rollback)
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify Python 3.6+ is installed
3. Confirm portfolio path is accessible
4. Review the error message - they're designed to be helpful
5. Try with `--portfolio-path` explicitly set

## Clean Up

After verifying the new version works well for a few weeks, you can remove old backups:

```bash
# List backups
ls -d /var/folders/.../skills/task-flow-sync.backup.*

# Remove old backups (keep most recent)
rm -rf /var/folders/.../skills/task-flow-sync.backup.YYYYMMDD
```

---

## One-Liner Installation

For quick installation (after reading the above):

```bash
SKILL_DIR="/var/folders/pg/h422m1s15tb4fct7d_2_6b7r0000gn/T/claude-hostloop-plugins/186d395eb6c99b8c/skills/task-flow-sync" && \
SOURCE_DIR="/Users/joshuajones/GitHub/personal-context-portfolio/task-flow-sync-improved" && \
cp -r "$SKILL_DIR" "$SKILL_DIR.backup.$(date +%Y%m%d)" && \
cp "$SOURCE_DIR/thread_tasks.py" "$SKILL_DIR/" && \
cp "$SOURCE_DIR/SKILL.md" "$SKILL_DIR/" && \
cp "$SOURCE_DIR/README.md" "$SKILL_DIR/" && \
cp "$SOURCE_DIR/IMPROVEMENTS.md" "$SKILL_DIR/" && \
chmod +x "$SKILL_DIR/thread_tasks.py" && \
echo "✅ Installation complete! Backup at: $SKILL_DIR.backup.$(date +%Y%m%d)"
```
