/**
 * Virtual list renderer for handling large datasets efficiently.
 * Implements viewport-based rendering to maintain performance with thousands of items.
 *
 * @example
 * ```typescript
 * const virtualList = new VirtualList({
 *   container: document.getElementById('list-container'),
 *   itemHeight: 50,
 *   visibleCount: 10,
 *   totalCount: 1000,
 *   renderItem: (index, element) => {
 *     element.textContent = `Item ${index}`;
 *   }
 * });
 * ```
 */
export interface VirtualListOptions {
  container: HTMLElement;
  itemHeight: number;
  visibleCount: number;
  totalCount: number;
  renderItem: (index: number, element: HTMLElement) => void;
  onScroll?: (
    scrollTop: number,
    visibleStart: number,
    visibleEnd: number,
  ) => void;
}

export class VirtualList {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private renderItem: (index: number, element: HTMLElement) => void;
  private onScroll?: (
    scrollTop: number,
    visibleStart: number,
    visibleEnd: number,
  ) => void;

  private viewport!: HTMLElement;
  private content!: HTMLElement;
  private items: HTMLElement[] = [];
  private startIndex = 0;

  constructor(options: VirtualListOptions) {
    this.container = options.container;
    this.itemHeight = options.itemHeight;
    this.visibleCount = options.visibleCount;
    this.totalCount = options.totalCount;
    this.renderItem = options.renderItem;
    this.onScroll = options.onScroll;

    this.setupViewport();
    this.createVisibleItems();
    this.updateScrollHeight();
  }

  private setupViewport(): void {
    this.viewport = document.createElement('div');
    this.viewport.className = 'virtual-list-viewport';
    this.viewport.style.cssText = `
      height: ${this.visibleCount * this.itemHeight}px;
      overflow-y: auto;
      position: relative;
    `;

    this.content = document.createElement('div');
    this.content.className = 'virtual-list-content';
    this.content.style.cssText = `
      position: relative;
      height: ${this.totalCount * this.itemHeight}px;
    `;

    this.viewport.appendChild(this.content);
    this.container.appendChild(this.viewport);

    this.viewport.addEventListener('scroll', this.handleScroll.bind(this));
  }

  private createVisibleItems(): void {
    const bufferSize = Math.min(5, this.totalCount); // Buffer for smooth scrolling
    const totalVisible = Math.min(
      this.visibleCount + bufferSize * 2,
      this.totalCount,
    );

    for (let i = 0; i < totalVisible; i++) {
      const item = document.createElement('div');
      item.className = 'virtual-list-item';
      item.style.cssText = `
        height: ${this.itemHeight}px;
        position: absolute;
        width: 100%;
        top: ${i * this.itemHeight}px;
      `;
      this.content.appendChild(item);
      this.items.push(item);
    }

    this.updateVisibleItems();
  }

  private handleScroll(): void {
    const scrollTop = this.viewport.scrollTop;
    const newStartIndex = Math.floor(scrollTop / this.itemHeight);

    if (newStartIndex !== this.startIndex) {
      this.startIndex = newStartIndex;
      this.updateVisibleItems();
    }

    if (this.onScroll) {
      const visibleStart = this.startIndex;
      const visibleEnd = Math.min(
        this.startIndex + this.visibleCount,
        this.totalCount,
      );
      this.onScroll(scrollTop, visibleStart, visibleEnd);
    }
  }

  private updateVisibleItems(): void {
    const bufferSize = Math.min(5, this.totalCount);
    const start = Math.max(0, this.startIndex - bufferSize);
    const end = Math.min(
      this.totalCount,
      this.startIndex + this.visibleCount + bufferSize,
    );

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const dataIndex = start + i;

      if (dataIndex < end && dataIndex < this.totalCount) {
        item.style.top = `${dataIndex * this.itemHeight}px`;
        item.style.display = 'block';
        this.renderItem(dataIndex, item);
      } else {
        item.style.display = 'none';
      }
    }
  }

  public updateData(newTotalCount: number): void {
    this.totalCount = newTotalCount;
    this.updateScrollHeight();
    this.updateVisibleItems();
  }

  private updateScrollHeight(): void {
    this.content.style.height = `${this.totalCount * this.itemHeight}px`;
  }

  public scrollToIndex(index: number): void {
    const scrollTop = Math.max(
      0,
      Math.min(
        index * this.itemHeight,
        this.totalCount * this.itemHeight - this.viewport.clientHeight,
      ),
    );
    this.viewport.scrollTop = scrollTop;
  }

  public destroy(): void {
    this.viewport.removeEventListener('scroll', this.handleScroll.bind(this));
    this.container.removeChild(this.viewport);
    this.items = [];
  }
}
