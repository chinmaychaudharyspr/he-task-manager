import {render, screen, waitFor} from "@testing-library/react";
import user from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TaskManager from "../TaskManager";
import TaskCard from "../TaskCard";

jest.mock('../CloseButton', () => require('../__mocks__/CloseButton')(jest.fn()));
global.renderCountArgs = [];

describe("1.", () => {
  let tasks = [
    {
      id: 1,
      title: "Task 1",
      status: "In Progress",
      assignee: "Alice",
      dueDate: "2024-08-20",
    },
  ];

  const loadTasks = () =>
    new Promise((res) => {
      setTimeout(() => {
        res(tasks);
      }, 100)
    });

  test("1.", async () => {
    // jest.useFakeTimers();

    render(<TaskManager loadTasks={loadTasks}/>);

    // jest.runAllTimers();

    await screen.findByText("Task 1");

    const iconEl = screen.getByTestId("refresh-icon");
    expect(iconEl.classList.contains("animate-spin")).toBe(false);

    // jest.useRealTimers()
  });
  test("2.", async () => {
    // jest.useFakeTimers();

    render(<TaskManager loadTasks={loadTasks}/>);

    // jest.runAllTimers();

    await screen.findByText("Task 1");

    const el = screen.getByTestId("refresh-button");

    await user.click(el);

    const iconEl = screen.getByTestId("refresh-icon");
    expect(iconEl.classList.contains("animate-spin")).toBe(true);

    // jest.runAllTimers();

    await waitFor(() => {
      expect(iconEl.classList.contains("animate-spin")).toBe(false);
    }, {timeout: 200})

    // jest.useRealTimers()
  });
});

describe("2.", () => {
  let tasks = [
    {
      id: 1,
      title: "Task 1",
      status: "In Progress",
      assignee: "Alice",
      dueDate: "2024-08-20",
    },
    {
      id: 2,
      title: "Task 2",
      status: "Pending",
      assignee: "Bob",
      dueDate: "2024-08-22",
    },
  ];

  const loadTasks = () =>
    new Promise((res) => {
      setTimeout(() => {
        res(tasks);
        tasks = [
          {
            ...tasks[0],
            status: tasks[0].status === "In Progress" ? "Pending" : "In Progress",
          },
          ...tasks.slice(1),
        ];
      }, 100)
    });

  test("3.", async () => {
    // jest.useFakeTimers();
    const { rerender } = render(<TaskManager loadTasks={loadTasks}/>);

    const cellEl = await screen.findByText("Task 1");

    let taskRowEl = screen.getByTestId(`task-row-${tasks[0].id}`);
    let taskRowStatusCellEl = taskRowEl.querySelector('[data-cell-type="status"]');

    expect(taskRowStatusCellEl.textContent).toBe("In Progress");

    await user.click(cellEl);

    let taskCardEl = screen.getByTestId("task-card");
    let taskCardStatusSelectEl = taskCardEl.querySelector("#status");
    expect(taskCardStatusSelectEl.dataset.value).toBe("In Progress");

    const refreshButtonEl = screen.getByTestId("refresh-button");
    await user.click(refreshButtonEl);

    await waitFor(() => {
      expect(taskRowStatusCellEl.textContent).toBe("Pending");
    }, {timeout: 200});

    expect(taskCardStatusSelectEl.dataset.value).toBe("Pending");

    await user.click(await screen.findByText("Task 2"));

    // the value in the task card
    expect(screen.getByLabelText('Title').value).toBe("Task 2");

    let task = {
      id: 1,
      title: "Task 1",
      status: "In Progress",
      assignee: "Alice",
      dueDate: "2024-08-20",
    };

    global.renderCountArgs = [];

    rerender(<TaskCard task={task} statuses={[]} users={[]}/>);

    task = {...task};
    rerender(<TaskCard task={task} statuses={[]} users={[]}/>);
    
    expect(global.renderCountArgs).toEqual([
      [1],
      [2],
    ]);
  });
});

describe("3.", () => {
  let tasks = [
    {
      id: 1,
      title: "Task 1",
      status: "In Progress",
      assignee: "Alice",
      dueDate: "2024-08-20",
    },
  ];

  const loadTasks = () =>
    new Promise((res) => {
      setTimeout(() => {
        res(tasks);
      }, 100)
    });

  test("4.", async () => {
    render(<TaskManager loadTasks={loadTasks}/>);

    const cellEl = await screen.findByText("Task 1");
    await user.click(cellEl);

    await screen.findByTestId("task-card");

    // In the task card, replace existing content with "hello world"
    const inputEl = screen.getByLabelText('Title');
    inputEl.setSelectionRange(0, inputEl.value.length);

    await user.type(inputEl, "hello world");
    await user.tab();

    // In the task card, the updated value should be "hello world"
    expect(screen.getByLabelText('Title').value).toBe("hello world");

    const taskRowEl = await screen.findByTestId(`task-row-${tasks[0].id}`);

    // In the table, the value should be "hello world"
    expect(taskRowEl.querySelector('[data-cell-type="title"]').textContent).toBe("hello world");
  });
});
