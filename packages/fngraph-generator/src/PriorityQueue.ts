class PriorityQueue<T> {
  private heap: Array<T>
  private compare: (a: T, b: T) => number

  constructor(compare: (a: T, b: T) => number) {
    this.heap = []
    this.compare = compare
  }

  enqueue(element: T): void {
    this.heap.push(element)
    this.bubbleUp()
  }

  dequeue(): T | undefined {
    const length = this.heap.length
    if (length === 0) {
      return undefined
    }

    this.swap(0, length - 1)
    const dequeued = this.heap.pop()

    this.bubbleDown()

    return dequeued
  }

  peek(): T | undefined {
    return this.heap[0]
  }

  size(): number {
    return this.heap.length
  }

  private bubbleUp(): void {
    let current = this.heap.length - 1

    while (current > 0) {
      const parent = Math.floor((current - 1) / 2)

      if (this.compare(this.heap[current], this.heap[parent]) < 0) {
        this.swap(current, parent)
        current = parent
      } else {
        break
      }
    }
  }

  private bubbleDown(): void {
    let current = 0
    const length = this.heap.length

    for (;;) {
      const left = 2 * current + 1
      const right = 2 * current + 2
      let largest = -1

      if (left < length && this.compare(this.heap[left], this.heap[current]) < 0) {
        largest = left
      }

      if (right < length && this.compare(this.heap[right], this.heap[current]) < 0) {
        // Choose the right child only if it has a higher priority than the left one
        if (largest === -1 || this.compare(this.heap[right], this.heap[left]) < 0) {
          largest = right
        }
      }

      if (largest !== -1) {
        this.swap(current, largest)
        current = largest
      } else {
        break
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]
    this.heap[i] = this.heap[j]
    this.heap[j] = temp
  }
}

export default PriorityQueue
