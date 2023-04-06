// :copyright: Copyright (c) 2023 ftrack
import dayjs from "dayjs";
import { applyTaskEventFilters } from "./filters";

export function getTaskData(tasks = [], options = { hideBlockedTasks: true }) {
  if (!tasks.length) {
    return [[], []];
  }
  const taskEventData = applyTaskEventFilters(tasks, {
    hideBlockedTasks: options.hideBlockedTasks,
  }).map((task) => {
    if (!task.start_date?.value && task.__entity_type__ === "Milestone") {
      return {
        id: task.id,
        name: task.name,
        startDate: task.end_date?.value,
        eventColor: task.project?.color ?? "black",
        milestoneWidth: 200,
        duration: 0,
        status: task.status,
        ancestorStatus: task.ancestors?.map(
          (ancestor) => ancestor.status?.state?.short
        ),
        assignees: task.assignments,
        type: task.type,
        entityType: task.__entity_type__,
        manuallyScheduled: true,
      };
    }
    return {
      id: task.id,
      name: task.name,
      startDate: task.start_date?.value,
      endDate: task.end_date?.value,
      eventColor: task.status?.color ?? "black",
      status: task.status,
      type: task.type,
      entityType: task.__entity_type__,
      objectType: task.object_type,
      link: task.link,
      cls: "taskEvent",
      assignees: task.assignments,
      ancestorStatus: task.ancestors?.map(
        (ancestor) => ancestor.status?.state?.short
      ),
      manuallyScheduled: true,
      segments: task.split_parts?.length
        ? task.split_parts?.map((splitTaskPart) => {
            return {
              id: splitTaskPart.id,
              startDate: splitTaskPart.start_date?.value,
              endDate: splitTaskPart.end_date?.value,
              name: splitTaskPart.label || task.name,
              link: task.link,
              assignees: task.assignments,
              type: task.type,
            };
          })
        : undefined,
    };
  });
  const taskAssignmentData = tasks?.map((task) => {
    return {
      id: `${task.id ?? ""}_${task.project_id ?? ""}`,
      resourceId: task.project_id,
      eventId: task?.id,
    };
  });
  return [taskEventData, taskAssignmentData];
}

export function getProjectData(projects) {
  if (!projects?.length) {
    return [];
  }
  const resourcesData = projects.map((project) => {
    return {
      id: project.id,
      name: project.full_name,
      imageUrl: project.thumbnail_url?.value,
    };
  });

  return resourcesData;
}

export function getCalendarData(calendarEvents) {
  if (!calendarEvents?.length) {
    return [[], [], []];
  }

  const filteredCalendarEvents = calendarEvents?.filter((event) => {
    return event.leave !== true;
  });

  const calendarEventsData = filteredCalendarEvents?.map((event) => {
    return {
      id: event.id,
      name: event.name,
      endDate: event.end?.value,
      startDate: event.start?.value,
      eventColor: event.type?.color ?? event.project?.color,
      project: event.project,
      cls: "calendarEvent",
      type: event.type,
      entityType: event.__entity_type__,
      assignees: event?.calendar_event_resources,
      manuallyScheduled: true,
    };
  });

  const calendarEventAssignmentData = filteredCalendarEvents?.map((event) => {
    return {
      id: `${event.id ?? ""}_${event.project_id ?? ""}`,
      resourceId: event.project_id,
      eventId: event.id,
    };
  });

  return [calendarEventsData, calendarEventAssignmentData];
}
