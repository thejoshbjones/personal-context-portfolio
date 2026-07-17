#!/usr/bin/env python3
"""
Task Flow Sync - Automated task threading for Personal Context Portfolio
"""

import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Tuple, Optional
import argparse


class TaskThreader:
    def __init__(self, portfolio_path: str = None):
        """Initialize the task threader with portfolio path detection"""
        self.portfolio_path = self._detect_portfolio_path(portfolio_path)
        self.today = datetime.now()
        self.tomorrow = self.today + timedelta(days=1)

    def _detect_portfolio_path(self, provided_path: Optional[str]) -> Path:
        """Smart detection of portfolio location - local or MCP"""
        if provided_path:
            return Path(provided_path)

        # Try local VM path first
        local_path = Path("/sessions/festive-loving-feynman/mnt/personal-context-portfolio")
        if local_path.exists():
            print(f"✓ Found portfolio at local path: {local_path}")
            return local_path

        # Try common workspace paths
        workspace_paths = [
            Path("/Users/joshuajones/GitHub/personal-context-portfolio"),
            Path.home() / "GitHub" / "personal-context-portfolio",
        ]

        for path in workspace_paths:
            if path.exists():
                print(f"✓ Found portfolio at: {path}")
                return path

        raise FileNotFoundError(
            "Could not find Personal Context Portfolio. Please provide --portfolio-path"
        )

    def get_month_file(self, date: datetime = None) -> Path:
        """Get the path to the month file for a given date"""
        if date is None:
            date = self.today

        # Try both naming conventions
        month_name = date.strftime("%B")  # Full month name
        year = date.year

        # Try YYYY-Month.md format
        file_path = self.portfolio_path / "01-Execution-Layer" / f"{year}-{month_name}.md"
        if file_path.exists():
            return file_path

        # Try YYYY-MM.md format
        file_path = self.portfolio_path / "01-Execution-Layer" / date.strftime("%Y-%m.md")
        if file_path.exists():
            return file_path

        raise FileNotFoundError(f"Could not find month file for {date.strftime('%Y-%m')}")

    def find_open_tasks(self, content: str, from_date: datetime = None) -> List[Tuple[str, str, str]]:
        """
        Find all open tasks in the content
        Returns: List of (date, page, task_text) tuples
        """
        open_tasks = []

        # Pattern to match date sections and tasks
        date_pattern = r"## (\d{4}-\d{2}-\d{2}) \(p\.(\d+)\)"
        task_pattern = r"^- \[ \] (.+)$"

        current_date = None
        current_page = None

        for line in content.split('\n'):
            # Check for date header
            date_match = re.match(date_pattern, line)
            if date_match:
                current_date = date_match.group(1)
                current_page = date_match.group(2)

                # If filtering by date, skip dates on or after the filter
                if from_date:
                    line_date = datetime.strptime(current_date, "%Y-%m-%d")
                    if line_date >= from_date:
                        current_date = None  # Skip this section
                continue

            # Check for open task
            if current_date and current_page:
                task_match = re.match(task_pattern, line.strip())
                if task_match:
                    task_text = task_match.group(1)
                    open_tasks.append((current_date, current_page, task_text))

        return open_tasks

    def strip_krisp_attribution(self, task_text: str) -> str:
        """Remove [KRISP: ...] attribution from task text"""
        return re.sub(r'\s*\[KRISP:[^\]]+\]', '', task_text)

    def has_thread_forward(self, task_text: str) -> bool:
        """Check if task already has thread forward notation"""
        return bool(re.search(r'-->pg\d+-\d+-\d+', task_text))

    def thread_forward_monthly(self, current_page: int, next_page: int, preview: bool = True) -> dict:
        """
        Thread all open tasks from the current month forward to target date
        Returns: dict with statistics and changes
        """
        month_file = self.get_month_file(self.today)

        with open(month_file, 'r') as f:
            content = f.read()

        # Find all open tasks before today
        open_tasks = self.find_open_tasks(content, from_date=self.today)

        if not open_tasks:
            return {
                'status': 'no_tasks',
                'message': f'No open tasks found before {self.today.strftime("%Y-%m-%d")}'
            }

        # Show preview
        print(f"\n{'='*70}")
        print(f"PREVIEW: Found {len(open_tasks)} open tasks to thread forward")
        print(f"From: Earlier dates in {self.today.strftime('%B %Y')}")
        print(f"To: {self.today.strftime('%Y-%m-%d')} (page {current_page})")
        print(f"{'='*70}\n")

        for i, (date, page, task_text) in enumerate(open_tasks, 1):
            # Strip KRISP attribution for preview
            clean_task = self.strip_krisp_attribution(task_text)
            print(f"{i:2d}. [{date} p.{page}] {clean_task[:70]}...")

        if preview:
            print(f"\n{'='*70}")
            response = input("\nApply these changes? (yes/no): ").strip().lower()
            if response not in ['yes', 'y']:
                return {'status': 'cancelled', 'message': 'Operation cancelled by user'}

        # Apply changes
        new_content = content
        target_date_str = self.today.strftime("%Y-%m-%d")
        target_month = self.today.strftime("%-m")
        target_day = self.today.strftime("%-d")

        # Step 1: Add forward thread notation to source tasks
        tasks_to_add = []
        for date, page, task_text in open_tasks:
            # Skip if already has thread forward
            if self.has_thread_forward(task_text):
                continue

            # Build the thread forward notation
            thread_forward = f"-->pg{current_page}-{target_month}-{target_day}"

            # Find and replace the task line (without modifying completed tasks)
            old_line = f"- [ ] {task_text}"
            new_line = f"- [ ] {task_text} {thread_forward}"
            new_content = new_content.replace(old_line, new_line)

            # Prepare task for target date (strip KRISP attribution)
            clean_task = self.strip_krisp_attribution(task_text)
            source_month = date.split('-')[1].lstrip('0')
            source_day = date.split('-')[2].lstrip('0')
            thread_back = f"<--pg{page}-{source_month}-{source_day}"
            tasks_to_add.append(f"- [ ] {clean_task} {thread_back}")

        # Step 2: Add tasks to target date section
        # Find the target date section
        date_section_pattern = rf"## {target_date_str} \(p\.{current_page}\)"
        date_section_match = re.search(date_section_pattern, new_content)

        if not date_section_match:
            return {
                'status': 'error',
                'message': f'Could not find date section for {target_date_str} (p.{current_page})'
            }

        # Find the end of the current task list for this date
        # We'll insert before the next section (## or end of file)
        section_start = date_section_match.end()
        next_section = re.search(r'\n---\n## ', new_content[section_start:])

        if next_section:
            insert_pos = section_start + next_section.start()
        else:
            insert_pos = len(new_content)

        # Insert the new tasks
        tasks_block = '\n' + '\n'.join(tasks_to_add)
        new_content = new_content[:insert_pos] + tasks_block + new_content[insert_pos:]

        # Write back to file
        with open(month_file, 'w') as f:
            f.write(new_content)

        return {
            'status': 'success',
            'tasks_threaded': len(open_tasks),
            'message': f'Successfully threaded {len(open_tasks)} tasks forward to {target_date_str}'
        }


