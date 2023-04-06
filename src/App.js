// :copyright: Copyright (c) 2023 ftrack
import { useMemo, useRef } from "react";
import { BryntumSchedulerPro } from "@bryntum/schedulerpro-react";
import dayjs from "dayjs";
import {
  getTaskData,
  getProjectData,
  getCalendarData
} from "./DataProcessing.js";
import { useInfiniteQuery } from "react-query";
function getNextPageParam(lastPage) {
  return lastPage.metadata?.next.offset ?? undefined;
}
function flattenPages(data) {
  return {
    pageParams: [],
    pages: data.pages.flat().flatMap(page => page.data)
  };
}

const initialStartDate = dayjs("2023-04-05T22:00:00")
  .subtract(1, "week")
  .toDate();
const initialEndDate = dayjs("2023-04-05T22:00:00")
  .add(1, "week")
  .toDate();
const schedulerProConfig = {
  startDate: initialStartDate,
  endDate: initialEndDate,
  rowHeight: 36,
  barMargin: 2,
  readOnly: true,
  columns: [
    {
      type: "resourceInfo",
      field: "name",
      showEventCount: false,
      width: 150,
      htmlEncode: false,
      enableHeaderContextMenu: false,
      showImage: true
    }
  ],
  project: {
    calendar: "calendar"
  }
};
export function Scheduler() {
  const schedulerProRef = useRef(null);
  const tasks = useInfiniteQuery(
    ["tasks"],
    async () => {
      console.log("fetching tasks");
      const res = await fetch(`http://localhost:3333/tasks`);
      return res.json();
    },
    {
      enabled: true,
      keepPreviousData: true,
      getNextPageParam,
      select: flattenPages,
      staleTime: 0
    }
  );
  const projects = useInfiniteQuery(
    ["projects"],
    async () => {
      console.log("fetching projects");
      const res = await fetch(`http://localhost:3333/projects`);
      return res.json();
    },
    {
      enabled: true,
      keepPreviousData: true,
      getNextPageParam,
      select: flattenPages,
      staleTime: 0
    }
  );
  const calendarEvents = useInfiniteQuery(
    ["calendarEvents"],
    async () => {
      console.log("fetching calendarEvents");
      const res = await fetch(`http://localhost:3333/calendarEvents`);
      return res.json();
    },
    {
      enabled: true,
      keepPreviousData: true,
      getNextPageParam,
      select: flattenPages,
      staleTime: 0
    }
  );

  const [calendarEventsData, calendarEventAssignmentData] = useMemo(
    () => getCalendarData(calendarEvents.data?.pages),
    [calendarEvents.data?.pages]
  );

  const [taskEventData, taskAssignmentData] = useMemo(
    () =>
      getTaskData(tasks.data?.pages, {
        hideBlockedTasks: false
      }),
    [tasks.data?.pages]
  );

  const resourcesData = useMemo(() => getProjectData(projects.data?.pages), [
    projects.data?.pages
  ]);

  const calendarsData = useMemo(
    () => [
      {
        id: "calendar",
        name: "Calendar",
        intervals: [
          {
            recurrentStartDate: "on Sun at 0:00",
            recurrentEndDate: "on Mon at 0:00",
            isWorking: false
          },
          {
            recurrentStartDate: "on Sat at 0:00",
            recurrentEndDate: "on Sun at 0:00",
            isWorking: false
          }
        ]
      }
    ],
    []
  );
  const eventsData = useMemo(() => [...calendarEventsData, ...taskEventData], [
    calendarEventsData,
    taskEventData
  ]);

  const assignmentsData = useMemo(
    () => [...taskAssignmentData, ...calendarEventAssignmentData],
    [taskAssignmentData, calendarEventAssignmentData]
  );

  const isLoading =
    projects.isInitialLoading ||
    tasks.isInitialLoading ||
    calendarEvents.isInitialLoading;

  const data = useMemo(
    () => ({
      resources: resourcesData,
      events: isLoading ? [] : eventsData,
      assignments: isLoading ? [] : assignmentsData,
      calendars: isLoading ? [] : calendarsData
    }),
    [isLoading, eventsData, assignmentsData, resourcesData, calendarsData]
  );
  return projects.isInitialLoading ? (
    <h1>loading</h1>
  ) : (
    <BryntumSchedulerPro
      ref={schedulerProRef}
      {...data}
      {...schedulerProConfig}
    />
  );
}
