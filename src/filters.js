// :copyright: Copyright (c) 2023 ftrack

/* Filters return false when the task should be filtered */

function hideBlockedTasksFilter(task) {
  const ancestorStatuses = task.ancestors?.map(
    (ancestor) => ancestor.status?.state?.short
  );

  const ancestorIsBlocked = ancestorStatuses?.includes("BLOCKED");
  const taskIsBlocked = task.status?.state?.short === "BLOCKED";
  const taskIsDone = task.status?.state?.short === "DONE";

  return !(ancestorIsBlocked || taskIsBlocked || taskIsDone);
}

function getTaskFilters(options) {
  const filters = [];
  if (options.hideBlockedTasks) {
    filters.push(hideBlockedTasksFilter);
  }
  return filters;
}

export function applyTaskEventFilters(tasks, options) {
  const filters = getTaskFilters(options);
  return tasks.filter((task) => filters.every((filter) => filter(task)));
}
