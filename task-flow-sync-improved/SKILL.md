---
name: "task-flow-sync"
description: "Sync tasks across your execution layer journal—thread daily tasks forward, import KRISP tasks (with preview), and organize monthly open items with thread forward/backward notation."
---

# Task Flow Sync (Improved)

Automated task threading for your Personal Context Portfolio execution layer. This skill includes a Python script that handles all the work automatically with preview mode and smart file detection.

## Quick Start

The skill now includes an executable script that does all the work. You only need to provide the page number:

```bash
python3 thread_tasks.py --mode monthly --current-page 47
```

That's it! The script will:
1. ✓ Auto-detect your portfolio location (local or MCP)
2. ✓ Calculate today's date automatically
3. ✓ Scan for all open tasks before today
4. ✓ Show you a preview of what will change
5. ✓ Wait for your confirmation
6. ✓ Apply the changes
7. ✓ Report success

## What's Improved

### 1. Executable Python Script
No more manual Python coding during the task. The script is ready to run and handles:
- File location detection (tries VM path first, then workspace paths)
- Date calculations
- Open task scanning with regex
- KRISP attribution stripping
- Thread notation formatting
- Preview mode with confirmation
- Error handling

### 2. Smart File Access
The script automatically tries multiple paths:
1. `/sessions/festive-loving-feynman/mnt/personal-context-portfolio` (VM local)
2. `/Users/joshuajones/GitHub/personal-context-portfolio` (workspace)
3. `~/GitHub/personal-context-portfolio` (fallback)

If none work, you can provide `--portfolio-path`

### 3. Preview Mode (Default)
Before making any changes, the script shows:
```
======================================================================
PREVIEW: Found 10 open tasks to thread forward
From: Earlier dates in July 2026
To: 2026-07-13 (page 47)
======================================================================

 1. [2026-07-07 p.47] Look at flight and logistics options for the New ...
 2. [2026-07-07 p.47] Datacenter Phone Plan
 ...
10. [2026-07-07 p.47] Order Plane Tickets to Awaken

======================================================================

Apply these changes? (yes/no):
```

### 4. Auto-Detection
- Automatically calculates today's and tomorrow's dates
- Scans entire month file for open tasks
- Handles both `YYYY-Month.md` and `YYYY-MM.md` filename formats
- Strips KRISP attribution automatically

### 5. Cleaner Workflow
```
Old way:
1. Read AGENTS.md
2. Read ai-agent-instructions.md
3. Try MCP (gets partial file)
4. Realize need local access
5. Find file path
6. Read file with bash
7. Write Python script from scratch
8. Debug script
9. Run script
10. Verify results

New way:
1. Run: python3 thread_tasks.py --mode monthly --current-page 47
2. Review preview
3. Confirm
4. Done
```

## Usage

### Basic Monthly Thread Forward
```bash
python3 thread_tasks.py --mode monthly --current-page 47
```

### Skip Preview (Auto-apply)
```bash
python3 thread_tasks.py --mode monthly --current-page 47 --no-preview
```

### Custom Portfolio Path
```bash
python3 thread_tasks.py --mode monthly --current-page 47 --portfolio-path /custom/path
```

### Different Next Page
```bash
python3 thread_tasks.py --mode monthly --current-page 47 --next-page 48
```

## How It Works

### Thread Forward Process
1. **Scan**: Finds all `- [ ]` tasks in date sections before today
2. **Filter**: Skips tasks that already have `-->pgXX-M-D` notation
3. **Preview**: Shows you what will change
4. **Confirm**: Waits for your yes/no
5. **Apply Forward**: Adds `-->pg47-7-13` to each source task
6. **Apply Back**: Adds `- [ ] Task text <--pg47-7-7` to today's section
7. **Strip KRISP**: Removes `[KRISP: ...]` from threaded tasks (keeps on source)

### KRISP Attribution Handling
- Source task: `- [ ] Pull financial outputs [KRISP: Morning Notes 6-19] -->pg47-7-13`
- Target task: `- [ ] Pull financial outputs <--pg47-7-7`

The KRISP attribution stays with the original task but is removed from the threaded copy.

## Three Modes (Monthly Implemented First)

### Mode 1: Monthly Thread Forward ✓ (Implemented)
Thread all open tasks from earlier in the month to today.

**Usage:**
```bash
python3 thread_tasks.py --mode monthly --current-page 47
```

### Mode 2: Daily Thread Forward (Coming Soon)
Thread today's open tasks forward to tomorrow.

**Usage:**
```bash
python3 thread_tasks.py --mode daily --current-page 47 --next-page 48
```

### Mode 3: KRISP Import (Coming Soon)
Import open action items from KRISP meetings into your journal.

**Usage:**
```bash
python3 thread_tasks.py --mode krisp --current-page 47
```

## Agent Instructions

When the user invokes this skill:

1. **Ask only for page number**: "What page is today on in your notebook?"
2. **Run the script**:
   ```bash
   cd /sessions/festive-loving-feynman/mnt/.claude/skills/task-flow-sync
   python3 thread_tasks.py --mode monthly --current-page {PAGE}
   ```
3. **Show the output**: The script handles preview, confirmation, and results
4. **Done**: No manual file editing required

## Error Handling

The script handles common errors:
- **Portfolio not found**: Tries multiple paths, asks for `--portfolio-path` if needed
- **Month file not found**: Clear error message with expected filename
- **Date section missing**: Tells you which date/page it couldn't find
- **No open tasks**: Friendly message, no changes made

## Script Location

The script is located in this skill directory:
```
/sessions/festive-loving-feynman/mnt/.claude/skills/task-flow-sync/thread_tasks.py
```

It's executable (`chmod +x`) and can be run directly.

## Backup

The script doesn't create backups automatically, but you can create one before running:
```bash
cp /path/to/2026-July.md /path/to/2026-July-backup.md
```

Or use git to track changes (recommended if portfolio is in a git repo).

## Future Enhancements

- [ ] Daily mode implementation
- [ ] KRISP mode implementation
- [ ] Undo last threading operation
- [ ] Thread to arbitrary future dates
- [ ] Bulk completion marking
- [ ] Integration tests

## Limitations

- Currently only monthly mode is implemented
- Page numbers must be provided by user
- Target date must already exist in the file
- No MCP server write support (uses local files only)
- Python 3.6+ required

## Examples

### Example 1: Standard Monthly Threading
```bash
$ python3 thread_tasks.py --mode monthly --current-page 47

✓ Found portfolio at local path: /sessions/.../personal-context-portfolio

======================================================================
PREVIEW: Found 10 open tasks to thread forward
From: Earlier dates in July 2026
To: 2026-07-13 (page 47)
======================================================================

 1. [2026-07-07 p.47] Look at flight and logistics options for the New...
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

### Example 2: No Tasks Found
```bash
$ python3 thread_tasks.py --mode monthly --current-page 47

✓ Found portfolio at local path: /sessions/.../personal-context-portfolio

======================================================================
Status: NO_TASKS
Message: No open tasks found before 2026-07-13
======================================================================
```

### Example 3: User Cancels
```bash
$ python3 thread_tasks.py --mode monthly --current-page 47

...preview shown...

Apply these changes? (yes/no): no

======================================================================
Status: CANCELLED
Message: Operation cancelled by user
======================================================================
```
