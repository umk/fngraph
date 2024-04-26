import PriorityQueue from './PriorityQueue'

type Task = { name: string; priority: number }

// Define a comparison function for tasks
const compareTasks = (a: Task, b: Task) => a.priority - b.priority

describe('PriorityQueue', () => {
  // Test case for enqueueing and dequeuing tasks
  test('enqueue and dequeue tasks', () => {
    const taskQueue = new PriorityQueue<Task>(compareTasks)

    // Enqueue tasks with different priorities
    taskQueue.enqueue({ name: 'Task A', priority: 3 })
    taskQueue.enqueue({ name: 'Task B', priority: 1 })
    taskQueue.enqueue({ name: 'Task C', priority: 2 })

    // Dequeue tasks and check the order
    expect(taskQueue.dequeue()).toEqual({ name: 'Task B', priority: 1 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task C', priority: 2 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task A', priority: 3 })
  })

  // Test case for peeking at the highest priority task without removing it
  test('peek at the highest priority task', () => {
    const taskQueue = new PriorityQueue<Task>(compareTasks)

    // Enqueue tasks with different priorities
    taskQueue.enqueue({ name: 'Task A', priority: 3 })
    taskQueue.enqueue({ name: 'Task B', priority: 1 })
    taskQueue.enqueue({ name: 'Task C', priority: 2 })

    // Peek at the highest priority task without dequeuing
    expect(taskQueue.peek()).toEqual({ name: 'Task B', priority: 1 })

    // Ensure the queue is not empty after peeking
    expect(taskQueue.peek()).toEqual({ name: 'Task B', priority: 1 })
  })

  // Test case: Insert 10 items out of order and dequeue to check priority order
  it('should enqueue 10 items out of order and dequeue in priority order', () => {
    const taskQueue = new PriorityQueue<Task>(compareTasks)

    // Insert 10 items out of order
    taskQueue.enqueue({ name: 'Task C', priority: 3 })
    taskQueue.enqueue({ name: 'Task A', priority: 1 })
    taskQueue.enqueue({ name: 'Task E', priority: 5 })
    taskQueue.enqueue({ name: 'Task D', priority: 4 })
    taskQueue.enqueue({ name: 'Task B', priority: 2 })
    taskQueue.enqueue({ name: 'Task G', priority: 7 })
    taskQueue.enqueue({ name: 'Task F', priority: 6 })
    taskQueue.enqueue({ name: 'Task I', priority: 9 })
    taskQueue.enqueue({ name: 'Task H', priority: 8 })
    taskQueue.enqueue({ name: 'Task J', priority: 10 })

    // Dequeue and check priority order
    expect(taskQueue.dequeue()).toEqual({ name: 'Task A', priority: 1 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task B', priority: 2 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task C', priority: 3 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task D', priority: 4 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task E', priority: 5 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task F', priority: 6 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task G', priority: 7 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task H', priority: 8 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task I', priority: 9 })
    expect(taskQueue.dequeue()).toEqual({ name: 'Task J', priority: 10 })

    // Ensure the queue is empty after dequeueing all items
    expect(taskQueue.peek()).toBeUndefined()
  })

  // Additional test case for an empty queue
  test('dequeue from an empty queue', () => {
    const taskQueue = new PriorityQueue<Task>(compareTasks)

    // Attempt to dequeue from an empty queue
    expect(taskQueue.dequeue()).toBeUndefined()
  })
})