def main():
    parser = argparse.ArgumentParser(
        description='Task Flow Sync - Thread tasks forward in your Personal Context Portfolio'
    )
    parser.add_argument(
        '--mode',
        choices=['daily', 'monthly', 'krisp'],
        default='monthly',
        help='Threading mode (default: monthly)'
    )
    parser.add_argument(
        '--current-page',
        type=int,
        required=True,
        help='Current page number in your notebook'
    )
    parser.add_argument(
        '--next-page',
        type=int,
        help='Next page number (default: same as current page)'
    )
    parser.add_argument(
        '--portfolio-path',
        type=str,
        help='Path to Personal Context Portfolio (auto-detected if not provided)'
    )
    parser.add_argument(
        '--no-preview',
        action='store_true',
        help='Skip preview and apply changes immediately'
    )

    args = parser.parse_args()

    # Default next page to current page if not specified
    next_page = args.next_page if args.next_page else args.current_page

    try:
        threader = TaskThreader(args.portfolio_path)

        if args.mode == 'monthly':
            result = threader.thread_forward_monthly(
                args.current_page,
                next_page,
                preview=not args.no_preview
            )
        else:
            print(f"Mode '{args.mode}' not yet implemented")
            sys.exit(1)

        # Print result
        print(f"\n{'='*70}")
        print(f"Status: {result['status'].upper()}")
        print(f"Message: {result['message']}")
        if result.get('tasks_threaded'):
            print(f"Tasks threaded: {result['tasks_threaded']}")
        print(f"{'='*70}\n")

        sys.exit(0 if result['status'] == 'success' else 1)

    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
